import { Badge } from '@ahub/ui';
import type { ProductType } from '@ahub/shared/types';

interface ProductTypeBadgeProps {
  type: ProductType;
}

const typeConfig: Record<ProductType, { label: string; variant: string }> = {
  PHYSICAL: { label: 'Produto', variant: 'primary' },
  VOUCHER: { label: 'Voucher', variant: 'warning' },
  SERVICE: { label: 'Serviço', variant: 'info' },
};

export function ProductTypeBadge({ type }: ProductTypeBadgeProps) {
  const config = typeConfig[type] || typeConfig.PHYSICAL;
  return <Badge variant={config.variant as any}>{config.label}</Badge>;
}
