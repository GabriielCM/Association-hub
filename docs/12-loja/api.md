---
module: loja
document: api
status: complete
priority: phase2
last_updated: 2026-01-13
---

# Loja - API

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Categorias](#2-categorias)
3. [Produtos](#3-produtos)
4. [Variações](#4-variações)
5. [Carrinho](#5-carrinho)
6. [Checkout](#6-checkout)
7. [Favoritos](#7-favoritos)
8. [Avaliações](#8-avaliações)
9. [ADM - Gestão](#9-adm---gestão)
10. [Webhooks](#10-webhooks)

---

## 1. Visão Geral

### 1.1 Base URL

```
https://api.ahub.com/v1/store
```

### 1.2 Autenticação

Todos os endpoints requerem `Authorization: Bearer {token}` exceto listagem pública de produtos.

### 1.3 Códigos de Resposta

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Não autorizado |
| 404 | Não encontrado |
| 409 | Conflito (ex: estoque insuficiente) |
| 422 | Entidade não processável |
| 429 | Rate limit excedido |

---

## 2. Categorias

### GET /categories

Lista todas as categorias ativas.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Vestuário",
      "slug": "vestuario",
      "description": "Camisetas, bonés e acessórios",
      "image_url": "https://cdn.ahub.com/categories/vestuario.jpg",
      "product_count": 15
    }
  ]
}
```

---

## 3. Produtos

### GET /products

Lista produtos com paginação e filtros.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `category` | String | Slug da categoria |
| `sort` | String | `recent`, `price_asc`, `price_desc`, `sold`, `name` |
| `featured` | Boolean | Apenas destaques |
| `page` | Integer | Página (default: 1) |
| `per_page` | Integer | Itens por página (default: 20, max: 100) |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Camiseta Oficial A-hub",
      "slug": "camiseta-oficial-ahub",
      "short_description": "Camiseta 100% algodão",
      "type": "physical",
      "price_points": 500,
      "price_money": 89.90,
      "payment_options": "both",
      "is_featured": true,
      "is_promotional": false,
      "promotional_price_points": null,
      "promotional_price_money": null,
      "average_rating": 4.5,
      "review_count": 23,
      "thumbnail_url": "https://cdn.ahub.com/products/camiseta-thumb.jpg",
      "is_available": true,
      "is_favorited": false
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

---

### GET /products/{slug}

Detalhes de um produto.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "category": {
      "id": "uuid",
      "name": "Vestuário",
      "slug": "vestuario"
    },
    "name": "Camiseta Oficial A-hub",
    "slug": "camiseta-oficial-ahub",
    "short_description": "Camiseta 100% algodão com logo bordado",
    "long_description": "Camiseta oficial do A-hub...",
    "type": "physical",
    "price_points": 500,
    "price_money": 89.90,
    "payment_options": "both",
    "stock_type": "limited",
    "stock_count": 50,
    "limit_per_user": 2,
    "user_purchase_count": 0,
    "cashback_percent": 5.0,
    "is_featured": true,
    "is_promotional": false,
    "promotional_price_points": null,
    "promotional_price_money": null,
    "promotional_ends_at": null,
    "eligible_plans": null,
    "user_is_eligible": true,
    "pickup_location": "Sede Principal - Recepção",
    "average_rating": 4.5,
    "review_count": 23,
    "is_favorited": false,
    "images": [
      {
        "id": "uuid",
        "url": "https://cdn.ahub.com/products/camiseta-1.jpg",
        "alt_text": "Camiseta A-hub frente"
      }
    ],
    "specifications": [
      {
        "key": "Material",
        "value": "100% Algodão"
      }
    ],
    "variants": [
      {
        "id": "uuid",
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
        "is_available": true
      }
    ],
    "variant_attributes": [
      {
        "name": "size",
        "label": "Tamanho",
        "values": ["P", "M", "G", "GG", "XG"]
      },
      {
        "name": "color",
        "label": "Cor",
        "values": ["Azul", "Preto", "Branco"]
      }
    ]
  }
}
```

---

## 4. Variações

### GET /products/{product_id}/variants/{variant_id}

Detalhes de uma variação específica.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "sku": "CAM-AH-M-AZL",
    "name": "M - Azul",
    "attributes": {
      "size": "M",
      "color": "Azul"
    },
    "price_points": 500,
    "price_money": 89.90,
    "stock_count": 12,
    "image_url": "https://cdn.ahub.com/products/camiseta-azul.jpg",
    "is_available": true
  }
}
```

---

## 5. Carrinho

### GET /cart

Retorna o carrinho do usuário autenticado.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "items": [
      {
        "id": "uuid",
        "product": {
          "id": "uuid",
          "name": "Camiseta Oficial A-hub",
          "thumbnail_url": "https://cdn.ahub.com/products/camiseta-thumb.jpg"
        },
        "variant": {
          "id": "uuid",
          "name": "M - Azul",
          "sku": "CAM-AH-M-AZL"
        },
        "quantity": 2,
        "unit_price_points": 500,
        "unit_price_money": 89.90,
        "subtotal_points": 1000,
        "subtotal_money": 179.80,
        "is_available": true
      }
    ],
    "subtotal_points": 1000,
    "subtotal_money": 179.80,
    "item_count": 2,
    "reserved_until": "2026-01-13T11:00:00Z",
    "expires_in_seconds": 1800
  }
}
```

---

### POST /cart/items

Adiciona item ao carrinho.

**Request:**
```json
{
  "product_id": "uuid",
  "variant_id": "uuid",
  "quantity": 2
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "product": {...},
    "variant": {...},
    "quantity": 2,
    "unit_price_points": 500,
    "unit_price_money": 89.90
  },
  "cart": {
    "subtotal_points": 1000,
    "subtotal_money": 179.80,
    "item_count": 2,
    "reserved_until": "2026-01-13T11:30:00Z"
  }
}
```

**Erros:**
| Código | Erro | Descrição |
|--------|------|-----------|
| 409 | `INSUFFICIENT_STOCK` | Estoque insuficiente |
| 409 | `LIMIT_EXCEEDED` | Limite por usuário excedido |
| 409 | `NOT_ELIGIBLE` | Usuário não elegível (plano) |
| 404 | `PRODUCT_NOT_FOUND` | Produto não existe ou inativo |

---

### PATCH /cart/items/{item_id}

Atualiza quantidade de um item.

**Request:**
```json
{
  "quantity": 3
}
```

**Response:** `200 OK`

---

### DELETE /cart/items/{item_id}

Remove item do carrinho.

**Response:** `204 No Content`

---

### DELETE /cart

Limpa o carrinho.

**Response:** `204 No Content`

---

## 6. Checkout

### POST /checkout/validate

Valida carrinho antes do checkout.

**Request:**
```json
{
  "payment_method": "points"
}
```

**Response:**
```json
{
  "valid": true,
  "summary": {
    "items": [...],
    "subtotal_points": 1000,
    "subtotal_money": 179.80,
    "points_available": 1250,
    "points_to_use": 1000,
    "money_to_pay": 0,
    "cashback_earned": 0
  },
  "errors": []
}
```

**Erros possíveis:**
```json
{
  "valid": false,
  "errors": [
    {
      "code": "INSUFFICIENT_POINTS",
      "message": "Saldo de pontos insuficiente",
      "details": {
        "required": 1000,
        "available": 750
      }
    }
  ]
}
```

---

### POST /checkout

Processa o checkout.

**Request (Pontos):**
```json
{
  "payment_method": "points",
  "biometric_token": "token-from-device"
}
```

**Request (Dinheiro):**
```json
{
  "payment_method": "money",
  "stripe_payment_method_id": "pm_xxx"
}
```

**Request (Misto):**
```json
{
  "payment_method": "mixed",
  "points_to_use": 500,
  "stripe_payment_method_id": "pm_xxx",
  "biometric_token": "token-from-device"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "order_id": "uuid",
    "order_code": "A1B2C3",
    "status": "pending",
    "payment_status": "completed",
    "points_used": 1000,
    "money_paid": 0,
    "cashback_earned": 0,
    "pickup_code": "QR_CODE_DATA",
    "items": [...],
    "created_at": "2026-01-13T10:30:00Z"
  }
}
```

**Response (PIX - aguardando pagamento):**
```json
{
  "data": {
    "order_id": "uuid",
    "status": "awaiting_payment",
    "payment_status": "pending",
    "pix_qr_code": "00020126...",
    "pix_copy_paste": "00020126...",
    "expires_at": "2026-01-13T10:45:00Z"
  }
}
```

---

### POST /checkout/stripe-intent

Cria PaymentIntent do Stripe para checkout.

**Request:**
```json
{
  "payment_method": "money",
  "points_to_use": 0
}
```

**Response:**
```json
{
  "client_secret": "pi_xxx_secret_xxx",
  "amount": 17980,
  "currency": "brl"
}
```

---

## 7. Favoritos

### GET /favorites

Lista favoritos do usuário.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Camiseta Oficial A-hub",
        "slug": "camiseta-oficial-ahub",
        "price_points": 500,
        "price_money": 89.90,
        "thumbnail_url": "https://...",
        "is_available": true
      },
      "created_at": "2026-01-10T08:00:00Z"
    }
  ],
  "meta": {
    "total": 5
  }
}
```

---

### POST /favorites

Adiciona produto aos favoritos.

**Request:**
```json
{
  "product_id": "uuid"
}
```

**Response:** `201 Created`

---

### DELETE /favorites/{product_id}

Remove produto dos favoritos.

**Response:** `204 No Content`

---

## 8. Avaliações

### GET /products/{product_id}/reviews

Lista avaliações de um produto.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `page` | Integer | Página |
| `per_page` | Integer | Itens por página |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "name": "João S.",
        "avatar_url": "https://..."
      },
      "rating": 5,
      "comment": "Excelente qualidade!",
      "created_at": "2026-01-11T10:00:00Z"
    }
  ],
  "summary": {
    "average_rating": 4.5,
    "total_reviews": 23,
    "rating_distribution": {
      "5": 18,
      "4": 4,
      "3": 1,
      "2": 0,
      "1": 0
    }
  },
  "meta": {
    "current_page": 1,
    "total_pages": 3
  }
}
```

