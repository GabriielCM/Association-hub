import { z } from 'zod';

// ===========================================
// AUTH SCHEMAS
// ===========================================

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  phone: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const newPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
});

// ===========================================
// USER SCHEMAS
// ===========================================

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

// ===========================================
// POINTS SCHEMAS
// ===========================================

export const transferPointsSchema = z.object({
  toUserId: z.string().cuid('ID do usuário inválido'),
  amount: z.number().int().positive('Quantidade deve ser maior que zero'),
  description: z.string().max(255).optional(),
});

export const adminGrantPointsSchema = z.object({
  userId: z.string().cuid('ID do usuário inválido'),
  amount: z.number().int().positive('Quantidade deve ser maior que zero'),
  description: z.string().max(255, 'Descrição muito longa'),
});

export const adminDeductPointsSchema = z.object({
  userId: z.string().cuid('ID do usuário inválido'),
  amount: z.number().int().positive('Quantidade deve ser maior que zero'),
  reason: z.string().min(1, 'Motivo é obrigatório').max(255),
});

// ===========================================
// SUBSCRIPTION SCHEMAS
// ===========================================

export const subscribeSchema = z.object({
  planId: z.string().cuid('ID do plano inválido'),
});

export const createPlanSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number().int().positive('Preço deve ser maior que zero'),
  interval: z.enum(['MONTHLY', 'YEARLY']),
  pointsMultiplier: z.number().min(1).max(10).default(1),
  storeDiscount: z.number().min(0).max(100).default(0),
  pdvDiscount: z.number().min(0).max(100).default(0),
  spaceDiscount: z.number().min(0).max(100).default(0),
  verifiedBadge: z.boolean().default(false),
});

// ===========================================
// PAGINATION SCHEMA
// ===========================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ===========================================
// TYPE EXPORTS
// ===========================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type TransferPointsInput = z.infer<typeof transferPointsSchema>;
export type AdminGrantPointsInput = z.infer<typeof adminGrantPointsSchema>;
export type AdminDeductPointsInput = z.infer<typeof adminDeductPointsSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
