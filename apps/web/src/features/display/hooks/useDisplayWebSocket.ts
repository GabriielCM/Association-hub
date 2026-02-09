'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface QrCodeData {
  type: 'event_checkin';
  event_id: string;
  checkin_number: number;
  security_token: string;
  timestamp: number;
  expires_at: number;
}

interface DisplayEventData {
  event: {
    id: string;
    title: string;
    description: string;
    category: string;
    color: string;
    startDate: string;
    endDate: string;
    locationName: string;
    bannerDisplay: string[];
    pointsTotal: number;
    checkinsCount: number;
    checkinInterval: number;
    status: string;
    isPaused: boolean;
  };
  association: {
    name: string;
    logoUrl: string | null;
  };
  currentCheckin: {
    number: number;
    points: number;
  };
  qrCode: QrCodeData;
  stats: {
    totalCheckIns: number;
  };
}

interface UseDisplayWebSocketReturn {
  data: DisplayEventData | null;
  isConnected: boolean;
  error: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export function useDisplayWebSocket(
  eventId: string
): UseDisplayWebSocketReturn {
  const [data, setData] = useState<DisplayEventData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch display data via REST (fallback + initial load)
  const fetchDisplayData = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/display/${eventId}/data`
      );
      if (!response.ok) throw new Error('Failed to fetch display data');
      const result = await response.json();
      setData(result.data ?? result);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados do display');
    }
  }, [eventId]);

  // Start polling fallback
  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(fetchDisplayData, 30000);
  }, [fetchDisplayData]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Initial data load
    fetchDisplayData();

    // Connect WebSocket
    const socket = io(`${WS_URL}/ws/events`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      stopPolling();

      // Subscribe to event room
      socket.emit('subscribe', { event_id: eventId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      startPolling();
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
      startPolling();
    });

    // QR code rotation (every 1 minute)
    socket.on('qr_update', (qrData: QrCodeData) => {
      setData((prev) => (prev ? { ...prev, qrCode: qrData } : prev));
    });

    // Check-in number change (after interval)
    socket.on(
      'checkin_change',
      (payload: {
        event_id: string;
        checkin_number: number;
        points: number;
      }) => {
        setData((prev) =>
          prev
            ? {
                ...prev,
                currentCheckin: {
                  number: payload.checkin_number,
                  points: payload.points,
                },
              }
            : prev
        );
      }
    );

    // Counter update (new check-in registered)
    socket.on(
      'counter_update',
      (payload: {
        event_id: string;
        total: number;
        unique_users: number;
      }) => {
        setData((prev) =>
          prev
            ? {
                ...prev,
                stats: { totalCheckIns: payload.unique_users },
              }
            : prev
        );
      }
    );

    // Status change (pause, cancel, finish)
    socket.on(
      'status_change',
      (payload: {
        event_id: string;
        status: string;
        is_paused: boolean;
      }) => {
        setData((prev) =>
          prev
            ? {
                ...prev,
                event: {
                  ...prev.event,
                  status: payload.status,
                  isPaused: payload.is_paused,
                },
              }
            : prev
        );
      }
    );

    return () => {
      socket.emit('unsubscribe', { event_id: eventId });
      socket.disconnect();
      stopPolling();
    };
  }, [eventId, fetchDisplayData, startPolling, stopPolling]);

  return { data, isConnected, error };
}