---

### POST /products/{product_id}/reviews

Cria avaliação (requer compra prévia).

**Request:**
```json
{
  "order_id": "uuid",
  "rating": 5,
  "comment": "Excelente qualidade!"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "status": "pending",
    "message": "Sua avaliação será analisada antes de ser publicada."
  }
}
```

**Erros:**
| Código | Erro | Descrição |
|--------|------|-----------|
| 403 | `NO_PURCHASE` | Usuário não comprou o produto |
| 409 | `ALREADY_REVIEWED` | Usuário já avaliou este produto |

---

## 9. ADM - Gestão

### GET /admin/categories

Lista categorias (incluindo inativas).

### POST /admin/categories

Cria categoria.

**Request:**
```json
{
  "name": "Nova Categoria",
  "description": "Descrição da categoria",
  "image_url": "https://...",
  "display_order": 10
}
```

### PATCH /admin/categories/{id}

Atualiza categoria.

### DELETE /admin/categories/{id}

Desativa categoria (soft delete).

---

### GET /admin/products

Lista produtos com filtros avançados.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `category` | String | ID da categoria |
| `status` | String | `active`, `inactive`, `low_stock` |
| `type` | String | `physical`, `voucher`, `service` |
| `search` | String | Busca por nome |

---

### POST /admin/products

