import { api } from './client';
import type {
  ApiResponse,
  PartnerCategory,
  PartnerDetail,
  AudienceType,
} from '@ahub/shared/types';

// ===========================================
// RESPONSE INTERFACES
// ===========================================

export interface AdminPartnerItem {
  id: string;
  name: string;
  logoUrl?: string;
  benefit: string;
  category: PartnerCategory;
  city?: string;
  state?: string;
  isActive: boolean;
  isNew: boolean;
  eligibleAudiences: string[];
  createdAt: string;
}

export interface AdminPartnersResponse {
  partners: AdminPartnerItem[];
  stats: {
    totalPartners: number;
    activePartners: number;
    newThisMonth: number;
    totalCategories: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminPartnerDetail extends PartnerDetail {
  eligibleAudiences: AudienceType[];
  eligiblePlanIds: string[];
  showLocked: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AdminCategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
  partnersCount: number;
}

export interface AdminCategoriesResponse {
  categories: AdminCategoryItem[];
}

// ===========================================
// PARTNER ENDPOINTS
// ===========================================

export async function getPartners(query?: {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string;
}): Promise<AdminPartnersResponse> {
  const response = await api.get<ApiResponse<AdminPartnersResponse>>(
    '/admin/partners',
    { params: query }
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao buscar parceiros');
  }
  return response.data.data;
}

export async function getPartnerDetail(partnerId: string): Promise<AdminPartnerDetail> {
  const response = await api.get<ApiResponse<AdminPartnerDetail>>(
    `/admin/partners/${partnerId}`
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao buscar parceiro');
  }
  return response.data.data;
}

export async function createPartner(data: {
  categoryId: string;
  name: string;
  benefit: string;
  instructions?: string;
  logoUrl?: string;
  bannerUrl?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  businessHours?: Record<string, string>;
  eligibleAudiences?: AudienceType[];
  eligiblePlanIds?: string[];
  showLocked?: boolean;
}): Promise<unknown> {
  const response = await api.post<ApiResponse<unknown>>(
    '/admin/partners',
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao criar parceiro');
  }
  return response.data.data;
}

export async function updatePartner(
  partnerId: string,
  data: Partial<{
    categoryId: string;
    name: string;
    benefit: string;
    instructions: string;
    logoUrl: string;
    bannerUrl: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    lat: number;
    lng: number;
    phone: string;
    website: string;
    instagram: string;
    facebook: string;
    whatsapp: string;
    businessHours: Record<string, string>;
    eligibleAudiences: AudienceType[];
    eligiblePlanIds: string[];
    showLocked: boolean;
    isActive: boolean;
    isNew: boolean;
  }>
): Promise<unknown> {
  const response = await api.put<ApiResponse<unknown>>(
    `/admin/partners/${partnerId}`,
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao atualizar parceiro');
  }
  return response.data.data;
}

export async function deletePartner(partnerId: string): Promise<void> {
  const response = await api.delete<ApiResponse<void>>(
    `/admin/partners/${partnerId}`
  );
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Falha ao desativar parceiro');
  }
}

// ===========================================
// CATEGORY ENDPOINTS
// ===========================================

export async function getCategories(): Promise<AdminCategoriesResponse> {
  const response = await api.get<ApiResponse<AdminCategoriesResponse>>(
    '/admin/partners/categories'
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao buscar categorias');
  }
  return response.data.data;
}

export async function createCategory(data: {
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  order?: number;
}): Promise<unknown> {
  const response = await api.post<ApiResponse<unknown>>(
    '/admin/partners/categories',
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao criar categoria');
  }
  return response.data.data;
}

export async function updateCategory(
  categoryId: string,
  data: Partial<{
    name: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
  }>
): Promise<unknown> {
  const response = await api.put<ApiResponse<unknown>>(
    `/admin/partners/categories/${categoryId}`,
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao atualizar categoria');
  }
  return response.data.data;
}
