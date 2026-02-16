'use client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AwaitingPixScreenProps {
  code: string;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Minimalist waiting screen displayed while a PIX payment is being processed.
 *
 * Shows a pulsing animation, the checkout code for reference, and a cancel
 * action. Designed for kiosk/touch environments with large tap targets.
 */
export function AwaitingPixScreen({ code, onCancel }: AwaitingPixScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark-background px-6">
      {/* Pulsing rings animation */}
      <div className="relative mb-10 flex items-center justify-center">
        {/* Outer ring */}
        <span className="absolute h-40 w-40 animate-ping rounded-full bg-secondary/10" />
        {/* Middle ring */}
        <span className="absolute h-28 w-28 animate-pulse rounded-full bg-secondary/20" />
        {/* Inner circle with PIX icon */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-secondary/30">
          <svg
            className="h-10 w-10 text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
            />
          </svg>
        </div>
      </div>

      {/* Status text */}
      <h2 className="mb-2 text-center text-2xl font-semibold text-dark-foreground">
        Aguardando pagamento PIX...
      </h2>
      <p className="mb-8 text-center text-base text-gray-500">
        Complete o pagamento no seu app bancario
      </p>

      {/* Checkout code */}
      <div className="mb-10 flex flex-col items-center gap-1 rounded-lg bg-dark-surface px-8 py-4">
        <span className="text-xs text-gray-500">Codigo do checkout</span>
        <span className="font-mono text-2xl font-bold tracking-widest text-dark-foreground">
          {code}
        </span>
      </div>

      {/* Spinner dots */}
      <div className="mb-10 flex items-center gap-2">
        <span
          className="h-3 w-3 animate-bounce rounded-full bg-secondary"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="h-3 w-3 animate-bounce rounded-full bg-secondary"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="h-3 w-3 animate-bounce rounded-full bg-secondary"
          style={{ animationDelay: '300ms' }}
        />
      </div>

      {/* Cancel button */}
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border-2 border-dark-border px-12 py-4 text-lg font-semibold text-gray-400 active:bg-dark-muted"
        style={{ minHeight: 56 }}
      >
        Cancelar
      </button>
    </div>
  );
}