Cria produto.

**Request:**
```json
{
  "category_id": "uuid",
  "name": "Novo Produto",
  "slug": "novo-produto",
  "short_description": "Descrição curta",
  "long_description": "Descrição longa...",
  "type": "physical",
  "price_points": 500,
  "price_money": 89.90,
  "payment_options": "both",
  "stock_type": "limited",
  "stock_count": 50,
  "limit_per_user": 2,
  "cashback_percent": 5.0,
  "eligible_plans": null,
  "pickup_location": "Sede Principal",
  "images": [
    {
      "url": "https://...",
      "alt_text": "Imagem 1",
      "display_order": 1
    }
  ],
  "specifications": [
    {
      "key": "Material",
      "value": "Algodão"
    }
  ],
  "variants": [
    {
      "sku": "NP-P-AZL",
      "name": "P - Azul",
      "attributes": {"size": "P", "color": "Azul"},
      "stock_count": 10
    }
  ]
}
```

---

### PATCH /admin/products/{id}

Atualiza produto.

---

### DELETE /admin/products/{id}

Desativa produto (soft delete).

---

### POST /admin/products/{id}/variants

Adiciona variação.

### PATCH /admin/products/{id}/variants/{variant_id}

Atualiza variação.

### DELETE /admin/products/{id}/variants/{variant_id}

