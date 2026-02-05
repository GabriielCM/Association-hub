---
module: implementation
document: phase-07-status
status: complete
priority: mvp
last_updated: 2026-02-05
---

# Phase 7 - Unificação (Pedidos + Suporte + Rankings)

## Status Geral

| Componente | Status | Progresso |
|------------|--------|-----------|
| Pedidos | ✅ Completo | 100% |
| Suporte | ✅ Completo | 100% |
| Rankings | ✅ Completo | 100% (Fase 1) |

---

## 1. Pedidos (Orders)

**Status:** ✅ Implementado na Fase 5

O módulo de Pedidos já foi implementado na Fase 5 junto com PDV e Loja.

### Funcionalidades

- [x] CRUD de pedidos
- [x] Histórico unificado (Loja + PDV)
- [x] Timeline de status (PENDING → CONFIRMED → READY → COMPLETED)
- [x] QR Code de retirada
- [x] Sistema de vouchers
- [x] Comprovante digital
- [x] Cancelamento e estorno
- [x] Painel administrativo

### Arquivos

```
apps/api/src/modules/orders/
├── controllers/
│   ├── orders.controller.ts
│   └── orders-admin.controller.ts
├── dto/
│   ├── cancel-order.dto.ts
│   ├── orders-query.dto.ts
│   ├── update-status.dto.ts
│   └── validate-pickup.dto.ts
├── orders.module.ts
├── orders.service.ts
├── vouchers.service.ts
└── __tests__/
    ├── orders.service.spec.ts
    └── vouchers.service.spec.ts
```

---

## 2. Suporte (Support)

**Status:** ✅ Completo

### Funcionalidades Implementadas

- [x] **FAQ System**
  - CRUD de perguntas/respostas
  - Busca e filtro por categoria
  - Ordenação customizável
  - Suporte a Markdown nas respostas

- [x] **Tickets**
  - Criação manual (Bug, Sugestão, Dúvida)
  - Criação automática (crash reports)
  - Status flow: OPEN → IN_PROGRESS → RESOLVED → CLOSED
  - Mensagens entre usuário e suporte
  - Anexos (até 5 por mensagem, max 10MB)
  - Rating (1-5 estrelas + comentário)
  - Rate limiting para tickets automáticos

- [x] **Chat ao Vivo**
  - Sistema de fila com posição
  - Conexão em tempo real
  - Transferência entre atendentes
  - Indicador de "digitando"
  - Rating após encerramento

- [x] **Painel Administrativo**
  - Dashboard de tickets
  - Filtros por status, categoria, automático
  - Gerenciamento de FAQ
  - Fila de chat
  - Atendimentos ativos

- [x] **WebSocket Gateway**
  - Eventos de ticket atualizado
  - Eventos de nova mensagem
  - Eventos de chat conectado/encerrado
  - Atualização de posição na fila

### Modelos de Dados

```prisma
// Tickets
model Ticket
model TicketMessage
model TicketAttachment
model TicketMessageAttachment
model TicketRating

// FAQ
model FAQItem

// Chat
model ChatSession
model ChatMessage
model ChatMessageAttachment
model ChatRating

// Upload temporário
model SupportUpload
```

### Arquivos Criados

```
apps/api/src/modules/support/
├── controllers/
│   ├── faq.controller.ts
│   ├── tickets.controller.ts
│   ├── chat.controller.ts
│   ├── attachments.controller.ts
│   ├── admin-tickets.controller.ts
│   ├── admin-faq.controller.ts
│   └── admin-chat.controller.ts
├── dto/
│   ├── create-ticket.dto.ts
│   ├── tickets-query.dto.ts
│   ├── faq.dto.ts
│   ├── chat.dto.ts
│   └── index.ts
├── support.module.ts
├── faq.service.ts
├── tickets.service.ts
├── chat.service.ts
├── attachments.service.ts
├── support.gateway.ts
└── __tests__/
    ├── faq.service.spec.ts
    ├── tickets.service.spec.ts
    └── chat.service.spec.ts
```

### Endpoints

#### Usuário

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/support/faq` | Listar FAQs ativos |
| GET | `/support/tickets` | Listar tickets do usuário |
| POST | `/support/tickets` | Criar ticket |
| POST | `/support/tickets/automatic` | Criar ticket automático |
| GET | `/support/tickets/:id` | Detalhes do ticket |
| POST | `/support/tickets/:id/messages` | Enviar mensagem |
| POST | `/support/tickets/:id/resolve` | Marcar como resolvido |
| POST | `/support/tickets/:id/rating` | Avaliar atendimento |
| POST | `/support/chat/connect` | Iniciar chat (entrar na fila) |
| GET | `/support/chat/status` | Status do chat |
| GET | `/support/chat/messages` | Mensagens do chat |
| POST | `/support/chat/messages` | Enviar mensagem no chat |
| POST | `/support/chat/disconnect` | Encerrar chat |
| POST | `/support/chat/rating` | Avaliar chat |
| POST | `/support/attachments` | Upload de anexo |

#### Admin

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/support/tickets` | Listar todos os tickets |
| GET | `/admin/support/tickets/:id` | Detalhes do ticket |
| PATCH | `/admin/support/tickets/:id` | Atualizar status |
| POST | `/admin/support/tickets/:id/messages` | Responder ticket |
| GET | `/admin/support/faq` | Listar todas FAQs |
| POST | `/admin/support/faq` | Criar FAQ |
| PATCH | `/admin/support/faq/:id` | Atualizar FAQ |
| DELETE | `/admin/support/faq/:id` | Excluir FAQ |
| PATCH | `/admin/support/faq/reorder` | Reordenar FAQs |
| GET | `/admin/support/chat/queue` | Fila de espera |
| GET | `/admin/support/chat/active` | Chats ativos |
| POST | `/admin/support/chat/accept/:sessionId` | Aceitar chat |
| POST | `/admin/support/chat/:sessionId/messages` | Enviar mensagem |
| POST | `/admin/support/chat/:sessionId/end` | Encerrar chat |
| POST | `/admin/support/chat/:sessionId/transfer` | Transferir chat |

### Testes

- **Total:** 54 testes
- **Cobertura:** ~95%
- **Arquivos:**
  - `faq.service.spec.ts` - 12 testes
  - `tickets.service.spec.ts` - 20 testes
  - `chat.service.spec.ts` - 22 testes

---

## 3. Rankings

**Status:** ✅ Implementado na Fase 1

O módulo de Rankings já foi implementado na Fase 1 junto com Sistema de Pontos.

### Funcionalidades

- [x] Rankings por categoria (Posts, Eventos, Strava)
- [x] Períodos (Mensal, All-time)
- [x] Sistema de badges
- [x] Histórico de conquistas
- [x] Atualização em tempo real

---

## Dependências

- **Fase 5 (Loja + PDV)** - Para histórico de pedidos
- **Fase 4 (Notificações)** - Para alertas de tickets e chat
- **Fase 0 (WebSocket)** - Para chat em tempo real

---

## Próximos Passos

A Fase 7 está completa. Próxima fase:

- **Fase 8 - Dashboard** (Agregador Final)
  - Dashboard do usuário
  - Dashboard administrativo
  - Relatórios e métricas

---

## Relacionados

- [Roadmap](../00-overview/roadmap.md)
- [Orders Spec](../11-pedidos/spec.md)
- [Support Spec](../14-suporte/spec.md)
- [Rankings Spec](../13-rankings/spec.md)
