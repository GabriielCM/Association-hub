'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui';
import { useAdminOrder, useUpdateOrderStatus, useCancelOrder, useCompleteOrder } from '@/lib/hooks/useAdminOrders';
import { OrderStatusBadge } from '@/components/admin/orders/OrderStatusBadge';
import { OrderStatusTimeline } from '@/components/admin/orders/OrderStatusTimeline';
import { UpdateStatusDialog } from '@/components/admin/orders/UpdateStatusDialog';

export default function OrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { orderId } = params;
  const { data: order, isLoading } = useAdminOrder(orderId);
  const updateStatus = useUpdateOrderStatus();
  const cancelOrder = useCancelOrder();
  const completeOrder = useCompleteOrder();

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!order) {
    return <div className="text-muted-foreground">Pedido nao encontrado</div>;
  }

  const handleUpdateStatus = (status: string, notes: string) => {
    updateStatus.mutate(
      { id: orderId, data: { status, notes } },
      { onSuccess: () => setStatusDialogOpen(false) },
    );
  };

  const handleCancel = () => {
    if (confirm('Tem certeza que deseja cancelar este pedido?')) {
      cancelOrder.mutate({
        id: orderId,
        data: { reason: 'Cancelado pelo administrador', refundPoints: true, refundMoney: true },
      });
    }
  };

  const handleComplete = () => {
    completeOrder.mutate(orderId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Pedido #{order.code}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Criado em {new Date(order.createdAt).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="flex gap-2">
          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
            <Button onClick={() => setStatusDialogOpen(true)}>
              Atualizar Status
            </Button>
          )}
          {order.status === 'READY' && (
            <Button variant="secondary" onClick={handleComplete}>
              Confirmar Retirada
            </Button>
          )}
          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
            <Button variant="danger" onClick={handleCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold">Itens do Pedido</h2>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    {item.productImage && (
                      <img src={item.productImage} alt={item.productName} className="h-10 w-10 rounded object-cover" />
                    )}
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-xs text-muted-foreground">{item.variantName}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {item.totalPoints > 0 && <p>{item.totalPoints.toLocaleString('pt-BR')} pts</p>}
                    {Number(item.totalMoney) > 0 && (
                      <p className="text-muted-foreground">R$ {Number(item.totalMoney).toFixed(2)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold">Pagamento</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metodo</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Origem</span>
                <span className="font-medium">{order.source}</span>
              </div>
              {(order.pointsUsed ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pontos usados</span>
                  <span className="font-medium">{order.pointsUsed?.toLocaleString('pt-BR')} pts</span>
                </div>
              )}
              {Number(order.moneyPaid) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor pago</span>
                  <span className="font-medium">R$ {Number(order.moneyPaid).toFixed(2)}</span>
                </div>
              )}
              {order.cashbackEarned > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cashback</span>
                  <span className="font-medium text-emerald-600">{order.cashbackEarned} pts</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold">Historico</h2>
            <OrderStatusTimeline timeline={order.statusHistory || order.timeline || []} />
          </div>

          {order.pickupLocation && (
            <div className="mt-4 rounded-lg border border-border bg-surface p-6">
              <h2 className="mb-2 text-lg font-semibold">Retirada</h2>
              <p className="text-sm text-muted-foreground">{order.pickupLocation}</p>
              {order.pickupCode && (
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Codigo: {order.code}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Update Status Dialog */}
      <UpdateStatusDialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        currentStatus={order.status}
        onConfirm={handleUpdateStatus}
      />
    </div>
  );
}
