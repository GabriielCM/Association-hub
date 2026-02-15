'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Users, Clock, DollarSign, CalendarDays, ImageIcon } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { SpaceStatusBadge } from '@/components/admin/spaces/SpaceStatusBadge';
import { SpacePeriodLabel } from '@/components/admin/spaces/SpacePeriodLabel';
import { SpaceDialog } from '@/components/admin/spaces/SpaceDialog';
import { SpaceBlocksManager } from '@/components/admin/spaces/SpaceBlocksManager';
import { SpaceAvailabilityCalendar } from '@/components/admin/spaces/SpaceAvailabilityCalendar';
import { BookingsTable } from '@/components/admin/bookings/BookingsTable';
import {
  useAdminSpace,
  useUpdateSpaceStatus,
} from '@/lib/hooks/useAdminSpaces';
import {
  useAdminBookings,
  useApproveBooking,
  useRejectBooking,
} from '@/lib/hooks/useAdminBookings';
import { resolveUploadUrl } from '@/config/constants';
import type { SpaceStatus } from '@/lib/api/spaces.api';

export default function SpaceDetailPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { toast } = useToast();
  const { data: space, isLoading } = useAdminSpace(spaceId);
  const { data: bookingsData } = useAdminBookings({ spaceId, limit: 10 });
  const updateStatus = useUpdateSpaceStatus();
  const approveBooking = useApproveBooking();
  const rejectBooking = useRejectBooking();

  const [editOpen, setEditOpen] = useState(false);

  if (isLoading || !space) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const handleStatusChange = (status: SpaceStatus) => {
    updateStatus.mutate(
      { id: spaceId, status },
      {
        onSuccess: () => toast({ title: `Status alterado para ${status}` }),
        onError: (err) => {
          toast({ title: 'Erro', description: err.message, variant: 'error' });
        },
      },
    );
  };

  const formatFee = (fee: number): string => {
    if (fee <= 0) return 'Grátis';
    return `R$ ${(fee / 100).toFixed(2)}`;
  };

  const recentBookings = bookingsData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/spaces">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{space.name}</h1>
              <SpaceStatusBadge status={space.status} />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {space.description}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={space.status}
            onChange={(e) => handleStatusChange(e.target.value as SpaceStatus)}
            disabled={updateStatus.isPending}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="ACTIVE">Ativo</option>
            <option value="MAINTENANCE">Manutenção</option>
            <option value="INACTIVE">Inativo</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit2 className="mr-1 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Image gallery */}
      {space.images && space.images.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <ImageIcon className="h-4 w-4" />
            Imagens ({space.images.length})
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {space.images.map((url: string, i: number) => {
              const resolved = resolveUploadUrl(url);
              return (
                <div key={url} className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
                  {resolved && (
                    <img
                      src={resolved}
                      alt={`${space.name} - ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                      Principal
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Capacidade</p>
              <p className="font-semibold">{space.capacity} pessoas</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Período</p>
              <SpacePeriodLabel type={space.periodType} />
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Taxa</p>
              <p className="font-semibold">{formatFee(space.fee)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Intervalo</p>
              <p className="font-semibold">
                {space.bookingIntervalMonths > 0
                  ? `${space.bookingIntervalMonths} mes(es)`
                  : 'Sem restrição'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Period configuration */}
      {space.periodType === 'SHIFT' && space.shifts && space.shifts.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Turnos Configurados</h3>
          <div className="flex flex-wrap gap-3">
            {space.shifts.map((shift, i) => (
              <div key={i} className="rounded-md border px-3 py-2">
                <p className="text-sm font-medium">{shift.name}</p>
                <p className="text-xs text-muted-foreground">
                  {shift.startTime} - {shift.endTime}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {space.periodType === 'HOUR' && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Configuração de Horário</h3>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Abertura: </span>
              <span className="font-medium">{space.openingTime ?? '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Fechamento: </span>
              <span className="font-medium">{space.closingTime ?? '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Duração mínima: </span>
              <span className="font-medium">{space.minDurationHours ?? 1}h</span>
            </div>
          </div>
        </div>
      )}

      {/* Advance days info */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Regras de Reserva</h3>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Antecedência mínima: </span>
            <span className="font-medium">{space.minAdvanceDays} dia(s)</span>
          </div>
          <div>
            <span className="text-muted-foreground">Antecedência máxima: </span>
            <span className="font-medium">{space.maxAdvanceDays} dia(s)</span>
          </div>
        </div>
      </div>

      {/* Availability Calendar */}
      <div className="rounded-lg border bg-card p-4">
        <SpaceAvailabilityCalendar spaceId={spaceId} />
      </div>

      {/* Blocks Manager */}
      <div className="rounded-lg border bg-card p-4">
        <SpaceBlocksManager spaceId={spaceId} />
      </div>

      {/* Recent bookings */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Reservas Recentes</h3>
          <Link href={`/bookings/all?spaceId=${spaceId}`}>
            <Button variant="ghost" size="sm">
              Ver todas
            </Button>
          </Link>
        </div>
        {recentBookings.length > 0 ? (
          <BookingsTable
            bookings={recentBookings}
            onApprove={(id) =>
              approveBooking.mutate(id, {
                onSuccess: () => toast({ title: 'Reserva aprovada!' }),
                onError: (err) => {
                  toast({ title: 'Erro', description: err.message, variant: 'error' });
                },
              })
            }
            onReject={(id) =>
              rejectBooking.mutate(
                { id },
                {
                  onSuccess: () => toast({ title: 'Reserva rejeitada!' }),
                  onError: (err) => {
                    toast({ title: 'Erro', description: err.message, variant: 'error' });
                  },
                },
              )
            }
            isPending={approveBooking.isPending || rejectBooking.isPending}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhuma reserva para este espaço.
          </p>
        )}
      </div>

      <SpaceDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        space={space}
      />
    </div>
  );
}
