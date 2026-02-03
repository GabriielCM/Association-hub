// User types
export type UserRole = 'USER' | 'ADMIN' | 'DISPLAY';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

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
