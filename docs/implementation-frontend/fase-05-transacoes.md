# Fase 5: Transações (PDV + Loja + Pedidos)

**Complexidade:** Alta
**Duração estimada:** 3-4 semanas
**Dependências:** Fase 1 (Sistema de Pontos), Fase 4 (Notificações)

## Objetivo

Implementar sistema de transações comerciais:
- **Loja:** Catálogo de produtos com carrinho e checkout (Pontos, PIX ou Misto)
- **PDV (kiosk):** Pagamento apenas com Pontos OU PIX (nunca misto)
- **Pedidos:** Sistema unificado de pedidos para Loja e PDV (histórico, timeline, vouchers, comprovantes)
- **Integração Stripe** para pagamentos PIX

---

## Arquivos para Ler Antes de Implementar

### Documentação - Loja
```
docs/12-loja/spec.md
docs/12-loja/api.md
docs/12-loja/acceptance-criteria.md
```

### Documentação - PDV
```
docs/16-pdv/spec.md
docs/16-pdv/api.md
docs/16-pdv/acceptance-criteria.md
```

### Documentação - Pedidos
```
docs/11-pedidos/spec.md
docs/11-pedidos/api.md
docs/11-pedidos/acceptance-criteria.md
```

### Backend (DTOs de referência)
```
apps/api/src/modules/store/dto/
apps/api/src/modules/store/controllers/
apps/api/src/modules/pdv/dto/
apps/api/src/modules/pdv/controllers/
apps/api/src/modules/orders/dto/
apps/api/src/modules/orders/controllers/
apps/api/src/modules/stripe/
```

---

## Arquivos para Criar

### Mobile - Loja

#### Screens
```
apps/mobile/src/features/store/screens/
├── StoreScreen.tsx                # Home da loja (categorias + destaques)
├── CategoryScreen.tsx             # Produtos da categoria
├── ProductDetailScreen.tsx        # Detalhes do produto (usa slug)
├── CartScreen.tsx                 # Carrinho (reserva 30min)
├── CheckoutScreen.tsx             # Checkout (validate + pagamento)
├── PaymentScreen.tsx              # Seleção e processamento de pagamento
└── OrderConfirmationScreen.tsx    # Confirmação pós-compra
```

#### Components
```
apps/mobile/src/features/store/components/
├── CategoryCarousel.tsx           # Carrossel de categorias
├── ProductCard.tsx                # Card de produto (indica tipo: PHYSICAL/VOUCHER/SERVICE)
├── ProductGallery.tsx             # Galeria de imagens (swipe)
├── ProductTypeBadge.tsx           # Badge visual por tipo de produto
├── VariantPicker.tsx              # Seletor de variante (tamanho, cor)
├── QuantityControl.tsx            # Controle +/-
├── CartItem.tsx                   # Item no carrinho
├── CartSummary.tsx                # Resumo (subtotal pontos/dinheiro, expiração)
├── CartExpirationTimer.tsx        # Timer de expiração da reserva (30min)
├── PaymentOptions.tsx             # Opções: pontos, PIX, misto
├── MixedPaymentSlider.tsx         # Slider Pontos + PIX (com points_to_money_rate)
├── BiometricConfirm.tsx           # Confirmação biométrica para pagamento com pontos
├── PIXQRCode.tsx                  # QR code PIX + copy-paste + countdown
├── PaymentStatusPolling.tsx       # Polling/WS de status de pagamento PIX
└── ReviewStars.tsx                # Avaliação em estrelas + form
```

#### Hooks
```
apps/mobile/src/features/store/hooks/
├── useCategories.ts               # GET /store/categories
├── useProducts.ts                 # GET /store/products (com filtros)
├── useProduct.ts                  # GET /store/products/:slug
├── useCart.ts                     # GET/POST/PATCH/DELETE cart
├── useCheckout.ts                 # POST validate + checkout + stripe-intent
├── useFavorites.ts                # GET/POST/DELETE favorites
└── useReviews.ts                  # GET/POST reviews
```

#### API
```
apps/mobile/src/features/store/api/
└── store.api.ts
```

---

