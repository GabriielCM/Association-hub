import { create } from 'zustand';

// ===========================================
// TYPES
// ===========================================

export type PdvDisplayScreen =
  | 'idle'
  | 'catalog'
  | 'cart'
  | 'qrcode'
  | 'awaiting_pix'
  | 'success';

export interface Category {
  name: string;
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  pricePoints: number;
  priceMoney: number;
  stock: number;
  inStock: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  imageUrl?: string;
  pricePoints: number;
  priceMoney: number;
  quantity: number;
}

// ===========================================
// STATE INTERFACE
// ===========================================

export interface PdvDisplayState {
  // Screen state
  screen: PdvDisplayScreen;

  // Credentials
  apiKey: string | null;
  apiSecret: string | null;
  pdvId: string | null;
  pdvName: string | undefined;

  // Catalog
  categories: Category[];

  // Cart
  cart: CartItem[];

  // Checkout
  checkoutCode: string | null;
  checkoutExpiresAt: string | null;
  qrCodeData: unknown;

  // Success
  lastOrderCode: string | null;

  // Actions
  setCredentials: (apiKey: string, apiSecret: string, pdvId: string) => void;
  setPdvName: (name: string) => void;
  setCategories: (categories: Category[]) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setScreen: (screen: PdvDisplayScreen) => void;
  setCheckout: (code: string, expiresAt: string, qrCodeData: unknown) => void;
  setSuccess: (orderCode: string) => void;
  reset: () => void;

  // Computed
  cartTotal: () => { points: number; money: number };
  cartItemCount: () => number;
}

// ===========================================
// STORE
// ===========================================

export const usePdvDisplayStore = create<PdvDisplayState>((set, get) => ({
  // Initial state
  screen: 'idle',
  apiKey: null,
  apiSecret: null,
  pdvId: null,
  pdvName: undefined,
  categories: [],
  cart: [],
  checkoutCode: null,
  checkoutExpiresAt: null,
  qrCodeData: null,
  lastOrderCode: null,

  // Actions
  setCredentials: (apiKey: string, apiSecret: string, pdvId: string) => {
    set({ apiKey, apiSecret, pdvId });
  },

  setPdvName: (name: string) => {
    set({ pdvName: name });
  },

  setCategories: (categories: Category[]) => {
    set({ categories });
  },

  addToCart: (product: Product) => {
    const { cart } = get();
    const existing = cart.find((item) => item.productId === product.id);

    if (existing) {
      set({
        cart: cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        pricePoints: product.pricePoints,
        priceMoney: product.priceMoney,
        quantity: 1,
      };
      if (product.imageUrl) {
        newItem.imageUrl = product.imageUrl;
      }
      set({ cart: [...cart, newItem] });
    }
  },

  removeFromCart: (productId: string) => {
    const { cart } = get();
    set({ cart: cart.filter((item) => item.productId !== productId) });
  },

  updateCartQuantity: (productId: string, quantity: number) => {
    const { cart } = get();

    if (quantity <= 0) {
      set({ cart: cart.filter((item) => item.productId !== productId) });
      return;
    }

    set({
      cart: cart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    });
  },

  clearCart: () => {
    set({ cart: [] });
  },

  setScreen: (screen: PdvDisplayScreen) => {
    set({ screen });
  },

  setCheckout: (code: string, expiresAt: string, qrCodeData: unknown) => {
    set({
      checkoutCode: code,
      checkoutExpiresAt: expiresAt,
      qrCodeData,
    });
  },

  setSuccess: (orderCode: string) => {
    set({
      screen: 'success',
      lastOrderCode: orderCode,
    });
  },

  reset: () => {
    set({
      screen: 'idle',
      cart: [],
      checkoutCode: null,
      checkoutExpiresAt: null,
      qrCodeData: null,
      lastOrderCode: null,
    });
  },

  // Computed via getters
  cartTotal: () => {
    const { cart } = get();
    return cart.reduce(
      (totals, item) => ({
        points: totals.points + item.pricePoints * item.quantity,
        money: totals.money + item.priceMoney * item.quantity,
      }),
      { points: 0, money: 0 }
    );
  },

  cartItemCount: () => {
    const { cart } = get();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },
}));
