import { api } from './client';
import type {
  ApiResponse,
  AdminDashboardStats,
  ModerationReport,
  ResolveReportRequest,
  SuspendUserRequest,
  SuspendUserResponse,
} from '@ahub/shared/types';

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const response = await api.get<ApiResponse<AdminDashboardStats>>(
    '/admin/dashboard/stats'
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.error?.message || 'Falha ao buscar estatísticas'
    );
  }
  return response.data.data;
}

export async function getReports(
  status?: string
): Promise<ModerationReport[]> {
  const params = status ? { status } : {};
  const response = await api.get<ApiResponse<ModerationReport[]>>(
    '/admin/reports',
    { params }
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.error?.message || 'Falha ao buscar denúncias'
    );
  }
  return response.data.data;
}

export async function resolveReport(
  reportId: string,
  data: ResolveReportRequest
): Promise<void> {
  const response = await api.patch<ApiResponse<void>>(
    `/admin/reports/${reportId}/resolve`,
    data
  );
  if (!response.data.success) {
    throw new Error(
      response.data.error?.message || 'Falha ao resolver denúncia'
    );
  }
}

export async function suspendUser(
  userId: string,
  data: SuspendUserRequest
): Promise<SuspendUserResponse> {
  const response = await api.post<ApiResponse<SuspendUserResponse>>(
    `/admin/users/${userId}/suspend`,
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.error?.message || 'Falha ao suspender usuário'
    );
  }
  return response.data.data;
}

export async function liftSuspension(userId: string): Promise<void> {
  const response = await api.delete<ApiResponse<void>>(
    `/admin/users/${userId}/suspend`
  );
  if (!response.data.success) {
    throw new Error(
      response.data.error?.message || 'Falha ao remover suspensão'
    );
  }
}

export async function forceDeletePost(postId: string): Promise<void> {
  const response = await api.delete<ApiResponse<void>>(
    `/admin/posts/${postId}`
  );
  if (!response.data.success) {
    throw new Error(
      response.data.error?.message || 'Falha ao excluir post'
    );
  }
}
