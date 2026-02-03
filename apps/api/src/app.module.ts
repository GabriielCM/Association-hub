import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PointsModule } from './modules/points/points.module';
import { RankingsModule } from './modules/rankings/rankings.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '../../.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PointsModule,
    RankingsModule,
    SubscriptionsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
