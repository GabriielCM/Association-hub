---
module: implementation
document: phase-05-status
status: completed
priority: mvp
last_updated: 2026-02-05
---

# Fase 5 - Transacoes (PDV + Loja)

## Status Geral

| Componente | Status | Progresso |
|------------|--------|-----------|
| Schema Prisma (PDV) | Completo | 100% |
| Schema Prisma (Store) | Completo | 100% |
| Schema Prisma (Orders) | Completo | 100% |
| Stripe Module | Completo | 100% |
| PDV Module | Completo | 100% |
| Store Module | Completo | 100% |
| Orders Module | Completo | 100% |
| Integracoes (Points, Notifications) | Completo | 100% |
| Testes Unitarios | Completo | 95%+ |

---

## 1. Alteracoes no Schema Prisma

### Modelos PDV (Ponto de Venda)

| Modelo | Descricao | Campos Principais |
|--------|-----------|-------------------|
| `Pdv` | Ponto de venda | name, location, apiKey, apiSecret, status, displayConfig |
| `PdvProduct` | Produto do PDV | name, pricePoints, priceMoney, stock, category |
| `PdvCheckout` | Sessao de checkout | code, items, totalPoints, totalMoney, status, expiresAt |
| `PdvSale` | Venda confirmada | userId, paymentMethod, totalPoints, totalMoney, cashbackEarned |

### Modelos Store (Loja Online)

| Modelo | Descricao | Campos Principais |
|--------|-----------|-------------------|
| `StoreCategory` | Categoria de produtos | name, slug, imageUrl, parentId |
| `StoreProduct` | Produto | name, slug, type, pricePoints, priceMoney, paymentOptions |
| `ProductVariant` | Variacao de produto | name, sku, pricePoints, priceMoney, stockCount |
| `ProductImage` | Imagem do produto | url, alt, displayOrder |
| `ProductSpecification` | Especificacoes | key, value |
| `Cart` | Carrinho | userId, subtotalPoints, subtotalMoney, reservedUntil |
| `CartItem` | Item do carrinho | productId, variantId, quantity, unitPricePoints, unitPriceMoney |
| `ProductFavorite` | Favoritos | userId, productId |
| `ProductReview` | Avaliacoes | userId, productId, rating, title, content, status |

### Modelos Orders (Pedidos Unificado)

| Modelo | Descricao | Campos Principais |
|--------|-----------|-------------------|
| `Order` | Pedido | code, source, status, paymentMethod, pointsUsed, moneyPaid |
| `OrderItem` | Item do pedido | productName, quantity, unitPricePoints, unitPriceMoney, voucherCode |
| `OrderStatusHistory` | Historico de status | status, changedBy, changedByName, notes |
| `OrderReceipt` | Comprovante | receiptNumber, data |

### Novos Enums

| Enum | Valores |
|------|---------|
| `PdvStatus` | ACTIVE, INACTIVE, MAINTENANCE |
| `PdvCheckoutStatus` | PENDING, AWAITING_PIX, PAID, EXPIRED, CANCELLED |
| `PdvPaymentMethod` | POINTS, PIX |
| `ProductType` | PHYSICAL, VOUCHER, SERVICE |
| `PaymentOptions` | POINTS_ONLY, MONEY_ONLY, BOTH |
| `OrderSource` | STORE, PDV |
| `OrderStatus` | PENDING, CONFIRMED, READY, COMPLETED, CANCELLED |
| `OrderPaymentMethod` | POINTS, MONEY, MIXED |
| `ReviewStatus` | PENDING, APPROVED, REJECTED |

---

## 2. Modulo Stripe

### Servico Principal (`stripe.service.ts`)

| Metodo | Descricao |
|--------|-----------|
| `createPixPayment()` | Cria PaymentIntent para PIX |
| `createCardPayment()` | Cria PaymentIntent para cartao |
| `getPaymentIntent()` | Recupera PaymentIntent |
| `cancelPaymentIntent()` | Cancela PaymentIntent |
| `createRefund()` | Cria estorno |
| `constructWebhookEvent()` | Valida signature do webhook |
| `getPixDetailsFromPaymentIntent()` | Extrai QR code PIX |

### Webhook Controller

Eventos tratados:
- `payment_intent.succeeded` - Confirma pagamento PDV/Loja
- `payment_intent.payment_failed` - Cancela checkout
- `charge.refunded` - Processa estorno

