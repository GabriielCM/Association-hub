'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { usePdvDisplayStore } from '@/features/pdv-display/store/pdv-display.store';
import { createPdvDisplayClient, fetchProducts, createCheckout, cancelCheckout } from '@/features/pdv-display/api/pdv-display.api';
import { usePdvDisplayWebSocket } from '@/features/pdv-display/hooks/usePdvDisplayWebSocket';

import { PdvDisplayLayout } from '@/features/pdv-display/components/PdvDisplayLayout';
import { IdleScreen } from '@/features/pdv-display/components/IdleScreen';
import { CatalogScreen } from '@/features/pdv-display/components/CatalogScreen';
import { CartSidebar } from '@/features/pdv-display/components/CartSidebar';
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
  const {
    isConnected,
    onCheckoutPaid,
    onCheckoutExpired,
    onCheckoutCancelled,
    onCheckoutAwaitingPix,
    onCatalogUpdated,
  } = usePdvDisplayWebSocket(pdvId);

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

      fetchProducts(clientRef.current, pdvId).then((data) => {
        store.setPdvName(data.pdvName);
        store.setCategories(data.categories);
      }).catch(() => {
        localStorage.removeItem(`pdv-display-${pdvId}`);
        router.replace(`/display/pdv/${pdvId}/setup`);
      });
    } catch {
      router.replace(`/display/pdv/${pdvId}/setup`);
    }
  }, [pdvId]);

  // Register checkout event handlers via WebSocket hook callbacks
  useEffect(() => {
    onCheckoutPaid((data) => {
      if (store.checkoutCode === data.code) {
        store.setSuccess(data.orderCode || data.code);
      }
    });
    onCheckoutExpired((data) => {
      if (store.checkoutCode === data.code) {
        store.reset();
      }
    });
    onCheckoutCancelled((data) => {
      if (store.checkoutCode === data.code) {
        store.reset();
      }
    });
    onCheckoutAwaitingPix((data) => {
      if (store.checkoutCode === data.code) {
        store.setPixData(
          data.pixQrCode || null,
          data.pixCopyPaste || null,
          data.pixExpiresAt || null,
        );
        store.setScreen('awaiting_pix');
      }
    });
  }, [store.checkoutCode]);

  // Register catalog refresh handler
  useEffect(() => {
    onCatalogUpdated(() => {
      if (!clientRef.current || !pdvId) return;
      fetchProducts(clientRef.current, pdvId)
        .then((data) => {
          store.setPdvName(data.pdvName);
          store.setCategories(data.categories);
        })
        .catch((err) => console.error('Failed to refresh catalog:', err));
    });
  }, [pdvId]);

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

      const result = await createCheckout(clientRef.current, pdvId, items, store.paymentMethod);
      store.setCheckout(result.code, result.expiresAt, result.qrCodeData);
      store.setScreen('qrcode');
    } catch (err) {
      console.error('Checkout failed:', err);
    } finally {
      setCheckoutLoading(false);
    }
  }, [pdvId, store.cart, store.paymentMethod]);

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
      return;
    }
    store.reset();
  }, [store.screen]);

  const handleSuccessDone = useCallback(() => {
    store.reset();
  }, []);

  const cartTotal = store.cartTotal();

  return (
    <PdvDisplayLayout
      onIdle={handleIdle}
      idleTimeout={120}
    >
      {/* Idle */}
      {store.screen === 'idle' && (
        <div className="animate-fade-scale-in">
          <IdleScreen pdvName={store.pdvName} onStart={handleStart} />
        </div>
      )}

      {/* Catalog + Cart Sidebar */}
      {store.screen === 'catalog' && (
        <div className="flex h-screen animate-fade-scale-in">
          <div className="flex-1 overflow-hidden">
            <CatalogScreen
              categories={store.categories}
              onAddToCart={handleAddToCart}
              pdvName={store.pdvName}
              isConnected={isConnected}
            />
          </div>
          <CartSidebar
            items={store.cart}
            total={cartTotal}
            onUpdateQuantity={store.updateCartQuantity}
            onRemove={store.removeFromCart}
            onClear={store.clearCart}
            onCheckout={handleViewCart}
          />
        </div>
      )}

      {/* Cart / Payment method selection */}
      {store.screen === 'cart' && (
        <div className="animate-fade-scale-in">
          <CartScreen
            items={store.cart}
            total={cartTotal}
            onUpdateQuantity={store.updateCartQuantity}
            onRemove={store.removeFromCart}
            onBack={handleBackToCatalog}
            onCheckout={handleCheckout}
            isLoading={checkoutLoading}
            selectedPaymentMethod={store.paymentMethod}
            onSelectPaymentMethod={store.setPaymentMethod}
          />
        </div>
      )}

      {/* QR Code */}
      {store.screen === 'qrcode' && store.checkoutCode && (
        <div className="animate-fade-scale-in">
          <QrCodeScreen
            code={store.checkoutCode}
            qrCodeData={store.qrCodeData}
            expiresAt={store.checkoutExpiresAt || ''}
            totalPoints={cartTotal.points}
            totalMoney={cartTotal.money}
            items={store.cart}
            onCancel={handleCancelCheckout}
          />
        </div>
      )}

      {/* Awaiting PIX */}
      {store.screen === 'awaiting_pix' && store.checkoutCode && (
        <div className="animate-fade-scale-in">
          <AwaitingPixScreen
            code={store.checkoutCode}
            pixQrCode={store.pixQrCode}
            pixCopyPaste={store.pixCopyPaste}
            pixExpiresAt={store.pixExpiresAt}
            totalMoney={cartTotal.money}
            onCancel={handleCancelCheckout}
          />
        </div>
      )}

      {/* Success */}
      {store.screen === 'success' && (
        <div className="animate-fade-scale-in">
          <SuccessScreen
            orderCode={store.lastOrderCode || ''}
            onDone={handleSuccessDone}
          />
        </div>
      )}
    </PdvDisplayLayout>
  );
}
