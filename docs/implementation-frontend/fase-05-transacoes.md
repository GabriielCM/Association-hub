# Fase 5: Transações (PDV + Loja)

**Complexidade:** Alta
**Duração estimada:** 3-4 semanas
**Dependências:** Fase 4

## Objetivo

Implementar sistema de transações comerciais:
- PDV (kiosk): Pagamento apenas com Pontos OU PIX (nunca misto)
- Loja: Catálogo de produtos com carrinho
- Checkout com Pontos, PIX ou Misto
- Integração Stripe para PIX

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

### Backend (DTOs de referência)
```
apps/api/src/modules/store/dto/
apps/api/src/modules/store/controllers/
apps/api/src/modules/pdv/dto/
apps/api/src/modules/pdv/controllers/
apps/api/src/modules/stripe/
```

---

## Arquivos para Criar

### Mobile - Loja

#### Screens
```
apps/mobile/src/features/store/screens/
├── StoreScreen.tsx                # Home da loja
├── CategoryScreen.tsx             # Produtos da categoria
├── ProductDetailScreen.tsx        # Detalhes do produto
├── CartScreen.tsx                 # Carrinho
├── CheckoutScreen.tsx             # Checkout
├── PaymentScreen.tsx              # Seleção de pagamento
└── OrderConfirmationScreen.tsx    # Confirmação
```

#### Components
```
apps/mobile/src/features/store/components/
├── CategoryCarousel.tsx           # Carrossel de categorias
├── ProductCard.tsx                # Card de produto
├── ProductGallery.tsx             # Galeria de imagens
├── VariantPicker.tsx              # Seletor de variante
├── QuantityControl.tsx            # Controle +/-
├── CartItem.tsx                   # Item no carrinho
├── CartSummary.tsx                # Resumo (subtotal, desconto)
├── PaymentOptions.tsx             # Opções de pagamento
├── MixedPaymentSlider.tsx         # Slider Pontos + PIX
├── PIXQRCode.tsx                  # QR code PIX
└── ReviewStars.tsx                # Avaliação em estrelas
```

#### Hooks
```
apps/mobile/src/features/store/hooks/
├── useCategories.ts
├── useProducts.ts
├── useProduct.ts
├── useCart.ts
├── useCheckout.ts
└── useFavorites.ts
```

#### API
```
apps/mobile/src/features/store/api/
└── store.api.ts
```

---

### Mobile - PDV

#### Components
```
apps/mobile/src/features/pdv/components/
├── PDVPaymentConfirm.tsx          # Confirmação de pagamento
├── PDVPaymentPIX.tsx              # Tela PIX do PDV
└── PDVPaymentSuccess.tsx          # Sucesso
```

---

### Web - Kiosk PDV

#### Pages
```
apps/web/app/(pdv)/
├── layout.tsx                     # Layout kiosk
├── page.tsx                       # Home do kiosk
└── checkout/page.tsx              # Checkout
```

#### Components
```
apps/web/src/features/pdv/components/
├── ProductGrid.tsx                # Grid de produtos
├── CartPanel.tsx                  # Painel lateral do carrinho
├── CheckoutQR.tsx                 # QR para pagamento
├── PaymentStatus.tsx              # Status (aguardando/confirmado)
└── IdleScreen.tsx                 # Tela de espera
```

#### Hooks
```
apps/web/src/features/pdv/hooks/
├── usePDV.ts
└── usePDVWebSocket.ts
```

---

### Web Admin - Loja

#### Components
```
apps/web/src/features/store/components/
├── ProductsTable.tsx              # Tabela de produtos
├── CreateProductForm.tsx          # Form com variantes
├── CategoriesManager.tsx          # Gerenciar categorias
├── StockManager.tsx               # Gestão de estoque
└── OrdersTable.tsx                # Tabela de pedidos
```

#### Pages
```
apps/web/src/features/store/pages/
├── ProductsPage.tsx
├── CategoriesPage.tsx
└── StoreReportsPage.tsx
```

---

## Endpoints da API

### Loja - Usuário
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/store/categories` | Listar categorias |
| GET | `/store/products` | Listar produtos |
| GET | `/store/products/:id` | Detalhes do produto |
| GET | `/store/products/:id/reviews` | Avaliações |
| POST | `/store/products/:id/reviews` | Criar avaliação |
| GET | `/store/favorites` | Favoritos |
| POST | `/store/favorites/:id` | Adicionar favorito |
| DELETE | `/store/favorites/:id` | Remover favorito |

### Carrinho
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/store/cart` | Ver carrinho |
| POST | `/store/cart/items` | Adicionar item |
| PUT | `/store/cart/items/:id` | Atualizar quantidade |
| DELETE | `/store/cart/items/:id` | Remover item |
| DELETE | `/store/cart` | Limpar carrinho |

