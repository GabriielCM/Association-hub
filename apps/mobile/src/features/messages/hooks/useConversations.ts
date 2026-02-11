import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listConversations,
  getConversation,
  createConversation,
  updateConversationSettings,
  leaveConversation,
  markConversationAsRead,
  getGroupInfo,
} from '../api/messages.api';
import type {
  ConversationsListResponse,
  ConversationsQueryParams,
  ConversationDetail,
  CreateConversationRequest,
  UpdateConversationSettingsRequest,
  ConversationGroupInfo,
} from '@ahub/shared/types';

export const messageKeys = {
  all: ['messages'] as const,
  conversations: (params?: ConversationsQueryParams) =>
    [...messageKeys.all, 'conversations', params ?? {}] as const,
  conversation: (id: string) =>
    [...messageKeys.all, 'conversation', id] as const,
  messages: (conversationId: string, params?: object) =>
    [...messageKeys.all, 'msgs', conversationId, params ?? {}] as const,
  group: (conversationId: string) =>
    [...messageKeys.all, 'group', conversationId] as const,
};

export function useConversations(params?: ConversationsQueryParams) {
  return useQuery<ConversationsListResponse>({
    queryKey: messageKeys.conversations(params),
    queryFn: () => listConversations(params),
    staleTime: 30 * 1000,
  });
}

export function useConversation(id: string) {
  return useQuery<ConversationDetail>({
    queryKey: messageKeys.conversation(id),
    queryFn: () => getConversation(id),
    enabled: !!id,
  });
}

export function useGroupInfo(conversationId: string) {
  return useQuery<ConversationGroupInfo>({
    queryKey: messageKeys.group(conversationId),
    queryFn: () => getGroupInfo(conversationId),
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationRequest) => createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    },
  });
}

export function useUpdateConversationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateConversationSettingsRequest;
    }) => updateConversationSettings(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversation(id) });
    },
  });
}

export function useLeaveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leaveConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    },
  });
}

export function useMarkConversationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markConversationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    },
  });
}
