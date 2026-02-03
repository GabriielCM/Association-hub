import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TransactionSource, Prisma } from '@prisma/client';
import {
  SummaryPeriod,
  HistoryQueryDto,
  TransactionTypeFilter,
  ReportPeriod,
} from './dto';

@Injectable()
export class PointsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // USER ENDPOINTS
  // ==========================================

  async getBalance(userId: string) {
    const points = await this.prisma.userPoints.findUnique({
      where: { userId },
    });

    if (!points) {
      return this.prisma.userPoints.create({
        data: { userId },
      });
    }

    return {
      balance: points.balance,
      lifetimeEarned: points.lifetimeEarned,
      lifetimeSpent: points.lifetimeSpent,
      lastTransactionAt: points.updatedAt,
    };
  }

  async getHistory(userId: string, query: HistoryQueryDto) {
    const { page = 1, perPage = 20, type, source, startDate, endDate } = query;
    const skip = (page - 1) * perPage;

    const where: Prisma.PointTransactionWhereInput = { userId };

    // Filter by type (credit/debit)
    if (type === TransactionTypeFilter.CREDIT) {
      where.amount = { gt: 0 };
    } else if (type === TransactionTypeFilter.DEBIT) {
      where.amount = { lt: 0 };
    }

    // Filter by source
    if (source) {
      where.source = source as TransactionSource;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [transactions, total] = await Promise.all([
      this.prisma.pointTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      this.prisma.pointTransaction.count({ where }),
    ]);

    return {
      data: transactions.map((tx) => ({
        id: tx.id,
        type: tx.amount > 0 ? 'credit' : 'debit',
        amount: Math.abs(tx.amount),
        balanceAfter: tx.balance,
        source: tx.source,
        sourceId: tx.sourceId,
        description: tx.description,
        metadata: tx.metadata,
        createdAt: tx.createdAt,
      })),
      meta: {
        currentPage: page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        totalCount: total,
      },
    };
  }

  async getSummary(userId: string, period: SummaryPeriod) {
    const { startDate, endDate } = this.getPeriodDates(period);

    const transactions = await this.prisma.pointTransaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    let earned = 0;
    let spent = 0;
    const bySource: Record<string, number> = {};
    const byDestination: Record<string, number> = {};

    for (const tx of transactions) {
      if (tx.amount > 0) {
        earned += tx.amount;
        bySource[tx.source] = (bySource[tx.source] || 0) + tx.amount;
      } else {
        spent += Math.abs(tx.amount);
        byDestination[tx.source] = (byDestination[tx.source] || 0) + Math.abs(tx.amount);
      }
    }

    return {
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      earned,
      spent,
      net: earned - spent,
      bySource,
      byDestination,
    };
  }

  // ==========================================
  // TRANSFER
  // ==========================================

  async transferPoints(
    fromUserId: string,
    toUserId: string,
    amount: number,
    message?: string,
  ) {
    if (fromUserId === toUserId) {
      throw new BadRequestException('Não é possível transferir para si mesmo');
    }

    if (amount <= 0) {
      throw new BadRequestException('Quantidade deve ser maior que zero');
    }

    // Get recipient info
    const recipient = await this.prisma.user.findUnique({
      where: { id: toUserId },
      select: { id: true, name: true, avatarUrl: true },
    });

    if (!recipient) {
      throw new NotFoundException('Destinatário não encontrado');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Debit from sender
      const senderPoints = await tx.userPoints.findUnique({
        where: { userId: fromUserId },
      });

      if (!senderPoints || senderPoints.balance < amount) {
        throw new BadRequestException('Saldo insuficiente');
      }

      const senderNewBalance = senderPoints.balance - amount;

      await tx.userPoints.update({
        where: { userId: fromUserId },
        data: {
          balance: senderNewBalance,
          lifetimeSpent: { increment: amount },
        },
      });

      // Credit to receiver
      let receiverPoints = await tx.userPoints.findUnique({
        where: { userId: toUserId },
      });

      if (!receiverPoints) {
        receiverPoints = await tx.userPoints.create({
          data: { userId: toUserId },
        });
      }

      const receiverNewBalance = receiverPoints.balance + amount;

      await tx.userPoints.update({
        where: { userId: toUserId },
        data: {
          balance: receiverNewBalance,
          lifetimeEarned: { increment: amount },
        },
      });

      // Create transaction records
      const senderTx = await tx.pointTransaction.create({
        data: {
          userId: fromUserId,
          amount: -amount,
          balance: senderNewBalance,
          source: 'TRANSFER_OUT',
          description: message || `Transferência para ${recipient.name}`,
          relatedUserId: toUserId,
          metadata: { recipientName: recipient.name },
        },
      });

      await tx.pointTransaction.create({
        data: {
          userId: toUserId,
          amount,
          balance: receiverNewBalance,
          source: 'TRANSFER_IN',
          description: message || 'Transferência recebida',
          relatedUserId: fromUserId,
        },
      });

      // Update recent recipients
      await tx.transferRecipient.upsert({
        where: {
          userId_recipientId: {
            userId: fromUserId,
            recipientId: toUserId,
          },
        },
        create: {
          userId: fromUserId,
          recipientId: toUserId,
          lastTransferAt: new Date(),
          transferCount: 1,
        },
        update: {
          lastTransferAt: new Date(),
          transferCount: { increment: 1 },
        },
      });

      return {
        transactionId: senderTx.id,
        amount,
        recipient: {
          id: recipient.id,
          name: recipient.name,
          avatar: recipient.avatarUrl,
        },
        senderBalanceAfter: senderNewBalance,
        createdAt: senderTx.createdAt,
      };
    });

    return result;
  }

  async getRecentRecipients(userId: string, limit: number = 5) {
    const recipients = await this.prisma.transferRecipient.findMany({
      where: { userId },
      orderBy: { lastTransferAt: 'desc' },
      take: limit,
      select: {
        recipientId: true,
        lastTransferAt: true,
      },
    });

    if (recipients.length === 0) {
      return [];
    }

    const users = await this.prisma.user.findMany({
      where: {
        id: { in: recipients.map((r) => r.recipientId) },
      },
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
        userId: r.recipientId,
        name: user?.name || 'Usuário',
        avatar: user?.avatarUrl,
        lastTransferAt: r.lastTransferAt,
      };
    });
  }

  async searchUsersForTransfer(
    currentUserId: string,
    query: string,
    limit: number = 10,
  ) {
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        name: { contains: query, mode: 'insensitive' },
        status: 'ACTIVE',
      },
      take: limit,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return users.map((u) => ({
      userId: u.id,
      name: u.name,
      avatar: u.avatarUrl,
      memberSince: u.createdAt.toISOString().split('T')[0],
    }));
  }

  // ==========================================
  // CREDIT/DEBIT (internal use)
  // ==========================================

  async creditPoints(
    userId: string,
    amount: number,
    source: TransactionSource,
    description?: string,
    metadata?: Prisma.InputJsonValue,
    sourceId?: string,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Quantidade deve ser maior que zero');
    }

    return this.prisma.$transaction(async (tx) => {
      let userPoints = await tx.userPoints.findUnique({ where: { userId } });

      if (!userPoints) {
        userPoints = await tx.userPoints.create({ data: { userId } });
      }

      const newBalance = userPoints.balance + amount;

      await tx.userPoints.update({
        where: { userId },
        data: {
          balance: newBalance,
          lifetimeEarned: { increment: amount },
        },
      });

      const transaction = await tx.pointTransaction.create({
        data: {
          userId,
          amount,
          balance: newBalance,
          source,
          sourceId,
          description,
          metadata: metadata || undefined,
        },
      });

      return transaction;
    });
  }

  async debitPoints(
    userId: string,
    amount: number,
    source: TransactionSource,
    description?: string,
    metadata?: Prisma.InputJsonValue,
    sourceId?: string,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Quantidade deve ser maior que zero');
    }

    return this.prisma.$transaction(async (tx) => {
      const userPoints = await tx.userPoints.findUnique({ where: { userId } });

      if (!userPoints) {
        throw new NotFoundException('Usuário não possui saldo de pontos');
      }

      if (userPoints.balance < amount) {
        throw new BadRequestException('Saldo insuficiente');
      }

      const newBalance = userPoints.balance - amount;

      await tx.userPoints.update({
        where: { userId },
        data: {
          balance: newBalance,
          lifetimeSpent: { increment: amount },
        },
      });

      const transaction = await tx.pointTransaction.create({
        data: {
          userId,
          amount: -amount,
          balance: newBalance,
          source,
          sourceId,
          description,
          metadata: metadata || undefined,
        },
      });

      return transaction;
    });
  }

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  async adminGrantPoints(
    adminId: string,
    userId: string,
    amount: number,
    reason: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const transaction = await this.creditPoints(
      userId,
      amount,
      'ADMIN_CREDIT',
      reason,
      { grantedBy: adminId },
    );

    const points = await this.prisma.userPoints.findUnique({
      where: { userId },
    });

    return {
      transactionId: transaction.id,
      userId,
      userName: user.name,
      amount,
      newBalance: points?.balance || 0,
      reason,
      grantedBy: adminId,
      createdAt: transaction.createdAt,
    };
  }

  async adminDeductPoints(
    adminId: string,
    userId: string,
    amount: number,
    reason: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const transaction = await this.debitPoints(
      userId,
      amount,
      'ADMIN_DEBIT',
      reason,
      { deductedBy: adminId },
    );

    const points = await this.prisma.userPoints.findUnique({
      where: { userId },
    });

    return {
      transactionId: transaction.id,
      userId,
      userName: user.name,
      amount,
      newBalance: points?.balance || 0,
      reason,
      deductedBy: adminId,
      createdAt: transaction.createdAt,
    };
  }

  async adminRefundTransaction(
    adminId: string,
    transactionId: string,
    reason: string,
  ) {
    const originalTx = await this.prisma.pointTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!originalTx) {
      throw new NotFoundException('Transação não encontrada');
    }

    // Check if already refunded
    const existingRefund = await this.prisma.pointTransaction.findFirst({
      where: { refundedTransactionId: transactionId },
    });

    if (existingRefund) {
      throw new BadRequestException('Transação já foi estornada');
    }

    const refundAmount = originalTx.amount;

    return this.prisma.$transaction(async (tx) => {
      const userPoints = await tx.userPoints.findUnique({
        where: { userId: originalTx.userId },
      });

      if (!userPoints) {
        throw new NotFoundException('Usuário não possui registro de pontos');
      }

      // If original was credit (positive), refund is debit (negative)
      // If original was debit (negative), refund is credit (positive)
      const newBalance = userPoints.balance - refundAmount;

      // Validate balance for credit refunds (debit the user)
      if (refundAmount > 0 && newBalance < 0) {
        throw new BadRequestException(
          'Saldo insuficiente para realizar o estorno',
        );
      }

      await tx.userPoints.update({
        where: { userId: originalTx.userId },
        data: {
          balance: newBalance,
          lifetimeEarned:
            refundAmount > 0
              ? { decrement: refundAmount }
              : { increment: Math.abs(refundAmount) },
          lifetimeSpent:
            refundAmount < 0
              ? { decrement: Math.abs(refundAmount) }
              : { increment: refundAmount },
        },
      });

      const refundTx = await tx.pointTransaction.create({
        data: {
          userId: originalTx.userId,
          amount: -refundAmount,
          balance: newBalance,
          source: 'REFUND',
          description: reason,
          refundedTransactionId: transactionId,
          metadata: { refundedBy: adminId, originalSource: originalTx.source },
        },
      });

      return {
        refundTransactionId: refundTx.id,
        originalTransactionId: transactionId,
        amount: Math.abs(refundAmount),
        userId: originalTx.userId,
        newBalance,
        reason,
        refundedBy: adminId,
        createdAt: refundTx.createdAt,
      };
    });
  }

  async getConfig(associationId: string) {
    const config = await this.prisma.pointsConfig.findUnique({
      where: { associationId },
    });

    if (!config) {
      // Return defaults
      return {
        sources: [
          {
            type: 'EVENT_CHECKIN',
            label: 'Check-in em eventos',
            defaultPoints: 50,
            isActive: true,
          },
          {
            type: 'STRAVA_ACTIVITY',
            label: 'Strava - Corrida',
            pointsPerKm: 10,
            isActive: true,
          },
          {
            type: 'DAILY_POST',
            label: 'Primeiro post do dia',
            points: 5,
            isActive: true,
          },
        ],
        strava: {
          dailyLimitKm: 5.0,
          eligibleActivities: ['Run', 'Ride', 'Walk', 'Swim', 'Hike'],
        },
        pointsToMoneyRate: 0.5,
      };
    }

    return {
      sources: [
        {
          type: 'EVENT_CHECKIN',
          label: 'Check-in em eventos',
          defaultPoints: config.checkInPoints,
          isActive: true,
        },
        {
          type: 'STRAVA_RUN',
          label: 'Strava - Corrida',
          pointsPerKm: config.stravaRunPointsPerKm,
          isActive: config.stravaEnabled,
        },
        {
          type: 'STRAVA_RIDE',
          label: 'Strava - Ciclismo',
          pointsPerKm: config.stravaRidePointsPerKm,
          isActive: config.stravaEnabled,
        },
        {
          type: 'STRAVA_WALK',
          label: 'Strava - Caminhada',
          pointsPerKm: config.stravaWalkPointsPerKm,
          isActive: config.stravaEnabled,
        },
        {
          type: 'DAILY_POST',
          label: 'Primeiro post do dia',
          points: config.dailyPostPoints,
          isActive: config.dailyPostEnabled,
        },
      ],
      strava: {
        dailyLimitKm: config.stravaDailyLimitKm,
        eligibleActivities: config.stravaEligibleTypes,
      },
      pointsToMoneyRate: config.pointsToMoneyRate,
      updatedAt: config.updatedAt,
    };
  }

  async updateConfig(associationId: string, updates: Partial<{
    checkInPoints: number;
    dailyPostPoints: number;
    stravaRunPointsPerKm: number;
    stravaRidePointsPerKm: number;
    stravaDailyLimitKm: number;
    stravaEligibleTypes: string[];
    stravaEnabled: boolean;
    dailyPostEnabled: boolean;
    pointsToMoneyRate: number;
  }>) {
    const config = await this.prisma.pointsConfig.upsert({
      where: { associationId },
      create: {
        associationId,
        ...updates,
      },
      update: updates,
    });

    return {
      updated: true,
      message: 'Configurações atualizadas com sucesso',
    };
  }

  async getReports(associationId: string, period: ReportPeriod) {
    const { startDate, endDate } = this.getPeriodDates(period as unknown as SummaryPeriod);

    // Get all users in association
    const users = await this.prisma.user.findMany({
      where: { associationId },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);

    // Get all transactions in period
    const transactions = await this.prisma.pointTransaction.findMany({
      where: {
        userId: { in: userIds },
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Calculate totals
    let totalEarned = 0;
    let totalSpent = 0;
    const bySource: Record<string, { total: number; count: number }> = {};
    const byDestination: Record<string, { total: number; count: number }> = {};
    const userEarnings: Record<string, { id: string; name: string; earned: number }> = {};

    for (const tx of transactions) {
      if (tx.amount > 0) {
        totalEarned += tx.amount;
        if (!bySource[tx.source]) {
          bySource[tx.source] = { total: 0, count: 0 };
        }
        bySource[tx.source].total += tx.amount;
        bySource[tx.source].count++;

        // Track user earnings
        if (!userEarnings[tx.userId]) {
          userEarnings[tx.userId] = { id: tx.userId, name: tx.user.name, earned: 0 };
        }
        userEarnings[tx.userId].earned += tx.amount;
      } else {
        totalSpent += Math.abs(tx.amount);
        if (!byDestination[tx.source]) {
          byDestination[tx.source] = { total: 0, count: 0 };
        }
        byDestination[tx.source].total += Math.abs(tx.amount);
        byDestination[tx.source].count++;
      }
    }

    // Get total in circulation
    const pointsSum = await this.prisma.userPoints.aggregate({
      where: { userId: { in: userIds } },
      _sum: { balance: true },
      _count: { _all: true },
    });

    // Top earners
    const topEarners = Object.values(userEarnings)
      .sort((a, b) => b.earned - a.earned)
      .slice(0, 10);

    return {
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      summary: {
        totalInCirculation: pointsSum._sum.balance || 0,
        totalEarned,
        totalSpent,
        totalUsersWithBalance: pointsSum._count._all,
        totalTransactions: transactions.length,
      },
      bySource: Object.entries(bySource).map(([source, data]) => ({
        source,
        total: data.total,
        count: data.count,
      })),
      byDestination: Object.entries(byDestination).map(([destination, data]) => ({
        destination,
        total: data.total,
        count: data.count,
      })),
      topEarners,
    };
  }

  // ==========================================
  // HELPERS
  // ==========================================

  private getPeriodDates(period: SummaryPeriod): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

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
