---
module: eventos
document: api
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Eventos - API

[← Voltar ao Índice](README.md)

---

## Índice

- [Endpoints - Common User](#endpoints---common-user)
- [Endpoints - ADM](#endpoints---adm)
- [Endpoints - Display](#endpoints---display)
- [Endpoints - Badges](#endpoints---badges)
- [WebSocket](#websocket)

---

## Endpoints - Common User

### GET `/events`

Lista eventos disponíveis.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Query params:**
- `status` (string): all, upcoming, past
- `category` (string): social, esportivo, cultural, etc
- `search` (string): Busca por texto

**Response:**
```json
{
  "events": [
    {
      "id": "evt_123",
      "title": "Festa Junina 2026",
      "description": "...",
      "category": "social",
      "start_date": "2026-06-15T19:00:00Z",
      "end_date": "2026-06-15T23:00:00Z",
      "location": {
        "name": "Salão Principal",
        "address": "Rua das Flores, 123",
        "space_id": "spc_456"
      },
      "banner_feed": "https://...",
      "banner_display": ["https://...", "https://..."],
      "color": "#FF5733",
      "points_total": 100,
      "checkins_count": 4,
      "checkin_interval_minutes": 30,
      "badge": {
        "id": "bdg_789",
        "name": "Participante Festa Junina 2026",
        "icon_url": "https://..."
      },
      "status": "scheduled",
      "confirmed_count": 42,
      "checkin_count": 0,
      "my_confirmation": true,
      "my_progress": {
        "checkins_done": 0,
        "total_checkins": 4,
        "points_earned": 0
      }
    }
  ]
}
```

---

### GET `/events/:id`

Detalhes completos do evento.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Response:** Evento completo + últimos 20 comentários

---

### POST `/events/:id/confirm`

Confirma presença no evento.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Body:** vazio

**Response:** Status atualizado

---

### DELETE `/events/:id/confirm`

Remove confirmação de presença.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

---

### POST `/events/:id/checkin`

Faz check-in via QR Code.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Body:**
```json
{
  "qr_data": "...",
  "checkin_number": 2,
  "security_token": "abc123",
  "timestamp": 1704067200
}
```

**Validações backend:**
- Evento existe e está ativo
- Check-in atual disponível
- Token válido e não expirado
- Usuário não fez este check-in ainda
- Intervalo respeitado (se aplicável)

**Response:**
```json
{
  "success": true,
  "checkin_number": 2,
  "points_earned": 25,
  "total_points": 50,
  "progress": {
    "checkins_done": 2,
    "total_checkins": 4
  },
  "badge_earned": false,
  "next_checkin_available_at": "2026-06-15T20:00:00Z"
}
```

---

### GET `/events/:id/comments`

Lista comentários do evento.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Query params:**
- `offset` (number): Paginação
- `limit` (number): Quantidade

---

### POST `/events/:id/comments`

Cria comentário no evento.

**Autenticação:** Requerida
**Permissões:** Common User, ADM

**Body:**
```json
{
  "text": "..."
}
```

---

## Endpoints - ADM

### POST `/events`

Cria novo evento.

**Autenticação:** Requerida
**Permissões:** ADM

**Body:** FormData (multipart) com todos os campos

**Response:** Evento criado + display_id + post_id (se aplicável)

---

### PUT `/events/:id`

Atualiza evento existente.

**Autenticação:** Requerida
**Permissões:** ADM

**Validações de estado:** Regras de edição conforme estado do evento

**Response:** Evento atualizado

---

### DELETE `/events/:id`

Deleta ou cancela evento.

**Autenticação:** Requerida
**Permissões:** ADM

**Comportamento:**
- Rascunhos: Deleta permanentemente
- Publicados: Cancela (soft delete)

---

### POST `/events/:id/publish`

Publica rascunho.

**Autenticação:** Requerida
**Permissões:** ADM

**Efeitos:**
- Cria Display vinculado
- Cria Post no feed (se configurado)
- Envia notificações

---

### POST `/events/:id/cancel`

Cancela evento.

**Autenticação:** Requerida
**Permissões:** ADM

**Body:**
```json
{
  "reason": "..."
}
```

**Efeitos:**
- Evento vai para status "Cancelado"
- Notifica confirmados
- Atualiza Display e Feed

---

### POST `/events/:id/pause`

Pausa check-ins temporariamente.

**Autenticação:** Requerida
**Permissões:** ADM

**Body:**
```json
{
  "paused": true
}
```

---

### POST `/events/:id/checkin/manual`

Check-in manual de emergência.

**Autenticação:** Requerida
**Permissões:** ADM

**Body:**
```json
{
  "user_id": "usr_123",
  "checkin_number": 2,
  "reason": "QR Code não funcionou"
}
```

---

### GET `/events/:id/analytics`

Retorna analytics detalhados.

**Autenticação:** Requerida
**Permissões:** ADM

**Response:** Métricas completas do evento

---

### GET `/events/:id/export/csv`

Exporta relatório em CSV.

**Autenticação:** Requerida
**Permissões:** ADM

**Response:** Download do arquivo CSV

---

### GET `/events/:id/export/pdf`

Exporta relatório em PDF.

**Autenticação:** Requerida
**Permissões:** ADM

**Response:** Download do arquivo PDF

---

## Endpoints - Display

### GET `/display/:event_id`

Página HTML fullscreen do Display.

**Autenticação:** Não requerida (público)

**Response:** Página HTML com WebSocket connection script

---

## WebSocket

### `/ws/display/:event_id`

Conexão persistente para Display.

**Servidor envia:**
- Novo QR Code (a cada 1 min)
- Mudança de check-in (após intervalo)
- Atualização de contador
- Pausar/retomar
- Cancelamento

**Formato:**
```json
{
  "type": "qr_update",
  "data": {
    "qr_code": "...",
    "security_token": "...",
    "expires_at": 1704067260
  }
}
```

**Tipos de mensagem:**
- `qr_update`: Novo QR Code
- `checkin_change`: Mudança de check-in
- `counter_update`: Atualização do contador
- `status_change`: Mudança de status (pausado, cancelado)

---

## Endpoints - Badges

### GET `/badges`

Lista todos os badges.

**Autenticação:** Requerida
**Permissões:** ADM

**Query params:**
- `search` (string): Busca por nome
- `sort` (string): Ordenação

---

### POST `/badges`

Cria novo badge.

**Autenticação:** Requerida
**Permissões:** ADM

**Body:** FormData (ícone + dados)

---

### PUT `/badges/:id`

Atualiza badge.

**Autenticação:** Requerida
**Permissões:** ADM

---

### DELETE `/badges/:id`

Deleta badge.

**Autenticação:** Requerida
**Permissões:** ADM

**Validação:** Só pode deletar se não estiver vinculado a evento

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Parâmetros inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Evento não encontrado |
| 409 | Conflict - Check-in já realizado |
| 422 | Unprocessable - QR Code expirado/inválido |
| 500 | Internal Server Error |

---

## Relacionados

- [Especificação](spec.md)
- [Sistema de Check-in](checkin-system.md)
- [QR Code Security](qr-code-security.md)
- [Analytics](analytics.md)
- [Critérios de Aceitação](acceptance-criteria.md)
