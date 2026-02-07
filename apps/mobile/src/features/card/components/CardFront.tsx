import { View, StyleSheet } from 'react-native';
import { YStack } from 'tamagui';
import { Text, Avatar } from '@ahub/ui';
import { QrCodeDisplay } from './QrCodeDisplay';
import type { MemberCard, CardQrCode } from '@ahub/shared/types';

interface CardFrontProps {
  card: MemberCard;
  qrCode?: CardQrCode | null;
  subscription?: { planName: string } | null;
}

export function CardFront({ card, qrCode, subscription }: CardFrontProps) {
  return (
    <View style={styles.container}>
      {/* Association Logo */}
      <View style={styles.logoContainer}>
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

      {/* User Photo */}
      <View style={styles.userSection}>
        <Avatar
          src={card.user.avatarUrl}
          name={card.user.name}
          size="xl"
        />
        <YStack alignItems="center" gap={4} marginTop={8}>
          <Text style={styles.userName} numberOfLines={1}>
            {card.user.name}
          </Text>
          <Text style={styles.cardNumber}>
            {card.cardNumber}
          </Text>
          {subscription && (
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>{subscription.planName}</Text>
            </View>
          )}
        </YStack>
      </View>

      {/* QR Code */}
      {qrCode && card.status === 'ACTIVE' ? (
        <View style={styles.qrContainer}>
          <QrCodeDisplay data={qrCode.qrCodeData} size={140} />
        </View>
      ) : (
        <View style={styles.inactiveOverlay}>
          <Text style={styles.inactiveText}>CARTEIRINHA INATIVA</Text>
          {card.statusReason && (
            <Text style={styles.reasonText}>{card.statusReason}</Text>
          )}
        </View>
      )}

      {/* Flip hint */}
      <Text style={styles.flipHint}>Toque para virar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
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
  userSection: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    maxWidth: 250,
    textAlign: 'center',
  },
  cardNumber: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
  },
  inactiveOverlay: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  inactiveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  reasonText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  planBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FCD34D',
    letterSpacing: 0.5,
  },
  flipHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
});
