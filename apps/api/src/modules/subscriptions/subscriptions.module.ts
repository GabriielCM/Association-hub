import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import {
  SubscriptionsController,
  AdminSubscriptionsController,
} from './subscriptions.controller';

@Module({
  controllers: [SubscriptionsController, AdminSubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
