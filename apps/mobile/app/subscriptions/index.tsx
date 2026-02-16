import { ScrollView } from 'react-native';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Text, Heading, Button, Card, Spinner } from '@ahub/ui';
import { PlanCard } from '@/features/subscriptions/components/PlanCard';
import { usePlans } from '@/features/subscriptions/hooks/usePlans';
import { useMySubscription } from '@/features/subscriptions/hooks/useMySubscription';

export default function PlansScreen() {
  const router = useRouter();
  const { data: plansData, isLoading } = usePlans();
  const { data: mySubscription } = useMySubscription();

  const plans = plansData?.plans ?? [];
  const currentPlanId = plansData?.currentSubscription?.planId ?? mySubscription?.plan?.id;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView>
        <YStack padding="$4" gap="$4">
          <Heading level={3}>Planos</Heading>

          <Text color="secondary">
            Escolha o plano ideal para voce e aproveite beneficios exclusivos.
          </Text>

          {/* Current subscription link */}
          {mySubscription && (
            <Button
              variant="outline"
              onPress={() => router.push('/subscriptions/my-subscription')}
            >
              Ver minha assinatura
            </Button>
          )}

          {/* Plans */}
          {isLoading ? (
            <Spinner />
          ) : plans.length === 0 ? (
            <Card variant="flat">
              <YStack alignItems="center" paddingVertical="$4">
                <Text color="secondary">Nenhum plano disponivel</Text>
              </YStack>
            </Card>
          ) : (
            <YStack gap="$3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={plan.id === currentPlanId}
                  onPress={() => router.push(`/subscriptions/${plan.id}`)}
                />
              ))}
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
