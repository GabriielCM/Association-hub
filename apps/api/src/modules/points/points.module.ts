import { Module } from '@nestjs/common';
import { PointsService } from './points.service';
import { PointsController, AdminPointsController } from './points.controller';

@Module({
  controllers: [PointsController, AdminPointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
