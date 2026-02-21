import { Modal, ScrollView, Pressable, Linking, StyleSheet, View } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Heading, Button, Avatar, Spinner, Badge, Icon } from '@ahub/ui';
import { Globe, ChatCircle, Camera } from '@ahub/ui/src/icons';

import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { usePartnerDetails } from '../hooks/useBenefits';
import { Phone } from 'phosphor-react-native';
interface PartnerDetailSheetProps {
  partnerId: string | null;
  visible: boolean;
  onClose: () => void;
}

export function PartnerDetailSheet({ partnerId, visible, onClose }: PartnerDetailSheetProps) {
  const { data: partner, isLoading } = usePartnerDetails(partnerId || '');

  const openUrl = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Handle Bar */}
        <View style={styles.handleBar} />

        <Button variant="ghost" size="sm" onPress={onClose} alignSelf="flex-end">
          Fechar
        </Button>

        {isLoading || !partner ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Spinner size="lg" />
          </YStack>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack padding="$4" gap="$4">
              {/* Partner Info */}
              <XStack gap="$3" alignItems="center">
                <Avatar src={partner.logoUrl} name={partner.name} size="xl" />
                <YStack flex={1} gap={4}>
                  <XStack alignItems="center" gap="$2">
                    <Heading level={4}>{partner.name}</Heading>
                    {partner.isNew && <Badge variant="primary">NOVO</Badge>}
                  </XStack>
                  <XStack alignItems="center" gap="$1">
                    <Text style={{ fontSize: 14 }}>{partner.category.icon}</Text>
                    <Text color="secondary" size="sm">{partner.category.name}</Text>
                  </XStack>
                  {partner.isOpenNow !== undefined && (
                    <Badge variant={partner.isOpenNow ? 'success' : 'ghost'}>
                      {partner.isOpenNow ? 'Aberto agora' : 'Fechado'}
                    </Badge>
                  )}
                </YStack>
              </XStack>

              {/* Benefit */}
              <YStack gap="$2" padding="$4" borderRadius={12} backgroundColor="$backgroundSecondary">
                <Text weight="semibold">Benefício</Text>
                <Text>{partner.benefit}</Text>
                {partner.instructions && (
                  <>
                    <Text weight="semibold" marginTop="$2">Como usar</Text>
                    <Text color="secondary" size="sm">{partner.instructions}</Text>
                  </>
                )}
              </YStack>

              {/* Contact */}
              <YStack gap="$2">
                <Text weight="semibold" size="lg">Contato</Text>
                {partner.contact.phone && (
                  <ContactRow
                    icon={Phone}
                    text={partner.contact.phone}
                    onPress={() => openUrl(`tel:${partner.contact.phone}`)}
                  />
                )}
                {partner.contact.website && (
                  <ContactRow
                    icon={Globe}
                    text={partner.contact.website}
                    onPress={() => openUrl(partner.contact.website!)}
                  />
                )}
                {partner.contact.instagram && (
                  <ContactRow
                    icon={Camera}
                    text={`@${partner.contact.instagram}`}
                    onPress={() => openUrl(`https://instagram.com/${partner.contact.instagram}`)}
                  />
                )}
                {partner.contact.whatsapp && (
                  <ContactRow
                    icon={ChatCircle}
                    text={partner.contact.whatsapp}
                    onPress={() => openUrl(`https://wa.me/${partner.contact.whatsapp}`)}
                  />
                )}
              </YStack>

              {/* Address */}
              {partner.address.street && (
                <YStack gap="$2">
                  <Text weight="semibold" size="lg">Endereço</Text>
                  <Pressable
                    onPress={() =>
                      openUrl(`https://maps.google.com/?q=${partner.address.lat},${partner.address.lng}`)
                    }
                  >
                    <Text color="secondary">
                      {partner.address.street}
                      {partner.address.city ? `, ${partner.address.city}` : ''}
                      {partner.address.state ? ` - ${partner.address.state}` : ''}
                    </Text>
                    <Text color="primary" size="sm" marginTop={4}>Ver no mapa →</Text>
                  </Pressable>
                </YStack>
              )}

              {/* Business Hours */}
              {partner.businessHours && Object.keys(partner.businessHours).length > 0 && (
                <YStack gap="$2">
                  <Text weight="semibold" size="lg">Horário de Funcionamento</Text>
                  {Object.entries(partner.businessHours).map(([day, hours]) => (
                    <XStack key={day} justifyContent="space-between">
                      <Text color="secondary" size="sm" style={{ textTransform: 'capitalize' }}>
                        {day}
                      </Text>
                      <Text size="sm">{hours}</Text>
                    </XStack>
                  ))}
                </YStack>
              )}
            </YStack>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

function ContactRow({ icon, text, onPress }: { icon: PhosphorIcon; text: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.6 }}>
      <XStack gap="$2" alignItems="center" paddingVertical="$1">
        <Icon icon={icon} size="sm" color="primary" />
        <Text color="primary" size="sm">{text}</Text>
      </XStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 8,
  },
});
