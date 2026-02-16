'use client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface CartScreenProps {
  items: CartItem[];
  total: CartTotal;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onBack: () => void;
  onCheckout: () => void;
  isLoading?: boolean;
  selectedPaymentMethod: 'POINTS' | 'PIX';
  onSelectPaymentMethod: (method: 'POINTS' | 'PIX') => void;
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

// ---------------------------------------------------------------------------
// Component — Payment confirmation screen (glassmorphism redesign)
// ---------------------------------------------------------------------------

export function CartScreen({
  items,
  total,
  onUpdateQuantity,
  onRemove,
  onBack,
  onCheckout,
  isLoading = false,
  selectedPaymentMethod,
  onSelectPaymentMethod,
}: CartScreenProps) {
  const isEmpty = items.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-dark-background">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-5">
        <h1 className="text-2xl font-bold text-dark-foreground">
          Finalizar Pedido
          {!isEmpty && (
            <span className="ml-2 text-base font-normal text-gray-500">
              ({items.length} {items.length === 1 ? 'item' : 'itens'})
            </span>
          )}
        </h1>
      </header>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg
              className="mb-4 h-16 w-16 text-gray-600"
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
            <p className="text-lg text-gray-500">Seu carrinho está vazio</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemove}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Bottom: summary + payment + actions */}
      <div className="border-t border-white/10 bg-white/5 px-6 py-5 backdrop-blur-xl">
        {/* Subtotal */}
        {!isEmpty && (
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg text-gray-400">Subtotal</span>
            <div className="flex flex-col items-end">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-xl font-bold text-transparent">
                {formatPoints(total.points)}
              </span>
              <span className="text-sm text-gray-500">
                {formatMoney(total.money)}
              </span>
            </div>
          </div>
        )}

        {/* Payment method selector */}
        {!isEmpty && (
          <div className="mb-5">
            <span className="mb-2 block text-sm text-gray-400">
              Forma de pagamento
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onSelectPaymentMethod('POINTS')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 py-3 text-base font-semibold transition-all ${
                  selectedPaymentMethod === 'POINTS'
                    ? 'border-purple-500 bg-purple-500/10 text-primary-light'
                    : 'border-white/10 text-gray-400 active:bg-white/10'
                }`}
                style={{ minHeight: 48 }}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
                Pontos
              </button>
              <button
                type="button"
                onClick={() => onSelectPaymentMethod('PIX')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 py-3 text-base font-semibold transition-all ${
                  selectedPaymentMethod === 'PIX'
                    ? 'border-secondary bg-secondary/10 text-secondary'
                    : 'border-white/10 text-gray-400 active:bg-white/10'
                }`}
                style={{ minHeight: 48 }}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                  />
                </svg>
                PIX
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 text-lg font-semibold text-gray-300 backdrop-blur-xl active:bg-white/10"
            style={{ minHeight: 56 }}
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={onCheckout}
            disabled={isEmpty || isLoading}
            className={`flex flex-[2] items-center justify-center gap-3 rounded-2xl py-4 text-lg font-bold text-white transition-all ${
              isEmpty || isLoading
                ? 'cursor-not-allowed bg-purple-500/30'
                : 'bg-gradient-to-r from-purple-600 to-blue-500 active:scale-[0.98]'
            }`}
            style={{ minHeight: 56 }}
          >
            {isLoading ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin"
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
              'Gerar QR Code'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CartItemRow
// ---------------------------------------------------------------------------

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const linePoints = item.pricePoints * item.quantity;
  const lineMoney = item.priceMoney * item.quantity;

  return (
    <li className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      {/* Thumbnail */}
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-dark-muted">
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
              className="h-6 w-6 text-gray-600"
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

      {/* Name + price */}
      <div className="flex flex-1 flex-col gap-1">
        <span className="line-clamp-1 text-sm font-semibold text-dark-foreground">
          {item.name}
        </span>
        <span className="text-sm text-primary-light">
          {formatPoints(linePoints)}
        </span>
        <span className="text-xs text-gray-500">{formatMoney(lineMoney)}</span>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() =>
            item.quantity <= 1
              ? onRemove(item.productId)
              : onUpdateQuantity(item.productId, item.quantity - 1)
          }
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl font-bold text-gray-300 active:bg-white/15"
          aria-label={`Diminuir quantidade de ${item.name}`}
          style={{ minHeight: 48, minWidth: 48 }}
        >
          -
        </button>
        <span className="w-8 text-center text-lg font-bold text-dark-foreground">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl font-bold text-gray-300 active:bg-white/15"
          aria-label={`Aumentar quantidade de ${item.name}`}
          style={{ minHeight: 48, minWidth: 48 }}
        >
          +
        </button>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(item.productId)}
        className="flex h-12 w-12 items-center justify-center rounded-2xl text-gray-500 active:bg-red-500/10 active:text-red-400"
        aria-label={`Remover ${item.name}`}
        style={{ minHeight: 48, minWidth: 48 }}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
      </button>
    </li>
  );
}
