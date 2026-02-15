'use client';

import { Badge } from '@/components/ui';
import type { PdvStatus } from '@/lib/api/pdv.api';

const statusConfig: Record<
  PdvStatus,
  { label: string; variant: 'success' | 'ghost' | 'warning' }
> = {
  ACTIVE: { label: 'Ativo', variant: 'success' },
  INACTIVE: { label: 'Inativo', variant: 'ghost' },
  MAINTENANCE: { label: 'Manutencao', variant: 'warning' },
};

export function PdvStatusBadge({ status }: { status: PdvStatus }) {
  const config = statusConfig[status] ?? {
    label: status,
    variant: 'ghost' as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
