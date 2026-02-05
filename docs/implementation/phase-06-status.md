---
module: implementation
document: phase-06-status
status: completed
priority: mvp
last_updated: 2026-02-05
---

# Fase 6 - Locacoes (Espacos + Reservas)

## Status Geral

| Componente | Status | Progresso |
|------------|--------|-----------|
| Schema Prisma (Spaces) | Completo | 100% |
| Schema Prisma (Bookings) | Completo | 100% |
| Spaces Module | Completo | 100% |
| Bookings Module | Completo | 100% |
| Integracoes (Subscriptions, Notifications) | Completo | 100% |
| Scheduled Jobs | Completo | 100% |
| Testes Unitarios | Completo | 95%+ |

---

## 1. Alteracoes no Schema Prisma

### Modelos Spaces (Espacos)

| Modelo | Descricao | Campos Principais |
|--------|-----------|-------------------|
| `Space` | Espaco reservavel | name, description, capacity, images, fee, periodType, shifts, openingTime, closingTime, minAdvanceDays, maxAdvanceDays, bookingIntervalMonths, status |
| `SpaceBlock` | Bloqueio de data | spaceId, date, reason, createdById |

### Modelos Bookings (Reservas)

| Modelo | Descricao | Campos Principais |
|--------|-----------|-------------------|
| `Booking` | Reserva | spaceId, userId, date, periodType, shiftName, startTime, endTime, totalFee, discountApplied, finalFee, status, approvedById, rejectedById |
| `BookingWaitlist` | Lista de espera | spaceId, bookingId, userId, date, periodType, position, notifiedAt, expiresAt |

### Novos Enums

| Enum | Valores |
|------|---------|
| `SpaceStatus` | ACTIVE, MAINTENANCE, INACTIVE |
| `BookingPeriodType` | DAY, SHIFT, HOUR |
| `BookingStatus` | PENDING, APPROVED, REJECTED, CANCELLED, EXPIRED, COMPLETED |

---

## 2. Modulo Spaces

### Endpoints Usuario (JWT)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/espacos` | Listar espacos ativos |
| GET | `/espacos/:id` | Detalhes do espaco |
| GET | `/espacos/:id/disponibilidade` | Verificar disponibilidade (mes) |

### Endpoints Admin

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/admin/espacos` | Listar todos espacos |
| POST | `/admin/espacos` | Criar espaco |
| PUT | `/admin/espacos/:id` | Atualizar espaco |
| DELETE | `/admin/espacos/:id` | Remover espaco (soft delete) |
| PATCH | `/admin/espacos/:id/status` | Alterar status |
| GET | `/admin/espacos/:id/bloqueios` | Listar bloqueios |
| POST | `/admin/espacos/:id/bloqueios` | Criar bloqueio |
| POST | `/admin/espacos/:id/bloqueios/bulk` | Criar bloqueios em lote |
| DELETE | `/admin/espacos/bloqueios/:blockId` | Remover bloqueio |

### Funcionalidades

- Espacos com diferentes tipos de periodo (dia, turno, hora)
- Configuracao de turnos customizaveis (JSON)
- Controle de antecedencia minima e maxima para reservas
- Intervalo minimo entre reservas do mesmo usuario
- Bloqueio de espacos por data/motivo
- Status do espaco (ativo, manutencao, inativo)

---

## 3. Modulo Bookings

### Endpoints Usuario (JWT)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/reservas` | Criar reserva |
| GET | `/reservas/minhas` | Minhas reservas (com tabs) |
| GET | `/reservas/:id` | Detalhes da reserva |
| POST | `/reservas/:id/cancelar` | Cancelar reserva |
| POST | `/reservas/fila` | Entrar na lista de espera |
| GET | `/reservas/fila/posicao` | Ver posicao na fila |
| DELETE | `/reservas/fila/:id` | Sair da lista de espera |
| POST | `/reservas/fila/:id/confirmar` | Confirmar vaga (quando notificado) |

