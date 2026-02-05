import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PointsModule } from '../points/points.module';
import { StripeModule } from '../stripe/stripe.module';
import { OrdersModule } from '../orders/orders.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PdvService } from './pdv.service';
import { PdvCheckoutService } from './pdv-checkout.service';
import { PdvApiKeyGuard } from './guards/pdv-api-key.guard';
import { PdvDisplayController } from './controllers/pdv-display.controller';
import { PdvWalletController } from './controllers/pdv-wallet.controller';
import { PdvAdminController } from './controllers/pdv-admin.controller';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => PointsModule),
    forwardRef(() => StripeModule),
    forwardRef(() => OrdersModule),
    NotificationsModule,
  ],
  controllers: [PdvDisplayController, PdvWalletController, PdvAdminController],
  providers: [PdvService, PdvCheckoutService, PdvApiKeyGuard],
  exports: [PdvService, PdvCheckoutService],
})
export class PdvModule {}
