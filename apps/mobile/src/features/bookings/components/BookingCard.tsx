import { Pressable, StyleSheet, Image } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Card, Text } from '@ahub/ui';
import { resolveUploadUrl } from '@/config/constants';
import { BookingStatusBadge } from './BookingStatusBadge';
import type { BookingListItem } from '@ahub/shared/types';

interface BookingCardProps {
  booking: BookingListItem;
  onPress: (booking: BookingListItem) => void;
  onCancel?: (booking: BookingListItem) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    weekday: 'short',
  });
}

function formatPeriod(booking: BookingListItem): string {
  if (booking.periodType === 'DAY') return 'Dia inteiro';
  if (booking.periodType === 'SHIFT' && booking.shiftName) return `Turno: ${booking.shiftName}`;
  if (booking.periodType === 'HOUR' && booking.startTime && booking.endTime)
    return `${booking.startTime} - ${booking.endTime}`;
  return '';
}

export function BookingCard({ booking, onPress, onCancel }: BookingCardProps) {
  const feeLabel =
    booking.finalFee != null && booking.finalFee > 0
      ? `R$ ${(booking.finalFee / 100).toFixed(2)}`
      : booking.fee != null && booking.fee > 0
        ? `R$ ${(booking.fee / 100).toFixed(2)}`
        : 'Gratuito';

  return (
    <Pressable onPress={() => onPress(booking)}>
      <Card variant="flat">
        <YStack gap="$2">
          {/* Header: space + status */}
          <XStack justifyContent="space-between" alignItems="center">
            <XStack gap="$2" alignItems="center" flex={1}>
              <View style={styles.spaceImage}>
                {booking.space.mainImageUrl ? (
                  <Image
                    source={{ uri: resolveUploadUrl(booking.space.mainImageUrl) ?? undefined }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text size="sm">🏠</Text>
                  </View>
                )}
              </View>
              <Text weight="semibold" size="sm" numberOfLines={1} flex={1}>
                {booking.space.name}
              </Text>
            </XStack>
            <BookingStatusBadge status={booking.status} />
          </XStack>

          {/* Date + Period */}
          <XStack gap="$2">
            <Text size="xs" color="secondary">
              {formatDate(booking.date)}
            </Text>
            <Text size="xs" color="secondary">
              · {formatPeriod(booking)}
            </Text>
          </XStack>

          {/* Bottom: fee + cancel */}
          <XStack justifyContent="space-between" alignItems="center">
            <Text size="sm" weight="medium" color="accent">
              {feeLabel}
            </Text>
            {booking.canCancel && onCancel && (
              <Pressable
                onPress={() => onCancel(booking)}
                style={styles.cancelButton}
              >
                <Text size="xs" color="error">
                  Cancelar
                </Text>
              </Pressable>
            )}
          </XStack>
        </YStack>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  spaceImage: {
    width: 32,
    height: 32,
    borderRadius: 6,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