### Checkout
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/store/checkout` | Iniciar checkout |
| POST | `/store/checkout/calculate` | Calcular totais |
| POST | `/store/checkout/confirm` | Confirmar compra |
| GET | `/store/checkout/:id/status` | Status do pagamento |

### PDV
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/pdv/products` | Produtos do PDV |
| POST | `/pdv/checkout` | Criar checkout |
| GET | `/pdv/checkout/:code` | Detalhes do checkout |
| POST | `/pdv/checkout/:code/pay` | Confirmar pagamento |
| GET | `/pdv/checkout/:code/status` | Status |

### Loja - Admin
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/store/products` | Todos os produtos |
| POST | `/admin/store/products` | Criar produto |
| PUT | `/admin/store/products/:id` | Atualizar produto |
| DELETE | `/admin/store/products/:id` | Excluir produto |
| POST | `/admin/store/categories` | Criar categoria |
| PUT | `/admin/store/categories/:id` | Atualizar categoria |
| PUT | `/admin/store/products/:id/stock` | Atualizar estoque |

---

## Especificações Técnicas

### Mixed Payment Slider

```typescript
// apps/mobile/src/features/store/components/MixedPaymentSlider.tsx
const MixedPaymentSlider = ({ total, userPoints, onChange }) => {
  const [pointsAmount, setPointsAmount] = useState(0);
  const maxPoints = Math.min(userPoints, total);

  const handleChange = (value: number) => {
    setPointsAmount(value);
    onChange({
      points: value,
      pix: total - value,
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
        <Text>PIX: {formatCurrency(total - pointsAmount)}</Text>
      </View>
    </View>
  );
};
```

### PIX Payment Flow

```typescript
// apps/mobile/src/features/store/hooks/useCheckout.ts
const useCheckout = () => {
  const confirmPurchase = async (payment: PaymentMethod) => {
    const { data } = await api.post('/store/checkout/confirm', {
      paymentMethod: payment.type,
      pointsAmount: payment.points,
      pixAmount: payment.pix,
    });

    if (payment.pix > 0) {
      // Retorna QR code PIX para pagamento
      return {
        status: 'awaiting_pix',
        pixQRCode: data.pixQRCode,
        pixCopyPaste: data.pixCopyPaste,
        expiresAt: data.expiresAt,
      };
    }

    return { status: 'confirmed', order: data.order };
  };

  const checkPaymentStatus = async (checkoutId: string) => {
    const { data } = await api.get(`/store/checkout/${checkoutId}/status`);
    return data.status; // 'pending' | 'confirmed' | 'expired'
  };

  return { confirmPurchase, checkPaymentStatus };
};
```

### PDV Kiosk Interface

```typescript
// apps/web/src/features/pdv/hooks/usePDVWebSocket.ts
export const usePDVWebSocket = (checkoutCode: string) => {
  const [status, setStatus] = useState<'pending' | 'confirmed'>('pending');

  useEffect(() => {
    const socket = io(WS_URL, {
      query: { checkoutCode, type: 'pdv' },
    });

    socket.on('payment:confirmed', () => {
      setStatus('confirmed');
      // Mostrar tela de sucesso
    });

    socket.on('payment:failed', (error) => {
      // Mostrar erro
    });

    return () => socket.disconnect();
  }, [checkoutCode]);

  return { status };
};
```

---

## Regras de Negócio

### PDV
- Pagamento **APENAS** Pontos **OU** PIX (nunca misto)
- Interface de kiosk touchscreen
- Confirmação via WebSocket
- Cashback em pagamentos PIX

### Loja
- Pagamento: Pontos, PIX ou **Misto**
- Carrinho com reserva de estoque (30min)
- Descontos de assinatura aplicam aqui
- Tipos de produto: PHYSICAL, VOUCHER, SERVICE

### Pagamentos
- Stripe para processamento PIX
- QR code com expiração (15min)
- Cashback configurável por associação
- Desconto de assinatura não acumula com promoção (usa o maior)

---

## Critérios de Verificação

- [ ] Navegar categorias e produtos
- [ ] Ver detalhes do produto com variantes
- [ ] Adicionar ao carrinho
- [ ] Atualizar quantidade no carrinho
- [ ] Remover do carrinho
- [ ] Checkout com pontos
- [ ] Checkout com PIX (QR code)
- [ ] Checkout misto (slider funcionando)
- [ ] Receber confirmação de pagamento
- [ ] Kiosk PDV: selecionar produtos
- [ ] Kiosk PDV: gerar QR para pagamento
- [ ] Kiosk PDV: confirmar via app do usuário
- [ ] Admin: criar/editar produtos
- [ ] Admin: gerenciar estoque
- [ ] Admin: ver pedidos
