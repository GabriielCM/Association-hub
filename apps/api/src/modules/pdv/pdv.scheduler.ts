import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PdvGateway, CheckoutEventPayload } from './pdv.gateway';
import { PdvCheckoutStatus } from '@prisma/client';

@Injectable()
export class PdvScheduler {
  private readonly logger = new Logger(PdvScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdvGateway: PdvGateway,
  ) {}

  /**
   * Expire stale PDV checkouts every minute
   * - Finds PENDING checkouts that are past their expiration time (5-minute timeout)
   * - Updates status to EXPIRED
   * - Emits checkout:expired WebSocket event to PDV displays
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpireCheckouts() {
    this.logger.log('Running job: expireCheckouts');
    try {
      const now = new Date();

      // Find all pending checkouts that have expired
      const expiredCheckouts = await this.prisma.pdvCheckout.findMany({
        where: {
          status: PdvCheckoutStatus.PENDING,
          expiresAt: { lt: now },
        },
        select: {
          id: true,
          code: true,
          pdvId: true,
          totalPoints: true,
          totalMoney: true,
          expiresAt: true,
        },
      });

      if (expiredCheckouts.length === 0) {
        this.logger.debug('No expired checkouts to process');
        return;
      }

      // Update all expired checkouts in a single batch operation
      await this.prisma.pdvCheckout.updateMany({
        where: {
          id: { in: expiredCheckouts.map((c) => c.id) },
        },
        data: {
          status: PdvCheckoutStatus.EXPIRED,
        },
      });

      // Emit WebSocket events for each expired checkout
      // The pdvId serves as the deviceId for room-based broadcasting
      for (const checkout of expiredCheckouts) {
        const payload: CheckoutEventPayload = {
          code: checkout.code,
          status: PdvCheckoutStatus.EXPIRED,
          totalPoints: checkout.totalPoints,
          totalMoney: Number(checkout.totalMoney),
          expiresAt: checkout.expiresAt,
        };

        this.pdvGateway.broadcastCheckoutExpired(checkout.pdvId, payload);
      }

      this.logger.log(`Expired ${expiredCheckouts.length} stale checkouts`);
    } catch (error) {
      this.logger.error('Error expiring checkouts', error);
    }
  }

  /**
   * Cleanup expired AWAITING_PIX checkouts every 5 minutes
   * - PIX payments have a longer timeout but still need cleanup
   * - Finds AWAITING_PIX checkouts where pixExpiresAt has passed
   * - Updates status to EXPIRED
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpirePixCheckouts() {
    this.logger.debug('Running job: expirePixCheckouts');
    try {
      const now = new Date();

      // Find AWAITING_PIX checkouts where PIX payment window has expired
      const expiredPixCheckouts = await this.prisma.pdvCheckout.findMany({
        where: {
          status: PdvCheckoutStatus.AWAITING_PIX,
          pixExpiresAt: { lt: now },
        },
        select: {
          id: true,
          code: true,
          pdvId: true,
          totalPoints: true,
          totalMoney: true,
          expiresAt: true,
        },
      });

      if (expiredPixCheckouts.length === 0) {
        return;
      }

      // Update all expired PIX checkouts
      await this.prisma.pdvCheckout.updateMany({
        where: {
          id: { in: expiredPixCheckouts.map((c) => c.id) },
        },
        data: {
          status: PdvCheckoutStatus.EXPIRED,
        },
      });

      // Emit WebSocket events for each expired checkout
      for (const checkout of expiredPixCheckouts) {
        const payload: CheckoutEventPayload = {
          code: checkout.code,
          status: PdvCheckoutStatus.EXPIRED,
          totalPoints: checkout.totalPoints,
          totalMoney: Number(checkout.totalMoney),
          expiresAt: checkout.expiresAt,
        };

        this.pdvGateway.broadcastCheckoutExpired(checkout.pdvId, payload);
      }

      this.logger.log(`Expired ${expiredPixCheckouts.length} stale PIX checkouts`);
    } catch (error) {
      this.logger.error('Error expiring PIX checkouts', error);
    }
  }
}
