import { io, Socket } from 'socket.io-client';
import { WS_URL, STORAGE_KEYS } from '@/config/constants';

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_INTERVAL = 5000;

export type SocketEvent =
  | 'connect'
  | 'disconnect'
  | 'error'
  | 'notification'
  | 'message'
  | 'points_update'
  | 'event_update'
  | 'checkin_confirmed';

type EventCallback = (data: unknown) => void;
const eventListeners: Map<SocketEvent, Set<EventCallback>> = new Map();

/**
 * Initialize WebSocket connection
 */
export function initSocket(): Socket | null {
  if (typeof window === 'undefined') return null;

  if (socket?.connected) {
    return socket;
  }

  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) {
    console.warn('No auth token, skipping socket connection');
    return null;
  }

  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: RECONNECT_INTERVAL,
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

  return socket;
}

/**
 * Disconnect WebSocket
 */
export function disconnectSocket(): void {
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

function notifyListeners(event: SocketEvent, data: unknown): void {
  eventListeners.get(event)?.forEach((callback) => {
    try {
      callback(data);
    } catch (error) {
      console.error(`Error in ${event} listener:`, error);
    }
  });
}
