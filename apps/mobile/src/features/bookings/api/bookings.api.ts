import { get, post, del } from '@/services/api/client';
import type {
  BookingDetail,
  CreateBookingInput,
  CreateBookingResult,
  JoinWaitlistInput,
  MyBookingsFilter,
  MyBookingsResponse,
  WaitlistPositionResponse,
} from '@ahub/shared/types';

export async function getMyBookings(
  filters?: MyBookingsFilter,
): Promise<MyBookingsResponse> {
  return get<MyBookingsResponse>('/reservas/minhas', filters);
}

export async function getBooking(id: string): Promise<BookingDetail> {
  return get<BookingDetail>(`/reservas/${id}`);
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  return post<CreateBookingResult>('/reservas', {
    spaceId: input.spaceId,
    date: input.date,
    periodType: input.periodType,
    ...(input.shiftName != null && { shiftName: input.shiftName }),
    ...(input.startTime != null && { startTime: input.startTime }),
    ...(input.endTime != null && { endTime: input.endTime }),
  });
}

export async function cancelBooking(
  id: string,
  reason?: string,
): Promise<{ message: string }> {
  return post<{ message: string }>(`/reservas/${id}/cancelar`, {
    ...(reason != null && { reason }),
  });
}

export async function joinWaitlist(
  input: JoinWaitlistInput,
): Promise<{ id: string; position: number; message: string }> {
  return post<{ id: string; position: number; message: string }>(
    '/reservas/fila',
    {
      spaceId: input.spaceId,
      date: input.date,
      periodType: input.periodType,
      ...(input.shiftName != null && { shiftName: input.shiftName }),
      ...(input.startTime != null && { startTime: input.startTime }),
      ...(input.endTime != null && { endTime: input.endTime }),
    },
  );
}

export async function getWaitlistPosition(): Promise<WaitlistPositionResponse> {
  return get<WaitlistPositionResponse>('/reservas/fila/posicao');
}

export async function leaveWaitlist(id: string): Promise<{ message: string }> {
  return del<{ message: string }>(`/reservas/fila/${id}`);
}

export async function confirmWaitlistSlot(
  id: string,
): Promise<{ reserva_id: string; status: string; message: string }> {
  return post<{ reserva_id: string; status: string; message: string }>(
    `/reservas/fila/${id}/confirmar`,
  );
}
