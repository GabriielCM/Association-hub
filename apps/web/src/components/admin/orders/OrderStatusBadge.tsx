'use client';

import { Badge } from '@/components/ui';
import type { OrderStatus } from '@ahub/shared/types';

interface OrderStatusBadgeProps {
  status: string;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'ghost' }
> = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  CONFIRMED: { label: 'Confirmado', variant: 'info' },
  READY: { label: 'Pronto', variant: 'success' },
  COMPLETED: { label: 'Concluido', variant: 'primary' },
  CANCELLED: { label: 'Cancelado', variant: 'error' },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status as OrderStatus] ?? {
    label: status,
    variant: 'outline' as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
