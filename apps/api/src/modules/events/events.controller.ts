import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EventsService } from './events.service';
import {
  EventQueryDto,
  CheckinDto,
  CreateCommentDto,
  CommentQueryDto,
} from './dto';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async listEvents(@Request() req, @Query() query: EventQueryDto) {
    return this.eventsService.listEvents(
      req.user.id,
      req.user.associationId,
      query,
    );
  }

  @Get(':id')
  async getEvent(@Request() req, @Param('id') id: string) {
    return this.eventsService.getEvent(id, req.user.id);
  }

  @Post(':id/confirm')
  async confirmEvent(@Request() req, @Param('id') id: string) {
    return this.eventsService.confirmEvent(id, req.user.id);
  }

  @Delete(':id/confirm')
  async removeConfirmation(@Request() req, @Param('id') id: string) {
    return this.eventsService.removeConfirmation(id, req.user.id);
  }

  @Post(':id/checkin')
  async checkin(@Request() req, @Param('id') id: string, @Body() dto: CheckinDto) {
    // Override eventId from URL for security
    dto.eventId = id;
    return this.eventsService.processCheckin(req.user.id, dto);
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string, @Query() query: CommentQueryDto) {
    return this.eventsService.getComments(id, query);
  }

  @Post(':id/comments')
  async createComment(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.eventsService.createComment(id, req.user.id, dto);
  }
}
