---
module: implementation
document: phase-03-status
status: completed
priority: mvp
last_updated: 2026-02-04
---

# Fase 3 - Eventos (Engajamento)

## Status Geral

| Componente | Status | Progresso |
|------------|--------|-----------|
| Schema Prisma | ✅ Completo | 100% |
| Events Module | ✅ Completo | 100% |
| Display Module | ✅ Completo | 100% |
| WebSocket Gateway | ✅ Completo | 100% |
| Scheduler | ✅ Completo | 100% |
| Testes Unitários | ✅ Completo | 97.34% |

---

## 1. Alterações no Schema Prisma

### Novos Modelos

| Modelo | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `Event` | Evento da associação | title, category, startDate, endDate, pointsTotal, checkinsCount, qrSecret |
| `EventConfirmation` | RSVP de presença | eventId, userId, confirmedAt |
| `EventCheckIn` | Check-in realizado | eventId, userId, checkinNumber, pointsAwarded, badgeAwarded |
| `EventComment` | Comentários no evento | eventId, userId, text |

### Novos Enums

| Enum | Valores |
|------|---------|
| `EventStatus` | DRAFT, SCHEDULED, ONGOING, ENDED, CANCELED |
| `EventCategory` | SOCIAL, SPORTS, CULTURAL, EDUCATIONAL, NETWORKING, GASTRO, MUSIC, ART, GAMES, INSTITUTIONAL |
| `BadgeCriteria` | FIRST_CHECKIN, ALL_CHECKINS, AT_LEAST_ONE |

### Campos do Event

```prisma
model Event {
  id              String        @id @default(cuid())
  associationId   String        @map("association_id")
  title           String
  description     String
  category        EventCategory
  color           String        @default("#6366F1")
  startDate       DateTime      @map("start_date")
  endDate         DateTime      @map("end_date")
  locationName    String        @map("location_name")
  locationAddress String?       @map("location_address")
  bannerFeed      String?       @map("banner_feed")
  bannerDisplay   String[]      @default([]) @map("banner_display")
  pointsTotal     Int           @map("points_total")
  checkinsCount   Int           @map("checkins_count")
  checkinInterval Int           @default(30) @map("checkin_interval")
  badgeId         String?       @map("badge_id")
  badgeCriteria   BadgeCriteria @default(AT_LEAST_ONE) @map("badge_criteria")
  status          EventStatus   @default(DRAFT)
  isPaused        Boolean       @default(false) @map("is_paused")
  cancelReason    String?       @map("cancel_reason")
  capacity        Int?
  externalLink    String?       @map("external_link")
  qrSecret        String        @map("qr_secret")
  createdBy       String        @map("created_by")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
  publishedAt     DateTime?     @map("published_at")
}
```

---

## 2. Events Module - Endpoints de Usuário

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/events` | Listar eventos (filtros: filter, category, search) |
| GET | `/events/:id` | Detalhes do evento + progresso do usuário |
| POST | `/events/:id/confirm` | Confirmar presença (RSVP) |
| DELETE | `/events/:id/confirm` | Remover confirmação |
| POST | `/events/:id/checkin` | Realizar check-in via QR Code |
| GET | `/events/:id/comments` | Listar comentários |
| POST | `/events/:id/comments` | Criar comentário |

### Filtros de Listagem

| Filtro | Descrição |
|--------|-----------|
| `all` | Todos os eventos visíveis |
| `upcoming` | Eventos futuros (SCHEDULED) |
| `ongoing` | Eventos em andamento (ONGOING) |
| `past` | Eventos encerrados (ENDED) |
| `confirmed` | Eventos confirmados pelo usuário |

---

## 3. Events Module - Endpoints Admin

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/events` | Listar todos os eventos |
| POST | `/admin/events` | Criar evento (DRAFT) |
| PUT | `/admin/events/:id` | Atualizar evento |
| DELETE | `/admin/events/:id` | Deletar rascunho |
| POST | `/admin/events/:id/publish` | Publicar evento (DRAFT → SCHEDULED) |
| POST | `/admin/events/:id/cancel` | Cancelar evento |
| POST | `/admin/events/:id/pause` | Pausar/retomar check-ins |
| POST | `/admin/events/:id/checkin/manual` | Check-in manual |
| GET | `/admin/events/:id/analytics` | Métricas do evento |
| GET | `/admin/events/:id/participants` | Lista de participantes |
| GET | `/admin/events/:id/export/csv` | Exportar participantes (CSV) |
| GET | `/admin/events/:id/export/pdf` | Relatório para impressão (HTML) |

