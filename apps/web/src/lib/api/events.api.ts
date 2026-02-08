import { AxiosError } from 'axios';
import { api } from './client';
import type {
  EventCategory,
  EventStatus,
  EventAnalytics,
  EventParticipant,
} from '@ahub/shared/types';
import type { CreateEventInput } from '@ahub/shared/validation';

function extractApiError(error: unknown, fallback: string): Error {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as Record<string, unknown>;
    const msg = Array.isArray(data.message)
      ? (data.message as string[]).join(', ')
      : (data.message as string);
    if (msg) return new Error(msg);
  }
  if (error instanceof Error) return error;
  return new Error(fallback);
}

// ===========================================
// RESPONSE INTERFACES
// ===========================================

export interface AdminEventItem {
  id: string;
  title: string;
  category: EventCategory;
  color: string | null;
  startDate: string;
  endDate: string;
  locationName: string;
  bannerFeed: string | null;
  pointsTotal: number;
  checkinsCount: number;
  status: EventStatus;
  capacity: number | null;
  confirmationsCount: number;
  checkInsTotal: number;
  createdAt: string;
  publishedAt: string | null;
}

export interface AdminEventsResponse {
  data: AdminEventItem[];
  stats: {
    totalEvents: number;
    activeEvents: number;
    totalCheckIns: number;
    totalPointsDistributed: number;
  };
  meta: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalCount: number;
  };
}

export interface AdminEventDetail {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  color: string | null;
  startDate: string;
  endDate: string;
  locationName: string;
  locationAddress: string | null;
  bannerFeed: string | null;
  bannerDisplay: string[];
  pointsTotal: number;
  checkinsCount: number;
  checkinInterval: number;
  status: EventStatus;
  isPaused: boolean;
  capacity: number | null;
  externalLink: string | null;
  badgeId: string | null;
  badgeCriteria: string | null;
  qrSecret: string;
  createdAt: string;
  publishedAt: string | null;
}

// ===========================================
// ADMIN EVENT ENDPOINTS
// ===========================================

export async function getAdminEvents(query?: {
  page?: number;
  perPage?: number;
  filter?: string;
  status?: EventStatus;
  category?: EventCategory;
  search?: string;
}): Promise<AdminEventsResponse> {
  try {
    const response = await api.get('/admin/events', { params: query });
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar eventos');
  }
}

export async function getAdminEventDetail(
  eventId: string
): Promise<AdminEventDetail> {
  try {
    const response = await api.get(`/admin/events/${eventId}`);
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar evento');
  }
}

export async function createEvent(
  data: CreateEventInput
): Promise<AdminEventDetail> {
  try {
    const response = await api.post('/admin/events', data);
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao criar evento');
  }
}

export async function updateEvent(
  eventId: string,
  data: Partial<CreateEventInput>
): Promise<AdminEventDetail> {
  try {
    const response = await api.put(`/admin/events/${eventId}`, data);
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao atualizar evento');
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  try {
    await api.delete(`/admin/events/${eventId}`);
  } catch (error) {
    throw extractApiError(error, 'Falha ao excluir evento');
  }
}

export async function publishEvent(eventId: string): Promise<void> {
  try {
    await api.post(`/admin/events/${eventId}/publish`);
  } catch (error) {
    throw extractApiError(error, 'Falha ao publicar evento');
  }
}

export async function cancelEvent(
  eventId: string,
  reason: string
): Promise<void> {
  try {
    await api.post(`/admin/events/${eventId}/cancel`, { reason });
  } catch (error) {
    throw extractApiError(error, 'Falha ao cancelar evento');
  }
}

export async function pauseEvent(
  eventId: string,
  isPaused: boolean
): Promise<void> {
  try {
    await api.post(`/admin/events/${eventId}/pause`, { isPaused });
  } catch (error) {
    throw extractApiError(error, 'Falha ao pausar evento');
  }
}

export async function manualCheckin(
  eventId: string,
  data: { userId: string; checkinNumber: number; reason: string }
): Promise<void> {
  try {
    await api.post(`/admin/events/${eventId}/checkin/manual`, data);
  } catch (error) {
    throw extractApiError(error, 'Falha ao realizar check-in manual');
  }
}

export async function getEventAnalytics(
  eventId: string
): Promise<EventAnalytics> {
  try {
    const response = await api.get(`/admin/events/${eventId}/analytics`);
    const raw = response.data;
    // Map backend nested format to flat EventAnalytics type
    return {
      confirmations: raw.metrics?.confirmations ?? 0,
      checkIns: raw.metrics?.totalCheckIns ?? 0,
      attendanceRate: raw.metrics?.presenceRateConfirmed ?? 0,
      pointsDistributed: raw.metrics?.pointsDistributed ?? 0,
      badgesEarned: raw.metrics?.badgesAwarded ?? 0,
      checkinsByNumber: raw.checkInsByNumber ?? [],
      checkinTimeline: raw.recentCheckIns?.map((c: { createdAt: string }) => ({
        time: c.createdAt,
        count: 1,
      })) ?? [],
    };
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar analytics');
  }
}

export async function getEventParticipants(
  eventId: string,
  query?: { page?: number; perPage?: number; search?: string }
): Promise<{ data: EventParticipant[]; meta: { totalCount: number } }> {
  try {
    const response = await api.get(`/admin/events/${eventId}/participants`, {
      params: query,
    });
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar participantes');
  }
}

// ===========================================
// BANNER UPLOAD
// ===========================================

export async function uploadBannerFeed(
  eventId: string,
  file: File
): Promise<{ bannerFeed: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(
      `/admin/events/${eventId}/banner-feed`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao enviar banner feed');
  }
}

export async function uploadBannerDisplay(
  eventId: string,
  file: File
): Promise<{ bannerDisplay: string[] }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(
      `/admin/events/${eventId}/banner-display`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao enviar banner display');
  }
}

export async function removeBannerDisplay(
  eventId: string,
  index: number
): Promise<{ bannerDisplay: string[] }> {
  try {
    const response = await api.delete(
      `/admin/events/${eventId}/banner-display/${index}`
    );
    return response.data.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao remover banner display');
  }
}

// ===========================================
// EXPORT
// ===========================================

export function getExportCsvUrl(eventId: string): string {
  const base = api.defaults.baseURL || '';
  return `${base}/admin/events/${eventId}/export/csv`;
}

export function getExportPdfUrl(eventId: string): string {
  const base = api.defaults.baseURL || '';
  return `${base}/admin/events/${eventId}/export/pdf`;
}
