import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FeedService } from '../services/feed.service';
import { PostType } from '@prisma/client';

describe('FeedService', () => {
  let service: FeedService;
  let prisma: any;

  const mockPost = {
    id: 'post-1',
    authorId: 'user-1',
    associationId: 'assoc-1',
    type: PostType.PHOTO,
    imageUrl: 'https://example.com/image.jpg',
    description: 'Test post',
    likesCount: 5,
    commentsCount: 2,
    isPinned: false,
    isHidden: false,
    deletedAt: null,
    createdAt: new Date(),
    author: {
      id: 'user-1',
      name: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    likes: [],
    poll: null,
  };

  beforeEach(() => {
    prisma = {
      post: {
        findMany: vi.fn(),
      },
      userSuspension: {
        findMany: vi.fn(),
      },
    };

    service = new FeedService(prisma);
  });

  describe('getFeed', () => {
    it('should return paginated feed posts', async () => {
      prisma.userSuspension.findMany.mockResolvedValue([]);
      prisma.post.findMany.mockResolvedValue([mockPost]);

      const result = await service.getFeed('assoc-1', 'user-1', 0, 10);

      expect(result.posts).toHaveLength(1);
      expect(result.has_more).toBe(false);
      expect(result.posts[0].id).toBe('post-1');
      expect(result.posts[0].type).toBe('photo');
    });

    it('should indicate has_more when more posts exist', async () => {
      prisma.userSuspension.findMany.mockResolvedValue([]);
      const posts = Array(11)
        .fill(null)
        .map((_, i) => ({ ...mockPost, id: `post-${i}` }));
      prisma.post.findMany.mockResolvedValue(posts);

      const result = await service.getFeed('assoc-1', 'user-1', 0, 10);

      expect(result.posts).toHaveLength(10);
      expect(result.has_more).toBe(true);
    });

    it('should exclude posts from suspended users', async () => {
      prisma.userSuspension.findMany.mockResolvedValue([
        { userId: 'suspended-user' },
      ]);
      prisma.post.findMany.mockResolvedValue([mockPost]);

      await service.getFeed('assoc-1', 'user-1', 0, 10);

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            authorId: { notIn: ['suspended-user'] },
          }),
        }),
      );
    });

    it('should include poll data when available', async () => {
      const postWithPoll = {
        ...mockPost,
        type: PostType.POLL,
        poll: {
          id: 'poll-1',
          question: 'Test question?',
          totalVotes: 10,
          endedAt: null,
          endsAt: new Date(Date.now() + 86400000),
          options: [
            { text: 'Option 1', votesCount: 6 },
            { text: 'Option 2', votesCount: 4 },
          ],
          votes: [{ optionId: 'opt-1' }],
        },
      };
      prisma.userSuspension.findMany.mockResolvedValue([]);
      prisma.post.findMany.mockResolvedValue([postWithPoll]);

      const result = await service.getFeed('assoc-1', 'user-1', 0, 10);

      expect(result.posts[0].content).toHaveProperty('poll');
      expect((result.posts[0].content as any).poll.question).toBe('Test question?');
    });

    it('should mark liked posts correctly', async () => {
      const likedPost = {
        ...mockPost,
        likes: [{ id: 'like-1' }],
      };
      prisma.userSuspension.findMany.mockResolvedValue([]);
      prisma.post.findMany.mockResolvedValue([likedPost]);

      const result = await service.getFeed('assoc-1', 'user-1', 0, 10);

      expect(result.posts[0].content.liked_by_me).toBe(true);
    });
  });

  describe('getPreview', () => {
    it('should return limited preview posts', async () => {
      prisma.post.findMany.mockResolvedValue([mockPost]);

      const result = await service.getPreview('assoc-1', 3);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('author');
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 3,
        }),
      );
    });

    it('should truncate description to 100 characters', async () => {
      const longDescriptionPost = {
        ...mockPost,
        description: 'A'.repeat(200),
      };
      prisma.post.findMany.mockResolvedValue([longDescriptionPost]);

      const result = await service.getPreview('assoc-1', 3);

      expect(result[0].description).toHaveLength(100);
    });
  });
});
