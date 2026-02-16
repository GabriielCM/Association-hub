'use client';

import { Skeleton } from '@/components/ui';
import { Badge } from '@/components/ui';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { OrderSource } from '@ahub/shared/types';

interface OrdersTableProps {
  orders: any[];
  onSelect: (order: any) => void;
  isLoading?: boolean;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2)}`;
}

const sourceConfig: Record<OrderSource, { label: string; variant: 'info' | 'ghost' }> = {
  STORE: { label: 'Loja', variant: 'info' },
  PDV: { label: 'PDV', variant: 'ghost' },
};

function getItemsPreview(order: any): string {
  if (order.itemsPreview && order.itemsPreview.length > 0) {
    const names = order.itemsPreview.map((i: { name: string }) => i.name);
    if (names.length <= 2) return names.join(', ');
    return `${names[0]}, ${names[1]} +${names.length - 2}`;
  }
  if (order.items && order.items.length > 0) {
    const names = order.items.map((i: { productName: string }) => i.productName);
    if (names.length <= 2) return names.join(', ');
    return `${names[0]}, ${names[1]} +${names.length - 2}`;
  }
  return '-';
}

function getOrderValue(order: any): string {
  const parts: string[] = [];
  if (order.pointsUsed && order.pointsUsed > 0) {
    parts.push(`${order.pointsUsed} pts`);
  }
  if (order.moneyPaid && order.moneyPaid > 0) {
    parts.push(formatCurrency(order.moneyPaid));
  }
  if (parts.length === 0) {
    if (order.subtotalPoints > 0) parts.push(`${order.subtotalPoints} pts`);
    if (order.subtotalMoney > 0) parts.push(formatCurrency(order.subtotalMoney));
  }
  return parts.join(' + ') || '-';
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b">
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-20" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-32" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-5 w-12" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-5 w-20" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-28" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-24" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function OrdersTable({ orders, onSelect, isLoading }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Codigo</th>
            <th className="px-4 py-3 text-left font-medium">Cliente</th>
            <th className="px-4 py-3 text-left font-medium">Origem</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Data</th>
            <th className="px-4 py-3 text-right font-medium">Valor</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <LoadingSkeleton />
          ) : orders.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                Nenhum pedido encontrado
              </td>
            </tr>
          ) : (
            orders.map((order) => {
              const source = sourceConfig[order.source as OrderSource];
              return (
                <tr
                  key={order.id}
                  className="cursor-pointer border-b hover:bg-muted/30"
                  onClick={() => onSelect(order)}
                >
                  <td className="px-4 py-3 font-mono text-xs font-medium">
                    {order.code}
                  </td>
                  <td className="px-4 py-3">
                    <span className="line-clamp-1">{getItemsPreview(order)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {source ? (
                      <Badge variant={source.variant}>{source.label}</Badge>
                    ) : (
                      <Badge variant="outline">{order.source}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {getOrderValue(order)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
