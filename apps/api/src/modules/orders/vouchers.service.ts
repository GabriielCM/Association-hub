import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, NotificationCategory } from '@prisma/client';

@Injectable()
export class VouchersService {
  private readonly logger = new Logger(VouchersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Get voucher by code
   */
  async getVoucherByCode(voucherCode: string) {
    const voucher = await this.prisma.orderItem.findFirst({
      where: {
        voucherCode,
        type: 'VOUCHER',
      },
      include: {
        order: {
          select: {
            id: true,
            code: true,
            userId: true,
            status: true,
          },
        },
      },
    });

    if (!voucher) {
      throw new NotFoundException('Voucher não encontrado');
    }

    return voucher;
  }

  /**
   * Validate voucher for use
   */
  async validateVoucher(voucherCode: string) {
    const voucher = await this.getVoucherByCode(voucherCode);

    // Check if order is valid
    if (voucher.order.status === 'CANCELLED') {
      return {
        valid: false,
        reason: 'Pedido cancelado',
        voucher,
      };
    }

    // Check if already used
    if (voucher.voucherUsed) {
      return {
        valid: false,
        reason: 'Voucher já utilizado',
        usedAt: voucher.voucherUsedAt,
        voucher,
      };
    }

    // Check expiration
    if (voucher.voucherExpiresAt && new Date() > voucher.voucherExpiresAt) {
      return {
        valid: false,
        reason: 'Voucher expirado',
        expiredAt: voucher.voucherExpiresAt,
        voucher,
      };
    }

    return {
      valid: true,
      voucher,
    };
  }

  /**
   * Mark voucher as used
   */
  async markVoucherAsUsed(voucherCode: string, usedBy?: string) {
    const validation = await this.validateVoucher(voucherCode);

    if (!validation.valid) {
      throw new BadRequestException(validation.reason);
    }

    const voucher = validation.voucher;

    // Update voucher
    const updatedItem = await this.prisma.orderItem.update({
      where: { id: voucher.id },
      data: {
        voucherUsed: true,
        voucherUsedAt: new Date(),
      },
    });

    this.logger.log(`Voucher ${voucherCode} marked as used by ${usedBy || 'unknown'}`);

    // Notify user
    await this.notificationsService.create({
      userId: voucher.order.userId,
      type: NotificationType.ADMIN_ANNOUNCEMENT,
      category: NotificationCategory.SYSTEM,
      title: 'Voucher Utilizado',
      body: `Seu voucher para "${voucher.productName}" foi utilizado.`,
      data: { voucherCode, orderId: voucher.orderId },
    });

    return updatedItem;
  }

  /**
   * Get user's vouchers
   */
  async getUserVouchers(userId: string, options?: { includeUsed?: boolean; includeExpired?: boolean }) {
    const { includeUsed = false, includeExpired = false } = options || {};

    const where: any = {
      type: 'VOUCHER',
      order: {
        userId,
        status: { not: 'CANCELLED' },
      },
    };

    if (!includeUsed) {
      where.voucherUsed = false;
    }

    if (!includeExpired) {
      where.OR = [
        { voucherExpiresAt: null },
        { voucherExpiresAt: { gt: new Date() } },
      ];
    }

    const vouchers = await this.prisma.orderItem.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            code: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return vouchers.map((v) => ({
      id: v.id,
      productName: v.productName,
      productImage: v.productImage,
      voucherCode: v.voucherCode,
      isUsed: v.voucherUsed,
      usedAt: v.voucherUsedAt,
      expiresAt: v.voucherExpiresAt,
      isExpired: v.voucherExpiresAt ? new Date() > v.voucherExpiresAt : false,
      order: v.order,
    }));
  }

  /**
   * Get vouchers expiring soon (for notifications)
   */
  async getVouchersExpiringSoon(daysBeforeExpiration: number = 7) {
    const expirationThreshold = new Date();
    expirationThreshold.setDate(expirationThreshold.getDate() + daysBeforeExpiration);

    const vouchers = await this.prisma.orderItem.findMany({
      where: {
        type: 'VOUCHER',
        voucherUsed: false,
        voucherExpiresAt: {
          not: null,
          lte: expirationThreshold,
          gt: new Date(),
        },
        order: {
          status: { not: 'CANCELLED' },
        },
      },
      include: {
        order: {
          select: {
            userId: true,
            code: true,
          },
        },
      },
    });

    return vouchers;
  }

  /**
   * Send expiration warning notifications
   * Uses groupKey to prevent duplicate notifications within 24 hours
   */
  async sendExpirationWarnings(): Promise<{ total: number; sent: number; skipped: number }> {
    const vouchers = await this.getVouchersExpiringSoon(7);

    if (vouchers.length === 0) {
      this.logger.log('No vouchers expiring soon');
      return { total: 0, sent: 0, skipped: 0 };
    }

    // Get voucher codes that were already notified in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentlyNotifiedGroupKeys = await this.getRecentlyNotifiedVouchers(twentyFourHoursAgo);

    let sentCount = 0;
    let skippedCount = 0;

    for (const voucher of vouchers) {
      const groupKey = `voucher-expiration:${voucher.voucherCode}`;

      // Skip if already notified in the last 24 hours
      if (recentlyNotifiedGroupKeys.has(groupKey)) {
        this.logger.debug(`Skipping notification for ${voucher.voucherCode} - already notified`);
        skippedCount++;
        continue;
      }

      const daysUntilExpiration = Math.ceil(
        (voucher.voucherExpiresAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );

      await this.notificationsService.create({
        userId: voucher.order.userId,
        type: NotificationType.ADMIN_ANNOUNCEMENT,
        category: NotificationCategory.SYSTEM,
        title: 'Voucher Expirando',
        body: `Seu voucher "${voucher.productName}" expira em ${daysUntilExpiration} dia(s)!`,
        data: {
          voucherCode: voucher.voucherCode,
          orderId: voucher.orderId,
          expiresAt: voucher.voucherExpiresAt,
        },
        groupKey,
      });

      sentCount++;
    }

    this.logger.log(
      `Voucher expiration warnings: ${sentCount} sent, ${skippedCount} skipped (already notified)`,
    );

    return { total: vouchers.length, sent: sentCount, skipped: skippedCount };
  }

  /**
   * Get voucher codes that have been notified recently (within cutoff time)
   * Returns a Set of groupKeys for efficient lookup
   */
  private async getRecentlyNotifiedVouchers(cutoffTime: Date): Promise<Set<string>> {
    const recentNotifications = await this.prisma.notification.findMany({
      where: {
        groupKey: {
          startsWith: 'voucher-expiration:',
        },
        createdAt: {
          gte: cutoffTime,
        },
      },
      select: {
        groupKey: true,
      },
      distinct: ['groupKey'],
    });

    return new Set(
      recentNotifications
        .map((n) => n.groupKey)
        .filter((key): key is string => key !== null),
    );
  }
}
