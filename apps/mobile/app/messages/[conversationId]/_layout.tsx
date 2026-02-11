import { Stack } from 'expo-router';

export default function ConversationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="group" />
      <Stack.Screen name="contact" />
    </Stack>
  );
}
