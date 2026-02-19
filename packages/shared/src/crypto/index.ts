import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

// ─── Types ───────────────────────────────────────────────────

export interface KeyPair {
  publicKey: string;   // base64
  secretKey: string;   // base64
}

export interface EncryptedPayload {
  ciphertext: string;  // base64
  nonce: string;       // base64
}

export interface EncryptedMediaPayload {
  encryptedData: Uint8Array;
  nonce: string;       // base64
}

export interface MessagePayload {
  text: string;
  mediaKey?: string;   // base64 - symmetric key for media decryption
  mediaNonce?: string;  // base64 - nonce used for media encryption
}

export interface GroupKeyBundle {
  userId: string;
  encryptedKey: string;  // base64
  nonce: string;         // base64
  senderPublicKey: string; // base64
}

// ─── Key Generation ──────────────────────────────────────────

export function generateKeyPair(): KeyPair {
  const pair = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(pair.publicKey),
    secretKey: encodeBase64(pair.secretKey),
  };
}

export function generateSymmetricKey(): string {
  return encodeBase64(nacl.randomBytes(nacl.secretbox.keyLength));
}

export function generateNonce(): string {
  return encodeBase64(nacl.randomBytes(nacl.box.nonceLength));
}

// ─── Direct Message Encryption (1:1) ────────────────────────

export function encryptDirectMessage(
  content: string,
  theirPublicKey: string,
  mySecretKey: string
): EncryptedPayload {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageBytes = decodeUTF8(content);
  const theirPubKeyBytes = decodeBase64(theirPublicKey);
  const mySecKeyBytes = decodeBase64(mySecretKey);

  const encrypted = nacl.box(messageBytes, nonce, theirPubKeyBytes, mySecKeyBytes);
  if (!encrypted) {
    throw new Error('Encryption failed');
  }

  return {
    ciphertext: encodeBase64(encrypted),
    nonce: encodeBase64(nonce),
  };
}

export function decryptDirectMessage(
  ciphertext: string,
  nonce: string,
  senderPublicKey: string,
  mySecretKey: string
): string {
  const ciphertextBytes = decodeBase64(ciphertext);
  const nonceBytes = decodeBase64(nonce);
  const senderPubKeyBytes = decodeBase64(senderPublicKey);
  const mySecKeyBytes = decodeBase64(mySecretKey);

  const decrypted = nacl.box.open(ciphertextBytes, nonceBytes, senderPubKeyBytes, mySecKeyBytes);
  if (!decrypted) {
    throw new Error('Decryption failed - invalid key or corrupted message');
  }

  return encodeUTF8(decrypted);
}

// ─── Group Message Encryption ────────────────────────────────

export function encryptGroupMessage(
  content: string,
  groupKey: string
): EncryptedPayload {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const messageBytes = decodeUTF8(content);
  const keyBytes = decodeBase64(groupKey);

  const encrypted = nacl.secretbox(messageBytes, nonce, keyBytes);
  if (!encrypted) {
    throw new Error('Group encryption failed');
  }

  return {
    ciphertext: encodeBase64(encrypted),
    nonce: encodeBase64(nonce),
  };
}

export function decryptGroupMessage(
  ciphertext: string,
  nonce: string,
  groupKey: string
): string {
  const ciphertextBytes = decodeBase64(ciphertext);
  const nonceBytes = decodeBase64(nonce);
  const keyBytes = decodeBase64(groupKey);

  const decrypted = nacl.secretbox.open(ciphertextBytes, nonceBytes, keyBytes);
  if (!decrypted) {
    throw new Error('Group decryption failed - invalid key or corrupted message');
  }

  return encodeUTF8(decrypted);
}

// ─── Group Key Distribution ──────────────────────────────────

