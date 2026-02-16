import { AxiosError } from 'axios';
import { api } from './client';
import type {
  StoreCategory,
  StoreProduct,
  ProductReview,
  ProductType,
  PaymentOptions,
} from '@ahub/shared/types';

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
// RESPONSE INTERFACES
// ===========================================

export interface AdminProductItem {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  categoryId: string;
  category?: StoreCategory;
  pricePoints?: number;
  priceMoney?: number;
  paymentOptions: PaymentOptions;
  stockType: 'limited' | 'unlimited';
  stockCount?: number;
  isFeatured: boolean;
  isPromotional: boolean;
  isActive: boolean;
  soldCount: number;
  reviewCount: number;
  averageRating?: number;
  images: { url: string }[];
  createdAt: string;
}

export interface AdminProductsResponse {
  data: AdminProductItem[];
  stats: {
    totalProducts: number;
    activeProducts: number;
    promotionalProducts: number;
    pendingReviews: number;
  };
  meta: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalCount: number;
  };
}

export interface AdminPendingReview extends ProductReview {
  product: {
    id: string;
    name: string;
  };
}

// ===========================================
// INPUT INTERFACES
// ===========================================

export interface CreateProductInput {
  categoryId: string;
  name: string;
  slug: string;
  shortDescription?: string;
  longDescription?: string;
  type?: ProductType;
  pricePoints?: number;
  priceMoney?: number;
  paymentOptions?: PaymentOptions;
  allowMixedPayment?: boolean;
  stockType?: string;
  stockCount?: number;
  limitPerUser?: number;
  cashbackPercent?: number;
  voucherValidityDays?: number;
  pickupLocation?: string;
  eligiblePlans?: string[];
}

export interface CreateVariantInput {
  sku: string;
  name: string;
  attributes: Record<string, string>;
  pricePoints?: number;
  priceMoney?: number;
  stockCount?: number;
  imageUrl?: string;
}

export interface SetPromotionInput {
  promotionalPricePoints?: number;
  promotionalPriceMoney?: number;
  endsAt: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
}

// ===========================================
// CATEGORIES
// ===========================================

export async function getAdminCategories(): Promise<StoreCategory[]> {
  try {
    const response = await api.get('/admin/store/categories');
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar categorias');
  }
}

export async function createCategory(
  data: CreateCategoryInput
): Promise<StoreCategory> {
  try {
    const response = await api.post('/admin/store/categories', data);
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao criar categoria');
  }
}

export async function updateCategory(
  id: string,
  data: Partial<CreateCategoryInput> & { isActive?: boolean }
): Promise<StoreCategory> {
  try {
    const response = await api.patch(`/admin/store/categories/${id}`, data);
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao atualizar categoria');
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await api.delete(`/admin/store/categories/${id}`);
  } catch (error) {
    throw extractApiError(error, 'Falha ao excluir categoria');
  }
}

// ===========================================
// PRODUCTS
// ===========================================

export async function getAdminProducts(query?: {
  page?: number;
  perPage?: number;
  search?: string;
  categoryId?: string;
  type?: ProductType;
  isActive?: boolean;
}): Promise<AdminProductsResponse> {
  try {
    const response = await api.get('/admin/store/products', { params: query });
    const data = response.data;
    // Normalize: backend might return array directly or wrapped
    if (Array.isArray(data)) {
      return {
        data,
        stats: {
          totalProducts: data.length,
          activeProducts: data.filter((p: AdminProductItem) => p.isActive).length,
          promotionalProducts: data.filter((p: AdminProductItem) => p.isPromotional).length,
          pendingReviews: 0,
        },
        meta: {
          currentPage: 1,
          perPage: data.length,
          totalPages: 1,
          totalCount: data.length,
        },
      };
    }
    return data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar produtos');
  }
}

export async function getAdminProduct(id: string): Promise<StoreProduct> {
  try {
    const response = await api.get(`/admin/store/products/${id}`);
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar produto');
  }
}

export async function createProduct(
  data: CreateProductInput
): Promise<StoreProduct> {
  try {
    const response = await api.post('/admin/store/products', data);
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao criar produto');
  }
}