### Endpoints Admin

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/admin/reservas` | Listar reservas |
| GET | `/admin/reservas/pendentes` | Listar pendentes de aprovacao |
| GET | `/admin/reservas/:id` | Detalhes da reserva |
| POST | `/admin/reservas/:id/aprovar` | Aprovar reserva |
| POST | `/admin/reservas/:id/rejeitar` | Rejeitar reserva |
| POST | `/admin/reservas/:id/cancelar-admin` | Cancelar como admin |

### Funcionalidades

- Workflow de aprovacao (PENDING -> APPROVED/REJECTED)
- Desconto automatico para assinantes
- Lista de espera com posicao automatica
- Notificacao quando vaga disponivel
- Janela de confirmacao de 24h
- Promocao automatica da fila quando reserva cancelada

---

## 4. Scheduled Jobs

### Jobs Implementados

| Job | Frequencia | Descricao |
|-----|------------|-----------|
| `expirePendingBookings` | Diario (00:00) | Expira reservas PENDING cuja data ja passou |
| `completePassedBookings` | Diario (00:00) | Completa reservas APPROVED cuja data ja passou |
| `expireWaitlistEntries` | A cada 5 min | Expira entradas na fila que nao confirmaram em 24h |
| `processWaitlist` | A cada 5 min | Notifica proximo da fila quando vaga disponivel |

---

## 5. Integracoes

### SubscriptionsService

```typescript
// Desconto automatico na taxa de reserva
const subscription = await prisma.userSubscription.findUnique({
  where: { userId_associationId: { userId, associationId } },
  include: { plan: true },
});

const discount = subscription?.plan?.mutators?.discount_spaces || 0;
const finalFee = totalFee * (1 - discount / 100);
```

### NotificationsService

Triggers implementados:
- Reserva aprovada (RESERVATION_APPROVED)
- Reserva rejeitada (RESERVATION_REJECTED)
- Reserva cancelada pelo admin (RESERVATION_CANCELLED)
- Vaga disponivel na lista de espera (WAITLIST_AVAILABLE)

### SpacesService

- Verificacao de restricao de intervalo entre reservas
- Validacao de disponibilidade antes de criar reserva

---

## 6. Estrutura de Arquivos

### Modulo Spaces

```
apps/api/src/modules/spaces/
├── spaces.module.ts
├── spaces.service.ts
├── spaces.controller.ts
├── admin-spaces.controller.ts
├── dto/
│   └── index.ts
├── index.ts
└── __tests__/
    └── spaces.service.spec.ts
```

### Modulo Bookings

```
apps/api/src/modules/bookings/
├── bookings.module.ts
├── bookings.service.ts
├── bookings.controller.ts
├── admin-bookings.controller.ts
├── bookings.scheduler.ts
├── dto/
│   └── index.ts
├── index.ts
└── __tests__/
    └── bookings.service.spec.ts
