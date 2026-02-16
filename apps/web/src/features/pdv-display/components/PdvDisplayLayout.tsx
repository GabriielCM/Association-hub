'use client';

import { useEffect, useRef, useCallback, type ReactNode } from 'react';

interface PdvDisplayLayoutProps {
  children: ReactNode;
  onIdle?: () => void;
  idleTimeout?: number;
}

/**
 * Full-screen wrapper layout for the PDV Display/Kiosk application.
 *
 * Provides:
 * - Dark themed full-screen container
 * - Idle timeout detection with configurable duration
 */
export function PdvDisplayLayout({
  children,
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
      {/* Main content */}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
