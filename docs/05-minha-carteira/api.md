---
module: minha-carteira
document: api
status: complete
priority: mvp
last_updated: 2026-01-11
---

# Minha Carteira - API

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Dashboard da Carteira](#1-dashboard-da-carteira)
2. [Scanner](#2-scanner)
3. [Transferência](#3-transferência)
4. [Pagamento PDV](#4-pagamento-pdv)
5. [Códigos de Erro](#5-códigos-de-erro)

---

## Base URL

```
Produção: https://api.ahub.com.br/v1
Staging:  https://api-staging.ahub.com.br/v1
```

---

## 1. Dashboard da Carteira

### GET /wallet

Retorna dados completos da carteira para a tela inicial.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Response 200:**

```json
{
  "data": {
    "balance": 1250,
    "qr_code_url": "https://api.ahub.com.br/qr/user/uuid",
    "summary": {
      "period": "month",
      "earned": 350,
      "spent": 120,
      "net": 230
    },
    "strava": {
      "connected": true,
      "km_used_today": 3.5,
      "km_remaining_today": 1.5
    },
    "recent_recipients": [
      {
        "user_id": "uuid",
        "name": "Maria Santos",
        "avatar": "https://..."
      }
    ]
  }
}
```

---

### GET /wallet/summary

Retorna resumo de ganhos/gastos por período.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Query Params:**

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `period` | String | Não | `today`, `week`, `month` (default: `month`) |

**Response 200:**

```json
{
  "data": {
    "period": "month",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "earned": 350,
    "spent": 120,
    "net": 230,
    "transaction_count": 15
  }
}
```

---

## 2. Scanner

### POST /wallet/scan

Processa um QR Code escaneado e retorna a ação apropriada.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Request Body:**

```json
{
  "qr_data": "eyJ0eXBlIjoiZXZlbnRfY2hlY2tpbiIsImV2ZW50X2lkIjoiYWJjMTIzIn0="
}
```

**Response 200 (Check-in):**

```json
{
  "data": {
    "type": "event_checkin",
    "action": "process",
    "event": {
      "id": "uuid",
      "name": "Happy Hour Sexta",
      "date": "2026-01-10T18:00:00Z",
      "points": 50
    },
    "checkin_result": {
      "success": true,
      "points_earned": 50,
      "new_balance": 1300,
      "message": "Check-in realizado! +50 pontos"
    }
  }
}
```

**Response 200 (Transferência):**

```json
{
  "data": {
    "type": "user_transfer",
    "action": "show_transfer_screen",
    "recipient": {
      "id": "uuid",
      "name": "Maria Santos",
      "avatar": "https://...",
      "member_since": "2025-03-15"
    }
  }
}
```

**Response 200 (Pagamento PDV):**

```json
{
  "data": {
    "type": "pdv_payment",
    "action": "show_payment_screen",
    "checkout": {
      "code": "abc123",
      "pdv_id": "uuid",
      "pdv_name": "Geladeira - Sede",
      "items": [
        {
          "name": "Água Mineral 500ml",
          "quantity": 1,
          "points": 10
        },
        {
          "name": "Refrigerante Cola",
          "quantity": 1,
          "points": 15
        }
      ],
      "total": 25,
      "expires_at": "2026-01-11T10:35:00Z"
    }
  }
}
```

**Response 200 (Validação de Carteirinha):**

```json
{
  "data": {
    "type": "member_card",
    "action": "show_member_info",
    "member": {
      "id": "uuid",
      "name": "João Silva",
      "avatar": "https://...",
      "member_since": "2025-01-15",
      "status": "active",
      "membership_type": "Premium"
    }
  }
}
```

**Response 400 (QR Inválido):**

```json
{
  "error": {
    "code": "INVALID_QR_CODE",
    "message": "QR Code inválido ou não reconhecido"
  }
}
```

**Response 400 (QR Expirado):**

```json
{
  "error": {
    "code": "QR_EXPIRED",
    "message": "Este QR Code expirou. Solicite um novo."
  }
}
```

---

## 3. Transferência

### POST /wallet/transfer

Realiza transferência de pontos para outro usuário.

**Autenticação:** Bearer Token (JWT) + Biometria
**Permissões:** Common User

**Request Body:**

```json
{
  "recipient_id": "uuid",
  "amount": 50,
  "message": "Obrigado pela ajuda!"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `recipient_id` | UUID | Sim | ID do destinatário |
| `amount` | Integer | Sim | Valor (≥ 1) |
| `message` | String | Não | Mensagem (max 100 chars) |

**Response 201:**

```json
{
  "data": {
    "transaction_id": "uuid",
    "amount": 50,
    "recipient": {
      "id": "uuid",
      "name": "Maria Santos",
      "avatar": "https://..."
    },
    "new_balance": 1200,
    "message": "Transferência realizada com sucesso!",
    "created_at": "2026-01-11T10:00:00Z"
  }
}
```

---

### GET /wallet/transfer/recent

Retorna os destinatários recentes.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Query Params:**

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `limit` | Integer | Não | Quantidade (default: 5, max: 10) |

**Response 200:**

```json
{
  "data": [
    {
      "user_id": "uuid",
      "name": "Maria Santos",
      "avatar": "https://...",
      "last_transfer_at": "2026-01-10T15:00:00Z",
      "total_transfers": 3
    }
  ]
}
```

---

### GET /wallet/transfer/search

Busca usuários por nome.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Query Params:**

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `q` | String | Sim | Termo de busca (min 2 chars) |
| `limit` | Integer | Não | Quantidade (default: 10) |

**Response 200:**

```json
{
  "data": [
    {
      "user_id": "uuid",
      "name": "Maria Santos",
      "avatar": "https://...",
      "member_since": "2025-03-15"
    }
  ]
}
```

---

## 4. Pagamento PDV

### GET /wallet/pdv/checkout/:code

Retorna detalhes de um checkout de PDV.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Path Params:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| `code` | String | Código do checkout |

**Response 200:**

```json
{
  "data": {
    "code": "abc123",
    "pdv_id": "uuid",
    "pdv_name": "Geladeira - Sede",
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
        "quantity": 1,
        "unit_price": 15,
        "total_price": 15
      }
    ],
    "total": 25,
    "status": "pending",
    "created_at": "2026-01-11T10:30:00Z",
    "expires_at": "2026-01-11T10:35:00Z",
    "user_balance": 1250,
    "balance_after_payment": 1225
  }
}
```

**Response 404:**

```json
{
  "error": {
    "code": "CHECKOUT_NOT_FOUND",
    "message": "Checkout não encontrado ou expirado"
  }
}
```

---

### POST /wallet/pdv/pay

Confirma pagamento de um checkout de PDV.

**Autenticação:** Bearer Token (JWT) + Biometria
**Permissões:** Common User

**Request Body:**

```json
{
  "checkout_code": "abc123"
}
```

**Response 201:**

```json
{
  "data": {
    "transaction_id": "uuid",
    "checkout_code": "abc123",
    "pdv_name": "Geladeira - Sede",
    "items_count": 2,
    "total": 25,
    "new_balance": 1225,
    "message": "Pagamento realizado com sucesso!",
    "created_at": "2026-01-11T10:31:00Z"
  }
}
```

**Response 400 (Saldo insuficiente):**

```json
{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Saldo insuficiente para este pagamento",
    "details": {
      "current_balance": 20,
      "required_amount": 25
    }
  }
}
```

**Response 400 (Checkout expirado):**

```json
{
  "error": {
    "code": "CHECKOUT_EXPIRED",
    "message": "Este checkout expirou. Inicie uma nova compra no PDV."
  }
}
```

**Response 400 (Checkout já pago):**

```json
{
  "error": {
    "code": "CHECKOUT_ALREADY_PAID",
    "message": "Este checkout já foi pago."
  }
}
```

---

## 5. Códigos de Erro

### Códigos Comuns

| Código | HTTP | Descrição |
|--------|------|-----------|
| `UNAUTHORIZED` | 401 | Token inválido |
| `FORBIDDEN` | 403 | Sem permissão |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `VALIDATION_ERROR` | 422 | Dados inválidos |
| `RATE_LIMITED` | 429 | Muitas requisições |

### Códigos Específicos

| Código | HTTP | Descrição |
|--------|------|-----------|
| `INSUFFICIENT_BALANCE` | 400 | Saldo insuficiente |
| `INVALID_QR_CODE` | 400 | QR não reconhecido |
| `QR_EXPIRED` | 400 | QR expirado |
| `SELF_TRANSFER` | 400 | Transferência para si mesmo |
| `RECIPIENT_NOT_FOUND` | 404 | Destinatário não existe |
| `CHECKOUT_NOT_FOUND` | 404 | Checkout não encontrado |
| `CHECKOUT_EXPIRED` | 400 | Checkout expirado |
| `CHECKOUT_ALREADY_PAID` | 400 | Checkout já pago |
| `BIOMETRIC_REQUIRED` | 401 | Autenticação biométrica necessária |

---

## Relacionados

- [Especificação](spec.md) - Telas e fluxos
- [Critérios de Aceitação](acceptance-criteria.md) - Checklist
- [Sistema de Pontos - API](../06-sistema-pontos/api.md) - Endpoints de pontos
- [PDV - API](../16-pdv/api.md) - Endpoints do PDV
