import { get } from '@/services/api/client';
import type {
  BenefitsListResponse,
  PartnerCategory,
  PartnerDetail,
  BenefitsFilter,
} from '@ahub/shared/types';

export async function listBenefits(
  filters?: BenefitsFilter
): Promise<BenefitsListResponse> {
  return get<BenefitsListResponse>('/benefits', filters);
}

export async function listCategories(): Promise<{
  data: PartnerCategory[];
}> {
  return get('/benefits/categories');
}

export async function getPartnerDetails(
  partnerId: string
): Promise<PartnerDetail> {
  return get<PartnerDetail>(`/benefits/${partnerId}`);
}
