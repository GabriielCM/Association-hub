import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile } from '@/services/api/auth.api';
import { api } from '@/services/api/client';
import { useAuthStore } from '@/stores/auth.store';
import type { User, ApiResponse } from '@ahub/shared/types';
import type { UpdateProfileInput } from '@ahub/shared/validation';

const USER_QUERY_KEY = ['user', 'profile'] as const;

export function useUser() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateUser = useAuthStore((state) => state.updateUser);
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: getProfile,
    enabled: isAuthenticated,
    initialData: user ?? undefined,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const response = await api.patch<ApiResponse<User>>(
        '/user/profile',
        data
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.error?.message || 'Erro ao atualizar perfil'
        );
      }
      return response.data.data;
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.setQueryData(USER_QUERY_KEY, updatedUser);
    },
  });

  const updateProfile = useCallback(
    async (data: UpdateProfileInput) => {
      return updateProfileMutation.mutateAsync(data);
    },
    [updateProfileMutation]
  );

  return {
    user: profile ?? user,
    isLoading: isProfileLoading,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error?.message ?? null,
    updateProfile,
    refetchProfile,
  };
}
