---
module: pdv
document: spec
status: complete
priority: mvp
last_updated: 2026-01-13
---

# PDV - Especificação

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Modelo de Dados](#2-modelo-de-dados)
3. [Interface do Display](#3-interface-do-display)
4. [Fluxo de Compra](#4-fluxo-de-compra)
5. [Pagamento PIX](#5-pagamento-pix)
6. [Gestão de Estoque](#6-gestão-de-estoque)
7. [Integração com App](#7-integração-com-app)
8. [Painel ADM](#8-painel-adm)
9. [Segurança](#9-segurança)
10. [Performance](#10-performance)

---

## 1. Visão Geral

### 1.1 Objetivo

O sistema PDV permite criar pontos de venda físicos com displays touchscreen onde usuários podem comprar produtos usando **pontos** ou **PIX** como forma de pagamento.

> **Importante:** No PDV, o pagamento é feito com Pontos OU PIX, nunca misto. Diferente da Loja que permite pagamento combinado.

### 1.2 Caso de Uso Principal

**Geladeira de Bebidas:**
- Display 24h ao lado da geladeira
- Usuário seleciona produtos no display
- Paga via QR Code no app
- Pega o produto da geladeira

### 1.3 Prioridade e Status

| Item | Valor |
|------|-------|
| Prioridade | 🔴 MVP |
| Status | 🟡 Em Especificação |
| Interfaces | Display (Kiosk), App (User), Web (ADM) |

---

## 2. Modelo de Dados

### 2.1 PDV

```json
{
  "id": "uuid",
  "name": "Geladeira - Sede",
  "location": "Corredor Principal",
  "status": "active",
  "display_config": {
    "theme": "default",
    "idle_timeout": 60,
    "checkout_timeout": 300
  },
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-11T00:00:00Z"
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `name` | String | Nome do PDV |
| `location` | String | Localização física |
| `status` | Enum | `active`, `inactive`, `maintenance` |
| `display_config` | JSON | Configurações do display |

### 2.2 Produto do PDV

```json
{
  "id": "uuid",
  "pdv_id": "uuid",
  "name": "Água Mineral 500ml",
  "description": "Água mineral sem gás",
  "image_url": "https://...",
  "price_points": 10,
  "price_money": 5.00,
  "category": "Bebidas",
  "stock": 24,
  "is_active": true,
  "created_at": "2026-01-01T00:00:00Z"
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `pdv_id` | UUID | PDV ao qual pertence |
| `name` | String | Nome do produto |
| `price_points` | Integer | Preço em pontos |
| `price_money` | Decimal | Preço em R$ (calculado via taxa global) |
| `stock` | Integer | Quantidade em estoque |
| `is_active` | Boolean | Se está disponível |

> **Nota:** O `price_money` é calculado automaticamente usando a taxa de conversão global (`points_to_money_rate`) definida no Sistema de Pontos. Ex: Se taxa = 0.50, então 10 pts = R$ 5,00.

### 2.3 Checkout

```json
{
  "id": "uuid",
  "code": "abc123",
  "pdv_id": "uuid",
  "items": [
    {
      "product_id": "uuid",
      "name": "Água Mineral 500ml",
      "quantity": 1,
      "unit_price_points": 10,
      "unit_price_money": 5.00,
      "total_points": 10,
      "total_money": 5.00
    }
  ],
  "total_points": 25,
  "total_money": 12.50,
  "payment_method": null,
  "status": "pending",
  "qr_code_url": "https://...",
  "stripe_payment_intent_id": null,
  "pix_qr_code": null,
  "pix_expires_at": null,
  "cashback_earned": null,
  "created_at": "2026-01-13T10:30:00Z",
  "expires_at": "2026-01-13T10:35:00Z",
  "paid_at": null,
  "paid_by_user_id": null
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `code` | String | Código único do checkout |
| `items` | Array | Produtos no carrinho |
| `total_points` | Integer | Total em pontos |
| `total_money` | Decimal | Total em R$ |
| `payment_method` | Enum | `points`, `money` (null até usuário escolher) |
| `status` | Enum | `pending`, `awaiting_pix`, `paid`, `expired`, `cancelled` |
| `expires_at` | DateTime | Validade do QR do display (5 min) |
| `stripe_payment_intent_id` | String | ID do PaymentIntent Stripe (se PIX) |
| `pix_qr_code` | String | QR Code PIX para pagamento (se PIX) |
| `pix_expires_at` | DateTime | Validade do PIX (5 min após geração) |
| `cashback_earned` | Integer | Pontos de cashback ganhos (se PIX) |

> **Regra:** `payment_method` só pode ser `points` ou `money`, nunca `mixed`. Essa é a diferença principal entre PDV e Loja.

### 2.4 Venda

```json
{
  "id": "uuid",
  "checkout_id": "uuid",
  "pdv_id": "uuid",
  "user_id": "uuid",
  "items": [...],
  "payment_method": "points",
  "total_points": 25,
  "total_money": null,
  "points_transaction_id": "uuid",
  "stripe_payment_id": null,
  "cashback_earned": 0,
  "cashback_transaction_id": null,
  "created_at": "2026-01-13T10:31:00Z"
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `payment_method` | Enum | `points` ou `money` |
| `total_points` | Integer | Total pago em pontos (null se PIX) |
| `total_money` | Decimal | Total pago em R$ (null se pontos) |
| `points_transaction_id` | UUID | Transação de débito de pontos |
| `stripe_payment_id` | String | ID do pagamento Stripe (se PIX) |
| `cashback_earned` | Integer | Pontos de cashback (se PIX) |
| `cashback_transaction_id` | UUID | Transação de crédito de cashback |

---

## 3. Interface do Display

### 3.1 Tela Inicial (Idle)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                      [LOGO A-HUB]                           │
│                                                             │
│                                                             │
│              Toque para começar                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│  ───────────────────────────────────────────────────────── │
│  Geladeira - Sede                         10:30            │
└─────────────────────────────────────────────────────────────┘
```

- Exibida após `idle_timeout` segundos de inatividade
- Qualquer toque inicia sessão de compra
- Exibe nome do PDV e horário

### 3.2 Tela de Catálogo

```
┌─────────────────────────────────────────────────────────────┐
│  Geladeira - Sede                    [Carrinho 🛒 2]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Bebidas                                                    │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   [Foto]    │ │   [Foto]    │ │   [Foto]    │           │
│  │             │ │             │ │             │           │
│  │ Água 500ml  │ │ Refri Cola  │ │ Suco Laranja│           │
│  │ 10 pts      │ │ 15 pts      │ │ 12 pts      │           │
│  │ R$ 5,00     │ │ R$ 7,50     │ │ R$ 6,00     │           │
│  │  [Adicionar]│ │  [Adicionar]│ │ [Esgotado]  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐                           │
│  │   [Foto]    │ │   [Foto]    │                           │
│  │             │ │             │                           │
│  │ Energético  │ │ Água c/ Gás │                           │
│  │ 20 pts      │ │ 10 pts      │                           │
│  │ R$ 10,00    │ │ R$ 5,00     │                           │
│  │  [Adicionar]│ │  [Adicionar]│                           │
│  └─────────────┘ └─────────────┘                           │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  [                  Ir para Checkout                  ]     │
└─────────────────────────────────────────────────────────────┘
```

- Produtos exibem preço em pontos E em reais
- Preço em reais calculado automaticamente via taxa global

### 3.3 Tela de Carrinho/Checkout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar                                   Seu Carrinho    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Foto] Água Mineral 500ml                           │   │
│  │        1x      10 pts | R$ 5,00   [-] [1] [+] [🗑️] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Foto] Refrigerante Cola                            │   │
│  │        1x      15 pts | R$ 7,50   [-] [1] [+] [🗑️] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│                    TOTAL: 25 pts | R$ 12,50                 │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [                  Gerar QR de Pagamento               ]   │
│                                                             │
│  [                       Cancelar                       ]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Exibe ambos os valores (pontos e reais)
- Usuário escolherá o método de pagamento no app após escanear QR

### 3.4 Tela de QR Code (Aguardando Pagamento)

```
┌─────────────────────────────────────────────────────────────┐
│                      Pagamento                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│           Escaneie o QR Code com o App A-hub               │
│                                                             │
│                                                             │
│              ┌─────────────────────────┐                    │
│              │                         │                    │
│              │                         │                    │
│              │       [QR CODE]         │                    │
│              │                         │                    │
│              │                         │                    │
│              └─────────────────────────┘                    │
│                                                             │
│                                                             │
│              Total: 25 pts | R$ 12,50                       │
│              Pague com Pontos ou PIX                        │
│                                                             │
│              Aguardando pagamento...                        │
│              ░░░░░░░░░░░░░░░░░░░░░░░░░                      │
│              Expira em: 4:32                                │
│                                                             │
│                                                             │
│  [                       Cancelar                       ]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.5 Tela de Aguardando PIX

Exibida quando usuário escolhe pagar com PIX no app.

```
┌─────────────────────────────────────────────────────────────┐
│                      Pagamento PIX                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│              Aguardando pagamento PIX...                    │
│                                                             │
│                     💳 → 📱 → 🏦                            │
│                                                             │
│                                                             │
│                    Total: R$ 12,50                          │
│                                                             │
│              ░░░░░░░░░░░░░░░░░░░░░░░░░                      │
│              Expira em: 4:32                                │
│                                                             │
│                                                             │
│  [                       Cancelar                       ]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Display recebe webhook quando usuário escolhe PIX
- Atualiza para mostrar que está aguardando confirmação do banco

### 3.6 Tela de Sucesso

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                          ✓                                  │
│                                                             │
│                                                             │
│               Pagamento Confirmado!                         │
│                                                             │
│                                                             │
│               Pode retirar seu produto                      │
│                                                             │
│                                                             │
│               Obrigado pela compra!                         │
│                                                             │
│                                                             │
│                                                             │
│           (Voltando à tela inicial em 5s...)               │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Exibida após confirmação de pagamento (pontos ou PIX)
- Se PIX: exibe também "+X pts de cashback"

---

## 4. Fluxo de Compra

### 4.1 Diagrama de Sequência

```
┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐
│Display │      │Backend │      │  App   │      │Backend │
└───┬────┘      └───┬────┘      └───┬────┘      └───┬────┘
    │               │               │               │
    │ Selecionar    │               │               │
    │ produtos      │               │               │
    │───────────────│               │               │
    │               │               │               │
    │ POST checkout │               │               │
    │──────────────>│               │               │
    │               │               │               │
    │ QR Code       │               │               │
    │<──────────────│               │               │
    │               │               │               │
    │ Exibe QR      │               │               │
    │───────────────│               │               │
    │               │               │               │
    │               │  Escanear QR  │               │
    │               │<──────────────│               │
    │               │               │               │
    │               │  Detalhes     │               │
    │               │──────────────>│               │
    │               │               │               │
    │               │  Confirmar    │               │
    │               │  (biometria)  │               │
    │               │<──────────────│               │
    │               │               │               │
    │               │  POST pay     │               │
    │               │<──────────────│               │
    │               │               │               │
    │               │  Débito pontos│               │
    │               │──────────────────────────────>│
    │               │               │               │
    │               │  Sucesso      │               │
    │               │──────────────>│               │
    │               │               │               │
    │ Webhook       │               │               │
    │<──────────────│               │               │
    │ (pagamento    │               │               │
    │  confirmado)  │               │               │
    │               │               │               │
    │ Tela sucesso  │               │               │
    │───────────────│               │               │
    │               │               │               │
```

### 4.2 Estados do Checkout

```
                ┌──────────┐
                │ PENDING  │
                └────┬─────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
  ┌────────────┐ ┌────────┐  ┌────────┐
  │AWAITING_PIX│ │EXPIRED │  │CANCELLED│
  └─────┬──────┘ └────────┘  └────────┘
        │
    ┌───┴───┐
    │       │
    ▼       ▼
┌────────┐ ┌────────┐
│  PAID  │ │EXPIRED │
└────────┘ └────────┘
```

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando usuário escanear QR do display |
| `awaiting_pix` | Usuário escolheu PIX, aguardando pagamento no banco |
| `paid` | Pagamento confirmado (pontos ou PIX) |
| `expired` | QR expirou (5 min) ou PIX expirou (5 min) |
| `cancelled` | Cancelado pelo usuário |

---

## 5. Pagamento PIX

### 5.1 Visão Geral

O PDV aceita pagamento via PIX como alternativa aos pontos. O usuário escolhe o método de pagamento no app após escanear o QR Code do display.

**Regra Principal:** No PDV, o pagamento é **Pontos OU PIX**, nunca misto.

### 5.2 Fluxo de Pagamento PIX

```
┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐
│Display │      │Backend │      │  App   │      │ Stripe │      │ Banco  │
└───┬────┘      └───┬────┘      └───┬────┘      └───┬────┘      └───┬────┘
    │               │               │               │               │
    │ QR escaneado  │               │               │               │
    │               │<──────────────│               │               │
    │               │               │               │               │
    │               │  Detalhes     │               │               │
    │               │  (2 opções)   │               │               │
    │               │──────────────>│               │               │
    │               │               │               │               │
    │               │  Usuário      │               │               │
    │               │  escolhe PIX  │               │               │
    │               │<──────────────│               │               │
    │               │               │               │               │
    │               │  Criar PIX    │               │               │
    │               │──────────────────────────────>│               │
    │               │               │               │               │
    │               │  QR Code PIX  │               │               │
    │               │<──────────────────────────────│               │
    │               │               │               │               │
    │ Webhook       │  Exibe QR PIX │               │               │
    │ (awaiting_pix)│──────────────>│               │               │
    │<──────────────│               │               │               │
    │               │               │               │               │
    │ Mostra        │               │  Paga PIX     │               │
    │ "Aguardando   │               │  no app banco │               │
    │  PIX..."      │               │──────────────────────────────>│
    │               │               │               │               │
    │               │               │  Webhook      │               │
    │               │<──────────────────────────────│               │
    │               │  (payment     │               │               │
    │               │   confirmed)  │               │               │
    │               │               │               │               │
    │               │  Credita      │               │               │
    │               │  cashback     │               │               │
    │               │───────────────│               │               │
    │               │               │               │               │
    │ Webhook       │               │               │               │
    │ (paid)        │               │               │               │
    │<──────────────│               │               │               │
    │               │               │               │               │
    │ Tela sucesso  │  Sucesso      │               │               │
    │               │──────────────>│               │               │
    │               │               │               │               │
```

### 5.3 Telas do App - Escolha de Método

Após escanear o QR Code do display, o app exibe opções de pagamento.

```
┌─────────────────────────────────────┐
│         Geladeira - Sede            │
├─────────────────────────────────────┤
│                                     │
│  Água Mineral 500ml         x1      │
│  Refrigerante Cola          x1      │
│  ─────────────────────────────────  │
│  Total:                             │
│    • 25 pts                         │
│    • R$ 12,50                       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   💰 Pagar com Pontos       │    │
│  │      Saldo: 340 pts         │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   📱 Pagar com PIX          │    │
│  │      +1 pt cashback         │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Cancelar]                         │
└─────────────────────────────────────┘
```

### 5.4 Telas do App - QR Code PIX

Quando usuário escolhe PIX, o app gera e exibe o QR Code para pagamento.

```
┌─────────────────────────────────────┐
│         Pagamento PIX               │
├─────────────────────────────────────┤
│                                     │
│     Escaneie com seu banco          │
│                                     │
│        ┌─────────────────┐          │
│        │                 │          │
│        │   [QR CODE]     │          │
│        │                 │          │
│        └─────────────────┘          │
│                                     │
│        R$ 12,50                     │
│                                     │
│        Expira em: 4:32              │
│                                     │
│  ─────────────────────────────────  │
│  Ou copie o código PIX:             │
│  ┌─────────────────────────────┐    │
│  │ 00020126...           [📋] │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Cancelar]                         │
└─────────────────────────────────────┘
```

### 5.5 Integração Stripe

**Criação do PIX:**
```json
POST /v1/payment_intents
{
  "amount": 1250,
  "currency": "brl",
  "payment_method_types": ["pix"],
  "metadata": {
    "pdv_id": "uuid",
    "checkout_code": "abc123"
  }
}
```

**Webhook de Confirmação:**
```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "status": "succeeded",
      "metadata": {
        "pdv_id": "uuid",
        "checkout_code": "abc123"
      }
    }
  }
}
```

### 5.6 Cashback

Compras com PIX geram cashback em pontos.

| Configuração | Valor |
|--------------|-------|
| Taxa global | Definida em `PointsConfig.cashback_percent` |
| Exemplo | 5% → R$ 12,50 = 1 pt de cashback (arredondado) |
| Crédito | Imediato após confirmação do PIX |
| Source | `pdv_cashback` no Sistema de Pontos |

### 5.7 Expiração e Timeout

| Fase | Tempo | Ação |
|------|-------|------|
| QR do display | 5 minutos | Volta à tela inicial |
| PIX no app | 5 minutos | Cancela e volta ao início |
| Falha no pagamento | Imediato | Volta à tela inicial |

---

## 6. Gestão de Estoque

### 6.1 Regras de Estoque

- Cada produto tem estoque por PDV
- Estoque = 0 → Produto exibido como "Esgotado"
- Estoque baixo (< 5) → Alerta para ADM
- Débito de estoque ocorre após pagamento confirmado

### 6.2 Fluxo de Estoque

```
1. Checkout criado → Estoque NÃO reservado
2. Pagamento confirmado → Estoque debitado
3. Checkout expirado → Nenhuma alteração
4. Checkout cancelado → Nenhuma alteração
```

### 6.3 Reposição

- ADM acessa painel de estoque
- Seleciona PDV e produto
- Informa nova quantidade
- Sistema registra movimentação

---

## 7. Integração com App

### 7.1 Estrutura do QR Code

```json
{
  "type": "pdv_payment",
  "checkout_code": "abc123",
  "pdv_id": "uuid",
  "pdv_name": "Geladeira - Sede",
  "total_points": 25,
  "total_money": 12.50,
  "expires_at": "2026-01-13T10:35:00Z"
}
```

### 7.2 Fluxo no App

1. Scanner detecta QR tipo `pdv_payment`
2. App busca detalhes via `GET /wallet/pdv/checkout/:code`
3. Exibe tela com opções: "Pagar com Pontos" ou "Pagar com PIX"
4. Se Pontos: solicita biometria → `POST /wallet/pdv/pay`
5. Se PIX: gera QR PIX → `POST /wallet/pdv/pix/create` → usuário paga no banco
6. Exibe tela de sucesso

### 7.3 Notificação ao Display

- Backend envia webhook ao display
- Display recebe eventos:
  - `checkout_awaiting_pix` → Mostra "Aguardando PIX..."
  - `checkout_paid` → Mostra "Pagamento Confirmado"
- Atualiza tela em tempo real

---

## 8. Painel ADM

### 8.1 Gestão de PDVs

```
┌─────────────────────────────────────────────────────────────┐
│  PDVs                                     [+ Novo PDV]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Geladeira - Sede                                    │   │
│  │ Status: ● Ativo    Local: Corredor Principal        │   │
│  │ Vendas hoje: 45    Receita: 520 pts                 │   │
│  │ [Editar] [Estoque] [Relatório] [Desativar]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Geladeira - Anexo                                   │   │
│  │ Status: ○ Inativo  Local: Sala de Reuniões          │   │
│  │ [Editar] [Estoque] [Relatório] [Ativar]            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Gestão de Estoque

```
┌─────────────────────────────────────────────────────────────┐
│  ← Geladeira - Sede > Estoque            [+ Produto]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Produto               Pontos    R$     Estoque    Ação     │
│  ────────────────────────────────────────────────────────   │
│  Água Mineral 500ml    10 pts   R$5,00    24      [Editar]  │
│  Refrigerante Cola     15 pts   R$7,50    18      [Editar]  │
│  Suco de Laranja       12 pts   R$6,00     0      [Repor]   │
│  Energético            20 pts  R$10,00     8      [Editar]  │
│  Água com Gás          10 pts   R$5,00    12      [Editar]  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Total de produtos: 5                                       │
│  Produtos esgotados: 1                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Preço em R$ calculado automaticamente via taxa global

### 8.3 Relatórios

**Relatório por PDV:**
- Vendas por período (dia, semana, mês)
- Receita em pontos e R$
- Produtos mais vendidos
- Horários de pico
- Método de pagamento (Pontos vs PIX)

**Relatório por Produto:**
- Vendas totais
- Receita gerada (pontos e R$)
- Estoque atual vs. vendido

---

## 9. Segurança

### 9.1 Autenticação do Display

- Display autentica via API Key + Secret
- Renovação automática de tokens
- IP whitelist opcional

### 9.2 QR Code

- Validade: 5 minutos
- Código único por checkout
- Não pode ser reutilizado após pagamento

### 9.3 Pagamento

- Requer biometria no app (para pontos)
- Validação de saldo no servidor
- Transação atômica (débito + venda)
- PIX processado via Stripe com webhook

### 9.4 PIX

- QR Code PIX expira em 5 minutos
- Webhook Stripe valida autenticidade
- Cashback creditado apenas após confirmação

---

## 10. Performance

### 10.1 Metas

| Operação | Meta |
|----------|------|
| Carregar catálogo | < 2s |
| Gerar checkout | < 1s |
| Processar pagamento | < 3s |
| Atualizar display após pagamento | < 2s |

### 10.2 Cache

- Catálogo cacheado no display (5 min)
- Estoque atualizado em tempo real via WebSocket
- Imagens de produtos pré-carregadas

### 10.3 Resiliência

- Display funciona offline com catálogo cacheado
- Checkout requer conexão
- Retry automático em falhas de rede

---

## Relacionados

- [API](api.md) - Endpoints
- [Critérios de Aceitação](acceptance-criteria.md) - Checklist
- [Sistema de Pontos](../06-sistema-pontos/) - Débito de pontos e cashback
- [Minha Carteira](../05-minha-carteira/) - Interface de pagamento
- [Loja](../12-loja/) - Comparação de pagamentos (Loja permite misto, PDV não)
