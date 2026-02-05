import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModerationService } from '../services/moderation.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReportReason, ReportStatus, ReportTargetType } from '@prisma/client';

describe('ModerationService', () => {
  let service: ModerationService;
  let prisma: any;

  const mockSuspension = {
    id: 'suspension-1',
    userId: 'user-1',
    associationId: 'assoc-1',
    suspendedById: 'admin-1',
    reason: 'Violation of rules',
    durationDays: 7,
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    liftedAt: null,
    createdAt: new Date(),
  };

  const mockReport = {
    id: 'report-1',
    reporterId: 'reporter-1',
    associationId: 'assoc-1',
    targetType: ReportTargetType.POST,
    targetId: 'post-1',
    postId: 'post-1',
    reason: ReportReason.SPAM,
    description: 'This is spam',
    status: ReportStatus.PENDING,
    createdAt: new Date(),
    reporter: {
      id: 'reporter-1',
      name: 'Reporter User',
      avatarUrl: null,
    },
  };

  beforeEach(() => {
    prisma = {
      userSuspension: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
      },
      report: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      post: {
        findUnique: vi.fn(),
      },
      feedComment: {
        findUnique: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    };

    service = new ModerationService(prisma);
  });

  describe('checkSuspension', () => {
    it('should not throw if user is not suspended', async () => {
      prisma.userSuspension.findFirst.mockResolvedValue(null);

      await expect(
        service.checkSuspension('user-1', 'assoc-1'),
      ).resolves.not.toThrow();
    });

    it('should throw ForbiddenException for suspended user with end date', async () => {
      prisma.userSuspension.findFirst.mockResolvedValue(mockSuspension);

      await expect(
        service.checkSuspension('user-1', 'assoc-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for permanently suspended user', async () => {
      prisma.userSuspension.findFirst.mockResolvedValue({
        ...mockSuspension,
        endsAt: null,
      });

      await expect(
        service.checkSuspension('user-1', 'assoc-1'),
      ).rejects.toThrow('permanentemente');
    });
  });

  describe('isUserSuspended', () => {
    it('should return true for suspended user', async () => {
      prisma.userSuspension.findFirst.mockResolvedValue(mockSuspension);

      const result = await service.isUserSuspended('user-1', 'assoc-1');

      expect(result).toBe(true);
    });

    it('should return false for non-suspended user', async () => {
      prisma.userSuspension.findFirst.mockResolvedValue(null);

      const result = await service.isUserSuspended('user-1', 'assoc-1');

      expect(result).toBe(false);
    });
  });

  describe('createReport', () => {
    it('should create a report for a post', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'post-1' });
      prisma.report.create.mockResolvedValue({ id: 'report-1' });

      const result = await service.createReport(
        'reporter-1',
        'assoc-1',
        ReportTargetType.POST,
        'post-1',
        ReportReason.SPAM,
        'This is spam',
      );

      expect(result).toBe('report-1');
      expect(prisma.report.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          targetType: ReportTargetType.POST,
          targetId: 'post-1',
          reason: ReportReason.SPAM,
        }),
      });
    });

    it('should create a report for a comment', async () => {
      prisma.feedComment.findUnique.mockResolvedValue({ id: 'comment-1' });
      prisma.report.create.mockResolvedValue({ id: 'report-2' });

      const result = await service.createReport(
        'reporter-1',
        'assoc-1',
        ReportTargetType.COMMENT,
        'comment-1',
        ReportReason.INAPPROPRIATE,
      );

      expect(result).toBe('report-2');
    });

    it('should throw NotFoundException for non-existent post', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(
        service.createReport(
          'reporter-1',
          'assoc-1',
          ReportTargetType.POST,
          'invalid',
          ReportReason.SPAM,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for non-existent comment', async () => {
      prisma.feedComment.findUnique.mockResolvedValue(null);

      await expect(
        service.createReport(
          'reporter-1',
          'assoc-1',
          ReportTargetType.COMMENT,
          'invalid',
          ReportReason.SPAM,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listReports', () => {
    it('should return paginated reports', async () => {
      prisma.report.findMany.mockResolvedValue([mockReport]);
      prisma.report.count.mockResolvedValue(1);

      const result = await service.listReports('assoc-1');

      expect(result.reports).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.reports[0].id).toBe('report-1');
    });

    it('should filter by status', async () => {
      prisma.report.findMany.mockResolvedValue([]);
      prisma.report.count.mockResolvedValue(0);

      await service.listReports('assoc-1', ReportStatus.RESOLVED);

      expect(prisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { associationId: 'assoc-1', status: ReportStatus.RESOLVED },
        }),
      );
    });
  });

  describe('resolveReport', () => {
    it('should resolve a report', async () => {
      prisma.report.findUnique.mockResolvedValue(mockReport);
      prisma.report.update.mockResolvedValue({});

      await service.resolveReport('report-1', 'admin-1', 'RESOLVED', 'Removed content');

      expect(prisma.report.update).toHaveBeenCalledWith({
        where: { id: 'report-1' },
        data: expect.objectContaining({
          status: 'RESOLVED',
          resolvedById: 'admin-1',
          resolution: 'Removed content',
        }),
      });
    });

    it('should throw NotFoundException for non-existent report', async () => {
      prisma.report.findUnique.mockResolvedValue(null);

      await expect(
        service.resolveReport('invalid', 'admin-1', 'RESOLVED'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('suspendUser', () => {
    it('should suspend a user with duration', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      prisma.userSuspension.create.mockResolvedValue(mockSuspension);

      const result = await service.suspendUser(
        'user-1',
        'assoc-1',
        'admin-1',
        'Violation',
        7,
      );

      expect(result.success).toBe(true);
      expect(result.suspended_until).toBeDefined();
    });

    it('should suspend a user permanently (no duration)', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      prisma.userSuspension.create.mockResolvedValue({
        ...mockSuspension,
        endsAt: null,
      });

      const result = await service.suspendUser(
        'user-1',
        'assoc-1',
        'admin-1',
        'Serious violation',
      );

      expect(result.success).toBe(true);
      expect(result.suspended_until).toBeUndefined();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.suspendUser('invalid', 'assoc-1', 'admin-1', 'Reason'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('liftSuspension', () => {
    it('should lift a suspension', async () => {
      prisma.userSuspension.findUnique.mockResolvedValue({
        ...mockSuspension,
        liftedAt: null,
      });
      prisma.userSuspension.update.mockResolvedValue({});

      await service.liftSuspension('suspension-1', 'admin-1');

      expect(prisma.userSuspension.update).toHaveBeenCalledWith({
        where: { id: 'suspension-1' },
        data: expect.objectContaining({
          liftedById: 'admin-1',
          liftedAt: expect.any(Date),
        }),
      });
    });

    it('should throw NotFoundException for non-existent suspension', async () => {
      prisma.userSuspension.findUnique.mockResolvedValue(null);

      await expect(
        service.liftSuspension('invalid', 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for already lifted suspension', async () => {
      prisma.userSuspension.findUnique.mockResolvedValue({
        ...mockSuspension,
        liftedAt: new Date(),
      });

      await expect(
        service.liftSuspension('suspension-1', 'admin-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('liftUserSuspension', () => {
    it('should lift active suspension for a user', async () => {
      prisma.userSuspension.findFirst.mockResolvedValue(mockSuspension);
      prisma.userSuspension.update.mockResolvedValue({});

      await service.liftUserSuspension('user-1', 'assoc-1', 'admin-1');

      expect(prisma.userSuspension.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not suspended', async () => {
      prisma.userSuspension.findFirst.mockResolvedValue(null);

      await expect(
        service.liftUserSuspension('user-1', 'assoc-1', 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
