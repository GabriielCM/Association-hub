import { get, post, put, del, postFormData } from '@/services/api/client';
import type {
  ConversationsListResponse,
  ConversationsQueryParams,
  Conversation,
  ConversationDetail,
  CreateConversationRequest,
  UpdateConversationSettingsRequest,
  MessagesListResponse,
  MessagesQueryParams,
  Message,
  SendMessageRequest,
  ConversationGroupInfo,
  UpdateGroupRequest,
} from '@ahub/shared/types';

// Conversations
export async function listConversations(
  params?: ConversationsQueryParams
): Promise<ConversationsListResponse> {
  return get<ConversationsListResponse>('/conversations', params);
}

export async function createConversation(
  data: CreateConversationRequest
): Promise<Conversation> {
  return post<Conversation>('/conversations', data);
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  return get<ConversationDetail>(`/conversations/${id}`);
}

export async function updateConversationSettings(
  id: string,
  data: UpdateConversationSettingsRequest
): Promise<{ settings: UpdateConversationSettingsRequest }> {
  return put<{ settings: UpdateConversationSettingsRequest }>(
    `/conversations/${id}/settings`,
    data
  );
}

export async function leaveConversation(
  id: string
): Promise<{ deleted: boolean }> {
  return del<{ deleted: boolean }>(`/conversations/${id}`);
}

export async function markConversationAsRead(
  id: string
): Promise<{ conversationId: string; readAt: string }> {
  return post<{ conversationId: string; readAt: string }>(
    `/conversations/${id}/read`
  );
}

export async function sendTyping(
  conversationId: string,
  isTyping: boolean
): Promise<void> {
  return post<void>(`/conversations/${conversationId}/typing`, { is_typing: isTyping });
}

// Messages
export async function listMessages(
  conversationId: string,
  params?: MessagesQueryParams
): Promise<MessagesListResponse> {
  return get<MessagesListResponse>(
    `/conversations/${conversationId}/messages`,
    params
  );
}

export async function sendMessage(
  conversationId: string,
  data: SendMessageRequest
): Promise<Message> {
  const { replyTo, ...rest } = data;
  return post<Message>(`/conversations/${conversationId}/messages`, {
    ...rest,
    ...(replyTo != null ? { replyToId: replyTo } : {}),
  });
}

export async function deleteMessage(
  id: string
): Promise<{ deleted: boolean; messageId: string }> {
  return del<{ deleted: boolean; messageId: string }>(`/messages/${id}`);
}

export async function addReaction(
  messageId: string,
  emoji: string
): Promise<{ messageId: string; reaction: { emoji: string; userId: string; createdAt: string } }> {
  return post<{ messageId: string; reaction: { emoji: string; userId: string; createdAt: string } }>(
    `/messages/${messageId}/reactions`,
    { emoji }
  );
}

export async function removeReaction(
  messageId: string,
  emoji: string
): Promise<{ removed: boolean }> {
  return del<{ removed: boolean }>(`/messages/${messageId}/reactions/${emoji}`);
}

// Media upload
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const audioExts = ['m4a', 'mp3', 'ogg', 'wav', 'aac'];
  if (ext && audioExts.includes(ext)) {
    return `audio/${ext === 'm4a' ? 'mp4' : ext}`;
  }
  return ext ? `image/${ext}` : 'image/jpeg';
}

export async function uploadMedia(
  uri: string,
  contentType?: 'TEXT' | 'IMAGE' | 'AUDIO'
): Promise<{ url: string }> {
  let filename = uri.split('/').pop() ?? `media_${Date.now()}`;

  // Android recording URIs may lack file extension — ensure one exists
  if (!filename.includes('.')) {
    filename = contentType === 'AUDIO' ? `${filename}.m4a` : `${filename}.jpg`;
  }

  const type = getMimeType(filename);

  const formData = new FormData();
  formData.append('file', {
    uri,
    name: filename,
    type,
  } as unknown as Blob);

  return postFormData<{ url: string }>('/messages/media/upload', formData);
}

// Read receipts
export interface ReadReceipt {
  userId: string;
  name: string;
  avatarUrl?: string;
  readAt: string;
}

