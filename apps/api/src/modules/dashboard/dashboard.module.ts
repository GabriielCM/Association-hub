import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PointsModule } from '../points/points.module';
import { AuthModule } from '../auth/auth.module';

// Services
import {
  DashboardService,
  StoriesService,
  ModerationService,
  PostsService,
  FeedService,
  CommentsService,
  PollsService,
  AdminDashboardService,
} from './services';

// Controllers
import {
  DashboardController,
  StoriesController,
  FeedController,
  PostsController,
  CommentsController,
  PollsController,
  AdminDashboardController,
} from './controllers';

// Common Services
import { UploadService } from '../../common/services/upload.service';

// Gateway
import { DashboardGateway } from './dashboard.gateway';

// Scheduler
import { DashboardScheduler } from './schedulers/dashboard.scheduler';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => NotificationsModule),
    forwardRef(() => PointsModule),
    AuthModule,
  ],
  controllers: [
    DashboardController,
    StoriesController,
    FeedController,
    PostsController,
    CommentsController,
    PollsController,
    AdminDashboardController,
  ],
  providers: [
    DashboardService,
    StoriesService,
    ModerationService,
    PostsService,
    FeedService,
    CommentsService,
    PollsService,
    AdminDashboardService,
    UploadService,
    DashboardGateway,
    DashboardScheduler,
  ],
  exports: [
    DashboardService,
    StoriesService,
    ModerationService,
    PostsService,
    FeedService,
    CommentsService,
    PollsService,
    DashboardGateway,
  ],
})
export class DashboardModule {}
