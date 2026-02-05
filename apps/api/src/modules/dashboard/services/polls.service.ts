import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { PostType } from '@prisma/client';
import { ModerationService } from './moderation.service';
import { PointsService } from '../../points/points.service';
import {
  PollResultsDto,
  PollOptionResultDto,
} from '../dto/poll.dto';

const DAILY_POST_POINTS = 10;

@Injectable()
export class PollsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moderationService: ModerationService,
    private readonly pointsService: PointsService,
  ) {}

  async createPoll(
    userId: string,
    associationId: string,
    question: string,
    options: string[],
    durationDays?: number,
  ): Promise<{ poll: any; points_earned: number }> {
    await this.moderationService.checkSuspension(userId, associationId);

    // Calculate end date
    let endsAt: Date | null = null;
    if (durationDays) {
      endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + durationDays);
    }

    // Create post and poll in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create post
      const post = await tx.post.create({
        data: {
          authorId: userId,
          associationId,
          type: PostType.POLL,
          description: question,
        },
      });

      // Create poll
      const poll = await tx.poll.create({
        data: {
          postId: post.id,
          question,
          durationDays,
          endsAt,
        },
      });

      // Create options
      await tx.pollOption.createMany({
        data: options.map((text, index) => ({
          pollId: poll.id,
          text,
          order: index,
        })),
      });

      return { post, poll };
    });

    // Award points for first daily post
    const pointsEarned = await this.awardDailyPostPoints(
      userId,
      result.post.id,
    );

    // Fetch complete poll data
    const fullPoll = await this.prisma.poll.findUnique({
      where: { id: result.poll.id },
      include: {
        options: { orderBy: { order: 'asc' } },
        post: {
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    return {
      poll: {
        id: fullPoll?.id,
        post_id: fullPoll?.postId,
        question: fullPoll?.question,
        options: fullPoll?.options.map((o) => ({
          id: o.id,
          text: o.text,
        })),
        ends_at: fullPoll?.endsAt,
        author: {
          id: fullPoll?.post.author.id,
          name: fullPoll?.post.author.name,
          avatar_url: fullPoll?.post.author.avatarUrl,
        },
        created_at: fullPoll?.createdAt,
      },
      points_earned: pointsEarned,
    };
  }

  async vote(
    pollId: string,
    userId: string,
    associationId: string,
    optionIndex: number,
  ): Promise<PollResultsDto> {
    await this.moderationService.checkSuspension(userId, associationId);

    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: { orderBy: { order: 'asc' } },
      },
    });

    if (!poll) {
      throw new NotFoundException('Enquete não encontrada');
    }

    if (poll.endedAt) {
      throw new ForbiddenException('Esta enquete já foi encerrada');
    }

    if (poll.endsAt && poll.endsAt < new Date()) {
      throw new ForbiddenException('Esta enquete já expirou');
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      throw new BadRequestException('Opção inválida');
    }

    // Check if already voted
    const existingVote = await this.prisma.pollVote.findUnique({
      where: { pollId_userId: { pollId, userId } },
    });

    if (existingVote) {
      throw new BadRequestException('Você já votou nesta enquete');
    }

    const selectedOption = poll.options[optionIndex];

    // Create vote and update counters
    await this.prisma.$transaction([
      this.prisma.pollVote.create({
        data: {
          pollId,
          optionId: selectedOption.id,
          userId,
        },
      }),
      this.prisma.pollOption.update({
        where: { id: selectedOption.id },
        data: { votesCount: { increment: 1 } },
      }),
      this.prisma.poll.update({
        where: { id: pollId },
        data: { totalVotes: { increment: 1 } },
      }),
    ]);

    return this.getResults(pollId, userId);
  }

  async getResults(pollId: string, userId: string): Promise<PollResultsDto> {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: { orderBy: { order: 'asc' } },
        votes: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    if (!poll) {
      throw new NotFoundException('Enquete não encontrada');
    }

    // Check if user can see results
    const hasVoted = poll.votes.length > 0;
    const isClosed = poll.endedAt !== null;
    const isExpired = poll.endsAt && poll.endsAt < new Date();

    if (!hasVoted && !isClosed && !isExpired) {
      throw new ForbiddenException(
        'Você precisa votar para ver os resultados',
      );
    }

    const totalVotes = poll.totalVotes;

    const options: PollOptionResultDto[] = poll.options.map((opt) => ({
      text: opt.text,
      percentage: totalVotes > 0 ? Math.round((opt.votesCount / totalVotes) * 100) : 0,
      votes: opt.votesCount,
    }));

    return {
      options,
      total_votes: totalVotes,
    };
  }

  async closePoll(pollId: string): Promise<void> {
    await this.prisma.poll.update({
      where: { id: pollId },
      data: { endedAt: new Date() },
    });
  }

  private async awardDailyPostPoints(
    userId: string,
    postId: string,
  ): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tracker = await this.prisma.dailyPostTracker.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (tracker?.pointsAwarded) {
      return 0;
    }

    await this.pointsService.creditPoints(
      userId,
      DAILY_POST_POINTS,
      'DAILY_POST',
      'Primeiro post do dia (enquete)',
      { postId },
    );

    await this.prisma.dailyPostTracker.upsert({
      where: { userId_date: { userId, date: today } },
      create: {
        userId,
        date: today,
        firstPostId: postId,
        pointsAwarded: true,
      },
      update: { pointsAwarded: true, firstPostId: postId },
    });

    return DAILY_POST_POINTS;
  }
}
