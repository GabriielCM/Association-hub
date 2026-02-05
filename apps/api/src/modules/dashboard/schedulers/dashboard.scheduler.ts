import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class DashboardScheduler {
  private readonly logger = new Logger(DashboardScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Clean up expired stories - runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredStories(): Promise<void> {
    this.logger.debug('Running story cleanup task...');

    const now = new Date();

    const result = await this.prisma.story.deleteMany({
      where: { expiresAt: { lte: now } },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned up ${result.count} expired stories`);
    }
  }

  /**
   * Close polls at deadline - runs every 5 minutes
   */
  @Cron('*/5 * * * *')
  async closePollsAtDeadline(): Promise<void> {
    this.logger.debug('Checking polls at deadline...');

    const now = new Date();

    // Find polls that have reached their deadline but haven't been closed
    const pollsToClose = await this.prisma.poll.findMany({
      where: {
        endsAt: { lte: now },
        endedAt: null,
      },
      include: {
        post: {
          select: { authorId: true },
        },
      },
    });

    if (pollsToClose.length === 0) {
      return;
    }

    // Close each poll and notify author
    for (const poll of pollsToClose) {
      await this.prisma.poll.update({
        where: { id: poll.id },
        data: { endedAt: now },
      });

      // Notify poll author
      await this.notificationsService.create({
        userId: poll.post.authorId,
        type: 'POLL_ENDED',
        category: 'SOCIAL',
        title: 'Enquete encerrada',
        body: `Sua enquete "${poll.question.slice(0, 50)}..." foi encerrada`,
        data: { pollId: poll.id, postId: poll.postId },
        actionUrl: `/posts/${poll.postId}`,
      });
    }

    this.logger.log(`Closed ${pollsToClose.length} polls at deadline`);
  }

  /**
   * Lift expired suspensions - runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async liftExpiredSuspensions(): Promise<void> {
    this.logger.debug('Checking expired suspensions...');

    const now = new Date();

    // Find suspensions that have ended
    const expiredSuspensions = await this.prisma.userSuspension.findMany({
      where: {
        endsAt: { lte: now },
        liftedAt: null,
      },
    });

    if (expiredSuspensions.length === 0) {
      return;
    }

    // Mark them as lifted (automatically)
    await this.prisma.userSuspension.updateMany({
      where: {
        id: { in: expiredSuspensions.map((s) => s.id) },
      },
      data: {
        liftedAt: now,
        liftedById: 'SYSTEM', // Mark as system-lifted
      },
    });

    this.logger.log(
      `Lifted ${expiredSuspensions.length} expired suspensions`,
    );
  }

  /**
   * Clean up old daily post trackers - runs daily at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldTrackers(): Promise<void> {
    this.logger.debug('Cleaning up old daily post trackers...');

    // Delete trackers older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await this.prisma.dailyPostTracker.deleteMany({
      where: { date: { lt: sevenDaysAgo } },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned up ${result.count} old daily post trackers`);
    }
  }
}
