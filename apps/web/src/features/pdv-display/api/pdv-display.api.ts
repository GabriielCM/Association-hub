import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// ===========================================
// TYPES
// ===========================================

export interface PdvProduct {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  pricePoints: number;
  priceMoney: number;
  stock: number;
  inStock: boolean;
}

export interface PdvCategory {
  name: string;
  products: PdvProduct[];
}

export interface PdvProductsResponse {
  pdvName: string;
  categories: PdvCategory[];
  totalProducts: number;
}

export interface PdvCheckoutItem {
  productId: string;
  quantity: number;
}

export interface PdvCheckoutResponse {
  code: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPricePoints: number;
    unitPriceMoney: number;
  }[];
  totalPoints: number;
  totalMoney: number;
  expiresAt: string;
  qrCodeData: unknown;
}

export interface PdvCheckoutStatus {
  code: string;
  status: string;
  pdvId: string;
  totalPoints: number;
  totalMoney: number;
  expiresAt: string;
  paidByUserId?: string;
  paymentMethod?: string;
  orderId?: string;
  orderCode?: string;
}

// ===========================================
// ERROR HANDLING
// ===========================================

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
// CLIENT FACTORY
// ===========================================

/**
 * Creates a configured Axios instance for PDV Display API calls.
 * Uses API Key authentication via custom headers instead of JWT.
 */
export function createPdvDisplayClient(
  apiKey: string,
  apiSecret: string
): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'x-pdv-api-key': apiKey,
      'x-pdv-api-secret': apiSecret,
    },
  });

  return client;
}

// ===========================================
// API FUNCTIONS
// ===========================================

/**
 * Fetches all available products for a PDV, grouped by category.
 */
export async function fetchProducts(
  client: AxiosInstance,
  pdvId: string
): Promise<PdvProductsResponse> {
  try {
    const response = await client.get(`/pdv/${pdvId}/products`);
    return response.data.data ?? response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar produtos do PDV');
  }
}

/**
 * Creates a new checkout session for a set of cart items.
 * Returns a checkout code and QR code data for mobile payment.
 */
export async function createCheckout(
  client: AxiosInstance,
  pdvId: string,
  items: PdvCheckoutItem[]
): Promise<PdvCheckoutResponse> {
  try {
    const response = await client.post(`/pdv/${pdvId}/checkout`, { items });
    return response.data.data ?? response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao criar checkout');
  }
}

/**
 * Retrieves the current status of an existing checkout by its code.
 */
export async function getCheckoutStatus(
  client: AxiosInstance,
  code: string
): Promise<PdvCheckoutStatus> {
  try {
    const response = await client.get(`/pdv/checkout/${code}/status`);
    return response.data.data ?? response.data;
  } catch (error) {
    throw extractApiError(error, 'Falha ao buscar status do checkout');
  }
}

/**
 * Cancels an active checkout session.
 */
export async function cancelCheckout(
  client: AxiosInstance,
  pdvId: string,
  code: string
): Promise<void> {
  try {
    await client.post(`/pdv/${pdvId}/checkout/${code}/cancel`);
  } catch (error) {
    throw extractApiError(error, 'Falha ao cancelar checkout');
  }
}
