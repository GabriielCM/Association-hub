import { useMutation, useQueryClient } from '@tanstack/react-query';
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

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createPost(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.feed() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
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

      // Snapshot previous value
      const previousFeed = queryClient.getQueryData(dashboardKeys.feed());

      // Optimistic update
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

      return { previousFeed };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        queryClient.setQueryData(dashboardKeys.feed(), context.previousFeed);
      }
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.feed() });
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
