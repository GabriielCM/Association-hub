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
  ],
})
export class DashboardModule {}
