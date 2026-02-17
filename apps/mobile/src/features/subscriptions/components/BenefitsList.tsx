import { YStack, XStack } from 'tamagui';

import { Text, Card, Icon } from '@ahub/ui';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { SUBSCRIPTION_BENEFIT_ICONS } from '@ahub/ui/src/icons';
import type { PlanMutators } from '@ahub/shared/types';

interface BenefitsListProps {
  mutators: PlanMutators;
}

interface BenefitItem {
  icon: PhosphorIcon;
  label: string;
  value: string;
  category: string;
}

function getMutatorBenefits(mutators: PlanMutators): BenefitItem[] {
  const items: BenefitItem[] = [];

  if (mutators.points_events && mutators.points_events !== 1) {
    items.push({
      icon: SUBSCRIPTION_BENEFIT_ICONS.points_events,
      label: 'Pontos em eventos',
      value: `${mutators.points_events}x multiplicador`,
      category: 'Pontos',
    });
  }
  if (mutators.points_strava && mutators.points_strava !== 1) {
    items.push({
      icon: SUBSCRIPTION_BENEFIT_ICONS.points_strava,
      label: 'Pontos Strava',
      value: `${mutators.points_strava}x multiplicador`,
      category: 'Pontos',
    });
  }
  if (mutators.points_posts && mutators.points_posts !== 1) {
    items.push({
      icon: SUBSCRIPTION_BENEFIT_ICONS.points_posts,
      label: 'Pontos em posts',
      value: `${mutators.points_posts}x multiplicador`,
      category: 'Pontos',
    });
  }
  if (mutators.discount_store && mutators.discount_store > 0) {
    items.push({
      icon: SUBSCRIPTION_BENEFIT_ICONS.discount_store,
      label: 'Desconto na loja',
      value: `${mutators.discount_store}%`,
      category: 'Descontos',
    });
  }
  if (mutators.discount_pdv && mutators.discount_pdv > 0) {
    items.push({
      icon: SUBSCRIPTION_BENEFIT_ICONS.discount_pdv,
      label: 'Desconto no PDV',
      value: `${mutators.discount_pdv}%`,
      category: 'Descontos',
    });
  }
  if (mutators.discount_spaces && mutators.discount_spaces > 0) {
    items.push({
      icon: SUBSCRIPTION_BENEFIT_ICONS.discount_spaces,
      label: 'Desconto em espacos',
      value: `${mutators.discount_spaces}%`,
      category: 'Descontos',
    });
  }
  if (mutators.cashback && mutators.cashback > 0) {
    items.push({
      icon: SUBSCRIPTION_BENEFIT_ICONS.cashback,
      label: 'Cashback',
      value: `${mutators.cashback}%`,
      category: 'Cashback',
    });
  }

  // Verified badge
  items.push({
    icon: SUBSCRIPTION_BENEFIT_ICONS.verified,
    label: 'Selo verificado',
    value: 'Badge dourado no perfil',
    category: 'Exclusivo',
  });

  return items;
}

export function BenefitsList({ mutators }: BenefitsListProps) {
  const benefits = getMutatorBenefits(mutators);

  return (
    <YStack gap="$2">
      <Text weight="semibold" size="lg">
        Beneficios
      </Text>
      {benefits.map((benefit, i) => (
        <Card key={i} variant="flat" size="sm">
          <XStack alignItems="center" gap="$2">
            <Icon icon={benefit.icon} size="lg" color="primary" />
            <YStack flex={1}>
              <Text size="sm" weight="medium">
                {benefit.label}
              </Text>
              <Text color="secondary" size="xs">
                {benefit.category}
              </Text>
            </YStack>
            <Text color="accent" size="sm" weight="bold">
              {benefit.value}
            </Text>
          </XStack>
        </Card>
      ))}
    </YStack>
  );
}
