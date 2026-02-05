import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';

// Mock @prisma/client enums before importing service
vi.mock('@prisma/client', () => ({
  NotificationCategory: {
    SOCIAL: 'SOCIAL',
    EVENTS: 'EVENTS',
    POINTS: 'POINTS',
    RESERVATIONS: 'RESERVATIONS',
    SYSTEM: 'SYSTEM',
  },
  NotificationType: {
    NEW_LIKE: 'NEW_LIKE',
    NEW_COMMENT: 'NEW_COMMENT',
    COMMENT_REPLY: 'COMMENT_REPLY',
    MENTION: 'MENTION',
    NEW_FOLLOWER: 'NEW_FOLLOWER',
    STORY_VIEW: 'STORY_VIEW',
    POLL_ENDED: 'POLL_ENDED',
    NEW_EVENT: 'NEW_EVENT',
    EVENT_REMINDER_1DAY: 'EVENT_REMINDER_1DAY',
    EVENT_REMINDER_1HOUR: 'EVENT_REMINDER_1HOUR',
    EVENT_STARTED: 'EVENT_STARTED',
    CHECKIN_REMINDER: 'CHECKIN_REMINDER',
    BADGE_EARNED: 'BADGE_EARNED',
    EVENT_CANCELLED: 'EVENT_CANCELLED',
    EVENT_UPDATED: 'EVENT_UPDATED',
    CHECKIN_PROGRESS: 'CHECKIN_PROGRESS',
    POINTS_RECEIVED: 'POINTS_RECEIVED',
    POINTS_SPENT: 'POINTS_SPENT',
    RANKING_UP: 'RANKING_UP',
    TRANSFER_RECEIVED: 'TRANSFER_RECEIVED',
    STRAVA_SYNC: 'STRAVA_SYNC',
    RESERVATION_APPROVED: 'RESERVATION_APPROVED',
    RESERVATION_REJECTED: 'RESERVATION_REJECTED',
    RESERVATION_REMINDER: 'RESERVATION_REMINDER',
    WAITLIST_AVAILABLE: 'WAITLIST_AVAILABLE',
    NEW_MESSAGE: 'NEW_MESSAGE',
    NEW_BENEFIT: 'NEW_BENEFIT',
    CARD_BLOCKED: 'CARD_BLOCKED',
    CARD_UNBLOCKED: 'CARD_UNBLOCKED',
    ADMIN_ANNOUNCEMENT: 'ADMIN_ANNOUNCEMENT',
  },
  Prisma: {
    NotificationWhereInput: {},
  },
}));

import { NotificationsService } from '../notifications.service';

// Local type definitions
const NotificationCategory = {
  SOCIAL: 'SOCIAL',
  EVENTS: 'EVENTS',
  POINTS: 'POINTS',
  RESERVATIONS: 'RESERVATIONS',
  SYSTEM: 'SYSTEM',
} as const;
type NotificationCategory = typeof NotificationCategory[keyof typeof NotificationCategory];

const NotificationType = {
  NEW_LIKE: 'NEW_LIKE',
  NEW_EVENT: 'NEW_EVENT',
  POINTS_RECEIVED: 'POINTS_RECEIVED',
  NEW_MESSAGE: 'NEW_MESSAGE',
} as const;
type NotificationType = typeof NotificationType[keyof typeof NotificationType];

// Mock data
const mockUserId = 'user-123';

const mockNotification = {
  id: 'notif-123',
  userId: mockUserId,
  type: NotificationType.NEW_LIKE as NotificationType,
  category: NotificationCategory.SOCIAL as NotificationCategory,
  title: 'Novo like',
  body: 'João curtiu sua publicação',
  data: { postId: 'post-123' },
  imageUrl: null,
  actionUrl: '/posts/post-123',
  groupKey: null,
  isRead: false,
  readAt: null,
  createdAt: new Date(),
};

