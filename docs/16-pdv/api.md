---
module: pdv
document: api
status: complete
priority: mvp
last_updated: 2026-01-11
---

# PDV - API

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Display (Interface Kiosk)](#1-display-interface-kiosk)
2. [ADM (Gestão)](#2-adm-gestão)
3. [Webhooks](#3-webhooks)
4. [Códigos de Erro](#4-códigos-de-erro)

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
        "category": "Bebidas",
        "stock": 0,
        "is_available": false
      }
    ],
    "categories": ["Bebidas", "Snacks"],
    "updated_at": "2026-01-11T10:00:00Z"
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
        "unit_price": 10,
        "total_price": 10
      },
      {
        "product_id": "uuid",
        "name": "Refrigerante Cola",
        "quantity": 2,
        "unit_price": 15,
        "total_price": 30
      }
    ],
    "total": 40,
    "qr_code_url": "https://api.ahub.com.br/qr/checkout/abc123",
    "qr_code_data": "eyJ0eXBlIjoicGR2X3BheW1lbnQiLC...",
    "status": "pending",
    "created_at": "2026-01-11T10:30:00Z",
    "expires_at": "2026-01-11T10:35:00Z"
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
    "expires_at": "2026-01-11T10:35:00Z",
    "seconds_remaining": 180
  }
}
```

**Response 200 (Pago):**

```json
{
  "data": {
    "code": "abc123",
    "status": "paid",
    "paid_at": "2026-01-11T10:31:00Z",
    "paid_by": {
      "name": "João Silva"
    }
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
    "cancelled_at": "2026-01-11T10:32:00Z"
  }
}
```

---

## 2. ADM (Gestão)

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

## 3. Webhooks

### Webhook de Pagamento Confirmado

Enviado ao display quando um checkout é pago.

**Event:** `checkout.paid`

**Payload:**

```json
{
  "event": "checkout.paid",
  "timestamp": "2026-01-11T10:31:00Z",
  "data": {
    "checkout_code": "abc123",
    "pdv_id": "uuid",
    "paid_by": {
      "name": "João Silva"
    },
    "total": 25
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

## 4. Códigos de Erro

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
