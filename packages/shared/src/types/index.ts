// User types
export type UserRole = 'USER' | 'ADMIN' | 'DISPLAY';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  verifiedAt?: Date;
  associationId: string;
  memberId?: string;
  usernameChangedAt?: Date;
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

// ===========================================
// PROFILE TYPES
// ===========================================

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  isVerified: boolean;
  isMe: boolean;
  stats: {
    points: number;
    lifetimePoints: number;
  };
  badges: ProfileBadge[];
  subscription: string | null;
  memberSince: Date;
}

export interface ProfileBadge {
  id: string;
  name: string;
  iconUrl?: string;
  description?: string;
  earnedAt?: Date;
}

export interface UserBadge {
  id: string;
  name: string;
  iconUrl?: string;
  description?: string;
  criteria: {
    type: string;
    value: number;
  };
  earnedAt: Date;
  isFeatured: boolean;
}

export interface UserBadgesResponse {
  data: UserBadge[];
  total: number;
  featured: number;
}

export interface UserRankingEntry {
  type: string;
  name: string;
  position: number | null;
  totalParticipants: number | null;
  value: number;
  unit: string;
}

export interface UserRankingsResponse {
  data: UserRankingEntry[];
}

export interface UsernameCheckResponse {
  username: string;
  isAvailable: boolean;
}

export interface UpdateProfileResult {
  id: string;
  name: string;
  username?: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  usernameChangedAt?: Date;
  updatedAt: Date;
}

export interface AvatarUploadResult {
  id: string;
  avatarUrl: string;
  updatedAt: Date;
}

export interface UpdateBadgesDisplayResult {
  featuredBadges: Array<{
    id: string;
    name: string;
    iconUrl?: string;
  }>;
}

// ===========================================
// CARD (CARTEIRINHA) TYPES
// ===========================================

export type CardStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLOCKED';
export type CardUsageType = 'CHECKIN' | 'BENEFIT_USED' | 'EVENT_VALIDATION' | 'QR_SCANNED';

export interface MemberCard {
  id: string;
  cardNumber: string;
  status: CardStatus;
  statusReason?: string;
  issuedAt: Date;
  expiresAt?: Date;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
    memberId?: string;
  };
  association: {
    id: string;
    name: string;
    logoUrl?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
}

export interface CardQrCode {
  qrCodeData: string;
  qrCodeHash: string;
  cardNumber: string;
}

export interface CardUsageLog {
  id: string;
  type: CardUsageType;
  location?: string;
  address?: string;
  partner?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  scannedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface CardHistoryResponse {
  data: CardUsageLog[];
  meta: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalCount: number;
  };
}

// ===========================================
// PARTNER / BENEFITS TYPES
// ===========================================

export type AudienceType = 'ALL' | 'SUBSCRIBERS' | 'NON_SUBSCRIBERS' | 'SPECIFIC_PLANS';

export interface PartnerCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  partnersCount?: number;
}

export interface PartnerListItem {
  id: string;
  name: string;
  logoUrl?: string;
  benefit: string;
  category: PartnerCategory;
  isEligible: boolean;
  isNew: boolean;
  city?: string;
  state?: string;
}

export interface PartnerDetail {
  id: string;
  name: string;
  logoUrl?: string;
  bannerUrl?: string;
  benefit: string;
  instructions?: string;
  category: PartnerCategory;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    lat?: number;
    lng?: number;
  };
  contact: {
    phone?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
  businessHours?: Record<string, string>;
  isOpenNow?: boolean;
  isEligible: boolean;
  isNew: boolean;
}

export interface BenefitsFilter {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string;
  sortBy?: 'name' | 'recent';
}

export interface BenefitsListResponse {
  data: PartnerListItem[];
  meta: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalCount: number;
  };
}

// ===========================================
// WALLET TYPES
// ===========================================

export type WalletSummaryPeriod = 'today' | 'week' | 'month' | 'year';

export interface WalletSummary {
  period: WalletSummaryPeriod;
  startDate: Date;
  endDate: Date;
  earned: number;
  spent: number;
  net: number;
}

