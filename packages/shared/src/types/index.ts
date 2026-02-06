// User types
export type UserRole = 'USER' | 'ADMIN' | 'DISPLAY';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  verifiedAt?: Date;
  associationId: string;
  memberId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  associationId: string;
  iat?: number;
  exp?: number;
}

// Points types
export type TransactionType = 'credit' | 'debit';

export type TransactionSource =
  | 'EVENT_CHECKIN'
  | 'STRAVA_RUN'
  | 'STRAVA_RIDE'
  | 'STRAVA_WALK'
  | 'STRAVA_SWIM'
  | 'STRAVA_HIKE'
  | 'DAILY_POST'
  | 'PURCHASE_POINTS'
  | 'PURCHASE_PIX'
  | 'CASHBACK'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'ADMIN_CREDIT'
  | 'ADMIN_DEBIT'
  | 'REFUND'
  | 'SUBSCRIPTION_BONUS'
  | 'REFERRAL'
  | 'MANUAL_ADJUSTMENT';

export interface UserPoints {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  lastTransactionAt: Date;
}

export interface PointTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  source: TransactionSource;
  sourceId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface PointsSummary {
  period: 'today' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
  earned: number;
  spent: number;
  net: number;
  bySource: Record<string, number>;
  byDestination: Record<string, number>;
}

export interface TransferResult {
  transactionId: string;
  amount: number;
  recipient: {
    id: string;
    name: string;
    avatar?: string;
  };
  senderBalanceAfter: number;
  createdAt: Date;
}

export interface RecentRecipient {
  userId: string;
  name: string;
  avatar?: string;
  lastTransferAt: Date;
}

export interface UserSearchResult {
  userId: string;
  name: string;
  avatar?: string;
  memberSince?: string;
}

export type RankingType = 'points' | 'events' | 'strava';
export type RankingPeriod = 'all_time' | 'monthly' | 'weekly';

export interface RankingEntry {
  position: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  value: number;
  isCurrentUser: boolean;
}

export interface RankingResponse {
  type: RankingType;
  period: RankingPeriod;
  updatedAt: Date;
  entries: RankingEntry[];
  currentUser?: {
    position: number;
    value: number;
  };
}

export interface PointsHistoryFilter {
  page?: number;
  limit?: number;
  type?: TransactionType;
  source?: TransactionSource;
  startDate?: string;
  endDate?: string;
}

export interface PointsHistoryResponse {
  data: PointTransaction[];
  meta: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalCount: number;
  };
}

// Admin Points types
export interface AdminPointsSourceConfig {
  type: string;
  label: string;
  defaultPoints?: number;
  pointsPerKm?: number;
  points?: number;
  isActive: boolean;
}

export interface AdminPointsConfig {
  sources: AdminPointsSourceConfig[];
  strava: {
    dailyLimitKm: number;
    eligibleActivities: string[];
  };
  pointsToMoneyRate: number;
  updatedAt?: Date;
}

export interface AdminPointsReportSummary {
  totalInCirculation: number;
  totalEarned: number;
  totalSpent: number;
  totalUsersWithBalance: number;
  totalTransactions: number;
}

export interface AdminPointsReport {
  period: 'today' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
  summary: AdminPointsReportSummary;
  bySource: Array<{ source: string; total: number; count: number }>;
  byDestination: Array<{ destination: string; total: number; count: number }>;
  topEarners: Array<{ id: string; name: string; earned: number }>;
}

export interface AdminGrantDeductResult {
  transactionId: string;
  userId: string;
  userName: string;
  amount: number;
  newBalance: number;
  reason: string;
  createdAt: Date;
}

export interface AdminRefundResult {
  refundTransactionId: string;
  originalTransactionId: string;
  amount: number;
  userId: string;
  newBalance: number;
  reason: string;
  refundedBy: string;
  createdAt: Date;
}

// Subscription types
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'SUSPENDED';

export interface PlanMutators {
  points_events?: number;
  points_strava?: number;
  points_posts?: number;
  discount_store?: number;
  discount_pdv?: number;
  discount_spaces?: number;
  cashback?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  iconUrl?: string;
  color?: string;
  displayOrder: number;
  mutators: PlanMutators;
  isActive?: boolean;
  subscribersCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubscriptionPlanDetail extends SubscriptionPlan {
  benefitsSummary: string[];
  isCurrent: boolean;
  canSubscribe: boolean;
}

export interface UserSubscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  subscribedAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt?: Date;
  suspendedAt?: Date;
}

export interface SubscriptionBenefits {
  hasSubscription: boolean;
  planName?: string;
  mutators: PlanMutators;
  hasVerifiedBadge: boolean;
}

export interface SubscriptionHistoryEntry {
  id: string;
  planName: string;
  action: 'subscribed' | 'changed' | 'cancelled' | 'suspended' | 'reactivated';
  details: Record<string, unknown>;
  createdAt: Date;
}

export interface PlansListResponse {
  plans: SubscriptionPlan[];
  currentSubscription: {
    planId: string;
    status: string;
  } | null;
}

// Admin Subscription types
export interface AdminSubscriberEntry {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  subscription: {
    id: string;
    planId: string;
    planName: string;
    status: string;
    subscribedAt: Date;
  };
}

export interface AdminSubscriptionReport {
  summary: {
    totalSubscribers: number;
    activeSubscribers: number;
    suspendedSubscribers: number;
    cancelledThisPeriod: number;
    newThisPeriod: number;
    netGrowth: number;
    monthlyRevenue: number;
    churnRate: number;
  };
  byPlan: Array<{
    planId: string;
    planName: string;
    subscribers: number;
    percentage: number;
    revenue: number;
  }>;
}

// Profile update types (inferred from updateProfileSchema in validation/index.ts)

// Notification types
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