### Mobile - PDV (Pagamento via App)

#### Screens
```
apps/mobile/src/features/pdv/screens/
├── PDVCheckoutScreen.tsx          # Detalhe do checkout após scan QR
└── PDVPaymentScreen.tsx           # Seleção entre pontos e PIX + processamento
```

#### Components
```
apps/mobile/src/features/pdv/components/
├── PDVCheckoutDetail.tsx          # Itens, total, saldo do usuário
├── PDVPaymentMethodSelect.tsx     # Escolha: pontos OU PIX (nunca misto)
├── PDVPaymentConfirm.tsx          # Confirmação de pagamento com pontos (biometria)
├── PDVPaymentPIX.tsx              # QR PIX + countdown + polling status
├── PDVPixStatus.tsx               # Polling de status PIX (awaiting/paid/expired)
├── PDVPaymentSuccess.tsx          # Tela de sucesso (cashback se PIX)
└── PDVPaymentCancelled.tsx        # Tela de cancelamento
```

#### Hooks
```
apps/mobile/src/features/pdv/hooks/
├── usePDVCheckout.ts              # GET /wallet/pdv/checkout/:code
├── usePDVPayPoints.ts             # POST /wallet/pdv/checkout/:code/pay
├── usePDVPayPix.ts                # POST /wallet/pdv/checkout/:code/pix
├── usePDVPixStatus.ts             # GET /wallet/pdv/checkout/:code/pix/status (polling)
└── usePDVCancel.ts                # POST /wallet/pdv/checkout/:code/cancel
```

#### API
```
apps/mobile/src/features/pdv/api/
└── pdv.api.ts
```

---

### Mobile - Pedidos

#### Screens
```
apps/mobile/src/features/orders/screens/
├── OrdersScreen.tsx               # Histórico de pedidos (filtro: loja/pdv, status)
├── OrderDetailScreen.tsx          # Detalhe com timeline + QR retirada
├── OrderReceiptScreen.tsx         # Comprovante do pedido
└── VoucherDetailScreen.tsx        # Detalhe do voucher com QR code
```

#### Components
```
apps/mobile/src/features/orders/components/
├── OrderCard.tsx                  # Card na lista (preview itens, status badge)
├── OrderStatusBadge.tsx           # Badge de status (pending/confirmed/ready/completed/cancelled)
├── OrderTimeline.tsx              # Timeline visual de status com timestamps
├── OrderItems.tsx                 # Lista de itens do pedido
├── OrderPaymentSummary.tsx        # Resumo: pontos usados, dinheiro pago, cashback
├── PickupQRCode.tsx               # QR code de retirada
├── VoucherCard.tsx                # Card de voucher (código, status, expiração)
├── VoucherQRCode.tsx              # QR code do voucher para uso
└── OrderReceiptView.tsx           # Visualização do comprovante
```

#### Hooks
```
apps/mobile/src/features/orders/hooks/
├── useOrders.ts                   # GET /orders (com filtros e paginação)
├── useOrder.ts                    # GET /orders/:id
├── useOrderReceipt.ts             # GET /orders/:id/receipt
└── useVouchers.ts                 # GET /orders/:id/vouchers + detalhe
```

#### API
```
apps/mobile/src/features/orders/api/
└── orders.api.ts
```

---

### Web - Kiosk PDV (Display)

#### Pages
```
apps/web/app/(pdv)/
├── layout.tsx                     # Layout kiosk (fullscreen, touch-optimized)
├── page.tsx                       # Home do kiosk (catálogo + carrinho)
└── checkout/page.tsx              # Checkout (QR + status + sucesso)
```

#### Components
```
apps/web/src/features/pdv/components/
├── ProductGrid.tsx                # Grid de produtos (touch-friendly)
├── CartPanel.tsx                  # Painel lateral do carrinho
├── CheckoutQR.tsx                 # QR para pagamento (scan pelo app)
├── PaymentStatus.tsx              # Status real-time (pending/awaiting_pix/paid)
├── PaymentSuccess.tsx             # Tela de sucesso (auto-dismiss)
├── IdleScreen.tsx                 # Tela de espera (screensaver)
└── ExpirationCountdown.tsx        # Countdown de expiração (5min)
```

