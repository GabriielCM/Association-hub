'use client';

import { Badge } from '@/components/ui';
import type { ProductType } from '@ahub/shared/types';

const typeConfig: Record<ProductType, { label: string; variant: 'primary' | 'secondary' | 'info' }> = {
  PHYSICAL: { label: 'Fisico', variant: 'secondary' },
  VOUCHER: { label: 'Voucher', variant: 'info' },
  SERVICE: { label: 'Servico', variant: 'primary' },
};

export function ProductTypeLabel({ type }: { type: ProductType }) {
  const config = typeConfig[type] ?? { label: type, variant: 'secondary' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
