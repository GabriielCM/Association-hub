import { describe, it, expect, beforeEach, vi } from 'vitest';

import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

// Mock data
const mockUserId = 'user-123';
const mockEmail = 'test@example.com';
const mockAssociationId = 'assoc-123';

const mockJwtPayload = {
  sub: mockUserId,
  email: mockEmail,
  role: 'USER' as const,
  associationId: mockAssociationId,
};

const mockProfile = {
  id: mockUserId,
  email: mockEmail,
  name: 'Test User',
  role: 'USER',
  status: 'ACTIVE',
  associationId: mockAssociationId,
  phone: '11999999999',
  avatarUrl: null,
  points: { id: 'points-1', userId: mockUserId, balance: 1000, lifetimeEarned: 5000 },
  subscriptions: [],
  badges: [],
};

// Mock UsersService
const mockUsersService = {
  getProfile: vi.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new UsersController(mockUsersService as unknown as UsersService);
  });

  describe('getProfile', () => {
    it('deve retornar perfil do usuário autenticado', async () => {
      mockUsersService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(mockJwtPayload);

      expect(result.data).toEqual(mockProfile);
      expect(result.data.id).toBe(mockUserId);
    });

    it('deve formatar resposta com success: true', async () => {
      mockUsersService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(mockJwtPayload);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('deve passar user.sub para o service', async () => {
      mockUsersService.getProfile.mockResolvedValue(mockProfile);

      await controller.getProfile(mockJwtPayload);

      expect(mockUsersService.getProfile).toHaveBeenCalledWith(mockUserId);
    });
  });

});
