import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { YStack } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Avatar, Icon } from '@ahub/ui';
import { Crown, SealCheck } from '@ahub/ui/src/icons';
import { cardGradients } from '@ahub/ui/src/themes/tokens';
import { CardPattern } from './CardPattern';
import { CardGlassView } from './CardGlassView';
import { useCardTheme } from '../hooks/useCardTheme';
import type { MemberCard } from '@ahub/shared/types';

interface CardShareableProps {
  card: MemberCard;
  subscription?: { planName: string } | null;
}

/**
 * Version of the card without QR code, safe for sharing.
 * Shows a "Membro Ativo" badge instead of the QR code area.
 */
export function CardShareable({ card, subscription }: CardShareableProps) {
  const { width } = useWindowDimensions();
  const cardWidth = width - 48;
  const { isDark } = useCardTheme();
  const gradient = isDark ? cardGradients.dark.front : cardGradients.light.front;

  return (
    <View style={[styles.wrapper, { width: cardWidth }]}>
      <LinearGradient
        colors={[gradient.start, gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <CardPattern width={cardWidth} height={480} />

        {/* Association */}
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

        {/* User */}
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
            <Text style={styles.cardNumber}>{card.cardNumber}</Text>
            {subscription && (
              <CardGlassView borderRadius={20}>
                <View style={styles.planBadge}>
                  <Icon icon={Crown} size="sm" color="#FCD34D" weight="fill" />
                  <Text style={styles.planText}>{subscription.planName}</Text>
                </View>
              </CardGlassView>
            )}
          </YStack>
        </View>

        {/* Active member badge instead of QR */}
        <CardGlassView borderRadius={16}>
          <View style={styles.activeBadge}>
            <Icon icon={SealCheck} size="lg" color="#86EFAC" weight="fill" />
            <Text style={styles.activeText}>Membro Ativo</Text>
          </View>
        </CardGlassView>

        <Text style={styles.watermark}>A-hub</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 480,
    borderRadius: 16,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
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
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  planText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FCD34D',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  activeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#86EFAC',
  },
  watermark: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
  },
});
