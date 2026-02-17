import { XStack, YStack, View } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Play } from '@ahub/ui/src/icons';

function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

interface AudioMessageProps {
  mediaUrl: string;
  duration?: number | undefined;
  isOwn: boolean;
}

export function AudioMessage({ duration, isOwn }: AudioMessageProps) {
  return (
    <XStack alignItems="center" gap="$2" minWidth={180}>
      <View
        width={32}
        height={32}
        borderRadius="$full"
        backgroundColor={isOwn ? 'rgba(255,255,255,0.2)' : '$primary'}
        alignItems="center"
        justifyContent="center"
      >
        <Icon icon={Play} size="sm" color="#FFFFFF" weight="fill" />
      </View>
      <YStack flex={1} gap="$0.5">
        <View
          height={4}
          borderRadius="$full"
          backgroundColor={
            isOwn ? 'rgba(255,255,255,0.2)' : 'rgba(139, 92, 246, 0.2)'
          }
        />
        <Text
          size="xs"
          color={isOwn ? undefined : 'secondary'}
          style={isOwn ? { fontSize: 10, color: 'rgba(255,255,255,0.6)' } : { fontSize: 10 }}
        >
          {formatDuration(duration)}
        </Text>
      </YStack>
    </XStack>
  );
}