export async function updateProduct(
  id: string,
  data: Partial<CreateProductInput> & { isActive?: boolean; isFeatured?: boolean }
): Promise<StoreProduct> {
  try {
    const response = await api.patch(`/admin/store/products/${id}`, data);
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao atualizar produto');
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await api.delete(`/admin/store/products/${id}`);
  } catch (error) {
    throw extractApiError(error, 'Falha ao excluir produto');
  }
}

// ===========================================
// VARIANTS
// ===========================================

export async function createVariant(
  productId: string,
  data: CreateVariantInput
): Promise<void> {
  try {
    await api.post(`/admin/store/products/${productId}/variants`, data);
  } catch (error) {
    throw extractApiError(error, 'Falha ao criar variante');
  }
}

export async function updateVariant(
  productId: string,
  variantId: string,
  data: Partial<CreateVariantInput> & { isActive?: boolean }
): Promise<void> {
  try {
    await api.patch(
      `/admin/store/products/${productId}/variants/${variantId}`,
      data
    );
  } catch (error) {
    throw extractApiError(error, 'Falha ao atualizar variante');
  }
}

export async function deleteVariant(
  productId: string,
  variantId: string
): Promise<void> {
  try {
    await api.delete(
      `/admin/store/products/${productId}/variants/${variantId}`
    );
  } catch (error) {
    throw extractApiError(error, 'Falha ao excluir variante');
  }
}

// ===========================================
// PROMOTIONS
// ===========================================

export async function setPromotion(
  productId: string,
  data: SetPromotionInput
): Promise<void> {
  try {
    await api.post(`/admin/store/products/${productId}/promotion`, data);
  } catch (error) {
    throw extractApiError(error, 'Falha ao definir promocao');
  }
}

export async function removePromotion(productId: string): Promise<void> {
  try {
    await api.delete(`/admin/store/products/${productId}/promotion`);
  } catch (error) {
    throw extractApiError(error, 'Falha ao remover promocao');
  }
}

// ===========================================
// STOCK
// ===========================================

export async function updateProductStock(
  productId: string,
  stockCount: number
): Promise<void> {
  try {
    await api.patch(`/admin/store/products/${productId}/stock`, { stockCount });
  } catch (error) {
    throw extractApiError(error, 'Falha ao atualizar estoque');
  }
}

export async function updateVariantStock(
  productId: string,
  variantId: string,
  stockCount: number
): Promise<void> {
  try {
    await api.patch(
      `/admin/store/products/${productId}/variants/${variantId}/stock`,
      { stockCount }
    );
  } catch (error) {
    throw extractApiError(error, 'Falha ao atualizar estoque da variante');
  }
}

// ===========================================
// REVIEWS
// ===========================================

export async function getPendingReviews(): Promise<AdminPendingReview[]> {
  try {
    const response = await api.get('/admin/store/reviews/pending');
    return response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar avaliacoes pendentes');
  }
}

export async function moderateReview(
  id: string,
  data: { status: 'APPROVED' | 'REJECTED' }
): Promise<void> {
  try {
    await api.patch(`/admin/store/reviews/${id}/moderate`, data);
  } catch (error) {
    throw extractApiError(error, 'Falha ao moderar avaliacao');
  }
}

// ===========================================
// REPORTS
// ===========================================

export async function getStoreReport(query: {
  period?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: string;
}): Promise<any> {
  try {
    const response = await api.get('/admin/store/reports/sales', { params: query });
    return response.data?.data || response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar relatorio de vendas');
  }
}

export async function getProductSalesReport(query: {
  period?: string;
}): Promise<any[]> {
  try {
    const response = await api.get('/admin/store/reports/products', { params: query });
    return response.data?.data || response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar vendas por produto');
  }
}

export async function exportStoreCsv(query: {
  period?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Blob> {
  const response = await api.get('/admin/store/reports/export', {
    params: query,
    responseType: 'blob',
  });
  return response.data;
}

export async function getLowStockProducts(): Promise<any[]> {
  try {
    const response = await api.get('/admin/store/products/low-stock');
    return response.data?.data || response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar produtos com estoque baixo');
  }
}

export async function reorderCategories(categoryIds: string[]): Promise<void> {
  try {
    await api.post('/admin/store/categories/reorder', { categoryIds });
  } catch (error) {
    throw extractApiError(error, 'Falha ao reordenar categorias');
  }
}
