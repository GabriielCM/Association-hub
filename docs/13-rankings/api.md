---
module: rankings
document: api
status: complete
priority: phase2
last_updated: 2026-01-28
---

# Rankings - API

[← Voltar](README.md)

---

## Índice

1. [Endpoints Usuário](#endpoints-usuário)
2. [Endpoints ADM](#endpoints-adm)
3. [WebSocket Events](#websocket-events)

---

## Endpoints Usuário

### GET /rankings/:category

Retorna o ranking de uma categoria específica.

**Autenticação:** Sim
**Permissões:** Common User, ADM

**Path params:**

| Param | Tipo | Valores |
|-------|------|---------|
| category | String | `posts`, `events`, `strava` |

**Query params:**

| Param | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| period | String | `monthly` | `monthly` ou `all_time` |
| limit | Integer | 10 | Máximo de entries (1-100) |

**Response 200:**

```json
{
  "category": "posts",
  "period": "monthly",
  "updated_at": "2026-01-28T12:00:00Z",
  "entries": [
    {
      "position": 1,
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "user_name": "João Silva",
      "user_avatar": "https://cdn.example.com/avatars/joao.jpg",
      "value": 5000,
      "reached_at": "2026-01-15T10:00:00Z",
      "is_current_user": false,
      "badge_id": "posts-monthly-top1"
    },
    {
      "position": 2,
      "user_id": "550e8400-e29b-41d4-a716-446655440002",
      "user_name": "Maria Santos",
      "user_avatar": "https://cdn.example.com/avatars/maria.jpg",
      "value": 4500,
      "reached_at": "2026-01-16T14:30:00Z",
      "is_current_user": true,
      "badge_id": "posts-monthly-top2"
    }
  ],
  "current_user": {
    "position": 2,
    "value": 4500,
    "reached_at": "2026-01-16T14:30:00Z"
  },
  "total_participants": 342
}
```

**Response 400:**

```json
{
  "error": "invalid_category",
  "message": "Categoria inválida. Use: posts, events, strava"
}
```

---

### GET /rankings/:category/user/:userId

Retorna a posição de um usuário específico em uma categoria.

**Autenticação:** Sim
**Permissões:** Common User, ADM

**Path params:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| category | String | `posts`, `events`, `strava` |
| userId | UUID | ID do usuário |

**Query params:**

| Param | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| period | String | `monthly` | `monthly` ou `all_time` |

**Response 200:**

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "category": "posts",
  "period": "monthly",
  "position": 5,
  "value": 3200,
  "reached_at": "2026-01-20T08:30:00Z",
  "badge_id": null,
  "total_participants": 342
}
```

**Response 404:**

```json
{
  "error": "user_not_found",
  "message": "Usuário não encontrado ou sem pontuação nesta categoria"
}
```

---

### GET /user/:userId/ranking-history

Retorna o histórico de conquistas de ranking de um usuário.

**Autenticação:** Sim
**Permissões:** Common User (próprio), ADM (qualquer)

**Path params:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| userId | UUID | ID do usuário |

**Query params:**

| Param | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| limit | Integer | 20 | Máximo de registros |
| offset | Integer | 0 | Paginação |

**Response 200:**

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "total": 8,
  "history": [
    {
      "badge_id": "posts-monthly-top1",
      "badge_name": "Rei dos Posts",
      "badge_icon": "https://cdn.example.com/badges/posts-top1.png",
      "category": "posts",
      "period": "monthly",
      "position": 1,
      "earned_at": "2026-01-31T23:59:59Z",
      "lost_at": null,
      "reference_period": "2026-01",
      "is_active": true
    },
    {
      "badge_id": "events-monthly-top2",
      "badge_name": "Vice dos Eventos",
      "badge_icon": "https://cdn.example.com/badges/events-top2.png",
      "category": "events",
      "period": "monthly",
      "position": 2,
      "earned_at": "2025-12-31T23:59:59Z",
      "lost_at": "2026-01-05T14:30:00Z",
      "reference_period": "2025-12",
      "is_active": false
    }
  ]
}
```

---

### GET /user/:userId/ranking-badges

Retorna as badges de ranking ativas de um usuário.

**Autenticação:** Sim
**Permissões:** Common User, ADM

**Path params:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| userId | UUID | ID do usuário |

**Response 200:**

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "badges": [
    {
      "id": "posts-monthly-top1",
      "name": "Rei dos Posts",
      "description": "Top 1 em posts do mês de Janeiro/2026",
      "icon_url": "https://cdn.example.com/badges/posts-top1.png",
      "colors": {
        "primary": "#FFD700",
        "background": "#FFF8E1"
      },
      "category": "posts",
      "period": "monthly",
      "position": 1,
      "earned_at": "2026-01-15T10:00:00Z",
      "displayed": true
    },
    {
      "id": "strava-alltime-top3",
      "name": "Destaque Strava",
      "description": "Top 3 histórico no Strava",
      "icon_url": "https://cdn.example.com/badges/strava-top3.png",
      "colors": {
        "primary": "#CD7F32",
        "background": "#FFF3E0"
      },
      "category": "strava",
      "period": "all_time",
      "position": 3,
      "earned_at": "2026-01-10T16:45:00Z",
      "displayed": true
    }
  ]
}
```

---

### GET /rankings/summary

Retorna um resumo de todas as categorias e períodos para o usuário logado.

**Autenticação:** Sim
**Permissões:** Common User, ADM

**Response 200:**

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "updated_at": "2026-01-28T12:00:00Z",
  "rankings": [
    {
      "category": "posts",
      "period": "monthly",
      "position": 5,
      "value": 3200,
      "badge_id": null
    },
    {
      "category": "posts",
      "period": "all_time",
      "position": 12,
      "value": 28500,
      "badge_id": null
    },
    {
      "category": "events",
      "period": "monthly",
      "position": 3,
      "value": 800,
      "badge_id": "events-monthly-top3"
    },
    {
      "category": "events",
      "period": "all_time",
      "position": 8,
      "value": 5200,
      "badge_id": null
    },
    {
      "category": "strava",
      "period": "monthly",
      "position": 1,
      "value": 450,
      "badge_id": "strava-monthly-top1"
    },
    {
      "category": "strava",
      "period": "all_time",
      "position": 4,
      "value": 3800,
      "badge_id": null
    }
  ]
}
```

---

## Endpoints ADM

### GET /admin/rankings/badges

Lista todas as badges de ranking configuradas.

**Autenticação:** Sim
**Permissões:** ADM

**Response 200:**

```json
{
  "badges": [
    {
      "id": "posts-monthly-top1",
      "category": "posts",
      "period": "monthly",
      "position": 1,
      "name": "Rei dos Posts",
      "description": "Top 1 em posts do mês",
      "icon_url": "https://cdn.example.com/badges/posts-top1.png",
      "colors": {
        "primary": "#FFD700",
        "background": "#FFF8E1"
      },
      "is_active": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 18
}
```

---

### POST /admin/rankings/badges

Cria ou reseta uma badge para valores padrão.

**Autenticação:** Sim
**Permissões:** ADM

**Request body:**

```json
{
  "category": "posts",
  "period": "monthly",
  "position": 1,
  "name": "Rei dos Posts",
  "description": "Top 1 em posts do mês",
  "icon_url": "https://cdn.example.com/badges/posts-top1.png",
  "colors": {
    "primary": "#FFD700",
    "background": "#FFF8E1"
  },
  "is_active": true
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| category | String | Sim | posts, events, strava |
| period | String | Sim | monthly, all_time |
| position | Integer | Sim | 1, 2 ou 3 |
| name | String | Sim | Nome da badge (máx 30 chars) |
| description | String | Sim | Descrição (máx 100 chars) |
| icon_url | URL | Sim | URL do ícone |
| colors | Object | Sim | Cores da badge |
| is_active | Boolean | Sim | Se está ativa |

**Response 201:**

```json
{
  "id": "posts-monthly-top1",
  "category": "posts",
  "period": "monthly",
  "position": 1,
  "name": "Rei dos Posts",
  "description": "Top 1 em posts do mês",
  "icon_url": "https://cdn.example.com/badges/posts-top1.png",
  "colors": {
    "primary": "#FFD700",
    "background": "#FFF8E1"
  },
  "is_active": true,
  "created_at": "2026-01-28T12:00:00Z"
}
```

---

### PUT /admin/rankings/badges/:id

Atualiza uma badge existente.

**Autenticação:** Sim
**Permissões:** ADM

**Path params:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| id | String | ID da badge (ex: posts-monthly-top1) |

**Request body:**

```json
{
  "name": "Mestre dos Posts",
  "description": "Campeão de posts do mês",
  "icon_url": "https://cdn.example.com/badges/posts-top1-v2.png",
  "colors": {
    "primary": "#FFC107",
    "background": "#FFFDE7"
  },
  "is_active": true
}
```

**Response 200:**

```json
{
  "id": "posts-monthly-top1",
  "category": "posts",
  "period": "monthly",
  "position": 1,
  "name": "Mestre dos Posts",
  "description": "Campeão de posts do mês",
  "icon_url": "https://cdn.example.com/badges/posts-top1-v2.png",
  "colors": {
    "primary": "#FFC107",
    "background": "#FFFDE7"
  },
  "is_active": true,
  "updated_at": "2026-01-28T14:30:00Z"
}
```

**Response 404:**

```json
{
  "error": "badge_not_found",
  "message": "Badge não encontrada"
}
```

---

### DELETE /admin/rankings/badges/:id

Desativa uma badge (soft delete).

**Autenticação:** Sim
**Permissões:** ADM

**Path params:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| id | String | ID da badge |

**Response 200:**

```json
{
  "id": "posts-monthly-top1",
  "is_active": false,
  "message": "Badge desativada com sucesso"
}
```

**Nota:** Badges não são deletadas permanentemente. São apenas desativadas. Usuários que possuem a badge mantêm no histórico, mas ela não é mais concedida.

---

### GET /admin/rankings/config

Retorna configurações gerais do módulo de rankings.

**Autenticação:** Sim
**Permissões:** ADM

**Response 200:**

```json
{
  "active_categories": ["posts", "events", "strava"],
  "active_periods": ["monthly", "all_time"],
  "podium_positions": 3,
  "update_strategy": "realtime",
  "cache_ttl_seconds": 300
}
```

---

### PUT /admin/rankings/config

Atualiza configurações gerais do módulo de rankings.

**Autenticação:** Sim
**Permissões:** ADM

**Request body:**

```json
{
  "active_categories": ["posts", "events"],
  "active_periods": ["monthly"],
  "podium_positions": 3
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| active_categories | Array | Categorias ativas |
| active_periods | Array | Períodos ativos |
| podium_positions | Integer | Quantas posições premiar (1-10) |

**Response 200:**

```json
{
  "active_categories": ["posts", "events"],
  "active_periods": ["monthly"],
  "podium_positions": 3,
  "updated_at": "2026-01-28T14:30:00Z"
}
```

---

### POST /admin/rankings/badges/:id/upload-icon

Faz upload de um ícone para uma badge.

**Autenticação:** Sim
**Permissões:** ADM

**Path params:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| id | String | ID da badge |

**Request:** `multipart/form-data`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| icon | File | PNG ou SVG, máx 512KB |

**Response 200:**

```json
{
  "id": "posts-monthly-top1",
  "icon_url": "https://cdn.example.com/badges/posts-top1-1706446200.png",
  "message": "Ícone atualizado com sucesso"
}
```

**Response 400:**

```json
{
  "error": "invalid_file",
  "message": "Arquivo deve ser PNG ou SVG com no máximo 512KB"
}
```

---

## WebSocket Events

### Conexão

```
wss://api.example.com/ws/rankings
```

**Headers:**
```
Authorization: Bearer {token}
```

### Subscribe

```json
{
  "action": "subscribe",
  "channel": "rankings",
  "filters": {
    "categories": ["posts", "events", "strava"],
    "periods": ["monthly"]
  }
}
```

### Event: ranking_update

Enviado quando há mudança no ranking.

```json
{
  "event": "ranking_update",
  "timestamp": "2026-01-28T14:35:00Z",
  "data": {
    "category": "posts",
    "period": "monthly",
    "changes": [
      {
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "user_name": "João Silva",
        "old_position": 2,
        "new_position": 1,
        "value": 5100,
        "badge_gained": "posts-monthly-top1"
      },
      {
        "user_id": "550e8400-e29b-41d4-a716-446655440002",
        "user_name": "Maria Santos",
        "old_position": 1,
        "new_position": 2,
        "value": 5000,
        "badge_lost": "posts-monthly-top1",
        "badge_gained": "posts-monthly-top2"
      }
    ]
  }
}
```

### Event: badge_update

Enviado quando uma badge é configurada pelo ADM.

```json
{
  "event": "badge_update",
  "timestamp": "2026-01-28T14:40:00Z",
  "data": {
    "badge_id": "posts-monthly-top1",
    "action": "updated",
    "changes": ["name", "icon_url"]
  }
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Parâmetros inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Recurso não encontrado |
| 429 | Rate limit excedido |
| 500 | Erro interno |

---

## Relacionados

- [Especificação](spec.md) - Detalhes técnicos
- [Badges](badges.md) - Sistema de badges
- [Critérios de Aceitação](acceptance-criteria.md) - Checklist
- [Sistema de Pontos - API](../06-sistema-pontos/api.md) - Endpoints de pontos
