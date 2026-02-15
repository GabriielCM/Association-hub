import { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, Heading, Spinner } from '@ahub/ui';
import { resolveUploadUrl } from '@/config/constants';
import { useSpace } from '@/features/spaces/hooks/useSpaces';
import { useJoinWaitlist } from '@/features/bookings/hooks/useBookings';
import { SpaceStatusBadge } from '@/features/spaces/components/SpaceStatusBadge';
import { SpacePeriodBadge } from '@/features/spaces/components/SpacePeriodBadge';
import { SpaceRules } from '@/features/spaces/components/SpaceRules';
import { AvailabilityCalendar } from '@/features/spaces/components/AvailabilityCalendar';
import { PeriodSelector } from '@/features/bookings/components/PeriodSelector';
import { ConfirmBookingSheet } from '@/features/bookings/components/ConfirmBookingSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SpaceDetailScreen() {
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  const { data: space, isLoading } = useSpace(spaceId);
  const joinWaitlist = useJoinWaitlist();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<string | undefined>();
  const [startTime, setStartTime] = useState<string | undefined>();
  const [endTime, setEndTime] = useState<string | undefined>();
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);

  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedShift(undefined);
    setStartTime(undefined);
    setEndTime(undefined);
  }, []);

  const handleOccupiedDate = useCallback(
    (date: string) => {
      if (!space) return;
      Alert.alert(
        'Data ocupada',
        'Deseja entrar na fila de espera para esta data?',
        [
          { text: 'Não', style: 'cancel' },
          {
            text: 'Entrar na fila',
            onPress: () => {
              joinWaitlist.mutate(
                { spaceId: space.id, date, periodType: space.periodType },
                {
                  onSuccess: (result) => {
                    Alert.alert('Fila de espera', result.message);
                  },
                  onError: (err) => {
                    Alert.alert(
                      'Erro',
                      err instanceof Error
                        ? err.message
                        : 'Não foi possível entrar na fila',
                    );
                  },
                },
              );
            },
          },
        ],
      );
    },
    [space, joinWaitlist],
  );

  const canConfirm = () => {
    if (!selectedDate || !space) return false;
    if (space.periodType === 'DAY') return true;
    if (space.periodType === 'SHIFT') return !!selectedShift;
    if (space.periodType === 'HOUR') return !!startTime && !!endTime;
    return false;
  };

  const handleBookingSuccess = useCallback(
    (_bookingId: string) => {
      setShowConfirmSheet(false);
      setSelectedDate(null);
      Alert.alert(
        'Reserva criada!',
        'Sua reserva foi criada e está pendente de aprovação.',
        [
          {
            text: 'Ver Minhas Reservas',
            onPress: () => router.push('/bookings' as any),
          },
          { text: 'OK' },
        ],
      );
    },
    [],
  );

  if (isLoading || !space) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      </SafeAreaView>
    );
  }

  const rawPhotos = space.images?.length ? space.images : space.mainImageUrl ? [space.mainImageUrl] : [];
  const photos = rawPhotos.map((p) => resolveUploadUrl(p)).filter(Boolean) as string[];

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
          <Heading level={4} style={{ flex: 1 }} numberOfLines={1}>
            {space.name}
          </Heading>
          <SpaceStatusBadge status={space.status} />
        </XStack>

        {/* Photo gallery */}
        {photos.length > 0 && (
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => `photo-${index}`}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.galleryImage}
                resizeMode="cover"
              />
            )}
          />
        )}

        <YStack padding="$4" gap="$5">
          {/* Basic info */}
          <YStack gap="$2">
            <XStack gap="$2" alignItems="center">
              <SpacePeriodBadge periodType={space.periodType} />
              <Text size="sm" color="secondary">
                {space.capacity} pessoas
              </Text>
            </XStack>
            <Text size="sm" color="secondary">
              {space.description}
            </Text>
          </YStack>

          {/* Rules */}
          <SpaceRules space={space} />

          {/* Availability Calendar */}
          <YStack gap="$2">
            <Text weight="semibold" size="base">
              Disponibilidade
            </Text>
            <AvailabilityCalendar
              spaceId={space.id}
              onSelectDate={handleSelectDate}
              onOccupiedDate={handleOccupiedDate}
            />
          </YStack>

          {/* Period selector (shown when date is selected) */}
          {selectedDate && (
            <YStack gap="$3" padding="$3" style={styles.selectionCard}>
              <Text size="sm" weight="medium">
                Data selecionada:{' '}
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                })}
              </Text>

              <PeriodSelector
                space={space}
                {...(selectedShift != null && { selectedShift })}
                {...(startTime != null && { startTime })}
                {...(endTime != null && { endTime })}
                onShiftChange={setSelectedShift}
                onTimeChange={(s, e) => {
                  setStartTime(s);
                  setEndTime(e);
                }}
              />

              <Pressable
                onPress={() => setShowConfirmSheet(true)}
                style={[
                  styles.bookButton,
                  !canConfirm() && styles.bookButtonDisabled,
                ]}
                disabled={!canConfirm()}
              >
                <Text
                  size="base"
                  weight="semibold"
                  style={{ color: '#FFFFFF' }}
                >
                  Reservar
                </Text>
              </Pressable>
            </YStack>
          )}
        </YStack>
      </ScrollView>

      {/* Confirm booking sheet */}
      {selectedDate && (
        <ConfirmBookingSheet
          visible={showConfirmSheet}
          space={space}
          date={selectedDate}
          {...(selectedShift != null && { shift: selectedShift })}
          {...(startTime != null && { startTime })}
          {...(endTime != null && { endTime })}
          onClose={() => setShowConfirmSheet(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: Math.round(SCREEN_WIDTH * 9 / 16),
  },
  selectionCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  bookButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
});
