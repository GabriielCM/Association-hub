import { memo } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text, Avatar, Icon } from '@ahub/ui';
import { Tag, MapPin } from '@ahub/ui/src/icons';
import { CardGlassView } from './CardGlassView';
import type { PartnerListItem } from '@ahub/shared/types';

interface PartnerCardProps {
  partner: PartnerListItem;
  onPress: (partner: PartnerListItem) => void;
  distance?: string;
}

export const PartnerCard = memo(function PartnerCard({
  partner,
  onPress,
  distance,
}: PartnerCardProps) {
  const isLocked = !partner.isEligible;

  return (
    <Pressable
      onPress={() => onPress(partner)}
      style={({ pressed }) => [
        isLocked && styles.locked,
        pressed && styles.pressed,
      ]}
    >
      <CardGlassView borderRadius={16} tint="dark" intensity={10}>
        <View style={styles.content}>
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
                {partner.category.icon ? (
                  <Text style={{ fontSize: 12 }}>{partner.category.icon}</Text>
                ) : (
                  <Icon icon={Tag} size={12} color="secondary" />
                )}
                <Text color="secondary" size="xs">
                  {partner.category.name}
                </Text>
                {distance && (
                  <>
                    <Text color="secondary" size="xs"> · </Text>
                    <Icon icon={MapPin} size={12} color="#8B5CF6" />
                    <Text style={styles.distanceText}>{distance}</Text>
                  </>
                )}
                {!distance && partner.city && (
                  <Text color="secondary" size="xs">
                    · {partner.city}
                  </Text>
                )}
              </XStack>
            </YStack>
          </XStack>
        </View>
      </CardGlassView>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  locked: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
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
  distanceText: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '500',
  },
});
