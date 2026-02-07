import { useQuery } from '@tanstack/react-query';
import { getProfile, getUserBadges, getUserRankings } from '../api/profile.api';
import type {
  UserProfile,
  UserBadgesResponse,
  UserRankingsResponse,
} from '@ahub/shared/types';

export const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
  badges: (userId: string) => [...profileKeys.all, userId, 'badges'] as const,
  rankings: (userId: string) =>
    [...profileKeys.all, userId, 'rankings'] as const,
  usernameCheck: (username: string) =>
    [...profileKeys.all, 'username', username] as const,
};

export function useProfile(userId: string) {
  return useQuery<UserProfile>({
    queryKey: profileKeys.detail(userId),
    queryFn: () => getProfile(userId),
    staleTime: 5 * 60 * 1000, // 5 min
    enabled: !!userId,
  });
}

export function useUserBadges(userId: string) {
  return useQuery<UserBadgesResponse>({
    queryKey: profileKeys.badges(userId),
    queryFn: () => getUserBadges(userId),
    staleTime: 10 * 60 * 1000, // 10 min
    enabled: !!userId,
  });
}

export function useUserRankings(userId: string) {
  return useQuery<UserRankingsResponse>({
    queryKey: profileKeys.rankings(userId),
    queryFn: () => getUserRankings(userId),
    staleTime: 10 * 60 * 1000, // 10 min
    enabled: !!userId,
  });
}
