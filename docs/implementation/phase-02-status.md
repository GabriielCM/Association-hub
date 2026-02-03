---
module: implementation
document: phase-02-status
status: completed
priority: mvp
last_updated: 2026-02-03
---

# Fase 2 - Identidade (Perfil + Carteirinha + Minha Carteira)

## Status Geral

| Componente | Status | Progresso |
|------------|--------|-----------|
| Schema Prisma | ✅ Completo | 100% |
| Profile Module | ✅ Completo | 100% |
| Card Module | ✅ Completo | 100% |
| Wallet Module | ✅ Completo | 100% |
| Testes Unitários | ✅ Completo | 100% |

---

## 1. Alterações no Schema Prisma

### Novos Campos

**User:**
- `username` - Username único (@username)
- `bio` - Bio do perfil (max 150 chars)
- Relação com `MemberCard` e `CardUsageLog`

**Association:**
- `phone`, `email`, `website`, `address` - Contatos para verso da carteirinha
- Relação com `Partner` e `PartnerCategory`

### Novos Modelos

| Modelo | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `MemberCard` | Carteirinha digital | cardNumber, status, qrCodeHash, qrCodeData |
| `PartnerCategory` | Categorias de parceiros | name, slug, icon, color |
| `Partner` | Parceiros/convênios | name, benefit, address, contact, eligibility |
| `CardUsageLog` | Histórico de uso | type, location, scannedAt |

### Novos Enums

- `CardStatus`: ACTIVE, INACTIVE, SUSPENDED
- `AudienceType`: ALL, SUBSCRIBERS, NON_SUBSCRIBERS, SPECIFIC_PLANS
- `CardUsageType`: CHECKIN, BENEFIT_USED, EVENT_VALIDATION, QR_SCANNED

---

## 2. Profile Module

### Endpoints Implementados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/user/:id/profile` | Obter perfil de usuário |
| GET | `/user/:id/badges` | Obter badges do usuário |
| GET | `/user/:id/rankings` | Obter posições em rankings |
| PUT | `/user/profile` | Atualizar perfil próprio |
| POST | `/user/avatar` | Upload de foto de perfil |
| PUT | `/user/badges/display` | Selecionar 3 badges para exibir |
| GET | `/user/username/check` | Verificar disponibilidade de username |

### Arquivos Criados

```
apps/api/src/modules/profile/
├── profile.module.ts
├── profile.controller.ts
├── profile.service.ts
├── dto/
│   ├── index.ts
│   ├── update-profile.dto.ts
│   └── update-badges.dto.ts
└── __tests__/
    ├── profile.controller.spec.ts
    └── profile.service.spec.ts
```

### Funcionalidades

- ✅ Visualização de perfil próprio e de outros
- ✅ Indicador "isMe" para perfil próprio
- ✅ Verificado dourado baseado em assinatura ativa
- ✅ Exibição de até 3 badges em destaque
- ✅ Estatísticas de pontos (balance, lifetime)
- ✅ Posições em rankings
- ✅ Edição de perfil (nome, username, bio, phone)
- ✅ Upload de avatar (preparado para S3)
- ✅ Verificação de disponibilidade de username

---

## 3. Card Module (Carteirinha)

### Endpoints de Usuário

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/user/card` | Obter dados da carteirinha |
| GET | `/user/card/status` | Obter status da carteirinha |
| GET | `/user/card/qrcode` | Obter QR Code |
| GET | `/user/card/history` | Histórico de uso |

### Endpoints de Benefícios

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/benefits` | Listar parceiros |
| GET | `/benefits/:id` | Detalhes do parceiro |
| GET | `/benefits/categories` | Listar categorias |
| POST | `/benefits/nearby` | Parceiros próximos |

### Endpoints Admin

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/cards` | Listar carteirinhas |
| PUT | `/admin/cards/:id/status` | Alterar status |
| POST | `/admin/partners` | Criar parceiro |
| PUT | `/admin/partners/:id` | Atualizar parceiro |
| DELETE | `/admin/partners/:id` | Desativar parceiro |
| POST | `/admin/partners/categories` | Criar categoria |
| PUT | `/admin/partners/categories/:id` | Atualizar categoria |

### Arquivos Criados

```
apps/api/src/modules/card/
├── card.module.ts
├── card.controller.ts
├── card.service.ts
├── partners.controller.ts
├── partners.service.ts
├── dto/
│   ├── index.ts
│   ├── card-history-query.dto.ts
│   ├── benefits-query.dto.ts
│   ├── admin-card.dto.ts
│   ├── create-partner.dto.ts
│   └── create-category.dto.ts
└── __tests__/
    ├── card.controller.spec.ts
    ├── card.service.spec.ts
    ├── partners.controller.spec.ts
    └── partners.service.spec.ts
