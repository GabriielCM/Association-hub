import { memo } from 'react';
import { View, StyleSheet, Pressable, Linking, useWindowDimensions } from 'react-native';
import { YStack } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Icon } from '@ahub/ui';
import { Phone, Globe, MapPin, PaperPlaneTilt, Calendar } from '@ahub/ui/src/icons';
import { cardGradients } from '@ahub/ui/src/themes/tokens';
import { CardPattern } from './CardPattern';
import { CardGlassView } from './CardGlassView';
import { useCardTheme } from '../hooks/useCardTheme';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import type { MemberCard } from '@ahub/shared/types';

interface CardBackProps {
  card: MemberCard;
}

export const CardBack = memo(function CardBack({ card }: CardBackProps) {
  const { association } = card;
  const { width } = useWindowDimensions();
  const cardWidth = width - 48;
  const { isDark } = useCardTheme();
  const gradient = isDark ? cardGradients.dark.back : cardGradients.light.back;

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const formattedExpiry = card.expiresAt
    ? new Date(card.expiresAt).toLocaleDateString('pt-BR', {
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  return (
    <LinearGradient
      colors={[gradient.start, gradient.end]}
      start={{ x: 1, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={styles.container}
    >
      {/* Geometric pattern overlay */}
      <CardPattern width={cardWidth} height={540} />

      <Text style={styles.title}>Como usar sua carteirinha</Text>

      {/* Instructions in glass cards */}
      <YStack gap={8} marginTop={12}>
        <InstructionItem
          number={1}
          text="Apresente o QR Code ao chegar em eventos ou estabelecimentos parceiros."
        />
        <InstructionItem
          number={2}
          text="O responsável irá escanear o código para registrar sua presença."
        />
        <InstructionItem
          number={3}
          text="Acompanhe seu histórico de uso na aba Histórico."
        />
      </YStack>

      {/* Contact Section — Each in glass card */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Contato da Associação</Text>

        {association.phone && (
          <ContactItem
            icon={Phone}
            text={association.phone}
            onPress={() => openUrl(`tel:${association.phone}`)}
          />
        )}
        {association.email && (
          <ContactItem
            icon={PaperPlaneTilt}
            text={association.email}
            onPress={() => openUrl(`mailto:${association.email}`)}
          />
        )}
        {association.website && (
          <ContactItem
            icon={Globe}
            text={association.website}
            onPress={() => openUrl(association.website!)}
          />
        )}
        {association.address && (
          <ContactItem
            icon={MapPin}
            text={association.address}
            onPress={() =>
              openUrl(
                `https://maps.google.com/?q=${encodeURIComponent(
                  association.address!,
                )}`,
              )
            }
          />
        )}
      </View>

      {/* Validity date */}
      {formattedExpiry && (
        <CardGlassView borderRadius={10}>
          <View style={styles.validityRow}>
            <Icon icon={Calendar} size="sm" color="rgba(255,255,255,0.7)" />
            <Text style={styles.validityLabel}>Validade</Text>
            <Text style={styles.validityValue}>{formattedExpiry}</Text>
          </View>
        </CardGlassView>
      )}

      {/* Flip hint — Glass */}
      <CardGlassView borderRadius={10} style={styles.hintGlass}>
        <Text style={styles.flipHint}>Toque ou deslize para virar</Text>
      </CardGlassView>
    </LinearGradient>
  );
});

function InstructionItem({ number, text }: { number: number; text: string }) {
  return (
    <CardGlassView borderRadius={10}>
      <View style={styles.instructionRow}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{number}</Text>
        </View>
        <Text style={styles.instructionText}>{text}</Text>
      </View>
    </CardGlassView>
  );
}

function ContactItem({
  icon,
  text,
  onPress,
}: {
  icon: PhosphorIcon;
  text: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <CardGlassView borderRadius={10}>
        <View style={styles.contactItem}>
          <Icon icon={icon} size="sm" color="#93C5FD" />
          <Text style={styles.contactText} numberOfLines={1}>
            {text}
          </Text>
        </View>
      </CardGlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  instructionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 10,
  },
  numberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(139, 92, 246, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  instructionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    flex: 1,
    lineHeight: 17,
  },
  contactSection: {
    marginTop: 16,
    gap: 6,
  },
  contactTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  contactText: {
    fontSize: 13,
    color: '#93C5FD',
    flex: 1,
  },
  validityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  validityLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  validityValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  hintGlass: {
    marginTop: 'auto',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  flipHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
});
