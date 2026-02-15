import { useState, useEffect, useRef } from 'react';
import { YStack } from 'tamagui';
import { Text, Spinner } from '@ahub/ui';
import { getCart } from '../api/store.api';
import { get } from '@/services/api/client';
import type { Order } from '@ahub/shared/types';

interface PaymentStatusPollingProps {
  onConfirmed: (order: { orderId: string; orderCode: string }) => void;
  onTimeout: () => void;
}

const POLL_INTERVAL = 3000;
const MAX_POLL_TIME = 60000;

export function PaymentStatusPolling({
  onConfirmed,
  onTimeout,
}: PaymentStatusPollingProps) {
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(async () => {
      const now = Date.now();
      const elapsedMs = now - startTime.current;
      setElapsed(elapsedMs);

      if (elapsedMs >= MAX_POLL_TIME) {
        clearInterval(interval);
        onTimeout();
        return;
      }

      try {
        // Check if cart is empty (webhook processed the order)
        const cart = await getCart();
        if (cart.items.length === 0) {
          clearInterval(interval);
          // Get the most recent order
          try {
            const response = await get<{
              data: Order[];
            }>('/orders', { source: 'STORE', limit: 1 });
            if (response.data.length > 0) {
              const order = response.data[0]!;
              onConfirmed({ orderId: order.id, orderCode: order.code });
              return;
            }
          } catch {
            // If orders endpoint fails, still notify with minimal data
          }
          onConfirmed({ orderId: '', orderCode: '' });
        }
      } catch {
        // Ignore polling errors, will retry
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [onConfirmed, onTimeout]);

  const showSlow = elapsed > 15000;

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$6">
      <Spinner />
      <Text size="lg" weight="semibold">
        Processando pagamento...
      </Text>
      <Text size="sm" color="secondary" align="center">
        Aguarde a confirmação
      </Text>

      {showSlow && (
        <YStack gap="$2" alignItems="center">
          <Text size="xs" color="secondary">
            O pagamento pode demorar alguns instantes
          </Text>
        </YStack>
      )}
    </YStack>
  );
}
