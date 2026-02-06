import { Redirect } from 'expo-router';
import { useAuthContext } from '@/providers/AuthProvider';
import { View } from 'tamagui';
import { Loading } from '@ahub/ui';

/**
 * Root index - redirects to auth or tabs based on auth state
 */
export default function Index() {
  const { isAuthenticated, isLoading, isHydrated } = useAuthContext();

  // Show loading while checking auth state
  if (!isHydrated || isLoading) {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
      >
        <Loading.Spinner size="xl" />
      </View>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
