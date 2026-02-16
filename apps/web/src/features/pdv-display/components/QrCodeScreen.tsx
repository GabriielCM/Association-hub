'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CartItem {
  productId: string;
  name: string;
  pricePoints: number;
  quantity: number;
}

interface QrCodeScreenProps {
  code: string;
  qrCodeData: unknown;
  expiresAt: string;
  totalPoints: number;
  totalMoney: number;
  items?: CartItem[];
  onCancel: () => void;
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

function computeRemainingSeconds(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Component — Split Screen QR Code
// ---------------------------------------------------------------------------

export function QrCodeScreen({
  code,
  qrCodeData,
  expiresAt,
  totalPoints,
  totalMoney,
  items = [],
  onCancel,
}: QrCodeScreenProps) {
  const [remaining, setRemaining] = useState(() =>
    computeRemainingSeconds(expiresAt),
  );

  const qrContent = useMemo(
    () => (typeof qrCodeData === 'string' ? qrCodeData : JSON.stringify(qrCodeData)),
    [qrCodeData],
  );

  const handleExpiry = useCallback(() => {
    onCancel();
  }, [onCancel]);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = computeRemainingSeconds(expiresAt);
      setRemaining(next);
      if (next <= 0) {
        clearInterval(interval);
        handleExpiry();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, handleExpiry]);

  const timerColor =
    remaining <= 30
      ? 'text-red-400'
      : remaining <= 60
        ? 'text-yellow-400'
        : 'text-dark-foreground';

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-background px-10 py-8">
      <div className="grid w-full max-w-5xl grid-cols-2 gap-12">
        {/* Left — QR Code */}
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">📱</span>
            <h2 className="text-center text-2xl font-bold text-dark-foreground">
              Escaneie o QR Code
            </h2>
            <p className="text-center text-base text-gray-400">
              Abra o app A-hub e escaneie para pagar
            </p>
          </div>

          {/* QR with pulsing glow */}
          <div className="animate-pulse-glow rounded-3xl bg-white p-8">
            <QRCodeSVG
              value={qrContent}
              size={280}
              level="M"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          {/* Checkout code */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-gray-500">Código do checkout</span>
            <span className="font-mono text-2xl font-bold tracking-widest text-dark-foreground">
              {code}
            </span>
          </div>
        </div>

        {/* Right — Summary + Timer */}
        <div className="flex flex-col justify-center gap-6">
          {/* Order summary glass card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h3 className="mb-4 text-lg font-semibold text-dark-foreground">
              Resumo do Pedido
            </h3>

            {items.length > 0 && (
              <ul className="mb-4 flex flex-col gap-2">
                {items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-300">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-medium text-gray-300">
                      {formatPoints(item.pricePoints * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-300">Total</span>
                <div className="flex flex-col items-end">
                  <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-xl font-bold text-transparent">
                    {formatPoints(totalPoints)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ou {formatMoney(totalMoney)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timer glass card */}
          <div className="flex flex-col items-center gap-2 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <span className="text-sm text-gray-500">Expira em</span>
            <span className={`font-mono text-5xl font-bold ${timerColor}`}>
              {formatCountdown(remaining)}
            </span>
          </div>

          {/* Cancel */}
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-semibold text-gray-400 backdrop-blur-xl active:bg-white/10"
            style={{ minHeight: 56 }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
