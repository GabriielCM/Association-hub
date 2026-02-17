import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { AxiosError } from 'axios';
import {
  createPost,
  likePost,
  unlikePost,
  createComment,
  deleteComment,
  createPoll,
  votePoll,
  reportPost,
  deletePost,
} from '../api/dashboard.api';
import { dashboardKeys } from './useDashboard';
import type {
  FeedResponse,
  CreateReportRequest,
  CreateCommentRequest,
  CreatePollRequest,
  VotePollRequest,
} from '@ahub/shared/types';

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.error?.message || error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Erro desconhecido';
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createPost(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.feed() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
      // Also invalidate any cached user posts (profile tab)
      queryClient.invalidateQueries({ queryKey: [...dashboardKeys.all, 'userPosts'] });
    },
    onError: (error) => {
      Alert.alert('Erro ao publicar', getErrorMessage(error));
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) =>
      liked ? unlikePost(postId) : likePost(postId),
    onMutate: async ({ postId, liked }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: dashboardKeys.feed() });
      await queryClient.cancelQueries({ queryKey: dashboardKeys.post(postId) });

      // Snapshot previous values
      const previousFeed = queryClient.getQueryData(dashboardKeys.feed());
      const previousPost = queryClient.getQueryData(dashboardKeys.post(postId));

      // Optimistic update for post detail
      queryClient.setQueryData(dashboardKeys.post(postId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          content: {
            ...old.content,
            liked_by_me: !liked,
            likes_count: old.content.likes_count + (liked ? -1 : 1),
          },
        };
      });

      // Optimistic update for feed
      queryClient.setQueryData(dashboardKeys.feed(), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: FeedResponse) => ({
            ...page,
            posts: page.posts.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    content: {
                      ...p.content,
                      liked_by_me: !liked,
                      likes_count: p.content.likes_count + (liked ? -1 : 1),
                    },
                  }
                : p,
            ),
          })),
        };
      });

      return { previousFeed, previousPost };
    },
    onError: (_err, { postId }, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        queryClient.setQueryData(dashboardKeys.feed(), context.previousFeed);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(dashboardKeys.post(postId), context.previousPost);
      }
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: dashboardKeys.feed() });

      const previousFeed = queryClient.getQueryData(dashboardKeys.feed());

      // Optimistic: remove post from feed
      queryClient.setQueryData(dashboardKeys.feed(), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: FeedResponse) => ({
            ...page,
            posts: page.posts.filter((p) => p.id !== postId),
          })),
        };
      });

      // Optimistic: remove post from userPosts caches
      queryClient.setQueriesData(
        { queryKey: [...dashboardKeys.all, 'userPosts'] },
        (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts: page.posts.filter((p: any) => p.id !== postId),
            })),
          };
        },
      );

      return { previousFeed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.feed() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
      queryClient.invalidateQueries({ queryKey: [...dashboardKeys.all, 'userPosts'] });
    },
    onError: (error, _postId, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(dashboardKeys.feed(), context.previousFeed);
      }
      queryClient.invalidateQueries({ queryKey: [...dashboardKeys.all, 'userPosts'] });
      Alert.alert('Erro ao excluir', getErrorMessage(error));
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: string;
      data: CreateCommentRequest;
    }) => createComment(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.feed() });
    },
  });
}

export function useDeleteComment() {
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePollRequest) => createPoll(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.feed() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
    },
  });
}

export function useVotePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pollId,
      data,
    }: {
      pollId: string;
      data: VotePollRequest;
    }) => votePoll(pollId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.feed() });
    },
  });
}

export function useReportPost() {
  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: string;
      data: CreateReportRequest;
    }) => reportPost(postId, data),
  });
}
