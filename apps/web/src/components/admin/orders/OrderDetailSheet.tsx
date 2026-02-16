'use client';

import { useState } from 'react';
import {
  Package,
  X,
  ArrowRightCircle,
  Ban,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Coins,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import type { OrderItem } from '@ahub/shared/types';

interface OrderDetailSheetProps {
  order: any;
  onClose: () => void;
  onUpdateStatus: (status: string, notes: string) => void;
  onCancel: (reason: string) => void;
  onComplete: () => void;
}

function formatCurrency(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2)}`;
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

const paymentMethodLabels: Record<string, string> = {
  POINTS: 'Pontos',
  MONEY: 'Dinheiro / PIX',
  MIXED: 'Misto',
};

const canAdvanceStatus = (status: string): boolean => {
  return ['PENDING', 'CONFIRMED', 'READY'].includes(status);
};

const canCancelOrder = (status: string): boolean => {
  return ['PENDING', 'CONFIRMED'].includes(status);
};

const nextStatusMap: Record<string, { status: string; label: string }> = {
  PENDING: { status: 'CONFIRMED', label: 'Confirmar Pedido' },
  CONFIRMED: { status: 'READY', label: 'Marcar como Pronto' },
  READY: { status: 'COMPLETED', label: 'Concluir Pedido' },
};

export function OrderDetailSheet({
  order,
  onClose,
  onUpdateStatus,
  onCancel,
  onComplete,
}: OrderDetailSheetProps) {
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (!order) return null;

  const handleAdvance = () => {
    const next = nextStatusMap[order.status];
    if (next) {
      if (next.status === 'COMPLETED') {
        onComplete();
      } else {
        onUpdateStatus(next.status, '');
      }
    }
  };

  const handleCancel = () => {
    if (!cancelReason.trim()) return;
    onCancel(cancelReason);
    setCancelReason('');
    setShowCancelForm(false);
  };

  const items: OrderItem[] = order.items ?? [];
  const nextAction = nextStatusMap[order.status];

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">
              Pedido {order.code}
            </h2>
            <p className="text-xs text-muted-foreground">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Fechar</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Status + Source */}
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <Badge variant="outline">{order.sourceName ?? order.source}</Badge>
        </div>

        {/* Timeline */}
        {order.timeline && order.timeline.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold">Historico</h3>
            <OrderStatusTimeline timeline={order.timeline} />
          </div>
        )}

        {/* Items */}
        <div>
          <h3 className="mb-3 text-sm font-semibold">
            Itens ({items.length})
          </h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Qtd: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {item.totalPoints > 0 && (
                    <p className="text-sm font-medium">
                      {item.totalPoints} pts
                    </p>
                  )}
                  {item.totalMoney > 0 && (
                    <p className="text-sm font-medium">
                      {formatCurrency(item.totalMoney)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div>
          <h3 className="mb-3 text-sm font-semibold">Pagamento</h3>
          <div className="space-y-2 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>Metodo</span>
              </div>
              <span className="text-sm font-medium">
                {paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}
              </span>
            </div>

            {order.pointsUsed != null && order.pointsUsed > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Coins className="h-4 w-4" />
                  <span>Pontos usados</span>
                </div>
                <span className="text-sm font-medium">
                  {order.pointsUsed} pts
                </span>
              </div>
            )}

            {order.moneyPaid != null && order.moneyPaid > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Valor pago
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(order.moneyPaid)}
                </span>
              </div>
            )}

            {order.cashbackEarned != null && order.cashbackEarned > 0 && (
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-sm text-green-600">Cashback</span>
                <span className="text-sm font-medium text-green-600">
                  +{order.cashbackEarned} pts
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pickup Location */}
        {order.pickupLocation && (
          <div className="flex items-start gap-2 rounded-lg border border-border p-3">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Local de Retirada</p>
              <p className="text-xs text-muted-foreground">
                {order.pickupLocation}
              </p>
              {order.pickupCode && (
                <p className="mt-1 font-mono text-xs font-medium">
                  Codigo: {order.pickupCode}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cancel form */}
        {showCancelForm && (
          <div className="space-y-3 rounded-lg border border-red-200 bg-red-50/50 p-4">
            <p className="text-sm font-medium text-red-700">
              Cancelar Pedido
            </p>
            <Textarea
              placeholder="Motivo do cancelamento..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCancelForm(false);
                  setCancelReason('');
                }}
              >
                Voltar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancel}
                disabled={!cancelReason.trim()}
              >
                Confirmar Cancelamento
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {(canAdvanceStatus(order.status) || canCancelOrder(order.status)) && (
        <div className="border-t border-border px-6 py-4">
          <div className="flex gap-2">
            {canCancelOrder(order.status) && !showCancelForm && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelForm(true)}
              >
                <Ban className="mr-1 h-4 w-4" />
                Cancelar
              </Button>
            )}
            {nextAction && !showCancelForm && (
              <Button className="flex-1" onClick={handleAdvance}>
                {order.status === 'READY' ? (
                  <CheckCircle className="mr-1 h-4 w-4" />
                ) : order.status === 'PENDING' ? (
                  <Clock className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowRightCircle className="mr-1 h-4 w-4" />
                )}
                {nextAction.label}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
