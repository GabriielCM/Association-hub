---
section: api
document: endpoints-reference
status: partial
last_updated: 2026-01-10
---

# Referência de Endpoints

[← Voltar ao Índice](README.md)

---

## Índice

- [Autenticação](#autenticação)
- [Dashboard](#dashboard)
- [Perfil](#perfil)
- [Carteirinha](#carteirinha)
- [Eventos](#eventos)
- [Badges](#badges)
- [Display](#display)

---

## Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/login` | Login com email/senha |
| POST | `/auth/refresh` | Renovar token |
| POST | `/auth/logout` | Encerrar sessão |
| POST | `/auth/password/reset` | Solicitar reset de senha |

---

## Dashboard

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/dashboard` | Dados consolidados do dashboard | User |
| GET | `/notifications` | Listar notificações | User |
| PUT | `/notifications/:id/read` | Marcar como lida | User |
| PUT | `/notifications/read-all` | Marcar todas como lidas | User |

### Stories

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/stories` | Listar stories ativos | User |
| GET | `/stories/:id` | Visualizar story | User |
| POST | `/stories` | Criar story | ADM |
| DELETE | `/stories/:id` | Deletar story | ADM |

### Feed

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/feed` | Listar posts | User |
| GET | `/feed/:id` | Detalhes do post | User |
| POST | `/feed` | Criar post | User |
| PUT | `/feed/:id` | Editar post | Owner/ADM |
| DELETE | `/feed/:id` | Deletar post | Owner/ADM |
| POST | `/feed/:id/like` | Curtir post | User |
| DELETE | `/feed/:id/like` | Descurtir post | User |
| GET | `/feed/:id/comments` | Listar comentários | User |
| POST | `/feed/:id/comments` | Criar comentário | User |
| DELETE | `/feed/:id/comments/:cid` | Deletar comentário | Owner/ADM |

### Enquetes

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/feed/polls` | Criar enquete | ADM |
| POST | `/feed/polls/:id/vote` | Votar em opção | User |

---

## Perfil

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/user/profile` | Dados do perfil | User |
| PUT | `/user/profile` | Atualizar perfil | User |
| GET | `/user/profile/:id` | Perfil de outro usuário | User |
| GET | `/user/badges` | Badges conquistados | User |
| PUT | `/user/badges/featured` | Selecionar badges exibidos | User |

---

## Carteirinha

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/user/card` | Dados da carteirinha | User |
| GET | `/user/card/status` | Status ativo/inativo | User |
| GET | `/user/card/qrcode` | Gerar QR Code | User |
| GET | `/user/card/history` | Histórico de uso | User |

### Benefícios

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/benefits` | Listar parceiros | User |
| GET | `/benefits/:id` | Detalhes do parceiro | User |
| GET | `/benefits/categories` | Listar categorias | User |
| POST | `/benefits/nearby` | Parceiros próximos | User |

---

## Eventos

### Common User

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/events` | Listar eventos | User |
| GET | `/events/:id` | Detalhes do evento | User |
| POST | `/events/:id/confirm` | Confirmar presença | User |
| DELETE | `/events/:id/confirm` | Remover confirmação | User |
| POST | `/events/:id/checkin` | Fazer check-in | User |
| GET | `/events/:id/comments` | Listar comentários | User |
| POST | `/events/:id/comments` | Criar comentário | User |

### ADM

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/events` | Criar evento | ADM |
| PUT | `/events/:id` | Atualizar evento | ADM |
| DELETE | `/events/:id` | Deletar/Cancelar evento | ADM |
| POST | `/events/:id/publish` | Publicar rascunho | ADM |
| POST | `/events/:id/cancel` | Cancelar evento | ADM |
| POST | `/events/:id/pause` | Pausar check-ins | ADM |
| POST | `/events/:id/checkin/manual` | Check-in manual | ADM |
| GET | `/events/:id/analytics` | Analytics do evento | ADM |
| GET | `/events/:id/export/csv` | Exportar CSV | ADM |
| GET | `/events/:id/export/pdf` | Exportar PDF | ADM |

---

## Badges

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/badges` | Listar badges | ADM |
| POST | `/badges` | Criar badge | ADM |
| PUT | `/badges/:id` | Atualizar badge | ADM |
| DELETE | `/badges/:id` | Deletar badge | ADM |

---

## Display

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/display/:event_id` | Página do Display | Público |
| WS | `/ws/display/:event_id` | WebSocket do Display | Público |

---

## WebSocket Events

### Display (`/ws/display/:event_id`)

| Tipo | Direção | Descrição |
|------|---------|-----------|
| `qr_update` | Server → Client | Novo QR Code |
| `checkin_change` | Server → Client | Mudança de check-in |
| `counter_update` | Server → Client | Atualização do contador |
| `status_change` | Server → Client | Mudança de status |
| `heartbeat` | Bidirecional | Manter conexão viva |

---

## Relacionados

- [Dashboard API](../01-dashboard/api.md)
- [Perfil API](../02-perfil/api.md)
- [Carteirinha API](../03-carteirinha/api.md)
- [Eventos API](../04-eventos/api.md)