Remove variação.

---

### PATCH /admin/products/{id}/stock

Atualiza estoque.

**Request:**
```json
{
  "stock_count": 100,
  "variant_id": "uuid"
}
```

---

### POST /admin/products/{id}/promotion

Ativa promoção.

**Request:**
```json
{
  "promotional_price_points": 400,
  "promotional_price_money": 69.90,
  "ends_at": "2026-01-31T23:59:59Z"
}
```

---

### DELETE /admin/products/{id}/promotion

Remove promoção.

---

### PATCH /admin/products/{id}/featured

Altera destaque.

**Request:**
```json
{
  "is_featured": true
}
```

---

### GET /admin/reviews

Lista avaliações pendentes de moderação.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `status` | String | `pending`, `approved`, `rejected` |

---

### PATCH /admin/reviews/{id}

Modera avaliação.

**Request:**
```json
{
  "status": "approved"
}
```

---

### GET /admin/reports/sales

Relatório de vendas.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `start_date` | Date | Data inicial |
| `end_date` | Date | Data final |
| `group_by` | String | `day`, `week`, `month` |

**Response:**
```json
{
  "data": {
    "total_orders": 127,
    "total_revenue_money": 15420.50,
    "total_revenue_points": 45200,
    "total_cashback": 1890,
    "by_period": [
      {
        "date": "2026-01-01",
        "orders": 5,
        "revenue_money": 450.00,
        "revenue_points": 1500
      }
    ]
  }
}
```

---

### GET /admin/reports/products

Relatório por produto.

**Response:**
```json
{
  "data": [
    {
      "product_id": "uuid",
      "product_name": "Camiseta Oficial",
      "sold_count": 45,
      "revenue_money": 4045.50,
      "revenue_points": 22500,
      "current_stock": 5
    }
  ]
}
```

---

### GET /admin/reports/export

Exporta relatório em CSV.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `type` | String | `sales`, `products`, `orders` |
| `start_date` | Date | Data inicial |
| `end_date` | Date | Data final |

**Response:** Arquivo CSV

---

## 10. Webhooks

### Stripe Webhooks

**Endpoint:** `POST /webhooks/stripe`

**Eventos tratados:**

| Evento | Ação |
|--------|------|
| `payment_intent.succeeded` | Confirma pedido, credita cashback |
| `payment_intent.payment_failed` | Marca pedido como falho |
| `charge.refunded` | Processa estorno |

---

### Payload de Notificação (Interno)

Quando eventos ocorrem, o sistema dispara notificações:

```json
{
  "event": "order.confirmed",
  "data": {
    "order_id": "uuid",
    "user_id": "uuid",
    "items_count": 2,
    "total_points": 1000,
    "total_money": 0
  }
}
```

---

## Apêndice: Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `INSUFFICIENT_STOCK` | Estoque insuficiente |
| `INSUFFICIENT_POINTS` | Saldo de pontos insuficiente |
| `LIMIT_EXCEEDED` | Limite por usuário excedido |
| `NOT_ELIGIBLE` | Usuário não elegível (plano) |
| `PRODUCT_NOT_FOUND` | Produto não encontrado |
| `PRODUCT_UNAVAILABLE` | Produto indisponível |
| `VARIANT_REQUIRED` | Variação obrigatória |
| `CART_EXPIRED` | Carrinho expirado |
| `PAYMENT_FAILED` | Falha no pagamento |
| `ALREADY_REVIEWED` | Já avaliou o produto |
| `NO_PURCHASE` | Não comprou o produto |
