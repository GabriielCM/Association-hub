import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommentsService } from '../services/comments.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FeedReactionType } from '@prisma/client';

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: any;
  let moderationService: any;
  let notificationsService: any;

  const mockComment = {
    id: 'comment-1',
    postId: 'post-1',
    authorId: 'user-1',
    text: 'Test comment',
    parentId: null,
    deletedAt: null,
    createdAt: new Date(),
    author: {
      id: 'user-1',
      name: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    reactions: [],
    replies: [],
  };

  beforeEach(() => {
    prisma = {
      post: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      feedComment: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      feedCommentReaction: {
        upsert: vi.fn(),
        deleteMany: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    };

    moderationService = {
      checkSuspension: vi.fn(),
    };

    notificationsService = {
      create: vi.fn(),
    };

    service = new CommentsService(prisma, moderationService, notificationsService);
  });

  describe('getComments', () => {
    it('should return comments for a post', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'post-1', deletedAt: null });
      prisma.feedComment.findMany.mockResolvedValue([mockComment]);
      prisma.feedComment.count.mockResolvedValue(1);

      const result = await service.getComments('post-1', 'user-1', 0, 20);

      expect(result.comments).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.comments[0].id).toBe('comment-1');
    });

    it('should throw NotFoundException for deleted post', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'post-1', deletedAt: new Date() });

      await expect(service.getComments('post-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for non-existent post', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(service.getComments('invalid', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createComment', () => {
    it('should create a top-level comment and notify post author', async () => {
      moderationService.checkSuspension.mockResolvedValue(undefined);
      prisma.post.findUnique.mockResolvedValue({
        id: 'post-1',
        authorId: 'author-1',
        deletedAt: null,
      });
      prisma.feedComment.create.mockResolvedValue(mockComment);
      prisma.post.update.mockResolvedValue({});
      prisma.user.findUnique.mockResolvedValue({ name: 'Test User' });

      const result = await service.createComment(
        'post-1',
        'user-1',
        'assoc-1',
        'Test comment',
      );

      expect(result.id).toBe('comment-1');
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'author-1',
          type: 'NEW_COMMENT',
        }),
      );
    });

    it('should create a reply and notify parent author', async () => {
      moderationService.checkSuspension.mockResolvedValue(undefined);
      prisma.post.findUnique.mockResolvedValue({
        id: 'post-1',
        authorId: 'user-1', // Same as commenter
        deletedAt: null,
      });
      prisma.feedComment.findUnique.mockResolvedValue({
        id: 'parent-1',
        parentId: null,
        authorId: 'parent-author',
      });
      prisma.feedComment.create.mockResolvedValue({
        ...mockComment,
        parentId: 'parent-1',
      });
      prisma.post.update.mockResolvedValue({});
      prisma.user.findUnique.mockResolvedValue({ name: 'Test User' });

      await service.createComment(
        'post-1',
        'user-1',
        'assoc-1',
        'Reply',
        'parent-1',
      );

      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'parent-author',
          type: 'COMMENT_REPLY',
        }),
      );
    });

    it('should throw BadRequestException for 2+ level nesting', async () => {
      moderationService.checkSuspension.mockResolvedValue(undefined);
      prisma.post.findUnique.mockResolvedValue({
        id: 'post-1',
        authorId: 'author-1',
        deletedAt: null,
      });
      prisma.feedComment.findUnique.mockResolvedValue({
        id: 'parent-1',
        parentId: 'grandparent-1', // Already a reply
        authorId: 'author-1',
      });

      await expect(
        service.createComment('post-1', 'user-1', 'assoc-1', 'Reply', 'parent-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent parent', async () => {
      moderationService.checkSuspension.mockResolvedValue(undefined);
      prisma.post.findUnique.mockResolvedValue({
        id: 'post-1',
        authorId: 'author-1',
        deletedAt: null,
      });
      prisma.feedComment.findUnique.mockResolvedValue(null);

      await expect(
        service.createComment('post-1', 'user-1', 'assoc-1', 'Reply', 'invalid'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteComment', () => {
    it('should soft delete own comment', async () => {
      prisma.feedComment.findUnique.mockResolvedValue({
        authorId: 'user-1',
        postId: 'post-1',
        deletedAt: null,
      });
      prisma.feedComment.update.mockResolvedValue(mockComment);
      prisma.post.update.mockResolvedValue({});

      await service.deleteComment('comment-1', 'user-1', false);

      expect(prisma.feedComment.update).toHaveBeenCalledWith({
        where: { id: 'comment-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should allow admin to delete any comment', async () => {
      prisma.feedComment.findUnique.mockResolvedValue({
        authorId: 'other-user',
        postId: 'post-1',
        deletedAt: null,
      });
      prisma.feedComment.update.mockResolvedValue(mockComment);
      prisma.post.update.mockResolvedValue({});

      await service.deleteComment('comment-1', 'admin-1', true);

      expect(prisma.feedComment.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException for non-owner non-admin', async () => {
      prisma.feedComment.findUnique.mockResolvedValue({
        authorId: 'other-user',
        postId: 'post-1',
        deletedAt: null,
      });

      await expect(
        service.deleteComment('comment-1', 'user-1', false),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addReaction', () => {
    it('should add a reaction to a comment', async () => {
      moderationService.checkSuspension.mockResolvedValue(undefined);
      prisma.feedComment.findUnique.mockResolvedValue({
        id: 'comment-1',
        deletedAt: null,
      });
      prisma.feedCommentReaction.upsert.mockResolvedValue({});

      await service.addReaction('comment-1', 'user-1', 'assoc-1', 'heart');

      expect(prisma.feedCommentReaction.upsert).toHaveBeenCalledWith({
        where: {
          commentId_userId_type: {
            commentId: 'comment-1',
            userId: 'user-1',
            type: FeedReactionType.HEART,
          },
        },
        create: {
          commentId: 'comment-1',
          userId: 'user-1',
          type: FeedReactionType.HEART,
        },
        update: {},
      });
    });

    it('should throw NotFoundException for deleted comment', async () => {
      moderationService.checkSuspension.mockResolvedValue(undefined);
      prisma.feedComment.findUnique.mockResolvedValue({
        id: 'comment-1',
        deletedAt: new Date(),
      });

      await expect(
        service.addReaction('comment-1', 'user-1', 'assoc-1', 'heart'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeReaction', () => {
    it('should remove all reactions from user on comment', async () => {
      prisma.feedComment.findUnique.mockResolvedValue({ id: 'comment-1' });
      prisma.feedCommentReaction.deleteMany.mockResolvedValue({ count: 1 });

      await service.removeReaction('comment-1', 'user-1');

      expect(prisma.feedCommentReaction.deleteMany).toHaveBeenCalledWith({
        where: { commentId: 'comment-1', userId: 'user-1' },
      });
    });

    it('should throw NotFoundException for non-existent comment', async () => {
      prisma.feedComment.findUnique.mockResolvedValue(null);

      await expect(
        service.removeReaction('invalid', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
