import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PointsModule } from '../points/points.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StripeModule } from '../stripe/stripe.module';
import { OrdersService } from './orders.service';
import { VouchersService } from './vouchers.service';
import { OrdersReportsService } from './orders-reports.service';
import { VoucherScheduler } from './schedulers/voucher.scheduler';
import { OrdersController } from './controllers/orders.controller';
import { OrdersAdminController } from './controllers/orders-admin.controller';
import { OrdersReportsController } from './controllers/orders-reports.controller';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => PointsModule),
    NotificationsModule,
    forwardRef(() => StripeModule),
  ],
  controllers: [OrdersController, OrdersAdminController, OrdersReportsController],
  providers: [OrdersService, VouchersService, OrdersReportsService, VoucherScheduler],
  exports: [OrdersService, VouchersService],
})
export class OrdersModule {}
