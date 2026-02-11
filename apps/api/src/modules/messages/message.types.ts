import {
  ConversationType,
  ConversationRole,
  MessageContentType,
  MessageStatus,
} from '@prisma/client';

export { ConversationType, ConversationRole, MessageContentType, MessageStatus };

export interface ConversationWithDetails {
  id: string;
  type: ConversationType;
  participants: ParticipantInfo[];
  lastMessage?: MessagePreview;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  group?: GroupInfo;
}

export interface ParticipantInfo {
  userId: string;
  name: string;
  avatarUrl?: string;
  role: ConversationRole;
  isOnline: boolean;
  lastSeenAt?: Date;
}

export interface GroupInfo {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdById: string;
}

export interface MessagePreview {
  id: string;
  content: string;
  contentType: MessageContentType;
  senderId: string;
  senderName: string;
  createdAt: Date;
}

export interface MessageWithSender {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  contentType: MessageContentType;
  mediaUrl?: string;
  mediaDuration?: number;
  replyTo?: MessagePreview;
  status: MessageStatus;
  reactions: ReactionSummary[];
  createdAt: Date;
  deletedAt?: Date;
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  users: { userId: string; name: string }[];
  hasReacted: boolean;
}

export interface TypingUser {
  oderId: string;
  name: string;
  avatarUrl?: string;
}

export interface PresenceUpdate {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: Date;
}

// WebSocket events
export const MESSAGE_EVENTS = {
  // Server -> Client
  MESSAGE_NEW: 'message.new',
  MESSAGE_DELIVERED: 'message.delivered',
  MESSAGE_READ: 'message.read',
  MESSAGE_DELETED: 'message.deleted',
  MESSAGE_REACTION: 'message.reaction',
  TYPING_UPDATE: 'typing.update',
  RECORDING_UPDATE: 'recording.update',
  PRESENCE_UPDATE: 'presence.update',
  CONVERSATION_UPDATE: 'conversation.update',

  // Client -> Server
  TYPING_START: 'typing.start',
  TYPING_STOP: 'typing.stop',
  RECORDING_START: 'recording.start',
  RECORDING_STOP: 'recording.stop',
  MARK_READ: 'mark.read',
} as const;

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  contentType: MessageContentType;
  mediaUrl?: string;
  replyToId?: string;
}

export interface CreateConversationPayload {
  type: ConversationType;
  participantIds: string[];
  groupName?: string;
  groupDescription?: string;
  groupImageUrl?: string;
}
