import { StyleSheet } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { ORDER_STATUS_ICONS } from '@ahub/ui/src/icons';
import type { OrderStatusHistoryEntry, OrderStatus } from '@ahub/shared/types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#F59E0B',
  CONFIRMED: '#3B82F6',
  READY: '#7C3AED',
  COMPLETED: '#22C55E',
  CANCELLED: '#EF4444',
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
                <XStack alignItems="center" gap="$1">
                  <Icon icon={ORDER_STATUS_ICONS[entry.status as keyof typeof ORDER_STATUS_ICONS] ?? ORDER_STATUS_ICONS.PENDING} size="sm" color={color} />
                  <Text weight={isCurrent ? 'bold' : 'medium'} size="sm">
                    {entry.label}
                  </Text>
                </XStack>
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
