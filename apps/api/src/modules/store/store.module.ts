import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PointsModule } from '../points/points.module';
import { StripeModule } from '../stripe/stripe.module';
import { OrdersModule } from '../orders/orders.module';
import { NotificationsModule } from '../notifications/notifications.module';

// Services
import { CategoriesService } from './services/categories.service';
import { ProductsService } from './services/products.service';
import { CartService } from './services/cart.service';
import { CheckoutService } from './services/checkout.service';
import { FavoritesService } from './services/favorites.service';
import { ReviewsService } from './services/reviews.service';
import { StoreReportsService } from './services/reports.service';
import { UploadService } from '../../common/services/upload.service';

// Controllers
import { StoreController } from './controllers/store.controller';
import { StoreUserController } from './controllers/store-user.controller';
import { StoreAdminController } from './controllers/store-admin.controller';
import { StoreReportsController } from './controllers/store-reports.controller';

// Schedulers
import { CartScheduler } from './schedulers/cart.scheduler';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => PointsModule),
    forwardRef(() => StripeModule),
    forwardRef(() => OrdersModule),
    NotificationsModule,
  ],
  controllers: [StoreController, StoreUserController, StoreAdminController, StoreReportsController],
  providers: [
    CategoriesService,
    ProductsService,
    CartService,
    CheckoutService,
    FavoritesService,
    ReviewsService,
    StoreReportsService,
    UploadService,
    CartScheduler,
  ],
  exports: [
    CategoriesService,
    ProductsService,
    CartService,
    CheckoutService,
    FavoritesService,
    ReviewsService,
  ],
})
export class StoreModule {}