#### Hooks
```
apps/web/src/features/pdv/hooks/
├── usePDV.ts                      # GET /pdv/:id/products (API Key auth)
├── usePDVCheckout.ts              # POST /pdv/:id/checkout + GET status (polling)
├── usePDVWebSocket.ts             # WebSocket: checkout.awaiting_pix, checkout.paid
└── usePDVCancel.ts                # POST /pdv/:id/checkout/:code/cancel
```

---

### Web Admin - Loja

#### Pages
```
apps/web/app/(admin)/store/
├── page.tsx                       # Dashboard da loja (resumo)
├── products/page.tsx              # Listagem de produtos
├── products/new/page.tsx          # Criar produto
├── products/[id]/page.tsx         # Editar produto
├── categories/page.tsx            # Gerenciar categorias
├── reviews/page.tsx               # Moderação de avaliações
└── reports/page.tsx               # Relatórios de vendas
```

#### Components
```
apps/web/src/features/store/components/
├── ProductsTable.tsx              # Tabela de produtos (filtros: categoria, status, tipo)
├── CreateProductForm.tsx          # Form com variantes, imagens, specs
├── VariantManager.tsx             # CRUD de variantes (SKU, atributos, estoque)
├── CategoriesManager.tsx          # Gerenciar categorias (CRUD + ordenação)
├── StockManager.tsx               # Gestão de estoque (por produto/variante)
├── PromotionManager.tsx           # Ativar/desativar promoções (preço, validade)
├── FeaturedToggle.tsx             # Marcar/desmarcar produto em destaque
├── ReviewModeration.tsx           # Lista de reviews pendentes + aprovar/rejeitar
├── SalesReport.tsx                # Relatório de vendas (por período, gráficos)
├── ProductsReport.tsx             # Relatório por produto (vendidos, receita, estoque)
└── ExportCSVButton.tsx            # Exportar relatórios em CSV
```

---

### Web Admin - PDV

#### Pages
```
apps/web/app/(admin)/pdv/
├── page.tsx                       # Lista de PDVs (status, stats)
├── new/page.tsx                   # Criar novo PDV
├── [id]/page.tsx                  # Detalhe do PDV
├── [id]/products/page.tsx         # Produtos do PDV
├── [id]/stock/page.tsx            # Estoque do PDV
└── [id]/sales/page.tsx            # Relatório de vendas do PDV
```

#### Components
```
apps/web/src/features/pdv/components/admin/
├── PDVTable.tsx                   # Tabela de PDVs (nome, local, status, stats)
├── PDVForm.tsx                    # Criar/editar PDV (nome, local, config display)
├── PDVStatusToggle.tsx            # Ativar/desativar PDV
├── PDVApiKeys.tsx                 # Visualizar API Key + Secret (gerado na criação)
├── PDVProductsManager.tsx         # CRUD de produtos do PDV
├── PDVStockManager.tsx            # Gestão de estoque (batch update, alerta low stock)
├── PDVSalesReport.tsx             # Relatório: vendas por hora, período, produto
└── PDVSalesSummary.tsx            # Resumo: vendas hoje, receita, clientes únicos
```

---

### Web Admin - Pedidos

#### Pages
```
apps/web/app/(admin)/orders/
├── page.tsx                       # Dashboard de pedidos (summary + lista)
├── [id]/page.tsx                  # Detalhe do pedido (admin view)
├── pickup/page.tsx                # Validação de QR de retirada
├── vouchers/page.tsx              # Gestão de vouchers
└── reports/page.tsx               # Relatórios de pedidos
```

