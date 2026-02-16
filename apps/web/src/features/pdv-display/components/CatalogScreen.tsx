'use client';

import { useState, useRef, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Product {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  pricePoints: number;
  priceMoney: number;
  inStock: boolean;
}

interface Category {
  name: string;
  products: Product[];
}

interface CartTotal {
  points: number;
  money: number;
}

interface CatalogScreenProps {
  categories: Category[];
  onAddToCart: (product: Product) => void;
  cartItemCount: number;
  cartTotal: CartTotal;
  onViewCart: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPoints(value: number): string {
  return `${value.toLocaleString('pt-BR')} pts`;
}

function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Product browsing screen with horizontal category tabs, a responsive product
 * grid, and a floating cart summary bar at the bottom.
 *
 * All interactive elements use large touch targets (min 48px) and avoid
 * hover-dependent interactions for kiosk/touch environments.
 */
export function CatalogScreen({
  categories,
  onAddToCart,
  cartItemCount,
  cartTotal,
  onViewCart,
}: CatalogScreenProps) {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);

  const activeCategory = categories[activeCategoryIndex] ?? categories[0];
  const products = activeCategory?.products ?? [];

  const handleCategoryChange = useCallback((index: number) => {
    setActiveCategoryIndex(index);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-dark-background">
      {/* ----------------------------------------------------------------- */}
      {/* Category tabs                                                     */}
      {/* ----------------------------------------------------------------- */}
      <div className="sticky top-0 z-40 border-b border-dark-border bg-dark-background/95 backdrop-blur-sm">
        <div
          ref={tabsRef}
          className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none"
          role="tablist"
          aria-label="Categorias de produtos"
        >
          {categories.map((cat, index) => {
            const isActive = index === activeCategoryIndex;
            return (
              <button
                key={cat.name}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${cat.name}`}
                onClick={() => handleCategoryChange(index)}
                className={`flex-shrink-0 rounded-pill px-6 py-3 text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-dark-surface text-gray-400 active:bg-dark-muted'
                }`}
                style={{ minHeight: 48, minWidth: 48 }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Product grid                                                      */}
      {/* ----------------------------------------------------------------- */}
      <div
        id={`panel-${activeCategory?.name}`}
        role="tabpanel"
        className={`flex-1 px-4 py-4 ${cartItemCount > 0 ? 'pb-28' : 'pb-4'}`}
      >
        {products.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <p className="text-lg text-gray-500">
              Nenhum produto nesta categoria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Floating cart bar                                                 */}
      {/* ----------------------------------------------------------------- */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-dark-border bg-dark-surface/95 px-4 py-3 backdrop-blur-sm">
          <button
            type="button"
            onClick={onViewCart}
            className="flex w-full items-center justify-between rounded-lg bg-primary px-6 py-4 text-white active:bg-primary-dark"
            style={{ minHeight: 56 }}
          >
            <div className="flex items-center gap-3">
              {/* Cart icon */}
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>

              {/* Item count badge */}
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                {cartItemCount}
              </span>
            </div>

            <span className="text-lg font-semibold">Ver Carrinho</span>

            <div className="flex flex-col items-end text-sm">
              <span>{formatPoints(cartTotal.points)}</span>
              <span className="text-white/70">{formatMoney(cartTotal.money)}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Product card sub-component
// ---------------------------------------------------------------------------

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

function ProductCard({ product, onAdd }: ProductCardProps) {
  const outOfStock = !product.inStock;

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-lg bg-dark-surface ${
        outOfStock ? 'opacity-60' : ''
      }`}
    >
      {/* Product image */}
      <div className="relative aspect-square w-full bg-dark-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-12 w-12 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
        )}

        {/* Out of stock badge */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-pill bg-error-dark px-4 py-1.5 text-sm font-bold text-white">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-dark-foreground">
          {product.name}
        </h3>

        <div className="mt-auto flex flex-col gap-0.5">
          <span className="text-base font-bold text-primary-light">
            {formatPoints(product.pricePoints)}
          </span>
          <span className="text-xs text-gray-500">
            {formatMoney(product.priceMoney)}
          </span>
        </div>

        <button
          type="button"
          disabled={outOfStock}
          onClick={() => onAdd(product)}
          className={`mt-1 w-full rounded-md py-3 text-sm font-semibold transition-colors ${
            outOfStock
              ? 'cursor-not-allowed bg-dark-muted text-gray-600'
              : 'bg-primary text-white active:bg-primary-dark'
          }`}
          style={{ minHeight: 48 }}
        >
          {outOfStock ? 'Esgotado' : 'Adicionar'}
        </button>
      </div>
    </div>
  );
}
