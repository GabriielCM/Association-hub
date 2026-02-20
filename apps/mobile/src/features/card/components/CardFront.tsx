import { memo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Avatar, Icon } from '@ahub/ui';
import { Crown } from '@ahub/ui/src/icons';
import { cardGradients } from '@ahub/ui/src/themes/tokens';
import { QrCodeGlow } from './QrCodeGlow';
import { CardPattern } from './CardPattern';
import { CardShine } from './CardShine';
import { CardGlassView } from './CardGlassView';
import { useGyroscope } from '../hooks/useGyroscope';
import { useCardTheme } from '../hooks/useCardTheme';
import type { MemberCard, CardQrCode } from '@ahub/shared/types';

interface CardFrontProps {
  card: MemberCard;
  qrCode?: CardQrCode | null;
  subscription?: { planName: string } | null;
  gyroscopeEnabled?: boolean;
}

export const CardFront = memo(function CardFront({
  card,
  qrCode,
  subscription,
  gyroscopeEnabled = true,
}: CardFrontProps) {
  const { width } = useWindowDimensions();
  const cardWidth = width - 48;
  const { isDark } = useCardTheme();
  const gradient = isDark ? cardGradients.dark.front : cardGradients.light.front;
  const { rotateX, rotateY } = useGyroscope(gyroscopeEnabled);

  return (
    <LinearGradient
      colors={[gradient.start, gradient.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Geometric pattern overlay */}
      <CardPattern width={cardWidth} height={540} />

      {/* Gyroscope-driven light reflection */}
      <CardShine
        rotateX={rotateX}
        rotateY={rotateY}
        width={cardWidth}
        height={540}
      />

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

      {/* User Photo + Info */}
      <View style={styles.userSection}>
        <Avatar
          src={card.user.avatarUrl}
          name={card.user.name}
          size="xl"
        />
        <YStack alignItems="center" gap={8} marginTop={8}>
          <Text style={styles.userName} numberOfLines={1}>
            {card.user.name}
          </Text>
          <Text style={styles.cardNumber}>
            {card.cardNumber}
          </Text>

          {/* Plan Badge — Glass with Crown icon */}
          {subscription && (
            <CardGlassView borderRadius={20} style={styles.planBadgeGlass}>
              <XStack
                alignItems="center"
                gap={6}
                paddingHorizontal={14}
                paddingVertical={6}
              >
                <Icon icon={Crown} size="sm" color="#FCD34D" weight="fill" />
                <Text style={styles.planBadgeText}>
                  {subscription.planName}
                </Text>
              </XStack>
            </CardGlassView>
          )}
        </YStack>
      </View>

      {/* QR Code with glow pulse */}
      {qrCode && card.status === 'ACTIVE' ? (
        <QrCodeGlow
          data={JSON.stringify({
            data: qrCode.qrCodeData,
            hash: qrCode.qrCodeHash,
          })}
          size={120}
        />
      ) : card.status !== 'ACTIVE' ? (
        <View style={styles.inactiveOverlay}>
          <Text style={styles.inactiveText}>CARTEIRINHA INATIVA</Text>
          {card.statusReason && (
            <Text style={styles.reasonText}>{card.statusReason}</Text>
          )}
        </View>
      ) : null}

      {/* Flip hint — Glass */}
      <CardGlassView borderRadius={10} style={styles.hintGlass}>
        <Text style={styles.flipHint}>Toque ou deslize para virar</Text>
      </CardGlassView>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
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
  planBadgeGlass: {
    marginTop: 8,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FCD34D',
    letterSpacing: 0.5,
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
  hintGlass: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 4,
  },
  flipHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});
