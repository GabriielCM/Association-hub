---
module: loja
document: spec
status: complete
priority: phase2
last_updated: 2026-01-13
---

# Loja - Especificação

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Modelo de Dados](#2-modelo-de-dados)
3. [Catálogo de Produtos](#3-catálogo-de-produtos)
4. [Página de Produto](#4-página-de-produto)
5. [Carrinho de Compras](#5-carrinho-de-compras)
6. [Checkout e Pagamento](#6-checkout-e-pagamento)
7. [Favoritos](#7-favoritos)
8. [Avaliações](#8-avaliações)
9. [Painel ADM](#9-painel-adm)
10. [Integrações](#10-integrações)
11. [Notificações](#11-notificações)
12. [Segurança](#12-segurança)
13. [Performance](#13-performance)

---

## 1. Visão Geral

### 1.1 Objetivo

A Loja permite que associados adquiram produtos, benefícios e serviços utilizando:
- Pontos do sistema de gamificação
- Dinheiro via Stripe (PIX/cartão)
- Combinação de ambos

### 1.2 Tipos de Usuário

| Usuário | Acesso |
|---------|--------|
| **Common User** | Navegar, comprar, avaliar |
| **ADM** | CRUD completo, relatórios |

### 1.3 Prioridade e Status

| Item | Valor |
|------|-------|
| Prioridade | 🟡 Fase 2 |
| Status | 🟢 Concluído |
| Interfaces | App (User), Web (ADM) |

---

## 2. Modelo de Dados

### 2.1 Category (Categoria)

```json
{
  "id": "uuid",
  "name": "Vestuário",
  "slug": "vestuario",
  "description": "Camisetas, bonés e acessórios oficiais",
  "image_url": "https://cdn.ahub.com/categories/vestuario.jpg",
  "display_order": 1,
  "is_active": true,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-13T00:00:00Z"
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `name` | String | Nome da categoria |
| `slug` | String | URL amigável |
| `description` | String | Descrição para SEO |
| `image_url` | String | Imagem de capa |
| `display_order` | Integer | Ordem de exibição |
| `is_active` | Boolean | Se está ativa |

### 2.2 Product (Produto)

```json
{
  "id": "uuid",
  "category_id": "uuid",
  "name": "Camiseta Oficial A-hub",
  "slug": "camiseta-oficial-ahub",
  "short_description": "Camiseta 100% algodão com logo bordado",
  "long_description": "Camiseta oficial do A-hub, confeccionada em algodão premium...",
  "type": "physical",
  "price_points": 500,
  "price_money": 89.90,
  "payment_options": "both",
  "allow_mixed_payment": true,
  "stock_type": "limited",
  "stock_count": 50,
  "limit_per_user": 2,
  "cashback_percent": 5.0,
  "voucher_validity_days": null,
  "is_featured": true,
  "is_promotional": false,
  "promotional_price_points": null,
  "promotional_price_money": null,
  "promotional_ends_at": null,
  "eligible_plans": null,
  "pickup_location": "Sede Principal - Recepção",
  "average_rating": 4.5,
  "review_count": 23,
  "sold_count": 127,
  "is_active": true,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-13T00:00:00Z"
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `category_id` | UUID | Categoria do produto |
| `name` | String | Nome do produto |
| `slug` | String | URL amigável |
| `short_description` | String | Descrição curta (até 150 chars) |
| `long_description` | Text | Descrição completa |
| `type` | Enum | `physical`, `voucher`, `service` |
| `price_points` | Integer | Preço em pontos (null = não aceita pontos) |
| `price_money` | Decimal | Preço em R$ (null = não aceita dinheiro) |
| `payment_options` | Enum | `points_only`, `money_only`, `both` |
| `allow_mixed_payment` | Boolean | Se aceita pagamento misto (parte pontos + parte R$) |
| `stock_type` | Enum | `limited`, `unlimited` |
| `stock_count` | Integer | Estoque atual (null se unlimited) |
| `limit_per_user` | Integer | Máximo por usuário (null = sem limite) |
| `cashback_percent` | Decimal | % cashback em compras com dinheiro |
| `voucher_validity_days` | Integer | Dias de validade após compra (tipo voucher) |
| `is_featured` | Boolean | Produto em destaque |
| `is_promotional` | Boolean | Em promoção |
| `promotional_price_points` | Integer | Preço promocional em pontos |
| `promotional_price_money` | Decimal | Preço promocional em R$ |
| `promotional_ends_at` | DateTime | Fim da promoção |
| `eligible_plans` | Array | IDs dos planos elegíveis (null = todos) |
| `pickup_location` | String | Local de retirada |
| `average_rating` | Decimal | Média das avaliações |
| `review_count` | Integer | Total de avaliações |
| `sold_count` | Integer | Total vendido |

### 2.3 ProductVariant (Variação)

```json
{
  "id": "uuid",
  "product_id": "uuid",
  "sku": "CAM-AH-M-AZL",
  "name": "M - Azul",
  "attributes": {
    "size": "M",
    "color": "Azul"
  },
  "price_points": null,
  "price_money": null,
  "stock_count": 12,
  "image_url": "https://cdn.ahub.com/products/camiseta-azul.jpg",
  "is_active": true,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-13T00:00:00Z"
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `product_id` | UUID | Produto pai |
| `sku` | String | Código único da variação |
| `name` | String | Nome legível (ex: "M - Azul") |
| `attributes` | JSON | Atributos da variação |
| `price_points` | Integer | Override do preço em pontos |
| `price_money` | Decimal | Override do preço em R$ |
| `stock_count` | Integer | Estoque da variação |
| `image_url` | String | Imagem específica da variação |

### 2.4 ProductImage (Galeria)

```json
{
  "id": "uuid",
  "product_id": "uuid",
  "url": "https://cdn.ahub.com/products/camiseta-1.jpg",
  "alt_text": "Camiseta A-hub frente",
  "display_order": 1,
  "created_at": "2026-01-01T00:00:00Z"
}
```

### 2.5 ProductSpecification (Especificações)

```json
{
  "id": "uuid",
  "product_id": "uuid",
  "key": "Material",
  "value": "100% Algodão",
  "display_order": 1,
  "created_at": "2026-01-01T00:00:00Z"
}
```

### 2.6 ProductReview (Avaliação)

```json
{
  "id": "uuid",
  "product_id": "uuid",
  "user_id": "uuid",
  "order_id": "uuid",
  "rating": 5,
  "comment": "Excelente qualidade! Super recomendo.",
  "status": "approved",
  "moderated_by": "uuid",
  "moderated_at": "2026-01-12T15:30:00Z",
  "created_at": "2026-01-11T10:00:00Z",
  "updated_at": "2026-01-12T15:30:00Z"
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `rating` | Integer | 1 a 5 estrelas |
| `comment` | Text | Comentário do usuário |
| `status` | Enum | `pending`, `approved`, `rejected` |
| `order_id` | UUID | Pedido relacionado (valida compra) |

### 2.7 Favorite (Favorito)

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "product_id": "uuid",
  "created_at": "2026-01-10T08:00:00Z"
}
```

### 2.8 Cart (Carrinho)

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "items": [...],
  "subtotal_points": 750,
  "subtotal_money": 134.85,
  "reserved_until": "2026-01-13T11:00:00Z",
  "created_at": "2026-01-13T10:30:00Z",
  "updated_at": "2026-01-13T10:35:00Z"
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `reserved_until` | DateTime | Expiração da reserva (30 min após última atualização) |

### 2.9 CartItem (Item do Carrinho)

```json
{
  "id": "uuid",
  "cart_id": "uuid",
  "product_id": "uuid",
  "variant_id": "uuid",
  "quantity": 2,
  "unit_price_points": 500,
  "unit_price_money": 89.90,
  "reserved_stock": true,
  "added_at": "2026-01-13T10:30:00Z"
}
```

---

## 3. Catálogo de Produtos

### 3.1 Tela Principal da Loja

```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar                LOJA               🛒 (2) ❤️ (5)   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔥 DESTAQUES                                               │
│  ─────────────────────────────────────────────────────────  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   [Foto]    │ │   [Foto]    │ │   [Foto]    │    ──▶    │
│  │ Camiseta    │ │ Desconto 20%│ │ Aula Yoga   │           │
│  │ 500 pts     │ │ 200 pts     │ │ R$ 50       │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Ordenar: [Mais Recentes ▼]                                 │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  CATEGORIAS                                                 │
│  ┌────────────┐┌────────────┐┌────────────┐┌────────────┐  │
│  │ Vestuário  ││  Vouchers  ││  Serviços  ││ Acessórios │  │
│  └────────────┘└────────────┘└────────────┘└────────────┘  │
│                                                             │
│  TODOS OS PRODUTOS                                          │
│  ─────────────────────────────────────────────────────────  │
│  ┌─────────────┐ ┌─────────────┐                           │
│  │   [Foto]    │ │   [Foto]    │                           │
│  │   ❤️        │ │             │                           │
│  │ Camiseta    │ │ Boné A-hub  │                           │
│  │ ⭐ 4.5 (23) │ │ ⭐ 4.8 (15) │                           │
│  │ 500 pts     │ │ 300 pts     │                           │
│  │ ou R$ 89,90 │ │             │                           │
│  └─────────────┘ └─────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Componentes da Listagem

**Header:**
- Botão voltar
- Título "LOJA"
- Badge do carrinho (quantidade)
- Ícone de favoritos (quantidade)

**Destaques (Carrossel Horizontal):**
- Produtos com `is_featured = true`
- Scroll lateral
- Limite: 10 produtos

**Ordenação:**
| Opção | Descrição |
|-------|-----------|
| Mais Recentes | Ordenado por `created_at` DESC |
| Preço: Menor | Ordenado por preço ASC |
| Preço: Maior | Ordenado por preço DESC |
| Mais Vendidos | Ordenado por `sold_count` DESC |
| A-Z | Ordenado por `name` ASC |

**Categorias (Chips):**
- Lista horizontal de categorias ativas
- Chip "Todos" selecionado por padrão
- Tap filtra produtos

**Grid de Produtos:**
- 2 colunas em mobile
- Card com: foto, favorito, nome, rating, preço

### 3.3 Card de Produto

```
┌─────────────────────┐
│      [IMAGEM]       │
│                 ❤️  │  ← Botão favoritar
├─────────────────────┤
│ Nome do Produto     │
│ ⭐ 4.5 (23 avaliações)
│                     │
│ 500 pts             │  ← Preço em pontos
│ ou R$ 89,90         │  ← Preço em dinheiro
│                     │
│ ──────────────────  │
│ 🏷️ -20% até 15/01  │  ← Badge promoção (se aplicável)
└─────────────────────┘
```

### 3.4 Estados Especiais

**Produto Esgotado:**
```
┌─────────────────────┐
│      [IMAGEM]       │
│    ░░ ESGOTADO ░░   │  ← Overlay escurecido
├─────────────────────┤
│ Nome do Produto     │
│ Indisponível        │
└─────────────────────┘
```

**Produto Exclusivo:**
```
┌─────────────────────┐
│      [IMAGEM]       │
│ 👑 EXCLUSIVO GOLD   │  ← Badge plano
├─────────────────────┤
│ Nome do Produto     │
│ 500 pts             │
└─────────────────────┘
```

---

## 4. Página de Produto

### 4.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar                               🛒 (2)  ❤️  📤     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │                    [IMAGEM 1]                       │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                   ● ○ ○ ○                                   │  ← Indicador galeria
│                                                             │
│  Camiseta Oficial A-hub                                     │
│  ⭐ 4.5 (23 avaliações)                    Ver avaliações ▶ │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  PREÇO                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  500 pontos          ou          R$ 89,90           │   │
│  │  Você tem: 1.250 pts ✓           PIX/Cartão         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  💰 Ganhe 5% de cashback (45 pts) pagando em dinheiro      │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  TAMANHO                                                    │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                        │
│  │ P  │ │ M ✓│ │ G  │ │ GG │ │XG ░│  ← XG esgotado         │
│  └────┘ └────┘ └────┘ └────┘ └────┘                        │
│                                                             │
│  COR                                                        │
│  ┌────┐ ┌────┐ ┌────┐                                      │
│  │🔵✓ │ │⚫  │ │⚪  │                                      │
│  └────┘ └────┘ └────┘                                      │
│                                                             │
│  Estoque: 12 unidades                                       │
│  Limite: 2 por pessoa                                       │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  DESCRIÇÃO                                                  │
│  Camiseta 100% algodão com logo bordado. Tecido premium    │
│  e acabamento de alta qualidade.         [Ver mais ▼]      │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ESPECIFICAÇÕES                                             │
│  Material............100% Algodão                           │
│  Cor.................Azul                                   │
│  Tamanho.............M                                      │
│  Peso................200g                                   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  📍 RETIRADA                                                │
│  Sede Principal - Recepção                                  │
│  Seg a Sex: 8h às 18h                                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │   ADICIONAR AO      │  │   COMPRAR AGORA     │          │
│  │      CARRINHO       │  │                     │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Galeria de Imagens

- Carrossel com swipe horizontal
- Indicadores de página (dots)
- Tap para abrir em tela cheia
- Pinch to zoom em tela cheia

### 4.3 Seleção de Variações

**Regras:**
- Variações esgotadas ficam desabilitadas (cinza)
- Ao selecionar, atualiza:
  - Imagem (se variação tem imagem própria)
  - Preço (se variação tem preço diferente)
  - Estoque disponível
- Seleção obrigatória para produtos com variações

### 4.4 Fluxo de Ações

**Adicionar ao Carrinho:**
```
Tap "Adicionar" → Validar variação → Verificar estoque → Reservar → Feedback
```

**Comprar Agora:**
```
Tap "Comprar" → Validar variação → Verificar estoque → Ir para Checkout
```

---

## 5. Carrinho de Compras

### 5.1 Tela do Carrinho

```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar               CARRINHO                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⏱️ Reserva expira em 28:45                                 │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Foto]  Camiseta Oficial A-hub                      │   │
│  │         M - Azul                                    │   │
│  │         500 pts ou R$ 89,90                         │   │
│  │                                                     │   │
│  │         [-] 2 [+]                    🗑️ Remover    │   │
│  │         Subtotal: 1.000 pts                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Foto]  Boné A-hub                                  │   │
│  │         Preto                                       │   │
│  │         300 pts                                     │   │
│  │                                                     │   │
│  │         [-] 1 [+]                    🗑️ Remover    │   │
│  │         Subtotal: 300 pts                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  RESUMO                                                     │
│  ─────────────────────────────────────────────────────────  │
│  Itens (3)                               1.300 pts          │
│  ou em dinheiro                          R$ 179,80          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Seu saldo: 1.250 pts                                       │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           FINALIZAR COMPRA (3 itens)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Reserva de Estoque

**Duração:** 30 minutos após última atualização

**Fluxo:**
```
1. Adicionar item ao carrinho
   └─ Reservar estoque (stock_count -= quantity)
   └─ Definir reserved_until = now + 30min

2. Modificar quantidade
   └─ Atualizar reserva
   └─ Renovar reserved_until = now + 30min

3. Expiração
   └─ Job libera estoque reservado
   └─ Remove itens do carrinho
   └─ Notifica usuário (se app aberto)

4. Checkout concluído
   └─ Confirma débito do estoque
   └─ Remove reserva
```

### 5.3 Validações

| Validação | Comportamento |
|-----------|---------------|
| Estoque insuficiente | Ajusta quantidade para máximo disponível |
| Limite por usuário | Impede adicionar além do limite |
| Produto desativado | Remove do carrinho, notifica usuário |
| Promoção expirada | Atualiza preço, notifica usuário |

---

## 6. Checkout e Pagamento

### 6.1 Tela de Checkout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar               CHECKOUT                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  RESUMO DO PEDIDO                                           │
│  ─────────────────────────────────────────────────────────  │
│  • Camiseta Oficial A-hub (M - Azul) x2      1.000 pts      │
│  • Boné A-hub (Preto) x1                       300 pts      │
│  ─────────────────────────────────────────────────────────  │
│  Total                                       1.300 pts      │
│  ou                                          R$ 179,80      │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  FORMA DE PAGAMENTO                                         │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ○ Pagar com Pontos                                         │
│    Seu saldo: 1.250 pts                                     │
│    ⚠️ Saldo insuficiente (faltam 50 pts)                   │
│                                                             │
│  ● Pagar com Dinheiro                                       │
│    PIX ou Cartão via Stripe                                 │
│    💰 Ganhe 90 pts de cashback (5%)                        │
│                                                             │
│  ○ Pagamento Misto                                          │
│    Usar pontos + completar com dinheiro                     │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  📍 LOCAL DE RETIRADA                                       │
│  Sede Principal - Recepção                                  │
│  Seg a Sex: 8h às 18h                                       │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ⚠️ Ao confirmar, você concorda com os termos de compra    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              CONFIRMAR PEDIDO                       │   │
│  │              R$ 179,80                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Fluxo: Pagamento com Pontos

```
┌─────────────────────────────────────────────────────────────┐
│                 FLUXO: PAGAMENTO COM PONTOS                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuário seleciona "Pagar com Pontos"                     │
│     └─ Validar saldo >= total                                │
│                                                              │
│  2. Tap "Confirmar Pedido"                                   │
│     └─ Solicita biometria/PIN                                │
│                                                              │
│  3. Autenticação OK                                          │
│     └─ Debita pontos (Sistema de Pontos)                     │
│     └─ Cria transação: source = shop_purchase                │
│                                                              │
│  4. Cria pedido                                              │
│     └─ Order com status = pending                            │
│     └─ Gera pickup_code (QR Code)                            │
│                                                              │
│  5. Feedback                                                 │
│     └─ Tela de sucesso com animação                          │
│     └─ Exibe QR Code de retirada                             │
│     └─ Push notification enviada                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Fluxo: Pagamento com Dinheiro (Stripe)

```
┌─────────────────────────────────────────────────────────────┐
│                FLUXO: PAGAMENTO COM DINHEIRO                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuário seleciona "Pagar com Dinheiro"                   │
│     └─ Exibe opções: PIX ou Cartão                           │
│                                                              │
│  2. Tap "Confirmar Pedido"                                   │
│     └─ Cria PaymentIntent no Stripe                          │
│     └─ Redireciona para página de pagamento                  │
│                                                              │
│  3A. PIX selecionado                                         │
│     └─ Exibe QR Code PIX                                     │
│     └─ Aguarda confirmação (webhook)                         │
│     └─ Timeout: 15 minutos                                   │
│                                                              │
│  3B. Cartão selecionado                                      │
│     └─ Form de cartão (Stripe Elements)                      │
│     └─ Processa pagamento                                    │
│                                                              │
│  4. Pagamento confirmado (webhook)                           │
│     └─ Cria pedido: status = pending                         │
│     └─ Credita cashback (se configurado)                     │
│     └─ Cria transação: source = shop_cashback                │
│                                                              │
│  5. Feedback                                                 │
│     └─ Tela de sucesso                                       │
│     └─ QR Code de retirada                                   │
│     └─ Push notification                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Fluxo: Pagamento Misto

```
┌─────────────────────────────────────────────────────────────┐
│                  FLUXO: PAGAMENTO MISTO                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuário seleciona "Pagamento Misto"                      │
│     └─ Slider para definir quantidade de pontos              │
│     └─ Calcula valor restante em dinheiro                    │
│                                                              │
│  Exemplo:                                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Total: 1.300 pts (R$ 179,80)                       │    │
│  │                                                     │    │
│  │  Usar pontos: [────●─────────] 500 pts              │    │
│  │                                                     │    │
│  │  Pontos: 500 pts                                    │    │
│  │  Dinheiro: R$ 110,65                                │    │
│  │  Cashback: 55 pts (5%)                              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  2. Tap "Confirmar Pedido"                                   │
│     └─ Solicita biometria/PIN                                │
│     └─ Debita pontos                                         │
│     └─ Redireciona para Stripe                               │
│                                                              │
│  3. Pagamento Stripe OK                                      │
│     └─ Cria pedido                                           │
│     └─ Credita cashback                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Regras de Pagamento Misto

| Contexto | `allow_mixed_payment` | Comportamento |
|----------|----------------------|---------------|
| **Loja** | `true` (padrão) | Usuário pode usar pontos + dinheiro |
| **Loja** | `false` | Usuário escolhe: pontos OU dinheiro |
| **PDV** | Sempre `false` | Usuário escolhe: pontos OU PIX |

> **Nota:** No PDV, o pagamento misto nunca é permitido, independente da configuração do produto. O usuário deve escolher entre pagar totalmente com pontos OU totalmente com PIX.

### 6.5 Tela de Sucesso

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                         ✓                                   │
│                                                             │
│                  PEDIDO CONFIRMADO!                         │
│                                                             │
│                  Pedido #A1B2C3                             │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│                      [QR CODE]                              │
│                                                             │
│               Apresente este código                         │
│               na retirada do produto                        │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  📍 Sede Principal - Recepção                               │
│     Seg a Sex: 8h às 18h                                    │
│                                                             │
│  💰 Você ganhou 90 pts de cashback!                         │
│     Novo saldo: 1.340 pts                                   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              VER MEUS PEDIDOS                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              CONTINUAR COMPRANDO                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Favoritos

### 7.1 Tela de Favoritos

```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar            MEUS FAVORITOS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  5 produtos salvos                                          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐                           │
│  │   [Foto]    │ │   [Foto]    │                           │
│  │   ❤️        │ │   ❤️        │                           │
│  │ Camiseta    │ │ Boné A-hub  │                           │
│  │ 500 pts     │ │ 300 pts     │                           │
│  └─────────────┘ └─────────────┘                           │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐                           │
│  │   [Foto]    │ │   [Foto]    │                           │
│  │   ❤️        │ │   ❤️        │                           │
│  │ Voucher Spa │ │ ░ ESGOTADO  │                           │
│  │ 200 pts     │ │             │                           │
│  └─────────────┘ └─────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Comportamento

- Tap no coração: Remove dos favoritos
- Tap no card: Abre página do produto
- Lista ordenada por `created_at` DESC (mais recentes primeiro)

---

## 8. Avaliações

### 8.1 Enviar Avaliação

**Pré-requisito:** Usuário deve ter comprado o produto (order_id válido)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar           AVALIAR PRODUTO                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Foto]  Camiseta Oficial A-hub                             │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Como você avalia este produto?                             │
│                                                             │
│                  ☆ ☆ ☆ ☆ ☆                                  │
│                Toque para avaliar                           │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Conte sua experiência (opcional)                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │                                                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                       0/500 caracteres      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              ENVIAR AVALIAÇÃO                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Listagem de Avaliações

```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar              AVALIAÇÕES                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Camiseta Oficial A-hub                                     │
│  ⭐ 4.5 (23 avaliações)                                     │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  5 ⭐ ████████████████████ 18                               │
│  4 ⭐ ████████             4                                │
│  3 ⭐ ██                   1                                │
│  2 ⭐                      0                                │
│  1 ⭐                      0                                │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ João S.                               12 Jan 2026   │   │
│  │ ⭐⭐⭐⭐⭐                                            │   │
│  │                                                     │   │
│  │ Excelente qualidade! O tecido é muito macio e o    │   │
│  │ bordado ficou perfeito. Super recomendo!           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Maria L.                              10 Jan 2026   │   │
│  │ ⭐⭐⭐⭐                                              │   │
│  │                                                     │   │
│  │ Produto muito bom, só achei que demorou um pouco   │   │
│  │ para ficar pronto para retirada.                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Fluxo de Moderação

```
1. Usuário envia avaliação
   └─ status = pending

2. ADM recebe na fila de moderação
   └─ Pode aprovar ou rejeitar

3A. Aprovado
   └─ status = approved
   └─ Aparece na listagem pública
   └─ Atualiza average_rating do produto

3B. Rejeitado
   └─ status = rejected
   └─ Não aparece publicamente
   └─ Usuário pode editar e reenviar
```

---

## 9. Painel ADM

### 9.1 Dashboard de Vendas

```
┌─────────────────────────────────────────────────────────────┐
│  LOJA - DASHBOARD                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PERÍODO: [Últimos 30 dias ▼]                               │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │   VENDAS     │ │  RECEITA     │ │   PEDIDOS    │        │
│  │     127      │ │ R$ 15.420    │ │     89       │        │
│  │   +15% ▲     │ │   +22% ▲     │ │   +8% ▲      │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │PONTOS GASTOS │ │  CASHBACK    │ │ ESTOQUE BAIXO│        │
│  │   45.200     │ │   1.890 pts  │ │     🔴 5     │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  TOP PRODUTOS                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Camiseta Oficial A-hub          45 vendas        │   │
│  │ 2. Boné A-hub                      32 vendas        │   │
│  │ 3. Voucher Desconto 20%            28 vendas        │   │
│  │ 4. Caneca Térmica                  15 vendas        │   │
│  │ 5. Aula de Yoga                     7 vendas        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ESTOQUE BAIXO (< 10 unidades)                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 Camiseta M - Azul              3 unidades        │   │
│  │ 🔴 Boné Preto                     5 unidades        │   │
│  │ 🟡 Caneca Térmica                 8 unidades        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [Exportar CSV]  [Ver Relatório Completo]                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 CRUD de Categorias

| Ação | Campos |
|------|--------|
| Criar | Nome, Descrição, Imagem, Ordem |
| Editar | Todos os campos |
| Desativar | Soft delete (`is_active = false`) |
| Reordenar | Drag and drop |

### 9.3 CRUD de Produtos

**Formulário de Produto:**

| Seção | Campos |
|-------|--------|
| **Básico** | Nome, Slug, Categoria, Tipo |
| **Descrição** | Descrição curta, Descrição longa |
| **Preços** | Preço em pontos, Preço em dinheiro, Opções de pagamento |
| **Promoção** | Ativar promoção, Preços promocionais, Data de término |
| **Estoque** | Tipo (limitado/ilimitado), Quantidade, Limite por usuário |
| **Variações** | SKU, Nome, Atributos, Estoque, Preço override |
| **Imagens** | Galeria (drag and drop), Imagens por variação |
| **Especificações** | Lista chave-valor |
| **Cashback** | Percentual de cashback |
| **Restrições** | Planos elegíveis |
| **Voucher** | Dias de validade (se tipo = voucher) |
| **Destaque** | Marcar como destaque |
| **Retirada** | Local de retirada |

### 9.4 Moderação de Avaliações

```
┌─────────────────────────────────────────────────────────────┐
│  MODERAÇÃO DE AVALIAÇÕES                    Pendentes: 5    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Camiseta Oficial A-hub                              │   │
│  │ Por: João Silva                      13 Jan 2026    │   │
│  │ ⭐⭐⭐⭐⭐                                            │   │
│  │                                                     │   │
│  │ "Produto excelente! Qualidade incrível."            │   │
│  │                                                     │   │
│  │ ┌──────────────┐  ┌──────────────┐                 │   │
│  │ │   APROVAR ✓  │  │  REJEITAR ✗  │                 │   │
│  │ └──────────────┘  └──────────────┘                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.5 Relatórios

| Relatório | Conteúdo |
|-----------|----------|
| Vendas por período | Data, Quantidade, Receita (R$ e Pontos) |
| Vendas por produto | Produto, Vendas, Receita, Estoque |
| Vendas por categoria | Categoria, Vendas, Receita |
| Formas de pagamento | Pontos, Dinheiro, Misto (percentuais) |
| Cashback distribuído | Total de pontos creditados |

**Exportação:** CSV com todos os campos

---

## 10. Integrações

### 10.1 Sistema de Pontos

**Transações criadas pela Loja:**

| Source | Tipo | Descrição |
|--------|------|-----------|
| `shop_purchase` | debit | Compra com pontos |
| `shop_cashback` | credit | Cashback de compra em dinheiro |
| `refund` | credit | Estorno de cancelamento |

### 10.2 Stripe

**Eventos de Webhook:**

| Evento | Ação |
|--------|------|
| `payment_intent.succeeded` | Criar pedido, creditar cashback |
| `payment_intent.payment_failed` | Notificar falha, liberar carrinho |
| `charge.refunded` | Processar estorno |

### 10.3 Carteirinha (Verificação de Plano)

```
GET /api/users/{user_id}/membership

Response:
{
  "plan_id": "gold",
  "plan_name": "Gold",
  "is_active": true
}
```

Usado para validar `eligible_plans` do produto.

---

## 11. Notificações

### 11.1 Push Notifications

| Evento | Template |
|--------|----------|
| Compra confirmada | "Pedido #{code} confirmado! 🛍️" |
| Pedido pronto | "Seu pedido #{code} está pronto para retirada! 📦" |
| Voucher disponível | "Seu voucher {name} está disponível! Use em até {days} dias." |
| Voucher expirando | "Seu voucher {name} expira em 7 dias! ⏰" |
| Voucher expirado | "Seu voucher {name} expirou. 😔" |
| Cashback creditado | "Você ganhou {points} pts de cashback! 💰" |

### 11.2 In-App

Notificações exibidas na central de notificações do app.

---

## 12. Segurança

### 12.1 Autenticação de Compra

- **Biometria** ou **PIN** obrigatório para confirmar checkout
- Validação de saldo antes do débito
- Transações atômicas (rollback em caso de falha)

### 12.2 Proteção contra Fraude

| Medida | Implementação |
|--------|---------------|
| Rate limiting | Máx 10 checkouts/hora por usuário |
| Limite por produto | Configurável pelo ADM |
| Validação de estoque | Double-check antes de confirmar |
| Log de transações | Auditoria completa |

### 12.3 Dados Sensíveis

- Dados de cartão processados apenas pelo Stripe
- Nenhum dado de cartão armazenado localmente
- Tokens de pagamento com validade curta

---

## 13. Performance

### 13.1 Cache

| Recurso | TTL | Invalidação |
|---------|-----|-------------|
| Lista de categorias | 1 hora | CRUD de categoria |
| Lista de produtos | 15 min | CRUD de produto |
| Produto individual | 5 min | Edição ou compra |
| Estoque | Sem cache | Tempo real |

### 13.2 Paginação

| Endpoint | Itens por página | Máximo |
|----------|------------------|--------|
| Listagem de produtos | 20 | 100 |
| Avaliações | 10 | 50 |
| Histórico de compras | 20 | 100 |

### 13.3 Imagens

- Resize automático para diferentes tamanhos
- Lazy loading na listagem
- Formato WebP com fallback para JPEG
