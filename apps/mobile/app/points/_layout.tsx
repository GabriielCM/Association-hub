import { Stack } from 'expo-router';

export default function PointsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="transfer" />
      <Stack.Screen name="rankings" />
    </Stack>
  );
}