#### Components
```
apps/web/src/features/orders/components/
├── OrdersDashboard.tsx            # Summary cards (pending, confirmed, ready, etc.)
├── OrdersTable.tsx                # Tabela com filtros (source, status, data, busca)
├── OrderDetail.tsx                # Detalhe completo (itens, timeline, pagamento, user)
├── OrderStatusActions.tsx         # Botões: confirmar, marcar pronto, completar
├── OrderCancelDialog.tsx          # Dialog de cancelamento (motivo obrigatório)
├── OrderBatchActions.tsx          # Ações em lote (selecionar + atualizar status)
├── PickupValidator.tsx            # Scanner QR + validação + confirmação de entrega
├── VouchersTable.tsx              # Tabela de vouchers (status, uso)
├── VoucherUseDialog.tsx           # Marcar voucher como utilizado
├── OrdersReport.tsx               # Relatório (por período, fonte, status, gráficos)
├── OrdersExportCSV.tsx            # Exportar relatório em CSV
└── OrderTimeline.tsx              # Timeline visual de status (admin view)
```

---

## Endpoints da API

### Loja - Catálogo (Público)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/store/categories` | Listar categorias ativas |
| GET | `/store/products` | Listar produtos (paginação, filtros, sort) |
| GET | `/store/products/:slug` | Detalhes do produto (por slug) |
| GET | `/store/products/:product_id/reviews` | Avaliações do produto |

### Loja - Carrinho (JWT)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/store/cart` | Ver carrinho (com expiração) |
| POST | `/store/cart/items` | Adicionar item (product_id, variant_id, quantity) |
| PATCH | `/store/cart/items/:item_id` | Atualizar quantidade |
| DELETE | `/store/cart/items/:item_id` | Remover item |
| DELETE | `/store/cart` | Limpar carrinho |

### Loja - Checkout (JWT)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/store/checkout/validate` | Validar carrinho antes do pagamento |
| POST | `/store/checkout` | Processar checkout (pontos/money/mixed + biometric_token) |
| POST | `/store/checkout/stripe-intent` | Criar PaymentIntent Stripe (para PIX) |

### Loja - Favoritos (JWT)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/store/favorites` | Listar favoritos |
| POST | `/store/favorites` | Adicionar (body: { product_id }) |
| DELETE | `/store/favorites/:product_id` | Remover favorito |

### Loja - Avaliações (JWT)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/store/products/:product_id/reviews` | Criar avaliação (requer compra, 1 por produto) |

### PDV - Display (API Key: `X-PDV-API-Key` + `X-PDV-Secret`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/pdv/:id/products` | Catálogo do PDV (+ points_config) |
| POST | `/pdv/:id/checkout` | Criar checkout → QR code (expira 5min) |
| GET | `/pdv/checkout/:code/status` | Polling status (pending/awaiting_pix/paid/expired) |
| POST | `/pdv/:id/checkout/:code/cancel` | Cancelar checkout |

### PDV - App/Wallet (JWT)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/wallet/pdv/checkout/:code` | Detalhes do checkout (após scan QR) |
| POST | `/wallet/pdv/checkout/:code/pay` | Pagar com pontos (requer biometric_token) |
| POST | `/wallet/pdv/checkout/:code/pix` | Iniciar PIX (retorna QR + copy-paste) |
| GET | `/wallet/pdv/checkout/:code/pix/status` | Polling status PIX (awaiting/paid/expired) |
| POST | `/wallet/pdv/checkout/:code/cancel` | Cancelar pelo app |

### Pedidos - Usuário (JWT)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/orders` | Listar pedidos (filtro: source, status, paginação) |
| GET | `/orders/:id` | Detalhe (itens, timeline, QR retirada, receipt) |
| GET | `/orders/:id/receipt` | Comprovante do pedido |
| GET | `/orders/:order_id/vouchers` | Listar vouchers do pedido |
| GET | `/orders/:order_id/vouchers/:voucher_id` | Detalhe do voucher (QR, status, validade) |

