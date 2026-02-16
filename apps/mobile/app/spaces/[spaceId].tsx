import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, Heading, Spinner, GlassCard, SafeImage, NativeViewFallback } from '@ahub/ui';
import * as Haptics from 'expo-haptics';
import { resolveUploadUrl } from '@/config/constants';
import { useSpace } from '@/features/spaces/hooks/useSpaces';
import { useCreateBooking, useJoinWaitlist } from '@/features/bookings/hooks/useBookings';
import { useBenefits } from '@/features/subscriptions/hooks/useMySubscription';
import { SpaceStatusBadge } from '@/features/spaces/components/SpaceStatusBadge';
import { SpacePeriodBadge } from '@/features/spaces/components/SpacePeriodBadge';
import { SpaceRules } from '@/features/spaces/components/SpaceRules';
import { AvailabilityCalendar } from '@/features/spaces/components/AvailabilityCalendar';
import { PeriodSelector } from '@/features/bookings/components/PeriodSelector';
import { BookingProgressBar } from '@/features/bookings/components/BookingProgressBar';
import { InlineConfirmationCard } from '@/features/bookings/components/InlineConfirmationCard';
import { InlineSuccessCard } from '@/features/bookings/components/InlineSuccessCard';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@ahub/ui/themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type BookingStep = 'date' | 'period' | 'review' | 'confirmed';

