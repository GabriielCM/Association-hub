import { XStack, YStack, View } from 'tamagui';
import { Text } from '@ahub/ui';

interface CheckInProgressProps {
  completedCheckins: number[];
  total: number;
  pointsTotal: number;
}

export function CheckInProgress({
  completedCheckins,
  total,
  pointsTotal,
}: CheckInProgressProps) {
  const completed = completedCheckins.length;
  const completedSet = new Set(completedCheckins);
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const pointsEarned = total > 0
    ? Math.floor((completed / total) * pointsTotal)
    : 0;

  return (
    <YStack gap="$2">
      <XStack justifyContent="space-between" alignItems="center">
        <Text weight="semibold" size="sm">
          Progresso: {completed}/{total} check-ins
        </Text>
        <Text color="accent" size="sm" weight="semibold">
          {pointsEarned}/{pointsTotal} pts
        </Text>
      </XStack>

      {/* Progress bar */}
      <View
        backgroundColor="$backgroundHover"
        borderRadius="$full"
        height={8}
        overflow="hidden"
      >
        <View
          backgroundColor="$primary"
          borderRadius="$full"
          height={8}
          width={`${Math.min(percentage, 100)}%` as any}
        />
      </View>

      {/* Individual check-in indicators */}
      <XStack gap="$2" justifyContent="center">
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            width={24}
            height={24}
            borderRadius="$full"
            backgroundColor={
              completedSet.has(i + 1) ? '$primary' : '$backgroundHover'
            }
            alignItems="center"
            justifyContent="center"
          >
            <Text
              size="xs"
              style={{
                color: completedSet.has(i + 1) ? '#fff' : undefined,
              }}
            >
              {i + 1}
            </Text>
          </View>
        ))}
      </XStack>
    </YStack>
  );
}
