import { useState } from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { router } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';

import { Text, Button, Icon } from '@ahub/ui';
import { CreditCard, Sparkle, ClipboardText, ShareNetwork } from '@ahub/ui/src/icons';
import { useBrightness } from '@/hooks/useBrightness';
import { useCard, useCardQrCode } from '@/features/card/hooks/useCard';
import { useMySubscription } from '@/features/subscriptions/hooks/useMySubscription';
import { useCachedCard, useCachedQrCode } from '@/stores/card.store';
import { useShareCard } from '@/features/card/hooks/useShareCard';
import { FlipCard } from '@/features/card/components/FlipCard';
import { CardFront } from '@/features/card/components/CardFront';
import { CardBack } from '@/features/card/components/CardBack';
import { CardSkeleton } from '@/features/card/components/CardSkeleton';
import { CardShareable } from '@/features/card/components/CardShareable';
import { BrightnessIndicator } from '@/features/card/components/BrightnessIndicator';
import { QuickActionCard } from '@/features/card/components/QuickActionCard';

export default function CarteirinhaScreen() {
  const { data: card, isLoading, refetch } = useCard();
  const { data: qrCode } = useCardQrCode();
  const { data: subscription } = useMySubscription();
  const cachedCard = useCachedCard();
  const cachedQrCode = useCachedQrCode();
  const [refreshing, setRefreshing] = useState(false);
  const { viewShotRef, shareCard } = useShareCard();

  // Only enable gyroscope when this tab is focused (saves battery)
  const isFocused = useIsFocused();

  // Increase brightness when card is visible
  useBrightness();

  const displayCard = card || cachedCard;
  const displayQr = qrCode || cachedQrCode;
  const subscriptionData = subscription ? { planName: subscription.plan.name } : null;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Loading state — skeleton shimmer
  if (isLoading && !displayCard) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack padding="$4" paddingTop="$2">
          <CardSkeleton />
        </YStack>
      </SafeAreaView>
    );
  }

  // Error state
  if (!displayCard) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
          <Icon icon={CreditCard} weight="duotone" size="xl" color="muted" />
          <Text color="secondary" align="center">
            Não foi possível carregar sua carteirinha.
          </Text>
          <Button variant="outline" onPress={() => refetch()}>
            Tentar novamente
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <YStack paddingHorizontal="$4" paddingTop="$2" gap="$3">
          {/* Card with brightness indicator */}
          <View style={{ position: 'relative' }}>
            <FlipCard
              front={
                <CardFront
                  card={displayCard}
                  qrCode={displayQr}
                  subscription={subscriptionData}
                  gyroscopeEnabled={isFocused}
                />
              }
              back={<CardBack card={displayCard} />}
            />
            <BrightnessIndicator />
          </View>

          {/* Share button */}
          <Button
            variant="ghost"
            size="sm"
            onPress={shareCard}
            alignSelf="center"
          >
            <XStack alignItems="center" gap={6}>
              <Icon icon={ShareNetwork} size="sm" color="#8B5CF6" />
              <Text style={{ fontSize: 13, color: '#8B5CF6', fontWeight: '500' }}>
                Compartilhar
              </Text>
            </XStack>
          </Button>

          {/* Quick Action Cards */}
          <QuickActionCard
            title="Benefícios"
            icon={Sparkle}
            onPress={() => router.push('/card/benefits')}
          />

          <QuickActionCard
            title="Histórico"
            icon={ClipboardText}
            onPress={() => router.push('/card/history')}
          />

          {/* Hidden shareable card for ViewShot capture */}
          <View style={{ position: 'absolute', left: -9999 }}>
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
              <CardShareable
                card={displayCard}
                subscription={subscriptionData}
              />
            </ViewShot>
          </View>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
