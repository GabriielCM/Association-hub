import { Pressable, View, StyleSheet } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text, Avatar } from '@ahub/ui';
import type { PartnerListItem } from '@ahub/shared/types';

interface PartnerCardProps {
  partner: PartnerListItem;
  onPress: (partner: PartnerListItem) => void;
}

export function PartnerCard({ partner, onPress }: PartnerCardProps) {
  const isLocked = !partner.isEligible;

  return (
    <Pressable
      onPress={() => onPress(partner)}
      style={({ pressed }) => [
        styles.container,
        isLocked && styles.locked,
        pressed && styles.pressed,
      ]}
    >
      <XStack gap="$3" alignItems="center">
        <Avatar
          src={partner.logoUrl}
          name={partner.name}
          size="lg"
        />
        <YStack flex={1} gap={2}>
          <XStack alignItems="center" gap="$1.5">
            <Text weight="medium" numberOfLines={1} style={{ flex: 1 }}>
              {partner.name}
            </Text>
            {partner.isNew && partner.isEligible && (
              <View style={styles.newBadge}>
                <Text style={styles.newText}>NOVO</Text>
              </View>
            )}
            {isLocked && (
              <View style={styles.subscriberBadge}>
                <Text style={styles.subscriberText}>ASSINANTES</Text>
              </View>
            )}
          </XStack>
          <Text color="secondary" size="sm" numberOfLines={2}>
            {partner.benefit}
          </Text>
          <XStack alignItems="center" gap="$1" marginTop={2}>
            <Text style={{ fontSize: 12 }}>
              {partner.category.icon || '🏷️'}
            </Text>
            <Text color="secondary" size="xs">
              {partner.category.name}
            </Text>
            {partner.city && (
              <Text color="secondary" size="xs">
                · {partner.city}
              </Text>
            )}
          </XStack>
        </YStack>
      </XStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.08)',
  },
  locked: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.5,
  },
  newBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subscriberBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subscriberText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
