import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock @prisma/client enums
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
    NEW_EVENT: 'NEW_EVENT',
  },
}));

import { NotificationsController } from '../notifications.controller';
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

// Mock data
const mockUserId = 'user-123';
const mockJwtPayload = {
  sub: mockUserId,
  email: 'test@example.com',
  role: 'USER' as const,
  associationId: 'assoc-123',
};

const mockNotification = {
  id: 'notif-123',
  userId: mockUserId,
  type: 'NEW_LIKE',
  category: NotificationCategory.SOCIAL,
  title: 'Novo like',
  body: 'João curtiu sua publicação',
  data: {},
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
  category: NotificationCategory.SOCIAL,
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
  daysOfWeek: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock NotificationsService
const mockNotificationsService = {
  findAll: vi.fn(),
  findGrouped: vi.fn(),
  findOne: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  markCategoryAsRead: vi.fn(),
  markGroupAsRead: vi.fn(),
  delete: vi.fn(),
  clearRead: vi.fn(),
  getUnreadCount: vi.fn(),
  getAllSettings: vi.fn(),
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
  getDndSettings: vi.fn(),
  updateDndSettings: vi.fn(),
  getCategoryTypes: vi.fn(),
};

describe('NotificationsController', () => {
  let controller: NotificationsController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new NotificationsController(mockNotificationsService as unknown as NotificationsService);
  });

  describe('findAll', () => {
    it('deve listar notificações', async () => {
      mockNotificationsService.findAll.mockResolvedValue({
        notifications: [mockNotification],
        total: 1,
        hasMore: false,
      });

      const result = await controller.findAll(mockJwtPayload, { page: 1, limit: 20 }) as any;

      expect(result.notifications).toHaveLength(1);
      expect(mockNotificationsService.findAll).toHaveBeenCalledWith(
        mockUserId,
        { page: 1, limit: 20 }
      );
    });

    it('deve retornar grupos se grouped=true', async () => {
      mockNotificationsService.findGrouped.mockResolvedValue({
        groups: [],
        total: 0,
      });

      await controller.findAll(mockJwtPayload, { grouped: true, page: 1, limit: 20 });

      expect(mockNotificationsService.findGrouped).toHaveBeenCalled();
      expect(mockNotificationsService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('deve retornar contadores', async () => {
      mockNotificationsService.getUnreadCount.mockResolvedValue({
        total: 5,
        byCategory: { SOCIAL: 3, EVENTS: 2, POINTS: 0, RESERVATIONS: 0, SYSTEM: 0 },
      });

      const result = await controller.getUnreadCount(mockJwtPayload);

      expect(result.total).toBe(5);
      expect(mockNotificationsService.getUnreadCount).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma notificação', async () => {
      mockNotificationsService.findOne.mockResolvedValue(mockNotification);

      const result = await controller.findOne(mockJwtPayload, 'notif-123');

      expect(result).toEqual(mockNotification);
      expect(mockNotificationsService.findOne).toHaveBeenCalledWith(mockUserId, 'notif-123');
    });
  });

  describe('markAsRead', () => {
    it('deve marcar como lida', async () => {
      const readNotification = { ...mockNotification, isRead: true };
      mockNotificationsService.markAsRead.mockResolvedValue(readNotification);

      const result = await controller.markAsRead(mockJwtPayload, 'notif-123');

      expect(result.isRead).toBe(true);
      expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith(mockUserId, 'notif-123');
    });
  });

  describe('markAllAsRead', () => {
    it('deve marcar todas como lidas', async () => {
      mockNotificationsService.markAllAsRead.mockResolvedValue(5);

      const result = await controller.markAllAsRead(mockJwtPayload);

      expect(result.markedAsRead).toBe(5);
    });
  });

  describe('markCategoryAsRead', () => {
    it('deve marcar categoria como lida', async () => {
      mockNotificationsService.markCategoryAsRead.mockResolvedValue(3);

      const result = await controller.markCategoryAsRead(
        mockJwtPayload,
        NotificationCategory.SOCIAL as any
      );

      expect(result.markedAsRead).toBe(3);
    });
  });

  describe('markGroupAsRead', () => {
    it('deve marcar grupo como lido', async () => {
      mockNotificationsService.markGroupAsRead.mockResolvedValue(2);

      const result = await controller.markGroupAsRead(mockJwtPayload, 'group-key-123');

      expect(result.markedAsRead).toBe(2);
    });
  });

  describe('delete', () => {
    it('deve excluir notificação', async () => {
      mockNotificationsService.delete.mockResolvedValue(undefined);

      await controller.delete(mockJwtPayload, 'notif-123');

      expect(mockNotificationsService.delete).toHaveBeenCalledWith(mockUserId, 'notif-123');
    });
  });

  describe('clearRead', () => {
    it('deve excluir notificações lidas', async () => {
      mockNotificationsService.clearRead.mockResolvedValue(10);

      const result = await controller.clearRead(mockJwtPayload);

      expect(result.deleted).toBe(10);
    });
  });

  describe('getSettings', () => {
    it('deve retornar todas as configurações', async () => {
      mockNotificationsService.getAllSettings.mockResolvedValue([mockSettings]);

      const result = await controller.getSettings(mockJwtPayload);

      expect(result).toHaveLength(1);
    });
  });

  describe('getCategorySettings', () => {
    it('deve retornar configurações de categoria com tipos', async () => {
      mockNotificationsService.getSettings.mockResolvedValue(mockSettings);
      mockNotificationsService.getCategoryTypes.mockReturnValue(['NEW_LIKE', 'NEW_COMMENT']);

      const result = await controller.getCategorySettings(
        mockJwtPayload,
        NotificationCategory.SOCIAL as any
      );

      expect(result.types).toEqual(['NEW_LIKE', 'NEW_COMMENT']);
    });
  });

  describe('updateSettings', () => {
    it('deve atualizar configurações', async () => {
      mockNotificationsService.updateSettings.mockResolvedValue({
        ...mockSettings,
        pushEnabled: false,
      });

      const result = await controller.updateSettings(
        mockJwtPayload,
        NotificationCategory.SOCIAL as any,
        { pushEnabled: false }
      );

      expect(result.pushEnabled).toBe(false);
    });
  });

  describe('getDnd', () => {
    it('deve retornar configurações DND', async () => {
      mockNotificationsService.getDndSettings.mockResolvedValue(mockDndSettings);

      const result = await controller.getDnd(mockJwtPayload);

      expect(result).toEqual(mockDndSettings);
    });
  });

  describe('updateDnd', () => {
    it('deve atualizar configurações DND', async () => {
      mockNotificationsService.updateDndSettings.mockResolvedValue({
        ...mockDndSettings,
        enabled: true,
      });

      const result = await controller.updateDnd(mockJwtPayload, { enabled: true });

      expect(result.enabled).toBe(true);
    });
  });
});
