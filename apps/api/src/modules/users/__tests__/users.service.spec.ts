import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';

import { UsersService } from '../users.service';

// Mock data
const mockUserId = 'user-123';
const mockEmail = 'test@example.com';

const mockUser = {
  id: mockUserId,
  email: mockEmail,
  passwordHash: 'hashed-password-should-be-removed',
  name: 'Test User',
  role: 'USER',
  status: 'ACTIVE',
  associationId: 'assoc-123',
  phone: '11999999999',
  avatarUrl: null,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  points: { id: 'points-1', userId: mockUserId, balance: 1000, lifetimeEarned: 5000 },
  subscriptions: [
    {
      id: 'sub-1',
      status: 'ACTIVE',
      plan: { id: 'plan-1', name: 'Premium' },
    },
  ],
  badges: [
    {
      id: 'ub-1',
      isFeatured: true,
      badge: { id: 'badge-1', name: 'Early Adopter' },
    },
  ],
};

const mockUserWithoutRelations = {
  id: mockUserId,
  email: mockEmail,
  passwordHash: 'hashed-password-should-be-removed',
  name: 'Test User',
  role: 'USER',
  status: 'ACTIVE',
  associationId: 'assoc-123',
  phone: '11999999999',
  avatarUrl: null,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  points: { id: 'points-1', userId: mockUserId, balance: 1000, lifetimeEarned: 5000 },
};

// Mock PrismaService
const mockPrismaService = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UsersService(mockPrismaService as any);
  });

  describe('findById', () => {
    it('deve retornar usuário com relações (points, subscriptions, badges)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(mockUserId);

      expect(result.id).toBe(mockUserId);
      expect(result.points).toBeDefined();
      expect(result.subscriptions).toBeDefined();
      expect(result.badges).toBeDefined();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        include: {
          points: true,
          subscriptions: {
            where: { status: 'ACTIVE' },
            include: { plan: true },
          },
          badges: {
            where: { isFeatured: true },
            include: { badge: true },
            take: 3,
          },
        },
      });
    });

    it('deve lançar NotFoundException se usuário não existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });

    it('deve remover passwordHash da resposta', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(mockUserId);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe(mockEmail);
    });
  });

  describe('findByEmail', () => {
    it('deve retornar usuário por email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockEmail);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail.toLowerCase() },
      });
    });

    it('deve retornar null para email inexistente', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('deve fazer lookup case-insensitive', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await service.findByEmail('TEST@EXAMPLE.COM');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('getProfile', () => {
    it('deve retornar perfil do usuário', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUserId);

      expect(result.id).toBe(mockUserId);
      expect(result.name).toBe('Test User');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('deve propagar NotFoundException', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('deve atualizar todos os campos', async () => {
      const updateData = {
        name: 'Updated Name',
        phone: '11888888888',
        avatarUrl: 'https://example.com/avatar.jpg',
      };
      const updatedUser = { ...mockUserWithoutRelations, ...updateData };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(mockUserId, updateData);

      expect(result.name).toBe('Updated Name');
      expect(result.phone).toBe('11888888888');
      expect(result.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: updateData,
        include: { points: true },
      });
    });

    it('deve atualizar campos parciais', async () => {
      const updateData = { name: 'Only Name Updated' };
      const updatedUser = { ...mockUserWithoutRelations, name: 'Only Name Updated' };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(mockUserId, updateData);

      expect(result.name).toBe('Only Name Updated');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: updateData,
        include: { points: true },
      });
    });

    it('deve incluir points na resposta', async () => {
      const updateData = { name: 'New Name' };
      mockPrismaService.user.update.mockResolvedValue(mockUserWithoutRelations);

      const result = await service.updateProfile(mockUserId, updateData);

      expect(result.points).toBeDefined();
      expect(result.points.balance).toBe(1000);
    });

    it('deve remover passwordHash da resposta', async () => {
      const updateData = { name: 'New Name' };
      mockPrismaService.user.update.mockResolvedValue(mockUserWithoutRelations);

      const result = await service.updateProfile(mockUserId, updateData);

      expect(result).not.toHaveProperty('passwordHash');
    });
  });
});
