import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getDashboardSummary,
  getFeed,
  getPost,
  getUserPosts,
  getStories,
  getUserStories,
} from '../api/dashboard.api';
import type {
  DashboardSummary,
  FeedPost,
  FeedResponse,
  StoriesListResponse,
  UserStoriesResponse,
  FeedQueryParams,
} from '@ahub/shared/types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
  feed: () => [...dashboardKeys.all, 'feed'] as const,
  stories: () => [...dashboardKeys.all, 'stories'] as const,
  userStories: (userId: string) => [...dashboardKeys.all, 'stories', userId] as const,
  userPosts: (userId: string) => [...dashboardKeys.all, 'userPosts', userId] as const,
  post: (id: string) => [...dashboardKeys.all, 'post', id] as const,
};

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: dashboardKeys.summary(),
    queryFn: getDashboardSummary,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useFeed() {
  return useInfiniteQuery<FeedResponse>({
    queryKey: dashboardKeys.feed(),
    queryFn: ({ pageParam }) => {
      const params: FeedQueryParams = {
        offset: pageParam as number,
        limit: 10,
      };
      return getFeed(params);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.has_more) return undefined;
      const totalLoaded = allPages.reduce(
        (sum, page) => sum + page.posts.length,
        0,
      );
      return totalLoaded;
    },
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

export function useStories() {
  return useQuery<StoriesListResponse>({
    queryKey: dashboardKeys.stories(),
    queryFn: getStories,
    staleTime: 60 * 1000, // 1 min
  });
}

export function useUserPosts(userId: string) {
  return useInfiniteQuery<FeedResponse>({
    queryKey: dashboardKeys.userPosts(userId),
    queryFn: ({ pageParam }) => {
      const params: FeedQueryParams = {
        offset: pageParam as number,
        limit: 10,
      };
      return getUserPosts(userId, params);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.has_more) return undefined;
      const totalLoaded = allPages.reduce(
        (sum, page) => sum + page.posts.length,
        0,
      );
      return totalLoaded;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

export function usePost(postId: string) {
  return useQuery<FeedPost>({
    queryKey: dashboardKeys.post(postId),
    queryFn: async () => {
      const { post } = await getPost(postId);
      return post;
    },
    enabled: !!postId,
  });
}

export function useUserStories(userId: string) {
  return useQuery<UserStoriesResponse>({
    queryKey: dashboardKeys.userStories(userId),
    queryFn: () => getUserStories(userId),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
