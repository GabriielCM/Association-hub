---
module: suporte
document: api
status: complete
priority: phase2
last_updated: 2026-01-26
---

# Suporte - API

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [FAQ](#2-faq)
3. [Tickets](#3-tickets)
4. [Chat ao Vivo](#4-chat-ao-vivo)
5. [Anexos](#5-anexos)
6. [ADM - Tickets](#6-adm---tickets)
7. [ADM - FAQ](#7-adm---faq)
8. [ADM - Chat](#8-adm---chat)
9. [WebSocket](#9-websocket)
10. [Códigos de Erro](#10-códigos-de-erro)

---

## 1. Visão Geral

### 1.1 Base URL

```
https://api.ahub.com/v1/support
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
| 409 | Conflito |
| 422 | Entidade não processável |
| 429 | Rate limit excedido |

---

## 2. FAQ

### GET /faq

Lista perguntas frequentes ativas.

**Query Parameters:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| `category` | String | Filtra por categoria |
| `search` | String | Busca em pergunta e resposta |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "question": "Como altero minha senha?",
      "answer": "Acesse Perfil > Configurações > Alterar Senha...",
      "category": "Conta",
      "order": 1
    },
    {
      "id": "uuid",
      "question": "Como ganho pontos?",
      "answer": "Você ganha pontos participando de eventos...",
      "category": "Pontos",
      "order": 1
    }
  ],
  "meta": {
    "categories": ["Conta", "Pontos", "Eventos", "Loja"]
  }
}
```

---

## 3. Tickets

### GET /tickets

Lista tickets do usuário autenticado.

**Query Parameters:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| `status` | String | `open`, `in_progress`, `resolved`, `closed` |
| `page` | Integer | Página (default: 1) |
| `per_page` | Integer | Itens por página (default: 20, max: 50) |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "TKT-123",
      "category": "bug",
      "subject": "Bug no login",
      "status": "in_progress",
      "is_automatic": false,
      "message_count": 5,
      "has_unread": true,
      "created_at": "2026-01-25T14:30:00Z",
      "updated_at": "2026-01-26T10:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 3,
    "total_pages": 1
  }
}
```

---

### POST /tickets

Cria novo ticket.

**Request:**
```json
{
  "category": "bug",
  "subject": "App fecha ao fazer login",
  "description": "Quando tento fazer login com minha conta, o app fecha automaticamente...",
  "attachment_ids": ["uuid", "uuid"]
}
```

**Validações:**
- `category`: obrigatório, enum: `bug`, `suggestion`, `question`
- `subject`: obrigatório, 5-100 caracteres
- `description`: obrigatório, 20-5000 caracteres
- `attachment_ids`: opcional, máximo 5 itens

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "code": "TKT-124",
    "category": "bug",
    "subject": "App fecha ao fazer login",
    "description": "Quando tento fazer login...",
    "status": "open",
    "is_automatic": false,
    "attachments": [
      {
        "id": "uuid",
        "type": "image",
        "url": "https://cdn.ahub.com/support/...",
        "filename": "screenshot.png"
      }
    ],
    "created_at": "2026-01-26T14:30:00Z"
  }
}
```

---

### POST /tickets/automatic

Cria ticket automático (crash report).

**Request:**
```json
{
  "error_type": "crash",
  "device_info": {
    "platform": "android",
    "os_version": "14.0",
    "app_version": "2.1.0",
    "device_model": "Samsung S23",
    "stack_trace": "Error: NullPointerException\n  at com.ahub.login..."
  }
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "code": "TKT-125",
    "category": "bug",
    "subject": "Crash Report - NullPointerException",
    "status": "open",
    "is_automatic": true,
    "device_info": {...},
    "created_at": "2026-01-26T14:30:00Z"
  }
}
```

**Erros:**
| Código | Erro | Descrição |
|--------|------|-----------|
| 429 | `RATE_LIMITED` | Máximo 1 ticket automático por tipo de erro por dia |

---

### GET /tickets/{id}

Detalhes de um ticket com mensagens.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "code": "TKT-123",
    "category": "bug",
    "subject": "Bug no login",
    "description": "Quando tento fazer login...",
    "status": "in_progress",
    "is_automatic": false,
    "device_info": null,
    "attachments": [...],
    "rating": null,
    "messages": [
      {
        "id": "uuid",
        "sender_type": "user",
        "sender": {
          "id": "uuid",
          "name": "João Silva",
          "avatar_url": "https://..."
        },
        "content": "Quando tento fazer login...",
        "attachments": [...],
        "created_at": "2026-01-25T14:30:00Z"
      },
      {
        "id": "uuid",
        "sender_type": "support",
        "sender": {
          "id": "uuid",
          "name": "Maria - Suporte"
        },
        "content": "Olá! Obrigado pelo contato...",
        "attachments": [],
        "created_at": "2026-01-25T15:00:00Z"
      }
    ],
    "created_at": "2026-01-25T14:30:00Z",
    "updated_at": "2026-01-26T10:00:00Z",
    "resolved_at": null
  }
}
```

---

### POST /tickets/{id}/messages

Envia mensagem em um ticket.

**Request:**
```json
{
  "content": "Versão do app é 2.1.0",
  "attachment_ids": []
}
```

**Validações:**
- `content`: obrigatório, 1-5000 caracteres
- `attachment_ids`: opcional, máximo 5 itens

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "sender_type": "user",
    "content": "Versão do app é 2.1.0",
    "attachments": [],
    "created_at": "2026-01-26T14:35:00Z"
  }
}
```

**Nota:** Se ticket estava `resolved`, volta para `open`.

---

### POST /tickets/{id}/resolve

Usuário marca ticket como resolvido.

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "status": "resolved",
    "resolved_at": "2026-01-26T14:40:00Z"
  }
}
```

**Erros:**
| Código | Erro | Descrição |
|--------|------|-----------|
| 400 | `ALREADY_RESOLVED` | Ticket já está resolvido/fechado |

---

### POST /tickets/{id}/rating

Avalia atendimento do ticket.

**Request:**
```json
{
  "rating": 5,
  "comment": "Excelente atendimento!"
}
```

**Validações:**
- `rating`: obrigatório, 1-5
- `comment`: opcional, máximo 500 caracteres

**Response:** `201 Created`
```json
{
  "data": {
    "rating": 5,
    "comment": "Excelente atendimento!",
    "created_at": "2026-01-26T14:45:00Z"
  }
}
```

**Notas:**
- Ticket muda para status `closed` após avaliação
- Apenas tickets `resolved` podem ser avaliados

**Erros:**
| Código | Erro | Descrição |
|--------|------|-----------|
| 400 | `NOT_RESOLVED` | Ticket precisa estar resolvido |
| 409 | `ALREADY_RATED` | Ticket já foi avaliado |

---

## 4. Chat ao Vivo

### POST /chat/connect

Inicia sessão de chat ao vivo (entra na fila).

**Response:** `201 Created`
```json
{
  "data": {
    "session_id": "uuid",
    "status": "queued",
    "queue_position": 3,
    "estimated_minutes": 5
  }
}
```

**Erros:**
| Código | Erro | Descrição |
|--------|------|-----------|
| 409 | `ALREADY_IN_QUEUE` | Usuário já possui sessão ativa |

---

### GET /chat/status

Status da sessão de chat atual.

**Response:**
```json
{
  "data": {
    "session_id": "uuid",
    "status": "active",
    "agent": {
      "id": "uuid",
      "name": "Maria",
      "avatar_url": "https://..."
    },
    "started_at": "2026-01-26T14:30:00Z"
  }
}
```

**Se na fila:**
```json
{
  "data": {
    "session_id": "uuid",
    "status": "queued",
    "queue_position": 2,
    "estimated_minutes": 3
  }
}
```

**Se sem sessão ativa:**
```json
{
  "data": null
}
```

---

### GET /chat/messages

Lista mensagens da sessão ativa.

**Query Parameters:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| `before` | String | ID da mensagem para paginação (mais antigas) |
| `limit` | Integer | Quantidade (default: 50) |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "sender_type": "agent",
      "content": "Olá! Como posso ajudar?",
      "attachments": [],
      "created_at": "2026-01-26T14:30:00Z"
    },
    {
      "id": "uuid",
      "sender_type": "user",
      "content": "Oi, estou com um problema...",
      "attachments": [],
      "created_at": "2026-01-26T14:31:00Z"
    }
  ],
  "meta": {
    "has_more": false
  }
}
```

---

### POST /chat/messages

Envia mensagem no chat.

**Request:**
```json
{
  "content": "Obrigado pela ajuda!",
  "attachment_ids": []
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "sender_type": "user",
    "content": "Obrigado pela ajuda!",
    "attachments": [],
    "created_at": "2026-01-26T14:35:00Z"
  }
}
```

**Erros:**
| Código | Erro | Descrição |
|--------|------|-----------|
| 400 | `NO_ACTIVE_SESSION` | Não há sessão de chat ativa |
| 400 | `SESSION_NOT_CONNECTED` | Ainda na fila, aguarde atendente |

---

### POST /chat/disconnect

Encerra sessão de chat.

**Response:** `200 OK`
```json
{
  "data": {
    "session_id": "uuid",
    "status": "ended",
    "ended_at": "2026-01-26T14:40:00Z"
  }
}
```

---

### POST /chat/rating

Avalia sessão de chat (após encerramento).

**Request:**
```json
{
  "rating": 5,
  "comment": "Muito prestativo!"
}
```

**Response:** `201 Created`

---

## 5. Anexos

### POST /attachments

Upload de arquivo para anexar em ticket/chat.

**Request:** `multipart/form-data`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `file` | File | Arquivo (imagem, vídeo, documento) |

**Validações:**
- Tamanho máximo: 10MB
- Tipos permitidos: `image/jpeg`, `image/png`, `image/gif`, `video/mp4`, `video/quicktime`, `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "type": "image",
    "url": "https://cdn.ahub.com/support/uploads/...",
    "filename": "screenshot.png",
    "size_bytes": 245000,
    "mime_type": "image/png",
    "expires_at": "2026-01-26T15:30:00Z"
  }
}
```

**Notas:**
- Upload retorna ID temporário válido por 1 hora
- ID deve ser usado em `attachment_ids` ao criar ticket/mensagem
- Após associação, arquivo se torna permanente

**Erros:**
| Código | Erro | Descrição |
|--------|------|-----------|
| 400 | `FILE_TOO_LARGE` | Arquivo maior que 10MB |
| 400 | `INVALID_FILE_TYPE` | Tipo de arquivo não permitido |

---

## 6. ADM - Tickets

### GET /admin/tickets

Lista todos os tickets.

**Query Parameters:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| `status` | String | Filtra por status |
| `category` | String | Filtra por categoria |
| `is_automatic` | Boolean | Filtra por automático |
| `user_id` | String | Filtra por usuário |
| `search` | String | Busca em assunto e usuário |
| `page` | Integer | Página |
| `per_page` | Integer | Itens por página |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "TKT-123",
      "category": "bug",
      "subject": "Bug no checkout",
      "status": "open",
      "is_automatic": false,
      "user": {
        "id": "uuid",
        "name": "João Silva",
        "email": "joao@email.com"
      },
      "message_count": 3,
      "created_at": "2026-01-26T14:30:00Z",
      "updated_at": "2026-01-26T14:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 45,
    "total_pages": 3,
    "counts": {
      "open": 12,
      "in_progress": 8,
      "resolved": 20,
      "closed": 5
    }
  }
}
```

---

### GET /admin/tickets/{id}

Detalhes completos do ticket (inclui dados do usuário).

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "code": "TKT-123",
    "category": "bug",
    "subject": "Bug no checkout",
    "description": "...",
    "status": "in_progress",
    "is_automatic": true,
    "device_info": {
      "platform": "android",
      "os_version": "14.0",
      "app_version": "2.1.0",
      "device_model": "Samsung S23",
      "stack_trace": "Error: NullPointerException..."
    },
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "+5511999999999",
      "member_since": "2025-03-15",
      "total_tickets": 5
    },
    "attachments": [...],
    "messages": [...],
    "rating": {
      "rating": 5,
      "comment": "Ótimo atendimento!",
      "created_at": "..."
    },
    "assigned_to": {
      "id": "uuid",
      "name": "Maria - Suporte"
    },
    "created_at": "...",
    "updated_at": "...",
    "resolved_at": "..."
  }
}
```

---

### PATCH /admin/tickets/{id}

Atualiza ticket (status, atribuição).

**Request:**
```json
{
  "status": "in_progress",
  "assigned_to": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "status": "in_progress",
    "assigned_to": {...},
    "updated_at": "..."
  }
}
```

**Nota:** Alteração de status notifica o usuário.

---

### POST /admin/tickets/{id}/messages

Suporte responde ticket.

**Request:**
```json
{
  "content": "Olá! Obrigado pelo contato...",
  "attachment_ids": []
}
```

**Response:** `201 Created`

---

## 7. ADM - FAQ

### GET /admin/faq

Lista todas as perguntas (incluindo inativas).

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "question": "Como altero minha senha?",
      "answer": "Acesse Perfil > Configurações...",
      "category": "Conta",
      "order": 1,
      "is_active": true,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

---

### POST /admin/faq

Cria nova pergunta.

**Request:**
```json
{
  "question": "Como funciona o cashback?",
  "answer": "O cashback é creditado automaticamente...",
  "category": "Pontos",
  "order": 5,
  "is_active": true
}
```

**Response:** `201 Created`

---

### PATCH /admin/faq/{id}

Atualiza pergunta.

**Request:**
```json
{
  "answer": "Resposta atualizada...",
  "is_active": false
}
```

**Response:** `200 OK`

---

### DELETE /admin/faq/{id}

Remove pergunta (hard delete).

**Response:** `204 No Content`

---

### PATCH /admin/faq/reorder

Reordena perguntas.

**Request:**
```json
{
  "items": [
    { "id": "uuid1", "order": 1 },
    { "id": "uuid2", "order": 2 },
    { "id": "uuid3", "order": 3 }
  ]
}
```

**Response:** `200 OK`

---

## 8. ADM - Chat

### GET /admin/chat/queue

Lista fila de espera do chat.

**Response:**
```json
{
  "data": [
    {
      "session_id": "uuid",
      "user": {
        "id": "uuid",
        "name": "João Silva",
        "avatar_url": "..."
      },
      "waiting_since": "2026-01-26T14:25:00Z",
      "waiting_minutes": 5
    }
  ],
  "meta": {
    "total_waiting": 3
  }
}
```

---

### GET /admin/chat/active

Lista chats ativos do atendente.

**Response:**
```json
{
  "data": [
    {
      "session_id": "uuid",
      "user": {
        "id": "uuid",
        "name": "Pedro Lima"
      },
      "started_at": "2026-01-26T14:20:00Z",
      "duration_minutes": 15,
      "message_count": 12
    }
  ]
}
```

---

### POST /admin/chat/accept/{session_id}

Aceita chat da fila.

**Response:** `200 OK`
```json
{
  "data": {
    "session_id": "uuid",
    "status": "active",
    "user": {...},
    "started_at": "2026-01-26T14:30:00Z"
  }
}
```

**Nota:** Dispara notificação push para o usuário.

---

### POST /admin/chat/transfer/{session_id}

Transfere chat para outro atendente.

**Request:**
```json
{
  "to_agent_id": "uuid"
}
```

**Response:** `200 OK`

---

### POST /admin/chat/{session_id}/messages

Atendente envia mensagem.

**Request:**
```json
{
  "content": "Como posso ajudar?",
  "attachment_ids": []
}
```

**Response:** `201 Created`

---

### POST /admin/chat/{session_id}/end

Atendente encerra chat.

**Response:** `200 OK`
```json
{
  "data": {
    "session_id": "uuid",
    "status": "ended",
    "ended_at": "2026-01-26T14:45:00Z"
  }
}
```

---

## 9. WebSocket

### Conexão

```
wss://api.ahub.com/v1/ws/support
```

**Handshake:**
```json
{
  "token": "Bearer {jwt_token}"
}
```

### Eventos - Usuário

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `ticket.updated` | Server → Client | Ticket atualizado |
| `ticket.message` | Server → Client | Nova mensagem no ticket |
| `chat.connected` | Server → Client | Conectado ao atendente |
| `chat.message` | Server → Client | Nova mensagem no chat |
| `chat.typing` | Server → Client | Atendente digitando |
| `chat.ended` | Server → Client | Chat encerrado |
| `queue.position` | Server → Client | Posição na fila atualizada |

### Eventos - ADM

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `ticket.new` | Server → Client | Novo ticket criado |
| `ticket.message` | Server → Client | Nova mensagem de usuário |
| `chat.queue.update` | Server → Client | Fila atualizada |
| `chat.message` | Server → Client | Mensagem do usuário |
| `chat.typing` | Server → Client | Usuário digitando |

### Client → Server

| Evento | Descrição |
|--------|-----------|
| `chat.typing` | Indicar que está digitando |
| `chat.stop_typing` | Parou de digitar |

---

## 10. Códigos de Erro

| Código | HTTP | Descrição |
|--------|------|-----------|
| `TICKET_NOT_FOUND` | 404 | Ticket não encontrado |
| `NOT_TICKET_OWNER` | 403 | Usuário não é dono do ticket |
| `TICKET_CLOSED` | 400 | Ticket já está fechado |
| `ALREADY_RESOLVED` | 400 | Ticket já está resolvido |
| `NOT_RESOLVED` | 400 | Ticket precisa estar resolvido |
| `ALREADY_RATED` | 409 | Ticket/Chat já foi avaliado |
| `MAX_ATTACHMENTS` | 400 | Limite de 5 anexos excedido |
| `FILE_TOO_LARGE` | 400 | Arquivo maior que 10MB |
| `INVALID_FILE_TYPE` | 400 | Tipo de arquivo não permitido |
| `ATTACHMENT_EXPIRED` | 400 | Upload expirou (> 1 hora) |
| `ALREADY_IN_QUEUE` | 409 | Já possui sessão de chat ativa |
| `NO_ACTIVE_SESSION` | 400 | Não há sessão de chat ativa |
| `SESSION_NOT_CONNECTED` | 400 | Ainda aguardando na fila |
| `SESSION_NOT_FOUND` | 404 | Sessão de chat não encontrada |
| `RATE_LIMITED` | 429 | Limite de tickets automáticos atingido |
