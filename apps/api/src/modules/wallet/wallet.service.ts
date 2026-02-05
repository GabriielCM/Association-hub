import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PointsService } from '../points/points.service';
import { CardService } from '../card/card.service';
import { PdvCheckoutService } from '../pdv/pdv-checkout.service';
import { SummaryPeriod } from './dto';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsService: PointsService,
    private readonly cardService: CardService,
    @Inject(forwardRef(() => PdvCheckoutService))
    private readonly pdvCheckoutService: PdvCheckoutService,
  ) {}

  /**
   * Get complete wallet dashboard data
   */
  async getDashboard(userId: string) {
    // Parallel fetch for better performance
    const [balance, summary, qrCode, strava, recentRecipients] = await Promise.all([
      this.pointsService.getBalance(userId),
      this.getSummary(userId, SummaryPeriod.MONTH),
      this.getQrCode(userId),
      this.getStravaStatus(userId),
      this.getRecentRecipients(userId),
    ]);

    return {
      balance: balance.balance,
      lifetimeEarned: balance.lifetimeEarned,
      lifetimeSpent: balance.lifetimeSpent,
      qrCode,
      summary,
      strava,
      recentRecipients,
    };
  }

  /**
   * Get earnings/spending summary for a period
   */
  async getSummary(userId: string, period: SummaryPeriod) {
    const { startDate, endDate } = this.getPeriodDates(period);

    // Get all transactions in period
    const transactions = await this.prisma.pointTransaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
      },
    });

    let earned = 0;
    let spent = 0;

    for (const tx of transactions) {
      if (tx.amount > 0) {
        earned += tx.amount;
      } else {
        spent += Math.abs(tx.amount);
      }
    }

    return {
      period,
      startDate,
      endDate,
      earned,
      spent,
      net: earned - spent,
    };
  }

  /**
   * Get user's QR code for receiving transfers
   */
  private async getQrCode(userId: string) {
    try {
      const qr = await this.cardService.getQrCode(userId);
      return {
        data: qr.qrCodeData,
        hash: qr.qrCodeHash,
        cardNumber: qr.cardNumber,
      };
    } catch {
      // Card might not exist or be inactive
      return null;
    }
  }

  /**
   * Get Strava connection status
   */
  private async getStravaStatus(userId: string) {
    const connection = await this.prisma.stravaConnection.findUnique({
      where: { userId },
      select: {
        athleteName: true,
        kmUsedToday: true,
        lastSyncAt: true,
        connectedAt: true,
      },
    });

    if (!connection) {
      return {
        connected: false,
        athleteName: null,
        kmUsedToday: 0,
        kmRemainingToday: 5, // Default limit
        lastSyncAt: null,
      };
    }

    // Get association config for daily limit
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        association: {
          select: {
            stravaMaxKmDay: true,
          },
        },
      },
    });

    const dailyLimit = user?.association?.stravaMaxKmDay || 5;
    const kmRemaining = Math.max(0, dailyLimit - connection.kmUsedToday);

    return {
      connected: true,
      athleteName: connection.athleteName,
      kmUsedToday: connection.kmUsedToday,
      kmRemainingToday: kmRemaining,
      lastSyncAt: connection.lastSyncAt,
      connectedAt: connection.connectedAt,
    };
  }

  /**
   * Get recent transfer recipients
   */
  private async getRecentRecipients(userId: string) {
    const recipients = await this.prisma.transferRecipient.findMany({
      where: { userId },
      orderBy: { lastTransferAt: 'desc' },
      take: 5,
      select: {
        recipientId: true,
        lastTransferAt: true,
        transferCount: true,
      },
    });

    if (recipients.length === 0) {
      return [];
    }

    // Get user details
    const users = await this.prisma.user.findMany({
      where: { id: { in: recipients.map((r) => r.recipientId) } },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return recipients.map((r) => {
      const user = userMap.get(r.recipientId);
      return {
        id: r.recipientId,
        name: user?.name || 'Usuário',
        avatarUrl: user?.avatarUrl,
        lastTransferAt: r.lastTransferAt,
        transferCount: r.transferCount,
      };
    });
  }

  /**
   * Get PDV checkout details
   */
  async getCheckoutDetails(checkoutCode: string, userId: string) {
    return this.pdvCheckoutService.getCheckoutDetails(checkoutCode, userId);
  }

  /**
   * Process PDV payment with points
   */
  async processPdvPayment(checkoutCode: string, userId: string) {
    return this.pdvCheckoutService.payWithPoints(checkoutCode, userId);
  }

  /**
   * Initiate PDV PIX payment
   */
  async initiatePdvPixPayment(checkoutCode: string, userId: string) {
    return this.pdvCheckoutService.initiatePixPayment(checkoutCode, userId);
  }

  /**
   * Get period date range
   */
  private getPeriodDates(period: SummaryPeriod): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    let startDate: Date;

    switch (period) {
      case SummaryPeriod.TODAY:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;

      case SummaryPeriod.WEEK:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;

      case SummaryPeriod.MONTH:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;

      case SummaryPeriod.YEAR:
        startDate = new Date(now.getFullYear(), 0, 1);
        break;

      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate };
  }
}
