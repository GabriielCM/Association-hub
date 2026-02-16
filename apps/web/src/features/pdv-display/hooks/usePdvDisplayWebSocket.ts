'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '@/config/constants';

// ===========================================
// TYPES
// ===========================================

export interface PdvCheckoutEventPayload {
  code: string;
  status: string;
  pdvId: string;
  paidByUserId?: string;
  paymentMethod?: string;
  orderId?: string;
  orderCode?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  pixExpiresAt?: string;
  totalMoney?: number;
}

export interface CatalogUpdatedPayload {
  pdvId: string;
  reason: string;
}

interface UsePdvDisplayWebSocketReturn {
  isConnected: boolean;
  lastEvent: PdvCheckoutEventPayload | null;
  onCheckoutPaid: (callback: (payload: PdvCheckoutEventPayload) => void) => void;
  onCheckoutExpired: (callback: (payload: PdvCheckoutEventPayload) => void) => void;
  onCheckoutCancelled: (callback: (payload: PdvCheckoutEventPayload) => void) => void;
  onCheckoutAwaitingPix: (callback: (payload: PdvCheckoutEventPayload) => void) => void;
  onCatalogUpdated: (callback: (payload: CatalogUpdatedPayload) => void) => void;
}

// ===========================================
// CONSTANTS
// ===========================================

const RECONNECTION_DELAY = 5000;

// ===========================================
// HOOK
// ===========================================

/**
 * React hook that connects to the PDV WebSocket namespace.
 * Manages real-time checkout event subscriptions for the PDV display.
 *
 * @param deviceId - The unique device ID for this PDV terminal. Pass null to disable connection.
 */
export function usePdvDisplayWebSocket(
  deviceId: string | null
): UsePdvDisplayWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<PdvCheckoutEventPayload | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Callback refs to avoid re-registering listeners on every render
  const onPaidRef = useRef<((payload: PdvCheckoutEventPayload) => void) | null>(null);
  const onExpiredRef = useRef<((payload: PdvCheckoutEventPayload) => void) | null>(null);
  const onCancelledRef = useRef<((payload: PdvCheckoutEventPayload) => void) | null>(null);
  const onAwaitingPixRef = useRef<((payload: PdvCheckoutEventPayload) => void) | null>(null);
  const onCatalogUpdatedRef = useRef<((payload: CatalogUpdatedPayload) => void) | null>(null);

  // Callback registration functions
  const onCheckoutPaid = useCallback(
    (callback: (payload: PdvCheckoutEventPayload) => void) => {
      onPaidRef.current = callback;
    },
    []
  );

  const onCheckoutExpired = useCallback(
    (callback: (payload: PdvCheckoutEventPayload) => void) => {
      onExpiredRef.current = callback;
    },
    []
  );

  const onCheckoutCancelled = useCallback(
    (callback: (payload: PdvCheckoutEventPayload) => void) => {
      onCancelledRef.current = callback;
    },
    []
  );

  const onCheckoutAwaitingPix = useCallback(
    (callback: (payload: PdvCheckoutEventPayload) => void) => {
      onAwaitingPixRef.current = callback;
    },
    []
  );

  const onCatalogUpdated = useCallback(
    (callback: (payload: CatalogUpdatedPayload) => void) => {
      onCatalogUpdatedRef.current = callback;
    },
    []
  );

  useEffect(() => {
    if (!deviceId) return;

    const socket = io(`${WS_URL}/ws/pdv`, {
      auth: { deviceId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: RECONNECTION_DELAY,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    // Checkout paid - member completed payment
    socket.on('checkout:paid', (payload: PdvCheckoutEventPayload) => {
      setLastEvent(payload);
      onPaidRef.current?.(payload);
    });

    // Checkout expired - timeout reached
    socket.on('checkout:expired', (payload: PdvCheckoutEventPayload) => {
      setLastEvent(payload);
      onExpiredRef.current?.(payload);
    });

    // Checkout cancelled - manually cancelled
    socket.on('checkout:cancelled', (payload: PdvCheckoutEventPayload) => {
      setLastEvent(payload);
      onCancelledRef.current?.(payload);
    });

    // Checkout awaiting PIX - member chose PIX payment
    socket.on('checkout:awaiting_pix', (payload: PdvCheckoutEventPayload) => {
      setLastEvent(payload);
      onAwaitingPixRef.current?.(payload);
    });

    // Generic status change
    socket.on('checkout:status_changed', (payload: PdvCheckoutEventPayload) => {
      setLastEvent(payload);
    });

    // Catalog updated - admin changed products
    socket.on('catalog:updated', (payload: CatalogUpdatedPayload) => {
      onCatalogUpdatedRef.current?.(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [deviceId]);

  return {
    isConnected,
    lastEvent,
    onCheckoutPaid,
    onCheckoutExpired,
    onCheckoutCancelled,
    onCheckoutAwaitingPix,
    onCatalogUpdated,
  };
}
