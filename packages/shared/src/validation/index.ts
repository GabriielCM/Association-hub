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
// PROFILE SCHEMAS
// ===========================================

export const updateProfileFullSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(50, 'Nome muito longo')
    .optional(),
  username: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(30, 'Username muito longo')
    .regex(/^[a-z0-9_]+$/, 'Apenas letras minúsculas, números e underscore')
    .optional(),
  bio: z.string().max(150, 'Bio muito longa').optional(),
  phone: z.string().optional(),
});

export const updateBadgesDisplaySchema = z.object({
  badgeIds: z
    .array(z.string().min(1))
    .min(1, 'Selecione pelo menos 1 badge')
    .max(3, 'Máximo 3 badges'),
});

// ===========================================
// POINTS SCHEMAS
// ===========================================

export const transferPointsSchema = z.object({
  recipientId: z.string().min(1, 'ID do destinatário é obrigatório'),
  amount: z.number().int().positive('Quantidade deve ser maior que zero'),
  message: z.string().max(100, 'Mensagem muito longa').optional(),
});

export const pointsHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['credit', 'debit']).optional(),
  source: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const adminGrantPointsSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  amount: z.number().int().positive('Quantidade deve ser maior que zero'),
  reason: z.string().min(1, 'Motivo é obrigatório').max(500, 'Motivo muito longo'),
});

export const adminDeductPointsSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  amount: z.number().int().positive('Quantidade deve ser maior que zero'),
  reason: z.string().min(1, 'Motivo é obrigatório').max(500, 'Motivo muito longo'),
});

export const adminRefundSchema = z.object({
  reason: z.string().min(1, 'Motivo é obrigatório').max(500, 'Motivo muito longo'),
});

// ===========================================
// SUBSCRIPTION SCHEMAS
// ===========================================

export const subscribeSchema = z.object({
  planId: z.string().min(1, 'ID do plano é obrigatório'),
});

export const changePlanSchema = z.object({
  planId: z.string().min(1, 'ID do plano é obrigatório'),
});

export const cancelSubscriptionSchema = z.object({
  reason: z.string().max(500, 'Motivo muito longo').optional(),
});

export const mutatorsSchema = z.object({
  points_events: z.number().min(0).max(10).default(1.0),
  points_strava: z.number().min(0).max(10).default(1.0),
  points_posts: z.number().min(0).max(10).default(1.0),
  discount_store: z.number().min(0).max(100).default(0),
  discount_pdv: z.number().min(0).max(100).default(0),
  discount_spaces: z.number().min(0).max(100).default(0),
  cashback: z.number().min(0).max(100).default(5.0),
});

export const createPlanSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(50, 'Nome muito longo'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(500, 'Descrição muito longa'),
  priceMonthly: z.number().positive('Preço deve ser maior que zero'),
  iconUrl: z.string().url('URL inválida').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser hexadecimal').optional(),
  displayOrder: z.number().int().min(1).max(3).default(1),
  mutators: mutatorsSchema.optional(),
});

export const suspendUserSchema = z.object({
  reason: z.string().min(1, 'Motivo é obrigatório').max(500, 'Motivo muito longo'),
});

export const adminUpdatePointsConfigSchema = z.object({
  sources: z.array(z.object({
    type: z.string(),
    isActive: z.boolean(),
    defaultPoints: z.number().int().optional(),
    pointsPerKm: z.number().optional(),
    points: z.number().int().optional(),
  })).optional(),
  strava: z.object({
    dailyLimitKm: z.number().min(0).max(100),
    eligibleActivities: z.array(z.string()),
  }).optional(),
  pointsToMoneyRate: z.number().positive().optional(),
});

// ===========================================
// WALLET / QR SCHEMAS
// ===========================================

export const scanQrSchema = z.object({
  qrCodeData: z.string().min(1, 'Dados do QR são obrigatórios'),
  qrCodeHash: z.string().min(1, 'Hash do QR é obrigatório'),
});

export const pdvPaymentSchema = z.object({
  checkoutCode: z.string().min(1, 'Código do checkout é obrigatório'),
  biometricConfirmed: z.boolean().optional(),
});

export const walletSummaryQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year']).default('month'),
});

// ===========================================
// EVENT SCHEMAS
// ===========================================

