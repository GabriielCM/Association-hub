'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { BookingsTable } from '@/components/admin/bookings/BookingsTable';
import { RejectBookingDialog } from '@/components/admin/bookings/RejectBookingDialog';
import {
  useAdminBookings,
  useApproveBooking,
  useRejectBooking,
  useAdminCancelBooking,
} from '@/lib/hooks/useAdminBookings';
import { useAdminSpaces } from '@/lib/hooks/useAdminSpaces';
import type { BookingStatus } from '@/lib/api/bookings.api';

export default function AllBookingsPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [spaceFilter, setSpaceFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading } = useAdminBookings({
    page,
    limit: 20,
    ...(statusFilter && { status: statusFilter }),
    ...(spaceFilter && { spaceId: spaceFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  });

  const { data: spaces } = useAdminSpaces();
  const approveBooking = useApproveBooking();
  const rejectBooking = useRejectBooking();
  const cancelBooking = useAdminCancelBooking();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'reject' | 'cancel'>('reject');
  const [targetId, setTargetId] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    approveBooking.mutate(id, {
      onSuccess: () => toast({ title: 'Reserva aprovada!' }),
      onError: (err) => {
        toast({ title: 'Erro', description: err.message, variant: 'error' });
      },
    });
  };

  const handleRejectClick = (id: string) => {
    setTargetId(id);
    setDialogMode('reject');
    setDialogOpen(true);
  };

  const handleCancelClick = (id: string) => {
    setTargetId(id);
    setDialogMode('cancel');
    setDialogOpen(true);
  };

  const handleDialogConfirm = (reason: string) => {
    if (!targetId) return;
    const mutation = dialogMode === 'reject' ? rejectBooking : cancelBooking;
    mutation.mutate(
      { id: targetId, ...(reason && { reason }) },
      {
        onSuccess: () => {
          toast({
            title: dialogMode === 'reject' ? 'Reserva rejeitada!' : 'Reserva cancelada!',
          });
          setDialogOpen(false);
          setTargetId(null);
        },
        onError: (err) => {
          toast({ title: 'Erro', description: err.message, variant: 'error' });
        },
      },
    );
  };

  const bookings = data?.data ?? [];
  const meta = data?.meta;
  const isMutating =
    approveBooking.isPending || rejectBooking.isPending || cancelBooking.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/bookings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Todas as Reservas</h1>
          <p className="text-sm text-muted-foreground">
            Histórico completo de reservas de espaços
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as BookingStatus | '');
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="PENDING">Pendente</option>
          <option value="APPROVED">Aprovada</option>
          <option value="REJECTED">Rejeitada</option>
          <option value="CANCELLED">Cancelada</option>
          <option value="EXPIRED">Expirada</option>
          <option value="COMPLETED">Concluída</option>
        </select>

        <select
          value={spaceFilter}
          onChange={(e) => {
            setSpaceFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos os espaços</option>
          {(spaces ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          />
          <span className="text-sm text-muted-foreground">até</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12">
          <p className="mb-2 text-lg font-semibold">Nenhuma reserva encontrada</p>
          <p className="text-sm text-muted-foreground">
            Ajuste os filtros para ver resultados.
          </p>
        </div>
      ) : (
        <>
          <BookingsTable
            bookings={bookings}
            onApprove={handleApprove}
            onReject={handleRejectClick}
            onCancel={handleCancelClick}
            isPending={isMutating}
          />

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {bookings.length} de {meta.totalCount} reservas
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
                  {page} / {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <RejectBookingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleDialogConfirm}
        isPending={rejectBooking.isPending || cancelBooking.isPending}
        title={dialogMode === 'reject' ? 'Rejeitar Reserva' : 'Cancelar Reserva'}
        description={
          dialogMode === 'reject'
            ? 'Informe o motivo da rejeição.'
            : 'Informe o motivo do cancelamento.'
        }
        confirmLabel={dialogMode === 'reject' ? 'Rejeitar' : 'Cancelar Reserva'}
      />
    </div>
  );
}
