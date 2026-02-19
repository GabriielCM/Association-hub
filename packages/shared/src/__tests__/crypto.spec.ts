import { describe, it, expect } from 'vitest';
import {
  generateKeyPair,
  generateSymmetricKey,
  generateNonce,
  encryptDirectMessage,
  decryptDirectMessage,
  encryptGroupMessage,
  decryptGroupMessage,
  encryptGroupKeyForUser,
  decryptGroupKeyFromBundle,
  encryptMedia,
  decryptMedia,
  encryptPrivateKeyForBackup,
  decryptPrivateKeyFromBackup,
  buildMessagePayload,
  parseMessagePayload,
  decodeBase64,
} from '../crypto/index';

// ============================================
// generateKeyPair
// ============================================
describe('generateKeyPair', () => {
  it('should return publicKey and secretKey as base64 strings', () => {
    const pair = generateKeyPair();
    expect(pair).toHaveProperty('publicKey');
    expect(pair).toHaveProperty('secretKey');
    expect(typeof pair.publicKey).toBe('string');
    expect(typeof pair.secretKey).toBe('string');
  });

  it('should generate keys of correct size (32 bytes)', () => {
    const pair = generateKeyPair();
    expect(decodeBase64(pair.publicKey)).toHaveLength(32);
    expect(decodeBase64(pair.secretKey)).toHaveLength(32);
  });

  it('should generate unique key pairs on each call', () => {
    const a = generateKeyPair();
    const b = generateKeyPair();
    expect(a.publicKey).not.toBe(b.publicKey);
    expect(a.secretKey).not.toBe(b.secretKey);
  });
});

// ============================================
// generateSymmetricKey
// ============================================
describe('generateSymmetricKey', () => {
  it('should return a base64 string', () => {
    const key = generateSymmetricKey();
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(0);
  });

  it('should generate 32-byte keys', () => {
    const key = generateSymmetricKey();
    expect(decodeBase64(key)).toHaveLength(32);
  });

  it('should generate unique keys', () => {
    const a = generateSymmetricKey();
    const b = generateSymmetricKey();
    expect(a).not.toBe(b);
  });
});

// ============================================
// generateNonce
// ============================================
describe('generateNonce', () => {
  it('should return a base64 string', () => {
    const nonce = generateNonce();
    expect(typeof nonce).toBe('string');
    expect(nonce.length).toBeGreaterThan(0);
  });

  it('should generate 24-byte nonces', () => {
    const nonce = generateNonce();
    expect(decodeBase64(nonce)).toHaveLength(24);
  });

  it('should generate unique nonces', () => {
    const a = generateNonce();
    const b = generateNonce();
    expect(a).not.toBe(b);
  });
});

// ============================================
// Direct Message Encryption (1:1)
// ============================================
describe('encryptDirectMessage / decryptDirectMessage', () => {
  const alice = generateKeyPair();
  const bob = generateKeyPair();

  it('should round-trip: encrypt then decrypt returns original', () => {
    const message = 'Hello, Bob!';
    const encrypted = encryptDirectMessage(message, bob.publicKey, alice.secretKey);
    const decrypted = decryptDirectMessage(
      encrypted.ciphertext,
      encrypted.nonce,
      alice.publicKey,
      bob.secretKey,
    );
    expect(decrypted).toBe(message);
  });

  it('should work bidirectionally (Bob → Alice)', () => {
    const message = 'Hello, Alice!';
    const encrypted = encryptDirectMessage(message, alice.publicKey, bob.secretKey);
    const decrypted = decryptDirectMessage(
      encrypted.ciphertext,
      encrypted.nonce,
      bob.publicKey,
      alice.secretKey,
    );
    expect(decrypted).toBe(message);
  });

  it('should handle UTF-8, emojis, and accented characters', () => {
    const message = 'Olá, mundo! 🔒🇧🇷 café résumé naïve';
    const encrypted = encryptDirectMessage(message, bob.publicKey, alice.secretKey);
    const decrypted = decryptDirectMessage(
      encrypted.ciphertext,
      encrypted.nonce,
      alice.publicKey,
      bob.secretKey,
    );
    expect(decrypted).toBe(message);
  });

  it('should handle long messages', () => {
    const message = 'A'.repeat(10000);
    const encrypted = encryptDirectMessage(message, bob.publicKey, alice.secretKey);
    const decrypted = decryptDirectMessage(
      encrypted.ciphertext,
      encrypted.nonce,
      alice.publicKey,
      bob.secretKey,
    );
    expect(decrypted).toBe(message);
  });

  it('should fail to decrypt with wrong secret key', () => {
    const eve = generateKeyPair();
    const encrypted = encryptDirectMessage('secret', bob.publicKey, alice.secretKey);
    expect(() =>
      decryptDirectMessage(encrypted.ciphertext, encrypted.nonce, alice.publicKey, eve.secretKey),
    ).toThrow('Decryption failed');
  });

  it('should produce different ciphertexts for the same message (random nonce)', () => {
    const message = 'same message';
    const a = encryptDirectMessage(message, bob.publicKey, alice.secretKey);
    const b = encryptDirectMessage(message, bob.publicKey, alice.secretKey);
    expect(a.ciphertext).not.toBe(b.ciphertext);
    expect(a.nonce).not.toBe(b.nonce);
  });

  it('should return ciphertext and nonce as base64 strings', () => {
    const encrypted = encryptDirectMessage('test', bob.publicKey, alice.secretKey);
    expect(typeof encrypted.ciphertext).toBe('string');
    expect(typeof encrypted.nonce).toBe('string');
    expect(encrypted.ciphertext.length).toBeGreaterThan(0);
    expect(encrypted.nonce.length).toBeGreaterThan(0);
  });
});