```

---

## 7. Metricas de Testes

### Testes por Arquivo

| Arquivo | Testes | Cobertura |
|---------|--------|-----------|
| spaces.service.spec.ts | 22 | ~97% |
| bookings.service.spec.ts | 28 | ~97% |
| **Total Fase 6** | **50** | **97%+** |

### Cenarios Cobertos

**Spaces:**
- CRUD de espacos
- Alteracao de status
- Criacao/remocao de bloqueios
- Bloqueios em lote
- Consulta de disponibilidade
- Verificacao de intervalo entre reservas

**Bookings:**
- Criacao de reserva com validacoes
- Desconto de assinatura
- Cancelamento por usuario
- Aprovacao/rejeicao por admin
- Lista de espera completa
- Jobs de expiracao e conclusao

---

## 8. DTOs e Validacoes

### Spaces DTOs

| DTO | Campos | Validacoes |
|-----|--------|------------|
| `CreateSpaceDto` | name, description, capacity, fee, periodType, shifts, openingTime, closingTime, minAdvanceDays, maxAdvanceDays, bookingIntervalMonths, blockedSpaceIds | Zod schemas |
| `UpdateSpaceDto` | Todos opcionais | Partial de CreateSpace |
| `UpdateSpaceStatusDto` | status | Enum SpaceStatus |
| `CreateSpaceBlockDto` | date, reason | date: ISO string |
| `SpaceQueryDto` | status, page, limit | Paginacao |
| `SpaceAvailabilityQueryDto` | month, year | Mes 1-12, ano >= 2024 |

### Bookings DTOs

| DTO | Campos | Validacoes |
|-----|--------|------------|
| `CreateBookingDto` | spaceId, date, periodType, shiftName?, startTime?, endTime? | CUID, ISO date |
| `CancelBookingDto` | reason? | String opcional |
| `ApproveBookingDto` | notes? | String opcional |
| `RejectBookingDto` | reason | String obrigatorio |
| `JoinWaitlistDto` | spaceId, date, periodType, shiftName?, startTime? | Mesmos de booking |
| `BookingQueryDto` | spaceId?, status?, dateFrom?, dateTo?, page, limit | Filtros + paginacao |
| `MyBookingsQueryDto` | tab, page, limit | Tab: pending/approved/history |

---

## 9. Regras de Negocio

| Regra | Descricao |
|-------|-----------|
| Antecedencia Minima | Reserva deve ter pelo menos X dias de antecedencia |
| Antecedencia Maxima | Reserva nao pode ser feita com mais de X dias |
| Intervalo entre Reservas | Usuario pode ter que esperar X meses entre reservas do mesmo espaco |
| Espaco Bloqueado | Nao permite reserva em datas bloqueadas |
| Espaco Inativo | Nao permite reserva em espacos MAINTENANCE ou INACTIVE |
| Conflito | Apenas uma reserva ativa por espaco/data/periodo |
| Desconto | Assinantes recebem desconto configurado no plano |
| Lista de Espera | 24h para confirmar vaga quando notificado |
| Expiracao | Reservas PENDING expiram apos a data |
| Conclusao | Reservas APPROVED viram COMPLETED apos a data |

---

## 10. Dependencias entre Modulos

```
Spaces Module
├── Importa: PrismaModule
├── Exporta: SpacesService
└── Usado por: BookingsModule

Bookings Module
├── Importa: PrismaModule, SpacesModule, NotificationsModule, ScheduleModule
├── Usa: SpacesService.canUserBook para validar intervalo
├── Usa: NotificationsService.create para notificar
└── Exporta: BookingsService
```

---

## 11. Swagger/Docs

Todos os endpoints possuem decorators Swagger:
- `@ApiTags` - Agrupamento: "Espacos", "Espacos (Admin)", "Reservas", "Reservas (Admin)"
- `@ApiOperation` - Descricao da operacao
- `@ApiResponse` - Status codes: 200, 201, 400, 403, 404, 409
- `@ApiParam` - Parametros de rota
- `@ApiQuery` - Query parameters documentados
- `@ApiBearerAuth` - Autenticacao JWT

---

## 12. Comandos de Verificacao

```bash
# Rodar testes da Fase 6
pnpm test apps/api/src/modules/spaces
pnpm test apps/api/src/modules/bookings

# Ou direto na pasta api
cd apps/api && pnpm test run src/modules/spaces/__tests__ src/modules/bookings/__tests__

# Testes com cobertura
pnpm test:coverage

# Verificar TypeScript
pnpm typecheck

# Iniciar servidor de desenvolvimento
pnpm dev:api
```

---

## 13. Proximos Passos (Fase 7)

1. **Unificacao**
   - Pedidos consolidados (Orders enhancement)
   - Sistema de Suporte/Tickets

2. **Consideracoes**
   - Integrar reservas de espacos com sistema de pedidos
   - Adicionar pagamento via pontos/PIX para reservas
   - Dashboard de ocupacao de espacos
