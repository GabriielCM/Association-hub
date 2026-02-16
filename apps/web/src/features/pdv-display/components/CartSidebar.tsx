'use client';

import { useRef } from 'react';

interface CartItem {
  productId: string;
  name: string;
  imageUrl?: string;
  pricePoints: number;
  priceMoney: number;
  quantity: number;
}

interface CartTotal {
  points: number;
  money: number;
}

interface CartSidebarProps {
  items: CartItem[];
  total: CartTotal;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
  isLoading?: boolean;
}

function formatPoints(value: number): string {
  return `${value.toLocaleString('pt-BR')} pts`;
}

function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CartSidebar({
  items,
  total,
  onUpdateQuantity,
  onRemove,
  onClear,
  onCheckout,
  isLoading = false,
}: CartSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isEmpty = items.length === 0;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <aside
      ref={sidebarRef}
      data-cart-sidebar
      className="flex h-full w-[280px] flex-shrink-0 flex-col border-l border-white/10 bg-white/5 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <svg
          className="h-5 w-5 text-gray-400"
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
        <span className="text-sm font-semibold text-dark-foreground">
          Meu Pedido
        </span>
        {!isEmpty && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-xs font-bold text-white">
            {itemCount}
          </span>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <svg
              className="mb-3 h-10 w-10 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            <p className="text-sm text-gray-500">Adicione itens ao pedido</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <SidebarCartItem
                key={item.productId}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemove}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Footer: total + actions */}
      {!isEmpty && (
        <div className="border-t border-white/10 px-4 py-4">
          {/* Total */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-gray-400">Total</span>
            <div className="flex flex-col items-end">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-lg font-bold text-transparent">
                {formatPoints(total.points)}
              </span>
              <span className="text-xs text-gray-500">
                {formatMoney(total.money)}
              </span>
            </div>
          </div>

          {/* Checkout button */}
          <button
            type="button"
            onClick={onCheckout}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 py-4 text-sm font-bold text-white transition-all active:scale-[0.97] disabled:opacity-50"
            style={{ minHeight: 48 }}
          >
            {isLoading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processando...
              </>
            ) : (
              <>
                FINALIZAR
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </>
            )}
          </button>

          {/* Clear cart */}
          <button
            type="button"
            onClick={onClear}
            className="mt-2 w-full py-2 text-center text-xs text-gray-500 active:text-gray-300"
          >
            Limpar carrinho
          </button>
        </div>
      )}
    </aside>
  );
}

// ── Sidebar cart item sub-component ──────────────────────────────────────────

interface SidebarCartItemProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

function SidebarCartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: SidebarCartItemProps) {
  const linePoints = item.pricePoints * item.quantity;

  return (
    <li className="flex items-start gap-2 rounded-2xl bg-white/5 p-2">
      {/* Thumbnail */}
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-dark-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-4 w-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info + controls */}
      <div className="flex flex-1 flex-col gap-1">
        <span className="line-clamp-1 text-xs font-semibold text-dark-foreground">
          {item.name}
        </span>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                item.quantity <= 1
                  ? onRemove(item.productId)
                  : onUpdateQuantity(item.productId, item.quantity - 1)
              }
              className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-gray-300 active:bg-white/20"
              aria-label={`Diminuir ${item.name}`}
            >
              -
            </button>
            <span className="w-5 text-center text-xs font-bold text-dark-foreground">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateQuantity(item.productId, item.quantity + 1)
              }
              className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-gray-300 active:bg-white/20"
              aria-label={`Aumentar ${item.name}`}
            >
              +
            </button>
          </div>
          <span className="text-xs font-semibold text-primary-light">
            {formatPoints(linePoints)}
          </span>
        </div>
      </div>
    </li>
  );
}
