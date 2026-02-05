import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StoriesService } from '../services/stories.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { StoryType } from '@prisma/client';

describe('StoriesService', () => {
  let service: StoriesService;
  let prisma: any;

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  const mockStory = {
    id: 'story-1',
    userId: 'user-1',
    associationId: 'assoc-1',
    type: StoryType.TEXT,
    mediaUrl: null,
    text: 'Test story',
    backgroundColor: '#FF5733',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      story: {
        groupBy: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        count: vi.fn(),
        delete: vi.fn(),
      },
      storyView: {
        findMany: vi.fn(),
        upsert: vi.fn(),
        count: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
      },
    };

    service = new StoriesService(prisma);
  });

  describe('listStories', () => {
    it('should return empty array when no stories exist', async () => {
      prisma.story.groupBy.mockResolvedValue([]);

      const result = await service.listStories('user-1', 'assoc-1');

      expect(result).toEqual([]);
    });

    it('should return users with stories sorted by unseen first', async () => {
      // Setup: user-2 has ALL stories viewed, user-3 has unseen stories
      prisma.story.groupBy.mockResolvedValue([
        { userId: 'user-2', _count: { id: 2 } },
        { userId: 'user-3', _count: { id: 1 } },
      ]);
      prisma.user.findMany.mockResolvedValue([
        { id: 'user-2', name: 'User 2', avatarUrl: null },
        { id: 'user-3', name: 'User 3', avatarUrl: 'avatar3.jpg' },
      ]);
      // user-1 has viewed ALL of user-2's stories
      prisma.storyView.findMany.mockResolvedValue([
        { storyId: 'story-2-1' },
        { storyId: 'story-2-2' },
      ]);
      prisma.story.findMany.mockResolvedValue([
        { id: 'story-2-1', userId: 'user-2' },
        { id: 'story-2-2', userId: 'user-2' },
        { id: 'story-3-1', userId: 'user-3' },
      ]);

      const result = await service.listStories('user-1', 'assoc-1');

      expect(result).toHaveLength(2);
      // user-3 comes first because has_unseen=true, user-2 has all stories viewed
      expect(result[0].user_id).toBe('user-3');
      expect(result[0].has_unseen).toBe(true);
      expect(result[1].user_id).toBe('user-2');
      expect(result[1].has_unseen).toBe(false);
    });
  });

  describe('createStory', () => {
    it('should create a text story successfully', async () => {
      prisma.story.count.mockResolvedValue(0);
      prisma.story.create.mockResolvedValue(mockStory);

      const result = await service.createStory('user-1', 'assoc-1', {
        type: StoryType.TEXT,
        text: 'Test story',
        backgroundColor: '#FF5733',
      });

      expect(result.id).toBe('story-1');
      expect(result.type).toBe(StoryType.TEXT);
      expect(result.text).toBe('Test story');
    });

    it('should throw BadRequestException when daily limit reached', async () => {
      prisma.story.count.mockResolvedValue(10);

      await expect(
        service.createStory('user-1', 'assoc-1', {
          type: StoryType.TEXT,
          text: 'Test',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserStories', () => {
    it('should return active stories for a user', async () => {
      prisma.story.findMany.mockResolvedValue([mockStory]);

      const result = await service.getUserStories('user-1', 'viewer-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('story-1');
    });
  });

  describe('recordView', () => {
    it('should record view for valid story', async () => {
      prisma.story.findUnique.mockResolvedValue(mockStory);
      prisma.storyView.upsert.mockResolvedValue({});

      await service.recordView('story-1', 'viewer-1');

      expect(prisma.storyView.upsert).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent story', async () => {
      prisma.story.findUnique.mockResolvedValue(null);

      await expect(service.recordView('invalid-id', 'viewer-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not record view for own story', async () => {
      prisma.story.findUnique.mockResolvedValue(mockStory);

      await service.recordView('story-1', 'user-1');

      expect(prisma.storyView.upsert).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for expired story', async () => {
      prisma.story.findUnique.mockResolvedValue({
        ...mockStory,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.recordView('story-1', 'viewer-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getViews', () => {
    it('should return views for story owner', async () => {
      prisma.story.findUnique.mockResolvedValue({ userId: 'user-1' });
      prisma.storyView.findMany.mockResolvedValue([
        {
          viewer: { id: 'viewer-1', name: 'Viewer', avatarUrl: null },
          viewedAt: new Date(),
        },
      ]);

      const result = await service.getViews('story-1', 'user-1');

      expect(result.views).toHaveLength(1);
      expect(result.total_views).toBe(1);
    });

    it('should throw ForbiddenException for non-owner', async () => {
      prisma.story.findUnique.mockResolvedValue({ userId: 'user-1' });

      await expect(service.getViews('story-1', 'user-2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('deleteStory', () => {
    it('should delete own story', async () => {
      prisma.story.findUnique.mockResolvedValue({ userId: 'user-1' });
      prisma.story.delete.mockResolvedValue(mockStory);

      await service.deleteStory('story-1', 'user-1');

      expect(prisma.story.delete).toHaveBeenCalledWith({
        where: { id: 'story-1' },
      });
    });

    it('should throw ForbiddenException when deleting others story', async () => {
      prisma.story.findUnique.mockResolvedValue({ userId: 'user-2' });

      await expect(service.deleteStory('story-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('hasUnviewedStories', () => {
    it('should return true when there are unviewed stories', async () => {
      prisma.story.findMany.mockResolvedValue([
        { id: 'story-1' },
        { id: 'story-2' },
      ]);
      prisma.storyView.count.mockResolvedValue(1);

      const result = await service.hasUnviewedStories('user-1', 'assoc-1');

      expect(result).toBe(true);
    });

    it('should return false when all stories are viewed', async () => {
      prisma.story.findMany.mockResolvedValue([{ id: 'story-1' }]);
      prisma.storyView.count.mockResolvedValue(1);

      const result = await service.hasUnviewedStories('user-1', 'assoc-1');

      expect(result).toBe(false);
    });

    it('should return false when no active stories exist', async () => {
      prisma.story.findMany.mockResolvedValue([]);

      const result = await service.hasUnviewedStories('user-1', 'assoc-1');

      expect(result).toBe(false);
    });
  });
});
