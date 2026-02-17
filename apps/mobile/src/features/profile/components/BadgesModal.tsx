import { useState, useCallback } from 'react';
import { Modal, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading, Button, Icon } from '@ahub/ui';
import { Medal } from '@ahub/ui/src/icons';
import { BadgeCard } from './BadgeCard';
import type { UserBadge } from '@ahub/shared/types';

interface BadgesModalProps {
  visible: boolean;
  onClose: () => void;
  badges: UserBadge[];
  onSave: (selectedIds: string[]) => void;
  isSaving?: boolean;
}

const MAX_FEATURED = 3;

export function BadgesModal({
  visible,
  onClose,
  badges,
  onSave,
  isSaving,
}: BadgesModalProps) {
  const initialSelected = badges
    .filter((b) => b.isFeatured)
    .map((b) => b.id);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);

  const handleToggle = useCallback(
    (badge: UserBadge) => {
      setSelectedIds((prev) => {
        if (prev.includes(badge.id)) {
          return prev.filter((id) => id !== badge.id);
        }
        if (prev.length >= MAX_FEATURED) {
          return prev;
        }
        return [...prev, badge.id];
      });
    },
    []
  );

  const handleSave = () => {
    if (selectedIds.length > 0) {
      onSave(selectedIds);
    }
  };

  const renderBadge = ({ item }: { item: UserBadge }) => (
    <View style={styles.badgeWrapper}>
      <BadgeCard
        badge={item}
        isSelected={selectedIds.includes(item.id)}
        onPress={handleToggle}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <YStack flex={1} padding="$4" gap="$4">
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center">
            <Pressable onPress={onClose}>
              <Text color="primary" weight="medium">
                Cancelar
              </Text>
            </Pressable>
            <Heading level={5}>Meus Badges</Heading>
            <View style={{ width: 60 }} />
          </XStack>

          <Text color="secondary" size="sm" align="center">
            Selecione até {MAX_FEATURED} badges para exibir no perfil ({selectedIds.length}/{MAX_FEATURED})
          </Text>

          {/* Badges Grid */}
          <FlatList
            data={badges}
            renderItem={renderBadge}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <YStack alignItems="center" paddingVertical="$8">
                <Icon icon={Medal} size="lg" color="muted" weight="duotone" />
                <Text color="secondary" align="center" marginTop="$2">
                  Você ainda não conquistou nenhum badge.
                </Text>
              </YStack>
            }
          />

          {/* Save Button */}
          {badges.length > 0 && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleSave}
              loading={isSaving}
              disabled={selectedIds.length === 0}
            >
              Salvar seleção
            </Button>
          )}
        </YStack>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  grid: {
    gap: 8,
  },
  badgeWrapper: {
    flex: 1,
    maxWidth: '33.33%',
    padding: 4,
  },
});
