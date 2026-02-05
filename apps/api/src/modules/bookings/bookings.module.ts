import { Module, forwardRef } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { AdminBookingsController } from './admin-bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsScheduler } from './bookings.scheduler';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { SpacesModule } from '../spaces/spaces.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => SpacesModule),
    NotificationsModule,
  ],
  controllers: [BookingsController, AdminBookingsController],
  providers: [BookingsService, BookingsScheduler],
  exports: [BookingsService],
})
export class BookingsModule {}
