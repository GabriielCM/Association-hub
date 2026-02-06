import { Stack } from 'expo-router';

export default function SubscriptionsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[planId]" />
      <Stack.Screen name="my-subscription" />
    </Stack>
  );
}
