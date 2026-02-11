import { YStack } from 'tamagui';
import { Text } from '@ahub/ui';

export function PostsTab() {
  return (
    <YStack alignItems="center" paddingVertical="$8" gap="$3">
      <Text style={{ fontSize: 48 }}>📷</Text>
      <Text weight="semibold" size="lg">
        Nenhum post ainda
      </Text>
      <Text color="secondary" size="sm" align="center" style={{ maxWidth: 240 }}>
        Os posts do usuário aparecerão aqui.
      </Text>
    </YStack>
  );
}