// ============================================
// Group Message Encryption
// ============================================
describe('encryptGroupMessage / decryptGroupMessage', () => {
  const groupKey = generateSymmetricKey();

  it('should round-trip: encrypt then decrypt returns original', () => {
    const message = 'Hello, group!';
    const encrypted = encryptGroupMessage(message, groupKey);
    const decrypted = decryptGroupMessage(encrypted.ciphertext, encrypted.nonce, groupKey);
    expect(decrypted).toBe(message);
  });

  it('should handle UTF-8 and emojis', () => {
    const message = 'Grupo de amigos 🎉🎊 açaí';
    const encrypted = encryptGroupMessage(message, groupKey);
    const decrypted = decryptGroupMessage(encrypted.ciphertext, encrypted.nonce, groupKey);
    expect(decrypted).toBe(message);
  });

  it('should fail to decrypt with wrong key', () => {
    const wrongKey = generateSymmetricKey();
    const encrypted = encryptGroupMessage('secret group msg', groupKey);
    expect(() =>
      decryptGroupMessage(encrypted.ciphertext, encrypted.nonce, wrongKey),
    ).toThrow('Group decryption failed');
  });

  it('should allow any participant with the same key to decrypt', () => {
    const message = 'Shared message';
    const encrypted = encryptGroupMessage(message, groupKey);
    // All participants use the same groupKey
    const decrypted1 = decryptGroupMessage(encrypted.ciphertext, encrypted.nonce, groupKey);
    const decrypted2 = decryptGroupMessage(encrypted.ciphertext, encrypted.nonce, groupKey);
    expect(decrypted1).toBe(message);
    expect(decrypted2).toBe(message);
  });
});

// ============================================
// Group Key Distribution
// ============================================
describe('encryptGroupKeyForUser / decryptGroupKeyFromBundle', () => {
  const sender = generateKeyPair();
  const recipient = generateKeyPair();
  const groupKey = generateSymmetricKey();

  it('should round-trip: encrypt group key for user then decrypt returns original', () => {
    const encrypted = encryptGroupKeyForUser(groupKey, recipient.publicKey, sender.secretKey);
    const decrypted = decryptGroupKeyFromBundle(
      encrypted.ciphertext,
      encrypted.nonce,
      sender.publicKey,
      recipient.secretKey,
    );
    expect(decrypted).toBe(groupKey);
  });

  it('should fail to decrypt with wrong recipient secret key', () => {
    const eve = generateKeyPair();
    const encrypted = encryptGroupKeyForUser(groupKey, recipient.publicKey, sender.secretKey);
    expect(() =>
      decryptGroupKeyFromBundle(encrypted.ciphertext, encrypted.nonce, sender.publicKey, eve.secretKey),
    ).toThrow('Group key decryption failed');
  });
});

