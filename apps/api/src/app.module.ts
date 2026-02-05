import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PointsModule } from './modules/points/points.module';
import { RankingsModule } from './modules/rankings/rankings.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ProfileModule } from './modules/profile/profile.module';
import { CardModule } from './modules/card/card.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { EventsModule } from './modules/events/events.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MessagesModule } from './modules/messages/messages.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PdvModule } from './modules/pdv/pdv.module';
import { StoreModule } from './modules/store/store.module';
import { SpacesModule } from './modules/spaces/spaces.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '../../.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    // Phase 1 - Core
    PointsModule,
    RankingsModule,
    SubscriptionsModule,
    // Phase 2 - Identity
    ProfileModule,
    CardModule,
    WalletModule,
    // Phase 3 - Engagement
    EventsModule,
    // Phase 4 - Communication
    NotificationsModule,
    MessagesModule,
    // Phase 5 - Transactions
    StripeModule,
    OrdersModule,
    PdvModule,
    StoreModule,
    // Phase 6 - Locations
    SpacesModule,
    BookingsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