---

## 3. Modulo PDV

### Endpoints Display (API Key Auth)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/pdv/:id/products` | Catalogo de produtos |
| POST | `/pdv/:id/checkout` | Criar checkout (gera QR) |
| GET | `/pdv/checkout/:code/status` | Polling de status |
| POST | `/pdv/:id/checkout/:code/cancel` | Cancelar checkout |

### Endpoints Wallet (JWT Auth)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/wallet/pdv/checkout/:code` | Detalhes do checkout |
| POST | `/wallet/pdv/checkout/:code/pay` | Pagar com pontos |
| POST | `/wallet/pdv/checkout/:code/pix` | Iniciar PIX |

### Endpoints Admin

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/admin/pdv` | Listar PDVs |
| POST | `/admin/pdv` | Criar PDV |
| GET | `/admin/pdv/:id` | Detalhes do PDV |
| PUT | `/admin/pdv/:id` | Atualizar PDV |
| DELETE | `/admin/pdv/:id` | Desativar PDV |
| POST | `/admin/pdv/:id/regenerate-credentials` | Regenerar API Keys |
| GET | `/admin/pdv/:id/products` | Listar produtos |
| POST | `/admin/pdv/:id/products` | Adicionar produto |
| PUT | `/admin/pdv/products/:productId` | Atualizar produto |
| DELETE | `/admin/pdv/products/:productId` | Remover produto |
| PUT | `/admin/pdv/:id/stock` | Atualizar estoque |
| GET | `/admin/pdv/:id/stock` | Ver estoque |
| GET | `/admin/pdv/:id/sales` | Relatorio de vendas |

### Funcionalidades

- Autenticacao por API Key/Secret para displays
- Checkouts com TTL de 5 minutos
- QR Code para escanear com app
- Pagamento APENAS pontos OU PIX (nunca misto)
- Cashback configuravel
- Relatorios de vendas

---

## 4. Modulo Store

### Endpoints Publicos

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/store/categories` | Listar categorias |
| GET | `/store/products` | Listar produtos (com filtros) |
| GET | `/store/products/:slug` | Detalhes do produto |
| GET | `/store/products/:slug/reviews` | Reviews do produto |

### Endpoints Usuario (JWT)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/store/cart` | Ver carrinho |
| POST | `/store/cart/items` | Adicionar item |
| PATCH | `/store/cart/items/:itemId` | Atualizar quantidade |
| DELETE | `/store/cart/items/:itemId` | Remover item |
| DELETE | `/store/cart` | Limpar carrinho |
| POST | `/store/checkout/validate` | Validar carrinho |
| POST | `/store/checkout` | Processar checkout |
| GET | `/store/favorites` | Listar favoritos |
| GET | `/store/favorites/:productId/check` | Verificar favorito |
| POST | `/store/favorites/:productId` | Adicionar favorito |
| DELETE | `/store/favorites/:productId` | Remover favorito |
| POST | `/store/favorites/:productId/toggle` | Alternar favorito |
| POST | `/store/products/:productId/reviews` | Criar review |

### Endpoints Admin

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/admin/store/categories` | Listar categorias |
| POST | `/admin/store/categories` | Criar categoria |
| PUT | `/admin/store/categories/:id` | Atualizar categoria |
| DELETE | `/admin/store/categories/:id` | Remover categoria |
| GET | `/admin/store/products` | Listar produtos |
| POST | `/admin/store/products` | Criar produto |
| PUT | `/admin/store/products/:id` | Atualizar produto |
| DELETE | `/admin/store/products/:id` | Remover produto |
| POST | `/admin/store/products/:id/variants` | Adicionar variante |
| PUT | `/admin/store/products/:id/variants/:variantId` | Atualizar variante |
| DELETE | `/admin/store/products/:id/variants/:variantId` | Remover variante |
| GET | `/admin/store/reviews` | Listar reviews |
| PATCH | `/admin/store/reviews/:id/moderate` | Moderar review |

### Funcionalidades

- Categorias hierarquicas
- Produtos com tipos (PHYSICAL, VOUCHER, SERVICE)
- Variantes de produtos (tamanho, cor, etc.)
- Carrinho com reserva de estoque (30 min)
- Checkout com pagamento misto (pontos + dinheiro)
- Sistema de favoritos
- Reviews com moderacao

---

## 5. Modulo Orders

### Endpoints Usuario

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/orders` | Listar pedidos |
| GET | `/orders/:id` | Detalhes do pedido |
| GET | `/orders/:id/receipt` | Comprovante |
| GET | `/orders/:id/vouchers` | Vouchers do pedido |
| GET | `/orders/vouchers` | Todos os vouchers |

