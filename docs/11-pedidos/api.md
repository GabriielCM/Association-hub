---
module: pedidos
document: api
status: complete
priority: phase2
last_updated: 2026-01-13
---

# Pedidos - API

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Pedidos (Usuário)](#2-pedidos-usuário)
3. [Vouchers](#3-vouchers)
4. [ADM - Gestão](#4-adm---gestão)
5. [ADM - Relatórios](#5-adm---relatórios)

---

## 1. Visão Geral

### 1.1 Base URL

```
https://api.ahub.com/v1/orders
```

### 1.2 Autenticação

Todos os endpoints requerem `Authorization: Bearer {token}`.

### 1.3 Códigos de Resposta

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Não autorizado |
| 404 | Não encontrado |
| 409 | Conflito (ex: status inválido) |
| 422 | Entidade não processável |

---

## 2. Pedidos (Usuário)

### GET /orders

Lista pedidos do usuário autenticado.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `source` | String | Filtro: `store`, `pdv` |
| `status` | String | Filtro: `pending`, `confirmed`, `ready`, `completed`, `cancelled` |
| `page` | Integer | Página (default: 1) |
| `per_page` | Integer | Itens por página (default: 20, max: 100) |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "A1B2C3",
      "source": "store",
      "source_name": "Loja Online",
      "status": "ready",
      "status_label": "Pronto para Retirada",
      "items_preview": [
        {
          "name": "Camiseta Oficial A-hub",
          "image": "https://cdn.ahub.com/products/camiseta-thumb.jpg"
        },
        {
          "name": "Boné A-hub",
          "image": "https://cdn.ahub.com/products/bone-thumb.jpg"
        }
      ],
      "items_count": 3,
      "total_points": 1300,
      "total_money": 179.80,
      "created_at": "2026-01-13T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 15,
    "total_pages": 1
  }
}
```

---

### GET /orders/{id}

Detalhes completos de um pedido.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "code": "A1B2C3",
    "source": "store",
    "source_name": "Loja Online",
    "status": "ready",
    "status_label": "Pronto para Retirada",
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Camiseta Oficial A-hub",
        "variant_name": "M - Azul",
        "product_image": "https://cdn.ahub.com/products/camiseta-thumb.jpg",
        "quantity": 2,
        "unit_price_points": 500,
        "unit_price_money": 89.90,
        "total_points": 1000,
        "total_money": 179.80,
        "type": "physical"
      },
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Voucher Desconto 20%",
        "variant_name": null,
        "product_image": "https://cdn.ahub.com/products/voucher-thumb.jpg",
        "quantity": 1,
        "unit_price_points": 200,
        "unit_price_money": null,
        "total_points": 200,
        "total_money": null,
        "type": "voucher",
        "voucher": {
          "code": "AHUB-XXXX-YYYY",
          "status": "available",
          "expires_at": "2026-02-13T23:59:59Z"
        }
      }
    ],
    "subtotal_points": 1200,
    "subtotal_money": 179.80,
    "payment_method": "mixed",
    "points_used": 500,
    "money_paid": 89.90,
    "cashback_earned": 45,
    "pickup_location": "Sede Principal - Recepção",
    "pickup_code": "QR_CODE_DATA_BASE64",
    "timeline": [
      {
        "status": "ready",
        "label": "Pronto para Retirada",
        "description": "Produtos separados",
        "created_at": "2026-01-13T15:00:00Z"
      },
      {
        "status": "confirmed",
        "label": "Confirmado",
        "description": "Pedido em separação",
        "created_at": "2026-01-13T11:00:00Z"
      },
      {
        "status": "pending",
        "label": "Pedido Realizado",
        "description": "Pagamento confirmado",
        "created_at": "2026-01-13T10:30:00Z"
      }
    ],
    "receipt": {
      "number": "REC-2026-000123",
      "available": true
    },
    "created_at": "2026-01-13T10:30:00Z",
    "updated_at": "2026-01-13T15:00:00Z"
  }
}
```

---

### GET /orders/{id}/receipt

Retorna dados do comprovante.

**Response:**
```json
{
  "data": {
    "receipt_number": "REC-2026-000123",
    "order": {
      "code": "A1B2C3",
      "created_at": "2026-01-13T10:30:00Z"
    },
    "user": {
      "name": "João Silva",
      "email": "joao.silva@email.com",
      "member_since": "2025-06-01"
    },
    "items": [
      {
        "name": "Camiseta Oficial A-hub (M - Azul)",
        "quantity": 2,
        "unit_price": "500 pts",
        "total": "1.000 pts"
      }
    ],
    "subtotal": "1.300 pts",
    "payment": {
      "points_used": 500,
      "money_paid": 89.90,
      "cashback": 45
    },
    "pickup_location": "Sede Principal - Recepção"
  }
}
```

---

## 3. Vouchers

### GET /orders/{order_id}/vouchers

Lista vouchers de um pedido.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "order_item_id": "uuid",
      "product_name": "Voucher Desconto 20%",
      "code": "AHUB-XXXX-YYYY",
      "qr_code": "QR_CODE_DATA_BASE64",
      "status": "available",
      "instructions": "Apresente este código ao garçom.",
      "expires_at": "2026-02-13T23:59:59Z",
      "used_at": null
    }
  ]
}
```

---

### GET /orders/{order_id}/vouchers/{voucher_id}

Detalhes de um voucher específico.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "product_name": "Voucher Desconto 20%",
    "product_description": "20% de desconto no Restaurante Parceiro",
    "code": "AHUB-XXXX-YYYY",
    "qr_code": "QR_CODE_DATA_BASE64",
    "status": "available",
    "status_label": "Disponível para uso",
    "instructions": "Apresente este código ao garçom antes de pedir.",
    "terms": "Válido para consumo no local. Não cumulativo.",
    "expires_at": "2026-02-13T23:59:59Z",
    "expires_in_days": 31,
    "used_at": null
  }
}
```