---

## 4. Display Module (Kiosks/TVs)

### Endpoints Públicos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/display/:eventId` | Página HTML fullscreen |
| GET | `/display/:eventId/data` | Dados JSON para o display |

### Funcionalidades

- ✅ Página fullscreen para TVs/Kiosks
- ✅ QR Code dinâmico (rotação a cada 60 segundos)
- ✅ Contador de check-ins em tempo real
- ✅ Indicador de check-in atual (número/total)
- ✅ Pontos por check-in
- ✅ Status do evento (Ao Vivo, Pausado, Encerrado)
- ✅ Logo da associação
- ✅ Cor personalizada do evento
- ✅ WebSocket para atualizações em tempo real
- ✅ Fallback de polling (30 segundos)

---

## 5. Sistema de QR Code Dinâmico

### Estrutura do QR Code

```typescript
interface EventQrCode {
  type: 'event_checkin';
  event_id: string;
  checkin_number: number;
  security_token: string;  // HMAC-SHA256
  timestamp: number;
  expires_at: number;      // timestamp + 120
}
```

### Segurança

- **Algoritmo**: HMAC-SHA256
- **Rotação**: A cada 60 segundos
- **Janela de validade**: 2 minutos
- **Secret**: Único por evento (gerado na criação)

### Geração do Token

```typescript
function generateSecurityToken(eventId: string, checkinNumber: number, timestamp: number, secret: string) {
  const data = `${eventId}:${checkinNumber}:${timestamp}`;
  return createHmac('sha256', secret).update(data).digest('hex');
}
```

---

## 6. Sistema de Check-in

### Validações

1. ✅ Evento existe e está `ONGOING`
2. ✅ Check-ins não estão pausados (`isPaused === false`)
3. ✅ Token HMAC-SHA256 válido
4. ✅ Timestamp dentro da janela de 2 minutos
5. ✅ Usuário não fez este check-in ainda
6. ✅ Intervalo respeitado desde último check-in
7. ✅ Check-in number corresponde ao atual

### Cálculo de Pontos

```typescript
// Pontos base
const basePoints = Math.floor(event.pointsTotal / event.checkinsCount);

// Com multiplicador de assinatura
const benefits = await subscriptionsService.getBenefits(userId);
const multiplier = benefits?.mutators?.points_events || 1;
const finalPoints = Math.floor(basePoints * multiplier);
```

### Critérios de Badge

| Critério | Descrição |
|----------|-----------|
| `FIRST_CHECKIN` | Badge concedido no primeiro check-in |
| `ALL_CHECKINS` | Badge concedido ao completar todos os check-ins |
| `AT_LEAST_ONE` | Badge concedido com pelo menos um check-in |

---

## 7. WebSocket Gateway

### Namespace

`/ws/events`

### Eventos Server → Client

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `qr_update` | `{ event_id, qr_data, expires_at }` | Novo QR Code (cada 60s) |
| `counter_update` | `{ event_id, total, unique_users }` | Contador atualizado |
| `status_change` | `{ event_id, status, is_paused }` | Status mudou |

### Eventos Client → Server

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `subscribe` | `{ event_id }` | Inscrever em evento |
| `unsubscribe` | `{ event_id }` | Desinscrever |

---

## 8. Scheduler (Cron Jobs)

### Rotação de QR Codes

```typescript
@Cron(CronExpression.EVERY_MINUTE)
async rotateQrCodes() {
  const ongoingEvents = await this.getOngoingEvents();
  for (const event of ongoingEvents) {
    if (!event.isPaused) {
      const qrData = this.generateQrCode(event);
      this.eventsGateway.broadcastQrUpdate(event.id, qrData);
    }
  }
}
```

### Transições Automáticas

```typescript
@Cron(CronExpression.EVERY_MINUTE)
async checkEventTransitions() {
  // SCHEDULED → ONGOING quando startDate chegar
  // ONGOING → ENDED quando endDate passar
}
```

---

## 9. Analytics

### Métricas Disponíveis