export interface WalletRecipient {
  id: string;
  name: string;
  avatarUrl: string | null;
  lastTransferAt: Date;
  transferCount: number;
}

export interface StravaStatus {
  connected: boolean;
  athleteName: string | null;
  kmUsedToday: number;
  kmRemainingToday: number;
  lastSyncAt: Date | null;
  connectedAt: Date | null;
}

export interface WalletDashboard {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  qrCode: {
    data: string;
    hash: string;
    cardNumber: string;
  } | null;
  summary: WalletSummary;
  strava: StravaStatus;
  recentRecipients: WalletRecipient[];
}

// ===========================================
// QR SCANNER TYPES
// ===========================================

export type QrCodeType = 'member_card' | 'event_checkin' | 'user_transfer' | 'pdv_payment';

export interface QrScanResult {
  type: QrCodeType;
  valid: boolean;
  error?: string;
  data?: Record<string, unknown>;
  action?: string;
}

// ===========================================
// PDV CHECKOUT TYPES
// ===========================================

export type CheckoutStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'AWAITING_PIX' | 'CANCELLED';

export interface PdvCheckoutItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_price_points: number;
  unit_price_money: number;
}

export interface PdvCheckoutDetails {
  code: string;
  items: PdvCheckoutItem[];
  totalPoints: number;
  totalMoney: number;
  expiresAt: Date;
  pdv: {
    name: string;
    location: string;
  };
  user: {
    balance: number;
    canPayWithPoints: boolean;
  };
}

export interface PdvPaymentResult {
  success: boolean;
  transactionId: string;
  newBalance: number;
  orderId: string;
  orderCode: string;
}

// ===========================================
// EVENT TYPES
// ===========================================

export type EventCategory =
  | 'SOCIAL'
  | 'SPORTS'
  | 'CULTURAL'
  | 'EDUCATIONAL'
  | 'NETWORKING'
  | 'GASTRO'
  | 'MUSIC'
  | 'ART'
  | 'GAMES'
  | 'INSTITUTIONAL';

export type EventStatus = 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'ENDED' | 'CANCELED';

export type EventFilter = 'all' | 'upcoming' | 'ongoing' | 'past' | 'confirmed';

export type BadgeCriteria = 'FIRST_CHECKIN' | 'ALL_CHECKINS' | 'AT_LEAST_ONE';

export interface EventListItem {
  id: string;
  title: string;
  category: EventCategory;
  color: string | null;
  startDate: Date;
  endDate: Date;
  locationName: string;
  bannerFeed: string | null;
  bannerDisplay: string[];
  pointsTotal: number;
  checkinsCount: number;
  status: EventStatus;
  capacity: number | null;
  confirmationsCount: number;
  isConfirmed: boolean;
}

export interface EventsListResponse {
  data: EventListItem[];
  meta: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalCount: number;
  };
}

export interface EventsFilterParams {
  page?: number | undefined;
  perPage?: number | undefined;
  filter?: EventFilter | undefined;
  category?: EventCategory | undefined;
  search?: string | undefined;
}

