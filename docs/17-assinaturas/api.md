---
module: assinaturas
document: api
status: complete
priority: phase2
last_updated: 2026-01-14
---

# Assinaturas - API

[← Voltar ao Índice](README.md)

---

## Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Endpoints do Usuário](#endpoints-do-usuário)
- [Endpoints do ADM](#endpoints-do-adm)
- [Webhooks](#webhooks)
- [Códigos de Erro](#códigos-de-erro)

---

## Visão Geral

**Base URL:** `/api/v1`

**Formato:** JSON

**Autenticação:** Bearer Token (JWT)

---

## Autenticação

Todos os endpoints requerem autenticação via header:

```
Authorization: Bearer <token>
```

Endpoints com prefixo `/admin/` requerem permissão de administrador.

---

## Endpoints do Usuário

### GET /subscriptions/plans

Lista todos os planos disponíveis na vitrine.

**Resposta:**

```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "plan-uuid-1",
        "name": "Plano Gold",
        "description": "Benefícios premium para associados",
        "price_monthly": 49.90,
        "icon_url": "https://cdn.ahub.com/plans/gold.png",
        "color": "#FFD700",
        "display_order": 1,
        "mutators": {
          "points_events": 1.5,
          "points_strava": 1.5,
          "points_posts": 2.0,
          "discount_store": 10.0,
          "discount_pdv": 10.0,
          "discount_spaces": 15.0,
          "cashback": 10.0
        }
      }
    ],
    "current_subscription": {
      "plan_id": "plan-uuid-1",
      "status": "active"
    }
  }
}
```

---

### GET /subscriptions/plans/:id

Detalhes de um plano específico.

**Parâmetros:**
- `id` (path) - UUID do plano

**Resposta:**

```json
{
  "success": true,
  "data": {
    "id": "plan-uuid-1",
    "name": "Plano Gold",
    "description": "Benefícios premium para associados que querem aproveitar ao máximo a associação.",
    "price_monthly": 49.90,
    "icon_url": "https://cdn.ahub.com/plans/gold.png",
    "color": "#FFD700",
    "display_order": 1,
    "mutators": {
      "points_events": 1.5,
      "points_strava": 1.5,
      "points_posts": 2.0,
      "discount_store": 10.0,
      "discount_pdv": 10.0,
      "discount_spaces": 15.0,
      "cashback": 10.0
    },
    "benefits_summary": [
      "1.5x pontos em eventos e Strava",
      "2x pontos no primeiro post do dia",
      "10% de desconto na Loja e PDV",
      "15% de desconto na locação de espaços",
      "10% de cashback em compras",
      "Verificado dourado no perfil"
    ],
    "is_current": false,
    "can_subscribe": true
  }
}
```

---

### GET /subscriptions/my

Retorna a assinatura atual do usuário autenticado.

**Resposta (com assinatura):**

```json
{
  "success": true,
  "data": {
    "id": "sub-uuid-1",
    "plan": {
      "id": "plan-uuid-1",
      "name": "Plano Gold",
      "color": "#FFD700",
      "price_monthly": 49.90,
      "mutators": { ... }
    },
    "status": "active",
    "subscribed_at": "2026-01-01T10:00:00Z",
    "current_period_start": "2026-01-01T00:00:00Z",
    "current_period_end": "2026-01-31T23:59:59Z",
    "cancelled_at": null,
    "suspended_at": null
  }
}
```

**Resposta (sem assinatura):**

```json
{
  "success": true,
  "data": null
}
```

---

### POST /subscriptions/subscribe

Assina um plano.

**Body:**

```json
{
  "plan_id": "plan-uuid-1"
}
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub-uuid-1",
      "plan_id": "plan-uuid-1",
      "status": "active",
      "subscribed_at": "2026-01-14T15:30:00Z",
      "current_period_start": "2026-01-14T00:00:00Z",
      "current_period_end": "2026-02-13T23:59:59Z"
    },
    "message": "Assinatura ativada com sucesso!"
  }
}
```

**Erros:**
- `400` - Já possui assinatura ativa
- `404` - Plano não encontrado
- `403` - Plano inativo

---

### POST /subscriptions/change

Troca para outro plano.

**Body:**

```json
{
  "plan_id": "plan-uuid-2"
}
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub-uuid-1",
      "plan_id": "plan-uuid-2",
      "status": "active",
      "subscribed_at": "2026-01-01T10:00:00Z",
      "changed_at": "2026-01-14T15:30:00Z",
      "current_period_end": "2026-01-31T23:59:59Z"
    },
    "previous_plan": {
      "id": "plan-uuid-1",
      "name": "Plano Gold"
    },
    "new_plan": {
      "id": "plan-uuid-2",
      "name": "Plano Platinum"
    },
    "message": "Plano alterado com sucesso!"
  }
}
```

**Erros:**
- `400` - Já possui este plano
- `400` - Não possui assinatura ativa
- `404` - Plano não encontrado
- `429` - Limite de trocas excedido (3/dia)

---

### POST /subscriptions/cancel

Cancela a assinatura atual.

**Body:**

```json
{
  "reason": "Não estou utilizando os benefícios"
}
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub-uuid-1",
      "status": "cancelled",
      "cancelled_at": "2026-01-14T15:30:00Z",
      "benefits_until": "2026-01-31T23:59:59Z"
    },
    "message": "Assinatura cancelada. Benefícios válidos até 31/01/2026."
  }
}
```

**Erros:**
- `400` - Não possui assinatura ativa

---

### GET /subscriptions/history

Histórico de assinaturas do usuário.

**Query Parameters:**
- `page` (opcional) - Página (default: 1)
- `limit` (opcional) - Itens por página (default: 20, max: 50)

**Resposta:**

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "hist-uuid-1",
        "plan_name": "Plano Gold",
        "action": "subscribed",
        "details": {
          "price": 49.90
        },
        "created_at": "2026-01-01T10:00:00Z"
      },
      {
        "id": "hist-uuid-2",
        "plan_name": "Plano Platinum",
        "action": "changed",
        "details": {
          "price": 79.90,
          "previous_plan": "Plano Gold"
        },
        "created_at": "2026-01-10T14:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "total_pages": 1
    }
  }
}
```

---

### GET /subscriptions/benefits

Retorna os benefícios ativos do usuário (para cálculos).

**Resposta (com assinatura ativa):**

```json
{
  "success": true,
  "data": {
    "has_subscription": true,
    "plan_name": "Plano Gold",
    "mutators": {
      "points_events": 1.5,
      "points_strava": 1.5,
      "points_posts": 2.0,
      "discount_store": 10.0,
      "discount_pdv": 10.0,
      "discount_spaces": 15.0,
      "cashback": 10.0
    },
    "has_verified_badge": true
  }
}
```

**Resposta (sem assinatura):**

```json
{
  "success": true,
  "data": {
    "has_subscription": false,
    "plan_name": null,
    "mutators": {
      "points_events": 1.0,
      "points_strava": 1.0,
      "points_posts": 1.0,
      "discount_store": 0.0,
      "discount_pdv": 0.0,
      "discount_spaces": 0.0,
      "cashback": 5.0
    },
    "has_verified_badge": false
  }
}
```

---

## Endpoints do ADM

### GET /admin/subscriptions/plans

Lista todos os planos (ativos e inativos).

**Query Parameters:**
- `include_inactive` (opcional) - Incluir inativos (default: true)

**Resposta:**

```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "plan-uuid-1",
        "name": "Plano Gold",
        "description": "...",
        "price_monthly": 49.90,
        "is_active": true,
        "subscribers_count": 250,
        "mutators": { ... },
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-14T10:00:00Z"
      }
    ],
    "stats": {
      "total_plans": 3,
      "active_plans": 3,
      "total_subscribers": 450,
      "monthly_revenue": 18500.00
    }
  }
}
```

---

### POST /admin/subscriptions/plans

Cria um novo plano.

**Body:**

```json
{
  "name": "Plano Bronze",
  "description": "Plano de entrada com benefícios essenciais",
  "price_monthly": 29.90,
  "icon_url": "https://cdn.ahub.com/plans/bronze.png",
  "color": "#CD7F32",
  "display_order": 3,
  "mutators": {
    "points_events": 1.2,
    "points_strava": 1.2,
    "points_posts": 1.5,
    "discount_store": 5.0,
    "discount_pdv": 5.0,
    "discount_spaces": 10.0,
    "cashback": 7.0
  }
}
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "plan-uuid-3",
      "name": "Plano Bronze",
      ...
    },
    "message": "Plano criado com sucesso!"
  }
}
```

**Erros:**
- `400` - Dados inválidos
- `400` - Limite de 3 planos atingido
- `409` - Nome já existe

---

### PUT /admin/subscriptions/plans/:id

Atualiza um plano existente.

**Parâmetros:**
- `id` (path) - UUID do plano

**Body:**

```json
{
  "name": "Plano Gold Plus",
  "price_monthly": 59.90,
  "mutators": {
    "points_events": 1.8,
    ...
  }
}
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "plan": { ... },
    "affected_subscribers": 250,
    "message": "Plano atualizado. 250 assinantes afetados."
  }
}
```

---

### DELETE /admin/subscriptions/plans/:id

Desativa um plano (soft delete).

**Parâmetros:**
- `id` (path) - UUID do plano

**Resposta:**

```json
{
  "success": true,
  "data": {
    "plan_id": "plan-uuid-1",
    "is_active": false,
    "remaining_subscribers": 250,
    "message": "Plano desativado. 250 assinantes manterão seus benefícios."
  }
}
```

---

### GET /admin/subscriptions/subscribers

Lista assinantes.

**Query Parameters:**
- `plan_id` (opcional) - Filtrar por plano
- `status` (opcional) - Filtrar por status (active, suspended, cancelled)
- `search` (opcional) - Buscar por nome ou email
- `page` (opcional) - Página
- `limit` (opcional) - Itens por página

**Resposta:**

```json
{
  "success": true,
  "data": {
    "subscribers": [
      {
        "user": {
          "id": "user-uuid-1",
          "name": "João Silva",
          "email": "joao@email.com",
          "avatar_url": "..."
        },
        "subscription": {
          "id": "sub-uuid-1",
          "plan_id": "plan-uuid-1",
          "plan_name": "Plano Gold",
          "status": "active",
          "subscribed_at": "2026-01-01T10:00:00Z"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 450,
      "total_pages": 23
    }
  }
}
```

---

### POST /admin/subscriptions/users/:id/suspend

Suspende a assinatura de um usuário.

**Parâmetros:**
- `id` (path) - UUID do usuário

**Body:**

```json
{
  "reason": "Inadimplência na mensalidade"
}
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub-uuid-1",
      "status": "suspended",
      "suspended_at": "2026-01-14T15:30:00Z",
      "suspended_by": "admin-uuid",
      "suspend_reason": "Inadimplência na mensalidade"
    },
    "message": "Assinatura suspensa com sucesso."
  }
}
```

---

### POST /admin/subscriptions/users/:id/activate

Reativa a assinatura de um usuário suspenso.

**Parâmetros:**
- `id` (path) - UUID do usuário

**Resposta:**

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub-uuid-1",
      "status": "active",
      "reactivated_at": "2026-01-14T15:30:00Z"
    },
    "message": "Assinatura reativada com sucesso."
  }
}
```

