// ===========================================
// DASHBOARD TYPES
// ===========================================

// Story types
export type StoryType = 'IMAGE' | 'VIDEO' | 'TEXT';

export interface StoryUserListItem {
  user_id: string;
  username: string;
  avatar_url?: string;
  has_unseen: boolean;
  stories_count: number;
  is_online?: boolean;
}

export interface StoryResponse {
  id: string;
  type: StoryType;
  url?: string;
  text?: string;
  background_color?: string;
  created_at: Date;
  expires_at: Date;
}

export interface StoryView {
  user_id: string;
  username: string;
  avatar_url?: string;
  viewed_at: Date;
}

export interface StoryViewsResponse {
  views: StoryView[];
  total_views: number;
}

export interface StoriesListResponse {
  stories: StoryUserListItem[];
}

export interface UserStoriesResponse {
  stories: StoryResponse[];
}

// Post types
export type PostType = 'photo' | 'poll' | 'event';

export interface PostAuthor {
  id: string;
  name: string;
  avatar_url?: string;
  is_verified?: boolean;
}

export interface PostContent {
  image_url?: string;
  description?: string;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
}

export interface FeedPost {
  id: string;
  type: PostType;
  author: PostAuthor;
  created_at: Date;
  content: PostContent;
  pinned: boolean;
}

export interface FeedResponse {
  posts: FeedPost[];
  has_more: boolean;
}

export interface CreatePostResponse {
  post: FeedPost;
  points_earned: number;
  message: string;
}

export interface LikeResponse {
  success: boolean;
  likes_count: number;
}

// Comment types
export type ReactionType = 'heart' | 'thumbs_up' | 'laugh' | 'wow';

export interface CommentAuthor {
  id: string;
  name: string;
  avatar_url?: string;
}

export interface CommentReactions {
  heart: number;
  thumbs_up: number;
  laugh: number;
  wow: number;
}

export interface FeedComment {
  id: string;
  author: CommentAuthor;
  text: string;
  created_at: Date;
  reactions: CommentReactions;
  my_reaction?: ReactionType | null;
  replies?: FeedComment[];
}

export interface CommentsListResponse {
  comments: FeedComment[];
  total: number;
}

// Poll types
export interface PollOptionResult {
  text: string;
  percentage: number;
  votes: number;
}

export interface PollResults {
  options: PollOptionResult[];
  total_votes: number;
}

export interface VotePollResponse {
  success: boolean;
  results: PollResults;
}

export interface CreatePollResponse {
  poll: FeedPost;
  points_earned: number;
}

// Moderation types
export type ReportReason = 'SPAM' | 'INAPPROPRIATE' | 'HARASSMENT' | 'MISINFORMATION' | 'OTHER';
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export interface Reporter {
  id: string;
  name: string;
  avatar_url?: string;
}

export interface ModerationReport {
  id: string;
  type: 'post' | 'comment';
  target_id: string;
  reason: ReportReason;
  description?: string;
  reporter: Reporter;
  created_at: Date;
  status: ReportStatus;
}

export interface ReportResponse {
  success: boolean;
  report_id: string;
}

export interface SuspendUserResponse {
  success: boolean;
  suspended_until?: Date;
}

// Dashboard summary
export interface UserSummary {
  name: string;
  avatar_url: string | null;
  points: number;
  points_today: number;
  points_chart: number[];
}

export interface DashboardSummary {
  user: UserSummary;
  unread_notifications: number;
  has_stories: boolean;
  feed_preview: FeedPost[];
}

// Admin dashboard stats
export interface AdminDashboardStats {
  members: {
    total: number;
    newThisMonth: number;
    changePercent: number;
  };
  events: {
    active: number;
    changePercent: number;
  };
  sales: {
    monthlyRevenue: number;
    changePercent: number;
  };
  points: {
    distributedThisMonth: number;
    changePercent: number;
  };
  posts: {
    thisMonth: number;
  };
  reports: {
    pending: number;
  };
  charts: {
    membersByMonth: Array<{ month: string; count: number }>;
    pointsByDay: Array<{ date: string; earned: number; spent: number }>;
    eventAttendance: Array<{ event: string; attendance: number; capacity: number }>;
    revenueByMonth: Array<{ month: string; store: number; pdv: number }>;
  };
}

// Request types
export interface CreatePostRequest {
  description: string;
}

export interface UpdatePostRequest {
  description: string;
}

export interface CreateTextStoryRequest {
  type: 'TEXT';
  text: string;
  background_color?: string;
}

export interface CreateCommentRequest {
  text: string;
  parent_id?: string;
}

export interface CreatePollRequest {
  question: string;
  options: string[];
  duration_days?: number;
}

export interface VotePollRequest {
  option_index: number;
}

export interface CreateReportRequest {
  reason: ReportReason;
  description?: string;
}

export interface SuspendUserRequest {
  duration_days?: number;
  reason: string;
}

export interface ResolveReportRequest {
  status: 'RESOLVED' | 'DISMISSED';
  resolution?: string;
}

// Feed query params
export interface FeedQueryParams {
  offset?: number;
  limit?: number;
}

export interface CommentsQueryParams {
  offset?: number;
  limit?: number;
}

// WebSocket event payloads
export interface WsFeedPostNew {
  post: FeedPost;
}

export interface WsFeedPostLiked {
  post_id: string;
  likes_count: number;
  liked_by: {
    id: string;
    name: string;
  };
}

export interface WsFeedPostDeleted {
  post_id: string;
}

export interface WsStoryNew {
  user_id: string;
  username: string;
  avatar_url?: string;
}

export interface WsPollVoteUpdate {
  poll_id: string;
  results: PollResults;
}