export function encryptGroupKeyForUser(
  groupKey: string,
  recipientPublicKey: string,
  senderSecretKey: string
): EncryptedPayload {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const groupKeyBytes = decodeBase64(groupKey);
  const recipientPubKeyBytes = decodeBase64(recipientPublicKey);
  const senderSecKeyBytes = decodeBase64(senderSecretKey);

  const encrypted = nacl.box(groupKeyBytes, nonce, recipientPubKeyBytes, senderSecKeyBytes);
  if (!encrypted) {
    throw new Error('Group key encryption failed');
  }

  return {
    ciphertext: encodeBase64(encrypted),
    nonce: encodeBase64(nonce),
  };
}

export function decryptGroupKeyFromBundle(
  encryptedKey: string,
  nonce: string,
  senderPublicKey: string,
  mySecretKey: string
): string {
  const encryptedBytes = decodeBase64(encryptedKey);
  const nonceBytes = decodeBase64(nonce);
  const senderPubKeyBytes = decodeBase64(senderPublicKey);
  const mySecKeyBytes = decodeBase64(mySecretKey);

  const decrypted = nacl.box.open(encryptedBytes, nonceBytes, senderPubKeyBytes, mySecKeyBytes);
  if (!decrypted) {
    throw new Error('Group key decryption failed');
  }

  return encodeBase64(decrypted);
}

// ─── Media Encryption ────────────────────────────────────────

export function encryptMedia(
  fileBytes: Uint8Array
): { encrypted: Uint8Array; nonce: string; mediaKey: string } {
  const mediaKey = nacl.randomBytes(nacl.secretbox.keyLength);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);

  const encrypted = nacl.secretbox(fileBytes, nonce, mediaKey);
  if (!encrypted) {
    throw new Error('Media encryption failed');
  }

  return {
    encrypted,
    nonce: encodeBase64(nonce),
    mediaKey: encodeBase64(mediaKey),
  };
}

export function decryptMedia(
  encryptedData: Uint8Array,
  nonce: string,
  mediaKey: string
): Uint8Array {
  const nonceBytes = decodeBase64(nonce);
  const keyBytes = decodeBase64(mediaKey);

  const decrypted = nacl.secretbox.open(encryptedData, nonceBytes, keyBytes);
  if (!decrypted) {
    throw new Error('Media decryption failed');
  }

  return decrypted;
}

// ─── Key Backup (for password-derived encryption) ────────────

export function encryptPrivateKeyForBackup(
  privateKey: string,
  derivedKey: Uint8Array
): EncryptedPayload {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const privateKeyBytes = decodeBase64(privateKey);

  const encrypted = nacl.secretbox(privateKeyBytes, nonce, derivedKey);
  if (!encrypted) {
    throw new Error('Private key backup encryption failed');
  }

  return {
    ciphertext: encodeBase64(encrypted),
    nonce: encodeBase64(nonce),
  };
}

export function decryptPrivateKeyFromBackup(
  encryptedPrivateKey: string,
  nonce: string,
  derivedKey: Uint8Array
): string {
  const encryptedBytes = decodeBase64(encryptedPrivateKey);
  const nonceBytes = decodeBase64(nonce);

  const decrypted = nacl.secretbox.open(encryptedBytes, nonceBytes, derivedKey);
  if (!decrypted) {
    throw new Error('Private key backup decryption failed - wrong password?');
  }

  return encodeBase64(decrypted);
}

// ─── Message Payload Helpers ─────────────────────────────────

export function buildMessagePayload(
  text: string,
  mediaKey?: string,
  mediaNonce?: string
): string {
  const payload: MessagePayload = { text };
  if (mediaKey) payload.mediaKey = mediaKey;
  if (mediaNonce) payload.mediaNonce = mediaNonce;
  return JSON.stringify(payload);
}

export function parseMessagePayload(decryptedContent: string): MessagePayload {
  try {
    const parsed = JSON.parse(decryptedContent);
    return {
      text: parsed.text ?? decryptedContent,
      mediaKey: parsed.mediaKey,
      mediaNonce: parsed.mediaNonce,
    };
  } catch {
    // Fallback: plain text message (no media)
    return { text: decryptedContent };
  }
}

// ─── Re-exported Utilities ───────────────────────────────────

export { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 };
