import { ScrollView, Pressable, Linking, StyleSheet, View, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading, Button, Avatar, Spinner, Badge } from '@ahub/ui';
import { usePartnerDetails } from '@/features/card/hooks/useBenefits';

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
  const { partnerId } = useLocalSearchParams<{ partnerId: string }>();
  const { data: partner, isLoading } = usePartnerDetails(partnerId || '');
  const todayKey = getTodayKey();

  if (isLoading || !partner) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
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
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView>
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
              style={styles.backButtonOverlay}
            >
              <Text style={styles.backButtonText}>←</Text>
            </Pressable>
          </View>
        ) : (
          <YStack paddingHorizontal="$4" paddingTop="$3">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.back()}
              alignSelf="flex-start"
            >
              ← Voltar
            </Button>
          </YStack>
        )}

        <YStack
          padding="$4"
          gap="$5"
          marginTop={partner.bannerUrl ? -32 : 0}
        >
          {/* Partner Info Card */}
          <View style={[styles.card, partner.bannerUrl ? styles.cardElevated : undefined]}>
            <XStack gap="$3" alignItems="center">
              <View style={partner.bannerUrl ? styles.avatarBordered : undefined}>
                <Avatar src={partner.logoUrl} name={partner.name} size="xl" />
              </View>
              <YStack flex={1} gap={4}>
                <XStack alignItems="center" gap="$2" flexWrap="wrap">
                  <Heading level={4}>{partner.name}</Heading>
                  {partner.isNew && (
                    <Badge variant="primary" size="sm">NOVO</Badge>
                  )}
                </XStack>
                <XStack alignItems="center" gap="$1">
                  <Text style={{ fontSize: 14 }}>{partner.category.icon}</Text>
                  <Text color="secondary" size="sm">
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
            <View style={styles.lockedBanner}>
              <XStack alignItems="center" gap="$2">
                <Text style={{ fontSize: 20 }}>🔒</Text>
                <YStack flex={1}>
                  <Text style={styles.lockedTitle}>
                    Benefício exclusivo para assinantes
                  </Text>
                  <Text style={styles.lockedSubtitle}>
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
            <View style={[styles.benefitCard, { borderLeftColor: partner.category.color }]}>
              <Text weight="semibold" color="secondary" size="xs" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Benefício
              </Text>
              <Text weight="semibold" size="lg" marginTop={4}>
                {partner.benefit}
              </Text>
              {partner.instructions && (
                <>
                  <View style={styles.divider} />
                  <Text weight="semibold" color="secondary" size="xs" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Como utilizar
                  </Text>
                  <Text color="secondary" size="sm" marginTop={4}>
                    {partner.instructions}
                  </Text>
                </>
              )}
            </View>
          )}

          {/* Contact */}
          {hasContact && (
            <YStack gap="$3">
              <Text weight="semibold" size="lg">Contato</Text>
              <View style={styles.contactGrid}>
                {partner.contact.phone && (
                  <ContactCard
                    icon="📞"
                    label="Telefone"
                    value={partner.contact.phone}
                    onPress={() => openUrl(`tel:${partner.contact.phone}`)}
                  />
                )}
                {partner.contact.whatsapp && (
                  <ContactCard
                    icon="💬"
                    label="WhatsApp"
                    value={partner.contact.whatsapp}
                    onPress={() => openUrl(`https://wa.me/${partner.contact.whatsapp!.replace(/\D/g, '')}`)}
                  />
                )}
                {partner.contact.website && (
                  <ContactCard
                    icon="🌐"
                    label="Website"
                    value={partner.contact.website.replace(/^https?:\/\//, '')}
                    onPress={() => openUrl(partner.contact.website!)}
                  />
                )}
                {partner.contact.instagram && (
                  <ContactCard
                    icon="📸"
                    label="Instagram"
                    value={`@${partner.contact.instagram.replace('@', '')}`}
                    onPress={() => openUrl(`https://instagram.com/${partner.contact.instagram!.replace('@', '')}`)}
                  />
                )}
              </View>
            </YStack>
          )}

          {/* Address */}
          {hasAddress && (
            <YStack gap="$2">
              <Text weight="semibold" size="lg">Endereço</Text>
              <Pressable
                onPress={() => {
                  if (partner.address.lat && partner.address.lng) {
                    openUrl(`https://maps.google.com/?q=${partner.address.lat},${partner.address.lng}`);
                  }
                }}
                style={({ pressed }) => [styles.addressCard, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ fontSize: 20 }}>📍</Text>
                <YStack flex={1} gap={2}>
                  <Text size="sm">{partner.address.street}</Text>
                  <Text color="secondary" size="xs">
                    {[partner.address.city, partner.address.state].filter(Boolean).join(' - ')}
                    {partner.address.zipCode ? ` · ${partner.address.zipCode}` : ''}
                  </Text>
                  {partner.address.lat && partner.address.lng && (
                    <Text color="primary" size="xs" marginTop={2}>
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
              <Text weight="semibold" size="lg">Horário de Funcionamento</Text>
              <View style={styles.hoursCard}>
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
                      backgroundColor={isToday ? 'rgba(139, 92, 246, 0.08)' : 'transparent'}
                    >
                      <Text
                        size="sm"
                        weight={isToday ? 'semibold' : 'regular'}
                        color={isToday ? undefined : 'secondary'}
                      >
                        {DAY_NAMES[dayKey]}
                      </Text>
                      <Text
                        size="sm"
                        weight={isToday ? 'semibold' : 'regular'}
                        color={hours ? (isToday ? undefined : 'secondary') : 'secondary'}
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
}: {
  icon: string;
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.contactCard, pressed && { opacity: 0.7 }]}
    >
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text color="secondary" size="xs">{label}</Text>
      <Text size="sm" numberOfLines={1} weight="medium">{value}</Text>
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
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
  },
  cardElevated: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarBordered: {
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#fff',
  },
  lockedBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
  },
  lockedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  lockedSubtitle: {
    fontSize: 12,
    color: '#A16207',
    marginTop: 2,
  },
  benefitCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.04)',
    borderLeftWidth: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    marginVertical: 12,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  contactCard: {
    width: '47%',
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
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
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
  },
  hoursCard: {
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
    paddingVertical: 4,
    overflow: 'hidden',
  },
});
