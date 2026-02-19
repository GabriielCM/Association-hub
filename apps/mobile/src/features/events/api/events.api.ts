import { get, post, del, postFormData } from '@/services/api/client';
import type {
  EventsListResponse,
  EventDetail,
  EventConfirmResponse,
  CheckinRequest,
  CheckinResponse,
  EventCommentsResponse,
  EventComment,
  EventCommentContentType,
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

export async function uploadCommentImage(
  eventId: string,
  uri: string,
): Promise<{ url: string }> {
  const filename = uri.split('/').pop() ?? `comment_${Date.now()}.jpg`;
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

  const formData = new FormData();
  formData.append('file', {
    uri,
    name: filename,
    type,
  } as unknown as Blob);

  return postFormData<{ url: string }>(`/events/${eventId}/comments/media/upload`, formData);
}

export interface CreateCommentPayload {
  text?: string;
  contentType: EventCommentContentType;
  mediaUrl?: string;
}

export async function createComment(
  eventId: string,
  data: CreateCommentPayload,
): Promise<EventComment> {
  return post<EventComment>(`/events/${eventId}/comments`, data);
}
