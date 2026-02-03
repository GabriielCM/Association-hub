export const mockUserPoints = {
  userId: 'user-123',
  balance: 1000,
  lifetimeEarned: 5000,
  lifetimeSpent: 4000,
  updatedAt: new Date('2024-06-01'),
};

export const mockUserPoints2 = {
  userId: 'user-456',
  balance: 500,
  lifetimeEarned: 2000,
  lifetimeSpent: 1500,
  updatedAt: new Date('2024-06-01'),
};

export const mockUserPointsZero = {
  userId: 'user-zero',
  balance: 0,
  lifetimeEarned: 0,
  lifetimeSpent: 0,
  updatedAt: new Date('2024-06-01'),
};

export const mockTransaction = {
  id: 'tx-123',
  userId: 'user-123',
  amount: 100,
  balance: 1100,
  source: 'EVENT_CHECKIN',
  description: 'Check-in no evento X',
  metadata: null,
  sourceId: null,
  refundedTransactionId: null,
  createdAt: new Date('2024-06-01'),
};

export const mockCreditTransaction = {
  id: 'tx-credit',
  userId: 'user-123',
  amount: 200,
  balance: 1200,
  source: 'ADMIN_CREDIT',
  description: 'Crédito administrativo',
  metadata: { grantedBy: 'admin-123' },
  sourceId: null,
  refundedTransactionId: null,
  createdAt: new Date('2024-06-01'),
};

export const mockDebitTransaction = {
  id: 'tx-debit',
  userId: 'user-123',
  amount: -150,
  balance: 850,
  source: 'STORE_PURCHASE',
  description: 'Compra na loja',
  metadata: null,
  sourceId: 'order-123',
  refundedTransactionId: null,
  createdAt: new Date('2024-06-01'),
};

export const mockTransferOutTransaction = {
  id: 'tx-transfer-out',
  userId: 'user-123',
  amount: -100,
  balance: 900,
  source: 'TRANSFER_OUT',
  description: 'Transferência para Another User',
  metadata: { recipientId: 'user-456', recipientName: 'Another User' },
  sourceId: null,
  refundedTransactionId: null,
  createdAt: new Date('2024-06-01'),
};

export const mockTransferInTransaction = {
  id: 'tx-transfer-in',
  userId: 'user-456',
  amount: 100,
  balance: 600,
  source: 'TRANSFER_IN',
  description: 'Transferência de Test User',
  metadata: { senderId: 'user-123', senderName: 'Test User' },
  sourceId: null,
  refundedTransactionId: null,
  createdAt: new Date('2024-06-01'),
};

export const mockRefundedTransaction = {
  id: 'tx-refunded',
  userId: 'user-123',
  amount: 100,
  balance: 1100,
  source: 'EVENT_CHECKIN',
  description: 'Check-in estornado',
  metadata: null,
  sourceId: null,
  refundedTransactionId: 'tx-refund',
  createdAt: new Date('2024-05-01'),
};

export const mockTransferRecipient = {
  id: 'recipient-1',
  userId: 'user-123',
  recipientId: 'user-456',
  transferCount: 5,
  lastTransferAt: new Date('2024-06-01'),
};

export const mockPointsConfig = {
  id: 'config-1',
  associationId: 'assoc-1',
  eventCheckInPoints: 10,
  stravaDailyMaxPoints: 50,
  stravaPointsPerKm: 5,
  stravaMinKmForPoints: 1,
  cashbackPercentage: 5,
  pointsToMoneyRate: 100,
  dailyPostPoints: 5,
  referralPoints: 100,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockDefaultConfig = {
  eventCheckInPoints: 10,
  stravaDailyMaxPoints: 50,
  stravaPointsPerKm: 5,
  stravaMinKmForPoints: 1,
  cashbackPercentage: 5,
  pointsToMoneyRate: 100,
  dailyPostPoints: 5,
  referralPoints: 100,
};