export async function getReadReceipts(
  messageId: string
): Promise<{ read: ReadReceipt[]; unread: ReadReceipt[] }> {
  return get<{ read: ReadReceipt[]; unread: ReadReceipt[] }>(
    `/messages/${messageId}/read-receipts`
  );
}

// Forward
export async function forwardMessage(
  messageId: string,
  conversationIds: string[]
): Promise<{ forwarded: number }> {
  return post<{ forwarded: number }>(`/messages/${messageId}/forward`, {
    conversation_ids: conversationIds,
  });
}

// Pin / Mute / Archive
export async function pinConversation(
  id: string,
  pinned: boolean
): Promise<{ pinned: boolean }> {
  return put<{ pinned: boolean }>(`/conversations/${id}/pin`, { pinned });
}

export async function muteConversation(
  id: string,
  muted: boolean
): Promise<{ muted: boolean }> {
  return put<{ muted: boolean }>(`/conversations/${id}/mute`, { muted });
}

export async function archiveConversation(
  id: string
): Promise<{ archived: boolean }> {
  return put<{ archived: boolean }>(`/conversations/${id}/archive`, { archived: true });
}

// Presence
export async function getOnlineContacts(): Promise<{ userIds: string[] }> {
  return get<{ userIds: string[] }>('/conversations/presence/online');
}

// Groups
export async function getGroupInfo(
  conversationId: string
): Promise<ConversationGroupInfo> {
  return get<ConversationGroupInfo>(`/conversations/${conversationId}/group`);
}

export async function updateGroup(
  conversationId: string,
  data: UpdateGroupRequest
): Promise<ConversationGroupInfo> {
  return put<ConversationGroupInfo>(
    `/conversations/${conversationId}/group`,
    data
  );
}

export async function addParticipants(
  conversationId: string,
  userIds: string[]
): Promise<{ added: number; participantsCount: number }> {
  return post<{ added: number; participantsCount: number }>(
    `/conversations/${conversationId}/group/participants`,
    { user_ids: userIds }
  );
}

export async function removeParticipant(
  conversationId: string,
  userId: string
): Promise<{ removed: boolean; userId: string }> {
  return del<{ removed: boolean; userId: string }>(
    `/conversations/${conversationId}/group/participants/${userId}`
  );
}

export async function promoteToAdmin(
  conversationId: string,
  userId: string
): Promise<{ promoted: boolean; userId: string }> {
  return post<{ promoted: boolean; userId: string }>(
    `/conversations/${conversationId}/group/admins`,
    { user_id: userId }
  );
}

// ─── E2E Encryption ─────────────────────────────────────────

export interface EncryptionKeysPayload {
  publicKey: string;
  encryptedPrivateKey?: string;
  encryptedPrivateKeyNonce?: string;
  encryptionKeySalt?: string;
}

export interface EncryptionKeyBackup {
  encryptedPrivateKey: string;
  nonce: string;
  salt: string;
}

export interface UserPublicKey {
  userId: string;
  publicKey: string;
}

export interface KeyBundlePayload {
  userId: string;
  encryptedKey: string;
  nonce: string;
  senderPublicKey: string;
}

export interface ConversationKeyBundleResponse {
  encryptedKey: string;
  nonce: string;
  senderPublicKey: string;
  version: number;
}

export async function updateEncryptionKeys(
  data: EncryptionKeysPayload
): Promise<{ updated: boolean }> {
  return put<{ updated: boolean }>('/user/encryption-keys', data);
}

export async function getEncryptionKeyBackup(): Promise<EncryptionKeyBackup> {
  return get<EncryptionKeyBackup>('/user/encryption-keys/backup');
}

export async function getUserPublicKey(userId: string): Promise<UserPublicKey> {
  return get<UserPublicKey>(`/user/${userId}/public-key`);
}

export async function getConversationKeyBundle(
  conversationId: string
): Promise<ConversationKeyBundleResponse> {
  return get<ConversationKeyBundleResponse>(
    `/conversations/${conversationId}/key-bundle`
  );
}

export async function createConversationKeyBundles(
  conversationId: string,
  bundles: KeyBundlePayload[]
): Promise<{ created: number }> {
  return post<{ created: number }>(
    `/conversations/${conversationId}/key-bundles`,
    { bundles }
  );
}
