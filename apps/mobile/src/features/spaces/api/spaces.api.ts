import { get } from '@/services/api/client';
import type {
  SpaceDetail,
  SpacesListFilter,
  SpacesListResponse,
  SpaceAvailabilityResponse,
} from '@ahub/shared/types';

export async function getSpaces(
  filters?: SpacesListFilter,
): Promise<SpacesListResponse> {
  return get<SpacesListResponse>('/espacos', filters);
}

export async function getSpace(id: string): Promise<SpaceDetail> {
  return get<SpaceDetail>(`/espacos/${id}`);
}

export async function getSpaceAvailability(
  spaceId: string,
  startDate: string,
  endDate: string,
): Promise<SpaceAvailabilityResponse> {
  return get<SpaceAvailabilityResponse>(
    `/espacos/${spaceId}/disponibilidade`,
    { startDate, endDate },
  );
}
