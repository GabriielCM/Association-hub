import { describe, it, expect, vi } from 'vitest';

// Mock native modules that can't be loaded in Node
vi.mock('expo-local-authentication', () => ({
  hasHardwareAsync: vi.fn(),
  isEnrolledAsync: vi.fn(),
  supportedAuthenticationTypesAsync: vi.fn(),
  authenticateAsync: vi.fn(),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  },
}));

vi.mock('@/services/storage/secure-store', () => ({
  isBiometricsEnabled: vi.fn().mockResolvedValue(false),
  setBiometricsEnabled: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/config/constants', () => ({
  FEATURES: { BIOMETRICS: true },
}));

import { getBiometricLabel } from '@/hooks/useBiometrics';

describe('getBiometricLabel', () => {
  it('should return "Face ID" for facial', () => {
    expect(getBiometricLabel('facial')).toBe('Face ID');
  });

  it('should return "Touch ID" for fingerprint', () => {
    expect(getBiometricLabel('fingerprint')).toBe('Touch ID');
  });

  it('should return "Íris" for iris', () => {
    expect(getBiometricLabel('iris')).toBe('Íris');
  });

  it('should return "Biometria" for null', () => {
    expect(getBiometricLabel(null)).toBe('Biometria');
  });
});
