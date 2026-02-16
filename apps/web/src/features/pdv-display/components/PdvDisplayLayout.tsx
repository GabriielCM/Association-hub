'use client';

import { useEffect, useRef, useCallback, type ReactNode } from 'react';

interface PdvDisplayLayoutProps {
  children: ReactNode;
  isConnected: boolean;
  pdvName?: string | undefined;
  onIdle?: () => void;
  idleTimeout?: number;
}

/**
 * Full-screen wrapper layout for the PDV Display/Kiosk application.
 *
 * Provides:
 * - Dark themed full-screen container
 * - Connection status indicator (top-right)
 * - PDV name label (top-left)
 * - Idle timeout detection with configurable duration
 */
export function PdvDisplayLayout({
  children,
  isConnected,
  pdvName,
  onIdle,
  idleTimeout = 120,
}: PdvDisplayLayoutProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (!onIdle) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onIdle();
    }, idleTimeout * 1000);
  }, [onIdle, idleTimeout]);

  useEffect(() => {
    if (!onIdle) return;

    const interactionEvents = [
      'touchstart',
      'touchmove',
      'click',
      'pointerdown',
      'pointermove',
    ] as const;

    const handleInteraction = () => {
      resetIdleTimer();
    };

    // Start the idle timer immediately
    resetIdleTimer();

    for (const event of interactionEvents) {
      document.addEventListener(event, handleInteraction, { passive: true });
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      for (const event of interactionEvents) {
        document.removeEventListener(event, handleInteraction);
      }
    };
  }, [onIdle, resetIdleTimer]);

  return (
    <div className="relative flex min-h-screen flex-col bg-dark-background text-dark-foreground">
      {/* Header bar */}
      <div className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4">
        {/* PDV name */}
        {pdvName ? (
          <span className="text-sm font-medium tracking-wide text-gray-500">
            {pdvName}
          </span>
        ) : (
          <span />
        )}

        {/* Connection indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
          <span
            className={`inline-block h-3 w-3 rounded-full ${
              isConnected ? 'bg-success-dark' : 'bg-error-dark'
            }`}
            aria-label={isConnected ? 'Conectado' : 'Desconectado'}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
