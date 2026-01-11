---
module: carteirinha
document: api
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Carteirinha - API

[← Voltar ao Índice](README.md)

---

## Endpoints - Carteirinha

### GET `/user/card`

Obter dados da carteirinha.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "card": {
    "user_id": "123",
    "name": "João Silva",
    "avatar_url": "https://...",
    "card_number": "A-2024-00001",
    "status": "active",
    "qr_code_data": "...",
    "association": {
      "name": "Associação XYZ",
      "logo_url": "https://...",
      "phone": "(11) 1234-5678",
      "email": "contato@associacao.com.br",
      "website": "https://associacao.com.br",
      "address": "Rua X, 000 - Cidade"
    }
  }
}
```

---

### GET `/user/card/status`

Verificar status ativo/inativo.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "active": true,
  "reason": null
}
```

**Response (inativo):**
```json
{
  "active": false,
  "reason": "Inadimplente",
  "action_url": "/regularizar"
}
```

---

### GET `/user/card/qrcode`

Gerar QR Code.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "qr_code_string": "...",
  "expiry_timestamp": 1704153600
}
```

---

## Endpoints - Benefícios

### GET `/benefits`

Listar todos os parceiros.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Query params:**
- `category` (string): Filtro por categoria
- `sort` (string): az, distance, recent
- `search` (string): Busca por nome

**Response:**
```json
{
  "benefits": [
    {
      "id": "1",
      "name": "Pizzaria Bella",
      "category": "Alimentação",
      "logo_url": "https://...",
      "benefit_summary": "15% de desconto",
      "distance_km": 2.5,
      "is_new": true
    }
  ],
  "total": 45
}
```

---

### GET `/benefits/:id`

Detalhes do parceiro.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "partner": {
    "id": "1",
    "name": "Pizzaria Bella",
    "category": "Alimentação",
    "logo_url": "https://...",
    "banner_url": "https://...",
    "benefit": "15% de desconto em todos os produtos",
    "instructions": "Apresente a carteirinha antes de fechar a conta",
    "address": {
      "street": "Rua das Flores, 123",
      "city": "São Paulo",
      "state": "SP",
      "zip": "01234-567",
      "lat": -23.5505,
      "lng": -46.6333
    },
    "contact": {
      "phone": "(11) 1234-5678",
      "website": "https://pizzariabella.com.br",
      "instagram": "@pizzariabella"
    },
    "hours": {
      "monday": "11:00-23:00",
      "tuesday": "11:00-23:00",
      "wednesday": "11:00-23:00",
      "thursday": "11:00-23:00",
      "friday": "11:00-00:00",
      "saturday": "11:00-00:00",
      "sunday": "11:00-22:00"
    },
    "is_open_now": true,
    "distance_km": 2.5,
    "added_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### GET `/benefits/categories`

Listar categorias disponíveis.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "categories": [
    {"id": "food", "name": "Alimentação", "icon": "🍽️", "count": 15},
    {"id": "health", "name": "Saúde", "icon": "🏥", "count": 8},
    {"id": "entertainment", "name": "Lazer", "icon": "🎭", "count": 12}
  ]
}
```

---

## Endpoints - Histórico

### GET `/user/card/history`

Histórico de usos do QR Code.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Query params:**
- `type` (string): checkin, benefit, event
- `limit` (number): Quantidade
- `offset` (number): Paginação

**Response:**
```json
{
  "history": [
    {
      "id": "1",
      "type": "benefit",
      "icon": "🎁",
      "location": "Pizzaria Bella",
      "address": "Rua das Flores, 123",
      "timestamp": "2026-01-09T14:30:00Z"
    },
    {
      "id": "2",
      "type": "checkin",
      "icon": "🏢",
      "location": "Sede da Associação",
      "timestamp": "2026-01-08T09:15:00Z"
    }
  ],
  "has_more": true
}
```

---

## Endpoints - Geolocalização

### POST `/benefits/nearby`

Parceiros próximos.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Body:**
```json
{
  "latitude": -23.5505,
  "longitude": -46.6333,
  "radius_km": 5
}
```

**Response:**
```json
{
  "benefits": [
    {
      "id": "1",
      "name": "Pizzaria Bella",
      "distance_km": 0.8,
      "category": "Alimentação",
      "benefit_summary": "15% de desconto"
    }
  ]
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Parâmetros inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Carteirinha inativa |
| 404 | Not Found - Parceiro não encontrado |
| 500 | Internal Server Error |

---

## Relacionados

- [Especificação](spec.md)
- [Benefícios](benefits.md)
- [QR Code](qr-code.md)
- [Critérios de Aceitação](acceptance-criteria.md)
