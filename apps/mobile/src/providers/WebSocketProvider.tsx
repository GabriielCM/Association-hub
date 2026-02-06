import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  initSocket,
  disconnectSocket,
  isConnected,
  subscribe,
  emit,
  type SocketEvent,
} from '@/services/websocket/socket';
import { useAuthStore } from '@/stores/auth.store';

interface WebSocketContextValue {
  isConnected: boolean;
  subscribe: (event: SocketEvent, callback: (data: unknown) => void) => () => void;
  emit: (event: string, data?: unknown) => void;
  reconnect: () => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(
  undefined
);

export function WebSocketProvider({ children }: PropsWithChildren) {
  const [connected, setConnected] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  // Initialize socket when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      initSocket(user.id).then(() => {
        setConnected(isConnected());
      });

      // Subscribe to connection events
      const unsubConnect = subscribe('connect', () => setConnected(true));
      const unsubDisconnect = subscribe('disconnect', () => setConnected(false));

      return () => {
        unsubConnect();
        unsubDisconnect();
        disconnectSocket();
      };
    } else {
      disconnectSocket();
      setConnected(false);
    }
  }, [isAuthenticated, user?.id]);

  const reconnect = useCallback(async () => {
    disconnectSocket();
    await initSocket(user?.id);
    setConnected(isConnected());
  }, [user?.id]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected: connected,
        subscribe,
        emit,
        reconnect,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}

// Hook for subscribing to specific events
export function useSocketEvent(
  event: SocketEvent,
  callback: (data: unknown) => void
) {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe(event, callback);
    return unsubscribe;
  }, [event, callback, subscribe]);
}
