import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PointsService } from './points.service';
import { PointsController, AdminPointsController } from './points.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PointsController, AdminPointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
