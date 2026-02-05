import {
  Controller,
  Get,
  Post,
  Param,
  Body,
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
import { PollsService } from '../services/polls.service';
import {
  CreatePollDto,
  VotePollDto,
  CreatePollResponseDto,
  VotePollResponseDto,
  PollResultsResponseDto,
} from '../dto/poll.dto';

@ApiTags('Polls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar enquete' })
  @ApiResponse({ status: 201, type: CreatePollResponseDto })
  async createPoll(
    @Request() req: any,
    @Body() dto: CreatePollDto,
  ): Promise<CreatePollResponseDto> {
    return this.pollsService.createPoll(
      req.user.id,
      req.user.associationId,
      dto.question,
      dto.options,
      dto.duration_days,
    );
  }

  @Post(':id/vote')
  @ApiOperation({ summary: 'Votar na enquete' })
  @ApiResponse({ status: 200, type: VotePollResponseDto })
  async vote(
    @Request() req: any,
    @Param('id') pollId: string,
    @Body() dto: VotePollDto,
  ): Promise<VotePollResponseDto> {
    const results = await this.pollsService.vote(
      pollId,
      req.user.id,
      req.user.associationId,
      dto.option_index,
    );
    return { success: true, results };
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Obter resultados da enquete' })
  @ApiResponse({ status: 200, type: PollResultsResponseDto })
  async getResults(
    @Request() req: any,
    @Param('id') pollId: string,
  ): Promise<PollResultsResponseDto> {
    const results = await this.pollsService.getResults(pollId, req.user.id);
    return { results };
  }
}
