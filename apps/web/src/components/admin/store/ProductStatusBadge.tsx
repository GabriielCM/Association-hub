'use client';

import { Badge } from '@/components/ui';

interface ProductStatusBadgeProps {
  isActive: boolean;
  stockType?: 'limited' | 'unlimited';
  stockCount?: number;
}

export function ProductStatusBadge({
  isActive,
  stockType,
  stockCount,
}: ProductStatusBadgeProps) {
  if (!isActive) {
    return <Badge variant="ghost">Inativo</Badge>;
  }

  if (stockType === 'limited' && stockCount !== undefined && stockCount <= 0) {
    return <Badge variant="error">Sem estoque</Badge>;
  }

  return <Badge variant="success">Ativo</Badge>;
}