---

### GET /admin/subscriptions/report

Relatório consolidado de assinaturas.

**Query Parameters:**
- `period` (opcional) - 7d, 30d, 90d, 12m (default: 30d)

**Resposta:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_subscribers": 450,
      "active_subscribers": 420,
      "suspended_subscribers": 20,
      "cancelled_this_period": 10,
      "new_this_period": 35,
      "net_growth": 25,
      "monthly_revenue": 18500.00,
      "churn_rate": 2.3
    },
    "by_plan": [
      {
        "plan_id": "plan-uuid-1",
        "plan_name": "Plano Gold",
        "subscribers": 250,
        "percentage": 55.5,
        "revenue": 12475.00
      }
    ],
    "timeline": [
      {
        "date": "2026-01-01",
        "total": 425,
        "new": 5,
        "cancelled": 2
      }
    ]
  }
}
```

---

### GET /admin/subscriptions/history

Histórico de ações administrativas.

**Query Parameters:**
- `action` (opcional) - Filtrar por ação
- `user_id` (opcional) - Filtrar por usuário
- `admin_id` (opcional) - Filtrar por ADM
- `start_date` (opcional) - Data início
- `end_date` (opcional) - Data fim
- `page` (opcional) - Página
- `limit` (opcional) - Itens por página

**Resposta:**

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "hist-uuid-1",
        "user": {
          "id": "user-uuid-1",
          "name": "João Silva"
        },
        "action": "suspended",
        "plan_name": "Plano Gold",
        "details": {
          "reason": "Inadimplência"
        },
        "performed_by": {
          "id": "admin-uuid",
          "name": "Admin Maria"
        },
        "created_at": "2026-01-14T15:30:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

## Webhooks

### Eventos Disparados

| Evento | Descrição |
|--------|-----------|
| `subscription.created` | Nova assinatura criada |
| `subscription.changed` | Plano alterado |
| `subscription.cancelled` | Assinatura cancelada |
| `subscription.suspended` | Assinatura suspensa |
| `subscription.reactivated` | Assinatura reativada |
| `subscription.expired` | Período expirou |

### Payload Exemplo

```json
{
  "event": "subscription.created",
  "timestamp": "2026-01-14T15:30:00Z",
  "data": {
    "subscription_id": "sub-uuid-1",
    "user_id": "user-uuid-1",
    "plan_id": "plan-uuid-1",
    "status": "active"
  }
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `400` | Bad Request - Dados inválidos |
| `401` | Unauthorized - Token inválido |
| `403` | Forbidden - Sem permissão |
| `404` | Not Found - Recurso não encontrado |
| `409` | Conflict - Conflito (ex: nome duplicado) |
| `429` | Too Many Requests - Rate limit excedido |
| `500` | Internal Server Error |

### Formato de Erro

```json
{
  "success": false,
  "error": {
    "code": "ALREADY_SUBSCRIBED",
    "message": "Você já possui uma assinatura ativa.",
    "details": {
      "current_plan": "Plano Gold"
    }
  }
}
```

### Códigos de Erro Específicos

| Código | Mensagem |
|--------|----------|
| `ALREADY_SUBSCRIBED` | Já possui assinatura ativa |
| `NO_SUBSCRIPTION` | Não possui assinatura |
| `PLAN_NOT_FOUND` | Plano não encontrado |
| `PLAN_INACTIVE` | Plano inativo |
| `SAME_PLAN` | Já possui este plano |
| `MAX_PLANS_REACHED` | Limite de 3 planos atingido |
| `RATE_LIMIT_EXCEEDED` | Limite de requisições excedido |

---

## Relacionados

- [README](README.md)
- [Especificação](spec.md)
- [Critérios de Aceitação](acceptance-criteria.md)