### Loja - Admin (JWT + ADM)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/store/categories` | Listar categorias (inclui inativas) |
| POST | `/admin/store/categories` | Criar categoria |
| PATCH | `/admin/store/categories/:id` | Atualizar categoria |
| DELETE | `/admin/store/categories/:id` | Desativar (soft delete) |
| GET | `/admin/store/products` | Listar (filtros: categoria, status, tipo, search) |
| POST | `/admin/store/products` | Criar produto (com variantes, imagens, specs) |
| PATCH | `/admin/store/products/:id` | Atualizar produto |
| DELETE | `/admin/store/products/:id` | Desativar (soft delete) |
| POST | `/admin/store/products/:id/variants` | Adicionar variante |
| PATCH | `/admin/store/products/:id/variants/:variant_id` | Atualizar variante |
| DELETE | `/admin/store/products/:id/variants/:variant_id` | Remover variante |
| PATCH | `/admin/store/products/:id/stock` | Atualizar estoque |
| POST | `/admin/store/products/:id/promotion` | Ativar promoção |
| DELETE | `/admin/store/products/:id/promotion` | Remover promoção |
| PATCH | `/admin/store/products/:id/featured` | Alterar destaque |
| GET | `/admin/store/reviews` | Listar reviews (filtro: status) |
| PATCH | `/admin/store/reviews/:id` | Moderar (approved/rejected) |
| GET | `/admin/store/reports/sales` | Relatório de vendas |
| GET | `/admin/store/reports/products` | Relatório por produto |
| GET | `/admin/store/reports/export` | Exportar CSV |

### PDV - Admin (JWT + ADM)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/pdv` | Listar PDVs (com stats) |
| POST | `/admin/pdv` | Criar PDV (retorna api_key + secret) |
| PUT | `/admin/pdv/:id` | Atualizar PDV |
| GET | `/admin/pdv/:id/stock` | Ver estoque (com alertas low stock) |
| PUT | `/admin/pdv/:id/stock` | Atualizar estoque (batch) |
| POST | `/admin/pdv/:id/products` | Adicionar produto |
| PUT | `/admin/pdv/:id/products/:product_id` | Atualizar produto |
| DELETE | `/admin/pdv/:id/products/:product_id` | Remover produto |
| GET | `/admin/pdv/:id/sales` | Relatório de vendas (por hora, período, produto) |

### Pedidos - Admin (JWT + ADM)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/orders` | Listar pedidos (com summary counts) |
| GET | `/admin/orders/:id` | Detalhe (admin view: user info, stripe id, notas) |
| PATCH | `/admin/orders/:id/status` | Atualizar status (+ notes) |
| POST | `/admin/orders/:id/cancel` | Cancelar (reason obrigatório) → estorno automático |
| POST | `/admin/orders/:id/complete` | Marcar como entregue |
| POST | `/admin/orders/batch/status` | Atualizar status em lote |
| POST | `/admin/orders/pickup/validate` | Validar QR de retirada |
| POST | `/admin/vouchers/:voucher_id/use` | Marcar voucher como usado |
| GET | `/admin/reports/orders` | Relatório de pedidos (por período, fonte, status) |
| GET | `/admin/reports/orders/export` | Exportar CSV |

---

## Especificações Técnicas

### Mixed Payment Slider (Loja)

```typescript
// apps/mobile/src/features/store/components/MixedPaymentSlider.tsx
interface MixedPaymentSliderProps {
  totalPoints: number;        // Preço total em pontos
  totalMoney: number;         // Preço total em dinheiro
  userPoints: number;         // Saldo do usuário
  pointsToMoneyRate: number;  // Taxa de conversão (ex: 0.50 → 10pts = R$5)
  onChange: (split: { points: number; money: number }) => void;
}

const MixedPaymentSlider = ({
  totalPoints,
  totalMoney,
  userPoints,
  pointsToMoneyRate,
  onChange,
}: MixedPaymentSliderProps) => {
  const [pointsAmount, setPointsAmount] = useState(0);
  const maxPoints = Math.min(userPoints, totalPoints);

  const handleChange = (value: number) => {
    setPointsAmount(value);
    // Calcula o valor em dinheiro baseado na proporção
    const pointsRatio = value / totalPoints;
    const moneyRemaining = totalMoney * (1 - pointsRatio);
    onChange({
      points: value,
      money: Math.round(moneyRemaining * 100) / 100,
    });
  };

  return (
    <View style={styles.container}>
      <Text>Pagar com pontos: {formatPoints(pointsAmount)}</Text>
      <Slider
        value={pointsAmount}
        minimumValue={0}
        maximumValue={maxPoints}
        step={100}
        onValueChange={handleChange}
      />
      <View style={styles.summary}>
        <Text>Pontos: {formatPoints(pointsAmount)}</Text>
        <Text>PIX: {formatCurrency(totalMoney * (1 - pointsAmount / totalPoints))}</Text>
      </View>
    </View>
  );
};
```

