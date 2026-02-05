import { Module } from '@nestjs/common';
import { SpacesController } from './spaces.controller';
import { AdminSpacesController } from './admin-spaces.controller';
import { SpacesService } from './spaces.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SpacesController, AdminSpacesController],
  providers: [SpacesService],
  exports: [SpacesService],
})
export class SpacesModule {}
