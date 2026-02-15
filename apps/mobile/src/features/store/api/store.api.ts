import { get, post, patch, del } from '@/services/api/client';
import type {
  StoreCategory,
  StoreProduct,
  StoreProductListItem,
  StoreProductsResponse,
  StoreProductsFilter,
  ProductReview,
  FavoriteItem,
  Cart,
  CheckoutValidation,
  ProcessCheckoutResponse,
  OrderPaymentMethod,
} from '@ahub/shared/types';

// ===========================================
// CATEGORIES
// ===========================================

export async function getCategories(): Promise<StoreCategory[]> {
  return get<StoreCategory[]>('/store/categories');
}

export async function getCategoryBySlug(slug: string): Promise<StoreCategory> {
  return get<StoreCategory>(`/store/categories/${slug}`);
}

// ===========================================
// PRODUCTS
// ===========================================

export async function getProducts(
  filters?: StoreProductsFilter,
): Promise<StoreProductsResponse> {
  return get<StoreProductsResponse>('/store/products', filters);
}

export async function getFeaturedProducts(): Promise<StoreProductListItem[]> {
  return get<StoreProductListItem[]>('/store/products/featured');
}

export async function getPromotionalProducts(): Promise<StoreProductListItem[]> {
  return get<StoreProductListItem[]>('/store/products/promotional');
}

export async function getProductBySlug(slug: string): Promise<StoreProduct> {
  return get<StoreProduct>(`/store/products/${slug}`);
}

// ===========================================
// REVIEWS
// ===========================================

export async function getProductReviews(
  productId: string,
): Promise<ProductReview[]> {
  return get<ProductReview[]>(`/store/products/${productId}/reviews`);
}

export async function createReview(
  productId: string,
  data: { orderId: string; rating: number; comment?: string },
): Promise<ProductReview> {
  return post<ProductReview>(`/store/products/${productId}/reviews`, data);
}

// ===========================================
// FAVORITES
// ===========================================

export async function getFavorites(): Promise<FavoriteItem[]> {
  return get<FavoriteItem[]>('/store/favorites');
}

export async function toggleFavorite(
  productId: string,
): Promise<{ isFavorited: boolean }> {
  return post<{ isFavorited: boolean }>(
    `/store/favorites/${productId}/toggle`,
  );
}

export async function removeFavorite(productId: string): Promise<void> {
  return del<void>(`/store/favorites/${productId}`);
}

// ===========================================
// CART
// ===========================================

export async function getCart(): Promise<Cart> {
  return get<Cart>('/store/cart');
}

export async function addToCart(data: {
  productId: string;
  variantId?: string;
  quantity: number;
}): Promise<Cart> {
  return post<Cart>('/store/cart/items', data);
}

export async function updateCartItem(
  itemId: string,
  quantity: number,
): Promise<Cart> {
  return patch<Cart>(`/store/cart/items/${itemId}`, { quantity });
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  return del<Cart>(`/store/cart/items/${itemId}`);
}

export async function clearCart(): Promise<void> {
  return del<void>('/store/cart');
}

// ===========================================
// CHECKOUT
// ===========================================

export async function validateCheckout(
  subscriptionPlanId?: string,
): Promise<CheckoutValidation> {
  return post<CheckoutValidation>('/store/checkout/validate', {
    subscriptionPlanId,
  });
}

export async function processCheckout(data: {
  paymentMethod: OrderPaymentMethod;
  pointsToUse?: number;
}): Promise<ProcessCheckoutResponse> {
  return post<ProcessCheckoutResponse>('/store/checkout', data);
}
