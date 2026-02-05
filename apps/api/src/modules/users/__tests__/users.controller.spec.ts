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
  updateProfile: vi.fn(),
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

  describe('updateProfile', () => {
    it('deve atualizar perfil com todos os campos', async () => {
      const updateData = {
        name: 'Updated Name',
        phone: '11888888888',
        avatarUrl: 'https://example.com/avatar.jpg',
      };
      const updatedProfile = { ...mockProfile, ...updateData };
      mockUsersService.updateProfile.mockResolvedValue(updatedProfile);

      const result = await controller.updateProfile(mockJwtPayload, updateData);

      expect(result.data.name).toBe('Updated Name');
      expect(result.data.phone).toBe('11888888888');
      expect(result.data.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(mockUserId, updateData);
    });

    it('deve atualizar perfil com campos parciais', async () => {
      const updateData = { name: 'Only Name' };
      const updatedProfile = { ...mockProfile, name: 'Only Name' };
      mockUsersService.updateProfile.mockResolvedValue(updatedProfile);

      const result = await controller.updateProfile(mockJwtPayload, updateData);

      expect(result.data.name).toBe('Only Name');
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(mockUserId, updateData);
    });

    it('deve formatar resposta com success: true', async () => {
      const updateData = { name: 'New Name' };
      mockUsersService.updateProfile.mockResolvedValue({ ...mockProfile, ...updateData });

      const result = await controller.updateProfile(mockJwtPayload, updateData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });
});
