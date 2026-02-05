---
module: implementation
document: phase-04-status
status: completed
priority: mvp
last_updated: 2026-02-05
---

# Fase 4 - Comunicação

## Status Geral

| Componente | Status | Progresso |
|------------|--------|-----------|
| Schema Prisma (Notifications) | ✅ Completo | 100% |
| Schema Prisma (Messages) | ✅ Completo | 100% |
| Notifications Module | ✅ Completo | 100% |
| Messages Module | ✅ Completo | 100% |
| WebSocket Gateways | ✅ Completo | 100% |
| Integrações (Events, Points) | ✅ Completo | 100% |
| Testes Unitários | ✅ Completo | 97%+ |

---

## 1. Alterações no Schema Prisma

### Modelos de Notificações

| Modelo | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `Notification` | Notificação do usuário | type, category, title, body, data, groupKey, isRead |
| `NotificationSettings` | Configurações por categoria | pushEnabled, inAppEnabled |
| `DoNotDisturbSettings` | Configurações de Não Perturbe | enabled, startTime, endTime, daysOfWeek |
| `DeviceToken` | Tokens de push | token, platform (IOS, ANDROID, WEB) |

### Modelos de Mensagens

| Modelo | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `Conversation` | Conversa 1:1 ou grupo | type (DIRECT, GROUP) |
| `ConversationParticipant` | Participantes | role (MEMBER, ADMIN), isMuted, isArchived, lastReadAt |
| `Message` | Mensagem | content, contentType, mediaUrl, status, replyToId |
| `MessageReaction` | Reações em mensagens | emoji |
| `ConversationGroup` | Dados do grupo | name, description, imageUrl, createdById |

### Novos Enums

| Enum | Valores |
|------|---------|
| `NotificationType` | 27 tipos (NEW_LIKE, POINTS_RECEIVED, NEW_EVENT, etc.) |
| `NotificationCategory` | SOCIAL, EVENTS, POINTS, RESERVATIONS, SYSTEM |
| `ConversationType` | DIRECT, GROUP |
| `ConversationRole` | MEMBER, ADMIN |
| `MessageContentType` | TEXT, IMAGE, AUDIO |
| `MessageStatus` | SENDING, SENT, DELIVERED, READ |
| `DevicePlatform` | IOS, ANDROID, WEB |

---

## 2. Módulo Notificações

### Endpoints (14 endpoints)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/notifications` | Listar notificações (paginado, filtros) |
| GET | `/notifications/unread-count` | Contadores por categoria |
| GET | `/notifications/:id` | Detalhes de uma notificação |
| POST | `/notifications/:id/read` | Marcar como lida |
| POST | `/notifications/read-all` | Marcar todas como lidas |
| POST | `/notifications/read-category/:category` | Marcar categoria como lida |
| POST | `/notifications/group/:groupKey/read` | Marcar grupo como lido |
| DELETE | `/notifications/:id` | Excluir notificação |
| DELETE | `/notifications/clear` | Excluir todas as lidas |
| GET | `/notifications/settings` | Obter configurações |
| GET | `/notifications/settings/:category` | Configurações de categoria |
| PUT | `/notifications/settings/:category` | Atualizar categoria |
| GET | `/notifications/dnd` | Configurações DND |
| PUT | `/notifications/dnd` | Atualizar DND |

### Funcionalidades

- ✅ Notificações individuais e em batch
- ✅ Agrupamento por `groupKey`
- ✅ Limite de 500 notificações por usuário (auto-cleanup)
- ✅ Configurações por categoria (push/in-app)
- ✅ Do Not Disturb com horários e dias da semana
- ✅ WebSocket para atualizações em tempo real
- ✅ Contadores de não lidas por categoria

### WebSocket Gateway (Notificações)

**Namespace**: `/ws/notifications`

**Eventos Server → Client:**

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `notification.new` | `{ id, type, category, title, body, ... }` | Nova notificação |
| `notification.read` | `{ notificationId }` | Notificação lida |
| `notification.deleted` | `{ notificationId }` | Notificação excluída |
| `unread_count.update` | `{ total, byCategory }` | Contadores atualizados |
| `settings.changed` | `{ category, pushEnabled, inAppEnabled }` | Configurações alteradas |

---

## 3. Módulo Mensagens

### Endpoints (16 endpoints)

