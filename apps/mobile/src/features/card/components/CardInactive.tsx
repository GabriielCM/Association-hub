import { memo } from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { YStack } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Avatar } from '@ahub/ui';
import { cardGradients } from '@ahub/ui/src/themes/tokens';
import { CardPattern } from './CardPattern';
import { useCardTheme } from '../hooks/useCardTheme';
import type { MemberCard } from '@ahub/shared/types';

interface CardInactiveProps {
  card: MemberCard;
  onRegularize?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  INACTIVE: 'INATIVA',
  SUSPENDED: 'SUSPENSA',
  BLOCKED: 'BLOQUEADA',
};

/**
 * Inactive card: renders the normal gradient card dimmed with a
 * rotated red "INATIVO" stamp overlay at -15 degrees.
 */
export const CardInactive = memo(function CardInactive({
  card,
  onRegularize,
}: CardInactiveProps) {
  const { width } = useWindowDimensions();
  const cardWidth = width - 48;
  const { isDark } = useCardTheme();
  const gradient = isDark ? cardGradients.dark.front : cardGradients.light.front;
  const statusLabel = STATUS_LABELS[card.status] || card.status;

  return (
    <View style={styles.wrapper}>
      {/* Dimmed card with gradient */}
      <LinearGradient
        colors={[gradient.start, gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, { opacity: 0.45 }]}
      >
        <CardPattern width={cardWidth} height={480} />

        {/* Association */}
        <View style={styles.header}>
          {card.association.logoUrl ? (
            <Avatar
              src={card.association.logoUrl}
              name={card.association.name}
              size="lg"
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>
                {card.association.name.charAt(0)}
              </Text>
            </View>
          )}
          <Text style={styles.associationName}>{card.association.name}</Text>
        </View>

        {/* User Info */}
        <YStack alignItems="center" gap={4}>
          <Avatar
            src={card.user.avatarUrl}
            name={card.user.name}
            size="xl"
          />
          <Text style={styles.userName}>{card.user.name}</Text>
          <Text style={styles.cardNumber}>{card.cardNumber}</Text>
        </YStack>

        <View />
      </LinearGradient>

      {/* Stamp overlay */}
      <View style={styles.stampOverlay} pointerEvents="box-none">
        <View style={styles.stamp}>
          <Text style={styles.stampText}>
            CARTEIRINHA {statusLabel}
          </Text>
        </View>

        {card.statusReason && (
          <Text style={styles.reasonText}>{card.statusReason}</Text>
        )}
      </View>

      {/* Regularize button at bottom */}
      {onRegularize && (
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={onRegularize}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: isDark ? '#1A0A2E' : '#fff' },
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Regularizar</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    gap: 4,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  associationName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  cardNumber: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  stampOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  stamp: {
    borderWidth: 3,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    transform: [{ rotate: '-15deg' }],
  },
  stampText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  reasonText: {
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
    maxWidth: 280,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 9999,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
});
