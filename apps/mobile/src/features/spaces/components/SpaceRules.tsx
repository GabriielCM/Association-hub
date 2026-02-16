import { YStack, XStack, View } from 'tamagui';
import { Text, GlassCard } from '@ahub/ui';
import type { SpaceDetail } from '@ahub/shared/types';

interface SpaceRulesProps {
  space: SpaceDetail;
}

export function SpaceRules({ space }: SpaceRulesProps) {
  const rules: Array<{ label: string; value: string }> = [];

  rules.push({
    label: 'Capacidade',
    value: `${space.capacity} pessoas`,
  });

  if (space.fee != null && space.fee > 0) {
    rules.push({
      label: 'Taxa',
      value: `R$ ${(space.fee / 100).toFixed(2)}`,
    });
  } else {
    rules.push({ label: 'Taxa', value: 'Gratuito' });
  }

  rules.push({
    label: 'Antecedência mínima',
    value: `${space.minAdvanceDays} dia(s)`,
  });

  rules.push({
    label: 'Antecedência máxima',
    value: `${space.maxAdvanceDays} dia(s)`,
  });

  if (space.bookingIntervalMonths != null && space.bookingIntervalMonths > 0) {
    rules.push({
      label: 'Intervalo entre reservas',
      value: `${space.bookingIntervalMonths} mês(es)`,
    });
  }

  if (space.periodType === 'SHIFT' && space.shifts) {
    rules.push({
      label: 'Turnos',
      value: space.shifts.map((s) => `${s.name} (${s.startTime}-${s.endTime})`).join(', '),
    });
  }

  if (space.periodType === 'HOUR') {
    if (space.openingTime && space.closingTime) {
      rules.push({
        label: 'Horário',
        value: `${space.openingTime} - ${space.closingTime}`,
      });
    }
    if (space.minDuration != null && space.minDuration > 0) {
      rules.push({
        label: 'Duração mínima',
        value: `${space.minDuration}h`,
      });
    }
  }

  return (
    <YStack gap="$2">
      <Text weight="semibold" size="lg">
        Regras de Reserva
      </Text>
      <GlassCard intensity="subtle" borderRadius={12} padding={12}>
        <YStack gap="$2">
          {rules.map((rule, index) => (
            <YStack key={rule.label} gap="$2">
              <XStack justifyContent="space-between">
                <Text size="sm" color="secondary">
                  {rule.label}
                </Text>
                <Text size="sm" weight="medium">
                  {rule.value}
                </Text>
              </XStack>
              {index < rules.length - 1 && (
                <View height={1} backgroundColor="rgba(0,0,0,0.06)" />
              )}
            </YStack>
          ))}
        </YStack>
      </GlassCard>
    </YStack>
  );
}