### Endpoints Admin

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/admin/orders` | Listar todos pedidos |
| PATCH | `/admin/orders/:id/status` | Atualizar status |
| POST | `/admin/orders/:id/cancel` | Cancelar pedido |
| POST | `/admin/orders/:id/complete` | Marcar como entregue |
| POST | `/admin/orders/pickup/validate` | Validar QR retirada |

### Funcionalidades

- Sistema unificado para PDV e Loja
- Status flow: PENDING -> CONFIRMED -> READY -> COMPLETED
- Historico de mudancas de status
- QR Code para retirada
- Comprovantes gerados automaticamente
- Sistema de vouchers com validade
- Estornos com reembolso de pontos

---

## 6. Integracoes

### PointsService

```typescript
// Debito para compras
pointsService.debitPoints(userId, amount, 'PDV_PURCHASE', desc, metadata, sourceId);
pointsService.debitPoints(userId, amount, 'SHOP_PURCHASE', desc, metadata, sourceId);

// Credito de cashback
pointsService.creditPoints(userId, cashback, 'PDV_CASHBACK', desc, metadata, sourceId);
pointsService.creditPoints(userId, cashback, 'SHOP_CASHBACK', desc, metadata, sourceId);

// Estorno
pointsService.creditPoints(userId, amount, 'REFUND', desc, metadata, orderId);
```

### NotificationsService

Triggers implementados:
- Pedido confirmado
- Pedido em preparacao
- Pedido pronto para retirada
- Pedido entregue
- Pedido cancelado
- Cashback creditado

### StripeService

- PaymentIntent para PIX
- PaymentIntent para cartao
- Webhooks para confirmacao
- Estornos automaticos

---

## 7. Estrutura de Arquivos

### Modulo Stripe

```
apps/api/src/modules/stripe/
├── stripe.module.ts
├── stripe.service.ts
├── stripe.webhook.controller.ts
├── dto/
│   └── create-payment-intent.dto.ts
├── index.ts
└── __tests__/
    └── stripe.service.spec.ts
```

### Modulo PDV

```
apps/api/src/modules/pdv/
├── pdv.module.ts
├── pdv.service.ts
├── pdv-checkout.service.ts
├── controllers/
│   ├── pdv-display.controller.ts
│   ├── pdv-wallet.controller.ts
│   └── pdv-admin.controller.ts
├── guards/
│   └── pdv-api-key.guard.ts
├── dto/
│   ├── create-pdv.dto.ts
│   ├── create-pdv-product.dto.ts
│   ├── create-checkout.dto.ts
│   ├── pay-checkout.dto.ts
│   └── index.ts
├── index.ts
└── __tests__/
    ├── pdv.service.spec.ts
    └── pdv-checkout.service.spec.ts
```

### Modulo Store

```
apps/api/src/modules/store/
├── store.module.ts
├── services/
│   ├── categories.service.ts
│   ├── products.service.ts
│   ├── cart.service.ts
│   ├── checkout.service.ts
│   ├── favorites.service.ts
│   └── reviews.service.ts
├── controllers/
│   ├── store.controller.ts
│   ├── store-user.controller.ts
│   └── store-admin.controller.ts
├── dto/
│   ├── category.dto.ts
│   ├── product.dto.ts
│   ├── cart.dto.ts
│   ├── checkout.dto.ts
│   ├── review.dto.ts
│   ├── favorite.dto.ts
│   └── index.ts
├── index.ts
└── __tests__/
    ├── categories.service.spec.ts
    ├── products.service.spec.ts
    ├── cart.service.spec.ts
    ├── checkout.service.spec.ts
    ├── favorites.service.spec.ts
    └── reviews.service.spec.ts
```

### Modulo Orders

```
apps/api/src/modules/orders/
├── orders.module.ts
├── orders.service.ts
├── vouchers.service.ts
├── controllers/
│   ├── orders.controller.ts
│   └── orders-admin.controller.ts
├── dto/
│   ├── orders-query.dto.ts
│   ├── update-status.dto.ts
│   ├── cancel-order.dto.ts
│   ├── validate-pickup.dto.ts
│   └── index.ts
├── index.ts
└── __tests__/
    ├── orders.service.spec.ts
    └── vouchers.service.spec.ts
