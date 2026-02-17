import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminDashboardStats,
  getReports,
  resolveReport,
  suspendUser,
  liftSuspension,
  forceDeletePost,
} from '../api/dashboard.api';
import type {
  AdminDashboardStats,
  ModerationReport,
  ResolveReportRequest,
  SuspendUserRequest,
} from '@ahub/shared/types';

const dashboardAdminKeys = {
  all: ['admin', 'dashboard'] as const,
  stats: () => [...dashboardAdminKeys.all, 'stats'] as const,
  reports: (status?: string) =>
    [...dashboardAdminKeys.all, 'reports', status] as const,
};

export function useAdminDashboardStats() {
  return useQuery<AdminDashboardStats>({
    queryKey: dashboardAdminKeys.stats(),
    queryFn: getAdminDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

export function useAdminReports(status?: string) {
  return useQuery<ModerationReport[]>({
    queryKey: dashboardAdminKeys.reports(status),
    queryFn: () => getReports(status),
    staleTime: 60 * 1000, // 1 min
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      data,
    }: {
      reportId: string;
      data: ResolveReportRequest;
    }) => resolveReport(reportId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dashboardAdminKeys.reports(),
      });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: SuspendUserRequest;
    }) => suspendUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dashboardAdminKeys.reports(),
      });
    },
  });
}

export function useLiftSuspension() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => liftSuspension(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dashboardAdminKeys.reports(),
      });
    },
  });
}

export function useForceDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => forceDeletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dashboardAdminKeys.reports(),
      });
    },
  });
}
