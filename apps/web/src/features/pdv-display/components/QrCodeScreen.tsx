'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QrCodeScreenProps {
  code: string;
  qrCodeData: unknown;
  expiresAt: string;
  totalPoints: number;
  totalMoney: number;
  onCancel: () => void;
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

/**
 * Computes the remaining seconds until `expiresAt`. Returns 0 if already
 * expired.
 */
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
// Component
// ---------------------------------------------------------------------------

/**
 * Displays a QR code for customers to scan with their mobile app to
 * complete a PDV purchase. Includes a countdown timer that auto-cancels
 * when it reaches zero.
 */
export function QrCodeScreen({
  code,
  qrCodeData,
  expiresAt,
  totalPoints,
  totalMoney,
  onCancel,
}: QrCodeScreenProps) {
  const [remaining, setRemaining] = useState(() =>
    computeRemainingSeconds(expiresAt)
  );

  // QR code content
  const qrContent = useMemo(
    () => JSON.stringify(qrCodeData),
    [qrCodeData]
  );

  // Auto-cancel when timer reaches 0
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

  // Timer colour shifts when urgency is high
  const isUrgent = remaining <= 30;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark-background px-6">
      {/* Instruction */}
      <p className="mb-6 text-center text-xl font-medium text-gray-300">
        Escaneie com o app A-hub
      </p>

      {/* QR code card */}
      <div className="flex flex-col items-center rounded-2xl bg-white p-8 shadow-2xl">
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
      <div className="mt-6 flex flex-col items-center gap-1">
        <span className="text-sm text-gray-500">Codigo do checkout</span>
        <span className="font-mono text-3xl font-bold tracking-widest text-dark-foreground">
          {code}
        </span>
      </div>

      {/* Order total */}
      <div className="mt-4 flex items-center gap-6">
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-lg font-bold text-primary-light">
            {formatPoints(totalPoints)}
          </span>
        </div>
        <div className="h-8 w-px bg-dark-border" />
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-500">ou</span>
          <span className="text-lg font-bold text-gray-300">
            {formatMoney(totalMoney)}
          </span>
        </div>
      </div>

      {/* Countdown timer */}
      <div className="mt-8 flex flex-col items-center gap-1">
        <span className="text-sm text-gray-500">Expira em</span>
        <span
          className={`font-mono text-4xl font-bold ${
            isUrgent ? 'text-error-dark' : 'text-dark-foreground'
          }`}
        >
          {formatCountdown(remaining)}
        </span>
      </div>

      {/* Cancel button */}
      <button
        type="button"
        onClick={onCancel}
        className="mt-10 rounded-lg border-2 border-dark-border px-12 py-4 text-lg font-semibold text-gray-400 active:bg-dark-muted"
        style={{ minHeight: 56 }}
      >
        Cancelar
      </button>
    </div>
  );
}