### Checkout Flow (Loja)

```typescript
// apps/mobile/src/features/store/hooks/useCheckout.ts
const useCheckout = () => {
  // 1. Validar carrinho antes do pagamento
  const validateCheckout = async (paymentMethod: 'points' | 'money' | 'mixed') => {
    const { data } = await api.post('/store/checkout/validate', {
      payment_method: paymentMethod,
    });
    return data; // { valid, summary, errors }
  };

  // 2. Processar checkout
  const processCheckout = async (payment: {
    method: 'points' | 'money' | 'mixed';
    pointsToUse?: number;
    biometricToken?: string;
    stripePaymentMethodId?: string;
  }) => {
    const { data } = await api.post('/store/checkout', {
      payment_method: payment.method,
      points_to_use: payment.pointsToUse,
      biometric_token: payment.biometricToken,
      stripe_payment_method_id: payment.stripePaymentMethodId,
    });

    // Se envolve PIX, retorna dados para QR
    if (data.data.status === 'awaiting_payment') {
      return {
        status: 'awaiting_pix',
        pixQRCode: data.data.pix_qr_code,
        pixCopyPaste: data.data.pix_copy_paste,
        expiresAt: data.data.expires_at,
        orderId: data.data.order_id,
      };
    }

    // Se pagamento com pontos, retorna order confirmado
    return {
      status: 'confirmed',
      orderId: data.data.order_id,
      orderCode: data.data.order_code,
      cashbackEarned: data.data.cashback_earned,
    };
  };

  // 3. Criar PaymentIntent (para PIX)
  const createStripeIntent = async (pointsToUse: number = 0) => {
    const { data } = await api.post('/store/checkout/stripe-intent', {
      payment_method: pointsToUse > 0 ? 'mixed' : 'money',
      points_to_use: pointsToUse,
    });
    return data; // { client_secret, amount, currency }
  };

  return { validateCheckout, processCheckout, createStripeIntent };
};
```

### Biometric Authentication (Pontos)

```typescript
// apps/mobile/src/features/store/components/BiometricConfirm.tsx
import * as LocalAuthentication from 'expo-local-authentication';

const BiometricConfirm = ({ onConfirm, onCancel, totalPoints }) => {
  const handleBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Confirmar pagamento de ${formatPoints(totalPoints)}`,
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
    });

    if (result.success) {
      // Token de biometria para enviar ao backend
      onConfirm({ biometric_token: generateBiometricToken() });
    }
  };

  return (
    <Sheet>
      <Text>Confirmar pagamento com pontos</Text>
      <Text>{formatPoints(totalPoints)}</Text>
      <Button onPress={handleBiometric}>Confirmar com biometria</Button>
      <Button variant="ghost" onPress={onCancel}>Cancelar</Button>
    </Sheet>
  );
};
```

### PDV Kiosk WebSocket (Display)

```typescript
// apps/web/src/features/pdv/hooks/usePDVWebSocket.ts
export const usePDVWebSocket = (checkoutCode: string) => {
  const [status, setStatus] = useState<
    'pending' | 'awaiting_pix' | 'paid' | 'expired' | 'cancelled'
  >('pending');
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const socket = io(WS_URL, {
      query: { checkoutCode, type: 'pdv' },
    });

    // Usuário escolheu pagar com PIX
    socket.on('checkout.awaiting_pix', (data) => {
      setStatus('awaiting_pix');
      setPaymentDetails({
        paymentMethod: 'money',
        totalMoney: data.total_money,
        pixExpiresAt: data.pix_expires_at,
      });
    });

    // Pagamento confirmado (pontos ou PIX)
    socket.on('checkout.paid', (data) => {
      setStatus('paid');
      setPaymentDetails({
        paymentMethod: data.payment_method,
        paidBy: data.paid_by.name,
        cashbackEarned: data.cashback_earned,
      });
    });

    // Checkout expirado
    socket.on('checkout.expired', () => {
      setStatus('expired');
    });

    return () => socket.disconnect();
  }, [checkoutCode]);

  return { status, paymentDetails };
};
```

### PDV Payment Flow (App)

```typescript
// apps/mobile/src/features/pdv/hooks/usePDVPayPoints.ts
const usePDVPayPoints = () => {
  return useMutation({
    mutationFn: async ({ code, biometricToken }: {
      code: string;
      biometricToken: string;
    }) => {
      const { data } = await api.post(`/wallet/pdv/checkout/${code}/pay`, {
        payment_method: 'points',
        biometric_token: biometricToken,
      });
      return data.data; // { success, checkout_code, total_points, new_balance, transaction_id }
    },
  });
};

