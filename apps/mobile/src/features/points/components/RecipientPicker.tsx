import { useState, useCallback } from 'react';
import { FlatList, Pressable } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { Text, Avatar, Input, Button, Card } from '@ahub/ui';
import { useRecentRecipients, useSearchUsers } from '../hooks/useRecipientSearch';
import type { RecentRecipient, UserSearchResult } from '@ahub/shared/types';

interface RecipientPickerProps {
  onSelect: (recipient: RecentRecipient) => void;
  onScanQR?: () => void;
}

export function RecipientPicker({ onSelect, onScanQR }: RecipientPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: recentRecipients } = useRecentRecipients();
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchQuery);

  const handleSelectRecent = useCallback(
    (recipient: RecentRecipient) => {
      onSelect(recipient);
    },
    [onSelect]
  );

  const handleSelectSearch = useCallback(
    (result: UserSearchResult) => {
      onSelect({
        userId: result.userId,
        name: result.name,
        avatar: result.avatar,
        lastTransferAt: new Date(),
      });
    },
    [onSelect]
  );

  return (
    <YStack gap="$3" flex={1}>
      {/* QR Scan */}
      {onScanQR && (
        <Button variant="outline" onPress={onScanQR}>
          Escanear QR Code
        </Button>
      )}

      {/* Search */}
      <Input
        placeholder="Buscar por nome..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <YStack gap="$1">
          <Text color="secondary" size="xs" weight="semibold">
            Resultados
          </Text>
          {isSearching ? (
            <Text color="secondary" size="sm">Buscando...</Text>
          ) : searchResults && searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.userId}
              renderItem={({ item }) => (
                <RecipientRow
                  name={item.name}
                  avatar={item.avatar}
                  onPress={() => handleSelectSearch(item)}
                />
              )}
              style={{ maxHeight: 200 }}
            />
          ) : (
            <Text color="secondary" size="sm">Nenhum resultado</Text>
          )}
        </YStack>
      )}

      {/* Recent Recipients */}
      {searchQuery.length < 2 && recentRecipients && recentRecipients.length > 0 && (
        <YStack gap="$1">
          <Text color="secondary" size="xs" weight="semibold">
            Recentes
          </Text>
          {recentRecipients.map((r) => (
            <RecipientRow
              key={r.userId}
              name={r.name}
              avatar={r.avatar}
              onPress={() => handleSelectRecent(r)}
            />
          ))}
        </YStack>
      )}

      {searchQuery.length < 2 &&
        (!recentRecipients || recentRecipients.length === 0) && (
          <Card variant="flat">
            <YStack alignItems="center" paddingVertical="$3">
              <Text color="secondary" size="sm">
                Busque um membro para transferir pontos
              </Text>
            </YStack>
          </Card>
        )}
    </YStack>
  );
}

function RecipientRow({
  name,
  avatar,
  onPress,
}: {
  name: string;
  avatar?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      <XStack
        alignItems="center"
        gap="$2"
        paddingVertical="$2"
        paddingHorizontal="$1"
        borderRadius="$md"
      >
        <Avatar src={avatar} name={name} size="sm" />
        <Text size="sm" weight="medium">{name}</Text>
      </XStack>
    </Pressable>
  );
}
