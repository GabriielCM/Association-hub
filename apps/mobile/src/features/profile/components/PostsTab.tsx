import { YStack } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Camera } from '@ahub/ui/src/icons';

export function PostsTab() {
  return (
    <YStack alignItems="center" paddingVertical="$8" gap="$3">
      <Icon icon={Camera} size={48} color="muted" weight="duotone" />
      <Text weight="semibold" size="lg">
        Nenhum post ainda
      </Text>
      <Text color="secondary" size="sm" align="center" style={{ maxWidth: 240 }}>
        Os posts do usuário aparecerão aqui.
      </Text>
    </YStack>
  );
}
