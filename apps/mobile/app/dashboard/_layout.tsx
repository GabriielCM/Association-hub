import { Stack } from 'expo-router';

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        presentation: 'modal',
      }}
    >
      <Stack.Screen name="create-post" />
      <Stack.Screen name="create-poll" />
      <Stack.Screen name="create-story" />
      <Stack.Screen
        name="story-viewer"
        options={{ animation: 'fade', presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name="comments" />
      <Stack.Screen
        name="post/[id]"
        options={{ presentation: 'card', animation: 'slide_from_right' }}
      />
    </Stack>
  );
}
