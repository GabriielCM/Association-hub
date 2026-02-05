import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
  compare: vi.fn(),
  hash: vi.fn(),
}));

import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';

// Mock data
const mockUserId = 'user-123';
const mockEmail = 'test@example.com';
const mockPassword = 'password123';
const mockPasswordHash = 'hashed-password';
const mockAssociationId = 'assoc-123';

const mockUser = {
  id: mockUserId,
  email: mockEmail,
  passwordHash: mockPasswordHash,
  name: 'Test User',
  role: 'USER',
  status: 'ACTIVE',
  associationId: mockAssociationId,
  phone: null,
  avatarUrl: null,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAssociation = {
  id: mockAssociationId,
  name: 'Test Association',
  slug: 'test',
};

const mockRefreshToken = {
  id: 'token-123',
  token: 'refresh-token-value',
  userId: mockUserId,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  user: mockUser,
};

const mockExpiredRefreshToken = {
  ...mockRefreshToken,
  expiresAt: new Date(Date.now() - 1000), // Expired
};

const mockJwtPayload = {
  sub: mockUserId,
  email: mockEmail,
  role: 'USER' as const,
  associationId: mockAssociationId,
};

// Mock PrismaService
const mockPrismaService = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  association: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  userPoints: {
    create: vi.fn(),
  },
  refreshToken: {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
};

// Mock UsersService
const mockUsersService = {
  findByEmail: vi.fn(),
  findById: vi.fn(),
};

// Mock JwtService
const mockJwtService = {
  sign: vi.fn().mockReturnValue('mock-jwt-token'),
};

// Mock ConfigService
const mockConfigService = {
  get: vi.fn((key: string, defaultValue?: string) => {
    const config: Record<string, string> = {
      JWT_SECRET: 'test-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      JWT_REFRESH_EXPIRATION: '30d',
    };
    return config[key] || defaultValue;
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(
      mockPrismaService as any,
      mockUsersService as any,
      mockJwtService as any,
      mockConfigService as any
    );
  });

  describe('login', () => {
    it('deve autenticar com credenciais válidas', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({
        email: mockEmail,
        password: mockPassword,
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail.toLowerCase() },
      });
    });

    it('deve lançar UnauthorizedException para email inexistente', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nonexistent@example.com', password: mockPassword })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException para senha incorreta', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ email: mockEmail, password: 'wrong-password' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException para usuário inativo', async () => {
      const inactiveUser = { ...mockUser, status: 'INACTIVE' };
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await expect(
        service.login({ email: mockEmail, password: mockPassword })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve atualizar lastLoginAt após login', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await service.login({ email: mockEmail, password: mockPassword });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it('deve fazer lookup de email case-insensitive', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await service.login({
        email: 'TEST@EXAMPLE.COM',
        password: mockPassword,
      });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('register', () => {
    const registerDto = {
      name: 'New User',
      email: 'new@example.com',
      password: 'NewPassword123',
      phone: '11999999999',
    };

    it('deve criar usuário com sucesso', async () => {
      const newUser = { ...mockUser, email: registerDto.email, name: registerDto.name };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.association.findFirst.mockResolvedValue(mockAssociation);
      vi.mocked(bcrypt.hash).mockResolvedValue(mockPasswordHash as never);
      mockPrismaService.user.create.mockResolvedValue(newUser);
      mockPrismaService.userPoints.create.mockResolvedValue({ userId: newUser.id });
      mockPrismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('deve lançar ConflictException para email duplicado', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('deve criar registro UserPoints', async () => {
      const newUser = { ...mockUser, id: 'new-user-id' };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.association.findFirst.mockResolvedValue(mockAssociation);
      vi.mocked(bcrypt.hash).mockResolvedValue(mockPasswordHash as never);
      mockPrismaService.user.create.mockResolvedValue(newUser);
      mockPrismaService.userPoints.create.mockResolvedValue({ userId: newUser.id });
      mockPrismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);

      await service.register(registerDto);

      expect(mockPrismaService.userPoints.create).toHaveBeenCalledWith({
        data: { userId: newUser.id },
      });
    });

    it('deve criar associação padrão se não existir', async () => {
      const newAssociation = { id: 'new-assoc', name: 'Associação Demo', slug: 'demo' };
      const newUser = { ...mockUser, associationId: newAssociation.id };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.association.findFirst.mockResolvedValue(null);
      mockPrismaService.association.create.mockResolvedValue(newAssociation);
      vi.mocked(bcrypt.hash).mockResolvedValue(mockPasswordHash as never);
      mockPrismaService.user.create.mockResolvedValue(newUser);
      mockPrismaService.userPoints.create.mockResolvedValue({ userId: newUser.id });
      mockPrismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);

      await service.register(registerDto);

      expect(mockPrismaService.association.create).toHaveBeenCalledWith({
        data: {
          name: 'Associação Demo',
          slug: 'demo',
        },
      });
    });

    it('deve fazer hash da senha com bcrypt', async () => {
      const newUser = { ...mockUser };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.association.findFirst.mockResolvedValue(mockAssociation);
      vi.mocked(bcrypt.hash).mockResolvedValue(mockPasswordHash as never);
      mockPrismaService.user.create.mockResolvedValue(newUser);
      mockPrismaService.userPoints.create.mockResolvedValue({ userId: newUser.id });
      mockPrismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('deve gerar tokens de acesso e refresh', async () => {
      const newUser = { ...mockUser };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.association.findFirst.mockResolvedValue(mockAssociation);
      vi.mocked(bcrypt.hash).mockResolvedValue(mockPasswordHash as never);
      mockPrismaService.user.create.mockResolvedValue(newUser);
      mockPrismaService.userPoints.create.mockResolvedValue({ userId: newUser.id });
      mockPrismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);

      const result = await service.register(registerDto);

      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresIn).toBe(900);
    });

    it('deve fazer lookup de email case-insensitive no registro', async () => {
      const newUser = { ...mockUser };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.association.findFirst.mockResolvedValue(mockAssociation);
      vi.mocked(bcrypt.hash).mockResolvedValue(mockPasswordHash as never);
      mockPrismaService.user.create.mockResolvedValue(newUser);
      mockPrismaService.userPoints.create.mockResolvedValue({ userId: newUser.id });
      mockPrismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);

      await service.register({
        ...registerDto,
        email: 'NEW@EXAMPLE.COM',
      });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'new@example.com' },
      });
    });
  });

  describe('refreshToken', () => {
    it('deve renovar tokens com refreshToken válido', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);
      mockPrismaService.refreshToken.delete.mockResolvedValue(mockRefreshToken);
      mockPrismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);

      const result = await service.refreshToken({ refreshToken: mockRefreshToken.token });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
    });

    it('deve lançar UnauthorizedException para token inexistente', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        service.refreshToken({ refreshToken: 'invalid-token' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException para token expirado', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockExpiredRefreshToken);
      mockPrismaService.refreshToken.delete.mockResolvedValue(mockExpiredRefreshToken);

      await expect(
        service.refreshToken({ refreshToken: mockExpiredRefreshToken.token })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve deletar token antigo após renovação', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);
      mockPrismaService.refreshToken.delete.mockResolvedValue(mockRefreshToken);
      mockPrismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);

      await service.refreshToken({ refreshToken: mockRefreshToken.token });

      expect(mockPrismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: mockRefreshToken.id },
      });
    });
  });

  describe('logout', () => {
    it('deve deletar todos os refresh tokens do usuário', async () => {
      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 2 });

      await service.logout(mockUserId);

      expect(mockPrismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });
  });

  describe('validateUser', () => {
    it('deve retornar payload para usuário ativo', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(mockJwtPayload);

      expect(result).toEqual(mockJwtPayload);
    });

    it('deve lançar UnauthorizedException para usuário inexistente', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser(mockJwtPayload)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('deve lançar UnauthorizedException para usuário inativo', async () => {
      const inactiveUser = { ...mockUser, status: 'INACTIVE' };
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

      await expect(service.validateUser(mockJwtPayload)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
