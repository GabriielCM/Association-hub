import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WalletController } from '../wallet.controller';
import { WalletService } from '../wallet.service';
import { QrScannerService } from '../qr-scanner.service';
import { JwtPayload } from '../../../common/types';
import { SummaryPeriod } from '../dto';

describe('WalletController', () => {
  let controller: WalletController;
  let walletService: WalletService;
  let qrScannerService: QrScannerService;

  const mockUser: JwtPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    role: 'USER',
    associationId: 'assoc-1',
  };

  const mockDashboard = {
    balance: 1000,
    lifetimeEarned: 5000,
    lifetimeSpent: 4000,
    qrCode: {
      qrCodeData: '{"type":"member_card"}',
      qrCodeHash: 'hash123',
      cardNumber: 'ASSOC-2024-00001',
    },
    summary: {
      earned: 300,
      spent: 50,
      net: 250,
      period: 'week',
    },
    strava: {
      connected: true,
      athleteName: 'João Runner',
      kmUsedToday: 3.5,
      kmRemainingToday: 1.5,
      dailyLimit: 5,
    },
    recentRecipients: [
      { id: 'user-456', name: 'Maria', avatarUrl: null },
    ],
  };

  const mockSummary = {
    earned: 300,
    spent: 80,
    net: 220,
    period: SummaryPeriod.MONTH,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
  };

  const mockQrScanResult = {
    valid: true,
    type: 'member_card',
    data: {
      user: { id: 'user-123', name: 'João', avatarUrl: null },
      card: { cardNumber: 'ASSOC-2024-00001' },
    },
  };

  const mockCheckoutDetails = {
    code: 'checkout-123',
    items: [{ product_id: 'prod-1', name: 'Café', quantity: 2 }],
    totalPoints: 100,
    totalMoney: 10.0,
    expiresAt: new Date(),
    pdv: { name: 'PDV Central', location: 'Entrada' },
    user: { balance: 1000, canPayWithPoints: true },
  };

  const mockPdvPaymentResult = {
    success: true,
    transactionId: 'tx-1',
    newBalance: 900,
    orderId: 'order-1',
    orderCode: 'ORD-001',
  };

  beforeEach(() => {
    walletService = {
      getDashboard: vi.fn().mockResolvedValue(mockDashboard),
      getSummary: vi.fn().mockResolvedValue(mockSummary),
      getCheckoutDetails: vi.fn().mockResolvedValue(mockCheckoutDetails),
      processPdvPayment: vi.fn().mockResolvedValue(mockPdvPaymentResult),
    } as unknown as WalletService;

    qrScannerService = {
      processQrCode: vi.fn().mockResolvedValue(mockQrScanResult),
    } as unknown as QrScannerService;

    controller = new WalletController(walletService, qrScannerService);
  });

  // ===========================================
  // getDashboard
  // ===========================================

  describe('getDashboard', () => {
    it('should return dashboard data wrapped in data object', async () => {
      const result = await controller.getDashboard(mockUser);

      expect(result).toEqual({ data: mockDashboard });
      expect(walletService.getDashboard).toHaveBeenCalledWith('user-123');
    });

    it('should include all dashboard components', async () => {
      const result = await controller.getDashboard(mockUser);

      expect(result.data.balance).toBeDefined();
      expect(result.data.qrCode).toBeDefined();
      expect(result.data.summary).toBeDefined();
      expect(result.data.strava).toBeDefined();
      expect(result.data.recentRecipients).toBeDefined();
    });

    it('should handle null QR code when card inactive', async () => {
      walletService.getDashboard = vi.fn().mockResolvedValue({
        ...mockDashboard,
        qrCode: null,
      });

      const result = await controller.getDashboard(mockUser);

      expect(result.data.qrCode).toBeNull();
    });
  });

  // ===========================================
  // getSummary
  // ===========================================

  describe('getSummary', () => {
    it('should return summary data wrapped in data object', async () => {
      const query = { period: SummaryPeriod.MONTH };

      const result = await controller.getSummary(mockUser, query);

      expect(result).toEqual({ data: mockSummary });
      expect(walletService.getSummary).toHaveBeenCalledWith('user-123', SummaryPeriod.MONTH);
    });

    it('should pass TODAY period to service', async () => {
      const query = { period: SummaryPeriod.TODAY };

      await controller.getSummary(mockUser, query);

      expect(walletService.getSummary).toHaveBeenCalledWith('user-123', SummaryPeriod.TODAY);
    });

    it('should pass WEEK period to service', async () => {
      const query = { period: SummaryPeriod.WEEK };

      await controller.getSummary(mockUser, query);

      expect(walletService.getSummary).toHaveBeenCalledWith('user-123', SummaryPeriod.WEEK);
    });

    it('should pass YEAR period to service', async () => {
      const query = { period: SummaryPeriod.YEAR };

      await controller.getSummary(mockUser, query);

      expect(walletService.getSummary).toHaveBeenCalledWith('user-123', SummaryPeriod.YEAR);
    });
  });

  // ===========================================
  // scanQrCode
  // ===========================================

  describe('scanQrCode', () => {
    it('should return scan result wrapped in data object', async () => {
      const dto = { qrCodeData: '{"type":"member_card"}', qrCodeHash: 'hash123' };

      const result = await controller.scanQrCode(mockUser, dto);

      expect(result).toEqual({ data: mockQrScanResult });
      expect(qrScannerService.processQrCode).toHaveBeenCalledWith(
        dto.qrCodeData,
        dto.qrCodeHash,
        'user-123',
      );
    });

    it('should handle valid member card QR code', async () => {
      const dto = { qrCodeData: '{"type":"member_card","user_id":"user-456"}', qrCodeHash: 'valid-hash' };

      const result = await controller.scanQrCode(mockUser, dto);

      expect(result.data.valid).toBe(true);
      expect(result.data.type).toBe('member_card');
    });

    it('should handle invalid QR code response', async () => {
      qrScannerService.processQrCode = vi.fn().mockResolvedValue({
        valid: false,
        error: 'QR Code inválido ou expirado',
      });

      const dto = { qrCodeData: 'invalid-data', qrCodeHash: 'wrong-hash' };

      const result = await controller.scanQrCode(mockUser, dto);

      expect(result.data.valid).toBe(false);
      expect(result.data.error).toBeDefined();
    });

    it('should handle user transfer QR code', async () => {
      qrScannerService.processQrCode = vi.fn().mockResolvedValue({
        valid: true,
        type: 'user_transfer',
        data: {
          recipient: { id: 'user-789', name: 'Carlos', avatarUrl: null },
          senderBalance: 1000,
        },
      });

      const dto = { qrCodeData: '{"type":"user_transfer","user_id":"user-789"}', qrCodeHash: 'hash' };

      const result = await controller.scanQrCode(mockUser, dto);

      expect(result.data.type).toBe('user_transfer');
      expect(result.data.data.recipient).toBeDefined();
    });
  });

  // ===========================================
  // getCheckoutDetails
  // ===========================================

  describe('getCheckoutDetails', () => {
    it('should return checkout details wrapped in data object', async () => {
      const result = await controller.getCheckoutDetails('checkout-123', mockUser);

      expect(result).toEqual({ data: mockCheckoutDetails });
      expect(walletService.getCheckoutDetails).toHaveBeenCalledWith('checkout-123', 'user-123');
    });

    it('should return checkout code and user balance', async () => {
      const result = await controller.getCheckoutDetails('checkout-123', mockUser);

      expect(result.data.code).toBe('checkout-123');
      expect(result.data.user.canPayWithPoints).toBe(true);
    });
  });

  // ===========================================
  // processPdvPayment
  // ===========================================

  describe('processPdvPayment', () => {
    it('should return payment result directly', async () => {
      const dto = { checkoutCode: 'checkout-123' };

      const result = await controller.processPdvPayment(mockUser, dto);

      expect(result).toEqual(mockPdvPaymentResult);
      expect(walletService.processPdvPayment).toHaveBeenCalledWith('checkout-123', 'user-123');
    });

    it('should return success and new balance', async () => {
      const dto = { checkoutCode: 'checkout-123' };

      const result = await controller.processPdvPayment(mockUser, dto);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(900);
    });
  });
});
