import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  isBiometricsEnabled,
  setBiometricsEnabled,
} from '@/services/storage/secure-store';
import { FEATURES } from '@/config/constants';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | null;
export type AuthMethod = 'biometric' | 'device_credential' | 'none';

interface UseBiometricsReturn {
  // State
  isAvailable: boolean;
  isEnrolled: boolean;
  biometricType: BiometricType;
  authMethod: AuthMethod;
  isEnabled: boolean;
  isLoading: boolean;

  // Actions
  authenticate: (
    promptMessage?: string
  ) => Promise<LocalAuthentication.LocalAuthenticationResult>;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<void>;
}

export function useBiometrics(): UseBiometricsReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>(null);
  const [securityLevel, setSecurityLevel] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check biometrics availability and enrollment
  useEffect(() => {
    if (!FEATURES.BIOMETRICS) {
      setIsLoading(false);
      return;
    }

    async function checkBiometrics() {
      try {
        // Check device security level (PIN/password/biometric)
        const level = await LocalAuthentication.getEnrolledLevelAsync();
        setSecurityLevel(level);

        // Check if hardware is available
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        setIsAvailable(hasHardware);

        // Check if user has enrolled biometrics
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);

        // Get supported authentication types
        const supportedTypes =
          await LocalAuthentication.supportedAuthenticationTypesAsync();

        if (
          supportedTypes.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
          )
        ) {
          setBiometricType('facial');
        } else if (
          supportedTypes.includes(
            LocalAuthentication.AuthenticationType.FINGERPRINT
          )
        ) {
          setBiometricType('fingerprint');
        } else if (
          supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)
        ) {
          setBiometricType('iris');
        }

        // Check if user has enabled biometrics in app
        const enabled = await isBiometricsEnabled();
        setIsEnabled(enabled);
      } catch (error) {
        console.error('Error checking biometrics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkBiometrics();
  }, []);

  // Computed auth method
  const authMethod: AuthMethod = isEnrolled
    ? 'biometric'
    : securityLevel >= LocalAuthentication.SecurityLevel.SECRET
      ? 'device_credential'
      : 'none';

  // Authenticate with biometrics, device credential, or auto-pass
  const authenticate = useCallback(
    async (
      promptMessage = 'Autentique-se para continuar'
    ): Promise<LocalAuthentication.LocalAuthenticationResult> => {
      // Biometrics available and enrolled
      if (isAvailable && isEnrolled) {
        try {
          return await LocalAuthentication.authenticateAsync({
            promptMessage,
            cancelLabel: 'Cancelar',
            fallbackLabel: 'Usar senha',
            disableDeviceFallback: false,
          });
        } catch (error) {
          console.error('Biometric authentication error:', error);
          return { success: false, error: 'unknown' };
        }
      }

      // Device has PIN/password/pattern
      if (securityLevel >= LocalAuthentication.SecurityLevel.SECRET) {
        try {
          return await LocalAuthentication.authenticateAsync({
            promptMessage,
            cancelLabel: 'Cancelar',
            disableDeviceFallback: false,
          });
        } catch (error) {
          console.error('Device credential authentication error:', error);
          return { success: false, error: 'unknown' };
        }
      }

      // No authentication available - auto-pass
      return { success: true };
    },
    [isAvailable, isEnrolled, securityLevel]
  );

  // Enable biometrics in app
  const enableBiometrics = useCallback(async (): Promise<boolean> => {
    if (!isAvailable || !isEnrolled) {
      return false;
    }

    // Require authentication to enable
    const result = await authenticate('Ative a biometria para login rápido');

    if (result.success) {
      await setBiometricsEnabled(true);
      setIsEnabled(true);
      return true;
    }

    return false;
  }, [isAvailable, isEnrolled, authenticate]);

  // Disable biometrics in app
  const disableBiometrics = useCallback(async (): Promise<void> => {
    await setBiometricsEnabled(false);
    setIsEnabled(false);
  }, []);

  return {
    isAvailable,
    isEnrolled,
    biometricType,
    authMethod,
    isEnabled,
    isLoading,
    authenticate,
    enableBiometrics,
    disableBiometrics,
  };
}

// Helper to get biometric type label
export function getBiometricLabel(type: BiometricType): string {
  switch (type) {
    case 'facial':
      return 'Face ID';
    case 'fingerprint':
      return 'Touch ID';
    case 'iris':
      return 'Íris';
    default:
      return 'Biometria';
  }
}
