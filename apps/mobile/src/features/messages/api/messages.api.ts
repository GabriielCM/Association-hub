import { get, post, put, del, postFormData } from '@/services/api/client';
import type {
  ConversationsListResponse,
  ConversationsQueryParams,
  Conversation,
  ConversationDetail,
  CreateConversationRequest,
  UpdateConversationSettingsRequest,
  MessagesListResponse,
  MessagesQueryParams,
  Message,
  SendMessageRequest,
  ConversationGroupInfo,
  UpdateGroupRequest,
} from '@ahub/shared/types';

// Conversations
export async function listConversations(
  params?: ConversationsQueryParams
): Promise<ConversationsListResponse> {
  return get<ConversationsListResponse>('/conversations', params);
}

export async function createConversation(
  data: CreateConversationRequest
): Promise<Conversation> {
  return post<Conversation>('/conversations', data);
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  return get<ConversationDetail>(`/conversations/${id}`);
}

export async function updateConversationSettings(
  id: string,
  data: UpdateConversationSettingsRequest
): Promise<{ settings: UpdateConversationSettingsRequest }> {
  return put<{ settings: UpdateConversationSettingsRequest }>(
    `/conversations/${id}/settings`,
    data
  );
}

export async function leaveConversation(
  id: string
): Promise<{ deleted: boolean }> {
  return del<{ deleted: boolean }>(`/conversations/${id}`);
}

export async function markConversationAsRead(
  id: string
): Promise<{ conversationId: string; readAt: string }> {
  return post<{ conversationId: string; readAt: string }>(
    `/conversations/${id}/read`
  );
}

export async function sendTyping(
  conversationId: string,
  isTyping: boolean
): Promise<void> {
  return post<void>(`/conversations/${conversationId}/typing`, { is_typing: isTyping });
}

// Messages
export async function listMessages(
  conversationId: string,
  params?: MessagesQueryParams
): Promise<MessagesListResponse> {
  return get<MessagesListResponse>(
    `/conversations/${conversationId}/messages`,
    params
  );
}

export async function sendMessage(
  conversationId: string,
  data: SendMessageRequest
): Promise<Message> {
  const { replyTo, ...rest } = data;
  return post<Message>(`/conversations/${conversationId}/messages`, {
    ...rest,
    ...(replyTo != null ? { replyToId: replyTo } : {}),
  });
}

export async function deleteMessage(
  id: string
): Promise<{ deleted: boolean; messageId: string }> {
  return del<{ deleted: boolean; messageId: string }>(`/messages/${id}`);
}

export async function addReaction(
  messageId: string,
  emoji: string
): Promise<{ messageId: string; reaction: { emoji: string; userId: string; createdAt: string } }> {
  return post<{ messageId: string; reaction: { emoji: string; userId: string; createdAt: string } }>(
    `/messages/${messageId}/reactions`,
    { emoji }
  );
}

export async function removeReaction(
  messageId: string,
  emoji: string
): Promise<{ removed: boolean }> {
  return del<{ removed: boolean }>(`/messages/${messageId}/reactions/${emoji}`);
}

// Media upload
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const audioExts = ['m4a', 'mp3', 'ogg', 'wav', 'aac'];
  if (ext && audioExts.includes(ext)) {
    return `audio/${ext === 'm4a' ? 'mp4' : ext}`;
  }
  return ext ? `image/${ext}` : 'image/jpeg';
}

export async function uploadMedia(
  uri: string,
  contentType?: 'TEXT' | 'IMAGE' | 'AUDIO'
): Promise<{ url: string }> {
  let filename = uri.split('/').pop() ?? `media_${Date.now()}`;

  // Android recording URIs may lack file extension — ensure one exists
  if (!filename.includes('.')) {
    filename = contentType === 'AUDIO' ? `${filename}.m4a` : `${filename}.jpg`;
  }

  const type = getMimeType(filename);

  const formData = new FormData();
  formData.append('file', {
    uri,
    name: filename,
    type,
  } as unknown as Blob);

  return postFormData<{ url: string }>('/messages/media/upload', formData);
}

// Presence
export async function getOnlineContacts(): Promise<{ userIds: string[] }> {
  return get<{ userIds: string[] }>('/conversations/presence/online');
}

// Groups
export async function getGroupInfo(
  conversationId: string
): Promise<ConversationGroupInfo> {
  return get<ConversationGroupInfo>(`/conversations/${conversationId}/group`);
}

export async function updateGroup(
  conversationId: string,
  data: UpdateGroupRequest
): Promise<ConversationGroupInfo> {
  return put<ConversationGroupInfo>(
    `/conversations/${conversationId}/group`,
    data
  );
}

export async function addParticipants(
  conversationId: string,
  userIds: string[]
): Promise<{ added: number; participantsCount: number }> {
  return post<{ added: number; participantsCount: number }>(
    `/conversations/${conversationId}/group/participants`,
    { user_ids: userIds }
  );
}

export async function removeParticipant(
  conversationId: string,
  userId: string
): Promise<{ removed: boolean; userId: string }> {
  return del<{ removed: boolean; userId: string }>(
    `/conversations/${conversationId}/group/participants/${userId}`
  );
}

export async function promoteToAdmin(
  conversationId: string,
  userId: string
): Promise<{ promoted: boolean; userId: string }> {
  return post<{ promoted: boolean; userId: string }>(
    `/conversations/${conversationId}/group/admins`,
    { user_id: userId }
  );
}