**Conversas:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/conversations` | Listar conversas |
| POST | `/conversations` | Criar conversa 1:1 ou grupo |
| GET | `/conversations/:id` | Detalhes da conversa |
| PUT | `/conversations/:id/settings` | Mute/archive |
| DELETE | `/conversations/:id` | Sair da conversa |
| POST | `/conversations/:id/read` | Marcar como lida |
| POST | `/conversations/:id/typing` | Indicador de digitação (HTTP fallback) |
| GET | `/conversations/:id/messages` | Histórico paginado |
| POST | `/conversations/:id/messages` | Enviar mensagem |

**Mensagens:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| DELETE | `/messages/:id` | Excluir mensagem |
| POST | `/messages/:id/reactions` | Adicionar reação |
| DELETE | `/messages/:id/reactions/:emoji` | Remover reação |

**Grupos:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/conversations/:id/group` | Info do grupo |
| PUT | `/conversations/:id/group` | Atualizar grupo |
| POST | `/conversations/:id/group/participants` | Adicionar membros |
| DELETE | `/conversations/:id/group/participants/:userId` | Remover membro |
| POST | `/conversations/:id/group/admins` | Promover a admin |

### Funcionalidades

- ✅ Conversas 1:1 e em grupo
- ✅ Mensagens com texto, imagem e áudio
- ✅ Respostas a mensagens (reply)
- ✅ Reações com emojis
- ✅ Status de mensagem (sending → sent → delivered → read)
- ✅ Indicador de digitação
- ✅ Presence (online/offline)
- ✅ Mute e archive de conversas
- ✅ Gerenciamento de grupos (adicionar/remover participantes, promover admin)

### WebSocket Gateway (Mensagens)

**Namespace**: `/ws/messages`

**Eventos Server → Client:**

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `message.new` | `{ id, conversationId, senderId, content, ... }` | Nova mensagem |
| `message.delivered` | `{ messageId, deliveredTo, deliveredAt }` | Mensagem entregue |
| `message.read` | `{ messageId, readBy, readAt }` | Mensagem lida |
| `message.deleted` | `{ messageId, deletedAt }` | Mensagem excluída |
| `message.reaction` | `{ messageId, userId, emoji, added }` | Reação alterada |
| `typing.update` | `{ conversationId, userId, isTyping }` | Status de digitação |
| `presence.update` | `{ userId, isOnline, lastSeenAt }` | Online/offline |
| `conversation.update` | `{ conversationId, ... }` | Conversa atualizada |

**Eventos Client → Server:**

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `join` | `{ conversationId }` | Entrar na sala da conversa |
| `leave` | `{ conversationId }` | Sair da sala |
| `typing.start` | `{ conversationId }` | Começou a digitar |
| `typing.stop` | `{ conversationId }` | Parou de digitar |
| `mark.read` | `{ conversationId, messageId }` | Marcar como lido |

---

## 4. Integrações com Outros Módulos

### Events → Notifications

Triggers implementados em `events.service.ts`:

| Trigger | Tipo | Quando |
|---------|------|--------|
| `NEW_EVENT` | Batch | Evento publicado → todos usuários da associação |
| `EVENT_CANCELLED` | Batch | Evento cancelado → usuários confirmados |
| `BADGE_EARNED` | Individual | Check-in com badge concedido |

```typescript
// Exemplo: Novo evento publicado
this.sendNewEventNotification(eventId, title, bannerUrl, startDate, associationId);
```

### Points → Notifications

Triggers implementados em `points.service.ts`:

| Trigger | Tipo | Quando |
|---------|------|--------|
| `TRANSFER_RECEIVED` | Individual | Usuário recebe transferência |
| `POINTS_RECEIVED` | Individual | Admin concede pontos |

```typescript
// Exemplo: Transferência recebida
this.sendTransferNotification(toUserId, amount, senderName, message);
```

---

## 5. Tipos de Notificação

### Por Categoria

| Categoria | Tipos |
|-----------|-------|
| **SOCIAL** | NEW_LIKE, NEW_COMMENT, COMMENT_REPLY, MENTION, NEW_FOLLOWER, STORY_VIEW, POLL_ENDED |
| **EVENTS** | NEW_EVENT, EVENT_REMINDER_1DAY, EVENT_REMINDER_1HOUR, EVENT_STARTED, CHECKIN_REMINDER, BADGE_EARNED, EVENT_CANCELLED, EVENT_UPDATED, CHECKIN_PROGRESS |
| **POINTS** | POINTS_RECEIVED, POINTS_SPENT, RANKING_UP, TRANSFER_RECEIVED, STRAVA_SYNC |
| **RESERVATIONS** | RESERVATION_APPROVED, RESERVATION_REJECTED, RESERVATION_REMINDER, WAITLIST_AVAILABLE |
| **SYSTEM** | NEW_MESSAGE, NEW_BENEFIT, CARD_BLOCKED, CARD_UNBLOCKED, ADMIN_ANNOUNCEMENT |

