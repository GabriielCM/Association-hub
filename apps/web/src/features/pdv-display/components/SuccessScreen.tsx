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
// Confetti colors
// ---------------------------------------------------------------------------

const CONFETTI_COLORS = [
  '#8B5CF6', '#3B82F6', '#22C55E', '#F59E0B', '#EC4899', '#06B6D4',
];

// ---------------------------------------------------------------------------
// Component — Success with CSS confetti + animated checkmark
// ---------------------------------------------------------------------------

export function SuccessScreen({ orderCode, onDone }: SuccessScreenProps) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onDone, 5000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-dark-background via-[#0a2f1e] to-[#064e3b] px-6">
      {/* CSS confetti animation */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-sm"
            style={{
              width: 8 + Math.random() * 8,
              height: 8 + Math.random() * 8,
              left: `${Math.random() * 100}%`,
              top: `-${10 + Math.random() * 20}%`,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              opacity: 0.8,
              animation: `confetti-fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s forwards`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center">
        {/* Checkmark circle */}
        <div className="mb-8 flex h-36 w-36 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-glow-purple backdrop-blur-xl">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30">
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
        <h1 className="mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-center text-4xl font-bold text-transparent">
          Compra confirmada!
        </h1>
        <p className="mb-8 text-center text-lg text-white/60">
          Obrigado pela sua compra
        </p>

        {/* Order code card */}
        <div className="mb-10 flex flex-col items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-10 py-5 backdrop-blur-xl">
          <span className="text-sm text-white/50">Código do pedido</span>
          <span className="font-mono text-3xl font-bold tracking-widest text-white">
            {orderCode}
          </span>
        </div>

        {/* Auto-redirect */}
        <p className="mb-4 text-sm text-white/40">
          Retornando automaticamente em 5 segundos...
        </p>

        {/* Manual dismiss */}
        <button
          type="button"
          onClick={onDone}
          className="rounded-2xl border border-white/10 bg-white/5 px-12 py-4 text-lg font-semibold text-white backdrop-blur-xl active:bg-white/10"
          style={{ minHeight: 56 }}
        >
          Concluir
        </button>
      </div>

      {/* Inline keyframes */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes checkmark-draw {
              0% { stroke-dashoffset: 40; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes confetti-fall {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
            }
          `,
        }}
      />
    </div>
  );
}
