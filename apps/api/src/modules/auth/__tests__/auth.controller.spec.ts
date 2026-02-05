import { describe, it, expect, beforeEach, vi } from 'vitest';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

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

const mockAuthTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 900,
};

// Mock AuthService
const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  refreshToken: vi.fn(),
  logout: vi.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AuthController(mockAuthService as unknown as AuthService);
  });

  describe('login', () => {
    const loginDto = {
      email: mockEmail,
      password: 'password123',
    };

    it('deve retornar tokens para credenciais válidas', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthTokens);

      const result = await controller.login(loginDto);

      expect(result.data).toEqual(mockAuthTokens);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('deve formatar resposta com success: true', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthTokens);

      const result = await controller.login(loginDto);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('register', () => {
    const registerDto = {
      name: 'New User',
      email: 'new@example.com',
      password: 'NewPassword123',
      phone: '11999999999',
    };

    it('deve criar usuário e retornar tokens', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthTokens);

      const result = await controller.register(registerDto);

      expect(result.data).toEqual(mockAuthTokens);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });

    it('deve formatar resposta com success: true', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthTokens);

      const result = await controller.register(registerDto);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('deve renovar tokens', async () => {
      mockAuthService.refreshToken.mockResolvedValue(mockAuthTokens);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(result.data).toEqual(mockAuthTokens);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
    });

    it('deve formatar resposta com success: true', async () => {
      mockAuthService.refreshToken.mockResolvedValue(mockAuthTokens);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('logout', () => {
    it('deve fazer logout do usuário autenticado', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await controller.logout(mockJwtPayload);

      expect(mockAuthService.logout).toHaveBeenCalledWith(mockUserId);
    });

    it('deve retornar success: true e mensagem', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(mockJwtPayload);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Logout realizado com sucesso');
    });
  });
});
