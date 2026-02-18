import { useState, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View, ScrollView } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text, Avatar } from '@ahub/ui';
import { QrCode, MagnifyingGlass, X, Users } from '@ahub/ui/src/icons';
import * as Haptics from 'expo-haptics';
import { useRecentRecipients, useSearchUsers } from '../hooks/useRecipientSearch';
import { useWalletTheme } from '@/features/wallet/hooks/useWalletTheme';
import type { RecentRecipient, UserSearchResult } from '@ahub/shared/types';

interface RecipientPickerProps {
  onSelect: (recipient: RecentRecipient) => void;
  onScanQR?: () => void;
}

export function RecipientPicker({ onSelect, onScanQR }: RecipientPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: recentRecipients } = useRecentRecipients();
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchQuery);
  const t = useWalletTheme();

  const handleSelectRecent = useCallback(
    (recipient: RecentRecipient) => {
      Haptics.selectionAsync();
      onSelect(recipient);
    },
    [onSelect],
  );

  const handleSelectSearch = useCallback(
    (result: UserSearchResult) => {
      Haptics.selectionAsync();
      onSelect({
        userId: result.userId,
        name: result.name,
        avatar: result.avatar,
        lastTransferAt: new Date(),
      });
    },
    [onSelect],
  );

  return (
    <YStack gap={16} flex={1}>
      {/* QR Scan Button */}
      {onScanQR && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onScanQR();
          }}
          style={({ pressed }) => [
            styles.scanButton,
            { borderColor: t.accentBorder, backgroundColor: t.accentBg },
            pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
          ]}
        >
          <XStack alignItems="center" gap={10} justifyContent="center">
            <QrCode size={20} color={t.accent} />
            <Text style={[styles.scanText, { color: t.accent }]}>Escanear QR Code</Text>
          </XStack>
        </Pressable>
      )}

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: t.inputBg, borderColor: t.inputBorder }]}>
        <XStack alignItems="center" gap={10} flex={1}>
          <MagnifyingGlass size={18} color={t.textTertiary} />
          <View style={styles.searchInput}>
            <Pressable style={{ flex: 1 }}>
              <Text
                style={{
                  color: searchQuery ? t.textPrimary : t.inputPlaceholder,
                  fontSize: 15,
                }}
              >
                {searchQuery || 'Buscar por nome...'}
              </Text>
            </Pressable>
          </View>
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <X size={16} color={t.textTertiary} />
            </Pressable>
          )}
        </XStack>
      </View>

      {/* Recent Recipients - Horizontal Carousel */}
      {searchQuery.length < 2 && recentRecipients && recentRecipients.length > 0 && (
        <YStack gap={10}>
          <Text style={[styles.sectionLabel, { color: t.textTertiary }]}>Recentes</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
          >
            {recentRecipients.map((r) => (
              <Pressable
                key={r.userId}
                onPress={() => handleSelectRecent(r)}
                style={({ pressed }) => [
                  styles.carouselItem,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
                ]}
              >
                <Avatar src={r.avatar} name={r.name} size="md" />
                <Text style={[styles.carouselName, { color: t.textSecondary }]} numberOfLines={1}>
                  {r.name.split(' ')[0]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </YStack>
      )}

      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <YStack gap={8}>
          <Text style={[styles.sectionLabel, { color: t.textTertiary }]}>Resultados</Text>
          {isSearching ? (
            <Text style={[styles.emptyText, { color: t.textTertiary }]}>Buscando...</Text>
          ) : searchResults && searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.userId}
              renderItem={({ item }) => (
                <RecipientRow
                  name={item.name}
                  avatar={item.avatar}
                  textColor={t.textPrimary}
                  pressedBg={t.pressedBg}
                  onPress={() => handleSelectSearch(item)}
                />
              )}
              ItemSeparatorComponent={() => (
                <View style={[styles.separator, { backgroundColor: t.separatorColor }]} />
              )}
              style={{ maxHeight: 300 }}
            />
          ) : (
            <Text style={[styles.emptyText, { color: t.textTertiary }]}>Nenhum resultado</Text>
          )}
        </YStack>
      )}

      {/* Empty State */}
      {searchQuery.length < 2 && (!recentRecipients || recentRecipients.length === 0) && (
        <YStack
          alignItems="center"
          paddingVertical={40}
          gap={12}
          backgroundColor={t.inputBg}
          borderRadius={16}
          borderWidth={1}
          borderColor={t.inputBorder}
        >
          <Users size={36} color={t.textTertiary} weight="duotone" />
          <Text style={[styles.emptyText, { color: t.textTertiary }]}>
            Busque um membro para transferir pontos
          </Text>
        </YStack>
      )}
    </YStack>
  );
}

function RecipientRow({
  name,
  avatar,
  textColor,
  pressedBg,
  onPress,
}: {
  name: string;
  avatar?: string | undefined;
  textColor: string;
  pressedBg: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: pressedBg },
      ]}
    >
      <XStack alignItems="center" gap={12}>
        <Avatar src={avatar} name={name} size="sm" />
        <Text style={[styles.rowName, { color: textColor }]}>{name}</Text>
      </XStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  scanText: {
    fontSize: 15,
    fontWeight: '600',
  },
  searchContainer: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  carouselContent: {
    gap: 16,
    paddingRight: 8,
  },
  carouselItem: {
    alignItems: 'center',
    gap: 6,
    width: 64,
  },
  carouselName: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  row: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '500',
  },
  separator: {
    height: 1,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
