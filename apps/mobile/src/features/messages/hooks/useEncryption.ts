import { useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import {
  encryptDirectMessage,
  decryptDirectMessage,
  encryptGroupMessage,
  decryptGroupMessage,
  encryptGroupKeyForUser,
  decryptGroupKeyFromBundle,
  generateSymmetricKey,
  buildMessagePayload,
  parseMessagePayload,
  type EncryptedPayload,
  type MessagePayload,
} from '@ahub/shared/crypto';
import {
  getPrivateKey,
  getPublicKey,
  getCachedPublicKey,
  setCachedPublicKey,
  getGroupKey,
  saveGroupKey,
} from '@/lib/keyStore';
import {
  getUserPublicKey,
  getConversationKeyBundle,
  createConversationKeyBundles,
  type KeyBundlePayload,
} from '../api/messages.api';
import type { Message, ConversationParticipant } from '@ahub/shared/types';

// ─── Public Key Fetching with Cache ──────────────────────────

async function fetchPublicKey(userId: string): Promise<string> {
  const cached = getCachedPublicKey(userId);
  if (cached) return cached;

  const { publicKey } = await getUserPublicKey(userId);
  setCachedPublicKey(userId, publicKey);
  return publicKey;
}

// ─── Hook ────────────────────────────────────────────────────

export function useEncryption() {
  const user = useAuthStore((state) => state.user);
  const keysRef = useRef<{ publicKey: string; secretKey: string } | null>(null);

  const loadKeys = useCallback(async () => {
    if (keysRef.current) return keysRef.current;
    const [publicKey, secretKey] = await Promise.all([
      getPublicKey(),
      getPrivateKey(),
    ]);
    if (publicKey && secretKey) {
      keysRef.current = { publicKey, secretKey };
      return keysRef.current;
    }
    return null;
  }, []);

  // ─── Direct Message Encryption ─────────────────────────────

  const encryptForDirect = useCallback(
    async (
      content: string,
      recipientId: string
    ): Promise<EncryptedPayload & { isEncrypted: true }> => {
      const keys = await loadKeys();
      if (!keys) throw new Error('Encryption keys not available');

      const recipientPublicKey = await fetchPublicKey(recipientId);
      const payload = encryptDirectMessage(content, recipientPublicKey, keys.secretKey);
      return { ...payload, isEncrypted: true as const };
    },
    [loadKeys]
  );

  const decryptFromDirect = useCallback(
    async (
      encryptedContent: string,
      nonce: string,
      senderPublicKey: string
    ): Promise<MessagePayload> => {
      const keys = await loadKeys();
      if (!keys) throw new Error('Encryption keys not available');

      const decrypted = decryptDirectMessage(encryptedContent, nonce, senderPublicKey, keys.secretKey);
      return parseMessagePayload(decrypted);
    },
    [loadKeys]
  );

  // ─── Group Message Encryption ──────────────────────────────

  const encryptForGroup = useCallback(
    async (
      content: string,
      conversationId: string
    ): Promise<EncryptedPayload & { isEncrypted: true }> => {
      const groupKey = await getGroupKey(conversationId);
      if (!groupKey) throw new Error('Group key not available');

      const payload = encryptGroupMessage(content, groupKey);
      return { ...payload, isEncrypted: true as const };
    },
    []
  );

  const decryptFromGroup = useCallback(
    async (
      encryptedContent: string,
      nonce: string,
      conversationId: string
    ): Promise<MessagePayload> => {
      let groupKey = await getGroupKey(conversationId);

      // If no local key, try fetching from server
      if (!groupKey) {
        const keys = await loadKeys();
        if (!keys) throw new Error('Encryption keys not available');

        const bundle = await getConversationKeyBundle(conversationId);
        if (!bundle) throw new Error('No key bundle found for this conversation');

        groupKey = decryptGroupKeyFromBundle(
          bundle.encryptedKey,
          bundle.nonce,
          bundle.senderPublicKey,
          keys.secretKey
        );
        await saveGroupKey(conversationId, groupKey, bundle.version);
      }

      const decrypted = decryptGroupMessage(encryptedContent, nonce, groupKey);
      return parseMessagePayload(decrypted);
    },
    [loadKeys]
  );

  // ─── Group Key Distribution ────────────────────────────────

  const distributeGroupKey = useCallback(
    async (
      conversationId: string,
      participants: { id: string }[]
    ): Promise<void> => {
      const keys = await loadKeys();
      if (!keys) throw new Error('Encryption keys not available');

      const groupKey = generateSymmetricKey();
      await saveGroupKey(conversationId, groupKey);

      const bundles: KeyBundlePayload[] = [];
      for (const participant of participants) {
        const participantPubKey = await fetchPublicKey(participant.id);
        const encrypted = encryptGroupKeyForUser(
          groupKey,
          participantPubKey,
          keys.secretKey
        );
        bundles.push({
          userId: participant.id,
          encryptedKey: encrypted.ciphertext,
          nonce: encrypted.nonce,
          senderPublicKey: keys.publicKey,
        });
      }

      await createConversationKeyBundles(conversationId, bundles);
    },
    [loadKeys]
  );

  // ─── Unified Decrypt ───────────────────────────────────────

  const decryptMessage = useCallback(
    async (
      message: Message,
      conversationType: 'DIRECT' | 'GROUP',
      otherParticipantId?: string
    ): Promise<Message> => {
      if (!message.isEncrypted || !message.encryptedContent || !message.nonce) {
        return message;
      }

      try {
        let payload: MessagePayload;

        if (conversationType === 'DIRECT') {
          // For direct messages, we need the other person's public key
          const senderId = message.sender.id;
          const isMyMessage = senderId === user?.id;
          const otherUserId = isMyMessage ? otherParticipantId : senderId;
          if (!otherUserId) return message;

          const otherPublicKey = await fetchPublicKey(otherUserId);
          payload = await decryptFromDirect(
            message.encryptedContent,
            message.nonce,
            otherPublicKey
          );
        } else {
          payload = await decryptFromGroup(
            message.encryptedContent,
            message.nonce,
            message.conversationId
          );
        }

        return {
          ...message,
          content: payload.text,
        };
      } catch (error) {
        console.warn('[E2E] Failed to decrypt message:', message.id, error);
        return { ...message, content: '🔒 Mensagem encriptada (não foi possível decriptar)' };
      }
    },
    [user?.id, decryptFromDirect, decryptFromGroup]
  );

  // ─── Batch Decrypt ─────────────────────────────────────────

  const decryptMessages = useCallback(
    async (
      messages: Message[],
      conversationType: 'DIRECT' | 'GROUP',
      otherParticipantId?: string
    ): Promise<Message[]> => {
      return Promise.all(
        messages.map((msg) => decryptMessage(msg, conversationType, otherParticipantId))
      );
    },
    [decryptMessage]
  );

  return {
    encryptForDirect,
    encryptForGroup,
    decryptMessage,
    decryptMessages,
    distributeGroupKey,
    loadKeys,
  };
}
