---
module: dashboard
document: api
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Dashboard - API

[← Voltar ao Índice](README.md)

---

## Índice

- [Dashboard Geral](#dashboard-geral)
- [Notificações](#notificações)
- [Stories](#stories)
- [Feed](#feed)
- [Comentários](#comentários)
- [Enquetes](#enquetes)
- [Eventos no Feed](#eventos-no-feed)
- [Moderação](#moderação)

---

## Dashboard Geral

### GET `/dashboard`

Retorna dados resumidos de todos os componentes do dashboard.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "user": {
    "name": "João Silva",
    "avatar_url": "https://...",
    "points": 1250,
    "points_today": 50,
    "points_chart": [10, 25, 15, 30, 20, 50, 50]
  },
  "unread_notifications": 3,
  "has_stories": true,
  "feed_preview": [...]
}
```

---

## Notificações

### GET `/notifications`

Lista notificações do usuário.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Query params:**
- `limit` (number): Quantidade de notificações (default: 5)
- `unread_only` (boolean): Apenas não lidas

**Response:**
```json
{
  "notifications": [
    {
      "id": "1",
      "type": "like|comment|event|points",
      "message": "João curtiu seu post",
      "read": false,
      "created_at": "2026-01-09T10:00:00Z",
      "action_url": "/posts/123"
    }
  ],
  "total_unread": 3
}
```

---

### PUT `/notifications/:id/read`

Marca notificação como lida.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "success": true
}
```

---

### GET `/notifications/count`

Retorna contador de notificações não lidas.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "unread_count": 3
}
```

---

## Stories

### GET `/stories`

Retorna lista de stories disponíveis.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "stories": [
    {
      "user_id": "123",
      "username": "João Silva",
      "avatar_url": "https://...",
      "has_unseen": true,
      "stories_count": 3
    }
  ]
}
```

---

### POST `/stories`

Cria novo story.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Body:** multipart/form-data (imagem/vídeo) ou JSON (texto)

**Para imagem/vídeo:**
```
media: File (JPG, PNG, MP4)
```

**Para texto:**
```json
{
  "type": "text",
  "text": "Conteúdo do story",
  "background_color": "#FF5733"
}
```

**Response:**
```json
{
  "id": "1",
  "type": "image|video|text",
  "url": "https://...",
  "created_at": "2026-01-09T10:00:00Z",
  "expires_at": "2026-01-10T10:00:00Z"
}
```

---

### GET `/stories/:user_id`

Retorna todos os stories de um usuário.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "stories": [
    {
      "id": "1",
      "type": "image|video|text",
      "url": "https://...",
      "text": "...",
      "background_color": "#FF5733",
      "created_at": "2026-01-09T10:00:00Z",
      "expires_at": "2026-01-10T10:00:00Z"
    }
  ]
}
```

---

### POST `/stories/:id/view`

Registra visualização de story.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "success": true
}
```

---

### GET `/stories/:id/views`

Retorna lista de quem visualizou (apenas próprio story).

**Autenticação:** Requerida
**Permissões:** Common User, ADM (apenas próprio story)

**Response:**
```json
{
  "views": [
    {
      "user_id": "123",
      "username": "Maria Silva",
      "avatar_url": "https://...",
      "viewed_at": "2026-01-09T10:30:00Z"
    }
  ],
  "total_views": 42
}
```

---

### DELETE `/stories/:id`

Deleta story (apenas próprio).

**Autenticação:** Requerida
**Permissões:** Common User, ADM (apenas próprio story)

**Response:**
```json
{
  "success": true
}
```

---

## Feed

### GET `/feed`

Retorna posts do feed.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Query params:**
- `offset` (number): Paginação (default: 0)
- `limit` (number): Quantidade de posts (default: 10)

**Response:**
```json
{
  "posts": [
    {
      "id": "1",
      "type": "photo|poll|event",
      "author": {
        "id": "123",
        "name": "João Silva",
        "avatar_url": "https://..."
      },
      "created_at": "2026-01-09T10:00:00Z",
      "content": {
        "image_url": "https://...",
        "description": "Texto do post",
        "likes_count": 24,
        "comments_count": 5,
        "liked_by_me": false
      },
      "pinned": false
    }
  ],
  "has_more": true
}
```

---

### POST `/posts`

Cria novo post.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Body:** multipart/form-data
```
image: File (JPG, PNG)
description: string (máx 500 caracteres)
```

**Response:**
```json
{
  "post": {...},
  "points_earned": 10,
  "message": "Post publicado! +10 pontos"
}
```

---

### GET `/posts/:id`

Retorna post específico.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "post": {...}
}
```

---

### PUT `/posts/:id`

Atualiza post (apenas descrição).

**Autenticação:** Requerida
**Permissões:** Common User, ADM (apenas próprio post)

**Body:**
```json
{
  "description": "Nova descrição"
}
```

**Response:**
```json
{
  "post": {...}
}
```

---

### DELETE `/posts/:id`

Deleta post (apenas próprio ou ADM).

**Autenticação:** Requerida
**Permissões:** Common User (próprio), ADM (qualquer)

**Response:**
```json
{
  "success": true
}
```

---

### POST `/posts/:id/like`

Curte post.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "success": true,
  "likes_count": 25
}
```

---

### DELETE `/posts/:id/like`

Remove curtida.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "success": true,
  "likes_count": 24
}
```

---

## Comentários

### GET `/posts/:id/comments`

Retorna comentários do post.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Query params:**
- `offset` (number): Paginação (default: 0)
- `limit` (number): Quantidade (default: 20)

**Response:**
```json
{
  "comments": [
    {
      "id": "1",
      "author": {...},
      "text": "Que legal!",
      "created_at": "...",
      "reactions": {
        "heart": 3,
        "thumbs_up": 1
      },
      "my_reaction": "heart",
      "replies": [...]
    }
  ],
  "total": 15
}
```

---

### POST `/posts/:id/comments`

Cria comentário.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Body:**
```json
{
  "text": "Texto do comentário",
  "parent_id": null
}
```

**Response:**
```json
{
  "comment": {...}
}
```

---

### DELETE `/comments/:id`

Deleta comentário (apenas próprio ou ADM).

**Autenticação:** Requerida
**Permissões:** Common User (próprio), ADM (qualquer)

**Response:**
```json
{
  "success": true
}
```

---

### POST `/comments/:id/react`

Adiciona reação ao comentário.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Body:**
```json
{
  "reaction": "heart|thumbs_up|laugh|wow"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### DELETE `/comments/:id/react`

Remove reação.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "success": true
}
```

---

## Enquetes

### POST `/polls`

Cria enquete.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Body:**
```json
{
  "question": "Qual seu horário preferido?",
  "options": ["Manhã", "Tarde", "Noite"],
  "duration_days": 3
}
```

**Response:**
```json
{
  "poll": {...},
  "points_earned": 10
}
```

---

### POST `/polls/:id/vote`

Vota na enquete.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Body:**
```json
{
  "option_index": 1
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "options": [
      {"text": "Manhã", "percentage": 35, "votes": 44},
      {"text": "Tarde", "percentage": 45, "votes": 56},
      {"text": "Noite", "percentage": 20, "votes": 25}
    ],
    "total_votes": 125
  }
}
```

---

### GET `/polls/:id/results`

Retorna resultados da enquete.

**Autenticação:** Requerida
**Permissões:** Common User, ADM (apenas após votar ou se encerrada)

**Response:**
```json
{
  "results": {...}
}
```

---

## Eventos no Feed

### POST `/events` (ADM only)

Cria evento no Módulo Eventos e gera post automaticamente no feed.

**Autenticação:** Requerida
**Permissões:** ADM

**Body:** FormData com dados do evento + banner

**Response:**
```json
{
  "event": {...},
  "post_id": "123"
}
```

**Nota:** O post no feed é vinculado ao evento (sincronizado).

---

### PUT `/events/:id` (ADM only)

Atualiza evento e automaticamente atualiza o post correspondente no feed.

**Autenticação:** Requerida
**Permissões:** ADM

---

### DELETE `/events/:id` (ADM only)

Deleta evento e remove automaticamente o post do feed.

**Autenticação:** Requerida
**Permissões:** ADM

---

### POST `/events/:id/interest`

Marca interesse no evento (atualiza contador no post do feed).

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "success": true,
  "interest_count": 43
}
```

---

### DELETE `/events/:id/interest`

Remove interesse no evento.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

---

## Moderação

### GET `/reports` (ADM only)

Retorna lista de denúncias.

**Autenticação:** Requerida
**Permissões:** ADM

**Response:**
```json
{
  "reports": [
    {
      "id": "1",
      "type": "post|comment",
      "target_id": "123",
      "reason": "spam",
      "description": "...",
      "reporter": {...},
      "created_at": "...",
      "status": "pending|resolved|dismissed"
    }
  ]
}
```

---

### POST `/posts/:id/report`

Denuncia post.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Body:**
```json
{
  "reason": "spam|inappropriate|harassment|misinformation|other",
  "description": "Descrição opcional"
}
```

**Response:**
```json
{
  "success": true,
  "report_id": "123"
}
```

---

### DELETE `/posts/:id` (ADM only)

Remove post denunciado.

**Autenticação:** Requerida
**Permissões:** ADM

---

### POST `/users/:id/suspend` (ADM only)

Suspende usuário.

**Autenticação:** Requerida
**Permissões:** ADM

**Body:**
```json
{
  "duration_days": 7,
  "reason": "Motivo da suspensão"
}
```

**Response:**
```json
{
  "success": true,
  "suspended_until": "2026-01-16T00:00:00Z"
}
```

---

## Códigos de Erro Comuns

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Parâmetros inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Ação já realizada (ex: já votou) |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error |

---

## Relacionados

- [Especificação](spec.md)
- [Componentes](components.md)
- [Critérios de Aceitação](acceptance-criteria.md)
- [API Reference Completa](../api/endpoints-reference.md)