// ============================================
// Media Encryption
// ============================================
describe('encryptMedia / decryptMedia', () => {
  it('should round-trip: encrypt then decrypt returns original bytes', () => {
    const original = new Uint8Array([1, 2, 3, 4, 5, 72, 101, 108, 108, 111]);
    const { encrypted, nonce, mediaKey } = encryptMedia(original);
    const decrypted = decryptMedia(encrypted, nonce, mediaKey);
    expect(decrypted).toEqual(original);
  });

  it('should return mediaKey and nonce strings', () => {
    const { nonce, mediaKey } = encryptMedia(new Uint8Array([0]));
    expect(typeof mediaKey).toBe('string');
    expect(typeof nonce).toBe('string');
    expect(mediaKey.length).toBeGreaterThan(0);
    expect(nonce.length).toBeGreaterThan(0);
  });

  it('should handle large files', () => {
    const original = new Uint8Array(100_000).fill(42);
    const { encrypted, nonce, mediaKey } = encryptMedia(original);
    const decrypted = decryptMedia(encrypted, nonce, mediaKey);
    expect(decrypted).toEqual(original);
  });

  it('should fail to decrypt with wrong mediaKey', () => {
    const original = new Uint8Array([10, 20, 30]);
    const { encrypted, nonce } = encryptMedia(original);
    const wrongKey = generateSymmetricKey();
    expect(() => decryptMedia(encrypted, nonce, wrongKey)).toThrow('Media decryption failed');
  });
});

// ============================================
// Key Backup (Private Key Backup/Restore)
// ============================================
describe('encryptPrivateKeyForBackup / decryptPrivateKeyFromBackup', () => {
  it('should round-trip: encrypt then decrypt returns original private key', () => {
    const keyPair = generateKeyPair();
    const derivedKey = new Uint8Array(32).fill(0xAB); // Simulated PBKDF2 output
    const encrypted = encryptPrivateKeyForBackup(keyPair.secretKey, derivedKey);
    const restored = decryptPrivateKeyFromBackup(encrypted.ciphertext, encrypted.nonce, derivedKey);
    expect(restored).toBe(keyPair.secretKey);
  });

  it('should fail with wrong derived key (wrong password)', () => {
    const keyPair = generateKeyPair();
    const correctKey = new Uint8Array(32).fill(0xAB);
    const wrongKey = new Uint8Array(32).fill(0xCD);
    const encrypted = encryptPrivateKeyForBackup(keyPair.secretKey, correctKey);
    expect(() =>
      decryptPrivateKeyFromBackup(encrypted.ciphertext, encrypted.nonce, wrongKey),
    ).toThrow('wrong password');
  });
});

// ============================================
// Message Payload Helpers
// ============================================
describe('buildMessagePayload / parseMessagePayload', () => {
  it('should build payload with text only', () => {
    const payload = buildMessagePayload('Hello');
    const parsed = JSON.parse(payload);
    expect(parsed.text).toBe('Hello');
    expect(parsed.mediaKey).toBeUndefined();
    expect(parsed.mediaNonce).toBeUndefined();
  });

  it('should build payload with text and media keys', () => {
    const payload = buildMessagePayload('Photo caption', 'key123', 'nonce456');
    const parsed = JSON.parse(payload);
    expect(parsed.text).toBe('Photo caption');
    expect(parsed.mediaKey).toBe('key123');
    expect(parsed.mediaNonce).toBe('nonce456');
  });

  it('should parse valid JSON payload', () => {
    const json = JSON.stringify({ text: 'Hello', mediaKey: 'k', mediaNonce: 'n' });
    const result = parseMessagePayload(json);
    expect(result.text).toBe('Hello');
    expect(result.mediaKey).toBe('k');
    expect(result.mediaNonce).toBe('n');
  });

  it('should parse payload without media fields', () => {
    const json = JSON.stringify({ text: 'Simple' });
    const result = parseMessagePayload(json);
    expect(result.text).toBe('Simple');
    expect(result.mediaKey).toBeUndefined();
    expect(result.mediaNonce).toBeUndefined();
  });

  it('should fallback to plain text for non-JSON input', () => {
    const result = parseMessagePayload('just plain text');
    expect(result.text).toBe('just plain text');
    expect(result.mediaKey).toBeUndefined();
  });

  it('should round-trip: build then parse returns original data', () => {
    const original = buildMessagePayload('Test msg', 'myKey', 'myNonce');
    const parsed = parseMessagePayload(original);
    expect(parsed.text).toBe('Test msg');
    expect(parsed.mediaKey).toBe('myKey');
    expect(parsed.mediaNonce).toBe('myNonce');
  });
});
