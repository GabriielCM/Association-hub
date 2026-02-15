import { StyleSheet } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text } from '@ahub/ui';
import type { OrderStatusHistoryEntry, OrderStatus } from '@ahub/shared/types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#F59E0B',
  CONFIRMED: '#3B82F6',
  READY: '#7C3AED',
  COMPLETED: '#22C55E',
  CANCELLED: '#EF4444',
};

const STATUS_ICONS: Record<OrderStatus, string> = {
  PENDING: '🕐',
  CONFIRMED: '✓',
  READY: '📦',
  COMPLETED: '✅',
  CANCELLED: '✕',
};

interface OrderTimelineProps {
  timeline: OrderStatusHistoryEntry[];
  currentStatus: OrderStatus;
}

export function OrderTimeline({ timeline, currentStatus }: OrderTimelineProps) {
  return (
    <YStack gap="$0">
      {timeline.map((entry, index) => {
        const isLast = index === timeline.length - 1;
        const isCurrent = entry.status === currentStatus;
        const color = STATUS_COLORS[entry.status] ?? '#9CA3AF';
        const date = new Date(entry.createdAt);
        const timeStr = date.toLocaleString('pt-BR', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <XStack key={entry.status} gap="$3">
            {/* Timeline column */}
            <YStack alignItems="center" width={24}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: color },
                  isCurrent && styles.dotCurrent,
                ]}
              />
              {!isLast && (
                <View style={[styles.line, { backgroundColor: color }]} />
              )}
            </YStack>

            {/* Content */}
            <YStack flex={1} paddingBottom="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <Text weight={isCurrent ? 'bold' : 'medium'} size="sm">
                  {STATUS_ICONS[entry.status]} {entry.label}
                </Text>
                <Text size="xs" color="secondary">
                  {timeStr}
                </Text>
              </XStack>
              {entry.description ? (
                <Text size="xs" color="secondary">
                  {entry.description}
                </Text>
              ) : null}
            </YStack>
          </XStack>
        );
      })}
    </YStack>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  dotCurrent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 16,
  },
});
