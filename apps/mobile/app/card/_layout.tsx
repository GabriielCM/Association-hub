import { Stack } from 'expo-router';

export default function CardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="benefits" />
      <Stack.Screen
        name="partner/[partnerId]"
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen name="history" />
    </Stack>
  );
}
