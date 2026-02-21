import { Stack } from 'expo-router';
import { useStoreTheme } from '@/features/store/hooks/useStoreTheme';

export default function StoreLayout() {
  const st = useStoreTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: st.screenBg },
      }}
    />
  );
}
