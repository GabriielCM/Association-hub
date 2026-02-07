import { View, StyleSheet, Pressable, Linking } from 'react-native';
import { YStack } from 'tamagui';
import { Text } from '@ahub/ui';
import type { MemberCard } from '@ahub/shared/types';

interface CardBackProps {
  card: MemberCard;
}

export function CardBack({ card }: CardBackProps) {
  const { association } = card;

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Como usar sua carteirinha</Text>

      <YStack gap={12} marginTop={16}>
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

      {/* Association Contact */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Contato da Associação</Text>

        {association.phone && (
          <ContactItem
            icon="📞"
            text={association.phone}
            onPress={() => openUrl(`tel:${association.phone}`)}
          />
        )}
        {association.email && (
          <ContactItem
            icon="📧"
            text={association.email}
            onPress={() => openUrl(`mailto:${association.email}`)}
          />
        )}
        {association.website && (
          <ContactItem
            icon="🌐"
            text={association.website}
            onPress={() => openUrl(association.website!)}
          />
        )}
        {association.address && (
          <ContactItem
            icon="📍"
            text={association.address}
            onPress={() =>
              openUrl(
                `https://maps.google.com/?q=${encodeURIComponent(
                  association.address!
                )}`
              )
            }
          />
        )}
      </View>

      <Text style={styles.flipHint}>Toque para virar</Text>
    </View>
  );
}

function InstructionItem({
  number,
  text,
}: {
  number: number;
  text: string;
}) {
  return (
    <View style={styles.instructionRow}>
      <View style={styles.numberBadge}>
        <Text style={styles.numberText}>{number}</Text>
      </View>
      <Text style={styles.instructionText}>{text}</Text>
    </View>
  );
}

function ContactItem({
  icon,
  text,
  onPress,
}: {
  icon: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.contactItem,
        pressed && styles.contactPressed,
      ]}
    >
      <Text style={styles.contactIcon}>{icon}</Text>
      <Text style={styles.contactText} numberOfLines={1}>
        {text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  instructionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  instructionText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    flex: 1,
    lineHeight: 18,
  },
  contactSection: {
    marginTop: 24,
    gap: 8,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  contactPressed: {
    opacity: 0.6,
  },
  contactIcon: {
    fontSize: 16,
  },
  contactText: {
    fontSize: 13,
    color: '#93C5FD',
    flex: 1,
  },
  flipHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: 'auto',
  },
});
