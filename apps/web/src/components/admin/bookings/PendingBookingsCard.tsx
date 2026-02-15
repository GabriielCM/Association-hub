'use client';

import { Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { BookingPeriodInfo } from './BookingPeriodInfo';
import type { PendingBookingItem } from '@/lib/api/bookings.api';

interface PendingBookingsCardProps {
  booking: PendingBookingItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isPending?: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatFee(fee?: number): string {
  if (fee == null || fee <= 0) return 'Grátis';
  return `R$ ${(fee / 100).toFixed(2)}`;
}

export function PendingBookingsCard({
  booking,
  onApprove,
  onReject,
  isPending,
}: PendingBookingsCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      {/* Header: space name + pending time */}
      <div className="flex items-center justify-between">
        <p className="font-semibold">{booking.space.name}</p>
        {booking.tempo_pendente && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Pendente há {booking.tempo_pendente}
          </span>
        )}
      </div>

      {/* User info */}
      {booking.user && (
        <div className="flex items-center gap-2">
          {booking.user.avatarUrl ? (
            <img
              src={booking.user.avatarUrl}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-white">
              {booking.user.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-sm font-medium">{booking.user.name}</p>
            <p className="text-xs text-muted-foreground">{booking.user.email}</p>
          </div>
        </div>
      )}

      {/* Date + Period */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>{formatDate(booking.date)}</span>
        <span>·</span>
        <BookingPeriodInfo
          periodType={booking.periodType}
          {...(booking.shiftName != null && { shiftName: booking.shiftName })}
          {...(booking.shiftStart != null && { shiftStart: booking.shiftStart })}
          {...(booking.shiftEnd != null && { shiftEnd: booking.shiftEnd })}
          {...(booking.startTime != null && { startTime: booking.startTime })}
          {...(booking.endTime != null && { endTime: booking.endTime })}
        />
      </div>

      {/* Fee */}
      {(booking.totalFee != null && booking.totalFee > 0) && (
        <div className="text-sm">
          <span className="text-muted-foreground">Taxa: </span>
          <span className="font-medium">{formatFee(booking.finalFee ?? booking.totalFee)}</span>
          {booking.discountApplied != null && booking.discountApplied > 0 && (
            <span className="ml-1 text-xs text-green-600">
              (-{booking.discountApplied}%)
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-destructive"
          onClick={() => onReject(booking.id)}
          disabled={isPending}
        >
          <X className="mr-1 h-4 w-4" />
          Rejeitar
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onApprove(booking.id)}
          disabled={isPending}
        >
          <Check className="mr-1 h-4 w-4" />
          Aprovar
        </Button>
      </div>
    </div>
  );
}
