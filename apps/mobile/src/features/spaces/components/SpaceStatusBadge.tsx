import { Badge } from '@ahub/ui';
import type { SpaceStatus } from '@ahub/shared/types';

const STATUS_CONFIG: Record<
  SpaceStatus,
  { label: string; variant: 'success' | 'warning' | 'error' }
> = {
  ACTIVE: { label: 'Ativo', variant: 'success' },
  MAINTENANCE: { label: 'Manutenção', variant: 'warning' },
  INACTIVE: { label: 'Inativo', variant: 'error' },
};

interface SpaceStatusBadgeProps {
  status: SpaceStatus;
}

export function SpaceStatusBadge({ status }: SpaceStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}