const mockSettings = {
  id: 'settings-123',
  userId: mockUserId,
  category: NotificationCategory.SOCIAL as NotificationCategory,
  pushEnabled: true,
  inAppEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockDndSettings = {
  id: 'dnd-123',
  userId: mockUserId,
  enabled: false,
  startTime: '22:00',
  endTime: '07:00',
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock PrismaService
const mockPrismaService = {
  notification: {
    create: vi.fn(),
    createMany: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  notificationSettings: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
  },
  doNotDisturbSettings: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new NotificationsService(mockPrismaService as any);
  });

  describe('create', () => {
    it('deve criar uma notificação', async () => {
      mockPrismaService.notificationSettings.findUnique.mockResolvedValue(mockSettings);
      mockPrismaService.notification.create.mockResolvedValue(mockNotification);
      mockPrismaService.notification.count.mockResolvedValue(10);

      const result = await service.create({
        userId: mockUserId,
        type: NotificationType.NEW_LIKE as any,
        category: NotificationCategory.SOCIAL as any,
        title: 'Novo like',
        body: 'João curtiu sua publicação',
        data: { postId: 'post-123' },
        actionUrl: '/posts/post-123',
      });

      expect(result).toEqual(mockNotification);
      expect(mockPrismaService.notification.create).toHaveBeenCalled();
    });

    it('deve retornar null se in-app estiver desabilitado', async () => {
      mockPrismaService.notificationSettings.findUnique.mockResolvedValue({
        ...mockSettings,
        inAppEnabled: false,
      });

      const result = await service.create({
        userId: mockUserId,
        type: NotificationType.NEW_LIKE as any,
        category: NotificationCategory.SOCIAL as any,
        title: 'Novo like',
        body: 'João curtiu sua publicação',
      });

      expect(result).toBeNull();
      expect(mockPrismaService.notification.create).not.toHaveBeenCalled();
    });

    it('deve criar settings se não existir', async () => {
      mockPrismaService.notificationSettings.findUnique.mockResolvedValue(null);
      mockPrismaService.notificationSettings.create.mockResolvedValue(mockSettings);
      mockPrismaService.notification.create.mockResolvedValue(mockNotification);
      mockPrismaService.notification.count.mockResolvedValue(10);

      await service.create({
        userId: mockUserId,
        type: NotificationType.NEW_LIKE as any,
        category: NotificationCategory.SOCIAL as any,
        title: 'Novo like',
        body: 'João curtiu sua publicação',
      });

      expect(mockPrismaService.notificationSettings.create).toHaveBeenCalled();
    });
  });

  describe('createBatch', () => {
    it('deve criar notificações em lote', async () => {
      mockPrismaService.notificationSettings.findMany.mockResolvedValue([
        { ...mockSettings, userId: 'user-1' },
        { ...mockSettings, userId: 'user-2' },
      ]);
      mockPrismaService.notification.createMany.mockResolvedValue({ count: 2 });
      mockPrismaService.notification.count.mockResolvedValue(10);

      const result = await service.createBatch({
        userIds: ['user-1', 'user-2'],
        type: NotificationType.NEW_EVENT as any,
        category: NotificationCategory.EVENTS as any,
        title: 'Novo evento',
        body: 'Confira o novo evento',
      });

      expect(result).toBe(2);
      expect(mockPrismaService.notification.createMany).toHaveBeenCalled();
    });

    it('deve retornar 0 se nenhum usuário elegível', async () => {
      mockPrismaService.notificationSettings.findMany.mockResolvedValue([
        { ...mockSettings, userId: 'user-1', inAppEnabled: false },
      ]);

      const result = await service.createBatch({
        userIds: ['user-1'],
        type: NotificationType.NEW_EVENT as any,
        category: NotificationCategory.EVENTS as any,
        title: 'Novo evento',
        body: 'Confira o novo evento',
      });

      expect(result).toBe(0);
      expect(mockPrismaService.notification.createMany).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve listar notificações com paginação', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([mockNotification]);
      mockPrismaService.notification.count.mockResolvedValue(1);

      const result = await service.findAll(mockUserId, { page: 1, limit: 20 });

      expect(result.notifications).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('deve filtrar por categoria', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([mockNotification]);
      mockPrismaService.notification.count.mockResolvedValue(1);

      await service.findAll(mockUserId, {
        category: NotificationCategory.SOCIAL as any,
        page: 1,
        limit: 20,
      });

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: NotificationCategory.SOCIAL }),
        })
      );
    });

    it('deve filtrar apenas não lidas', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([mockNotification]);
      mockPrismaService.notification.count.mockResolvedValue(1);

      await service.findAll(mockUserId, { unreadOnly: true, page: 1, limit: 20 });

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isRead: false }),
        })
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar uma notificação', async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(mockNotification);

      const result = await service.findOne(mockUserId, 'notif-123');

      expect(result).toEqual(mockNotification);
    });

    it('deve lançar NotFoundException se não encontrar', async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(null);

      await expect(service.findOne(mockUserId, 'notif-999')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('markAsRead', () => {
    it('deve marcar notificação como lida', async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(mockNotification);
      mockPrismaService.notification.update.mockResolvedValue({
        ...mockNotification,
        isRead: true,
        readAt: new Date(),
      });

      const result = await service.markAsRead(mockUserId, 'notif-123');

      expect(result.isRead).toBe(true);
      expect(mockPrismaService.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isRead: true }),
        })
      );
    });

    it('deve retornar notificação sem atualizar se já lida', async () => {
      const readNotification = { ...mockNotification, isRead: true };
      mockPrismaService.notification.findFirst.mockResolvedValue(readNotification);

      const result = await service.markAsRead(mockUserId, 'notif-123');

      expect(result.isRead).toBe(true);
      expect(mockPrismaService.notification.update).not.toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('deve marcar todas como lidas', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead(mockUserId);

      expect(result).toBe(5);
      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId, isRead: false },
        })
      );
    });
  });

  describe('markCategoryAsRead', () => {
    it('deve marcar categoria como lida', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markCategoryAsRead(
        mockUserId,
        NotificationCategory.SOCIAL as any
      );

      expect(result).toBe(3);
      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: mockUserId,
            category: NotificationCategory.SOCIAL,
            isRead: false,
          },
        })
      );
    });
  });

  describe('delete', () => {
    it('deve excluir notificação', async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(mockNotification);
      mockPrismaService.notification.delete.mockResolvedValue(mockNotification);

      await service.delete(mockUserId, 'notif-123');

      expect(mockPrismaService.notification.delete).toHaveBeenCalledWith({
        where: { id: 'notif-123' },
      });
    });

    it('deve lançar NotFoundException se não encontrar', async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(null);

      await expect(service.delete(mockUserId, 'notif-999')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('clearRead', () => {
    it('deve excluir notificações lidas', async () => {
      mockPrismaService.notification.deleteMany.mockResolvedValue({ count: 10 });

      const result = await service.clearRead(mockUserId);

      expect(result).toBe(10);
      expect(mockPrismaService.notification.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, isRead: true },
      });
    });
  });

  describe('getUnreadCount', () => {
    it('deve retornar contadores por categoria', async () => {
      mockPrismaService.notification.groupBy.mockResolvedValue([
        { category: NotificationCategory.SOCIAL, _count: 5 },
        { category: NotificationCategory.EVENTS, _count: 3 },
      ]);

      const result = await service.getUnreadCount(mockUserId);

      expect(result.total).toBe(8);
      expect(result.byCategory.SOCIAL).toBe(5);
      expect(result.byCategory.EVENTS).toBe(3);
      expect(result.byCategory.POINTS).toBe(0);
    });
  });

  describe('getAllSettings', () => {
    it('deve retornar todas as configurações', async () => {
      mockPrismaService.notificationSettings.findMany.mockResolvedValue([
        mockSettings,
        { ...mockSettings, id: 'settings-2', category: NotificationCategory.EVENTS },
      ]);

      const result = await service.getAllSettings(mockUserId);

      expect(result).toHaveLength(2);
    });
  });

  describe('updateSettings', () => {
    it('deve atualizar configurações', async () => {
      mockPrismaService.notificationSettings.findUnique.mockResolvedValue(mockSettings);
      mockPrismaService.notificationSettings.update.mockResolvedValue({
        ...mockSettings,
        pushEnabled: false,
      });

      const result = await service.updateSettings(
        mockUserId,
        NotificationCategory.SOCIAL as any,
        { pushEnabled: false }
      );

      expect(result.pushEnabled).toBe(false);
    });
  });

  describe('getDndSettings', () => {
    it('deve retornar configurações DND', async () => {
      mockPrismaService.doNotDisturbSettings.findUnique.mockResolvedValue(mockDndSettings);

      const result = await service.getDndSettings(mockUserId);

      expect(result).toEqual(mockDndSettings);
    });

    it('deve criar configurações se não existir', async () => {
      mockPrismaService.doNotDisturbSettings.findUnique.mockResolvedValue(null);
      mockPrismaService.doNotDisturbSettings.create.mockResolvedValue(mockDndSettings);

      const result = await service.getDndSettings(mockUserId);

      expect(result).toEqual(mockDndSettings);
      expect(mockPrismaService.doNotDisturbSettings.create).toHaveBeenCalled();
    });
  });

  describe('updateDndSettings', () => {
    it('deve atualizar configurações DND', async () => {
      mockPrismaService.doNotDisturbSettings.findUnique.mockResolvedValue(mockDndSettings);
      mockPrismaService.doNotDisturbSettings.update.mockResolvedValue({
        ...mockDndSettings,
        enabled: true,
      });

      const result = await service.updateDndSettings(mockUserId, { enabled: true });

      expect(result.enabled).toBe(true);
    });
  });

  describe('isDndActive', () => {
    it('deve retornar false se DND desabilitado', async () => {
      mockPrismaService.doNotDisturbSettings.findUnique.mockResolvedValue(mockDndSettings);

      const result = await service.isDndActive(mockUserId);

      expect(result).toBe(false);
    });

    it('deve retornar false se horários não configurados', async () => {
      mockPrismaService.doNotDisturbSettings.findUnique.mockResolvedValue({
        ...mockDndSettings,
        enabled: true,
        startTime: null,
        endTime: null,
      });

      const result = await service.isDndActive(mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('getCategoryTypes', () => {
    it('deve retornar tipos de uma categoria', () => {
      const types = service.getCategoryTypes(NotificationCategory.SOCIAL as any);

      expect(types).toContain('NEW_LIKE');
      expect(types).toContain('NEW_COMMENT');
    });
  });
});
