import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PollsService } from '../services/polls.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PostType } from '@prisma/client';

describe('PollsService', () => {
  let service: PollsService;
  let prisma: any;
  let moderationService: any;
  let pointsService: any;

  const mockPoll = {
    id: 'poll-1',
    postId: 'post-1',
    question: 'Test question?',
    durationDays: 7,
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endedAt: null,
    totalVotes: 10,
    createdAt: new Date(),
    options: [
      { id: 'opt-1', text: 'Option 1', votesCount: 6, order: 0 },
      { id: 'opt-2', text: 'Option 2', votesCount: 4, order: 1 },
    ],
    post: {
      author: {
        id: 'user-1',
        name: 'Test User',
        avatarUrl: null,
      },
    },
    votes: [],
  };

  beforeEach(() => {
    prisma = {
      post: {
        create: vi.fn(),
      },
      poll: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      pollOption: {
        createMany: vi.fn(),
        update: vi.fn(),
      },
      pollVote: {
        create: vi.fn(),
        findUnique: vi.fn(),
      },
      dailyPostTracker: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      $transaction: vi.fn((callback) => {
        if (typeof callback === 'function') {
          return callback(prisma);
        }
        return Promise.all(callback);
      }),
    };

    moderationService = {
      checkSuspension: vi.fn(),
    };

    pointsService = {
      creditPoints: vi.fn(),
    };

    service = new PollsService(prisma, moderationService, pointsService);
  });

  describe('createPoll', () => {
    it('should create a poll with points for first daily post', async () => {
      moderationService.checkSuspension.mockResolvedValue(undefined);
      prisma.post.create.mockResolvedValue({ id: 'post-1' });
      prisma.poll.create.mockResolvedValue({ id: 'poll-1' });
      prisma.pollOption.createMany.mockResolvedValue({ count: 2 });
      prisma.poll.findUnique.mockResolvedValue(mockPoll);
      prisma.dailyPostTracker.findUnique.mockResolvedValue(null);

      const result = await service.createPoll(
        'user-1',
        'assoc-1',
        'Test question?',
        ['Option 1', 'Option 2'],
        7,
      );

      expect(result.poll.question).toBe('Test question?');
      expect(result.points_earned).toBe(10);
      expect(pointsService.creditPoints).toHaveBeenCalled();
    });

    it('should create poll without points if already posted today', async () => {
      moderationService.checkSuspension.mockResolvedValue(undefined);
      prisma.post.create.mockResolvedValue({ id: 'post-1' });
      prisma.poll.create.mockResolvedValue({ id: 'poll-1' });
      prisma.pollOption.createMany.mockResolvedValue({ count: 2 });
      prisma.poll.findUnique.mockResolvedValue(mockPoll);
      prisma.dailyPostTracker.findUnique.mockResolvedValue({ pointsAwarded: true });

      const result = await service.createPoll(
        'user-1',
        'assoc-1',
        'Test question?',
        ['Option 1', 'Option 2'],
      );

      expect(result.points_earned).toBe(0);
      expect(pointsService.creditPoints).not.toHaveBeenCalled();
    });
  });

  describe('vote', () => {
    it('should allow voting on an open poll', async () => {
      moderationService.checkSuspension.mockResolvedValue(undefined);
      prisma.poll.findUnique
        .mockResolvedValueOnce(mockPoll)
        .mockResolvedValueOnce({ ...mockPoll, votes: [{ id: 'vote-1' }] });
      prisma.pollVote.findUnique.mockResolvedValue(null);

      const result = await service.vote('poll-1', 'user-1', 'assoc-1', 0);

      expect(result.options).toHaveLength(2);
      expect(result.total_votes).toBe(10);
    });

    it('should throw ForbiddenException for closed poll', async () => {
      moderationService.checkSuspension.mockResolvedValue(undefined);
      prisma.poll.findUnique.mockResolvedValue({
        ...mockPoll,
        endedAt: new Date(),
      });

      await expect(
        service.vote('poll-1', 'user-1', 'assoc-1', 0),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for expired poll', async () => {
      moderationService.checkSuspension.mockResolvedValue(undefined);
      prisma.poll.findUnique.mockResolvedValue({
        ...mockPoll,
        endsAt: new Date(Date.now() - 1000), // Expired
      });

      await expect(
        service.vote('poll-1', 'user-1', 'assoc-1', 0),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for invalid option', async () => {
      moderationService.checkSuspension.mockResolvedValue(undefined);
      prisma.poll.findUnique.mockResolvedValue(mockPoll);
      prisma.pollVote.findUnique.mockResolvedValue(null);

      await expect(
        service.vote('poll-1', 'user-1', 'assoc-1', 5), // Invalid index
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if already voted', async () => {
      moderationService.checkSuspension.mockResolvedValue(undefined);
      prisma.poll.findUnique.mockResolvedValue(mockPoll);
      prisma.pollVote.findUnique.mockResolvedValue({ id: 'existing-vote' });

      await expect(
        service.vote('poll-1', 'user-1', 'assoc-1', 0),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent poll', async () => {
      moderationService.checkSuspension.mockResolvedValue(undefined);
      prisma.poll.findUnique.mockResolvedValue(null);

      await expect(
        service.vote('invalid', 'user-1', 'assoc-1', 0),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getResults', () => {
    it('should return results for user who voted', async () => {
      prisma.poll.findUnique.mockResolvedValue({
        ...mockPoll,
        votes: [{ id: 'vote-1' }], // User has voted
      });

      const result = await service.getResults('poll-1', 'user-1');

      expect(result.options).toHaveLength(2);
      expect(result.options[0].percentage).toBe(60);
      expect(result.options[1].percentage).toBe(40);
      expect(result.total_votes).toBe(10);
    });

    it('should return results for closed poll', async () => {
      prisma.poll.findUnique.mockResolvedValue({
        ...mockPoll,
        endedAt: new Date(),
        votes: [], // User hasn't voted
      });

      const result = await service.getResults('poll-1', 'user-1');

      expect(result.total_votes).toBe(10);
    });

    it('should throw ForbiddenException for non-voter on open poll', async () => {
      prisma.poll.findUnique.mockResolvedValue({
        ...mockPoll,
        votes: [], // User hasn't voted
      });

      await expect(service.getResults('poll-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException for non-existent poll', async () => {
      prisma.poll.findUnique.mockResolvedValue(null);

      await expect(service.getResults('invalid', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('closePoll', () => {
    it('should close a poll', async () => {
      prisma.poll.update.mockResolvedValue({ ...mockPoll, endedAt: new Date() });

      await service.closePoll('poll-1');

      expect(prisma.poll.update).toHaveBeenCalledWith({
        where: { id: 'poll-1' },
        data: { endedAt: expect.any(Date) },
      });
    });
  });
});
