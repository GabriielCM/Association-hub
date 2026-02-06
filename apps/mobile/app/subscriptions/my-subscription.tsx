import { Alert, ScrollView } from 'react-native';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { Text, Heading, Button, Card, Input, Spinner } from '@ahub/ui';
import { formatDate } from '@ahub/shared/utils';
import { SubscriptionStatus } from '@/features/subscriptions/components/SubscriptionStatus';
import { BenefitsList } from '@/features/subscriptions/components/BenefitsList';
import { useMySubscription } from '@/features/subscriptions/hooks/useMySubscription';
import { useCancelSubscription } from '@/features/subscriptions/hooks/useSubscribe';

export default function MySubscriptionScreen() {
  const router = useRouter();
  const { data: subscription, isLoading } = useMySubscription();
  const cancelMutation = useCancelSubscription();
  const [cancelReason, setCancelReason] = useState('');

  const handleCancel = () => {
    if (!subscription) return;

    Alert.alert(
      'Cancelar assinatura',
      `Seus beneficios permanecerão ativos ate ${formatDate(subscription.currentPeriodEnd)}. Tem certeza?`,
      [
        { text: 'Manter', style: 'cancel' },
        {
          text: 'Cancelar assinatura',
          style: 'destructive',
          onPress: () => {
            cancelMutation.mutate(cancelReason || undefined, {
              onSuccess: () => {
                Alert.alert(
                  'Assinatura cancelada',
                  `Beneficios ativos ate ${formatDate(subscription.currentPeriodEnd)}`,
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              },
              onError: (error) => Alert.alert('Erro', error.message),
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner />
        </YStack>
      </SafeAreaView>
    );
  }

  if (!subscription) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} padding="$4" gap="$4">
          <Heading level={3}>Minha Assinatura</Heading>
          <Card variant="flat">
            <YStack alignItems="center" paddingVertical="$4" gap="$2">
              <Text color="secondary">Voce nao possui uma assinatura ativa</Text>
              <Button
                variant="outline"
                onPress={() => router.push('/subscriptions')}
              >
                Ver planos disponiveis
              </Button>
            </YStack>
          </Card>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView>
        <YStack padding="$4" gap="$4">
          <Heading level={3}>Minha Assinatura</Heading>

          <SubscriptionStatus subscription={subscription} />

          <BenefitsList mutators={subscription.plan.mutators} />

          {/* Actions */}
          {subscription.status === 'ACTIVE' && (
            <YStack gap="$2">
              <Button
                variant="outline"
                onPress={() => router.push('/subscriptions')}
              >
                Trocar plano
              </Button>

              <YStack gap="$1">
                <Input
                  placeholder="Motivo do cancelamento (opcional)"
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  maxLength={500}
                />
                <Button
                  variant="outline"
                  onPress={handleCancel}
                  disabled={cancelMutation.isPending}
                  color="$error"
                >
                  {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar assinatura'}
                </Button>
              </YStack>
            </YStack>
          )}

          <Button variant="outline" onPress={() => router.back()}>
            Voltar
          </Button>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
