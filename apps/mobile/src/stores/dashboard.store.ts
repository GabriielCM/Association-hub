import { create } from 'zustand';

interface DashboardState {
  hasNewPosts: boolean;
  newPostsCount: number;

  setHasNewPosts: (has: boolean, count?: number) => void;
  incrementNewPosts: () => void;
  resetNewPosts: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  hasNewPosts: false,
  newPostsCount: 0,

  setHasNewPosts: (has, count = 0) => {
    set({ hasNewPosts: has, newPostsCount: count });
  },

  incrementNewPosts: () => {
    set((state) => ({
      hasNewPosts: true,
      newPostsCount: state.newPostsCount + 1,
    }));
  },

  resetNewPosts: () => {
    set({ hasNewPosts: false, newPostsCount: 0 });
  },
}));

// Selector hooks
export const useHasNewPosts = () =>
  useDashboardStore((state) => state.hasNewPosts);

export const useNewPostsCount = () =>
  useDashboardStore((state) => state.newPostsCount);
