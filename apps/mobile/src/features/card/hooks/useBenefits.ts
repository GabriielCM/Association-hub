import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  listBenefits,
  listCategories,
  getPartnerDetails,
} from '../api/benefits.api';
import type {
  PartnerCategory,
  PartnerDetail,
  BenefitsFilter,
} from '@ahub/shared/types';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

export const benefitsKeys = {
  all: ['benefits'] as const,
  list: (filters: BenefitsFilter) =>
    [...benefitsKeys.all, 'list', filters] as const,
  categories: () => [...benefitsKeys.all, 'categories'] as const,
  detail: (id: string) => [...benefitsKeys.all, 'detail', id] as const,
};

export function useBenefitsList(filters?: BenefitsFilter) {
  return useInfiniteQuery({
    queryKey: benefitsKeys.list(filters || {}),
    queryFn: ({ pageParam = 1 }) =>
      listBenefits({ ...filters, page: pageParam as number, perPage: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.currentPage < lastPage.meta.totalPages) {
        return lastPage.meta.currentPage + 1;
      }
      return undefined;
    },
    staleTime: SEVEN_DAYS,
  });
}

export function useCategories() {
  return useQuery<{ data: PartnerCategory[] }>({
    queryKey: benefitsKeys.categories(),
    queryFn: listCategories,
    staleTime: SEVEN_DAYS,
  });
}

export function usePartnerDetails(partnerId: string) {
  return useQuery<PartnerDetail>({
    queryKey: benefitsKeys.detail(partnerId),
    queryFn: () => getPartnerDetails(partnerId),
    enabled: !!partnerId,
    staleTime: ONE_DAY,
  });
}
