import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';
import { WsJwtGuard } from '../../common/guards/ws-jwt.guard';

// Services
import { FAQService } from './faq.service';
import { TicketsService } from './tickets.service';
import { ChatService } from './chat.service';
import { AttachmentsService } from './attachments.service';

// User Controllers
import { FAQController } from './controllers/faq.controller';
import { TicketsController } from './controllers/tickets.controller';
import { ChatController } from './controllers/chat.controller';
import { AttachmentsController } from './controllers/attachments.controller';

// Admin Controllers
import { AdminTicketsController } from './controllers/admin-tickets.controller';
import { AdminFAQController } from './controllers/admin-faq.controller';
import { AdminChatController } from './controllers/admin-chat.controller';

// WebSocket Gateway
import { SupportGateway } from './support.gateway';

@Module({
  imports: [PrismaModule, NotificationsModule, AuthModule],
  controllers: [
    // User endpoints
    FAQController,
    TicketsController,
    ChatController,
    AttachmentsController,
    // Admin endpoints
    AdminTicketsController,
    AdminFAQController,
    AdminChatController,
  ],
  providers: [
    FAQService,
    TicketsService,
    ChatService,
    AttachmentsService,
    SupportGateway,
    WsJwtGuard,
  ],
  exports: [
    FAQService,
    TicketsService,
    ChatService,
    AttachmentsService,
    SupportGateway,
  ],
})
export class SupportModule {}
