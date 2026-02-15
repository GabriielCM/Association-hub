import { Badge } from '@ahub/ui';
import type { BookingPeriodType } from '@ahub/shared/types';

const PERIOD_CONFIG: Record<
  BookingPeriodType,
  { label: string; variant: 'info' | 'primary' | 'warning' }
> = {
  DAY: { label: 'Diária', variant: 'info' },
  SHIFT: { label: 'Turnos', variant: 'primary' },
  HOUR: { label: 'Horário', variant: 'warning' },
};

interface SpacePeriodBadgeProps {
  periodType: BookingPeriodType;
}

export function SpacePeriodBadge({ periodType }: SpacePeriodBadgeProps) {
  const config = PERIOD_CONFIG[periodType];
  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}
