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
export type TransactionSource =
  | 'CHECK_IN'
  | 'STRAVA'
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
  id: string;
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  balance: number;
  source: TransactionSource;
  description?: string;
  metadata?: Record<string, unknown>;
  relatedUserId?: string;
  createdAt: Date;
}

// Subscription types
export type PlanInterval = 'MONTHLY' | 'YEARLY';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PAST_DUE' | 'PAUSED';

export interface SubscriptionPlan {
  id: string;
  associationId: string;
  name: string;
  description?: string;
  price: number;
  interval: PlanInterval;
  pointsMultiplier: number;
  storeDiscount: number;
  pdvDiscount: number;
  spaceDiscount: number;
  verifiedBadge: boolean;
  isActive: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
}

// Profile update types
export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

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
