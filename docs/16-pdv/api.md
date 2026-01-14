---
module: pdv
document: api
status: complete
priority: mvp
last_updated: 2026-01-13
---

# PDV - API

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Display (Interface Kiosk)](#1-display-interface-kiosk)
2. [App (Pagamento Usuário)](#2-app-pagamento-usuário)
3. [ADM (Gestão)](#3-adm-gestão)
4. [Webhooks](#4-webhooks)
5. [Códigos de Erro](#5-códigos-de-erro)

---

## Base URL

```
Produção: https://api.ahub.com.br/v1
Staging:  https://api-staging.ahub.com.br/v1
```

---

## 1. Display (Interface Kiosk)

### Autenticação

O display autentica via API Key no header:

```
X-PDV-API-Key: <api_key>
X-PDV-Secret: <secret>
```

---

### GET /pdv/:id/products

Retorna catálogo de produtos do PDV.

**Autenticação:** API Key (Display)

**Response 200:**

```json
{
  "data": {
    "pdv": {
      "id": "uuid",
      "name": "Geladeira - Sede",
      "location": "Corredor Principal"
    },
    "products": [
      {
        "id": "uuid",
        "name": "Água Mineral 500ml",
        "description": "Água mineral sem gás",
        "image_url": "https://...",
        "price_points": 10,
        "price_money": 5.00,
        "category": "Bebidas",
        "stock": 24,
        "is_available": true
      },
      {
        "id": "uuid",
        "name": "Suco de Laranja",
        "description": "Suco natural",
        "image_url": "https://...",
        "price_points": 12,
        "price_money": 6.00,
        "category": "Bebidas",
        "stock": 0,
        "is_available": false
      }
    ],
    "categories": ["Bebidas", "Snacks"],
    "points_config": {
      "points_to_money_rate": 0.50,
      "cashback_percent": 5.0
    },
    "updated_at": "2026-01-13T10:00:00Z"
  }
}
```

---

### POST /pdv/:id/checkout

Cria um novo checkout e gera QR Code.

**Autenticação:** API Key (Display)

**Request Body:**

```json
{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 1
    },
    {
      "product_id": "uuid",
      "quantity": 2
    }
  ]
}
```

**Response 201:**

```json
{
  "data": {
    "checkout_id": "uuid",
    "code": "abc123",
    "items": [
      {
        "product_id": "uuid",
        "name": "Água Mineral 500ml",
        "quantity": 1,
        "unit_price_points": 10,
        "unit_price_money": 5.00,
        "total_points": 10,
        "total_money": 5.00
      },
      {
        "product_id": "uuid",
        "name": "Refrigerante Cola",
        "quantity": 2,
        "unit_price_points": 15,
        "unit_price_money": 7.50,
        "total_points": 30,
        "total_money": 15.00
      }
    ],
    "total_points": 40,
    "total_money": 20.00,
    "qr_code_url": "https://api.ahub.com.br/qr/checkout/abc123",
    "qr_code_data": "eyJ0eXBlIjoicGR2X3BheW1lbnQiLC...",
    "status": "pending",
    "created_at": "2026-01-13T10:30:00Z",
    "expires_at": "2026-01-13T10:35:00Z"
  }
}
```

**Response 400 (Produto indisponível):**

```json
{
  "error": {
    "code": "PRODUCT_UNAVAILABLE",
    "message": "Um ou mais produtos estão indisponíveis",
    "details": {
      "unavailable_products": [
        {
          "product_id": "uuid",
          "name": "Suco de Laranja",
          "reason": "out_of_stock"
        }
      ]
    }
  }
}
```

---

### GET /pdv/checkout/:code/status

Verifica status de um checkout (polling do display).

**Autenticação:** API Key (Display)

**Response 200 (Pendente):**

```json
{
  "data": {
    "code": "abc123",
    "status": "pending",
    "expires_at": "2026-01-13T10:35:00Z",
    "seconds_remaining": 180
  }
}
```

**Response 200 (Aguardando PIX):**

```json
{
  "data": {
    "code": "abc123",
    "status": "awaiting_pix",
    "payment_method": "money",
    "pix_expires_at": "2026-01-13T10:36:00Z",
    "seconds_remaining": 240
  }
}
```

**Response 200 (Pago):**

```json
{
  "data": {
    "code": "abc123",
    "status": "paid",
    "payment_method": "points",
    "paid_at": "2026-01-13T10:31:00Z",
    "paid_by": {
      "name": "João Silva"
    },
    "cashback_earned": 0
  }
}
```

**Response 200 (Pago com PIX):**

```json
{
  "data": {
    "code": "abc123",
    "status": "paid",
    "payment_method": "money",
    "paid_at": "2026-01-13T10:32:00Z",
    "paid_by": {
      "name": "João Silva"
    },
    "total_money": 20.00,
    "cashback_earned": 1
  }
}
```

**Response 200 (Expirado):**

```json
{
  "data": {
    "code": "abc123",
    "status": "expired"
  }
}
```

---

### POST /pdv/:id/checkout/:code/cancel

Cancela um checkout pendente.

**Autenticação:** API Key (Display)

**Response 200:**

```json
{
  "data": {
    "code": "abc123",
    "status": "cancelled",
    "cancelled_at": "2026-01-13T10:32:00Z"
  }
}
```

---

## 2. App (Pagamento Usuário)

Endpoints usados pelo app mobile para processar pagamentos de PDV.

### GET /wallet/pdv/checkout/:code

Retorna detalhes do checkout para o app (após escanear QR do display).

**Autenticação:** Bearer Token (JWT)

**Response 200:**

```json
{
  "data": {
    "checkout_id": "uuid",
    "code": "abc123",
    "pdv": {
      "id": "uuid",
      "name": "Geladeira - Sede",
      "location": "Corredor Principal"
    },
    "items": [
      {
        "product_id": "uuid",
        "name": "Água Mineral 500ml",
        "image_url": "https://...",
        "quantity": 1,
        "unit_price_points": 10,
        "unit_price_money": 5.00,
        "total_points": 10,
        "total_money": 5.00
      },
      {
        "product_id": "uuid",
        "name": "Refrigerante Cola",
        "image_url": "https://...",
        "quantity": 2,
        "unit_price_points": 15,
        "unit_price_money": 7.50,
        "total_points": 30,
        "total_money": 15.00
      }
    ],
    "total_points": 40,
    "total_money": 20.00,
    "user_balance": 350,
    "cashback_preview": 1,
    "status": "pending",
    "expires_at": "2026-01-13T10:35:00Z",
    "seconds_remaining": 180
  }
}
```

| Campo | Descrição |
|-------|-----------|
| `user_balance` | Saldo de pontos do usuário |
| `cashback_preview` | Pontos de cashback se pagar com PIX |

---

### POST /wallet/pdv/checkout/:code/pay

Paga checkout com pontos.

**Autenticação:** Bearer Token (JWT)

**Request Body:**

```json
{
  "payment_method": "points",
  "biometric_token": "token-from-device"
}
```

**Response 200:**

```json
{
  "data": {
    "success": true,
    "checkout_code": "abc123",
    "payment_method": "points",
    "total_points": 40,
    "new_balance": 310,
    "transaction_id": "uuid",
    "paid_at": "2026-01-13T10:31:00Z"
  }
}
```

**Response 400 (Saldo insuficiente):**

```json
{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Saldo insuficiente",
    "details": {
      "required": 40,
      "available": 25
    }
  }
}
```

---

### POST /wallet/pdv/checkout/:code/pix

Inicia pagamento PIX para checkout.

**Autenticação:** Bearer Token (JWT)

**Request Body:**

```json
{
  "payment_method": "money"
}
```

**Response 200:**

```json
{
  "data": {
    "checkout_code": "abc123",
    "payment_method": "money",
    "total_money": 20.00,
    "cashback_preview": 1,
    "pix": {
      "qr_code": "00020126580014br.gov.bcb.pix...",
      "qr_code_base64": "data:image/png;base64,iVBORw0KG...",
      "copy_paste": "00020126580014br.gov.bcb.pix...",
      "expires_at": "2026-01-13T10:36:00Z",
      "seconds_remaining": 300
    },
    "stripe_payment_intent_id": "pi_xxx"
  }
}
```

---

### GET /wallet/pdv/checkout/:code/pix/status

Verifica status do pagamento PIX (polling do app).

**Autenticação:** Bearer Token (JWT)

**Response 200 (Aguardando):**

```json
{
  "data": {
    "status": "awaiting_payment",
    "expires_at": "2026-01-13T10:36:00Z",
    "seconds_remaining": 180
  }
}
```

**Response 200 (Pago):**

```json
{
  "data": {
    "status": "paid",
    "paid_at": "2026-01-13T10:32:00Z",
    "total_money": 20.00,
    "cashback_earned": 1,
    "cashback_transaction_id": "uuid",
    "new_balance": 351
  }
}
```

**Response 200 (Expirado):**

```json
{
  "data": {
    "status": "expired",
    "message": "PIX expirado. Tente novamente."
  }
}
```

---

### POST /wallet/pdv/checkout/:code/cancel

Cancela checkout pelo app (antes de pagar).

**Autenticação:** Bearer Token (JWT)

**Response 200:**

```json
{
  "data": {
    "success": true,
    "checkout_code": "abc123",
    "status": "cancelled"
  }
}
```

---

## 3. ADM (Gestão)

### GET /admin/pdv

Lista todos os PDVs.

**Autenticação:** Bearer Token (JWT)
**Permissões:** ADM

**Response 200:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Geladeira - Sede",
      "location": "Corredor Principal",
      "status": "active",
      "stats": {
        "sales_today": 45,
        "revenue_today": 520,
        "products_count": 12,
        "out_of_stock_count": 1
      },
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /admin/pdv

Cria um novo PDV.

**Autenticação:** Bearer Token (JWT)
**Permissões:** ADM

**Request Body:**

```json
{
  "name": "Geladeira - Anexo",
  "location": "Sala de Reuniões",
  "display_config": {
    "theme": "default",
    "idle_timeout": 60,
    "checkout_timeout": 300
  }
}
```

**Response 201:**

```json
{
  "data": {
    "id": "uuid",
    "name": "Geladeira - Anexo",
    "location": "Sala de Reuniões",
    "status": "inactive",
    "api_key": "pdv_key_...",
    "api_secret": "pdv_secret_...",
    "created_at": "2026-01-11T10:00:00Z"
  }
}
```

---

### PUT /admin/pdv/:id

Atualiza um PDV.

**Autenticação:** Bearer Token (JWT)
**Permissões:** ADM

**Request Body:**

```json
{
  "name": "Geladeira - Sede Principal",
  "location": "Hall de Entrada",
  "status": "active"
}
```

**Response 200:**

```json
{
  "data": {
    "id": "uuid",
    "name": "Geladeira - Sede Principal",
    "location": "Hall de Entrada",
    "status": "active",
    "updated_at": "2026-01-11T10:00:00Z"
  }
}
```

---

### GET /admin/pdv/:id/stock

Retorna estoque do PDV.

**Autenticação:** Bearer Token (JWT)
**Permissões:** ADM

**Response 200:**

```json
{
  "data": {
    "pdv_id": "uuid",
    "pdv_name": "Geladeira - Sede",
    "products": [
      {
        "id": "uuid",
        "name": "Água Mineral 500ml",
        "price_points": 10,
        "stock": 24,
        "is_active": true,
        "low_stock": false
      },
      {
        "id": "uuid",
        "name": "Suco de Laranja",
        "price_points": 12,
        "stock": 0,
        "is_active": true,
        "low_stock": true
      }
    ],
    "summary": {
      "total_products": 12,
      "out_of_stock": 1,
      "low_stock": 2
    }
  }
}
```

---

### PUT /admin/pdv/:id/stock

Atualiza estoque de produtos.

**Autenticação:** Bearer Token (JWT)
**Permissões:** ADM

**Request Body:**

```json
{
  "updates": [
    {
      "product_id": "uuid",
      "stock": 48,
      "reason": "Reposição"
    },
    {
      "product_id": "uuid",
      "stock": 24,
      "reason": "Reposição"
    }
  ]
}
```

**Response 200:**

```json
{
  "data": {
    "updated": 2,
    "products": [
      {
        "product_id": "uuid",
        "name": "Água Mineral 500ml",
        "old_stock": 24,
        "new_stock": 48
      }
    ]
  }
}
```

---

### POST /admin/pdv/:id/products

Adiciona produto ao PDV.

**Autenticação:** Bearer Token (JWT)
**Permissões:** ADM

**Request Body:**

```json
{
  "name": "Chocolate",
  "description": "Barra de chocolate ao leite",
  "image_url": "https://...",
  "price_points": 25,
  "category": "Snacks",
  "initial_stock": 20
}
```

**Response 201:**

```json
{
  "data": {
    "id": "uuid",
    "pdv_id": "uuid",
    "name": "Chocolate",
    "price_points": 25,
    "stock": 20,
    "is_active": true,
    "created_at": "2026-01-11T10:00:00Z"
  }
}
```

---

### PUT /admin/pdv/:id/products/:product_id

Atualiza produto do PDV.

**Autenticação:** Bearer Token (JWT)
**Permissões:** ADM

**Request Body:**

```json
{
  "name": "Chocolate Premium",
  "price_points": 30,
  "is_active": true
}
```

**Response 200:** Mesma estrutura de criação

---

### DELETE /admin/pdv/:id/products/:product_id

Remove produto do PDV.

**Autenticação:** Bearer Token (JWT)
**Permissões:** ADM

**Response 200:**

```json
{
  "data": {
    "deleted": true,
    "product_id": "uuid"
  }
}
```

---

### GET /admin/pdv/:id/sales

Relatório de vendas do PDV.

**Autenticação:** Bearer Token (JWT)
**Permissões:** ADM

**Query Params:**

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `period` | String | Não | `today`, `week`, `month` (default: `today`) |
| `start_date` | Date | Não | Data inicial (YYYY-MM-DD) |
| `end_date` | Date | Não | Data final (YYYY-MM-DD) |

**Response 200:**

```json
{
  "data": {
    "pdv_id": "uuid",
    "pdv_name": "Geladeira - Sede",
    "period": {
      "start": "2026-01-11",
      "end": "2026-01-11"
    },
    "summary": {
      "total_sales": 45,
      "total_revenue": 520,
      "unique_customers": 32,
      "average_ticket": 11.5
    },
    "by_product": [
      {
        "product_id": "uuid",
        "name": "Água Mineral 500ml",
        "quantity_sold": 25,
        "revenue": 250
      },
      {
        "product_id": "uuid",
        "name": "Refrigerante Cola",
        "quantity_sold": 15,
        "revenue": 225
      }
    ],
    "by_hour": [
      { "hour": 8, "sales": 5 },
      { "hour": 9, "sales": 8 },
      { "hour": 10, "sales": 12 }
    ]
  }
}
```

---

## 4. Webhooks

### Webhook de Aguardando PIX

Enviado ao display quando usuário escolhe pagar com PIX.

**Event:** `checkout.awaiting_pix`

**Payload:**

```json
{
  "event": "checkout.awaiting_pix",
  "timestamp": "2026-01-13T10:31:00Z",
  "data": {
    "checkout_code": "abc123",
    "pdv_id": "uuid",
    "payment_method": "money",
    "total_money": 20.00,
    "pix_expires_at": "2026-01-13T10:36:00Z"
  }
}
```

---

### Webhook de Pagamento Confirmado

Enviado ao display quando um checkout é pago (pontos ou PIX).

**Event:** `checkout.paid`

**Payload (Pontos):**

```json
{
  "event": "checkout.paid",
  "timestamp": "2026-01-13T10:31:00Z",
  "data": {
    "checkout_code": "abc123",
    "pdv_id": "uuid",
    "payment_method": "points",
    "paid_by": {
      "name": "João Silva"
    },
    "total_points": 40,
    "cashback_earned": 0
  }
}
```

**Payload (PIX):**

```json
{
  "event": "checkout.paid",
  "timestamp": "2026-01-13T10:32:00Z",
  "data": {
    "checkout_code": "abc123",
    "pdv_id": "uuid",
    "payment_method": "money",
    "paid_by": {
      "name": "João Silva"
    },
    "total_money": 20.00,
    "cashback_earned": 1
  }
}
```

### Webhook de Estoque Baixo

Enviado quando estoque atinge limite (< 5 unidades).

**Event:** `stock.low`

**Payload:**

```json
{
  "event": "stock.low",
  "timestamp": "2026-01-11T10:00:00Z",
  "data": {
    "pdv_id": "uuid",
    "pdv_name": "Geladeira - Sede",
    "product_id": "uuid",
    "product_name": "Água Mineral 500ml",
    "current_stock": 3
  }
}
```

---

## 5. Códigos de Erro

### Códigos do Display

| Código | HTTP | Descrição |
|--------|------|-----------|
| `PDV_NOT_FOUND` | 404 | PDV não encontrado |
| `PDV_INACTIVE` | 403 | PDV desativado |
| `PRODUCT_NOT_FOUND` | 404 | Produto não encontrado |
| `PRODUCT_UNAVAILABLE` | 400 | Produto sem estoque |
| `CHECKOUT_NOT_FOUND` | 404 | Checkout não encontrado |
| `CHECKOUT_EXPIRED` | 400 | Checkout expirado |
| `CHECKOUT_ALREADY_PAID` | 400 | Checkout já pago |
| `INVALID_API_KEY` | 401 | API Key inválida |

### Códigos do App (Pagamento)

| Código | HTTP | Descrição |
|--------|------|-----------|
| `CHECKOUT_NOT_FOUND` | 404 | Checkout não encontrado |
| `CHECKOUT_EXPIRED` | 400 | Checkout expirado |
| `CHECKOUT_ALREADY_PAID` | 400 | Checkout já pago |
| `INSUFFICIENT_BALANCE` | 400 | Saldo de pontos insuficiente |
| `BIOMETRIC_REQUIRED` | 400 | Token biométrico não enviado |
| `BIOMETRIC_INVALID` | 401 | Token biométrico inválido |
| `PIX_CREATION_FAILED` | 500 | Falha ao criar PIX no Stripe |
| `PIX_EXPIRED` | 400 | PIX expirado |
| `PIX_ALREADY_PAID` | 400 | PIX já pago |
| `PAYMENT_METHOD_INVALID` | 400 | Método deve ser 'points' ou 'money' |
| `MIXED_PAYMENT_NOT_ALLOWED` | 400 | PDV não aceita pagamento misto |

### Códigos do ADM

| Código | HTTP | Descrição |
|--------|------|-----------|
| `UNAUTHORIZED` | 401 | Token inválido |
| `FORBIDDEN` | 403 | Sem permissão ADM |
| `PDV_NAME_EXISTS` | 400 | Nome de PDV já existe |
| `INVALID_STOCK` | 400 | Valor de estoque inválido |

---

## Relacionados

- [Especificação](spec.md) - Arquitetura e fluxos
- [Critérios de Aceitação](acceptance-criteria.md) - Checklist
- [Minha Carteira - API](../05-minha-carteira/api.md) - Pagamento no app
- [Loja - API](../12-loja/api.md) - Comparação de pagamentos
