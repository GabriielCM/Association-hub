import { View, StyleSheet, Pressable } from 'react-native';
import { YStack } from 'tamagui';
import { Text, Avatar } from '@ahub/ui';
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

export function CardInactive({ card, onRegularize }: CardInactiveProps) {
  const statusLabel = STATUS_LABELS[card.status] || card.status;

  return (
    <View style={styles.container}>
      {/* Association */}
      <View style={styles.header}>
        {card.association.logoUrl ? (
          <Avatar src={card.association.logoUrl} name={card.association.name} size="md" />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>{card.association.name.charAt(0)}</Text>
          </View>
        )}
        <Text style={styles.associationName}>{card.association.name}</Text>
      </View>

      {/* Status Badge */}
      <YStack alignItems="center" gap={12}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>CARTEIRINHA {statusLabel}</Text>
        </View>

        {card.statusReason && (
          <Text style={styles.reasonText}>{card.statusReason}</Text>
        )}

        {/* User Info */}
        <YStack alignItems="center" gap={4} marginTop={8}>
          <Avatar src={card.user.avatarUrl} name={card.user.name} size="lg" />
          <Text style={styles.userName}>{card.user.name}</Text>
          <Text style={styles.cardNumber}>{card.cardNumber}</Text>
        </YStack>
      </YStack>

      {/* Regularize Button */}
      {onRegularize && (
        <Pressable
          onPress={onRegularize}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Regularizar</Text>
        </Pressable>
      )}

      {!onRegularize && <View />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4B5563',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    gap: 4,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  associationName: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  statusBadge: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  reasonText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    maxWidth: 280,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cardNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
});
