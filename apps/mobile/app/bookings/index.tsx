import { useState, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Pressable } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text, Heading, Spinner } from '@ahub/ui';
import {
  useMyBookings,
  useWaitlistPosition,
  useConfirmWaitlistSlot,
  useLeaveWaitlist,
} from '@/features/bookings/hooks/useBookings';
import { BookingCard } from '@/features/bookings/components/BookingCard';
import { WaitlistCard } from '@/features/bookings/components/WaitlistCard';
import { CancelBookingSheet } from '@/features/bookings/components/CancelBookingSheet';
import type { BookingListItem, MyBookingsFilter, WaitlistEntry } from '@ahub/shared/types';

type Tab = 'pending' | 'approved' | 'history';

const TAB_LABELS: Record<Tab, string> = {
  pending: 'Pendentes',
  approved: 'Aprovadas',
  history: 'Histórico',
};

export default function MyBookingsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [cancelTarget, setCancelTarget] = useState<BookingListItem | null>(null);

  const filters: MyBookingsFilter = { tab: activeTab };

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useMyBookings(filters);

  const { data: waitlistData } = useWaitlistPosition();
  const confirmSlot = useConfirmWaitlistSlot();
  const leaveWaitlist = useLeaveWaitlist();

  const bookings = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const waitlistEntries = waitlistData?.entries ?? [];

  const handleBookingPress = useCallback((booking: BookingListItem) => {
    router.push({
      pathname: '/bookings/[bookingId]' as any,
      params: { bookingId: booking.id },
    });
  }, []);

  const handleCancelPress = useCallback((booking: BookingListItem) => {
    setCancelTarget(booking);
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleConfirmWaitlist = useCallback(
    (entry: WaitlistEntry) => {
      confirmSlot.mutate(entry.id);
    },
    [confirmSlot],
  );

  const handleLeaveWaitlist = useCallback(
    (entry: WaitlistEntry) => {
      leaveWaitlist.mutate(entry.id);
    },
    [leaveWaitlist],
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
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
        <Heading level={4}>Minhas Reservas</Heading>
      </XStack>

      {/* Tabs */}
      <XStack paddingHorizontal="$4" gap="$2" marginBottom="$2">
        {(['pending', 'approved', 'history'] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text
              size="sm"
              weight={activeTab === tab ? 'semibold' : 'regular'}
              style={{
                color: activeTab === tab ? '#3B82F6' : '#6B7280',
              }}
            >
              {TAB_LABELS[tab]}
            </Text>
          </Pressable>
        ))}
      </XStack>

      {/* Waitlist section (only on pending tab) */}
      {activeTab === 'pending' && waitlistEntries.length > 0 && (
        <YStack paddingHorizontal="$4" gap="$2" marginBottom="$3">
          <Text weight="semibold" size="sm" color="secondary">
            Fila de Espera ({waitlistEntries.length})
          </Text>
          {waitlistEntries.map((entry) => (
            <WaitlistCard
              key={entry.id}
              entry={entry}
              onConfirm={handleConfirmWaitlist}
              onLeave={handleLeaveWaitlist}
            />
          ))}
        </YStack>
      )}

      {/* Bookings list */}
      {isLoading ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      ) : isError ? (
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap="$3"
          padding="$4"
        >
          <Text size="2xl">⚠️</Text>
          <Text weight="semibold">Erro ao carregar reservas</Text>
          <Text color="secondary" size="sm" align="center">
            {error?.message || 'Tente novamente mais tarde'}
          </Text>
          <Pressable onPress={() => refetch()} style={styles.browseButton}>
            <Text size="sm" weight="semibold" style={{ color: '#3B82F6' }}>
              Tentar novamente
            </Text>
          </Pressable>
        </YStack>
      ) : bookings.length === 0 ? (
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap="$3"
          padding="$4"
        >
          <Text size="2xl">📅</Text>
          <Text weight="semibold">
            {activeTab === 'pending'
              ? 'Nenhuma reserva pendente'
              : activeTab === 'approved'
                ? 'Nenhuma reserva aprovada'
                : 'Nenhuma reserva no histórico'}
          </Text>
          <Text color="secondary" size="sm" align="center">
            {activeTab === 'history'
              ? 'Reservas concluídas ou canceladas aparecerão aqui'
              : 'Reserve um espaço para começar'}
          </Text>
          {activeTab === 'pending' && (
            <Pressable
              onPress={() => router.push('/spaces' as any)}
              style={styles.browseButton}
            >
              <Text size="sm" weight="semibold" style={{ color: '#3B82F6' }}>
                Ver Espaços
              </Text>
            </Pressable>
          )}
        </YStack>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              onPress={handleBookingPress}
              {...(item.canCancel && { onCancel: handleCancelPress })}
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          refreshing={isFetching && !isFetchingNextPage}
          onRefresh={() => refetch()}
          ListFooterComponent={
            isFetchingNextPage ? (
              <YStack padding="$3" alignItems="center">
                <Spinner />
              </YStack>
            ) : null
          }
        />
      )}

      {/* Cancel sheet */}
      <CancelBookingSheet
        visible={!!cancelTarget}
        booking={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCancelled={() => {
          setCancelTarget(null);
          refetch();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tabActive: {
    backgroundColor: '#EFF6FF',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  separator: {
    height: 12,
  },
  browseButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
});
