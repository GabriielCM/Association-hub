---
module: notificacoes
document: api
status: complete
priority: mvp
last_updated: 2026-01-26
---

# Notificações - API

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Notificações](#2-notificações)
3. [Configurações](#3-configurações)
4. [Não Perturbe](#4-não-perturbe)
5. [Contadores](#5-contadores)
6. [WebSocket](#6-websocket)
7. [Códigos de Erro](#7-códigos-de-erro)

---

## 1. Visão Geral

### 1.1 Base URL

```
https://api.ahub.com/v1/notifications
```

### 1.2 Autenticação

Todos os endpoints requerem `Authorization: Bearer {token}`.

### 1.3 Códigos de Resposta

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado |
| 204 | Sem conteúdo |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Não autorizado |
| 404 | Não encontrado |
| 422 | Entidade não processável |
| 429 | Rate limit excedido |

---

## 2. Notificações

### GET /

Lista notificações do usuário autenticado.

**Query Parameters:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| `category` | String | Filtra por categoria: `social`, `events`, `points`, `reservations`, `system` |
| `is_read` | Boolean | Filtra por status de leitura |
| `grouped` | Boolean | Se `true`, retorna notificações agrupadas (default: `true`) |
| `page` | Integer | Página (default: 1) |
| `per_page` | Integer | Itens por página (default: 20, max: 50) |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "new_like",
      "category": "social",
      "title": "Maria curtiu seu post",
      "body": "Treino de hoje foi incrível...",
      "image_url": "https://cdn.ahub.com/avatars/maria.jpg",
      "action_url": "/posts/123",
      "group_key": null,
      "is_read": false,
      "created_at": "2026-01-26T14:30:00Z"
    },
    {
      "id": "group_likes_456",
      "type": "grouped",
      "category": "social",
      "title": "5 pessoas curtiram seu post",
      "body": "Maria, João, Ana e mais 2",
      "image_url": null,
      "action_url": "/posts/456",
      "group_key": "likes_post_456",
      "is_read": false,
      "count": 5,
      "notifications": [
        {
          "id": "uuid-1",
          "type": "new_like",
          "title": "Maria curtiu seu post",
          "image_url": "https://...",
          "created_at": "2026-01-26T14:25:00Z"
        },
        {
          "id": "uuid-2",
          "type": "new_like",
          "title": "João curtiu seu post",
          "image_url": "https://...",
          "created_at": "2026-01-26T14:20:00Z"
        }
      ],
      "created_at": "2026-01-26T14:25:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 45,
    "total_pages": 3,
    "unread_count": 12
  }
}
```

---

### GET /:id

Detalhes de uma notificação específica.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "type": "new_event",
    "category": "events",
    "title": "Novo evento: Corrida Matinal",
    "body": "Amanhã às 6:00 na praça central. Venha participar!",
    "image_url": "https://cdn.ahub.com/events/corrida.jpg",
    "action_url": "/events/789",
    "data": {
      "event_id": "789",
      "event_name": "Corrida Matinal",
      "event_date": "2026-01-27T06:00:00Z"
    },
    "is_read": false,
    "created_at": "2026-01-26T14:30:00Z"
  }
}
```

---

### POST /:id/read

Marca uma notificação como lida.

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "is_read": true
  }
}
```

---

### POST /read-all

Marca todas as notificações como lidas.

**Response:** `200 OK`
```json
{
  "data": {
    "marked_count": 12
  }
}
```

---

### POST /read-category/:category

Marca todas as notificações de uma categoria como lidas.

**Path Parameters:**
- `category`: `social`, `events`, `points`, `reservations`, `system`

**Response:** `200 OK`
```json
{
  "data": {
    "category": "social",
    "marked_count": 5
  }
}
```

---

### DELETE /:id

Remove uma notificação.

**Response:** `204 No Content`

---

### DELETE /clear

Remove todas as notificações lidas.

**Response:** `200 OK`
```json
{
  "data": {
    "deleted_count": 35
  }
}
```

---

### GET /group/:groupKey

Lista notificações de um grupo específico.

**Response:**
```json
{
  "data": {
    "group_key": "likes_post_456",
    "category": "social",
    "title": "5 pessoas curtiram seu post",
    "count": 5,
    "action_url": "/posts/456",
    "notifications": [
      {
        "id": "uuid-1",
        "type": "new_like",
        "title": "Maria curtiu seu post",
        "body": null,
        "image_url": "https://cdn.ahub.com/avatars/maria.jpg",
        "data": {
          "user_id": "user-maria",
          "user_name": "Maria Silva"
        },
        "is_read": false,
        "created_at": "2026-01-26T14:25:00Z"
      },
      {
        "id": "uuid-2",
        "type": "new_like",
        "title": "João curtiu seu post",
        "body": null,
        "image_url": "https://cdn.ahub.com/avatars/joao.jpg",
        "data": {
          "user_id": "user-joao",
          "user_name": "João Santos"
        },
        "is_read": false,
        "created_at": "2026-01-26T14:20:00Z"
      }
    ]
  }
}
```

---

### POST /group/:groupKey/read

Marca todas as notificações de um grupo como lidas.

**Response:** `200 OK`
```json
{
  "data": {
    "group_key": "likes_post_456",
    "marked_count": 5
  }
}
```

---

## 3. Configurações

### GET /settings

Retorna configurações de notificação do usuário.

**Response:**
```json
{
  "data": {
    "categories": [
      {
        "category": "social",
        "label": "Social",
        "description": "Curtidas, comentários, menções",
        "push_enabled": true,
        "in_app_enabled": true
      },
      {
        "category": "events",
        "label": "Eventos",
        "description": "Lembretes, check-in, badges",
        "push_enabled": true,
        "in_app_enabled": true
      },
      {
        "category": "points",
        "label": "Pontos",
        "description": "Ganhos, gastos, rankings",
        "push_enabled": true,
        "in_app_enabled": true
      },
      {
        "category": "reservations",
        "label": "Reservas",
        "description": "Aprovações, lembretes",
        "push_enabled": true,
        "in_app_enabled": true
      },
      {
        "category": "system",
        "label": "Sistema",
        "description": "Mensagens, carteirinha",
        "push_enabled": true,
        "in_app_enabled": true
      }
    ]
  }
}
```

---

### PUT /settings/:category

Atualiza configurações de uma categoria.

**Path Parameters:**
- `category`: `social`, `events`, `points`, `reservations`, `system`

**Request:**
```json
{
  "push_enabled": true,
  "in_app_enabled": false
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "category": "social",
    "push_enabled": true,
    "in_app_enabled": false
  }
}
```

---

### GET /settings/:category

Retorna configurações de uma categoria específica.

**Response:**
```json
{
  "data": {
    "category": "social",
    "label": "Social",
    "description": "Curtidas, comentários, menções",
    "push_enabled": true,
    "in_app_enabled": true,
    "types": [
      { "type": "new_like", "label": "Curtidas" },
      { "type": "new_comment", "label": "Comentários" },
      { "type": "comment_reply", "label": "Respostas" },
      { "type": "mention", "label": "Menções" },
      { "type": "new_follower", "label": "Novos seguidores" },
      { "type": "story_view", "label": "Views em stories" },
      { "type": "poll_ended", "label": "Enquetes finalizadas" }
    ]
  }
}
```

---

## 4. Não Perturbe

### GET /dnd

Retorna configurações de Não Perturbe.

**Response:**
```json
{
  "data": {
    "enabled": true,
    "start_time": "22:00",
    "end_time": "07:00",
    "days_of_week": [0, 1, 2, 3, 4, 5, 6],
    "is_active_now": false
  }
}
```

---

### PUT /dnd

Atualiza configurações de Não Perturbe.

**Request:**
```json
{
  "enabled": true,
  "start_time": "22:00",
  "end_time": "07:00",
  "days_of_week": [0, 1, 2, 3, 4]
}
```

**Validações:**
- `start_time` e `end_time`: formato HH:mm
- `days_of_week`: array de 0-6 (0=Domingo, 6=Sábado)

**Response:** `200 OK`
```json
{
  "data": {
    "enabled": true,
    "start_time": "22:00",
    "end_time": "07:00",
    "days_of_week": [0, 1, 2, 3, 4],
    "is_active_now": true
  }
}
```

---

## 5. Contadores

### GET /unread-count

Retorna contadores de notificações não lidas.

**Response:**
```json
{
  "data": {
    "total": 12,
    "by_category": {
      "social": 5,
      "events": 3,
      "points": 2,
      "reservations": 1,
      "system": 1
    }
  }
}
```

---

## 6. WebSocket

### Conexão

```
wss://api.ahub.com/v1/ws/notifications
```

**Handshake:**
```json
{
  "token": "Bearer {jwt_token}"
}
```

### Eventos Server → Client

| Evento | Descrição |
|--------|-----------|
| `notification.new` | Nova notificação recebida |
| `notification.read` | Notificação marcada como lida |
| `notification.deleted` | Notificação deletada |
| `unread_count.update` | Contador atualizado |
| `settings.changed` | Configurações alteradas |

### Payloads

**notification.new:**
```json
{
  "event": "notification.new",
  "data": {
    "notification": {
      "id": "uuid",
      "type": "new_like",
      "category": "social",
      "title": "Maria curtiu seu post",
      "body": "Treino de hoje...",
      "image_url": "https://...",
      "action_url": "/posts/123",
      "group_key": "likes_post_123",
      "is_read": false,
      "created_at": "2026-01-26T14:30:00Z"
    },
    "unread_count": {
      "total": 13,
      "by_category": {
        "social": 6,
        "events": 3,
        "points": 2,
        "reservations": 1,
        "system": 1
      }
    }
  }
}
```

**notification.read:**
```json
{
  "event": "notification.read",
  "data": {
    "notification_ids": ["uuid-1", "uuid-2"],
    "unread_count": {
      "total": 10,
      "by_category": {
        "social": 4,
        "events": 3,
        "points": 2,
        "reservations": 0,
        "system": 1
      }
    }
  }
}
```

**unread_count.update:**
```json
{
  "event": "unread_count.update",
  "data": {
    "total": 10,
    "by_category": {
      "social": 4,
      "events": 3,
      "points": 2,
      "reservations": 0,
      "system": 1
    }
  }
}
```

**settings.changed:**
```json
{
  "event": "settings.changed",
  "data": {
    "category": "social",
    "push_enabled": false,
    "in_app_enabled": true
  }
}
```

---

## 7. Códigos de Erro

| Código | HTTP | Descrição |
|--------|------|-----------|
| `NOTIFICATION_NOT_FOUND` | 404 | Notificação não encontrada |
| `GROUP_NOT_FOUND` | 404 | Grupo de notificações não encontrado |
| `INVALID_CATEGORY` | 400 | Categoria inválida |
| `INVALID_TIME_FORMAT` | 400 | Formato de horário inválido (use HH:mm) |
| `INVALID_DAYS` | 400 | Dias da semana inválidos (use 0-6) |
| `ALREADY_READ` | 409 | Notificação já está marcada como lida |
| `PUSH_TOKEN_INVALID` | 400 | Token de push notification inválido |
| `PUSH_DISABLED` | 403 | Push notifications desabilitadas pelo usuário |

### Exemplo de Erro

```json
{
  "error": {
    "code": "NOTIFICATION_NOT_FOUND",
    "message": "Notificação não encontrada",
    "details": {
      "notification_id": "uuid-invalido"
    }
  }
}
```

---

## Apêndice: Tipos de Notificação

### Categoria: Social

| Tipo | Trigger | Deep Link |
|------|---------|-----------|
| `new_like` | Alguém curte um post | `/posts/:postId` |
| `new_comment` | Alguém comenta em um post | `/posts/:postId/comments` |
| `comment_reply` | Alguém responde um comentário | `/posts/:postId/comments/:commentId` |
| `mention` | Alguém menciona o usuário | `/posts/:postId` ou `/comments/:commentId` |
| `new_follower` | Novo seguidor | `/profile/:userId` |
| `story_view` | Alguém viu a story | `/stories/viewers/:storyId` |
| `poll_ended` | Enquete finalizada | `/posts/:postId` |

### Categoria: Events

| Tipo | Trigger | Deep Link |
|------|---------|-----------|
| `new_event` | Novo evento criado | `/events/:eventId` |
| `event_reminder_1d` | 1 dia antes do evento | `/events/:eventId` |
| `event_reminder_1h` | 1 hora antes do evento | `/events/:eventId` |
| `event_started` | Evento iniciou | `/events/:eventId` |
| `checkin_reminder` | Lembrete de check-in | `/events/:eventId/checkin` |
| `badge_earned` | Badge conquistado | `/profile/badges` |
| `event_cancelled` | Evento cancelado | `/events` |
| `event_updated` | Evento atualizado | `/events/:eventId` |
| `checkin_progress` | Progresso de check-ins | `/events/:eventId/stats` |

### Categoria: Points

| Tipo | Trigger | Deep Link |
|------|---------|-----------|
| `points_received` | Pontos ganhos | `/wallet` |
| `points_spent` | Pontos gastos | `/wallet/history` |
| `ranking_up` | Subiu no ranking | `/rankings` |
| `transfer_received` | Recebeu transferência | `/wallet` |
| `strava_sync` | Sincronização Strava | `/wallet` |

### Categoria: Reservations

| Tipo | Trigger | Deep Link |
|------|---------|-----------|
| `reservation_approved` | Reserva aprovada | `/reservations/:id` |
| `reservation_rejected` | Reserva rejeitada | `/reservations/:id` |
| `reservation_reminder` | Lembrete de reserva | `/reservations/:id` |
| `waitlist_available` | Vaga na fila de espera | `/spaces/:spaceId/reserve` |

### Categoria: System

| Tipo | Trigger | Deep Link |
|------|---------|-----------|
| `new_message` | Nova mensagem | `/messages/:conversationId` |
| `new_benefit` | Novo benefício disponível | `/card/benefits` |
| `card_blocked` | Carteirinha bloqueada | `/card` |
| `card_unblocked` | Carteirinha desbloqueada | `/card` |
| `admin_announcement` | Comunicado da administração | `/notifications/:id` |