// apps/mobile/src/features/pdv/hooks/usePDVPayPix.ts
const usePDVPayPix = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await api.post(`/wallet/pdv/checkout/${code}/pix`, {
        payment_method: 'money',
      });
      return data.data; // { checkout_code, pix: { qr_code, copy_paste, expires_at }, cashback_preview }
    },
  });
};

// apps/mobile/src/features/pdv/hooks/usePDVPixStatus.ts
const usePDVPixStatus = (code: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['pdv-pix-status', code],
    queryFn: async () => {
      const { data } = await api.get(`/wallet/pdv/checkout/${code}/pix/status`);
      return data.data; // { status, paid_at?, cashback_earned?, new_balance? }
    },
    refetchInterval: enabled ? 3000 : false, // Poll a cada 3s
    enabled,
  });
};
```

### Loja Payment Status (via WebSocket)

```typescript
// apps/mobile/src/features/store/hooks/usePaymentStatus.ts
export const usePaymentStatus = (orderId: string, enabled: boolean) => {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !orderId) return;

    const socket = io(WS_URL, {
      query: { orderId, type: 'store_payment' },
    });

    // Stripe webhook confirmou pagamento
    socket.on('payment:confirmed', (data) => {
      setStatus('confirmed');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    // Pagamento falhou
    socket.on('payment:failed', (data) => {
      setStatus('failed');
    });

    return () => socket.disconnect();
  }, [orderId, enabled]);

  return { status };
};
```

---

## Regras de Negócio

### PDV
- Pagamento **APENAS** Pontos **OU** PIX (nunca misto) → `MIXED_PAYMENT_NOT_ALLOWED`
- Interface de kiosk touchscreen (fullscreen, idle timeout configurável)
- QR de checkout expira em **5 minutos**
- PIX expira em **5 minutos**
- Estoque debitado **APÓS** pagamento (não reservado durante checkout)
- Cashback apenas em pagamentos PIX (% configurável, padrão 5%)
- Confirmação via WebSocket para o display
- Autenticação do display via API Key (`X-PDV-API-Key` + `X-PDV-Secret`)

### Loja
- Pagamento: Pontos, PIX ou **Misto** (configurável por produto: `payment_options`)
- Carrinho com reserva de estoque (**30 minutos**, auto-expira)
- Descontos de assinatura aplicam aqui (`discount_store`)
- Desconto de assinatura **NÃO acumula** com promoção (usa o maior)
- Tipos de produto: **PHYSICAL** (retirada), **VOUCHER** (código gerado), **SERVICE**
- Limite por usuário configurável por produto (`limit_per_user`)
- Elegibilidade por plano (`eligible_plans`)
- Cashback configurável por produto (`cashback_percent`), creditado em compras com dinheiro
- Avaliações requerem compra prévia, 1 por produto, passam por moderação

### Pedidos
- Unificado para Loja e PDV (`source: store | pdv`)
- Código único de 6 caracteres (ex: `A1B2C3`)
- Fluxo de status: `pending` → `confirmed` → `ready` → `completed` (ou `cancelled`)
- Usuário pode cancelar apenas pedidos `pending`
- Admin pode cancelar com motivo obrigatório → estorno automático (pontos + dinheiro + cashback + estoque)
- Vouchers auto-gerados para produtos tipo VOUCHER (código `AHUB-XXXX-YYYY`)
- QR code de retirada para produtos físicos
- Comprovante com número `REC-2026-XXXXXX`
- Timeline de status com timestamps

### Pagamentos
- Stripe para processamento PIX (via PaymentIntent)
- Pagamento com pontos requer **autenticação biométrica** (`biometric_token`)
- Cashback configurável por associação (global) e por produto (loja)
- Webhooks Stripe: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- Notificações push em cada mudança de status do pedido

---

## Critérios de Verificação

### Loja - Catálogo
- [ ] Navegar categorias
- [ ] Listar produtos com filtros e paginação
- [ ] Ver detalhes do produto (por slug) com imagens, specs, variantes
- [ ] Badge visual diferencia tipo PHYSICAL/VOUCHER/SERVICE
- [ ] Favoritar/desfavoritar produto
- [ ] Ver avaliações do produto
- [ ] Criar avaliação (apenas se comprou)

### Loja - Carrinho
- [ ] Adicionar item ao carrinho (com variante se aplicável)
- [ ] Atualizar quantidade
- [ ] Remover item
- [ ] Limpar carrinho
- [ ] Timer de expiração visível (30min)
- [ ] Erros: estoque insuficiente, limite excedido, não elegível

### Loja - Checkout
- [ ] Validar carrinho antes do pagamento
- [ ] Checkout com pontos (biometria → confirmação imediata)
- [ ] Checkout com PIX (QR code → polling/WS → confirmação)
- [ ] Checkout misto (slider funcionando, biometria + PIX)
- [ ] Receber confirmação de pagamento via WebSocket
- [ ] Tela de confirmação com código do pedido e cashback

### PDV - Kiosk (Web)
- [ ] Exibir catálogo de produtos (touch-friendly)
- [ ] Adicionar itens ao carrinho
- [ ] Gerar QR de checkout
- [ ] Countdown de expiração (5min)
- [ ] Status real-time via WebSocket (awaiting_pix, paid)
- [ ] Tela de sucesso com auto-dismiss
- [ ] Tela idle após inatividade

### PDV - App (Mobile)
- [ ] Escanear QR do display
- [ ] Ver detalhes do checkout (itens, total, saldo)
- [ ] Selecionar método: pontos OU PIX
- [ ] Pagar com pontos (biometria)
- [ ] Pagar com PIX (QR + polling status)
- [ ] Tela de sucesso (com cashback se PIX)
- [ ] Cancelar checkout pelo app

### Pedidos - Usuário (Mobile)
- [ ] Listar pedidos (filtrar por loja/pdv, status)
- [ ] Ver detalhe do pedido com timeline
- [ ] Ver QR de retirada
- [ ] Ver comprovante/receipt
- [ ] Ver vouchers do pedido
- [ ] Detalhe do voucher com QR code

### Admin - Loja
- [ ] CRUD de categorias
- [ ] CRUD de produtos com variantes e imagens
- [ ] Gerenciar estoque
- [ ] Ativar/desativar promoções
- [ ] Marcar produtos em destaque
- [ ] Moderar avaliações (aprovar/rejeitar)
- [ ] Relatório de vendas (por período)
- [ ] Relatório por produto
- [ ] Exportar CSV

### Admin - PDV
- [ ] Listar PDVs com status e stats
- [ ] Criar/editar PDV (gera API Key)
- [ ] Gerenciar produtos do PDV
- [ ] Gerenciar estoque (batch update)
- [ ] Ver relatório de vendas (por hora, período)
- [ ] Alertas de estoque baixo

### Admin - Pedidos
- [ ] Dashboard com contadores de status
- [ ] Listar pedidos (filtros avançados)
- [ ] Atualizar status (confirmar, marcar pronto, completar)
- [ ] Cancelar pedido (motivo obrigatório, estorno automático)
- [ ] Ações em lote (batch status update)
- [ ] Validar QR de retirada
- [ ] Marcar voucher como utilizado
- [ ] Relatório de pedidos
- [ ] Exportar CSV
