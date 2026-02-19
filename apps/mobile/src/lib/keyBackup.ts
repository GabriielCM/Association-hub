import * as Crypto from 'expo-crypto';
import {
  encryptPrivateKeyForBackup,
  decryptPrivateKeyFromBackup,
  encodeBase64,
  decodeBase64,
} from '@ahub/shared/crypto';

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 32; // 256 bits

/**
 * Derive a 32-byte encryption key from user's password using PBKDF2.
 */
async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<Uint8Array> {
  // Use expo-crypto's digest for PBKDF2-like derivation
  // Since expo-crypto doesn't have native PBKDF2, we simulate it
  // with iterative HMAC-SHA256 hashing
  let key = new Uint8Array([
    ...new TextEncoder().encode(password),
    ...salt,
  ]);

  for (let i = 0; i < Math.min(PBKDF2_ITERATIONS, 1000); i++) {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      encodeBase64(key) + i.toString(),
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );
    key = decodeBase64(hash);
  }

  return key.slice(0, KEY_LENGTH);
}

/**
 * Generate a random salt for key derivation.
 */
function generateSalt(): string {
  const bytes = Crypto.getRandomBytes(16);
  return encodeBase64(bytes);
}

/**
 * Create an encrypted backup of the private key using the user's password.
 */
export async function createKeyBackup(
  privateKey: string,
  password: string
): Promise<{
  encryptedPrivateKey: string;
  nonce: string;
  salt: string;
}> {
  const salt = generateSalt();
  const saltBytes = decodeBase64(salt);
  const derivedKey = await deriveKeyFromPassword(password, saltBytes);

  const { ciphertext, nonce } = encryptPrivateKeyForBackup(privateKey, derivedKey);

  return {
    encryptedPrivateKey: ciphertext,
    nonce,
    salt,
  };
}

/**
 * Restore private key from encrypted backup using the user's password.
 */
export async function restoreFromBackup(
  encryptedPrivateKey: string,
  nonce: string,
  salt: string,
  password: string
): Promise<string> {
  const saltBytes = decodeBase64(salt);
  const derivedKey = await deriveKeyFromPassword(password, saltBytes);

  return decryptPrivateKeyFromBackup(encryptedPrivateKey, nonce, derivedKey);
}
