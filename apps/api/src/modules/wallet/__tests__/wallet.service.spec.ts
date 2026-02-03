import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WalletService } from '../wallet.service';
import { SummaryPeriod } from '../dto';

describe('WalletService', () => {
  let service: WalletService;
  let prisma: any;
  let pointsService: any;
  let cardService: any;

  beforeEach(() => {
    prisma = {
      pointTransaction: {
        findMany: vi.fn(),
      },
      stravaConnection: {
        findUnique: vi.fn(),
      },
      transferRecipient: {
        findMany: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
    };

    pointsService = {
      getBalance: vi.fn().mockResolvedValue({
        balance: 1000,
        lifetimeEarned: 5000,
        lifetimeSpent: 4000,
      }),
    };

    cardService = {
      getQrCode: vi.fn().mockResolvedValue({
        qrCodeData: '{"type":"member_card"}',
        qrCodeHash: 'hash123',
        cardNumber: 'ASSOC-2024-00001',
      }),
    };

    service = new WalletService(prisma, pointsService, cardService);
  });

  // ===========================================
  // getDashboard
  // ===========================================

  describe('getDashboard', () => {
    it('should return complete wallet dashboard', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([
        { amount: 100 },
        { amount: 50 },
        { amount: -30 },
      ]);
      prisma.stravaConnection.findUnique.mockResolvedValue(null);
      prisma.transferRecipient.findMany.mockResolvedValue([]);

      const result = await service.getDashboard('user-123');

      expect(result.balance).toBe(1000);
      expect(result.lifetimeEarned).toBe(5000);
      expect(result.qrCode).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.strava).toBeDefined();
      expect(result.recentRecipients).toBeDefined();
    });

    it('should handle null QR code when card is inactive', async () => {
      cardService.getQrCode.mockRejectedValue(new Error('Card inactive'));
      prisma.pointTransaction.findMany.mockResolvedValue([]);
      prisma.stravaConnection.findUnique.mockResolvedValue(null);
      prisma.transferRecipient.findMany.mockResolvedValue([]);

      const result = await service.getDashboard('user-123');

      expect(result.qrCode).toBeNull();
    });

    it('should return strava status when connected', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([]);
      prisma.stravaConnection.findUnique.mockResolvedValue({
        athleteName: 'João Runner',
        kmUsedToday: 3.5,
        lastSyncAt: new Date(),
        connectedAt: new Date(),
      });
      prisma.user.findUnique.mockResolvedValue({
        association: { stravaMaxKmDay: 5 },
      });
      prisma.transferRecipient.findMany.mockResolvedValue([]);

      const result = await service.getDashboard('user-123');

      expect(result.strava.connected).toBe(true);
      expect(result.strava.athleteName).toBe('João Runner');
      expect(result.strava.kmUsedToday).toBe(3.5);
      expect(result.strava.kmRemainingToday).toBe(1.5);
    });

    it('should return recent recipients', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([]);
      prisma.stravaConnection.findUnique.mockResolvedValue(null);
      prisma.transferRecipient.findMany.mockResolvedValue([
        { recipientId: 'user-456', lastTransferAt: new Date(), transferCount: 5 },
      ]);
      prisma.user.findMany.mockResolvedValue([
        { id: 'user-456', name: 'Maria', avatarUrl: 'https://example.com/maria.jpg' },
      ]);

      const result = await service.getDashboard('user-123');

      expect(result.recentRecipients).toHaveLength(1);
      expect(result.recentRecipients[0].name).toBe('Maria');
    });

    it('should calculate weekly summary correctly', async () => {
      const weeklyTransactions = [
        { amount: 100, createdAt: new Date() },
        { amount: -50, createdAt: new Date() },
        { amount: 200, createdAt: new Date() },
      ];
      prisma.pointTransaction.findMany.mockResolvedValue(weeklyTransactions);
      prisma.stravaConnection.findUnique.mockResolvedValue(null);
      prisma.transferRecipient.findMany.mockResolvedValue([]);

      const result = await service.getDashboard('user-123');

      expect(result.summary.earned).toBe(300);
      expect(result.summary.spent).toBe(50);
    });

    it('should handle empty recent recipients', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([]);
      prisma.stravaConnection.findUnique.mockResolvedValue(null);
      prisma.transferRecipient.findMany.mockResolvedValue([]);

      const result = await service.getDashboard('user-123');

      expect(result.recentRecipients).toHaveLength(0);
    });

    it('should cap kmRemainingToday at 0 when exceeded', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([]);
      prisma.stravaConnection.findUnique.mockResolvedValue({
        athleteName: 'Over Runner',
        kmUsedToday: 10, // More than max
        lastSyncAt: new Date(),
        connectedAt: new Date(),
      });
      prisma.user.findUnique.mockResolvedValue({
        association: { stravaMaxKmDay: 5 },
      });
      prisma.transferRecipient.findMany.mockResolvedValue([]);

      const result = await service.getDashboard('user-123');

      expect(result.strava.kmRemainingToday).toBe(0);
    });
  });

  // ===========================================
  // getSummary
  // ===========================================

  describe('getSummary', () => {
    it('should calculate earnings and spending for month', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([
        { amount: 100 },
        { amount: 200 },
        { amount: -50 },
        { amount: -30 },
      ]);

      const result = await service.getSummary('user-123', SummaryPeriod.MONTH);

      expect(result.earned).toBe(300);
      expect(result.spent).toBe(80);
      expect(result.net).toBe(220);
      expect(result.period).toBe(SummaryPeriod.MONTH);
    });

    it('should return zero for empty transactions', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([]);

      const result = await service.getSummary('user-123', SummaryPeriod.TODAY);

      expect(result.earned).toBe(0);
      expect(result.spent).toBe(0);
      expect(result.net).toBe(0);
    });

    it('should handle different periods correctly', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([]);

      // Test each period
      const periods = [
        SummaryPeriod.TODAY,
        SummaryPeriod.WEEK,
        SummaryPeriod.MONTH,
        SummaryPeriod.YEAR,
      ];

      for (const period of periods) {
        const result = await service.getSummary('user-123', period);
        expect(result.period).toBe(period);
        expect(result.startDate).toBeDefined();
        expect(result.endDate).toBeDefined();
      }
    });

    it('should calculate correct date range for TODAY', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([]);

      const result = await service.getSummary('user-123', SummaryPeriod.TODAY);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      expect(new Date(result.startDate).toDateString()).toBe(today.toDateString());
    });

    it('should calculate correct date range for WEEK', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([]);

      const result = await service.getSummary('user-123', SummaryPeriod.WEEK);

      const startDate = new Date(result.startDate);
      const endDate = new Date(result.endDate);

      // Week period should be approximately 7 days (allowing for boundary conditions)
      expect(startDate).toBeInstanceOf(Date);
      expect(endDate).toBeInstanceOf(Date);
      expect(startDate.getTime()).toBeLessThan(endDate.getTime());
    });

    it('should calculate correct date range for YEAR', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([]);

      const result = await service.getSummary('user-123', SummaryPeriod.YEAR);

      const startDate = new Date(result.startDate);
      expect(startDate.getMonth()).toBe(0); // January
      expect(startDate.getDate()).toBe(1);
    });

    it('should handle only negative transactions (spending)', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([
        { amount: -100 },
        { amount: -50 },
      ]);

      const result = await service.getSummary('user-123', SummaryPeriod.MONTH);

      expect(result.earned).toBe(0);
      expect(result.spent).toBe(150);
      expect(result.net).toBe(-150);
    });

    it('should handle only positive transactions (earnings)', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([
        { amount: 100 },
        { amount: 50 },
      ]);

      const result = await service.getSummary('user-123', SummaryPeriod.MONTH);

      expect(result.earned).toBe(150);
      expect(result.spent).toBe(0);
      expect(result.net).toBe(150);
    });
  });

  // ===========================================
  // getCheckoutDetails (PDV - Fase 5)
  // ===========================================

  describe('getCheckoutDetails', () => {
    it('should return placeholder for PDV (Fase 5)', async () => {
      const result = await service.getCheckoutDetails('checkout-123', 'user-123');

      expect(result.error).toContain('Fase 5');
    });
  });

  // ===========================================
  // processPdvPayment (PDV - Fase 5)
  // ===========================================

  describe('processPdvPayment', () => {
    it('should return placeholder for PDV (Fase 5)', async () => {
      const result = await service.processPdvPayment('checkout-123', 'user-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Fase 5');
    });
  });
});