---

## 6. Estrutura de Arquivos

### Módulo Notificações

```
apps/api/src/modules/notifications/
├── notifications.module.ts
├── notifications.controller.ts
├── notifications.service.ts
├── notifications.gateway.ts              # WebSocket
├── notification.types.ts
├── dto/
│   ├── notification-query.dto.ts
│   ├── update-settings.dto.ts
│   └── update-dnd.dto.ts
└── __tests__/
    ├── notifications.service.spec.ts     # 26 testes
    ├── notifications.controller.spec.ts  # 15 testes
    └── notifications.gateway.spec.ts     # 14 testes
```

### Módulo Mensagens

```
apps/api/src/modules/messages/
├── messages.module.ts
├── conversations.controller.ts
├── messages.controller.ts
├── groups.controller.ts
├── messages.service.ts
├── messages.gateway.ts                   # WebSocket
├── message.types.ts
├── dto/
│   ├── create-conversation.dto.ts
│   ├── send-message.dto.ts
│   ├── conversation-query.dto.ts
│   ├── update-conversation-settings.dto.ts
│   ├── update-group.dto.ts
│   └── add-reaction.dto.ts
└── __tests__/
    ├── messages.service.spec.ts          # 26 testes
    └── messages.gateway.spec.ts          # 17 testes
```

---

## 7. Métricas de Testes

### Testes por Arquivo

| Arquivo | Testes | Cobertura |
|---------|--------|-----------|
| notifications.service.spec.ts | 26 | ~97% |
| notifications.controller.spec.ts | 15 | 100% |
| notifications.gateway.spec.ts | 14 | 100% |
| messages.service.spec.ts | 26 | ~97% |
| messages.gateway.spec.ts | 17 | 100% |
| **Total Fase 4** | **98** | **97%+** |

### Cenários Cobertos

**Notificações:**
- CRUD de notificações
- Batch notifications
- Agrupamento por groupKey
- Configurações por categoria
- Do Not Disturb (horários e dias)
- WebSocket events
- Auto-cleanup de notificações antigas

**Mensagens:**
- Criar conversas 1:1 e grupos
- Enviar e excluir mensagens
- Reações com emojis
- Status de mensagem
- Typing indicators
- Presence (online/offline)
- Gerenciamento de grupos

---

## 8. Dependências entre Módulos

```
Notifications Module
├── Importa: PrismaModule
├── Exporta: NotificationsService, NotificationsGateway
└── Usado por: EventsModule, PointsModule

Messages Module
├── Importa: PrismaModule, NotificationsModule
├── Usa: NotificationsService (futuro)
└── Exporta: MessagesService, MessagesGateway

Events Module
├── Importa: NotificationsModule
└── Usa: NotificationsService, NotificationsGateway

Points Module
├── Importa: NotificationsModule
└── Usa: NotificationsService, NotificationsGateway
```

---

## 9. Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| Limite de notificações | Máximo 500 por usuário, auto-cleanup das mais antigas |
| Batching | Notificações similares agrupadas por `groupKey` |
| DND | Push silenciado, mas lista in-app atualiza normalmente |
| Mensagens | Retenção permanente (sem expiração) |
| Grupos | Qualquer usuário pode criar |
| Media | Apenas TEXT, IMAGE, AUDIO |
| Status flow | SENDING → SENT → DELIVERED → READ |
| Typing timeout | Auto-stop após 5 segundos |

---

## 10. Swagger/Docs

Todos os endpoints possuem decorators Swagger:
- `@ApiTags` - Agrupamento por módulo
- `@ApiOperation` - Descrição da operação
- `@ApiResponse` - Status codes documentados
- `@ApiParam` - Parâmetros de rota
- `@ApiBearerAuth` - Autenticação JWT

---

## 11. Próximos Passos (Fase 5)

1. **PDV (Ponto de Venda)**
   - Sistema de vendas presenciais
   - Pagamento com pontos ou PIX
   - Integração com Stripe

2. **Loja Online**
   - Catálogo de produtos
   - Carrinho de compras
   - Checkout com pontos/PIX/misto

---

## 12. Comandos de Verificação

```bash
# Rodar testes da Fase 4
pnpm test apps/api/src/modules/notifications
pnpm test apps/api/src/modules/messages

# Testes com cobertura
pnpm test:coverage

# Verificar TypeScript
pnpm typecheck

# Iniciar servidor de desenvolvimento
pnpm dev:api

# Testar WebSocket Notifications
# Conectar em ws://localhost:3000/ws/notifications

# Testar WebSocket Messages
# Conectar em ws://localhost:3000/ws/messages
```
