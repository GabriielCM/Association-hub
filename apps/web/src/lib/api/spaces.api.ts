import { AxiosError } from 'axios';
import { api } from './client';

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

export type SpaceStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
export type BookingPeriodType = 'DAY' | 'SHIFT' | 'HOUR';

export interface Shift {
  name: string;
  startTime: string;
  endTime: string;
}

export interface SpaceBlock {
  id: string;
  date: string;
  reason?: string;
  createdById: string;
  createdAt: string;
}

export interface SpaceItem {
  id: string;
  name: string;
  description: string;
  capacity: number;
  images: string[];
  mainImageUrl?: string;
  fee: number;
  periodType: BookingPeriodType;
  shifts?: Shift[];
  openingTime?: string;
  closingTime?: string;
  minDurationHours?: number;
  minAdvanceDays: number;
  maxAdvanceDays: number;
  bookingIntervalMonths: number;
  blockedWeekdays: number[];
  blockedSpaceIds: string[];
  status: SpaceStatus;
  _count?: { bookings: number };
  blocks?: SpaceBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpaceInput {
  name: string;
  description: string;
  capacity: number;
  periodType: BookingPeriodType;
  images?: string[];
  fee?: number;
  shifts?: Shift[];
  openingTime?: string;
  closingTime?: string;
  minDurationHours?: number;
  minAdvanceDays?: number;
  maxAdvanceDays?: number;
  bookingIntervalMonths?: number;
  blockedWeekdays?: number[];
  blockedSpaceIds?: string[];
}

export interface SpaceAvailabilityDay {
  date: string;
  available: boolean;
  reason?: string;
  shifts?: { name: string; available: boolean }[];
  bookings?: { startTime: string; endTime: string }[];
}

// ===========================================
// SPACES — ADMIN
// ===========================================

export async function getAdminSpaces(query?: {
  status?: SpaceStatus;
}): Promise<SpaceItem[]> {
  try {
    const response = await api.get('/espacos', { params: query });
    const raw = response.data;
    const payload = raw.success !== undefined ? raw.data : raw;
    return Array.isArray(payload) ? payload : payload.data ?? [];
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar espaços');
  }
}

export async function getAdminSpace(id: string): Promise<SpaceItem> {
  try {
    const response = await api.get(`/espacos/${id}`);
    const raw = response.data;
    return raw.success !== undefined ? raw.data : raw;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar espaço');
  }
}

export async function createSpace(data: CreateSpaceInput): Promise<SpaceItem> {
  try {
    const response = await api.post('/espacos', data);
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao criar espaço');
  }
}

export async function updateSpace(
  id: string,
  data: Partial<CreateSpaceInput> & { status?: SpaceStatus },
): Promise<SpaceItem> {
  try {
    const response = await api.put(`/espacos/${id}`, data);
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao atualizar espaço');
  }
}

export async function deleteSpace(id: string): Promise<void> {
  try {
    await api.delete(`/espacos/${id}`);
  } catch (error) {
    throw extractApiError(error, 'Falha ao excluir espaço');
  }
}

export async function updateSpaceStatus(
  id: string,
  status: SpaceStatus,
): Promise<SpaceItem> {
  try {
    const response = await api.patch(`/espacos/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao alterar status do espaço');
  }
}

// ===========================================
// BLOCKS
// ===========================================

export async function getSpaceBlocks(spaceId: string): Promise<SpaceBlock[]> {
  try {
    const response = await api.get(`/espacos/${spaceId}/bloqueios`);
    const data = response.data;
    return Array.isArray(data) ? data : data.data ?? [];
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar bloqueios');
  }
}

export async function createSpaceBlock(
  spaceId: string,
  data: { date: string; reason?: string },
): Promise<SpaceBlock> {
  try {
    const response = await api.post(`/espacos/${spaceId}/bloqueios`, data);
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao criar bloqueio');
  }
}

export async function createBulkBlocks(
  spaceId: string,
  data: { dates: string[]; reason?: string },
): Promise<{ created: number }> {
  try {
    const response = await api.post(`/espacos/${spaceId}/bloqueios/bulk`, data);
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao criar bloqueios');
  }
}

export async function deleteSpaceBlock(
  spaceId: string,
  blockId: string,
): Promise<void> {
  try {
    await api.delete(`/espacos/${spaceId}/bloqueios/${blockId}`);
  } catch (error) {
    throw extractApiError(error, 'Falha ao excluir bloqueio');
  }
}

// ===========================================
// IMAGES
// ===========================================

export async function uploadSpaceImage(
  spaceId: string,
  file: File,
): Promise<SpaceItem> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/espacos/${spaceId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao enviar imagem');
  }
}

export async function removeSpaceImage(
  spaceId: string,
  imageUrl: string,
): Promise<SpaceItem> {
  try {
    const response = await api.delete(`/espacos/${spaceId}/images`, {
      data: { imageUrl },
    });
    return response.data.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao remover imagem');
  }
}

// ===========================================
// AVAILABILITY
// ===========================================

export async function getSpaceAvailability(
  spaceId: string,
  startDate: string,
  endDate: string,
): Promise<SpaceAvailabilityDay[]> {
  try {
    const response = await api.get(`/espacos/${spaceId}/disponibilidade`, {
      params: { startDate, endDate },
    });
    const raw = response.data;
    const payload = raw.success !== undefined ? raw.data : raw;
    return Array.isArray(payload) ? payload : payload.data ?? [];
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar disponibilidade');
  }
}
