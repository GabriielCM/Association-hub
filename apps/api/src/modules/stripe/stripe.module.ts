import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeWebhookController } from './stripe.webhook.controller';
import { PdvModule } from '../pdv/pdv.module';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => PdvModule),
    forwardRef(() => StoreModule),
  ],
  controllers: [StripeWebhookController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
