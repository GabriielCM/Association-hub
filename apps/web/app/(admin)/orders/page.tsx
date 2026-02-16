'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3, QrCode } from 'lucide-react';

import { Button } from '@/components/ui';
import { useAdminOrders, useOrdersSummary } from '@/lib/hooks/useAdminOrders';
import { OrdersSummaryCards } from '@/components/admin/orders/OrdersSummaryCards';
import { OrdersTable } from '@/components/admin/orders/OrdersTable';
import { QrScannerDialog } from '@/components/admin/orders/QrScannerDialog';
import { useValidatePickup } from '@/lib/hooks/useAdminOrders';

export default function OrdersPage() {
  const [status, setStatus] = useState<string | undefined>();
  const [source, setSource] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [qrOpen, setQrOpen] = useState(false);

  const { data: summary } = useOrdersSummary();
  const { data: ordersData, isLoading } = useAdminOrders({
    status,
    source,
    search: search || undefined,
    page,
    limit: 15,
  });

  const validatePickup = useValidatePickup();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">Gerenciamento de pedidos da loja e PDV</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setQrOpen(true)}>
            <QrCode className="mr-2 h-4 w-4" />
            Scanner Retirada
          </Button>
          <Link href="/orders/reports">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Relatorios
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && <OrdersSummaryCards counters={summary} />}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Buscar por codigo ou cliente..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={status || ''}
          onChange={(e) => { setStatus(e.target.value || undefined); setPage(1); }}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="PENDING">Pendente</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="READY">Pronto</option>
          <option value="COMPLETED">Entregue</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
        <select
          value={source || ''}
          onChange={(e) => { setSource(e.target.value || undefined); setPage(1); }}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
        >
          <option value="">Todas as origens</option>
          <option value="STORE">Loja</option>
          <option value="PDV">PDV</option>
        </select>
      </div>

      {/* Orders Table */}
      <OrdersTable
        orders={ordersData?.data || []}
        isLoading={isLoading}
        onSelect={() => {}}
      />

      {/* Pagination */}
      {ordersData?.pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {ordersData.pagination.totalCount} pedidos encontrados
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <span className="flex items-center px-2 text-sm">
              {page} / {ordersData.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= ordersData.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Proximo
            </Button>
          </div>
        </div>
      )}

      {/* QR Scanner Dialog */}
      <QrScannerDialog
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        onValidate={(code) => validatePickup.mutate(code)}
        result={validatePickup.data ? {
          orderCode: validatePickup.data.code ?? validatePickup.data.orderNumber,
          status: validatePickup.data.status,
          itemsCount: validatePickup.data.items?.length ?? 0,
          canComplete: validatePickup.data.status === 'READY',
          valid: true,
        } : undefined}
      />
    </div>
  );
}
