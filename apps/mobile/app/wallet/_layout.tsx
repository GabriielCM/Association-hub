import { Stack } from 'expo-router';

export default function WalletLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="scanner" />
      <Stack.Screen name="transfer" />
      <Stack.Screen name="history" />
      <Stack.Screen name="strava" />
      <Stack.Screen name="pdv-checkout" />
    </Stack>
  );
}
