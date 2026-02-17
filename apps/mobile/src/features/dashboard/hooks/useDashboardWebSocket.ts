import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribe } from '@/services/websocket/socket';
import { useDashboardStore } from '@/stores/dashboard.store';
import { dashboardKeys } from './useDashboard';
import type {
  WsFeedPostNew,
  WsFeedPostLiked,
  WsFeedPostDeleted,
  WsStoryNew,
  WsPollVoteUpdate,
  FeedResponse,
} from '@ahub/shared/types';

export function useDashboardWebSocket() {
  const queryClient = useQueryClient();
  const incrementNewPosts = useDashboardStore((s) => s.incrementNewPosts);

  useEffect(() => {
    // New post created in the association
    const unsubNewPost = subscribe('feed.post_new', (data) => {
      const payload = data as WsFeedPostNew;
      if (payload.post) {
        incrementNewPosts();
      }
    });

    // Post liked - update like count in cache
    const unsubPostLiked = subscribe('feed.post_liked', (data) => {
      const payload = data as WsFeedPostLiked;
      queryClient.setQueryData(dashboardKeys.feed(), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: FeedResponse) => ({
            ...page,
            posts: page.posts.map((p) =>
              p.id === payload.post_id
                ? {
                    ...p,
                    content: {
                      ...p.content,
                      likes_count: payload.likes_count,
                    },
                  }
                : p,
            ),
          })),
        };
      });
    });

    // Post deleted - remove from cache
    const unsubPostDeleted = subscribe('feed.post_deleted', (data) => {
      const payload = data as WsFeedPostDeleted;
      queryClient.setQueryData(dashboardKeys.feed(), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: FeedResponse) => ({
            ...page,
            posts: page.posts.filter((p) => p.id !== payload.post_id),
          })),
        };
      });
    });

    // New story - invalidate stories cache
    const unsubNewStory = subscribe('story.new', (_data) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stories() });
    });

    // Poll vote update - update results in cache
    const unsubPollVote = subscribe('poll.vote_update', (data) => {
      const payload = data as WsPollVoteUpdate;
      queryClient.setQueryData(dashboardKeys.feed(), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: FeedResponse) => ({
            ...page,
            posts: page.posts.map((p) => {
              if (p.id === payload.poll_id && (p.content as any).poll) {
                return {
                  ...p,
                  content: {
                    ...p.content,
                    poll: {
                      ...(p.content as any).poll,
                      ...payload.results,
                    },
                  },
                };
              }
              return p;
            }),
          })),
        };
      });
    });

    return () => {
      unsubNewPost();
      unsubPostLiked();
      unsubPostDeleted();
      unsubNewStory();
      unsubPollVote();
    };
  }, [queryClient, incrementNewPosts]);
}
