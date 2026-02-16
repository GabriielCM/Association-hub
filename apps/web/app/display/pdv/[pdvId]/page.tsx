'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { usePdvDisplayStore } from '@/features/pdv-display/store/pdv-display.store';
import { createPdvDisplayClient, fetchProducts, createCheckout, cancelCheckout } from '@/features/pdv-display/api/pdv-display.api';
import { usePdvDisplayWebSocket } from '@/features/pdv-display/hooks/usePdvDisplayWebSocket';

import { PdvDisplayLayout } from '@/features/pdv-display/components/PdvDisplayLayout';
import { IdleScreen } from '@/features/pdv-display/components/IdleScreen';
import { CatalogScreen } from '@/features/pdv-display/components/CatalogScreen';
import { CartScreen } from '@/features/pdv-display/components/CartScreen';
import { QrCodeScreen } from '@/features/pdv-display/components/QrCodeScreen';
import { AwaitingPixScreen } from '@/features/pdv-display/components/AwaitingPixScreen';
import { SuccessScreen } from '@/features/pdv-display/components/SuccessScreen';

export default function PdvDisplayPage() {
  const { pdvId } = useParams<{ pdvId: string }>();
  const router = useRouter();
  const clientRef = useRef<ReturnType<typeof createPdvDisplayClient> | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const store = usePdvDisplayStore();
  const { isConnected } = usePdvDisplayWebSocket(pdvId);

  // Load credentials from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`pdv-display-${pdvId}`);
    if (!stored) {
      router.replace(`/display/pdv/${pdvId}/setup`);
      return;
    }

    try {
      const { apiKey, apiSecret } = JSON.parse(stored);
      store.setCredentials(apiKey, apiSecret, pdvId);
      clientRef.current = createPdvDisplayClient(apiKey, apiSecret);

      // Fetch products
      fetchProducts(clientRef.current, pdvId).then((data) => {
        store.setPdvName(data.pdvName);
        store.setCategories(data.categories);
      }).catch(() => {
        // Credentials may be invalid
        localStorage.removeItem(`pdv-display-${pdvId}`);
        router.replace(`/display/pdv/${pdvId}/setup`);
      });
    } catch {
      router.replace(`/display/pdv/${pdvId}/setup`);
    }
  }, [pdvId]);

  // The WebSocket hook updates the store directly - no additional subscription needed

  // Handle WebSocket checkout events
  useEffect(() => {
    if (!isConnected) return;

    const handleCheckoutPaid = (data: any) => {
      if (store.checkoutCode === data.code) {
        store.setSuccess(data.orderCode || data.code);
      }
    };

    const handleCheckoutExpired = (data: any) => {
      if (store.checkoutCode === data.code) {
        store.reset();
      }
    };

    const handleCheckoutCancelled = (data: any) => {
      if (store.checkoutCode === data.code) {
        store.reset();
      }
    };

    const handleAwaitingPix = (data: any) => {
      if (store.checkoutCode === data.code) {
        store.setScreen('awaiting_pix');
      }
    };

    // Store event handlers for the WS hook to call
    (window as any).__pdvWsHandlers = {
      onPaid: handleCheckoutPaid,
      onExpired: handleCheckoutExpired,
      onCancelled: handleCheckoutCancelled,
      onAwaitingPix: handleAwaitingPix,
    };

    return () => {
      delete (window as any).__pdvWsHandlers;
    };
  }, [isConnected, store.checkoutCode]);

  const handleStart = useCallback(() => {
    store.setScreen('catalog');
  }, []);

  const handleAddToCart = useCallback((product: any) => {
    store.addToCart(product);
  }, []);

  const handleViewCart = useCallback(() => {
    store.setScreen('cart');
  }, []);

  const handleBackToCatalog = useCallback(() => {
    store.setScreen('catalog');
  }, []);

  const handleCheckout = useCallback(async () => {
    if (!clientRef.current || !pdvId) return;
    setCheckoutLoading(true);

    try {
      const items = store.cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const result = await createCheckout(clientRef.current, pdvId, items);
      store.setCheckout(result.code, result.expiresAt, result.qrCodeData);
      store.setScreen('qrcode');
    } catch (err) {
      console.error('Checkout failed:', err);
    } finally {
      setCheckoutLoading(false);
    }
  }, [pdvId, store.cart]);

  const handleCancelCheckout = useCallback(async () => {
    if (!clientRef.current || !pdvId || !store.checkoutCode) return;

    try {
      await cancelCheckout(clientRef.current, pdvId, store.checkoutCode);
    } catch {
      // Ignore cancel errors
    }
    store.reset();
  }, [pdvId, store.checkoutCode]);

  const handleIdle = useCallback(() => {
    if (store.screen === 'qrcode' || store.screen === 'awaiting_pix') {
      // Don't interrupt checkout
      return;
    }
    store.reset();
  }, [store.screen]);

  const handleSuccessDone = useCallback(() => {
    store.reset();
  }, []);

  const cartTotal = store.cartTotal();
  const cartItemCount = store.cartItemCount();

  return (
    <PdvDisplayLayout
      isConnected={isConnected}
      pdvName={store.pdvName}
      onIdle={handleIdle}
      idleTimeout={120}
    >
      {store.screen === 'idle' && (
        <IdleScreen
          pdvName={store.pdvName}
          onStart={handleStart}
        />
      )}

      {store.screen === 'catalog' && (
        <CatalogScreen
          categories={store.categories}
          onAddToCart={handleAddToCart}
          cartItemCount={cartItemCount}
          cartTotal={cartTotal}
          onViewCart={handleViewCart}
        />
      )}

      {store.screen === 'cart' && (
        <CartScreen
          items={store.cart}
          total={cartTotal}
          onUpdateQuantity={store.updateCartQuantity}
          onRemove={store.removeFromCart}
          onBack={handleBackToCatalog}
          onCheckout={handleCheckout}
          isLoading={checkoutLoading}
        />
      )}

      {store.screen === 'qrcode' && store.checkoutCode && (
        <QrCodeScreen
          code={store.checkoutCode}
          qrCodeData={store.qrCodeData}
          expiresAt={store.checkoutExpiresAt || ''}
          totalPoints={cartTotal.points}
          totalMoney={cartTotal.money}
          onCancel={handleCancelCheckout}
        />
      )}

      {store.screen === 'awaiting_pix' && store.checkoutCode && (
        <AwaitingPixScreen
          code={store.checkoutCode}
          onCancel={handleCancelCheckout}
        />
      )}

      {store.screen === 'success' && (
        <SuccessScreen
          orderCode={store.lastOrderCode || ''}
          onDone={handleSuccessDone}
        />
      )}
    </PdvDisplayLayout>
  );
}
