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
// RESPONSE INTERFACES
// ===========================================

export type PdvStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface PdvItem {
  id: string;
  name: string;
  location: string;
  status: PdvStatus;
  apiKey: string;
  displayConfig?: {
    theme?: string;
    idleTimeout?: number;
    checkoutTimeout?: number;
  };
  productsCount?: number;
  createdAt: string;
}

export interface PdvCredentials {
  apiKey: string;
  apiSecret: string;
}

export interface PdvProductItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  pricePoints: number;
  priceMoney: number;
  category?: string;
  stock: number;
  isActive: boolean;
}

export interface PdvSaleItem {
  id: string;
  checkoutId: string;
  userId: string;
  userName?: string;
  items: {
    product_id: string;
    name: string;
    quantity: number;
    unit_price_points: number;
    unit_price_money: number;
  }[];
  paymentMethod: string;
  totalPoints: number;
  totalMoney: number;
  cashbackEarned: number;
  createdAt: string;
}

export interface PdvSalesReport {
  sales: PdvSaleItem[];
  summary: {
    totalSales: number;
    totalPoints: number;
    totalMoney: number;
    totalCashback: number;
  };
}

// ===========================================
// INPUT INTERFACES
// ===========================================

export interface CreatePdvInput {
  name: string;
  location: string;
  displayConfig?: {
    theme?: string;
    idleTimeout?: number;
    checkoutTimeout?: number;
  };
}

export interface CreatePdvProductInput {
  name: string;
  description?: string;
  imageUrl?: string;
  pricePoints: number;
  priceMoney: number;
  category?: string;
  stock?: number;
}

export interface UpdateStockInput {
  productId: string;
  quantity: number;
  reason?: string;
}

// ===========================================
// PDV CRUD
// ===========================================

export async function getAdminPdvs(): Promise<PdvItem[]> {
  try {
    const response = await api.get('/admin/pdv');
    return response.data.data ?? response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar PDVs');
  }
}

export async function getAdminPdv(id: string): Promise<PdvItem> {
  try {
    const response = await api.get(`/admin/pdv/${id}`);
    return response.data.data ?? response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar PDV');
  }
}

export async function createPdv(
  data: CreatePdvInput
): Promise<PdvItem & PdvCredentials> {
  try {
    const response = await api.post('/admin/pdv', data);
    return response.data.data ?? response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao criar PDV');
  }
}

export async function updatePdv(
  id: string,
  data: Partial<CreatePdvInput> & { status?: PdvStatus }
): Promise<PdvItem> {
  try {
    const response = await api.put(`/admin/pdv/${id}`, data);
    return response.data.data ?? response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao atualizar PDV');
  }
}

export async function deletePdv(id: string): Promise<void> {
  try {
    await api.delete(`/admin/pdv/${id}`);
  } catch (error) {
    throw extractApiError(error, 'Falha ao desativar PDV');
  }
}

export async function regenerateCredentials(
  id: string
): Promise<PdvCredentials> {
  try {
    const response = await api.post(`/admin/pdv/${id}/regenerate-credentials`);
    return response.data.data ?? response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao regenerar credenciais');
  }
}

// ===========================================
// PDV PRODUCTS
// ===========================================

export async function getPdvProducts(
  pdvId: string,
  query?: { includeInactive?: boolean }
): Promise<PdvProductItem[]> {
  try {
    const response = await api.get(`/admin/pdv/${pdvId}/products`, {
      params: query,
    });
    return response.data.data ?? response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar produtos do PDV');
  }
}

export async function addPdvProduct(
  pdvId: string,
  data: CreatePdvProductInput
): Promise<PdvProductItem> {
  try {
    const response = await api.post(`/admin/pdv/${pdvId}/products`, data);
    return response.data.data ?? response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao adicionar produto');
  }
}

export async function updatePdvProduct(
  pdvId: string,
  productId: string,
  data: Partial<CreatePdvProductInput> & { isActive?: boolean }
): Promise<PdvProductItem> {
  try {
    const response = await api.put(
      `/admin/pdv/${pdvId}/products/${productId}`,
      data
    );
    return response.data.data ?? response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao atualizar produto');
  }
}

export async function removePdvProduct(
  pdvId: string,
  productId: string
): Promise<void> {
  try {
    await api.delete(`/admin/pdv/${pdvId}/products/${productId}`);
  } catch (error) {
    throw extractApiError(error, 'Falha ao remover produto');
  }
}

// ===========================================
// PDV STOCK
// ===========================================

export async function getPdvStock(
  pdvId: string
): Promise<PdvProductItem[]> {
  try {
    const response = await api.get(`/admin/pdv/${pdvId}/stock`);
    return response.data.data ?? response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar estoque');
  }
}

export async function updatePdvStock(
  pdvId: string,
  data: UpdateStockInput
): Promise<void> {
  try {
    await api.put(`/admin/pdv/${pdvId}/stock`, data);
  } catch (error) {
    throw extractApiError(error, 'Falha ao atualizar estoque');
  }
}

// ===========================================
// PDV SALES
// ===========================================

export async function getPdvSales(
  pdvId: string,
  query?: { startDate?: string; endDate?: string }
): Promise<PdvSalesReport> {
  try {
    const response = await api.get(`/admin/pdv/${pdvId}/sales`, {
      params: query,
    });
    const data = response.data.data ?? response.data;
    // Normalize response
    if (Array.isArray(data)) {
      return {
        sales: data,
        summary: {
          totalSales: data.length,
          totalPoints: data.reduce((sum: number, s: PdvSaleItem) => sum + s.totalPoints, 0),
          totalMoney: data.reduce((sum: number, s: PdvSaleItem) => sum + s.totalMoney, 0),
          totalCashback: data.reduce((sum: number, s: PdvSaleItem) => sum + s.cashbackEarned, 0),
        },
      };
    }
    return data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar vendas');
  }
}
