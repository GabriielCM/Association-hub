'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { triggerFlyToCart } from './ui/fly-animation';

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

interface CatalogScreenProps {
  categories: Category[];
  onAddToCart: (product: Product) => void;
  pdvName?: string | undefined;
  isConnected?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPoints(value: number): string {
  return `${value.toLocaleString('pt-BR')} pts`;
}

function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Sort products: in-stock first, out-of-stock last */
function sortByStock(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    if (a.inStock === b.inStock) return 0;
    return a.inStock ? -1 : 1;
  });
}

// ---------------------------------------------------------------------------
// CatalogScreen
// ---------------------------------------------------------------------------

export function CatalogScreen({
  categories,
  onAddToCart,
  pdvName,
  isConnected = false,
}: CatalogScreenProps) {
  // -1 means "Todos" (show all products from all categories)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(-1);

  const activeCategory = activeCategoryIndex >= 0
    ? (categories[activeCategoryIndex] ?? null)
    : null;

  const allProducts = useMemo(
    () => sortByStock(categories.flatMap((c) => c.products)),
    [categories],
  );

  const products = useMemo(
    () =>
      activeCategoryIndex === -1
        ? allProducts
        : sortByStock(activeCategory?.products ?? []),
    [activeCategoryIndex, allProducts, activeCategory],
  );

  const handleCategoryChange = useCallback((index: number) => {
    setActiveCategoryIndex(index);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-dark-background">
      {/* Header: PDV info + Category tabs */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-dark-background/80 backdrop-blur-sm">
        {/* PDV name + connection status */}
        {(pdvName || isConnected !== undefined) && (
          <div className="flex items-center justify-between px-6 pt-3 pb-1">
            <span className="text-sm font-medium tracking-wide text-gray-500">
              {pdvName ?? ''}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  isConnected ? 'bg-success-dark' : 'bg-error-dark'
                }`}
                aria-label={isConnected ? 'Conectado' : 'Desconectado'}
              />
            </div>
          </div>
        )}
        <div
          className="flex gap-3 overflow-x-auto px-6 py-4"
          style={{ scrollbarWidth: 'none' }}
          role="tablist"
          aria-label="Categorias de produtos"
        >
          {/* "Todos" tab */}
          <button
            type="button"
            role="tab"
            aria-selected={activeCategoryIndex === -1}
            aria-controls="panel-todos"
            onClick={() => handleCategoryChange(-1)}
            className={`flex-shrink-0 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 ${
              activeCategoryIndex === -1
                ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                : 'border border-white/10 bg-white/5 text-gray-400 active:bg-white/10'
            }`}
            style={{ minHeight: 48 }}
          >
            Todos
          </button>
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
                className={`flex-shrink-0 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                    : 'border border-white/10 bg-white/5 text-gray-400 active:bg-white/10'
                }`}
                style={{ minHeight: 48 }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product grid with scroll snap */}
      <div
        id={activeCategoryIndex === -1 ? 'panel-todos' : `panel-${activeCategory?.name}`}
        role="tabpanel"
        className="flex-1 overflow-y-auto px-6 py-5"
        style={{
          scrollSnapType: 'y proximity',
          scrollbarWidth: 'none',
        }}
      >
        {products.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <p className="text-lg text-gray-500">
              Nenhum produto nesta categoria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProductCard
// ---------------------------------------------------------------------------

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

function ProductCard({ product, onAdd }: ProductCardProps) {
  const outOfStock = !product.inStock;
  const imageRef = useRef<HTMLDivElement>(null);

  const handleAdd = useCallback(() => {
    if (outOfStock) return;
    onAdd(product);

    // Trigger fly animation to sidebar
    const sidebar = document.querySelector('[data-cart-sidebar]');
    if (imageRef.current && sidebar) {
      triggerFlyToCart(imageRef.current, sidebar as HTMLElement);
    }
  }, [product, onAdd, outOfStock]);

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-glass transition-transform duration-150 ${
        outOfStock ? 'opacity-50' : 'active:scale-[0.98]'
      }`}
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Product image */}
      <div
        ref={imageRef}
        className="relative aspect-square w-full overflow-hidden bg-dark-muted"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`h-full w-full object-cover ${outOfStock ? 'grayscale' : ''}`}
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

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-full bg-red-500/80 px-4 py-1.5 text-sm font-bold text-white">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-dark-foreground">
          {product.name}
        </h3>

        {product.description && (
          <p className="line-clamp-1 text-sm text-gray-400">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-0.5 pt-1">
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-lg font-bold text-transparent">
            {formatPoints(product.pricePoints)}
          </span>
          <span className="text-xs text-gray-500">
            {formatMoney(product.priceMoney)}
          </span>
        </div>

        <button
          type="button"
          disabled={outOfStock}
          onClick={handleAdd}
          className={`mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all ${
            outOfStock
              ? 'cursor-not-allowed bg-dark-muted text-gray-600'
              : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white active:scale-[0.97]'
          }`}
          style={{ minHeight: 48 }}
        >
          {outOfStock ? (
            'Indisponivel'
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              Adicionar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
