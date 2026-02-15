'use client';

import { Badge } from '@/components/ui';
import type { SpaceStatus } from '@/lib/api/spaces.api';

const statusConfig: Record<SpaceStatus, { label: string; variant: 'success' | 'warning' | 'ghost' }> = {
  ACTIVE: { label: 'Ativo', variant: 'success' },
  MAINTENANCE: { label: 'Manutenção', variant: 'warning' },
  INACTIVE: { label: 'Inativo', variant: 'ghost' },
};

export function SpaceStatusBadge({ status }: { status: SpaceStatus }) {
  const config = statusConfig[status] ?? statusConfig.INACTIVE;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
