import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the API client typed helpers
vi.mock('@/services/api/client', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

import { get, post } from '@/services/api/client';
import {
  getWalletDashboard,
  getWalletSummary,
  scanQrCode,
  getCheckoutDetails,
  payPdvCheckout,
} from '@/features/wallet/api/wallet.api';
import {
  getStravaStatus,
  connectStrava,
  syncStrava,
  disconnectStrava,
} from '@/features/wallet/api/strava.api';
import type {
  WalletDashboard,
  WalletSummary,
  QrScanResult,
  PdvCheckoutDetails,
  PdvPaymentResult,
  StravaStatus,
} from '@ahub/shared/types';

const mockDashboard: WalletDashboard = {
  balance: 1500,
  lifetimeEarned: 5000,
  lifetimeSpent: 3500,
  qrCode: {
    data: 'qr-data',
    hash: 'qr-hash',
    cardNumber: 'AHUB-00001',
  },
  summary: {
    period: 'month',
    startDate: new Date(),
    endDate: new Date(),
    earned: 500,
    spent: 200,
    net: 300,
  },
  strava: {
    connected: true,
    athleteName: 'João Runner',
    kmUsedToday: 3.2,
    kmRemainingToday: 1.8,
    lastSyncAt: new Date(),
    connectedAt: new Date(),
  },
  recentRecipients: [
    {
      id: 'user-2',
      name: 'Maria',
      avatarUrl: null,
      lastTransferAt: new Date(),
      transferCount: 5,
    },
  ],
};

const mockSummary: WalletSummary = {
  period: 'week',
  startDate: new Date(),
  endDate: new Date(),
  earned: 200,
  spent: 50,
  net: 150,
};

const mockScanResult: QrScanResult = {
  type: 'pdv_payment',
  valid: true,
  data: { code: 'ABC123' },
  action: 'Ir para checkout',
};

const mockCheckout: PdvCheckoutDetails = {
  code: 'ABC123',
  items: [
    {
      product_id: 'p1',
      name: 'Café',
      quantity: 1,
      unit_price_points: 50,
      unit_price_money: 5.0,
    },
  ],
  totalPoints: 50,
  totalMoney: 5.0,
  expiresAt: new Date(),
  pdv: { name: 'Cantina', location: 'Sede' },
  user: { balance: 1500, canPayWithPoints: true },
};

const mockPayResult: PdvPaymentResult = {
  success: true,
  transactionId: 'tx-1',
  newBalance: 1450,
  orderId: 'order-1',
  orderCode: 'ORD-001',
};

const mockStravaStatus: StravaStatus = {
  connected: true,
  athleteName: 'João Runner',
  kmUsedToday: 3.2,
  kmRemainingToday: 1.8,
  lastSyncAt: new Date(),
  connectedAt: new Date(),
};

describe('Wallet API (Mobile)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWalletDashboard', () => {
    it('should call get with correct URL', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockDashboard);
      const result = await getWalletDashboard();
      expect(get).toHaveBeenCalledWith('/wallet');
      expect(result.balance).toBe(1500);
    });
  });

  describe('getWalletSummary', () => {
    it('should call get with default period', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockSummary);
      await getWalletSummary();
      expect(get).toHaveBeenCalledWith('/wallet/summary', { period: 'month' });
    });

    it('should pass custom period', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockSummary);
      await getWalletSummary('week');
      expect(get).toHaveBeenCalledWith('/wallet/summary', { period: 'week' });
    });
  });

  describe('scanQrCode', () => {
    it('should post scan data', async () => {
      vi.mocked(post).mockResolvedValueOnce(mockScanResult);
      const result = await scanQrCode({
        qrCodeData: 'qr-data',
        qrCodeHash: 'hash',
      });
      expect(post).toHaveBeenCalledWith('/wallet/scan', {
        qrCodeData: 'qr-data',
        qrCodeHash: 'hash',
      });
      expect(result.type).toBe('pdv_payment');
      expect(result.valid).toBe(true);
    });
  });

  describe('getCheckoutDetails', () => {
    it('should call get with checkout code', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockCheckout);
      const result = await getCheckoutDetails('ABC123');
      expect(get).toHaveBeenCalledWith('/wallet/pdv/checkout/ABC123');
      expect(result.code).toBe('ABC123');
      expect(result.items).toHaveLength(1);
    });
  });

  describe('payPdvCheckout', () => {
    it('should post payment with biometric confirmation', async () => {
      vi.mocked(post).mockResolvedValueOnce(mockPayResult);
      const result = await payPdvCheckout({
        checkoutCode: 'ABC123',
        biometricConfirmed: true,
      });
      expect(post).toHaveBeenCalledWith('/wallet/pdv/checkout/ABC123/pay', {
        biometricConfirmed: true,
      });
      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(1450);
    });
  });
});

describe('Strava API (Mobile)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStravaStatus', () => {
    it('should call get with correct URL', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockStravaStatus);
      const result = await getStravaStatus();
      expect(get).toHaveBeenCalledWith('/strava/status');
      expect(result.connected).toBe(true);
    });
  });

  describe('connectStrava', () => {
    it('should post auth code', async () => {
      vi.mocked(post).mockResolvedValueOnce(mockStravaStatus);
      const result = await connectStrava('auth-code-123');
      expect(post).toHaveBeenCalledWith('/strava/connect', {
        code: 'auth-code-123',
      });
      expect(result.connected).toBe(true);
    });
  });

  describe('syncStrava', () => {
    it('should post sync request', async () => {
      const mockSync = { activitiesSynced: 3, pointsEarned: 150 };
      vi.mocked(post).mockResolvedValueOnce(mockSync);
      const result = await syncStrava();
      expect(post).toHaveBeenCalledWith('/strava/sync', {});
      expect(result.activitiesSynced).toBe(3);
    });
  });

  describe('disconnectStrava', () => {
    it('should post disconnect request', async () => {
      vi.mocked(post).mockResolvedValueOnce({ success: true });
      const result = await disconnectStrava();
      expect(post).toHaveBeenCalledWith('/strava/disconnect', {});
      expect(result.success).toBe(true);
    });
  });
});
