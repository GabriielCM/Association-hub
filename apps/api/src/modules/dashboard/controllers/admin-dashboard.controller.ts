import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ModerationService } from '../services/moderation.service';
import { PostsService } from '../services/posts.service';
import { UserRole } from '@prisma/client';
import {
  ReportsQueryDto,
  ReportsListResponseDto,
  SuspendUserDto,
  SuspendUserResponseDto,
  ResolveReportDto,
} from '../dto/moderation.dto';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminDashboardController {
  constructor(
    private readonly moderationService: ModerationService,
    private readonly postsService: PostsService,
  ) {}

  @Get('reports')
  @ApiOperation({ summary: 'Listar denúncias' })
  @ApiResponse({ status: 200, type: ReportsListResponseDto })
  async listReports(
    @Request() req: any,
    @Query() query: ReportsQueryDto,
  ): Promise<ReportsListResponseDto> {
    const { reports } = await this.moderationService.listReports(
      req.user.associationId,
      query.status,
      query.offset || 0,
      query.limit || 20,
    );
    return { reports };
  }

  @Put('reports/:id')
  @ApiOperation({ summary: 'Resolver denúncia' })
  @ApiResponse({ status: 200 })
  async resolveReport(
    @Request() req: any,
    @Param('id') reportId: string,
    @Body() dto: ResolveReportDto,
  ): Promise<{ success: boolean }> {
    await this.moderationService.resolveReport(
      reportId,
      req.user.id,
      dto.status,
      dto.resolution,
    );
    return { success: true };
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: 'Remover post (força)' })
  @ApiResponse({ status: 200 })
  async forceDeletePost(
    @Request() req: any,
    @Param('id') postId: string,
  ): Promise<{ success: boolean }> {
    await this.postsService.deletePost(postId, req.user.id, true);
    return { success: true };
  }

  @Post('users/:id/suspend')
  @ApiOperation({ summary: 'Suspender usuário' })
  @ApiResponse({ status: 200, type: SuspendUserResponseDto })
  async suspendUser(
    @Request() req: any,
    @Param('id') userId: string,
    @Body() dto: SuspendUserDto,
  ): Promise<SuspendUserResponseDto> {
    return this.moderationService.suspendUser(
      userId,
      req.user.associationId,
      req.user.id,
      dto.reason,
      dto.duration_days,
    );
  }

  @Delete('users/:id/suspend')
  @ApiOperation({ summary: 'Levantar suspensão do usuário' })
  @ApiResponse({ status: 200 })
  async liftSuspension(
    @Request() req: any,
    @Param('id') userId: string,
  ): Promise<{ success: boolean }> {
    await this.moderationService.liftUserSuspension(
      userId,
      req.user.associationId,
      req.user.id,
    );
    return { success: true };
  }
}
