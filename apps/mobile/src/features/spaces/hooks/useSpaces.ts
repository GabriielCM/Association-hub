import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getSpaces,
  getSpace,
  getSpaceAvailability,
} from '../api/spaces.api';
import type { SpacesListFilter, SpacesListResponse } from '@ahub/shared/types';

export const spacesKeys = {
  all: ['spaces'] as const,
  lists: () => [...spacesKeys.all, 'list'] as const,
  list: (filters: SpacesListFilter) => [...spacesKeys.lists(), filters] as const,
  details: () => [...spacesKeys.all, 'detail'] as const,
  detail: (id: string) => [...spacesKeys.details(), id] as const,
  availability: (id: string, start: string, end: string) =>
    [...spacesKeys.all, 'availability', id, start, end] as const,
};

export function useSpaces(filters: SpacesListFilter = {}) {
  return useInfiniteQuery<SpacesListResponse>({
    queryKey: spacesKeys.list(filters),
    queryFn: ({ pageParam }) =>
      getSpaces({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 2 * 60_000,
  });
}

export function useSpace(id: string) {
  return useQuery({
    queryKey: spacesKeys.detail(id),
    queryFn: () => getSpace(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useSpaceAvailability(
  spaceId: string,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: spacesKeys.availability(spaceId, startDate, endDate),
    queryFn: () => getSpaceAvailability(spaceId, startDate, endDate),
    enabled: !!spaceId && !!startDate && !!endDate,
    staleTime: 5 * 60_000,
  });
}
