import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { SubscriptionsService } from './subscriptions.service';
import {
  SubscriptionsController,
  AdminSubscriptionsController,
} from './subscriptions.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionsController, AdminSubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
