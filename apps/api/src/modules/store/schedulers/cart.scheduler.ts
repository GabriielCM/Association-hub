import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CartService } from '../services/cart.service';

@Injectable()
export class CartScheduler {
  private readonly logger = new Logger(CartScheduler.name);

  constructor(private readonly cartService: CartService) {}

  /**
   * Expire stock reservations every 5 minutes
   * - Releases reserved stock for carts that exceeded the 30-minute reservation window
   * - Allows other users to purchase the items
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpireReservations() {
    this.logger.debug('Running job: expireReservations');
    try {
      const count = await this.cartService.expireReservations();
      if (count > 0) {
        this.logger.log(`Released ${count} expired cart reservations`);
      }
    } catch (error) {
      this.logger.error('Error expiring cart reservations', error);
    }
  }
}
