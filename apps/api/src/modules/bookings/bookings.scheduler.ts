import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingsService } from './bookings.service';

@Injectable()
export class BookingsScheduler {
  private readonly logger = new Logger(BookingsScheduler.name);

  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * Expire pending bookings daily at midnight
   * - Marks bookings as EXPIRED if the date has passed without approval
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpirePendingBookings() {
    this.logger.log('Running job: expirePendingBookings');
    try {
      const count = await this.bookingsService.expirePendingBookings();
      this.logger.log(`Expired ${count} pending bookings`);
    } catch (error) {
      this.logger.error('Error expiring pending bookings', error);
    }
  }

  /**
   * Complete passed bookings daily at midnight
   * - Marks approved bookings as COMPLETED if the date has passed
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCompletePassedBookings() {
    this.logger.log('Running job: completePassedBookings');
    try {
      const count = await this.bookingsService.completePassedBookings();
      this.logger.log(`Completed ${count} bookings`);
    } catch (error) {
      this.logger.error('Error completing passed bookings', error);
    }
  }

  /**
   * Process waitlist notifications every 5 minutes
   * - Expires entries that didn't respond in time
   * - Notifies next person in line
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleProcessWaitlist() {
    this.logger.debug('Running job: processWaitlist');
    try {
      const count = await this.bookingsService.expireWaitlistEntries();
      if (count > 0) {
        this.logger.log(`Processed ${count} expired waitlist entries`);
      }
    } catch (error) {
      this.logger.error('Error processing waitlist', error);
    }
  }
}
