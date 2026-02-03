import { vi } from 'vitest';

export const createMockPrismaService = () => ({
  // UserPoints model
  userPoints: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    aggregate: vi.fn(),
  },

  // PointTransaction model
  pointTransaction: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    aggregate: vi.fn(),
  },

  // User model
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },

  // TransferRecipient model
  transferRecipient: {
    findMany: vi.fn(),
    upsert: vi.fn(),
  },

  // PointsConfig model
  pointsConfig: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },

  // StravaConnection model
  stravaConnection: {
    findMany: vi.fn(),
  },

  // StravaActivity model
  stravaActivity: {
    groupBy: vi.fn(),
  },

  // SubscriptionPlan model
  subscriptionPlan: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },

  // UserSubscription model
  userSubscription: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },

  // SubscriptionHistory model
  subscriptionHistory: {
    findMany: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },

  // Transaction handling
  $transaction: vi.fn(),
});

export type MockPrismaService = ReturnType<typeof createMockPrismaService>;

// Helper to reset all mocks
export const resetMockPrisma = (mockPrisma: MockPrismaService) => {
  Object.values(mockPrisma).forEach((model) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method) => {
        if (typeof method === 'function' && 'mockReset' in method) {
          (method as ReturnType<typeof vi.fn>).mockReset();
        }
      });
    } else if (typeof model === 'function' && 'mockReset' in model) {
      (model as ReturnType<typeof vi.fn>).mockReset();
    }
  });
};
