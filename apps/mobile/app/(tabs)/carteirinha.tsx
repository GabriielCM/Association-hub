import { ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, Heading, Button, Spinner } from '@ahub/ui';
import { useBrightness } from '@/hooks/useBrightness';
import { useCard, useCardQrCode } from '@/features/card/hooks/useCard';
import { useMySubscription } from '@/features/subscriptions/hooks/useMySubscription';
import { useCachedCard, useCachedQrCode } from '@/stores/card.store';
import { FlipCard } from '@/features/card/components/FlipCard';
import { CardFront } from '@/features/card/components/CardFront';
import { CardBack } from '@/features/card/components/CardBack';

export default function CarteirinhaScreen() {
  const { data: card, isLoading, refetch } = useCard();
  const { data: qrCode } = useCardQrCode();
  const { data: subscription } = useMySubscription();
  const cachedCard = useCachedCard();
  const cachedQrCode = useCachedQrCode();
  const [refreshing, setRefreshing] = useState(false);

  // Increase brightness when card is visible
  useBrightness();

  const displayCard = card || cachedCard;
  const displayQr = qrCode || cachedQrCode;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading && !displayCard) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="lg" />
          <Text color="secondary" marginTop="$2">
            Carregando carteirinha...
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  if (!displayCard) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
          <Text style={{ fontSize: 48 }}>💳</Text>
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
        <YStack padding="$4" gap="$4">
          <Heading level={3}>Carteirinha Digital</Heading>

          {/* Flip Card */}
          <FlipCard
            front={
              <CardFront
                card={displayCard}
                qrCode={displayQr}
                subscription={subscription ? { planName: subscription.plan.name } : null}
              />
            }
            back={<CardBack card={displayCard} />}
          />

          {/* Quick Actions */}
          <XStack gap="$2" justifyContent="center">
            <Button
              variant="outline"
              size="md"
              flex={1}
              onPress={() => router.push('/card/benefits')}
            >
              Benefícios
            </Button>
            <Button
              variant="outline"
              size="md"
              flex={1}
              onPress={() => router.push('/card/history')}
            >
              Histórico
            </Button>
          </XStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