export const eventCategoryValues = [
  'SOCIAL', 'SPORTS', 'CULTURAL', 'EDUCATIONAL', 'NETWORKING',
  'GASTRO', 'MUSIC', 'ART', 'GAMES', 'INSTITUTIONAL',
] as const;

export const badgeCriteriaValues = ['FIRST_CHECKIN', 'ALL_CHECKINS', 'AT_LEAST_ONE'] as const;

export const createEventSchema = z.object({
  title: z.string().min(5, 'Titulo deve ter pelo menos 5 caracteres').max(100, 'Titulo muito longo'),
  description: z.string().min(10, 'Descricao deve ter pelo menos 10 caracteres').max(2000, 'Descricao muito longa'),
  category: z.enum(eventCategoryValues),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser hexadecimal').optional(),
  startDate: z.string().min(1, 'Data de inicio e obrigatoria'),
  endDate: z.string().min(1, 'Data de termino e obrigatoria'),
  locationName: z.string().min(3, 'Local deve ter pelo menos 3 caracteres').max(200, 'Local muito longo'),
  locationAddress: z.string().max(500, 'Endereco muito longo').optional(),
  bannerFeed: z.string().url('URL invalida').optional(),
  bannerDisplay: z.array(z.string().url('URL invalida')).optional(),
  pointsTotal: z.number().int().min(1, 'Minimo 1 ponto').max(10000, 'Maximo 10.000 pontos'),
  checkinsCount: z.number().int().min(1, 'Minimo 1 check-in').max(20, 'Maximo 20 check-ins'),
  checkinInterval: z.number().int().min(0).max(1440).optional(),
  badgeId: z.string().optional(),
  badgeCriteria: z.enum(badgeCriteriaValues).optional(),
  capacity: z.number().int().min(1).optional(),
  externalLink: z.string().url('URL invalida').optional(),
});

export const checkinSchema = z.object({
  eventId: z.string().min(1),
  checkinNumber: z.number().int().min(1),
  securityToken: z.string().min(1),
  timestamp: z.number(),
});

export const createEventCommentSchema = z.object({
  text: z.string().min(1, 'Comentario nao pode ser vazio').max(500, 'Comentario muito longo'),
});

export const eventsFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(20),
  filter: z.enum(['all', 'upcoming', 'ongoing', 'past', 'confirmed']).default('upcoming'),
  category: z.enum(eventCategoryValues).optional(),
  search: z.string().optional(),
});

export const manualCheckinSchema = z.object({
  userId: z.string().min(1, 'ID do usuario e obrigatorio'),
  checkinNumber: z.number().int().min(1, 'Numero do check-in e obrigatorio'),
  reason: z.string().min(5, 'Motivo deve ter pelo menos 5 caracteres').max(500, 'Motivo muito longo'),
});

export const cancelEventSchema = z.object({
  reason: z.string().min(1, 'Motivo e obrigatorio').max(500, 'Motivo muito longo'),
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
export type UpdateProfileFullInput = z.infer<typeof updateProfileFullSchema>;
export type UpdateBadgesDisplayInput = z.infer<typeof updateBadgesDisplaySchema>;
export type TransferPointsInput = z.infer<typeof transferPointsSchema>;
export type PointsHistoryQueryInput = z.infer<typeof pointsHistoryQuerySchema>;
export type AdminGrantPointsInput = z.infer<typeof adminGrantPointsSchema>;
export type AdminDeductPointsInput = z.infer<typeof adminDeductPointsSchema>;
export type AdminRefundInput = z.infer<typeof adminRefundSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type ChangePlanInput = z.infer<typeof changePlanSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;
export type MutatorsInput = z.infer<typeof mutatorsSchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type SuspendUserInput = z.infer<typeof suspendUserSchema>;
export type AdminUpdatePointsConfigInput = z.infer<typeof adminUpdatePointsConfigSchema>;
export type ScanQrInput = z.infer<typeof scanQrSchema>;
export type PdvPaymentInput = z.infer<typeof pdvPaymentSchema>;
export type WalletSummaryQueryInput = z.infer<typeof walletSummaryQuerySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CheckinInput = z.infer<typeof checkinSchema>;
export type CreateEventCommentInput = z.infer<typeof createEventCommentSchema>;
export type EventsFilterInput = z.infer<typeof eventsFilterSchema>;
export type ManualCheckinInput = z.infer<typeof manualCheckinSchema>;
export type CancelEventInput = z.infer<typeof cancelEventSchema>;
