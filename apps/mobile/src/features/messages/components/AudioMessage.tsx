import { useColorScheme } from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Play } from '@ahub/ui/src/icons';
import { messageGlass } from '@ahub/ui/themes';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const playBtnBg = isOwn
    ? 'rgba(255, 255, 255, 0.25)'
    : isDark
      ? 'rgba(139, 92, 246, 0.3)'
      : '$primary';

  const waveformBg = isOwn
    ? 'rgba(255, 255, 255, 0.25)'
    : isDark
      ? 'rgba(139, 92, 246, 0.25)'
      : 'rgba(139, 92, 246, 0.2)';

  const durationColor = isOwn
    ? messageGlass.bubbleOwnTextTime
    : undefined;

  return (
    <XStack alignItems="center" gap="$2" minWidth={180}>
      <View
        width={32}
        height={32}
        borderRadius="$full"
        backgroundColor={playBtnBg}
        alignItems="center"
        justifyContent="center"
      >
        <Icon icon={Play} size="sm" color="#FFFFFF" weight="fill" />
      </View>
      <YStack flex={1} gap="$0.5">
        <View
          height={4}
          borderRadius="$full"
          backgroundColor={waveformBg}
        />
        <Text
          size="xs"
          color={isOwn ? undefined : 'secondary'}
          style={{ fontSize: 10, ...(durationColor ? { color: durationColor } : {}) }}
        >
          {formatDuration(duration)}
        </Text>
      </YStack>
    </XStack>
  );
}
