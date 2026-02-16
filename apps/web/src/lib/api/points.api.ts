import { api } from './client';
import type {
  ApiResponse,
  AdminPointsConfig,
  AdminPointsReport,
  AdminGrantDeductResult,
  AdminRefundResult,
} from '@ahub/shared/types';

export async function getConfig(): Promise<AdminPointsConfig> {
  const response = await api.get<ApiResponse<AdminPointsConfig>>(
    '/admin/points/config'
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao buscar configuração');
  }
  return response.data.data;
}

export async function updateConfig(
  data: {
    sources?: Array<{
      type: string;
      isActive: boolean;
      defaultPoints?: number | undefined;
      pointsPerKm?: number | undefined;
      points?: number | undefined;
    }>;
    strava?: { dailyLimitKm: number; eligibleActivities: string[] };
    pointsToMoneyRate?: number;
  }
): Promise<AdminPointsConfig> {
  const response = await api.put<ApiResponse<AdminPointsConfig>>(
    '/admin/points/config',
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao atualizar configuração');
  }
  return response.data.data;
}

export async function grantPoints(data: {
  userId: string;
  amount: number;
  reason: string;
}): Promise<AdminGrantDeductResult> {
  const response = await api.post<ApiResponse<AdminGrantDeductResult>>(
    '/admin/points/grant',
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao creditar pontos');
  }
  return response.data.data;
}

export async function deductPoints(data: {
  userId: string;
  amount: number;
  reason: string;
}): Promise<AdminGrantDeductResult> {
  const response = await api.post<ApiResponse<AdminGrantDeductResult>>(
    '/admin/points/deduct',
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao debitar pontos');
  }
  return response.data.data;
}

export async function refundTransaction(
  transactionId: string,
  reason: string
): Promise<AdminRefundResult> {
  const response = await api.post<ApiResponse<AdminRefundResult>>(
    `/admin/points/refund/${transactionId}`,
    { reason }
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao estornar transação');
  }
  return response.data.data;
}

export async function getReports(
  period: 'today' | 'week' | 'month' | 'year' = 'month'
): Promise<AdminPointsReport> {
  const response = await api.get<ApiResponse<AdminPointsReport>>(
    '/admin/points/reports',
    { params: { period } }
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao buscar relatórios');
  }
  return response.data.data;
}

export async function exportCsv(
  startDate: string,
  endDate: string,
  type?: string
): Promise<Blob> {
  const response = await api.get('/admin/points/export', {
    params: { startDate, endDate, type },
    responseType: 'blob',
  });
  return response.data;
}
