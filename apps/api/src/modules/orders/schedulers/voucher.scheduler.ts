import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { VouchersService } from '../vouchers.service';

@Injectable()
export class VoucherScheduler {
  private readonly logger = new Logger(VoucherScheduler.name);

  constructor(private readonly vouchersService: VouchersService) {}

  /**
   * Send voucher expiration warnings daily at 8am
   * - Notifies users 7 days before their vouchers expire
   * - Prevents spam by running only once per day
   */
  @Cron('0 8 * * *')
  async handleSendExpirationWarnings() {
    this.logger.log('Running job: sendExpirationWarnings');
    try {
      const count = await this.vouchersService.sendExpirationWarnings();
      this.logger.log(`Sent ${count} voucher expiration warnings`);
    } catch (error) {
      this.logger.error('Error sending voucher expiration warnings', error);
    }
  }
}