```

### Funcionalidades

- ✅ Auto-criação de carteirinha para novos usuários
- ✅ Geração de número de carteirinha sequencial (ASSOC-YYYY-NNNNN)
- ✅ QR Code com HMAC-SHA256 para validação
- ✅ Validação de QR Code (hash + status)
- ✅ Status da carteirinha (ativo/inativo/suspenso)
- ✅ Log de uso da carteirinha
- ✅ Sistema de parceiros/convênios
- ✅ Categorias de parceiros
- ✅ Filtro de elegibilidade (ALL, SUBSCRIBERS, etc)
- ✅ Busca de parceiros por nome
- ✅ Ordenação (A-Z, recentes)
- ✅ Parceiros próximos (geolocalização)
- ✅ Indicador "NOVO" para parceiros recentes (< 7 dias)
- ✅ Horário de funcionamento com "isOpenNow"

---

## 4. Wallet Module (Minha Carteira)

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/wallet` | Dashboard completo |
| GET | `/wallet/summary` | Resumo por período |
| POST | `/wallet/scan` | Processar QR escaneado |
| GET | `/wallet/pdv/checkout/:code` | Detalhes de checkout (Fase 5) |
| POST | `/wallet/pdv/pay` | Pagamento PDV (Fase 5) |

### Arquivos Criados

```
apps/api/src/modules/wallet/
├── wallet.module.ts
├── wallet.controller.ts
├── wallet.service.ts
├── qr-scanner.service.ts
├── dto/
│   ├── index.ts
│   ├── scan-qr.dto.ts
│   ├── pdv-payment.dto.ts
│   └── wallet-query.dto.ts
└── __tests__/
    ├── wallet.controller.spec.ts
    ├── wallet.service.spec.ts
    └── qr-scanner.service.spec.ts
```

### Funcionalidades

- ✅ Dashboard agregado (saldo, QR, resumo, strava, recentes)
- ✅ Resumo de ganhos/gastos por período (hoje, semana, mês, ano)
- ✅ Status da conexão Strava (km usado/restante hoje)
- ✅ Lista de destinatários recentes
- ✅ Scanner universal de QR Code
- ✅ Detecção automática de tipo de QR
- ✅ Processamento de QR de carteirinha (admin/display)
- ✅ Processamento de QR de transferência
- ⏳ Processamento de QR de check-in (Fase 3)
- ⏳ Processamento de QR de pagamento PDV (Fase 5)

### Scanner Universal - Tipos de QR

| Tipo | Código | Status |
|------|--------|--------|
| Carteirinha | `member_card` | ✅ Implementado |
| Transferência | `user_transfer` | ✅ Implementado |
| Check-in | `event_checkin` | ⏳ Fase 3 |
| Pagamento PDV | `pdv_payment` | ⏳ Fase 5 |

---

## 5. Métricas de Testes

### Testes Criados

| Arquivo | Testes | Cobertura |
|---------|--------|-----------|
| profile.service.spec.ts | 21 testes | ~95% |
| profile.controller.spec.ts | 7 testes | 100% |
| card.service.spec.ts | 25 testes | ~90% |
| card.controller.spec.ts | 12 testes | 100% |
| partners.service.spec.ts | 27 testes | ~90% |
| partners.controller.spec.ts | 19 testes | 100% |
| wallet.service.spec.ts | 15 testes | ~85% |
| wallet.controller.spec.ts | 15 testes | 100% |
| qr-scanner.service.spec.ts | 17 testes | ~85% |
| **Total Fase 2** | **158 testes** | **>85%** |

### Edge Cases Cobertos

- **Profile**: Usuário sem pontos, sem badges, verificação baseada em plano
- **Card**: Auto-criação, QR para card suspenso, usuário inativo, JSON malformado
- **Partners**: Elegibilidade SUBSCRIBERS, SPECIFIC_PLANS, ordenação por nome/recente
- **Wallet**: Cálculo semanal, recipients vazios, kmRemaining capped, períodos de resumo
- **QR Scanner**: QR vazio, sem type, log de uso, saldo do remetente

---

## 6. Estrutura Final

```
apps/api/src/modules/
├── auth/           # Fase 0
├── users/          # Fase 0
├── points/         # Fase 1
├── rankings/       # Fase 1
├── subscriptions/  # Fase 1
├── profile/        # Fase 2 ✅
├── card/           # Fase 2 ✅
└── wallet/         # Fase 2 ✅
```

---

## 7. Dependências entre Módulos

```
Profile Module
├── Usa: PrismaService, RankingsService
└── Exporta: ProfileService

Card Module
├── Usa: PrismaService
└── Exporta: CardService, PartnersService

Wallet Module
├── Importa: CardModule, PointsModule
├── Usa: PrismaService, PointsService, CardService
└── Exporta: WalletService, QrScannerService
```

---

## 8. Próximos Passos (Fase 3)

1. **Eventos** - Sistema de eventos com check-in QR dinâmico
2. **Display para Kiosks/TVs** - Telas de eventos
3. **Sistema de Badges** - Conquistas automáticas

---

## 9. Comandos de Verificação

```bash
# Rodar testes da Fase 2
pnpm test apps/api/src/modules/profile
pnpm test apps/api/src/modules/card
pnpm test apps/api/src/modules/wallet

# Verificar TypeScript
pnpm typecheck

# Iniciar servidor de desenvolvimento
pnpm dev:api

# Acessar Swagger
# http://localhost:3000/api/docs
```