---

## 4. ADM - Gestão

### GET /admin/orders

Lista todos os pedidos com filtros avançados.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `source` | String | `store`, `pdv` |
| `status` | String | Status do pedido |
| `user_id` | UUID | Filtrar por usuário |
| `start_date` | Date | Data inicial |
| `end_date` | Date | Data final |
| `search` | String | Busca por código ou nome |
| `page` | Integer | Página |
| `per_page` | Integer | Itens por página |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "A1B2C3",
      "user": {
        "id": "uuid",
        "name": "João Silva",
        "email": "joao@email.com"
      },
      "source": "store",
      "source_name": "Loja Online",
      "status": "pending",
      "items_count": 3,
      "total_points": 1300,
      "total_money": 179.80,
      "created_at": "2026-01-13T10:30:00Z"
    }
  ],
  "summary": {
    "pending": 12,
    "confirmed": 8,
    "ready": 5,
    "completed_today": 23,
    "cancelled_today": 2
  },
  "meta": {
    "current_page": 1,
    "total": 50,
    "total_pages": 3
  }
}
```

---

### GET /admin/orders/{id}

Detalhes completos do pedido (visão ADM).

**Response:** Similar ao endpoint de usuário, com campos adicionais:
```json
{
  "data": {
    "...": "...",
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "+55 11 99999-9999",
      "plan": "Gold"
    },
    "stripe_payment_id": "pi_xxx",
    "cancelled_by": null,
    "cancelled_reason": null,
    "admin_notes": []
  }
}
```

---

### PATCH /admin/orders/{id}/status

Atualiza status do pedido.

**Request:**
```json
{
  "status": "confirmed",
  "notes": "Produtos separados e conferidos"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "status": "confirmed",
    "status_history": [...]
  }
}
```

**Erros:**
| Código | Erro | Descrição |
|--------|------|-----------|
| 409 | `INVALID_TRANSITION` | Transição de status não permitida |

---

### POST /admin/orders/{id}/cancel

Cancela pedido com estorno.

**Request:**
```json
{
  "reason": "Produto indisponível"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "status": "cancelled",
    "refund": {
      "points_refunded": 500,
      "money_refunded": 89.90,
      "cashback_removed": 45,
      "stock_restored": true
    }
  }
}
```

---

### POST /admin/orders/batch/status

Atualiza status de múltiplos pedidos.

**Request:**
```json
{
  "order_ids": ["uuid1", "uuid2", "uuid3"],
  "status": "confirmed",
  "notes": "Lote processado"
}
```

**Response:**
```json
{
  "data": {
    "updated": 3,
    "failed": 0,
    "results": [
      {"order_id": "uuid1", "success": true},
      {"order_id": "uuid2", "success": true},
      {"order_id": "uuid3", "success": true}
    ]
  }
}
```

---

### POST /admin/orders/pickup/validate

Valida QR Code de retirada.

**Request:**
```json
{
  "qr_data": "QR_CODE_SCANNED_DATA"
}
```

**Response (Válido):**
```json
{
  "valid": true,
  "data": {
    "order_id": "uuid",
    "code": "A1B2C3",
    "user": {
      "name": "João Silva"
    },
    "items": [
      {
        "name": "Camiseta Oficial A-hub",
        "variant": "M - Azul",
        "quantity": 2
      }
    ],
    "status": "ready"
  }
}
```

**Response (Inválido):**
```json
{
  "valid": false,
  "error": {
    "code": "ORDER_ALREADY_COMPLETED",
    "message": "Este pedido já foi retirado"
  }
}
```

---

### POST /admin/orders/{id}/complete

Confirma retirada/conclusão do pedido.

**Request:**
```json
{
  "notes": "Entregue ao cliente"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "status": "completed",
    "completed_at": "2026-01-13T16:00:00Z"
  }
}
```

---

### POST /admin/vouchers/{voucher_id}/use

Marca voucher como utilizado.

**Request:**
```json
{
  "notes": "Utilizado no Restaurante Parceiro"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "status": "used",
    "used_at": "2026-01-13T19:30:00Z"
  }
}
```

---

## 5. ADM - Relatórios

### GET /admin/reports/orders

Relatório de pedidos.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `start_date` | Date | Data inicial |
| `end_date` | Date | Data final |
| `group_by` | String | `day`, `week`, `month` |
| `source` | String | `store`, `pdv`, `all` |

**Response:**
```json
{
  "data": {
    "period": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "summary": {
      "total_orders": 523,
      "completed": 489,
      "cancelled": 12,
      "pending": 22,
      "revenue_points": 125400,
      "revenue_money": 15420.50,
      "cashback_distributed": 3210
    },
    "by_source": {
      "store": {
        "orders": 312,
        "revenue_points": 89000,
        "revenue_money": 12350.00
      },
      "pdv": {
        "orders": 211,
        "revenue_points": 36400,
        "revenue_money": 3070.50
      }
    },
    "by_period": [
      {
        "date": "2026-01-01",
        "orders": 15,
        "revenue_points": 4500,
        "revenue_money": 520.00
      }
    ],
    "by_status": {
      "completed": 489,
      "cancelled": 12,
      "pending": 22
    },
    "average_processing_time": {
      "pending_to_confirmed": "2h 15m",
      "confirmed_to_ready": "1h 30m",
      "ready_to_completed": "4h 45m"
    }
  }
}
```

---

### GET /admin/reports/orders/export

Exporta relatório em CSV.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `start_date` | Date | Data inicial |
| `end_date` | Date | Data final |
| `source` | String | Filtro por fonte |
| `status` | String | Filtro por status |

**Response:** Arquivo CSV

**Colunas:**
```
order_code, user_name, user_email, source, status, items_count,
total_points, total_money, payment_method, created_at, completed_at
```

---

## Apêndice: Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `ORDER_NOT_FOUND` | Pedido não encontrado |
| `INVALID_TRANSITION` | Transição de status inválida |
| `ORDER_ALREADY_COMPLETED` | Pedido já foi concluído |
| `ORDER_ALREADY_CANCELLED` | Pedido já foi cancelado |
| `VOUCHER_NOT_FOUND` | Voucher não encontrado |
| `VOUCHER_ALREADY_USED` | Voucher já foi utilizado |
| `VOUCHER_EXPIRED` | Voucher expirado |
| `INVALID_QR_CODE` | QR Code inválido |
| `REFUND_FAILED` | Falha no estorno |
