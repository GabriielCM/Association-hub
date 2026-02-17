import { io, Socket } from 'socket.io-client';
import { AppState, AppStateStatus } from 'react-native';
import { WS_URL, WS_RECONNECT_INTERVAL } from '@/config/constants';
import { getAccessToken } from '@/services/storage/secure-store';

let socket: Socket | null = null;
let reconnectAttempts = 0;
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;
const MAX_RECONNECT_ATTEMPTS = 10;

export type SocketEvent =
  | 'connect'
  | 'disconnect'
  | 'error'
  | 'notification'
  | 'message'
  | 'points_update'
  | 'event_update'
  | 'checkin_confirmed'
  // Notification events
  | 'notification.new'
  | 'notification.read'
  | 'notification.deleted'
  | 'unread_count.update'
  | 'settings.changed'
  // Message events
  | 'message.new'
  | 'message.delivered'
  | 'message.read'
  | 'message.deleted'
  | 'message.reaction'
  | 'typing.update'
  | 'recording.update'
  | 'presence.update'
  | 'conversation.update'
  // Dashboard / Feed events
  | 'feed.post_new'
  | 'feed.post_liked'
  | 'feed.post_deleted'
  | 'story.new'
  | 'poll.vote_update';

type EventCallback = (data: unknown) => void;
const eventListeners: Map<SocketEvent, Set<EventCallback>> = new Map();

/**
 * Initialize WebSocket connection
 */
export async function initSocket(userId?: string, userName?: string): Promise<Socket | null> {
  if (socket?.connected) {
    return socket;
  }

  const token = await getAccessToken();
  if (!token) {
    console.warn('No auth token, skipping socket connection');
    return null;
  }

  socket = io(`${WS_URL}/ws/messages`, {
    auth: { token, userId, userName },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: WS_RECONNECT_INTERVAL,
    timeout: 10000,
  });

  // Connection events
  socket.on('connect', () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
    notifyListeners('connect', { connected: true });
  });

  socket.on('disconnect', (reason) => {
    console.log('WebSocket disconnected:', reason);
    notifyListeners('disconnect', { reason });
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error.message);
    reconnectAttempts++;

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      socket?.disconnect();
    }

    notifyListeners('error', { error: error.message });
  });

  // Disconnect WebSocket when app goes to background so push notifications work
  if (appStateSubscription) {
    appStateSubscription.remove();
  }
  appStateSubscription = AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'background' || state === 'inactive') {
      socket?.disconnect();
    } else if (state === 'active' && socket && !socket.connected) {
      socket.connect();
    }
  });

  // Business events
  socket.on('notification', (data) => {
    notifyListeners('notification', data);
  });

  socket.on('message', (data) => {
    notifyListeners('message', data);
  });

  socket.on('points_update', (data) => {
    notifyListeners('points_update', data);
  });

  socket.on('event_update', (data) => {
    notifyListeners('event_update', data);
  });

  socket.on('checkin_confirmed', (data) => {
    notifyListeners('checkin_confirmed', data);
  });

  // Notification events
  socket.on('notification.new', (data) => {
    notifyListeners('notification.new', data);
  });

  socket.on('notification.read', (data) => {
    notifyListeners('notification.read', data);
  });

  socket.on('notification.deleted', (data) => {
    notifyListeners('notification.deleted', data);
  });

  socket.on('unread_count.update', (data) => {
    notifyListeners('unread_count.update', data);
  });

  socket.on('settings.changed', (data) => {
    notifyListeners('settings.changed', data);
  });

  // Message events
  socket.on('message.new', (data) => {
    notifyListeners('message.new', data);
  });

  socket.on('message.delivered', (data) => {
    notifyListeners('message.delivered', data);
  });

  socket.on('message.read', (data) => {
    notifyListeners('message.read', data);
  });

  socket.on('message.deleted', (data) => {
    notifyListeners('message.deleted', data);
  });

  socket.on('message.reaction', (data) => {
    notifyListeners('message.reaction', data);
  });

  socket.on('typing.update', (data) => {
    notifyListeners('typing.update', data);
  });

  socket.on('recording.update', (data) => {
    notifyListeners('recording.update', data);
  });

  socket.on('presence.update', (data) => {
    notifyListeners('presence.update', data);
  });

  socket.on('conversation.update', (data) => {
    notifyListeners('conversation.update', data);
  });

  // Dashboard / Feed events
  socket.on('feed.post_new', (data) => {
    notifyListeners('feed.post_new', data);
  });

  socket.on('feed.post_liked', (data) => {
    notifyListeners('feed.post_liked', data);
  });

  socket.on('feed.post_deleted', (data) => {
    notifyListeners('feed.post_deleted', data);
  });

  socket.on('story.new', (data) => {
    notifyListeners('story.new', data);
  });

  socket.on('poll.vote_update', (data) => {
    notifyListeners('poll.vote_update', data);
  });

  return socket;
}

/**
 * Disconnect WebSocket
 */
export function disconnectSocket(): void {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  eventListeners.clear();
}

/**
 * Get current socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Check if socket is connected
 */
export function isConnected(): boolean {
  return socket?.connected ?? false;
}

/**
 * Subscribe to socket event
 */
export function subscribe(event: SocketEvent, callback: EventCallback): () => void {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set());
  }
  eventListeners.get(event)!.add(callback);

  // Return unsubscribe function
  return () => {
    eventListeners.get(event)?.delete(callback);
  };
}

/**
 * Emit event to server
 */
export function emit(event: string, data?: unknown): void {
  if (socket?.connected) {
    socket.emit(event, data);
  } else {
    console.warn('Socket not connected, cannot emit:', event);
  }
}

/**
 * Notify all listeners of an event
 */
function notifyListeners(event: SocketEvent, data: unknown): void {
  eventListeners.get(event)?.forEach((callback) => {
    try {
      callback(data);
    } catch (error) {
      console.error(`Error in ${event} listener:`, error);
    }
  });
}
