import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PostsService } from '../services/posts.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PostType } from '@prisma/client';

describe('PostsService', () => {
  let service: PostsService;
  let prisma: any;
  let moderationService: any;
  let pointsService: any;
  let notificationsService: any;

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
  };

  beforeEach(() => {
    prisma = {
      post: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        count: vi.fn(),
      },
      postLike: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      dailyPostTracker: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn((operations) => Promise.all(operations)),
    };

    moderationService = {
      checkSuspension: vi.fn().mockResolvedValue(undefined),
    };

    pointsService = {
      creditPoints: vi.fn().mockResolvedValue(undefined),
    };

    notificationsService = {
      create: vi.fn().mockResolvedValue(undefined),
    };

    service = new PostsService(
      prisma,
      moderationService,
      pointsService,
      notificationsService,
    );
  });

  describe('createPost', () => {
    it('should create a post and award daily points', async () => {
      prisma.post.count.mockResolvedValue(0);
      prisma.post.create.mockResolvedValue(mockPost);
      prisma.dailyPostTracker.findUnique.mockResolvedValue(null);

      const result = await service.createPost(
        'user-1',
        'assoc-1',
        'https://example.com/image.jpg',
        'Test post',
      );

      expect(result.post.id).toBe('post-1');
      expect(result.points_earned).toBe(10);
      expect(result.message).toContain('10 pontos');
    });

    it('should create post without points if already posted today', async () => {
      prisma.post.count.mockResolvedValue(0);
      prisma.post.create.mockResolvedValue(mockPost);
      prisma.dailyPostTracker.findUnique.mockResolvedValue({ pointsAwarded: true });

      const result = await service.createPost(
        'user-1',
        'assoc-1',
        'https://example.com/image.jpg',
        'Test post',
      );

      expect(result.points_earned).toBe(0);
      expect(pointsService.creditPoints).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when rate limit exceeded', async () => {
      prisma.post.count.mockResolvedValue(3);

      await expect(
        service.createPost('user-1', 'assoc-1', 'image.jpg', 'Test'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPost', () => {
    it('should return a post by id', async () => {
      prisma.post.findUnique.mockResolvedValue(mockPost);

      const result = await service.getPost('post-1', 'user-1');

      expect(result.id).toBe('post-1');
      expect(result.type).toBe('photo');
    });

    it('should throw NotFoundException for deleted post', async () => {
      prisma.post.findUnique.mockResolvedValue({
        ...mockPost,
        deletedAt: new Date(),
      });

      await expect(service.getPost('post-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for hidden post', async () => {
      prisma.post.findUnique.mockResolvedValue({
        ...mockPost,
        isHidden: true,
      });

      await expect(service.getPost('post-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePost', () => {
    it('should update own post description', async () => {
      prisma.post.findUnique.mockResolvedValue({ authorId: 'user-1', deletedAt: null });
      prisma.post.update.mockResolvedValue({
        ...mockPost,
        description: 'Updated description',
      });

      await service.updatePost('post-1', 'user-1', 'Updated description');

      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: 'post-1' },
        data: { description: 'Updated description' },
        include: expect.any(Object),
      });
    });

    it('should throw ForbiddenException when updating others post', async () => {
      prisma.post.findUnique.mockResolvedValue({ authorId: 'user-2', deletedAt: null });

      await expect(
        service.updatePost('post-1', 'user-1', 'Updated'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deletePost', () => {
    it('should soft delete own post', async () => {
      prisma.post.findUnique.mockResolvedValue({ authorId: 'user-1', deletedAt: null });
      prisma.post.update.mockResolvedValue(mockPost);

      await service.deletePost('post-1', 'user-1', false);

      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: 'post-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should allow admin to delete any post', async () => {
      prisma.post.findUnique.mockResolvedValue({ authorId: 'user-2', deletedAt: null });
      prisma.post.update.mockResolvedValue(mockPost);

      await service.deletePost('post-1', 'admin-1', true);

      expect(prisma.post.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException for non-admin deleting others post', async () => {
      prisma.post.findUnique.mockResolvedValue({ authorId: 'user-2', deletedAt: null });

      await expect(
        service.deletePost('post-1', 'user-1', false),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('likePost', () => {
    it('should like a post and notify author', async () => {
      prisma.post.findUnique
        .mockResolvedValueOnce({ id: 'post-1', authorId: 'user-2', deletedAt: null })
        .mockResolvedValueOnce({ likesCount: 6 });
      prisma.postLike.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({ name: 'Test User' });

      const result = await service.likePost('post-1', 'user-1', 'assoc-1');

      expect(result).toBe(6);
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-2',
          type: 'NEW_LIKE',
        }),
      );
    });

    it('should throw BadRequestException when already liked', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'post-1', authorId: 'user-2', deletedAt: null });
      prisma.postLike.findUnique.mockResolvedValue({ id: 'like-1' });

      await expect(
        service.likePost('post-1', 'user-1', 'assoc-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('unlikePost', () => {
    it('should unlike a post', async () => {
      prisma.post.findUnique
        .mockResolvedValueOnce({ id: 'post-1', deletedAt: null })
        .mockResolvedValueOnce({ likesCount: 4 });
      prisma.postLike.findUnique.mockResolvedValue({ id: 'like-1' });

      const result = await service.unlikePost('post-1', 'user-1');

      expect(result).toBe(4);
    });

    it('should throw BadRequestException when not liked', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'post-1', deletedAt: null });
      prisma.postLike.findUnique.mockResolvedValue(null);

      await expect(service.unlikePost('post-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createEventPost', () => {
    it('should create an event post', async () => {
      prisma.post.create.mockResolvedValue({ id: 'event-post-1' });

      const result = await service.createEventPost(
        'assoc-1',
        'event-1',
        'https://example.com/banner.jpg',
        'Event description',
        'admin-1',
      );

      expect(result).toBe('event-post-1');
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: PostType.EVENT,
          eventId: 'event-1',
        }),
      });
    });
  });

  describe('deleteEventPost', () => {
    it('should soft delete event posts', async () => {
      prisma.post.updateMany.mockResolvedValue({ count: 1 });

      await service.deleteEventPost('event-1');

      expect(prisma.post.updateMany).toHaveBeenCalledWith({
        where: { eventId: 'event-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
