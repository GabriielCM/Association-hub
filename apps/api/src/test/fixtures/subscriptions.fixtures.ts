export const DEFAULT_MUTATORS = {
  points_events: 1.0,
  points_strava: 1.0,
  points_posts: 1.0,
  discount_store: 0,
  discount_pdv: 0,
  discount_spaces: 0,
  cashback: 5.0,
};

export const mockPlanBasic = {
  id: 'plan-basic',
  associationId: 'assoc-1',
  name: 'Plano Básico',
  description: 'Plano básico para membros',
  priceMonthly: 2990, // R$ 29,90 in cents
  iconUrl: null,
  color: '#6366F1',
  displayOrder: 1,
  isActive: true,
  hasVerifiedBadge: false,
  mutators: DEFAULT_MUTATORS,
  subscribersCount: 10,
  createdBy: 'admin-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockPlanPremium = {
  id: 'plan-premium',
  associationId: 'assoc-1',
  name: 'Plano Premium',
  description: 'Plano premium com benefícios extras',
  priceMonthly: 4990, // R$ 49,90 in cents
  iconUrl: 'https://example.com/premium-icon.png',
  color: '#F59E0B',
  displayOrder: 2,
  isActive: true,
  hasVerifiedBadge: true,
  mutators: {
    points_events: 1.5,
    points_strava: 1.5,
    points_posts: 1.5,
    discount_store: 10,
    discount_pdv: 5,
    discount_spaces: 15,
    cashback: 10.0,
  },
  subscribersCount: 5,
  createdBy: 'admin-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockPlanInactive = {
  id: 'plan-inactive',
  associationId: 'assoc-1',
  name: 'Plano Descontinuado',
  description: 'Plano não mais disponível',
  priceMonthly: 1990,
  iconUrl: null,
  color: '#9CA3AF',
  displayOrder: 3,
  isActive: false,
  hasVerifiedBadge: false,
  mutators: DEFAULT_MUTATORS,
  subscribersCount: 2,
  createdBy: 'admin-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-01'),
};

export const mockUserSubscription = {
  id: 'sub-123',
  userId: 'user-123',
  planId: 'plan-basic',
  status: 'ACTIVE',
  currentPeriodStart: new Date('2024-06-01'),
  currentPeriodEnd: new Date('2024-07-01'),
  cancelledAt: null,
  cancelReason: null,
  suspendedAt: null,
  suspendedBy: null,
  suspendReason: null,
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-01'),
  plan: mockPlanBasic,
};

export const mockUserSubscriptionSuspended = {
  id: 'sub-suspended',
  userId: 'user-456',
  planId: 'plan-basic',
  status: 'SUSPENDED',
  currentPeriodStart: new Date('2024-06-01'),
  currentPeriodEnd: new Date('2024-07-01'),
  cancelledAt: null,
  cancelReason: null,
  suspendedAt: new Date('2024-06-15'),
  suspendedBy: 'admin-123',
  suspendReason: 'Violação dos termos',
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-15'),
  plan: mockPlanBasic,
};

export const mockUserSubscriptionCancelled = {
  id: 'sub-cancelled',
  userId: 'user-789',
  planId: 'plan-premium',
  status: 'CANCELLED',
  currentPeriodStart: new Date('2024-05-01'),
  currentPeriodEnd: new Date('2024-06-01'),
  cancelledAt: new Date('2024-05-20'),
  cancelReason: 'Motivos pessoais',
  suspendedAt: null,
  suspendedBy: null,
  suspendReason: null,
  createdAt: new Date('2024-05-01'),
  updatedAt: new Date('2024-05-20'),
  plan: mockPlanPremium,
};

export const mockSubscriptionHistory = {
  id: 'history-1',
  userId: 'user-123',
  planId: 'plan-basic',
  action: 'SUBSCRIBED',
  metadata: null,
  createdAt: new Date('2024-06-01'),
  plan: mockPlanBasic,
};

export const mockSubscriptionHistoryChanged = {
  id: 'history-2',
  userId: 'user-123',
  planId: 'plan-premium',
  action: 'CHANGED',
  metadata: { previousPlanId: 'plan-basic', previousPlanName: 'Plano Básico' },
  createdAt: new Date('2024-06-15'),
  plan: mockPlanPremium,
};

export const mockSubscriptionHistoryCancelled = {
  id: 'history-3',
  userId: 'user-123',
  planId: 'plan-premium',
  action: 'CANCELLED',
  metadata: { reason: 'Motivos pessoais' },
  createdAt: new Date('2024-06-20'),
  plan: mockPlanPremium,
};
