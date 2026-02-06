import { YStack, XStack } from 'tamagui';

import { Card, Text, Heading, Badge } from '@ahub/ui';
import { formatCurrency, formatDate } from '@ahub/shared/utils';
import type { UserSubscription } from '@ahub/shared/types';

interface SubscriptionStatusProps {
  subscription: UserSubscription;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'error' | 'warning' }> = {
  ACTIVE: { label: 'Ativo', variant: 'success' },
  CANCELLED: { label: 'Cancelado', variant: 'error' },
  SUSPENDED: { label: 'Suspenso', variant: 'warning' },
};

export function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  const statusConfig = STATUS_CONFIG[subscription.status] ?? {
    label: subscription.status,
    variant: 'info' as const,
  };

  return (
    <Card variant="elevated" size="lg">
      <YStack gap="$3">
        {/* Color accent */}
        <XStack
          height={4}
          borderRadius="$full"
          backgroundColor={subscription.plan.color ?? '$primary'}
        />

        <XStack alignItems="center" justifyContent="space-between">
          <Heading level={4}>{subscription.plan.name}</Heading>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </XStack>

        <Text color="accent" size="xl" weight="bold">
          {formatCurrency(subscription.plan.priceMonthly)}/mes
        </Text>

        <YStack gap="$1">
          <DetailRow label="Assinante desde" value={formatDate(subscription.subscribedAt)} />
          <DetailRow label="Periodo atual" value={`${formatDate(subscription.currentPeriodStart)} - ${formatDate(subscription.currentPeriodEnd)}`} />
          {subscription.cancelledAt && (
            <DetailRow label="Cancelado em" value={formatDate(subscription.cancelledAt)} />
          )}
          {subscription.suspendedAt && (
            <DetailRow label="Suspenso em" value={formatDate(subscription.suspendedAt)} />
          )}
        </YStack>
      </YStack>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <XStack justifyContent="space-between">
      <Text color="secondary" size="sm">{label}</Text>
      <Text size="sm" weight="medium">{value}</Text>
    </XStack>
  );
}
