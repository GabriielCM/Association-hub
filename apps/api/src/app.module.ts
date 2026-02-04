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
  ],
  controllers: [HealthController],
})
export class AppModule {}
