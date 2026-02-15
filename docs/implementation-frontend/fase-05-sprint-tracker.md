# Fase 5: Sprint Tracker

## Status Geral

| Sprint | Descricao | Status | Arquivos |
|--------|-----------|--------|----------|
| 1 | Shared Types + Mobile Store Catalogo | COMPLETO | ~28 |
| 2 | Mobile Store Carrinho + Checkout | PENDENTE | ~15 |
| 3 | Mobile PDV PIX | PENDENTE | ~16 |
| 4 | Mobile Pedidos | PENDENTE | ~19 |
| 5 | Web Kiosk PDV | PENDENTE | ~14 |
| 6 | Web Admin Loja + PDV | PENDENTE | ~36 |
| 7 | Web Admin Pedidos | PENDENTE | ~19 |

---

## Sprint 1: Shared Types + Mobile Store Catalogo

### Arquivos Criados
- [x] `packages/shared/src/types/index.ts` (MODIFICADO - adicionado Store, Cart, Order types)
- [x] `apps/mobile/src/features/store/api/store.api.ts`
- [x] `apps/mobile/src/features/store/hooks/useCategories.ts`
- [x] `apps/mobile/src/features/store/hooks/useProducts.ts`
- [x] `apps/mobile/src/features/store/hooks/useProduct.ts`
- [x] `apps/mobile/src/features/store/hooks/useFavorites.ts`
- [x] `apps/mobile/src/features/store/hooks/useReviews.ts`
- [x] `apps/mobile/src/features/store/components/CategoryCarousel.tsx`
- [x] `apps/mobile/src/features/store/components/ProductCard.tsx`
- [x] `apps/mobile/src/features/store/components/ProductTypeBadge.tsx`
- [x] `apps/mobile/src/features/store/components/ProductGallery.tsx`
- [x] `apps/mobile/src/features/store/components/VariantPicker.tsx`
- [x] `apps/mobile/src/features/store/components/ReviewStars.tsx`
- [x] `apps/mobile/src/features/store/components/FavoriteButton.tsx`
- [x] `apps/mobile/app/store/_layout.tsx`
- [x] `apps/mobile/app/store/category/[slug].tsx`
- [x] `apps/mobile/app/store/product/[slug].tsx`
- [x] `apps/mobile/app/(tabs)/loja.tsx` (MODIFICADO - substituido placeholder)

### Endpoints Usados (Sprint 1)
| Metodo | Endpoint | Uso |
|--------|----------|-----|
| GET | `/store/categories` | Listar categorias ativas |
| GET | `/store/products` | Listar produtos (paginacao, filtros) |
| GET | `/store/products/:slug` | Detalhe produto por slug |
| GET | `/store/products/:product_id/reviews` | Avaliacoes do produto |
| GET | `/store/favorites` | Listar favoritos |
| POST | `/store/favorites` | Adicionar favorito (body: { product_id }) |
| DELETE | `/store/favorites/:product_id` | Remover favorito |

---

## Sprint 2: Mobile Store Carrinho + Checkout

### Arquivos a Criar
- [ ] `apps/mobile/src/features/store/hooks/useCart.ts`
- [ ] `apps/mobile/src/features/store/hooks/useCheckout.ts`
- [ ] `apps/mobile/src/features/store/components/QuantityControl.tsx`
- [ ] `apps/mobile/src/features/store/components/CartItem.tsx`
- [ ] `apps/mobile/src/features/store/components/CartSummary.tsx`
- [ ] `apps/mobile/src/features/store/components/CartExpirationTimer.tsx`
- [ ] `apps/mobile/src/features/store/components/PaymentOptions.tsx`
- [ ] `apps/mobile/src/features/store/components/MixedPaymentSlider.tsx`
- [ ] `apps/mobile/src/features/store/components/BiometricConfirm.tsx`
- [ ] `apps/mobile/src/features/store/components/PIXQRCode.tsx`
- [ ] `apps/mobile/src/features/store/components/PaymentStatusPolling.tsx`
- [ ] `apps/mobile/app/store/cart.tsx`
- [ ] `apps/mobile/app/store/checkout.tsx`
- [ ] `apps/mobile/app/store/payment.tsx`
- [ ] `apps/mobile/app/store/confirmation.tsx`

