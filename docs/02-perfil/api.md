---
module: perfil
document: api
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Perfil - API

[← Voltar ao Índice](README.md)

---

## Endpoints

### GET `/user/:id/profile`

Retorna dados do perfil do usuário.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "user": {
    "id": "123",
    "name": "João Silva",
    "username": "joaosilva",
    "avatar_url": "https://...",
    "bio": "Descrição do usuário",
    "has_stories": true,
    "badges": [
      {
        "id": "1",
        "name": "Top 1",
        "icon_url": "https://...",
        "description": "1º lugar no ranking mensal"
      }
    ],
    "stats": {
      "posts_count": 42,
      "points": 1250
    },
    "is_me": false
  }
}
```

---

### GET `/user/:id/posts`

Retorna posts do usuário.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Query params:**
- `offset` (number): Paginação
- `limit` (number): Quantidade (default: 12)

**Response:**
```json
{
  "posts": [
    {
      "id": "1",
      "type": "photo|poll",
      "thumbnail_url": "https://...",
      "created_at": "..."
    }
  ],
  "has_more": true
}
```

---

### GET `/user/:id/badges`

Retorna badges do usuário.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "badges": [
    {
      "id": "1",
      "name": "Top 1 Janeiro",
      "icon_url": "https://...",
      "description": "1º lugar no ranking de Janeiro 2026",
      "earned_at": "2026-01-31T23:59:59Z",
      "displayed": true
    }
  ],
  "total": 15
}
```

---

### GET `/user/:id/rankings`

Retorna posições em rankings.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:**
```json
{
  "rankings": [
    {
      "name": "Ranking Geral",
      "position": 5,
      "total_participants": 500,
      "points": 1250
    }
  ]
}
```

---

### PUT `/user/profile`

Atualiza perfil do usuário (apenas próprio).

**Autenticação:** Requerida
**Permissões:** Common User, ADM (apenas próprio)

**Body:**
```json
{
  "name": "Novo Nome",
  "bio": "Nova bio"
}
```

**Response:**
```json
{
  "user": {...}
}
```

---

### POST `/user/avatar`

Atualiza foto de perfil.

**Autenticação:** Requerida
**Permissões:** Common User, ADM (apenas próprio)

**Body:** multipart/form-data
```
avatar: File (JPG, PNG, máx 5MB)
```

**Response:**
```json
{
  "avatar_url": "https://..."
}
```

---

### PUT `/user/badges/display`

Seleciona quais badges exibir no perfil.

**Autenticação:** Requerida
**Permissões:** Common User, ADM (apenas próprio)

**Body:**
```json
{
  "badge_ids": ["1", "2", "3"]
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Relacionados

- [Especificação](spec.md)
- [Critérios de Aceitação](acceptance-criteria.md)
