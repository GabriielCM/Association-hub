import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  updateProfile,
  uploadAvatar,
  updateBadgesDisplay,
  checkUsername,
} from '../api/profile.api';
import { profileKeys } from './useProfile';
import { useAuthStore } from '@/stores/auth.store';
import type {
  UpdateProfileResult,
  AvatarUploadResult,
  UpdateBadgesDisplayResult,
  UsernameCheckResponse,
} from '@ahub/shared/types';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation<
    UpdateProfileResult,
    Error,
    { name?: string | undefined; username?: string | undefined; bio?: string | undefined; phone?: string | undefined }
  >({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update auth store with all profile fields
      updateUser({
        name: data.name,
        username: data.username,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        phone: data.phone,
        usernameChangedAt: data.usernameChangedAt,
      });
      // Invalidate profile queries
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation<
    AvatarUploadResult,
    Error,
    { uri: string; name: string; type: string }
  >({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      updateUser({ avatarUrl: data.avatarUrl });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useUpdateBadgesDisplay() {
  const queryClient = useQueryClient();

  return useMutation<UpdateBadgesDisplayResult, Error, string[]>({
    mutationFn: updateBadgesDisplay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useCheckUsername(username: string) {
  return useQuery<UsernameCheckResponse>({
    queryKey: profileKeys.usernameCheck(username),
    queryFn: () => checkUsername(username),
    enabled: username.length >= 3,
    staleTime: 30 * 1000, // 30s
  });
}
