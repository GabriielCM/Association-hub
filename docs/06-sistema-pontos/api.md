---
module: sistema-pontos
document: api
status: complete
priority: mvp
last_updated: 2026-01-11
---

# Sistema de Pontos - API

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Saldo e Histórico](#1-saldo-e-histórico)
2. [Transferência](#2-transferência)
3. [Integração Strava](#3-integração-strava)
4. [Rankings](#4-rankings)
5. [ADM](#5-adm)
6. [Códigos de Erro](#6-códigos-de-erro)

---

## Base URL

```
Produção: https://api.ahub.com.br/v1
Staging:  https://api-staging.ahub.com.br/v1
```

---

## 1. Saldo e Histórico

### GET /points/balance

Retorna o saldo atual do usuário autenticado.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Response 200:**

```json
{
  "data": {
    "balance": 1250,
    "lifetime_earned": 3500,
    "lifetime_spent": 2250,
    "last_transaction_at": "2026-01-11T10:30:00Z"
  }
}
```

---

### GET /points/history

Retorna o histórico de transações do usuário.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Query Params:**

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `page` | Integer | Não | Página (default: 1) |
| `per_page` | Integer | Não | Itens por página (default: 20, max: 50) |
| `type` | String | Não | Filtro: `credit`, `debit` |
| `source` | String | Não | Filtro: `event_checkin`, `strava_activity`, etc. |
| `start_date` | Date | Não | Data inicial (YYYY-MM-DD) |
| `end_date` | Date | Não | Data final (YYYY-MM-DD) |

**Response 200:**

```json
{
  "data": [
    {
      "id": "txn-uuid-1",
      "type": "credit",
      "amount": 50,
      "balance_after": 1250,
      "source": "event_checkin",
      "source_id": "event-uuid",
      "description": "Check-in no evento Happy Hour Sexta",
      "metadata": {
        "event_name": "Happy Hour Sexta",
        "event_date": "2026-01-10"
      },
      "created_at": "2026-01-10T18:30:00Z"
    },
    {
      "id": "txn-uuid-2",
      "type": "debit",
      "amount": 30,
      "balance_after": 1200,
      "source": "transfer_sent",
      "source_id": "transfer-uuid",
      "description": "Transferência para Maria Santos",
      "metadata": {
        "recipient_id": "user-uuid",
        "recipient_name": "Maria Santos"
      },
      "created_at": "2026-01-10T15:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total_pages": 5,
    "total_count": 98
  }
}
```

---

### GET /points/summary

Retorna um resumo de ganhos e gastos por período.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Query Params:**

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `period` | String | Não | `today`, `week`, `month`, `year` (default: `month`) |

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
    "by_source": {
      "event_checkin": 200,
      "strava_activity": 100,
      "daily_post": 50
    },
    "by_destination": {
      "transfer_sent": 80,
      "pdv_purchase": 40
    }
  }
}
```

---

## 2. Transferência

### POST /points/transfer

Transfere pontos para outro usuário.

**Autenticação:** Bearer Token (JWT) + Biometria
**Permissões:** Common User

**Request Body:**

```json
{
  "recipient_id": "user-uuid",
  "amount": 50,
  "message": "Parabéns pelo aniversário!"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `recipient_id` | UUID | Sim | ID do destinatário |
| `amount` | Integer | Sim | Valor a transferir (≥ 1) |
| `message` | String | Não | Mensagem opcional (max 100 chars) |

**Response 201:**

```json
{
  "data": {
    "transaction_id": "txn-uuid",
    "amount": 50,
    "recipient": {
      "id": "user-uuid",
      "name": "Maria Santos",
      "avatar": "https://..."
    },
    "sender_balance_after": 1200,
    "created_at": "2026-01-11T10:00:00Z"
  }
}
```

**Response 400 (Saldo insuficiente):**

```json
{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Saldo insuficiente para realizar a transferência",
    "details": {
      "current_balance": 30,
      "required_amount": 50
    }
  }
}
```

---

### GET /points/transfer/recent

Retorna os últimos destinatários de transferências.

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
      "user_id": "user-uuid-1",
      "name": "Maria Santos",
      "avatar": "https://...",
      "last_transfer_at": "2026-01-10T15:00:00Z"
    },
    {
      "user_id": "user-uuid-2",
      "name": "João Silva",
      "avatar": "https://...",
      "last_transfer_at": "2026-01-08T12:00:00Z"
    }
  ]
}
```

---

### GET /points/transfer/search

Busca usuários por nome para transferência.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Query Params:**

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `q` | String | Sim | Termo de busca (min 2 chars) |
| `limit` | Integer | Não | Quantidade (default: 10, max: 20) |

**Response 200:**

```json
{
  "data": [
    {
      "user_id": "user-uuid",
      "name": "Maria Santos",
      "avatar": "https://...",
      "member_since": "2025-03-15"
    }
  ]
}
```

---

## 3. Integração Strava

### POST /integrations/strava/connect

Inicia o fluxo OAuth com o Strava.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Response 200:**

```json
{
  "data": {
    "authorization_url": "https://www.strava.com/oauth/authorize?client_id=...&redirect_uri=...&response_type=code&scope=read,activity:read"
  }
}
```

---

### GET /integrations/strava/callback

Callback do OAuth Strava (chamado pelo redirect).

**Query Params:**

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `code` | String | Sim | Código de autorização |
| `state` | String | Sim | State para validação CSRF |

**Response 302:** Redirect para deep link do app

---

### POST /integrations/strava/disconnect

Desconecta a conta Strava.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Response 200:**

```json
{
  "data": {
    "disconnected": true,
    "message": "Conta Strava desconectada com sucesso"
  }
}
```

---

### GET /integrations/strava/status

Retorna o status da conexão Strava.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Response 200 (Conectado):**

```json
{
  "data": {
    "connected": true,
    "athlete_name": "João Silva",
    "connected_at": "2025-10-01T15:30:00Z",
    "last_sync_at": "2026-01-11T08:00:00Z",
    "km_used_today": 3.5,
    "km_remaining_today": 1.5,
    "daily_limit_km": 5.0
  }
}
```

**Response 200 (Não conectado):**

```json
{
  "data": {
    "connected": false
  }
}
```

---

### POST /integrations/strava/sync

Sincroniza atividades do Strava e credita pontos.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Response 200:**

```json
{
  "data": {
    "activities_processed": 2,
    "total_km": 4.2,
    "km_credited": 1.5,
    "points_earned": 15,
    "new_balance": 1265,
    "activities": [
      {
        "strava_id": 12345,
        "name": "Corrida matinal",
        "type": "Run",
        "distance_km": 3.2,
        "km_credited": 1.5,
        "points": 15,
        "date": "2026-01-11T06:30:00Z"
      }
    ],
    "message": "1.5 km creditados. Limite diário: 3.5/5.0 km"
  }
}
```

**Response 200 (Limite atingido):**

```json
{
  "data": {
    "activities_processed": 0,
    "total_km": 0,
    "km_credited": 0,
    "points_earned": 0,
    "new_balance": 1250,
    "message": "Limite diário de 5km já atingido. Tente novamente amanhã!"
  }
}
```

---

### GET /integrations/strava/activities

Lista atividades sincronizadas do Strava.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Query Params:**

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `page` | Integer | Não | Página (default: 1) |
| `per_page` | Integer | Não | Itens por página (default: 20) |

**Response 200:**

```json
{
  "data": [
    {
      "strava_id": 12345,
      "name": "Corrida matinal",
      "type": "Run",
      "distance_km": 5.2,
      "km_credited": 5.0,
      "points_earned": 50,
      "synced_at": "2026-01-10T08:00:00Z",
      "activity_date": "2026-01-10T06:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 3,
    "total_count": 45
  }
}
```

---

## 4. Rankings

### GET /rankings/points

Ranking geral por pontos acumulados.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Query Params:**

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `period` | String | Não | `all_time`, `monthly`, `weekly` (default: `all_time`) |
| `limit` | Integer | Não | Quantidade (default: 10, max: 50) |

**Response 200:**

```json
{
  "data": {
    "type": "points",
    "period": "all_time",
    "updated_at": "2026-01-11T12:00:00Z",
    "entries": [
      {
        "position": 1,
        "user_id": "user-uuid",
        "user_name": "João Silva",
        "user_avatar": "https://...",
        "value": 5000,
        "is_current_user": false
      },
      {
        "position": 2,
        "user_id": "user-uuid",
        "user_name": "Maria Santos",
        "user_avatar": "https://...",
        "value": 4500,
        "is_current_user": true
      }
    ],
    "current_user": {
      "position": 2,
      "value": 4500
    }
  }
}
```

---

### GET /rankings/events

Ranking por check-ins em eventos.

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Query Params:** Mesmos de `/rankings/points`

**Response 200:** Mesma estrutura de `/rankings/points`

---

### GET /rankings/strava

Ranking por atividades físicas (km).

**Autenticação:** Bearer Token (JWT)
**Permissões:** Common User

**Query Params:** Mesmos de `/rankings/points`

**Response 200:** Mesma estrutura, com `value` representando km totais

---

## 5. ADM

### GET /admin/points/config

Retorna as configurações do sistema de pontos.

**Autenticação:** Bearer Token (JWT)
**Permissões:** ADM

**Response 200:**

```json
{
  "data": {
    "sources": [
      {
        "type": "event_checkin",
        "label": "Check-in em eventos",
        "default_points": 50,
        "is_active": true,
        "configurable_per_event": true
      },
      {
        "type": "strava_run",
        "label": "Strava - Corrida",
        "points_per_km": 10,
        "is_active": true
      },
      {
        "type": "strava_ride",
        "label": "Strava - Ciclismo",
        "points_per_km": 5,
        "is_active": true
      },
      {
        "type": "daily_post",
        "label": "Primeiro post do dia",
        "points": 5,
        "is_active": true
      }
    ],
    "strava": {
      "daily_limit_km": 5.0,
      "eligible_activities": ["Run", "Ride", "Walk", "Swim", "Hike"]
    },
    "updated_at": "2026-01-10T14:00:00Z"
  }
}
```

---

### PUT /admin/points/config

Atualiza as configurações do sistema de pontos.

**Autenticação:** Bearer Token (JWT)
**Permissões:** ADM

**Request Body:**

```json
{
  "sources": {
    "strava_run": {
      "points_per_km": 15,
      "is_active": true
    },
    "daily_post": {
      "points": 10,
      "is_active": true
    }
  },
  "strava": {
    "daily_limit_km": 10.0,
    "eligible_activities": ["Run", "Ride", "Walk"]
  }
}
```

**Response 200:**

```json
{
  "data": {
    "updated": true,
    "message": "Configurações atualizadas com sucesso"
  }
}
```

---

### POST /admin/points/grant

Credita pontos manualmente para um usuário.

**Autenticação:** Bearer Token (JWT)
**Permissões:** ADM

**Request Body:**

```json
{
  "user_id": "user-uuid",
  "amount": 100,
  "reason": "Prêmio por participação especial"
}
```

**Response 201:**

```json
{
  "data": {
    "transaction_id": "txn-uuid",
    "user_id": "user-uuid",
    "user_name": "João Silva",
    "amount": 100,
    "new_balance": 1350,
    "reason": "Prêmio por participação especial",
    "granted_by": "admin-uuid",
    "created_at": "2026-01-11T10:00:00Z"
  }
}
```

---

### POST /admin/points/deduct

Debita pontos manualmente de um usuário.

**Autenticação:** Bearer Token (JWT)
**Permissões:** ADM

**Request Body:**

```json
{
  "user_id": "user-uuid",
  "amount": 50,
  "reason": "Ajuste de saldo"
}
```

**Response 201:** Mesma estrutura de `/admin/points/grant`

---

### POST /admin/points/refund/:transaction_id

Estorna uma transação específica.

**Autenticação:** Bearer Token (JWT)
**Permissões:** ADM

**Path Params:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| `transaction_id` | UUID | ID da transação a estornar |

**Request Body:**

```json
{
  "reason": "Erro no processamento original"
}
```

**Response 201:**

```json
{
  "data": {
    "refund_transaction_id": "txn-uuid-refund",
    "original_transaction_id": "txn-uuid-original",
    "amount": 50,
    "user_id": "user-uuid",
    "new_balance": 1300,
    "reason": "Erro no processamento original",
    "refunded_by": "admin-uuid",
    "created_at": "2026-01-11T10:00:00Z"
  }
}
```

---

### GET /admin/points/reports

Retorna relatórios do sistema de pontos.

**Autenticação:** Bearer Token (JWT)
**Permissões:** ADM

**Query Params:**

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `period` | String | Não | `today`, `week`, `month`, `year` (default: `month`) |

**Response 200:**

```json
{
  "data": {
    "period": "month",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "summary": {
      "total_in_circulation": 125000,
      "total_earned": 15000,
      "total_spent": 8000,
      "total_users_with_balance": 450,
      "total_transactions": 1250
    },
    "by_source": [
      { "source": "event_checkin", "total": 8000, "count": 160 },
      { "source": "strava_activity", "total": 4500, "count": 300 },
      { "source": "daily_post", "total": 2500, "count": 500 }
    ],
    "by_destination": [
      { "destination": "transfer_sent", "total": 3000, "count": 120 },
      { "destination": "pdv_purchase", "total": 2500, "count": 80 },
      { "destination": "shop_purchase", "total": 2000, "count": 50 },
      { "destination": "jukebox_payment", "total": 500, "count": 100 }
    ],
    "top_earners": [
      { "user_id": "uuid", "name": "João Silva", "earned": 500 },
      { "user_id": "uuid", "name": "Maria Santos", "earned": 450 }
    ],
    "daily_trend": [
      { "date": "2026-01-01", "earned": 480, "spent": 250 },
      { "date": "2026-01-02", "earned": 520, "spent": 280 }
    ]
  }
}
```

---

### GET /admin/points/export

Exporta histórico de transações em CSV.

**Autenticação:** Bearer Token (JWT)
**Permissões:** ADM

**Query Params:**

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `start_date` | Date | Sim | Data inicial (YYYY-MM-DD) |
| `end_date` | Date | Sim | Data final (YYYY-MM-DD) |
| `type` | String | Não | Filtro: `credit`, `debit` |

**Response 200:** `Content-Type: text/csv`

```csv
id,user_id,user_name,type,amount,balance_after,source,description,created_at
txn-uuid-1,user-uuid-1,João Silva,credit,50,1250,event_checkin,"Check-in no evento Happy Hour",2026-01-10T18:30:00Z
txn-uuid-2,user-uuid-2,Maria Santos,debit,30,450,transfer_sent,"Transferência para João Silva",2026-01-10T15:00:00Z
```

---

## 6. Códigos de Erro

### Códigos Comuns

| Código | HTTP | Descrição |
|--------|------|-----------|
| `UNAUTHORIZED` | 401 | Token inválido ou expirado |
| `FORBIDDEN` | 403 | Sem permissão para a ação |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `VALIDATION_ERROR` | 422 | Dados inválidos |
| `RATE_LIMITED` | 429 | Muitas requisições |
| `SERVER_ERROR` | 500 | Erro interno |

### Códigos Específicos de Pontos

| Código | HTTP | Descrição |
|--------|------|-----------|
| `INSUFFICIENT_BALANCE` | 400 | Saldo insuficiente |
| `INVALID_AMOUNT` | 400 | Valor inválido (≤ 0) |
| `SELF_TRANSFER` | 400 | Tentativa de transferir para si mesmo |
| `USER_NOT_FOUND` | 404 | Destinatário não encontrado |
| `STRAVA_NOT_CONNECTED` | 400 | Strava não conectado |
| `STRAVA_SYNC_FAILED` | 500 | Erro ao sincronizar com Strava |
| `DAILY_LIMIT_REACHED` | 400 | Limite diário atingido |
| `TRANSACTION_NOT_FOUND` | 404 | Transação não encontrada |
| `TRANSACTION_ALREADY_REFUNDED` | 400 | Transação já estornada |

---

## Relacionados

- [Especificação](spec.md) - Modelo de dados e fluxos
- [Critérios de Aceitação](acceptance-criteria.md) - Checklist de validação
- [Minha Carteira - API](../05-minha-carteira/api.md) - Endpoints da interface
