---
module: implementation
document: phase-01-status
status: complete
priority: mvp
last_updated: 2026-02-03
---

# Fase 1 - Core (Pontos + Rankings + Assinaturas)

[← Voltar ao Índice](README.md)

---

## Status: ✅ Completa

**Data de Conclusão:** 2026-02-03

---

## Resumo

| Módulo | Service | Controller | Testes | Cobertura |
|--------|---------|------------|--------|-----------|
| Points | ✅ 13 métodos | ✅ 12 endpoints | 62 | 98.58% |
| Rankings | ✅ 3 métodos | ✅ 3 endpoints | 26 | 96.46% |
| Subscriptions | ✅ 16 métodos | ✅ 15 endpoints | 72 | 98.25% |
| **Total** | **32 métodos** | **30 endpoints** | **160** | **>95%** |

---

## 1. Sistema de Pontos (06-sistema-pontos)

### 1.1 Endpoints Implementados

#### User Endpoints (`/api/points`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/balance` | Obter saldo atual do usuário |
| GET | `/history` | Histórico de transações paginado |
| GET | `/summary` | Resumo do período (ganhos/gastos) |
| POST | `/transfer` | Transferir pontos para outro usuário |
| GET | `/transfer/recipients` | Destinatários recentes |
| GET | `/transfer/search` | Buscar usuários para transferência |

#### Admin Endpoints (`/api/admin/points`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/credit` | Creditar pontos manualmente |
| POST | `/debit` | Debitar pontos manualmente |
| POST | `/transactions/:id/refund` | Estornar transação |
| GET | `/config` | Obter configuração de pontos |
| PUT | `/config` | Atualizar configuração |
| GET | `/report` | Relatório consolidado |

### 1.2 Modelos de Dados

```prisma
model UserPoints {
  userId          String   @id
  balance         Int      @default(0)
  lifetimeEarned  Int      @default(0)
  lifetimeSpent   Int      @default(0)
  lastEarnedAt    DateTime?
  lastSpentAt     DateTime?
  user            User     @relation(...)
}

model PointTransaction {
  id          String   @id @default(cuid())
  userId      String
  amount      Int
  balance     Int
  source      PointSource
  description String?
  metadata    Json?
  createdAt   DateTime @default(now())
}
```

### 1.3 Sources de Transação (13 tipos)

| Source | Descrição | Direção |
|--------|-----------|---------|
| `EVENT_CHECKIN` | Check-in em evento | Crédito |
| `STRAVA_SYNC` | Sincronização Strava | Crédito |
| `PURCHASE_STORE` | Compra na loja | Débito |
| `PURCHASE_PDV` | Compra no PDV | Débito |
| `TRANSFER_SENT` | Transferência enviada | Débito |
| `TRANSFER_RECEIVED` | Transferência recebida | Crédito |
| `CASHBACK` | Cashback | Crédito |
| `ADMIN_CREDIT` | Crédito manual ADM | Crédito |
| `ADMIN_DEBIT` | Débito manual ADM | Débito |
| `REFUND` | Estorno | Crédito |
| `EXPIRED` | Pontos expirados | Débito |
| `SPACE_RENTAL` | Locação de espaço | Débito |
| `SUBSCRIPTION_BONUS` | Bônus de assinatura | Crédito |

### 1.4 Regras de Negócio

- ✅ Pontos **não expiram**
- ✅ Self-transfer bloqueado
- ✅ Validação de saldo antes de débito
- ✅ Transação já estornada não pode ser estornada novamente
- ✅ Histórico de destinatários recentes (máx 10)

---

## 2. Rankings (13-rankings)

### 2.1 Endpoints Implementados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/rankings/points` | Ranking por pontos |
| GET | `/api/rankings/events` | Ranking por participação em eventos |
| GET | `/api/rankings/strava` | Ranking por km no Strava |

### 2.2 Query Parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `period` | enum | `ALL_TIME` | Período do ranking |
| `limit` | number | 10 | Quantidade de posições |

### 2.3 Períodos Suportados

| Período | Descrição |
|---------|-----------|
| `ALL_TIME` | Desde o início |
| `MONTHLY` | Últimos 30 dias |
| `WEEKLY` | Últimos 7 dias |

### 2.4 Estrutura de Resposta

```typescript
interface RankingEntry {
  position: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  value: number;        // pontos, eventos ou km
  isCurrentUser: boolean;
}

interface RankingResponse {
  type: 'points' | 'events' | 'strava';
  period: RankingPeriod;
  entries: RankingEntry[];
  currentUserPosition?: number;
}
```

### 2.5 Regras de Negócio

- ✅ Usuário atual destacado na lista
- ✅ Posição do usuário mesmo fora do top
- ✅ Ordenação decrescente por valor
- ✅ Filtragem por associação

---

## 3. Assinaturas (17-assinaturas)

### 3.1 Endpoints Implementados

#### User Endpoints (`/api/subscriptions`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/plans` | Listar planos disponíveis |
| GET | `/plans/:id` | Detalhes de um plano |
| GET | `/my` | Minha assinatura atual |
| POST | `/subscribe` | Assinar um plano |
| POST | `/change` | Trocar de plano |
| POST | `/cancel` | Cancelar assinatura |
| GET | `/history` | Histórico de assinaturas |
| GET | `/benefits` | Benefícios ativos |

#### Admin Endpoints (`/api/admin/subscriptions`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/plans` | Listar todos os planos (incluindo inativos) |
| POST | `/plans` | Criar novo plano |
| PUT | `/plans/:id` | Atualizar plano |
| DELETE | `/plans/:id` | Desativar plano (soft delete) |
| GET | `/subscribers` | Listar assinantes |
| POST | `/users/:id/suspend` | Suspender assinatura |
| POST | `/users/:id/activate` | Reativar assinatura |
| GET | `/report` | Relatório consolidado |

