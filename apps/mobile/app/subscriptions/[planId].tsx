import { Alert, ScrollView } from 'react-native';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Text, Heading, Button, Card, Spinner } from '@ahub/ui';
import { formatCurrency } from '@ahub/shared/utils';
import { BenefitsList } from '@/features/subscriptions/components/BenefitsList';
import { usePlanDetails } from '@/features/subscriptions/hooks/usePlans';
import { useMySubscription } from '@/features/subscriptions/hooks/useMySubscription';
import { useSubscribe, useChangePlan } from '@/features/subscriptions/hooks/useSubscribe';

export default function PlanDetailScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { data: plan, isLoading } = usePlanDetails(planId);
  const { data: mySubscription } = useMySubscription();
  const subscribeMutation = useSubscribe();
  const changeMutation = useChangePlan();

  const hasActiveSubscription = mySubscription?.status === 'ACTIVE';
  const isCurrent = hasActiveSubscription && mySubscription?.plan?.id === planId;

  const handleSubscribe = () => {
    Alert.alert(
      'Confirmar assinatura',
      `Deseja assinar o plano ${plan?.name} por ${formatCurrency(plan?.priceMonthly ?? 0)}/mes?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Assinar',
          onPress: () => {
            subscribeMutation.mutate(planId, {
              onSuccess: () => {
                Alert.alert('Sucesso!', 'Assinatura realizada com sucesso!', [
                  { text: 'OK', onPress: () => router.back() },
                ]);
              },
              onError: (error) => Alert.alert('Erro', error.message),
            });
          },
        },
      ]
    );
  };

  const handleChangePlan = () => {
    Alert.alert(
      'Trocar plano',
      `Deseja trocar para o plano ${plan?.name}? A troca sera imediata.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Trocar',
          onPress: () => {
            changeMutation.mutate(planId, {
              onSuccess: () => {
                Alert.alert('Sucesso!', 'Plano alterado com sucesso!', [
                  { text: 'OK', onPress: () => router.back() },
                ]);
              },
              onError: (error) => Alert.alert('Erro', error.message),
            });
          },
        },
      ]
    );
  };

  if (isLoading || !plan) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner />
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView>
        <YStack padding="$4" gap="$4">
          {/* Color accent */}
          <YStack
            height={6}
            borderRadius="$full"
            backgroundColor={plan.color ?? '$primary'}
          />

          <Heading level={2}>{plan.name}</Heading>

          <Heading level={3} color="accent">
            {formatCurrency(plan.priceMonthly)}/mes
          </Heading>

          {plan.description && (
            <Text color="secondary">{plan.description}</Text>
          )}

          {/* Benefits */}
          <BenefitsList mutators={plan.mutators} />

          {/* CTA */}
          <YStack gap="$2" marginTop="$2">
            {isCurrent ? (
              <Card variant="flat">
                <YStack alignItems="center" paddingVertical="$2">
                  <Text color="success" weight="semibold">
                    Voce ja possui este plano
                  </Text>
                </YStack>
              </Card>
            ) : hasActiveSubscription ? (
              <Button
                onPress={handleChangePlan}
                disabled={changeMutation.isPending}
              >
                {changeMutation.isPending ? 'Trocando...' : 'Trocar para este plano'}
              </Button>
            ) : (
              <Button
                onPress={handleSubscribe}
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? 'Assinando...' : 'Assinar agora'}
              </Button>
            )}

            <Button variant="outline" onPress={() => router.back()}>
              Voltar
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