### Endpoints Usados (Sprint 2)
| Metodo | Endpoint | Uso |
|--------|----------|-----|
| GET | `/store/cart` | Ver carrinho |
| POST | `/store/cart/items` | Adicionar item |
| PATCH | `/store/cart/items/:item_id` | Atualizar quantidade |
| DELETE | `/store/cart/items/:item_id` | Remover item |
| DELETE | `/store/cart` | Limpar carrinho |
| POST | `/store/checkout/validate` | Validar antes do pagamento |
| POST | `/store/checkout` | Processar checkout |
| POST | `/store/checkout/stripe-intent` | Criar PaymentIntent (PIX) |
| POST | `/store/products/:product_id/reviews` | Criar avaliacao |

---

## Sprint 3: Mobile PDV PIX

### Arquivos a Criar/Modificar
- [ ] `apps/mobile/src/features/wallet/api/wallet.api.ts` (MODIFICAR - add PIX endpoints)
- [ ] `apps/mobile/src/features/pdv/hooks/usePDVCheckout.ts`
- [ ] `apps/mobile/src/features/pdv/hooks/usePDVPayPoints.ts`
- [ ] `apps/mobile/src/features/pdv/hooks/usePDVPayPix.ts`
- [ ] `apps/mobile/src/features/pdv/hooks/usePDVPixStatus.ts`
- [ ] `apps/mobile/src/features/pdv/hooks/usePDVCancel.ts`
- [ ] `apps/mobile/src/features/pdv/components/PDVCheckoutDetail.tsx`
- [ ] `apps/mobile/src/features/pdv/components/PDVPaymentMethodSelect.tsx`
- [ ] `apps/mobile/src/features/pdv/components/PDVPaymentConfirm.tsx`
- [ ] `apps/mobile/src/features/pdv/components/PDVPaymentPIX.tsx`
- [ ] `apps/mobile/src/features/pdv/components/PDVPixStatus.tsx`
- [ ] `apps/mobile/src/features/pdv/components/PDVPaymentSuccess.tsx`
- [ ] `apps/mobile/src/features/pdv/components/PDVPaymentCancelled.tsx`
- [ ] `apps/mobile/app/pdv/_layout.tsx`
- [ ] `apps/mobile/app/pdv/checkout/[code].tsx`
- [ ] `apps/mobile/app/pdv/payment/[code].tsx`

### Endpoints Usados (Sprint 3)
| Metodo | Endpoint | Autenticacao |
|--------|----------|-------------|
| GET | `/wallet/pdv/checkout/:code` | JWT |
| POST | `/wallet/pdv/checkout/:code/pay` | JWT + biometric_token |
| POST | `/wallet/pdv/checkout/:code/pix` | JWT |
| GET | `/wallet/pdv/checkout/:code/pix/status` | JWT |
| POST | `/wallet/pdv/checkout/:code/cancel` | JWT |

---

## Sprint 4: Mobile Pedidos

### Endpoints Usados
| Metodo | Endpoint |
|--------|----------|
| GET | `/orders` |
| GET | `/orders/:id` |
| GET | `/orders/:id/receipt` |
| GET | `/orders/:order_id/vouchers` |
| GET | `/orders/:order_id/vouchers/:voucher_id` |

---

## Sprint 5: Web Kiosk PDV

### Endpoints Usados (API Key auth)
| Metodo | Endpoint |
|--------|----------|
| GET | `/pdv/:id/products` |
| POST | `/pdv/:id/checkout` |
| GET | `/pdv/checkout/:code/status` |
| POST | `/pdv/:id/checkout/:code/cancel` |

---

## Sprint 6: Web Admin Loja + PDV

### Endpoints Admin Loja
20+ endpoints em `/admin/store/*`

### Endpoints Admin PDV
9 endpoints em `/admin/pdv/*`

---

## Sprint 7: Web Admin Pedidos

### Endpoints Admin Pedidos
10 endpoints em `/admin/orders/*` e `/admin/reports/orders/*`

---

## Regras de Negocio Chave

- **PDV:** APENAS pontos OU PIX (nunca misto). Checkout 5min. Stock NAO reservado.
- **Loja:** Pontos, PIX ou Misto. Carrinho reserva stock 30min. Produtos por slug.
- **Biometria:** Obrigatoria para pagamento com pontos (Loja e PDV).
- **Cashback:** Apenas em pagamentos PIX/dinheiro.
- **Pedidos:** Unificados (source: store|pdv). Status: pending->confirmed->ready->completed.