### 3.2 Modelos de Dados

```prisma
model SubscriptionPlan {
  id              String   @id @default(cuid())
  associationId   String
  name            String
  description     String?
  priceMonthly    Int
  priceYearly     Int?
  benefits        String[]
  mutators        Json     // { points_events, points_strava, discount_store, cashback }
  isActive        Boolean  @default(true)
  subscribersCount Int     @default(0)
}

model UserSubscription {
  id          String   @id @default(cuid())
  userId      String   @unique
  planId      String
  status      SubscriptionStatus
  startDate   DateTime
  endDate     DateTime?
  cancelledAt DateTime?
  cancelReason String?
}
```

### 3.3 Status de Assinatura

| Status | Descrição |
|--------|-----------|
| `ACTIVE` | Assinatura ativa |
| `CANCELLED` | Cancelada pelo usuário |
| `SUSPENDED` | Suspensa por admin |
| `EXPIRED` | Expirada |

### 3.4 Mutadores (Multiplicadores)

| Mutador | Descrição | Exemplo |
|---------|-----------|---------|
| `points_events` | Multiplicador de pontos em eventos | 1.5x |
| `points_strava` | Multiplicador de pontos Strava | 2.0x |
| `discount_store` | Desconto na loja (%) | 10% |
| `cashback` | Cashback adicional (%) | 5% |

### 3.5 Regras de Negócio

- ✅ Máximo **3 planos** por associação
- ✅ Nome de plano único por associação
- ✅ Soft delete (desativação)
- ✅ Histórico de todas as alterações
- ✅ Proration em mudança de plano (futuro)

---

## 4. Testes Unitários

### 4.1 Arquivos de Teste

| Arquivo | Testes | Cobertura |
|---------|--------|-----------|
| `points.service.spec.ts` | 48 | 99.39% |
| `points.controller.spec.ts` | 14 | 100% |
| `rankings.service.spec.ts` | 20 | 99.24% |
| `rankings.controller.spec.ts` | 6 | 100% |
| `subscriptions.service.spec.ts` | 53 | 99.26% |
| `subscriptions.controller.spec.ts` | 19 | 100% |

### 4.2 Infraestrutura de Testes

```
apps/api/src/test/
├── fixtures/
│   ├── index.ts
│   ├── user.fixtures.ts       # mockUser, mockJwtPayload
│   ├── points.fixtures.ts     # mockUserPoints, mockTransaction
│   └── subscriptions.fixtures.ts # mockPlan, mockSubscription
└── mocks/
    ├── index.ts
    └── prisma.mock.ts         # createMockPrismaService()
```

### 4.3 Executando os Testes

```bash
# Testes unitários
pnpm test

# Com cobertura
pnpm test:coverage

# Watch mode
pnpm test:watch
```

---

## 5. Estrutura de Arquivos

```
apps/api/src/modules/
├── points/
│   ├── points.module.ts
│   ├── points.controller.ts      # User + Admin controllers
│   ├── points.service.ts         # 13 métodos
│   ├── points.service.spec.ts    # 48 testes
│   ├── points.controller.spec.ts # 14 testes
│   └── dto/
│       ├── index.ts
│       ├── credit-points.dto.ts
│       ├── history-query.dto.ts
│       ├── search-user.dto.ts
│       ├── summary-query.dto.ts
│       └── transfer.dto.ts
├── rankings/
│   ├── rankings.module.ts
│   ├── rankings.controller.ts
│   ├── rankings.service.ts       # 3 métodos
│   ├── rankings.service.spec.ts  # 20 testes
│   ├── rankings.controller.spec.ts # 6 testes
│   └── dto/
│       └── index.ts
└── subscriptions/
    ├── subscriptions.module.ts
    ├── subscriptions.controller.ts # User + Admin controllers
    ├── subscriptions.service.ts    # 16 métodos
    ├── subscriptions.service.spec.ts # 53 testes
    ├── subscriptions.controller.spec.ts # 19 testes
    └── dto/
        └── index.ts
```

---

## 6. Integrações Futuras

### 6.1 Sistema de Pontos

| Integração | Módulo | Tipo |
|------------|--------|------|
| Check-in em eventos | Eventos | Crédito automático |
| Sincronização Strava | Strava | Crédito automático |
| Compras na Loja | Loja | Débito |
| Compras no PDV | PDV | Débito |
| Locação de espaços | Reservas | Débito |

### 6.2 Assinaturas

| Integração | Módulo | Efeito |
|------------|--------|--------|
| Multiplicador de pontos | Pontos | `points_events`, `points_strava` |
| Desconto | Loja, PDV, Espaços | `discount_store` |
| Cashback | Loja, PDV | `cashback` |
| Badge verificado | Perfil | Visual |

---

## 7. Próxima Fase

→ **Fase 2 - Identidade** (Perfil + Carteirinha + Minha Carteira)

Módulos a implementar:
- [ ] Perfil do usuário (02-perfil)
- [ ] Carteirinha digital (03-carteirinha)
- [ ] Minha Carteira - Scanner QR (05-minha-carteira)

---

## Relacionados

- [Especificação Sistema de Pontos](../06-sistema-pontos/spec.md)
- [Especificação Rankings](../13-rankings/spec.md)
- [Especificação Assinaturas](../17-assinaturas/spec.md)
- [Roadmap de Implementação](../00-overview/roadmap.md)
