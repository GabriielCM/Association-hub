import { Module, forwardRef } from '@nestjs/common';
import { EventsController } from './events.controller';
import { AdminEventsController } from './admin-events.controller';
import { DisplayController } from './display.controller';
import { EventsService } from './events.service';
import { DisplayService } from './display.service';
import { EventsGateway } from './events.gateway';
import { EventsScheduler } from './events.scheduler';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PointsModule } from '../points/points.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => PointsModule),
    forwardRef(() => SubscriptionsModule),
    NotificationsModule,
  ],
  controllers: [
    EventsController,
    AdminEventsController,
    DisplayController,
  ],
  providers: [
    EventsService,
    DisplayService,
    EventsGateway,
    EventsScheduler,
  ],
  exports: [EventsService, DisplayService, EventsGateway],
})
export class EventsModule {}
