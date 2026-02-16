'use client';

import { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AwaitingPixScreenProps {
  code: string;
  pixQrCode?: string | null;
  pixCopyPaste?: string | null;
  pixExpiresAt?: string | null;
  totalMoney?: number;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Component — Awaiting PIX with glassmorphism
// ---------------------------------------------------------------------------

export function AwaitingPixScreen({
  code,
  pixQrCode,
  pixCopyPaste,
  pixExpiresAt,
  totalMoney,
  onCancel,
}: AwaitingPixScreenProps) {
  const [countdown, setCountdown] = useState(0);
  const hasPixData = !!pixQrCode || !!pixCopyPaste;

  useEffect(() => {
    if (!pixExpiresAt) return;

    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(pixExpiresAt).getTime() - Date.now()) / 1000),
      );
      setCountdown(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [pixExpiresAt]);

  const timerColor =
    countdown < 30
      ? 'text-red-400'
      : countdown < 60
        ? 'text-yellow-400'
        : 'text-gray-300';

  // PIX QR available
  if (hasPixData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-dark-background px-6">
        <h2 className="mb-2 text-center text-3xl font-bold text-dark-foreground">
          Pague com PIX
        </h2>
        <p className="mb-6 text-center text-lg text-gray-400">
          Escaneie o QR Code abaixo com o app do seu banco
        </p>

        {/* Amount */}
        {totalMoney != null && totalMoney > 0 && (
          <div className="mb-6 rounded-2xl border border-secondary/30 bg-secondary/10 px-8 py-3 backdrop-blur-xl">
            <span className="text-2xl font-bold text-secondary">
              {formatMoney(totalMoney)}
            </span>
          </div>
        )}

        {/* QR Code */}
        <div className="mb-6 animate-pulse-glow rounded-3xl bg-white p-6">
          {pixQrCode ? (
            <img
              src={pixQrCode}
              alt="QR Code PIX"
              className="h-64 w-64"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="flex h-64 w-64 items-center justify-center">
              <span className="text-center text-sm text-gray-500">
                QR Code indisponível
              </span>
            </div>
          )}
        </div>

        {/* Copy & paste code */}
        {pixCopyPaste && (
          <div className="mb-6 flex max-w-md flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl">
            <span className="text-xs text-gray-500">Código Copia e Cola</span>
            <span className="break-all text-center font-mono text-xs text-gray-300">
              {pixCopyPaste.length > 60
                ? `${pixCopyPaste.substring(0, 60)}...`
                : pixCopyPaste}
            </span>
          </div>
        )}

        {/* Countdown */}
        {pixExpiresAt && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-sm text-gray-500">Expira em</span>
            <span className={`text-lg font-bold ${timerColor}`}>
              {formatTime(countdown)}
            </span>
          </div>
        )}

        {/* Waiting dots */}
        <div className="mb-8 flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 animate-bounce rounded-full bg-secondary"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="h-2.5 w-2.5 animate-bounce rounded-full bg-secondary"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="h-2.5 w-2.5 animate-bounce rounded-full bg-secondary"
            style={{ animationDelay: '300ms' }}
          />
          <span className="ml-2 text-sm text-gray-500">
            Aguardando pagamento...
          </span>
        </div>

        {/* Cancel */}
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-white/10 bg-white/5 px-12 py-4 text-lg font-semibold text-gray-400 backdrop-blur-xl active:bg-white/10"
          style={{ minHeight: 56 }}
        >
          Cancelar
        </button>
      </div>
    );
  }

  // No PIX data yet — waiting state
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark-background px-6">
      {/* Pulsing rings */}
      <div className="relative mb-10 flex items-center justify-center">
        <span className="absolute h-40 w-40 animate-ping rounded-full bg-secondary/10" />
        <span className="absolute h-28 w-28 animate-pulse rounded-full bg-secondary/20" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-secondary/30 backdrop-blur-xl">
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

      <h2 className="mb-2 text-center text-2xl font-semibold text-dark-foreground">
        Aguardando pagamento PIX...
      </h2>
      <p className="mb-8 text-center text-base text-gray-500">
        Complete o pagamento no seu app bancário
      </p>

      <div className="mb-10 flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-xl">
        <span className="text-xs text-gray-500">Código do checkout</span>
        <span className="font-mono text-2xl font-bold tracking-widest text-dark-foreground">
          {code}
        </span>
      </div>

      {/* Bouncing dots */}
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

      <button
        type="button"
        onClick={onCancel}
        className="rounded-2xl border border-white/10 bg-white/5 px-12 py-4 text-lg font-semibold text-gray-400 backdrop-blur-xl active:bg-white/10"
        style={{ minHeight: 56 }}
      >
        Cancelar
      </button>
    </div>
  );
}
