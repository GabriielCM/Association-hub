import { Pressable } from 'react-native';
import { YStack, XStack } from 'tamagui';

import { Card, Text, Heading, Badge } from '@ahub/ui';
import { formatCurrency } from '@ahub/shared/utils';
import type { SubscriptionPlan } from '@ahub/shared/types';

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrent: boolean;
  onPress: () => void;
}

export function PlanCard({ plan, isCurrent, onPress }: PlanCardProps) {
  const mutators = plan.mutators;

  const benefits: string[] = [];
  if (mutators.points_events && mutators.points_events > 1)
    benefits.push(`${mutators.points_events}x pontos em eventos`);
  if (mutators.points_strava && mutators.points_strava > 1)
    benefits.push(`${mutators.points_strava}x pontos Strava`);
  if (mutators.points_posts && mutators.points_posts > 1)
    benefits.push(`${mutators.points_posts}x pontos em posts`);
  if (mutators.discount_store && mutators.discount_store > 0)
    benefits.push(`${mutators.discount_store}% desconto loja`);
  if (mutators.discount_pdv && mutators.discount_pdv > 0)
    benefits.push(`${mutators.discount_pdv}% desconto PDV`);
  if (mutators.discount_spaces && mutators.discount_spaces > 0)
    benefits.push(`${mutators.discount_spaces}% desconto espacos`);
  if (mutators.cashback && mutators.cashback > 0)
    benefits.push(`${mutators.cashback}% cashback`);

  return (
    <Pressable onPress={onPress}>
      <Card
        variant="elevated"
        size="lg"
        borderWidth={isCurrent ? 2 : 0}
        borderColor={plan.color ?? '$primary'}
      >
        <YStack gap="$2">
          {/* Color accent strip */}
          <XStack
            height={4}
            borderRadius="$full"
            backgroundColor={plan.color ?? '$primary'}
            marginBottom="$1"
          />

          <XStack alignItems="center" justifyContent="space-between">
            <Heading level={4}>{plan.name}</Heading>
            {isCurrent && (
              <Badge variant="success" size="sm">
                Seu plano
              </Badge>
            )}
          </XStack>

          <Text color="accent" size="xl" weight="bold">
            {formatCurrency(plan.priceMonthly)}/mes
          </Text>

          {plan.description && (
            <Text color="secondary" size="sm" numberOfLines={2}>
              {plan.description}
            </Text>
          )}

          {/* Benefits summary */}
          <YStack gap="$1" marginTop="$1">
            {benefits.slice(0, 3).map((benefit, i) => (
              <XStack key={i} gap="$1" alignItems="center">
                <Text color="success" size="sm">✓</Text>
                <Text size="sm">{benefit}</Text>
              </XStack>
            ))}
            {benefits.length > 3 && (
              <Text color="accent" size="xs">
                +{benefits.length - 3} beneficios
              </Text>
            )}
          </YStack>

          <Text color="accent" size="sm" weight="semibold" align="center" marginTop="$2">
            Ver detalhes
          </Text>
        </YStack>
      </Card>
    </Pressable>
  );
}
