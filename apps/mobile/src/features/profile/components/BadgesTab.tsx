import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Button, Spinner } from '@ahub/ui';
import { useUserBadges } from '@/features/profile/hooks/useProfile';
import { useUpdateBadgesDisplay } from '@/features/profile/hooks/useEditProfile';
import { BadgeCard } from './BadgeCard';
import { BadgesModal } from './BadgesModal';

interface BadgesTabProps {
  userId: string;
  isMe: boolean;
}

export function BadgesTab({ userId, isMe }: BadgesTabProps) {
  const { data: badgesData, isLoading } = useUserBadges(userId);
  const updateBadges = useUpdateBadgesDisplay();
  const [showModal, setShowModal] = useState(false);

  const badges = badgesData?.data || [];

  const handleSaveBadges = async (selectedIds: string[]) => {
    try {
      await updateBadges.mutateAsync(selectedIds);
      setShowModal(false);
      Alert.alert('Sucesso', 'Badges atualizados!');
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar os badges.');
    }
  };

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical="$6">
        <Spinner size="lg" />
      </YStack>
    );
  }

  if (badges.length === 0) {
    return (
      <YStack alignItems="center" paddingVertical="$8" gap="$3">
        <Text style={{ fontSize: 48 }}>🏆</Text>
        <Text weight="semibold" size="lg">
          Nenhum badge conquistado
        </Text>
        <Text color="secondary" size="sm" align="center" style={{ maxWidth: 260 }}>
          Participe de eventos e atividades para conquistar badges!
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$3" paddingVertical="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <Text color="secondary" size="sm">
          {badges.length} badge{badges.length !== 1 ? 's' : ''} · {badgesData?.featured || 0}/3 em destaque
        </Text>
        {isMe && (
          <Button variant="ghost" size="sm" onPress={() => setShowModal(true)}>
            Selecionar favoritos
          </Button>
        )}
      </XStack>

      <View style={styles.grid}>
        {badges.map((badge) => (
          <View key={badge.id} style={styles.badgeWrapper}>
            <BadgeCard badge={badge} isSelected={badge.isFeatured} />
          </View>
        ))}
      </View>

      <BadgesModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        badges={badges}
        onSave={handleSaveBadges}
        isSaving={updateBadges.isPending}
      />
    </YStack>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeWrapper: {
    width: '31%',
    minWidth: 100,
  },
});
