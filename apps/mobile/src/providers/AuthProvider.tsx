import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
} from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useAuthStore } from '@/stores/auth.store';
import { registerForPushNotifications, setupNotificationListeners } from '@/services/notifications/push';
import { InAppNotificationBanner } from '@/features/messages/components/InAppNotificationBanner';
import { router } from 'expo-router';
import type { User } from '@ahub/shared/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrate = useAuthStore((state) => state.hydrate);
  const logout = useAuthStore((state) => state.logout);

  // Hydrate auth state on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Listen for logout events from API interceptor
  useEffect(() => {
    const handleLogout = () => {
      logout();
    };

    const subscription = DeviceEventEmitter.addListener('auth:logout', handleLogout);
    return () => subscription.remove();
  }, [logout]);

  // Register push notification token when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    registerForPushNotifications().catch((err) =>
      console.warn('[Push] Registration failed:', err)
    );

    const cleanup = setupNotificationListeners((data) => {
      // Navigate to conversation when notification is tapped
      if (data?.type === 'message' && data?.conversationId) {
        router.push({
          pathname: '/messages/[conversationId]',
          params: { conversationId: data.conversationId as string },
        } as never);
      }
    });

    return cleanup;
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isHydrated,
      }}
    >
      {children}
      {isAuthenticated && <InAppNotificationBanner />}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
