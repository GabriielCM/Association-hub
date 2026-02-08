import { get, post, del } from '@/services/api/client';
import type {
  EventsListResponse,
  EventDetail,
  EventConfirmResponse,
  CheckinRequest,
  CheckinResponse,
  EventCommentsResponse,
  EventComment,
  EventsFilterParams,
} from '@ahub/shared/types';

export async function listEvents(
  filters?: EventsFilterParams
): Promise<EventsListResponse> {
  return get<EventsListResponse>('/events', filters);
}

export async function getEvent(eventId: string): Promise<EventDetail> {
  return get<EventDetail>(`/events/${eventId}`);
}

export async function confirmEvent(
  eventId: string
): Promise<EventConfirmResponse> {
  return post<EventConfirmResponse>(`/events/${eventId}/confirm`);
}

export async function removeConfirmation(
  eventId: string
): Promise<EventConfirmResponse> {
  return del<EventConfirmResponse>(`/events/${eventId}/confirm`);
}

export async function checkin(
  eventId: string,
  data: CheckinRequest
): Promise<CheckinResponse> {
  return post<CheckinResponse>(`/events/${eventId}/checkin`, data);
}

export async function getComments(
  eventId: string,
  params?: { page?: number; perPage?: number }
): Promise<EventCommentsResponse> {
  return get<EventCommentsResponse>(`/events/${eventId}/comments`, params);
}

export async function createComment(
  eventId: string,
  text: string
): Promise<EventComment> {
  return post<EventComment>(`/events/${eventId}/comments`, { text });
}
