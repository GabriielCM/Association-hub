import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { FeedService } from '../services/feed.service';
import { FeedQueryDto, FeedResponseDto } from '../dto/post.dto';

@ApiTags('Feed')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @ApiOperation({ summary: 'Obter feed de posts' })
  @ApiResponse({ status: 200, type: FeedResponseDto })
  async getFeed(
    @Request() req: any,
    @Query() query: FeedQueryDto,
  ) {
    const data = await this.feedService.getFeed(
      req.user.associationId,
      req.user.id,
      query.offset || 0,
      query.limit || 10,
    );
    return { success: true, data };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obter posts de um usuário' })
  @ApiResponse({ status: 200, type: FeedResponseDto })
  async getUserPosts(
    @Request() req: any,
    @Param('userId') userId: string,
    @Query() query: FeedQueryDto,
  ) {
    const data = await this.feedService.getUserPosts(
      userId,
      req.user.id,
      query.offset || 0,
      query.limit || 10,
    );
    return { success: true, data };
  }
}
