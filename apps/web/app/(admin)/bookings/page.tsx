'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, ArrowRight } from 'lucide-react';
import { Button, Badge, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { PendingBookingsCard } from '@/components/admin/bookings/PendingBookingsCard';
import { RejectBookingDialog } from '@/components/admin/bookings/RejectBookingDialog';
import {
  usePendingBookings,
  useApproveBooking,
  useRejectBooking,
} from '@/lib/hooks/useAdminBookings';

export default function BookingsPage() {
  const { toast } = useToast();
  const { data: pendingBookings, isLoading } = usePendingBookings();
  const approveBooking = useApproveBooking();
  const rejectBooking = useRejectBooking();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    approveBooking.mutate(id, {
      onSuccess: () => toast({ title: 'Reserva aprovada!' }),
      onError: (err) => {
        toast({ title: 'Erro', description: err.message, variant: 'error' });
      },
    });
  };

  const handleRejectClick = (id: string) => {
    setRejectingId(id);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectingId) return;
    rejectBooking.mutate(
      { id: rejectingId, ...(reason && { reason }) },
      {
        onSuccess: () => {
          toast({ title: 'Reserva rejeitada!' });
          setRejectDialogOpen(false);
          setRejectingId(null);
        },
        onError: (err) => {
          toast({ title: 'Erro', description: err.message, variant: 'error' });
        },
      },
    );
  };

  const count = pendingBookings?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Reservas</h1>
              {count > 0 && (
                <Badge variant="warning">{count} pendente{count > 1 ? 's' : ''}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Fila de aprovação de reservas de espaços
            </p>
          </div>
        </div>
        <Link href="/bookings/all">
          <Button variant="outline" size="sm">
            Ver Todas
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : count === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12">
          <CalendarCheck className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-semibold">Nenhuma reserva pendente</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Todas as reservas foram processadas.
          </p>
          <Link href="/bookings/all">
            <Button variant="outline">Ver todas as reservas</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pendingBookings!.map((booking) => (
            <PendingBookingsCard
              key={booking.id}
              booking={booking}
              onApprove={handleApprove}
              onReject={handleRejectClick}
              isPending={approveBooking.isPending || rejectBooking.isPending}
            />
          ))}
        </div>
      )}

      <RejectBookingDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleRejectConfirm}
        isPending={rejectBooking.isPending}
      />
    </div>
  );
}
