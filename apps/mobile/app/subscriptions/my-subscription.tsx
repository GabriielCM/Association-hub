import { Alert, ScrollView } from 'react-native';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { Text, Heading, Button, Card, Input, Spinner } from '@ahub/ui';
import { formatDate, formatCurrency } from '@ahub/shared/utils';
import { SubscriptionStatus } from '@/features/subscriptions/components/SubscriptionStatus';
import { BenefitsList } from '@/features/subscriptions/components/BenefitsList';
import { PlanCard } from '@/features/subscriptions/components/PlanCard';
import { useMySubscription } from '@/features/subscriptions/hooks/useMySubscription';
import { usePlans } from '@/features/subscriptions/hooks/usePlans';
import { useCancelSubscription, useChangePlan, useSubscribe } from '@/features/subscriptions/hooks/useSubscribe';

export default function MySubscriptionScreen() {
  const router = useRouter();
  const { data: subscription, isLoading } = useMySubscription();
  const { data: plansData, isLoading: plansLoading } = usePlans();
  const cancelMutation = useCancelSubscription();
  const changeMutation = useChangePlan();
  const subscribeMutation = useSubscribe();
  const [cancelReason, setCancelReason] = useState('');

  const otherPlans = (plansData?.plans ?? []).filter(
    (plan) => plan.id !== subscription?.plan?.id
  );

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

  const handleChangePlan = (planId: string, planName: string, planPrice: number) => {
    Alert.alert(
      'Trocar plano',
      `Deseja trocar para o plano ${planName} por ${formatCurrency(planPrice)}/mes? A troca sera imediata.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Trocar',
          onPress: () => {
            changeMutation.mutate(planId, {
              onSuccess: () => {
                Alert.alert('Sucesso!', 'Plano alterado com sucesso!');
              },
              onError: (error) => Alert.alert('Erro', error.message),
            });
          },
        },
      ]
    );
  };

  const handleResubscribe = (planId: string, planName: string, planPrice: number) => {
    Alert.alert(
      'Assinar novamente',
      `Deseja assinar o plano ${planName} por ${formatCurrency(planPrice)}/mes?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Assinar',
          onPress: () => {
            subscribeMutation.mutate(planId, {
              onSuccess: () => {
                Alert.alert('Sucesso!', 'Assinatura realizada com sucesso!');
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
            <YStack gap="$4">
              {/* Plan switching */}
              <YStack gap="$2">
                <Heading level={4}>Trocar plano</Heading>
                <Text color="secondary" size="sm">
                  Selecione um plano para trocar. A alteracao sera imediata.
                </Text>

                {plansLoading ? (
                  <Spinner />
                ) : otherPlans.length === 0 ? (
                  <Text color="secondary" size="sm">
                    Nenhum outro plano disponivel no momento.
                  </Text>
                ) : (
                  <YStack gap="$3">
                    {otherPlans.map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        isCurrent={false}
                        onPress={() =>
                          handleChangePlan(plan.id, plan.name, plan.priceMonthly)
                        }
                      />
                    ))}
                  </YStack>
                )}

                {changeMutation.isPending && (
                  <Text color="accent" size="sm" textAlign="center">
                    Trocando plano...
                  </Text>
                )}
              </YStack>

              {/* Cancel section */}
              <YStack gap="$1">
                <Input
                  placeholder="Motivo do cancelamento (opcional)"
                  value={cancelReason}
                  onChangeText={setCancelReason}
                />
                <Button
                  variant="danger"
                  onPress={handleCancel}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar assinatura'}
                </Button>
              </YStack>
            </YStack>
          )}

          {subscription.status === 'CANCELLED' && (
            <YStack gap="$2">
              <Heading level={4}>Assinar novamente</Heading>
              <Text color="secondary" size="sm">
                Sua assinatura foi cancelada. Selecione um plano para assinar novamente.
              </Text>

              {plansLoading ? (
                <Spinner />
              ) : (plansData?.plans ?? []).length === 0 ? (
                <Text color="secondary" size="sm">
                  Nenhum plano disponivel no momento.
                </Text>
              ) : (
                <YStack gap="$3">
                  {(plansData?.plans ?? []).map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      isCurrent={false}
                      onPress={() =>
                        handleResubscribe(plan.id, plan.name, plan.priceMonthly)
                      }
                    />
                  ))}
                </YStack>
              )}

              {subscribeMutation.isPending && (
                <Text color="accent" size="sm" textAlign="center">
                  Assinando...
                </Text>
              )}
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
