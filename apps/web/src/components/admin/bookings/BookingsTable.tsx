'use client';

import { Check, X, Ban } from 'lucide-react';
import { Button } from '@/components/ui';
import { BookingStatusBadge } from './BookingStatusBadge';
import { BookingPeriodInfo } from './BookingPeriodInfo';
import type { BookingItem } from '@/lib/api/bookings.api';

interface BookingsTableProps {
  bookings: BookingItem[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  isPending?: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR');
}

function formatFee(fee?: number): string {
  if (fee == null || fee <= 0) return 'Grátis';
  return `R$ ${(fee / 100).toFixed(2)}`;
}

export function BookingsTable({
  bookings,
  onApprove,
  onReject,
  onCancel,
  isPending,
}: BookingsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Espaço</th>
            <th className="px-4 py-3 text-left font-medium">Usuário</th>
            <th className="px-4 py-3 text-left font-medium">Data</th>
            <th className="px-4 py-3 text-left font-medium">Período</th>
            <th className="px-4 py-3 text-left font-medium">Taxa</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b hover:bg-muted/30">
              <td className="px-4 py-3">
                <p className="font-medium">{booking.space.name}</p>
              </td>
              <td className="px-4 py-3">
                {booking.user ? (
                  <div className="flex items-center gap-2">
                    {booking.user.avatarUrl ? (
                      <img
                        src={booking.user.avatarUrl}
                        alt=""
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                        {booking.user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm">{booking.user.name}</p>
                      <p className="text-xs text-muted-foreground">{booking.user.email}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="px-4 py-3">{formatDate(booking.date)}</td>
              <td className="px-4 py-3">
                <BookingPeriodInfo
                  periodType={booking.periodType}
                  {...(booking.shiftName != null && { shiftName: booking.shiftName })}
                  {...(booking.shiftStart != null && { shiftStart: booking.shiftStart })}
                  {...(booking.shiftEnd != null && { shiftEnd: booking.shiftEnd })}
                  {...(booking.startTime != null && { startTime: booking.startTime })}
                  {...(booking.endTime != null && { endTime: booking.endTime })}
                />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatFee(booking.finalFee ?? booking.totalFee)}
              </td>
              <td className="px-4 py-3">
                <BookingStatusBadge status={booking.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {booking.status === 'PENDING' && onApprove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onApprove(booking.id)}
                      disabled={isPending}
                      title="Aprovar"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                  {booking.status === 'PENDING' && onReject && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onReject(booking.id)}
                      disabled={isPending}
                      title="Rejeitar"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                  {(booking.status === 'PENDING' || booking.status === 'APPROVED') &&
                    onCancel && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onCancel(booking.id)}
                        disabled={isPending}
                        title="Cancelar"
                      >
                        <Ban className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