export default function SpaceDetailScreen() {
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  const { data: space, isLoading } = useSpace(spaceId);
  const joinWaitlist = useJoinWaitlist();
  const createBooking = useCreateBooking();
  const { data: benefits } = useBenefits();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<string | undefined>();
  const [startTime, setStartTime] = useState<string | undefined>();
  const [endTime, setEndTime] = useState<string | undefined>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Auto-scroll refs
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionYRef = useRef<Record<string, number>>({});
  const contentContainerY = useRef(0);

  // Derive current step from state
  const currentStep: BookingStep = useMemo(() => {
    if (showSuccess) return 'confirmed';
    if (showConfirmation) return 'review';
    if (selectedDate) {
      if (!space) return 'period';
      if (space.periodType === 'DAY') return 'review';
      if (space.periodType === 'SHIFT' && selectedShift) return 'review';
      if (space.periodType === 'HOUR' && startTime && endTime) return 'review';
      return 'period';
    }
    return 'date';
  }, [selectedDate, selectedShift, startTime, endTime, showConfirmation, showSuccess, space]);

  // Scroll helper — called directly from handlers
  const scrollToSection = useCallback((key: string, delay = 150) => {
    const timer = setTimeout(() => {
      const y = sectionYRef.current[key];
      if (y != null) {
        scrollViewRef.current?.scrollTo({ y: y - 16, animated: true });
      }
    }, delay);
    return timer;
  }, []);

  // Fallback auto-scroll for SHIFT/HOUR step transitions via useMemo
  useEffect(() => {
    const key =
      currentStep === 'period' ? 'period'
      : currentStep === 'review' ? 'review'
      : currentStep === 'confirmed' ? 'success'
      : null;

    if (!key) return;

    const timer = scrollToSection(key);
    return () => clearTimeout(timer);
  }, [currentStep, scrollToSection]);

  const handleSelectDate = useCallback((date: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setSelectedDate(date);
    setSelectedShift(undefined);
    setStartTime(undefined);
    setEndTime(undefined);
    setShowConfirmation(false);
    setShowSuccess(false);
    setBookingError(null);
    // Scroll to period/date-selected section
    scrollToSection('period');
  }, [space, scrollToSection]);

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

  const handleShowConfirmation = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowConfirmation(true);
    setBookingError(null);
    scrollToSection('review');
  }, [scrollToSection]);

  const handleConfirmBooking = useCallback(() => {
    if (!space || !selectedDate) return;
    setBookingError(null);
    createBooking.mutate(
      {
        spaceId: space.id,
        date: selectedDate,
        periodType: space.periodType,
        ...(selectedShift != null && { shiftName: selectedShift }),
        ...(startTime != null && { startTime }),
        ...(endTime != null && { endTime }),
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          scrollToSection('success');
        },
        onError: (err) => {
          setBookingError(
            err instanceof Error ? err.message : 'Erro ao criar reserva',
          );
        },
      },
    );
  }, [space, selectedDate, selectedShift, startTime, endTime, createBooking, scrollToSection]);

  const handleDismissSuccess = useCallback(() => {
    setShowSuccess(false);
    setShowConfirmation(false);
    setSelectedDate(null);
  }, []);

  // Compute display price with subscription discount
  const { originalPrice, finalPrice, discountPercentage } = useMemo(() => {
    if (!space || space.fee == null || space.fee === 0) {
      return { originalPrice: null, finalPrice: null, discountPercentage: undefined as number | undefined };
    }
    const original = space.fee;
    const discount = benefits?.mutators?.discount_spaces ?? 0;
    if (discount > 0) {
      const final = Math.round(original * (1 - discount / 100));
      return { originalPrice: original, finalPrice: final, discountPercentage: discount };
    }
    return { originalPrice: original, finalPrice: original, discountPercentage: undefined as number | undefined };
  }, [space, benefits]);

  const periodLabel = useMemo(() => {
    if (!space) return '';
    if (space.periodType === 'DAY') return 'Dia inteiro';
    if (space.periodType === 'SHIFT' && selectedShift) return `Turno: ${selectedShift}`;
    if (startTime && endTime) return `${startTime} - ${endTime}`;
    return '';
  }, [space, selectedShift, startTime, endTime]);

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
    <View style={{ flex: 1, backgroundColor: '#F8F7FF' }}>
      <NativeViewFallback fallback={<View />}>
        <LinearGradient
          colors={['#F8F7FF', '#F0EEFF', '#F5F3FF']}
          style={StyleSheet.absoluteFill}
        />
      </NativeViewFallback>
      {/* Sticky header with subtle shadow */}
      <View style={styles.stickyHeader}>
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

        <BookingProgressBar currentStep={currentStep} />
      </View>

      {/* Scrollable content */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo gallery */}
        {photos.length > 0 && (
          <YStack>
            <FlatList
              data={photos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => `photo-${index}`}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setActivePhotoIndex(idx);
              }}
              renderItem={({ item }) => (
                <SafeImage
                  source={{ uri: item }}
                  style={styles.galleryImage}
                  contentFit="cover"
                  transition={200}
                  placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                />
              )}
            />
            {/* Pagination dots */}
            {photos.length > 1 && (
              <XStack justifyContent="center" gap="$1" marginTop="$2">
                {photos.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === activePhotoIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </XStack>
            )}
          </YStack>
        )}

        <YStack
          padding="$4"
          gap="$5"
          onLayout={(e) => { contentContainerY.current = e.nativeEvent.layout.y; }}
        >
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
            <Text weight="semibold" size="lg">
              Disponibilidade
            </Text>
            <AvailabilityCalendar
              spaceId={space.id}
              onSelectDate={handleSelectDate}
              onOccupiedDate={handleOccupiedDate}
            />
          </YStack>

          {/* Period selector (shown when date is selected) */}
          {selectedDate && !showSuccess && (
            <View
              onLayout={(e) => {
                sectionYRef.current.period = contentContainerY.current + e.nativeEvent.layout.y;
              }}
            >
              <GlassCard intensity="subtle" borderRadius={12} padding={16}>
                <YStack gap="$3">
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

                  {/* Show review button when period is selected but confirmation isn't shown yet */}
                  {canConfirm() && !showConfirmation && (
                    <Pressable
                      onPress={handleShowConfirmation}
                      style={styles.reviewButton}
                    >
                      <Text size="base" weight="semibold" style={{ color: '#FFFFFF' }}>
                        Revisar Reserva
                        {finalPrice != null && finalPrice > 0
                          ? ` - R$ ${(finalPrice / 100).toFixed(2)}`
                          : ' - Gratuito'}
                      </Text>
                    </Pressable>
                  )}
                </YStack>
              </GlassCard>
            </View>
          )}

          {/* Inline confirmation card */}
          {selectedDate && !showSuccess && (
            <View
              onLayout={(e) => {
                sectionYRef.current.review = contentContainerY.current + e.nativeEvent.layout.y;
              }}
            >
              <InlineConfirmationCard
                visible={showConfirmation}
                space={space}
                date={selectedDate}
                {...(selectedShift != null && { shift: selectedShift })}
                {...(startTime != null && { startTime })}
                {...(endTime != null && { endTime })}
                price={finalPrice}
                {...(originalPrice != null && originalPrice !== finalPrice && { originalPrice })}
                {...(discountPercentage != null && { discountPercentage })}
                onConfirm={handleConfirmBooking}
                onCancel={() => setShowConfirmation(false)}
                isLoading={createBooking.isPending}
                isSuccess={false}
                error={bookingError}
              />
            </View>
          )}

          {/* Inline success card */}
          {selectedDate && (
            <View
              onLayout={(e) => {
                sectionYRef.current.success = contentContainerY.current + e.nativeEvent.layout.y;
              }}
            >
              <InlineSuccessCard
                visible={showSuccess}
                spaceName={space.name}
                date={selectedDate}
                periodLabel={periodLabel}
                onViewBookings={() => router.push('/bookings' as any)}
                onDismiss={handleDismissSuccess}
              />
            </View>
          )}
        </YStack>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    backgroundColor: '#F8F7FF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1,
  },
  container: {
    paddingBottom: 40,
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: Math.round(SCREEN_WIDTH * 9 / 16),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(156, 163, 175, 0.4)',
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  reviewButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 9999,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
});