```

---

## 8. Metricas de Testes

### Testes por Arquivo

| Arquivo | Testes | Cobertura |
|---------|--------|-----------|
| stripe.service.spec.ts | 10 | ~95% |
| pdv.service.spec.ts | 15 | ~97% |
| pdv-checkout.service.spec.ts | 12 | ~95% |
| categories.service.spec.ts | 8 | ~95% |
| products.service.spec.ts | 12 | ~97% |
| cart.service.spec.ts | 10 | ~95% |
| checkout.service.spec.ts | 8 | ~90% |
| favorites.service.spec.ts | 6 | ~95% |
| reviews.service.spec.ts | 8 | ~95% |
| orders.service.spec.ts | 14 | ~97% |
| vouchers.service.spec.ts | 8 | ~95% |
| **Total Fase 5** | **~111** | **95%+** |

### Cenarios Cobertos

**PDV:**
- CRUD de PDVs e produtos
- Geracao de credenciais API
- Criacao e processamento de checkouts
- Pagamento com pontos
- Integracao com PIX
- Cancelamento e expiracao

**Store:**
- CRUD de categorias e produtos
- Variantes de produtos
- Carrinho com reserva de estoque
- Checkout misto (pontos + dinheiro)
- Favoritos toggle
- Reviews com moderacao

**Orders:**
- Criacao de pedidos
- Transicoes de status
- Cancelamento com estorno
- Geracao de comprovantes
- Vouchers com validade

---

## 9. Regras de Negocio

| Regra | Descricao |
|-------|-----------|
| PDV - Pagamento | Apenas pontos OU PIX (nunca misto) |
| PDV - Checkout TTL | 5 minutos para completar |
| Store - Pagamento | Pontos, dinheiro ou misto (conforme produto) |
| Store - Carrinho | Reserva de estoque por 30 minutos |
| Store - Limite | Produto pode ter limite por usuario |
| Cashback | Percentual configuravel por associacao |
| Vouchers | Validade configuravel por produto |
| Status Flow | PENDING -> CONFIRMED -> READY -> COMPLETED |
| Cancelamento | Usuario pode cancelar apenas PENDING |
| Estorno | Pontos automaticos, dinheiro via Stripe |

---

## 10. Dependencias entre Modulos

```
Stripe Module
├── Importa: ConfigModule
├── Exporta: StripeService
└── Usado por: PdvModule, StoreModule, OrdersModule

Orders Module
├── Importa: PrismaModule, PointsModule, NotificationsModule, StripeModule
├── Exporta: OrdersService, VouchersService
└── Usado por: PdvModule, StoreModule

PDV Module
├── Importa: PrismaModule, PointsModule, StripeModule, OrdersModule, NotificationsModule
├── Usa: OrdersService para criar pedidos
└── Exporta: PdvService, PdvCheckoutService

Store Module
├── Importa: PrismaModule, PointsModule, StripeModule, OrdersModule, NotificationsModule
├── Usa: OrdersService para criar pedidos
└── Exporta: CategoriesService, ProductsService, CartService, CheckoutService, FavoritesService, ReviewsService
```

---

## 11. Swagger/Docs

Todos os endpoints possuem decorators Swagger:
- `@ApiTags` - Agrupamento por modulo
- `@ApiOperation` - Descricao da operacao
- `@ApiResponse` - Status codes documentados
- `@ApiParam` - Parametros de rota
- `@ApiHeader` - Headers (API Key para PDV)
- `@ApiBearerAuth` - Autenticacao JWT

---

## 12. Comandos de Verificacao

```bash
# Rodar testes da Fase 5
pnpm test apps/api/src/modules/stripe
pnpm test apps/api/src/modules/pdv
pnpm test apps/api/src/modules/store
pnpm test apps/api/src/modules/orders

# Testes com cobertura
pnpm test:coverage

# Verificar TypeScript
pnpm typecheck

# Iniciar servidor de desenvolvimento
pnpm dev:api

# Testar Stripe webhooks localmente
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 13. Proximos Passos (Fase 6)

1. **Locacoes**
   - Espacos para reserva
   - Sistema de agendamento
   - Regras de disponibilidade

2. **Reservas**
   - Checkout de espacos
   - Aprovacao de reservas
   - Calendario de ocupacao
