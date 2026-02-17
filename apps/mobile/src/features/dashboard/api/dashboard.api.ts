import { get, post, put, del, postFormData } from '@/services/api/client';
import type {
  DashboardSummary,
  StoriesListResponse,
  UserStoriesResponse,
  StoryResponse,
  StoryViewsResponse,
  FeedResponse,
  CreatePostResponse,
  LikeResponse,
  CommentsListResponse,
  VotePollResponse,
  CreatePollResponse,
  ReportResponse,
  FeedPost,
  FeedQueryParams,
  CommentsQueryParams,
  CreateTextStoryRequest,
  CreateCommentRequest,
  CreatePollRequest,
  VotePollRequest,
  CreateReportRequest,
  UpdatePostRequest,
} from '@ahub/shared/types';

// ============================================
// DASHBOARD SUMMARY
// ============================================

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return get<DashboardSummary>('/dashboard');
}

// ============================================
// STORIES
// ============================================

export async function getStories(): Promise<StoriesListResponse> {
  return get<StoriesListResponse>('/stories');
}

export async function getUserStories(userId: string): Promise<UserStoriesResponse> {
  return get<UserStoriesResponse>(`/stories/${userId}`);
}

export async function createTextStory(data: CreateTextStoryRequest): Promise<StoryResponse> {
  return post<StoryResponse>('/stories', data);
}

export async function createMediaStory(formData: FormData): Promise<StoryResponse> {
  return postFormData<StoryResponse>('/stories/media', formData);
}

export async function recordStoryView(storyId: string): Promise<{ success: boolean }> {
  return post<{ success: boolean }>(`/stories/${storyId}/view`);
}

export async function getStoryViews(storyId: string): Promise<StoryViewsResponse> {
  return get<StoryViewsResponse>(`/stories/${storyId}/views`);
}

export async function deleteStory(storyId: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`/stories/${storyId}`);
}

// ============================================
// FEED
// ============================================

export async function getFeed(params?: FeedQueryParams): Promise<FeedResponse> {
  return get<FeedResponse>('/feed', params);
}

export async function getUserPosts(userId: string, params?: FeedQueryParams): Promise<FeedResponse> {
  return get<FeedResponse>(`/feed/user/${userId}`, params);
}

// ============================================
// POSTS
// ============================================

export async function createPost(formData: FormData): Promise<CreatePostResponse> {
  return postFormData<CreatePostResponse>('/posts', formData);
}

export async function getPost(postId: string): Promise<{ post: FeedPost }> {
  return get<{ post: FeedPost }>(`/posts/${postId}`);
}

export async function updatePost(postId: string, data: UpdatePostRequest): Promise<FeedPost> {
  return put<FeedPost>(`/posts/${postId}`, data);
}

export async function deletePost(postId: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`/posts/${postId}`);
}

export async function likePost(postId: string): Promise<LikeResponse> {
  return post<LikeResponse>(`/posts/${postId}/like`);
}

export async function unlikePost(postId: string): Promise<LikeResponse> {
  return del<LikeResponse>(`/posts/${postId}/like`);
}

// ============================================
// COMMENTS
// ============================================

export async function getComments(
  postId: string,
  params?: CommentsQueryParams,
): Promise<CommentsListResponse> {
  return get<CommentsListResponse>(`/posts/${postId}/comments`, params);
}

export async function createComment(
  postId: string,
  data: CreateCommentRequest,
): Promise<{ success: boolean }> {
  return post<{ success: boolean }>(`/posts/${postId}/comments`, data);
}

export async function deleteComment(commentId: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`/comments/${commentId}`);
}

export async function addReaction(
  commentId: string,
  data: { reaction: string },
): Promise<{ success: boolean }> {
  return post<{ success: boolean }>(`/comments/${commentId}/react`, data);
}

export async function removeReaction(commentId: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`/comments/${commentId}/react`);
}

// ============================================
// POLLS
// ============================================

export async function createPoll(data: CreatePollRequest): Promise<CreatePollResponse> {
  return post<CreatePollResponse>('/polls', data);
}

export async function votePoll(pollId: string, data: VotePollRequest): Promise<VotePollResponse> {
  return post<VotePollResponse>(`/polls/${pollId}/vote`, data);
}

// ============================================
// MODERATION
// ============================================

export async function reportPost(
  postId: string,
  data: CreateReportRequest,
): Promise<ReportResponse> {
  return post<ReportResponse>(`/posts/${postId}/report`, data);
}
