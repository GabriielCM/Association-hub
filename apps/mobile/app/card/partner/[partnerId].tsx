import { ScrollView, Pressable, Linking, StyleSheet, View, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading, Button, Avatar, Spinner, Badge, ScreenHeader, Icon } from '@ahub/ui';
import { Lock, ChatCircle, Globe, Camera, MapPin, Phone } from '@ahub/ui/src/icons';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { usePartnerDetails } from '@/features/card/hooks/useBenefits';
import { useCardTheme } from '@/features/card/hooks/useCardTheme';

const DAY_NAMES: Record<string, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function getTodayKey(): string {
  const day = new Date().getDay(); // 0=sunday
  const idx = day === 0 ? 6 : day - 1;
  return DAY_ORDER[idx] ?? 'monday';
}

export default function PartnerDetailScreen() {
  const ct = useCardTheme();
  const { partnerId } = useLocalSearchParams<{ partnerId: string }>();
  const { data: partner, isLoading } = usePartnerDetails(partnerId || '');
  const todayKey = getTodayKey();

  if (isLoading || !partner) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: ct.screenBg }} edges={['top', 'bottom']}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="lg" />
        </YStack>
      </SafeAreaView>
    );
  }

  const openUrl = (url: string) => Linking.openURL(url).catch(() => {});
  const hasContact = partner.contact.phone || partner.contact.website || partner.contact.instagram || partner.contact.whatsapp;
  const hasAddress = partner.address.street;
  const hasHours = partner.businessHours && Object.keys(partner.businessHours).length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ct.screenBg }} edges={['top', 'bottom']}>
      <ScrollView style={{ backgroundColor: ct.screenBg }}>
        {/* Banner / Header */}
        {partner.bannerUrl ? (
          <View>
            <Image
              source={{ uri: partner.bannerUrl }}
              style={styles.banner}
              resizeMode="cover"
            />
            <Pressable
              onPress={() => router.back()}
              style={[styles.backButtonOverlay, { backgroundColor: ct.backButtonBg }]}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', color: ct.backButtonText }}>←</Text>
            </Pressable>
          </View>
        ) : (
          <ScreenHeader onBack={() => router.back()} />
        )}

        <YStack
          padding="$4"
          gap="$5"
          marginTop={partner.bannerUrl ? -32 : 0}
        >
          {/* Partner Info Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: ct.partnerCardBg },
              partner.bannerUrl && {
                backgroundColor: ct.partnerCardElevatedBg,
                ...ct.cardShadow,
              },
            ]}
          >
            <XStack gap="$3" alignItems="center">
              <View style={partner.bannerUrl ? [styles.avatarBordered, { borderColor: ct.avatarBorder }] : undefined}>
                <Avatar src={partner.logoUrl} name={partner.name} size="xl" />
              </View>
              <YStack flex={1} gap={4}>
                <XStack alignItems="center" gap="$2" flexWrap="wrap">
                  <Heading level={4} style={{ color: ct.textPrimary }}>{partner.name}</Heading>
                  {partner.isNew && (
                    <Badge variant="primary" size="sm">NOVO</Badge>
                  )}
                </XStack>
                <XStack alignItems="center" gap="$1">
                  <Text style={{ fontSize: 14 }}>{partner.category.icon}</Text>
                  <Text style={{ color: ct.textSecondary, fontSize: 13 }}>
                    {partner.category.name}
                  </Text>
                </XStack>
                {partner.isOpenNow !== undefined && (
                  <Badge variant={partner.isOpenNow ? 'success' : 'ghost'} size="sm">
                    {partner.isOpenNow ? 'Aberto agora' : 'Fechado'}
                  </Badge>
                )}
              </YStack>
            </XStack>
          </View>

          {/* Subscriber-only Banner */}
          {!partner.isEligible && (
            <View style={[styles.lockedBanner, { backgroundColor: ct.lockedBannerBg, borderColor: ct.lockedBannerBorder }]}>
              <XStack alignItems="center" gap="$2">
                <Icon icon={Lock} size="lg" color={ct.lockedTitleColor} />
                <YStack flex={1}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: ct.lockedTitleColor }}>
                    Benefício exclusivo para assinantes
                  </Text>
                  <Text style={{ fontSize: 12, color: ct.lockedSubtitleColor, marginTop: 2 }}>
                    Assine um plano para desbloquear este e outros benefícios exclusivos.
                  </Text>
                </YStack>
              </XStack>
              <Button
                size="sm"
                onPress={() => router.push('/subscriptions')}
                style={{ marginTop: 12 }}
              >
                Ver Planos
              </Button>
            </View>
          )}

          {/* Benefit Card */}
          {partner.isEligible && (
            <View style={[styles.benefitCard, { backgroundColor: ct.benefitCardBg, borderLeftColor: partner.category.color }]}>
              <Text weight="semibold" size="xs" style={{ textTransform: 'uppercase', letterSpacing: 1, color: ct.textSecondary }}>
                Benefício
              </Text>
              <Text weight="semibold" size="lg" style={{ color: ct.textPrimary, marginTop: 4 }}>
                {partner.benefit}
              </Text>
              {partner.instructions && (
                <>
                  <View style={[styles.divider, { backgroundColor: ct.dividerColor }]} />
                  <Text weight="semibold" size="xs" style={{ textTransform: 'uppercase', letterSpacing: 1, color: ct.textSecondary }}>
                    Como utilizar
                  </Text>
                  <Text size="sm" style={{ color: ct.textSecondary, marginTop: 4 }}>
                    {partner.instructions}
                  </Text>
                </>
              )}
            </View>
          )}

          {/* Contact */}
          {hasContact && (
            <YStack gap="$3">
              <Text weight="semibold" size="lg" style={{ color: ct.textPrimary }}>Contato</Text>
              <View style={styles.contactGrid}>
                {partner.contact.phone && (
                  <ContactCard
                    icon={Phone}
                    label="Telefone"
                    value={partner.contact.phone}
                    onPress={() => openUrl(`tel:${partner.contact.phone}`)}
                    ct={ct}
                  />
                )}
                {partner.contact.whatsapp && (
                  <ContactCard
                    icon={ChatCircle}
                    label="WhatsApp"
                    value={partner.contact.whatsapp}
                    onPress={() => openUrl(`https://wa.me/${partner.contact.whatsapp!.replace(/\D/g, '')}`)}
                    ct={ct}
                  />
                )}
                {partner.contact.website && (
                  <ContactCard
                    icon={Globe}
                    label="Website"
                    value={partner.contact.website.replace(/^https?:\/\//, '')}
                    onPress={() => openUrl(partner.contact.website!)}
                    ct={ct}
                  />
                )}
                {partner.contact.instagram && (
                  <ContactCard
                    icon={Camera}
                    label="Instagram"
                    value={`@${partner.contact.instagram.replace('@', '')}`}
                    onPress={() => openUrl(`https://instagram.com/${partner.contact.instagram!.replace('@', '')}`)}
                    ct={ct}
                  />
                )}
              </View>
            </YStack>
          )}

          {/* Address */}
          {hasAddress && (
            <YStack gap="$2">
              <Text weight="semibold" size="lg" style={{ color: ct.textPrimary }}>Endereço</Text>
              <Pressable
                onPress={() => {
                  if (partner.address.lat && partner.address.lng) {
                    openUrl(`https://maps.google.com/?q=${partner.address.lat},${partner.address.lng}`);
                  }
                }}
                style={({ pressed }) => [
                  styles.addressCard,
                  { backgroundColor: ct.addressCardBg },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Icon icon={MapPin} size="lg" color={ct.accent} />
                <YStack flex={1} gap={2}>
                  <Text size="sm" style={{ color: ct.textPrimary }}>{partner.address.street}</Text>
                  <Text size="xs" style={{ color: ct.textSecondary }}>
                    {[partner.address.city, partner.address.state].filter(Boolean).join(' - ')}
                    {partner.address.zipCode ? ` · ${partner.address.zipCode}` : ''}
                  </Text>
                  {partner.address.lat && partner.address.lng && (
                    <Text size="xs" style={{ color: ct.accent, marginTop: 2 }}>
                      Ver no mapa →
                    </Text>
                  )}
                </YStack>
              </Pressable>
            </YStack>
          )}

          {/* Business Hours */}
          {hasHours && (
            <YStack gap="$3">
              <Text weight="semibold" size="lg" style={{ color: ct.textPrimary }}>
                Horário de Funcionamento
              </Text>
              <View style={[styles.hoursCard, { backgroundColor: ct.hoursCardBg }]}>
                {DAY_ORDER.map((dayKey) => {
                  const hours = partner.businessHours?.[dayKey];
                  const isToday = dayKey === todayKey;
                  return (
                    <XStack
                      key={dayKey}
                      justifyContent="space-between"
                      alignItems="center"
                      paddingVertical={6}
                      paddingHorizontal={12}
                      borderRadius={6}
                      backgroundColor={isToday ? ct.todayHighlightBg : 'transparent'}
                    >
                      <Text
                        size="sm"
                        weight={isToday ? 'semibold' : 'regular'}
                        style={{ color: isToday ? ct.textPrimary : ct.textSecondary }}
                      >
                        {DAY_NAMES[dayKey]}
                      </Text>
                      <Text
                        size="sm"
                        weight={isToday ? 'semibold' : 'regular'}
                        style={{ color: hours ? (isToday ? ct.textPrimary : ct.textSecondary) : ct.textSecondary }}
                      >
                        {hours || 'Fechado'}
                      </Text>
                    </XStack>
                  );
                })}
              </View>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactCard({
  icon,
  label,
  value,
  onPress,
  ct,
}: {
  icon: PhosphorIcon;
  label: string;
  value: string;
  onPress: () => void;
  ct: ReturnType<typeof useCardTheme>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.contactCard,
        { backgroundColor: ct.contactCardBg },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Icon icon={icon} size="lg" color={ct.accent} />
      <Text size="xs" style={{ color: ct.textSecondary }}>{label}</Text>
      <Text size="sm" numberOfLines={1} weight="medium" style={{ color: ct.textPrimary }}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 180,
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    padding: 16,
    borderRadius: 16,
  },
  avatarBordered: {
    borderRadius: 28,
    borderWidth: 3,
  },
  lockedBanner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  benefitCard: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  contactCard: {
    width: '47%',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  addressCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
  },
  hoursCard: {
    borderRadius: 12,
    paddingVertical: 4,
    overflow: 'hidden',
  },
});
