# Fase 1: Core (Pontos + Assinaturas)

**Complexidade:** Alta
**Duração estimada:** 2-3 semanas
**Dependências:** Fase 0

## Objetivo

Implementar o sistema de gamificação central:
- Saldo de pontos e histórico de transações
- Transferência de pontos entre usuários
- Planos de assinatura com verificação
- Badge verificado para assinantes

---

## Arquivos para Ler Antes de Implementar

### Documentação - Pontos
```
docs/06-sistema-pontos/spec.md
docs/06-sistema-pontos/api.md
docs/06-sistema-pontos/acceptance-criteria.md
```

### Documentação - Assinaturas
```
docs/17-assinaturas/spec.md
docs/17-assinaturas/api.md
docs/17-assinaturas/acceptance-criteria.md
```

### Backend (DTOs de referência)
```
apps/api/src/modules/points/dto/
apps/api/src/modules/points/points.controller.ts
apps/api/src/modules/subscriptions/dto/
apps/api/src/modules/subscriptions/subscriptions.controller.ts
```

---

## Arquivos para Criar

### Mobile - Sistema de Pontos

#### Screens
```
apps/mobile/src/features/points/screens/
├── PointsScreen.tsx               # Tela principal de pontos
├── PointsHistoryScreen.tsx        # Histórico de transações
└── TransferScreen.tsx             # Fluxo de transferência
```

#### Components
```
apps/mobile/src/features/points/components/
├── PointsCard.tsx                 # Card neumorphic com saldo
├── PointsChart.tsx                # Sparkline 7 dias
├── TransactionItem.tsx            # Item da lista de histórico
├── TransactionDetail.tsx          # Modal de detalhes
├── TransferForm.tsx               # Formulário de transferência
└── RecipientPicker.tsx            # Seletor de destinatário
```

#### Hooks
```
apps/mobile/src/features/points/hooks/
├── usePoints.ts                   # Query de saldo
├── usePointsHistory.ts            # Query de histórico com filtros
└── useTransfer.ts                 # Mutation de transferência
```

#### API
```
apps/mobile/src/features/points/api/
└── points.api.ts
```

---

### Mobile - Assinaturas

#### Screens
```
apps/mobile/src/features/subscriptions/screens/
├── PlansScreen.tsx                # Lista de planos disponíveis
├── MySubscriptionScreen.tsx       # Assinatura atual
└── PlanDetailScreen.tsx           # Detalhes do plano
```

#### Components
```
apps/mobile/src/features/subscriptions/components/
├── PlanCard.tsx                   # Card de plano
├── BenefitsList.tsx               # Lista de benefícios
├── VerifiedBadge.tsx              # Check dourado
└── SubscriptionStatus.tsx         # Status ativo/expirado
```

#### Hooks
```
apps/mobile/src/features/subscriptions/hooks/
├── usePlans.ts                    # Query de planos
├── useMySubscription.ts           # Query de assinatura do usuário
└── useSubscribe.ts                # Mutation de assinatura
```

#### API
```
apps/mobile/src/features/subscriptions/api/
└── subscriptions.api.ts
```

---

### Web Admin - Pontos

#### Components
```
apps/web/src/features/points/components/
├── PointsOverview.tsx             # Visão geral admin
├── UserPointsTable.tsx            # Tabela de pontos por usuário
├── GrantPointsForm.tsx            # Crédito manual
└── DeductPointsForm.tsx           # Débito manual
```

#### Pages
```
apps/web/src/features/points/pages/
├── PointsConfigPage.tsx           # Configuração do sistema
└── PointsReportsPage.tsx          # Relatórios e exportação
```

---

### Web Admin - Assinaturas

#### Components
```
apps/web/src/features/subscriptions/components/
├── PlansTable.tsx                 # Lista de planos
├── CreatePlanForm.tsx             # Criar/editar plano
└── SubscribersTable.tsx           # Lista de assinantes
```

#### Pages
```
apps/web/src/features/subscriptions/pages/
├── PlansManagementPage.tsx
└── SubscribersPage.tsx
```

---

## Endpoints da API

### Pontos - Usuário
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/points/balance` | Saldo atual |
| GET | `/points/history` | Histórico (paginado) |
| GET | `/points/summary` | Resumo por período |
| POST | `/points/transfer` | Transferir pontos |
| GET | `/points/transfer/recent` | Destinatários recentes |
| GET | `/points/transfer/search` | Buscar usuários |

### Pontos - Admin
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/points/config` | Configuração |
| PUT | `/admin/points/config` | Atualizar config |
| POST | `/admin/points/grant` | Creditar pontos |
| POST | `/admin/points/deduct` | Debitar pontos |
| POST | `/admin/points/refund/:id` | Estornar transação |
| GET | `/admin/points/reports` | Relatórios |

### Assinaturas - Usuário
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/subscriptions/plans` | Listar planos |
| GET | `/subscriptions/plans/:id` | Detalhes do plano |
| GET | `/subscriptions/my` | Minha assinatura |
| POST | `/subscriptions/subscribe` | Assinar plano |
| POST | `/subscriptions/change` | Trocar plano |
| POST | `/subscriptions/cancel` | Cancelar |
| GET | `/subscriptions/benefits` | Benefícios ativos |

### Assinaturas - Admin
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/subscriptions/plans` | Todos os planos |
| POST | `/admin/subscriptions/plans` | Criar plano |
| PUT | `/admin/subscriptions/plans/:id` | Atualizar plano |
| DELETE | `/admin/subscriptions/plans/:id` | Desativar plano |
| GET | `/admin/subscriptions/subscribers` | Listar assinantes |
| POST | `/admin/subscriptions/users/:id/suspend` | Suspender |
| POST | `/admin/subscriptions/users/:id/activate` | Reativar |

---

## Regras de Negócio

### Pontos
- Pontos **não expiram**
- Transferências requerem **biometria**
- Rate limit: **10 transações/min** por usuário
- Cache: Local + Memory (5min TTL)
- Offline: Último valor em cache + indicador

### Assinaturas
- Máximo **3 planos** disponíveis
- Máximo **1 assinatura** ativa por usuário
- Badge verificado: check dourado no perfil e posts
- Mutators aplicam em tempo real:
  - `points_events` (1.0 - 10.0x)
  - `points_strava` (1.0 - 10.0x)
  - `points_posts` (1.0 - 10.0x)
  - `discount_store` (0 - 100%)
  - `discount_pdv` (0 - 100%)
  - `discount_spaces` (0 - 100%)
  - `cashback` (substitui global se maior)

---

## Critérios de Verificação

- [ ] Visualizar saldo de pontos
- [ ] Ver histórico com filtros (período, tipo)
- [ ] Transferir pontos com biometria
- [ ] Ver destinatários recentes
- [ ] Buscar usuários para transferência
- [ ] Ver lista de planos disponíveis
- [ ] Ver detalhes de cada plano
- [ ] Assinar/trocar/cancelar plano
- [ ] Badge verificado aparecendo para assinantes
- [ ] Admin: creditar/debitar pontos manualmente
- [ ] Admin: criar/editar/desativar planos
- [ ] Admin: ver relatórios de pontos
