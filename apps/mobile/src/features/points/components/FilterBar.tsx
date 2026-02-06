import { ScrollView } from 'react-native';
import { XStack } from 'tamagui';

import { Badge } from '@ahub/ui';
import type { TransactionType } from '@ahub/shared/types';

interface FilterOption<T> {
  label: string;
  value: T;
}

const PERIOD_OPTIONS: FilterOption<string>[] = [
  { label: 'Tudo', value: '' },
  { label: 'Hoje', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
];

const TYPE_OPTIONS: FilterOption<TransactionType | ''>[] = [
  { label: 'Todos', value: '' },
  { label: 'Recebidos', value: 'credit' },
  { label: 'Gastos', value: 'debit' },
];

interface FilterBarProps {
  selectedPeriod: string;
  selectedType: TransactionType | '';
  onPeriodChange: (period: string) => void;
  onTypeChange: (type: TransactionType | '') => void;
}

export function FilterBar({
  selectedPeriod,
  selectedType,
  onPeriodChange,
  onTypeChange,
}: FilterBarProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack gap="$1.5" paddingVertical="$1">
        {PERIOD_OPTIONS.map((opt) => (
          <Badge
            key={`period-${opt.value}`}
            variant={selectedPeriod === opt.value ? 'primary' : 'outline'}
            onPress={() => onPeriodChange(opt.value)}
            pressStyle={{ opacity: 0.7 }}
          >
            {opt.label}
          </Badge>
        ))}

        <XStack width={1} backgroundColor="$borderColor" marginHorizontal="$1" />

        {TYPE_OPTIONS.map((opt) => (
          <Badge
            key={`type-${opt.value}`}
            variant={selectedType === opt.value ? 'primary' : 'outline'}
            onPress={() => onTypeChange(opt.value)}
            pressStyle={{ opacity: 0.7 }}
          >
            {opt.label}
          </Badge>
        ))}
      </XStack>
    </ScrollView>
  );
}
