import { AxiosError } from 'axios';
import { api } from './client';
import type { BookingPeriodType } from './spaces.api';

function extractApiError(error: unknown, fallback: string): Error {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as Record<string, unknown>;
    const msg = Array.isArray(data.message)
      ? (data.message as string[]).join(', ')
      : (data.message as string);
    if (msg) return new Error(msg);
  }
  if (error instanceof Error) return error;
  return new Error(fallback);
}

// ===========================================
// TYPES
// ===========================================

export type BookingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'COMPLETED';

export interface BookingItem {
  id: string;
  spaceId: string;
  space: { id: string; name: string; mainImageUrl?: string };
  userId: string;
  user?: { name: string; email: string; avatarUrl?: string };
  date: string;
  periodType: BookingPeriodType;
  shiftName?: string;
  shiftStart?: string;
  shiftEnd?: string;
  startTime?: string;
  endTime?: string;
  totalFee?: number;
  discountApplied?: number;
  finalFee?: number;
  status: BookingStatus;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PendingBookingItem extends BookingItem {
  tempo_pendente?: string;
}

export interface AdminBookingsResponse {
  data: BookingItem[];
  meta?: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalCount: number;
  };
}

// ===========================================
// BOOKINGS — ADMIN
// ===========================================

export async function getAdminBookings(query?: {
  status?: BookingStatus;
  spaceId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<AdminBookingsResponse> {
  try {
    const response = await api.get('/reservas', { params: query });
    const data = response.data;
    if (Array.isArray(data)) {
      return { data };
    }
    return {
      data: data.data ?? [],
      meta: data.meta,
    };
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar reservas');
  }
}

export async function getPendingBookings(): Promise<PendingBookingItem[]> {
  try {
    const response = await api.get('/reservas/pendentes');
    const data = response.data;
    return Array.isArray(data) ? data : data.data ?? [];
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar reservas pendentes');
  }
}

export async function approveBooking(id: string): Promise<BookingItem> {
  try {
    const response = await api.post(`/reservas/${id}/aprovar`);
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao aprovar reserva');
  }
}

export async function rejectBooking(
  id: string,
  reason?: string,
): Promise<BookingItem> {
  try {
    const response = await api.post(`/reservas/${id}/rejeitar`, {
      ...(reason && { reason }),
    });
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao rejeitar reserva');
  }
}

export async function adminCancelBooking(
  id: string,
  reason?: string,
): Promise<BookingItem> {
  try {
    const response = await api.post(`/reservas/${id}/cancelar-admin`, {
      ...(reason && { reason }),
    });
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao cancelar reserva');
  }
}
