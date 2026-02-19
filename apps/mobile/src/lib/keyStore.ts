import * as SecureStore from 'expo-secure-store';
import { generateKeyPair, type KeyPair } from '@ahub/shared/crypto';

const KEYS = {
  PRIVATE_KEY: 'e2e_private_key',
  PUBLIC_KEY: 'e2e_public_key',
  GROUP_KEY_PREFIX: 'e2e_group_key_',
  PUBLIC_KEY_CACHE_PREFIX: 'e2e_pub_',
} as const;

// ─── Identity Key Management ─────────────────────────────────

export async function hasEncryptionKeys(): Promise<boolean> {
  const privateKey = await SecureStore.getItemAsync(KEYS.PRIVATE_KEY);
  return privateKey !== null;
}

export async function getPrivateKey(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.PRIVATE_KEY);
}

export async function getPublicKey(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.PUBLIC_KEY);
}

export async function saveKeyPair(publicKey: string, secretKey: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.PRIVATE_KEY, secretKey);
  await SecureStore.setItemAsync(KEYS.PUBLIC_KEY, publicKey);
}

export async function generateAndSaveKeyPair(): Promise<KeyPair> {
  const keyPair = generateKeyPair();
  await saveKeyPair(keyPair.publicKey, keyPair.secretKey);
  return keyPair;
}

export async function clearEncryptionKeys(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.PRIVATE_KEY);
  await SecureStore.deleteItemAsync(KEYS.PUBLIC_KEY);
}

// ─── Group Key Management ────────────────────────────────────

function groupKeyId(conversationId: string, version: number): string {
  return `${KEYS.GROUP_KEY_PREFIX}${conversationId}_v${version}`;
}

export async function getGroupKey(
  conversationId: string,
  version: number = 1
): Promise<string | null> {
  return SecureStore.getItemAsync(groupKeyId(conversationId, version));
}

export async function saveGroupKey(
  conversationId: string,
  groupKey: string,
  version: number = 1
): Promise<void> {
  await SecureStore.setItemAsync(groupKeyId(conversationId, version), groupKey);
}

export async function deleteGroupKey(
  conversationId: string,
  version: number = 1
): Promise<void> {
  await SecureStore.deleteItemAsync(groupKeyId(conversationId, version));
}

// ─── Public Key Cache ────────────────────────────────────────
// In-memory cache for other users' public keys (not sensitive)

const publicKeyCache = new Map<string, string>();

export function getCachedPublicKey(userId: string): string | undefined {
  return publicKeyCache.get(userId);
}

export function setCachedPublicKey(userId: string, publicKey: string): void {
  publicKeyCache.set(userId, publicKey);
}

export function clearPublicKeyCache(): void {
  publicKeyCache.clear();
}
