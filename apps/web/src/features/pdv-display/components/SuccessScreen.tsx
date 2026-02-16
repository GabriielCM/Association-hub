'use client';

import { useEffect } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SuccessScreenProps {
  orderCode: string;
  onDone: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Payment success screen with a large CSS-only green checkmark, the order
 * code for reference, and a celebratory green gradient background.
 *
 * Auto-calls `onDone()` after 5 seconds to return the kiosk to its idle
 * or catalog state.
 */
export function SuccessScreen({ orderCode, onDone }: SuccessScreenProps) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] px-6">
      {/* Checkmark circle */}
      <div className="mb-8 flex h-36 w-36 items-center justify-center rounded-full bg-white/10 shadow-lg">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/20">
          {/* CSS-only animated checkmark */}
          <svg
            className="h-16 w-16 text-white"
            viewBox="0 0 52 52"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="26"
              cy="26"
              r="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="150.8"
              strokeDashoffset="0"
              className="opacity-30"
            />
            <path
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="40"
              strokeDashoffset="0"
              style={{
                animation: 'checkmark-draw 0.6s ease-in-out forwards',
              }}
            />
          </svg>
        </div>
      </div>

      {/* Success message */}
      <h1 className="mb-3 text-center text-4xl font-bold text-white">
        Compra confirmada!
      </h1>

      <p className="mb-8 text-center text-lg text-white/70">
        Obrigado pela sua compra
      </p>

      {/* Order code */}
      <div className="mb-10 flex flex-col items-center gap-2 rounded-xl bg-white/10 px-10 py-5 backdrop-blur-sm">
        <span className="text-sm text-white/60">Codigo do pedido</span>
        <span className="font-mono text-3xl font-bold tracking-widest text-white">
          {orderCode}
        </span>
      </div>

      {/* Auto-redirect notice */}
      <p className="text-sm text-white/50">
        Retornando automaticamente em 5 segundos...
      </p>

      {/* Done button (manual early dismiss) */}
      <button
        type="button"
        onClick={onDone}
        className="mt-6 rounded-lg bg-white/20 px-12 py-4 text-lg font-semibold text-white active:bg-white/30"
        style={{ minHeight: 56 }}
      >
        Concluir
      </button>

      {/* Inline keyframe for checkmark draw animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes checkmark-draw {
              0% { stroke-dashoffset: 40; }
              100% { stroke-dashoffset: 0; }
            }
          `,
        }}
      />
    </div>
  );
}