| Métrica | Descrição |
|---------|-----------|
| `confirmations` | Total de confirmações (RSVP) |
| `totalCheckIns` | Total de check-ins realizados |
| `uniqueUsers` | Usuários únicos com check-in |
| `presenceRate` | Taxa de presença (%) |
| `presenceRateConfirmed` | Taxa entre confirmados (%) |
| `pointsDistributed` | Pontos distribuídos |
| `badgesAwarded` | Badges concedidos |
| `checkInsByNumber` | Check-ins por número |
| `recentCheckIns` | Últimos 10 check-ins |

---

## 10. Exportação

### CSV

Colunas: Nome, Email, Confirmado, Data Confirmação, Check-ins, Pontos, Badge

### HTML (Print/PDF)

- Cabeçalho com informações do evento
- Métricas em cards coloridos
- Tabela de participantes
- Estilos otimizados para impressão

---

## 11. Estrutura de Arquivos

```
apps/api/src/modules/events/
├── events.module.ts
├── events.controller.ts           # Endpoints usuário
├── events.service.ts              # Lógica de negócios
├── admin-events.controller.ts     # Endpoints admin
├── display.controller.ts          # Display público
├── display.service.ts             # QR Code + rotação
├── events.gateway.ts              # WebSocket
├── events.scheduler.ts            # Cron jobs
├── dto/
│   ├── index.ts
│   ├── create-event.dto.ts
│   ├── update-event.dto.ts
│   ├── event-query.dto.ts
│   ├── checkin.dto.ts
│   ├── manual-checkin.dto.ts
│   └── comment.dto.ts
└── __tests__/
    ├── events.service.spec.ts
    ├── events.controller.spec.ts
    ├── admin-events.controller.spec.ts
    ├── display.service.spec.ts
    ├── display.controller.spec.ts
    ├── events.gateway.spec.ts
    └── events.scheduler.spec.ts
```

---

## 12. Métricas de Testes

### Testes por Arquivo

| Arquivo | Testes | Cobertura |
|---------|--------|-----------|
| events.service.spec.ts | 102 | 97.88% |
| display.service.spec.ts | 48 | 100% |
| admin-events.controller.spec.ts | 29 | 100% |
| events.gateway.spec.ts | 21 | 100% |
| display.controller.spec.ts | 20 | 100% |
| events.controller.spec.ts | 17 | 100% |
| events.scheduler.spec.ts | 13 | 100% |
| **Total Fase 3** | **250** | **97.34%** |

### Cenários Cobertos

- **CRUD**: Criar, editar, publicar, cancelar, deletar eventos
- **Check-in**: Token válido/expirado/inválido, duplicado, intervalo, badge
- **Filtros**: Upcoming, ongoing, past, confirmed, category, search
- **Permissões**: Association diferente, status inválido
- **QR Code**: Rotação, expiração, HMAC-SHA256
- **WebSocket**: Subscribe, unsubscribe, broadcast
- **Scheduler**: Rotação QR, transições de status, erros

---

## 13. Dependências entre Módulos

```
Events Module
├── Importa: PointsModule, SubscriptionsModule
├── Usa: PrismaService, PointsService, SubscriptionsService
└── Exporta: EventsService

Display Service
├── Usa: EventsService
└── Exporta: DisplayService

Events Gateway
└── Exporta: EventsGateway

Events Scheduler
├── Usa: EventsService, DisplayService, EventsGateway
└── Cron: Rotação QR (1min), Transições (1min)
```

---

## 14. Integração com Wallet

O QrScannerService do módulo Wallet foi preparado para processar QR Codes de check-in:

```typescript
// wallet/qr-scanner.service.ts
case 'event_checkin':
  return this.processEventCheckin(userId, qrData);
```

---

## 15. Próximos Passos (Fase 4)

1. **Comunicação** - Sistema de notificações push
2. **Mensagens Diretas** - Chat entre membros
3. **Notificações de Eventos** - Lembretes automáticos

---

## 16. Comandos de Verificação

```bash
# Rodar testes da Fase 3
pnpm test apps/api/src/modules/events

# Testes com cobertura
pnpm test apps/api/src/modules/events --coverage

# Verificar TypeScript
pnpm typecheck

# Iniciar servidor de desenvolvimento
pnpm dev:api

# Testar endpoint de display
# http://localhost:3000/display/{eventId}
```