export interface EventBadge {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface EventUserCheckIn {
  id: string;
  checkinNumber: number;
  pointsAwarded: number;
  badgeAwarded: boolean;
  createdAt: Date;
}

export interface EventDetail {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  color: string | null;
  startDate: Date;
  endDate: Date;
  locationName: string;
  locationAddress: string | null;
  bannerFeed: string | null;
  bannerDisplay: string[];
  pointsTotal: number;
  checkinsCount: number;
  checkinInterval: number;
  status: EventStatus;
  isPaused: boolean;
  capacity: number | null;
  externalLink: string | null;
  badge: EventBadge | null;
  badgeCriteria: BadgeCriteria | null;
  confirmationsCount: number;
  checkInsCount: number;
  commentsCount: number;
  currentCheckinNumber: number;
  // User-specific
  isConfirmed: boolean;
  confirmedAt: Date | null;
  userCheckIns: EventUserCheckIn[];
  userCheckInsCompleted: number;
}

export interface CheckinRequest {
  eventId: string;
  checkinNumber: number;
  securityToken: string;
  timestamp: number;
}

export interface CheckinResponse {
  success: boolean;
  checkinNumber: number;
  pointsAwarded: number;
  badgeAwarded: boolean;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export interface EventConfirmResponse {
  confirmed: boolean;
  confirmedAt?: Date;
}

export interface EventComment {
  id: string;
  text: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  createdAt: Date;
}

export interface EventCommentsResponse {
  data: EventComment[];
  meta: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalCount: number;
  };
}

// Admin Event types
export interface AdminEventListItem extends EventListItem {
  createdAt: Date;
  publishedAt: Date | null;
  checkInsTotal: number;
}

export interface EventAnalytics {
  confirmations: number;
  checkIns: number;
  attendanceRate: number;
  pointsDistributed: number;
  badgesEarned: number;
  checkinsByNumber: Array<{
    checkinNumber: number;
    count: number;
  }>;
  checkinTimeline: Array<{
    time: string;
    count: number;
  }>;
}

export interface EventParticipant {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  confirmedAt: Date | null;
  checkIns: number[];
  totalPoints: number;
  hasBadge: boolean;
  subscriptionPlan: string | null;
}

// Display types
export interface DisplayData {
  event: {
    id: string;
    title: string;
    color: string | null;
    startDate: Date;
    endDate: Date;
    bannerDisplay: string[];
    status: EventStatus;
    isPaused: boolean;
  };
  qrCode: {
    data: string;
    expiresAt: number;
  };
  currentCheckin: number;
  totalCheckins: number;
  pointsPerCheckin: number;
  counter: number;
  associationLogo: string | null;
}

// Local UI notification (toasts)
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

// ===========================================
// NOTIFICATION TYPES (Backend)
// ===========================================

export type NotificationCategory =
  | 'SOCIAL'
  | 'EVENTS'
  | 'POINTS'
  | 'RESERVATIONS'
  | 'SYSTEM';

export type NotificationType =
  | 'NEW_LIKE'
  | 'NEW_COMMENT'
  | 'COMMENT_REPLY'
  | 'MENTION'
  | 'NEW_FOLLOWER'
  | 'STORY_VIEW'
  | 'POLL_ENDED'
  | 'NEW_EVENT'
  | 'EVENT_REMINDER_1DAY'
  | 'EVENT_REMINDER_1HOUR'
  | 'EVENT_STARTED'
  | 'CHECKIN_REMINDER'
  | 'BADGE_EARNED'
  | 'EVENT_CANCELLED'
  | 'EVENT_UPDATED'
  | 'CHECKIN_PROGRESS'
  | 'POINTS_RECEIVED'
  | 'POINTS_SPENT'
  | 'RANKING_UP'
  | 'TRANSFER_RECEIVED'
  | 'STRAVA_SYNC'
  | 'RESERVATION_APPROVED'
  | 'RESERVATION_REJECTED'
  | 'RESERVATION_REMINDER'
  | 'WAITLIST_AVAILABLE'
  | 'NEW_MESSAGE'
  | 'NEW_BENEFIT'
  | 'CARD_BLOCKED'
  | 'CARD_UNBLOCKED'
  | 'ADMIN_ANNOUNCEMENT';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
  actionUrl?: string;
  groupKey?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationGroupItem {
  groupKey: string;
  category: NotificationCategory;
  title: string;
  body: string;
  count: number;
  notifications: Notification[];
  latestAt: string;
  isRead: boolean;
}

export interface NotificationCategorySettings {
  category: NotificationCategory;
  label: string;
  description: string;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

export interface DoNotDisturbSettings {
  enabled: boolean;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  isActiveNow?: boolean;
}

export interface UnreadCount {
  total: number;
  byCategory: Record<NotificationCategory, number>;
}

export interface NotificationsListResponse {
  data: Notification[];
  meta: {
    currentPage: number;
    perPage: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}

export interface NotificationSettingsResponse {
  categories: NotificationCategorySettings[];
}

export interface NotificationsQueryParams {
  category?: NotificationCategory;
  isRead?: boolean;
  grouped?: boolean;
  page?: number;
  perPage?: number;
}

// ===========================================
// MESSAGING TYPES (Backend)
// ===========================================

export type ConversationType = 'DIRECT' | 'GROUP';
export type MessageContentType = 'TEXT' | 'IMAGE' | 'AUDIO';
export type MessageStatus = 'SENDING' | 'SENT' | 'DELIVERED' | 'READ';
export type ConversationRole = 'MEMBER' | 'ADMIN';

export interface ConversationParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
  role: ConversationRole;
  isOnline: boolean;
  lastSeenAt?: string;
}

export interface ConversationLastMessage {
  id: string;
  content: string;
  contentType: MessageContentType;
  senderId: string;
  senderName: string;
  createdAt: string;
}

export interface ConversationGroupInfo {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdBy: string;
  admins: ConversationParticipant[];
  participants: ConversationParticipant[];
  participantsCount: number;
  mediaCount: number;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  participants: ConversationParticipant[];
  lastMessage?: ConversationLastMessage;
  unreadCount: number;
  isMuted: boolean;
  isArchived?: boolean;
  group?: {
    id: string;
    name: string;
    imageUrl?: string;
    participantsCount: number;
  };
  updatedAt: string;
  createdAt: string;
}

export interface ConversationDetail {
  id: string;
  type: ConversationType;
  participants: ConversationParticipant[];
  settings: {
    isMuted: boolean;
    mutedUntil?: string;
    isArchived: boolean;
    notifications: {
      push: boolean;
      sound: boolean;
    };
  };
  mediaCount: number;
  createdAt: string;
  group?: {
    id: string;
    name: string;
    imageUrl?: string;
    participantsCount: number;
  };
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: { userId: string; name: string }[];
  hasReacted: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  contentType: MessageContentType;
  mediaUrl?: string;
  mediaDuration?: number;
  replyTo?: {
    id: string;
    content: string;
    contentType: MessageContentType;
    senderName: string;
  };
  reactions: MessageReaction[];
  status: MessageStatus;
  createdAt: string;
  deletedAt?: string;
}

export interface ConversationsListResponse {
  data: Conversation[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface MessagesListResponse {
  data: Message[];
  pagination: {
    hasMore: boolean;
    oldestId?: string;
  };
}

export interface ConversationsQueryParams {
  limit?: number;
  offset?: number;
  archived?: boolean;
}

export interface MessagesQueryParams {
  limit?: number;
  before?: string;
  after?: string;
}

export interface CreateConversationRequest {
  type: 'DIRECT' | 'GROUP';
  participantIds: string[];
  groupName?: string;
  groupDescription?: string;
  groupImageUrl?: string;
}

export interface SendMessageRequest {
  content?: string;
  contentType: MessageContentType;
  mediaUrl?: string;
  mediaDuration?: number;
  replyTo?: string;
}

export interface UpdateConversationSettingsRequest {
  isMuted?: boolean;
  mutedUntil?: string;
  isArchived?: boolean;
  notifications?: {
    push: boolean;
    sound: boolean;
  };
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
}

// WebSocket event payloads
export interface WsNotificationNew {
  notification: Notification;
  unreadCount: UnreadCount;
}

export interface WsMessageNew {
  conversationId: string;
  message: Message;
}

export interface WsMessageDelivered {
  messageId: string;
  deliveredTo: string;
  deliveredAt: string;
}

export interface WsMessageRead {
  conversationId: string;
  readBy: string;
  readAt: string;
}

export interface WsTypingUpdate {
  conversationId: string;
  user: {
    id: string;
    name: string;
  };
  isTyping: boolean;
}

export interface WsRecordingUpdate {
  conversationId: string;
  user: {
    id: string;
    name: string;
  };
  isRecording: boolean;
}

export interface WsPresenceUpdate {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: string;
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
