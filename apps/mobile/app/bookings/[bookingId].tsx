import { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, Heading, Spinner, Card } from '@ahub/ui';
import { resolveUploadUrl } from '@/config/constants';
import { useBooking } from '@/features/bookings/hooks/useBookings';
import { BookingStatusBadge } from '@/features/bookings/components/BookingStatusBadge';
import { CancelBookingSheet } from '@/features/bookings/components/CancelBookingSheet';
function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BookingDetailScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { data: booking, isLoading, refetch } = useBooking(bookingId);
  const [showCancel, setShowCancel] = useState(false);

  const handleCancelled = useCallback(() => {
    setShowCancel(false);
    refetch();
  }, [refetch]);

  if (isLoading || !booking) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      </SafeAreaView>
    );
  }

  const periodLabel =
    booking.periodType === 'DAY'
      ? 'Dia inteiro'
      : booking.periodType === 'SHIFT' && booking.shiftName
        ? `Turno: ${booking.shiftName}`
        : booking.startTime && booking.endTime
          ? `${booking.startTime} - ${booking.endTime}`
          : '';

  const feeLabel =
    booking.finalFee != null && booking.finalFee > 0
      ? `R$ ${(booking.finalFee / 100).toFixed(2)}`
      : booking.fee != null && booking.fee > 0
        ? `R$ ${(booking.fee / 100).toFixed(2)}`
        : 'Gratuito';

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$3"
          alignItems="center"
          gap="$3"
        >
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Text size="lg">←</Text>
          </Pressable>
          <Heading level={4} style={{ flex: 1 }}>
            Reserva
          </Heading>
          <BookingStatusBadge status={booking.status} />
        </XStack>

        <YStack padding="$4" gap="$5">
          {/* Space card */}
          <Card variant="flat">
            <XStack gap="$3" alignItems="center">
              <View style={styles.spaceImage}>
                {booking.space.mainImageUrl ? (
                  <Image
                    source={{ uri: resolveUploadUrl(booking.space.mainImageUrl) ?? undefined }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text size="xl">🏠</Text>
                  </View>
                )}
              </View>
              <YStack flex={1} gap="$1">
                <Text weight="semibold" size="base">
                  {booking.space.name}
                </Text>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/spaces/[spaceId]' as any,
                      params: { spaceId: booking.space.id },
                    })
                  }
                >
                  <Text size="xs" color="accent">
                    Ver espaço →
                  </Text>
                </Pressable>
              </YStack>
            </XStack>
          </Card>

          {/* Booking details */}
          <YStack gap="$3">
            <Text weight="semibold" size="base">
              Detalhes
            </Text>
            <YStack gap="$2.5" padding="$3" style={styles.detailsCard}>
              <XStack justifyContent="space-between">
                <Text size="sm" color="secondary">Data</Text>
                <Text size="sm" weight="medium">{formatDate(booking.date)}</Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text size="sm" color="secondary">Período</Text>
                <Text size="sm" weight="medium">{periodLabel}</Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text size="sm" color="secondary">Taxa</Text>
                <Text size="sm" weight="semibold" color="accent">{feeLabel}</Text>
              </XStack>
              {booking.discountApplied != null && booking.discountApplied > 0 && (
                <XStack justifyContent="space-between">
                  <Text size="sm" color="secondary">Desconto assinatura</Text>
                  <Text size="sm" weight="medium" color="success">
                    -{booking.discountApplied}%
                  </Text>
                </XStack>
              )}
            </YStack>
          </YStack>

          {/* Timeline */}
          <YStack gap="$3">
            <Text weight="semibold" size="base">
              Timeline
            </Text>
            <YStack gap="$2">
              <TimelineItem
                label="Solicitada"
                date={formatDateTime(booking.createdAt)}
                active
              />
              {booking.approvedAt && (
                <TimelineItem
                  label="Aprovada"
                  date={formatDateTime(booking.approvedAt)}
                  active
                />
              )}
              {booking.rejectedAt && (
                <TimelineItem
                  label="Rejeitada"
                  date={formatDateTime(booking.rejectedAt)}
                  active
                  isError
                />
              )}
              {booking.cancelledAt && (
                <TimelineItem
                  label="Cancelada"
                  date={formatDateTime(booking.cancelledAt)}
                  active
                  isError
                />
              )}
              {booking.status === 'COMPLETED' && (
                <TimelineItem label="Concluída" date="" active />
              )}
              {booking.status === 'EXPIRED' && (
                <TimelineItem
                  label="Expirada"
                  date=""
                  active
                  isError
                />
              )}
            </YStack>
          </YStack>

          {/* Rejection/cancellation reason */}
          {booking.rejectionReason && (
            <YStack gap="$2" padding="$3" style={styles.reasonCard}>
              <Text size="sm" weight="medium" color="error">
                Motivo da rejeição
              </Text>
              <Text size="sm" color="secondary">
                {booking.rejectionReason}
              </Text>
            </YStack>
          )}
          {booking.cancellationReason && (
            <YStack gap="$2" padding="$3" style={styles.reasonCard}>
              <Text size="sm" weight="medium" color="error">
                Motivo do cancelamento
              </Text>
              <Text size="sm" color="secondary">
                {booking.cancellationReason}
              </Text>
            </YStack>
          )}

          {/* Cancel button */}
          {booking.canCancel && (
            <Pressable
              onPress={() => setShowCancel(true)}
              style={styles.cancelButton}
            >
              <Text size="sm" weight="semibold" color="error">
                Cancelar Reserva
              </Text>
            </Pressable>
          )}
        </YStack>
      </ScrollView>

      <CancelBookingSheet
        visible={showCancel}
        booking={booking}
        onClose={() => setShowCancel(false)}
        onCancelled={handleCancelled}
      />
    </SafeAreaView>
  );
}

function TimelineItem({
  label,
  date,
  active,
  isError,
}: {
  label: string;
  date: string;
  active: boolean;
  isError?: boolean;
}) {
  const dotColor = isError ? '#EF4444' : active ? '#22C55E' : '#D1D5DB';
  return (
    <XStack gap="$3" alignItems="center">
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <YStack flex={1}>
        <Text size="sm" weight="medium">
          {label}
        </Text>
        {date ? (
          <Text size="xs" color="secondary">
            {date}
          </Text>
        ) : null}
      </YStack>
    </XStack>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  spaceImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
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
  detailsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  reasonCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
});
