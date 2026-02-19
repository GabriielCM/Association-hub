import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import {
  hasEncryptionKeys,
  generateAndSaveKeyPair,
  getPublicKey,
  getPrivateKey,
  saveKeyPair,
  clearEncryptionKeys,
  clearPublicKeyCache,
} from '@/lib/keyStore';
import { createKeyBackup, restoreFromBackup } from '@/lib/keyBackup';
import {
  updateEncryptionKeys,
  getEncryptionKeyBackup,
} from '@/features/messages/api/messages.api';

/**
 * Hook that ensures E2E encryption keys are set up for the authenticated user.
 *
 * Flow:
 * 1. If local keys exist → done
 * 2. If server has backup → restore from backup
 * 3. If neither → generate new keys, upload to server
 *
 * Call this in the root layout after auth hydration.
 */
export function useEncryptionSetup() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setupRunning = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !isHydrated || !user || setupRunning.current) return;

    setupRunning.current = true;

    (async () => {
      try {
        // 1. Check if keys already exist locally
        if (await hasEncryptionKeys()) {
          // Ensure public key is on server
          const localPubKey = await getPublicKey();
          if (localPubKey && !user.encryptionPublicKey) {
            await updateEncryptionKeys({ publicKey: localPubKey });
          }
          return;
        }

        // 2. Try to restore from server backup
        try {
          const backup = await getEncryptionKeyBackup();
          if (backup?.encryptedPrivateKey) {
            // We need the user's password to decrypt
            // For now, we'll generate new keys (password-based restore
            // happens at login time when we have the password)
            console.log('[E2E] Backup exists but password needed for restoration');
          }
        } catch {
          // No backup exists, continue to generate new keys
        }

        // 3. Generate new key pair
        console.log('[E2E] Generating new encryption key pair...');
        const keyPair = await generateAndSaveKeyPair();

        // Upload public key to server
        await updateEncryptionKeys({
          publicKey: keyPair.publicKey,
        });

        console.log('[E2E] Encryption keys generated and uploaded');
      } catch (error) {
        console.error('[E2E] Setup failed:', error);
      } finally {
        setupRunning.current = false;
      }
    })();
  }, [isAuthenticated, isHydrated, user]);

  // Cleanup on logout
  useEffect(() => {
    if (!isAuthenticated && isHydrated) {
      clearEncryptionKeys();
      clearPublicKeyCache();
    }
  }, [isAuthenticated, isHydrated]);
}

/**
 * Call this during login when we have access to the raw password.
 * Creates a backup of the private key encrypted with the password.
 */
export async function createKeyBackupOnLogin(password: string): Promise<void> {
  try {
    const privateKey = await getPrivateKey();
    if (!privateKey) return;

    const backup = await createKeyBackup(privateKey, password);

    await updateEncryptionKeys({
      publicKey: (await getPublicKey()) ?? '',
      encryptedPrivateKey: backup.encryptedPrivateKey,
      encryptedPrivateKeyNonce: backup.nonce,
      encryptionKeySalt: backup.salt,
    });

    console.log('[E2E] Key backup created successfully');
  } catch (error) {
    console.error('[E2E] Failed to create key backup:', error);
  }
}

/**
 * Call this during login when user has a server backup but no local keys.
 * Restores private key from the encrypted backup.
 */
export async function restoreKeysFromBackup(password: string): Promise<boolean> {
  try {
    const backup = await getEncryptionKeyBackup();
    if (!backup?.encryptedPrivateKey || !backup.nonce || !backup.salt) {
      return false;
    }

    const privateKey = await restoreFromBackup(
      backup.encryptedPrivateKey,
      backup.nonce,
      backup.salt,
      password
    );

    // Get public key from server (user profile)
    // For now derive from the stored backup context
    const { generateKeyPair } = await import('@ahub/shared/crypto');

    // Save the restored private key - we need the public key too
    // The public key is stored on the server in the user profile
    // We can fetch it or re-derive it
    // TweetNaCl can derive public key from secret key:
    const nacl = await import('tweetnacl');
    const { decodeBase64, encodeBase64 } = await import('tweetnacl-util');
    const secretKeyBytes = decodeBase64(privateKey);
    const keyPair = nacl.box.keyPair.fromSecretKey(secretKeyBytes);
    const publicKey = encodeBase64(keyPair.publicKey);

    await saveKeyPair(publicKey, privateKey);
    console.log('[E2E] Keys restored from backup');
    return true;
  } catch (error) {
    console.error('[E2E] Failed to restore keys from backup:', error);
    return false;
  }
}
