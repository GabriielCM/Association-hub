import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PointsModule } from '../points/points.module';
import { StripeModule } from '../stripe/stripe.module';
import { OrdersModule } from '../orders/orders.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PdvService } from './pdv.service';
import { PdvCheckoutService } from './pdv-checkout.service';
import { PdvApiKeyGuard } from './guards/pdv-api-key.guard';
import { PdvGateway } from './pdv.gateway';
import { PdvScheduler } from './pdv.scheduler';
import { PdvDisplayController } from './controllers/pdv-display.controller';
import { PdvWalletController } from './controllers/pdv-wallet.controller';
import { PdvAdminController } from './controllers/pdv-admin.controller';
import { PdvReportsController } from './controllers/pdv-reports.controller';
import { PdvReportsService } from './pdv-reports.service';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => PointsModule),
    forwardRef(() => StripeModule),
    forwardRef(() => OrdersModule),
    NotificationsModule,
  ],
  controllers: [PdvDisplayController, PdvWalletController, PdvAdminController, PdvReportsController],
  providers: [PdvService, PdvCheckoutService, PdvReportsService, PdvApiKeyGuard, PdvGateway, PdvScheduler],
  exports: [PdvService, PdvCheckoutService, PdvGateway],
})
export class PdvModule {}
