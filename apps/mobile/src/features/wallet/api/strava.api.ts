import { get, post } from '@/services/api/client';
import type { StravaStatus } from '@ahub/shared/types';

export async function getStravaStatus(): Promise<StravaStatus> {
  return get<StravaStatus>('/strava/status');
}

export async function connectStrava(authCode: string): Promise<StravaStatus> {
  return post<StravaStatus>('/strava/connect', { code: authCode });
}

export async function syncStrava(): Promise<{
  activitiesSynced: number;
  pointsEarned: number;
}> {
  return post('/strava/sync', {});
}

export async function disconnectStrava(): Promise<{ success: boolean }> {
  return post('/strava/disconnect', {});
}
