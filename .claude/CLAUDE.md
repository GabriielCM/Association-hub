# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sobre o Projeto

O A-hub é uma **aplicação mobile e web** para associações, com sistema de pontos, eventos, loja e comunicação entre membros.

**Versão:** 0.1.0 (início do desenvolvimento)
**Repositório:** GabriielCM/A-hub

### Plataformas

| Plataforma | Tecnologia | Usuários |
|------------|------------|----------|
| **App Mobile** | React Native + Expo | Membros da associação |
| **Web Admin** | Next.js | Administradores |
| **Web Display** | Next.js | TVs/Kiosks em eventos |

---

## Stack Tecnológica

### Frontend Mobile
- **Framework:** React Native + Expo (Managed Workflow)
- **UI:** Tamagui
- **State:** Zustand + TanStack Query
- **Storage:** MMKV
- **Navigation:** React Navigation

### Frontend Web
- **Framework:** Next.js (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **State:** Zustand + TanStack Query
- **Forms:** React Hook Form + Zod

### Backend
- **Framework:** NestJS
- **ORM:** Prisma
- **Auth:** Passport.js + JWT
- **WebSocket:** Socket.io
- **Jobs:** BullMQ

### Database & Cache
- **Database:** PostgreSQL
- **Cache:** Redis
- **Search:** PostgreSQL Full-Text

### Cloud (AWS)
- **Compute:** ECS/Fargate
- **Database:** RDS (PostgreSQL)
- **Cache:** ElastiCache (Redis)
- **Storage:** S3 + CloudFront
- **Frontend:** Vercel

---

## Estrutura do Monorepo

```
a-hub/
├── apps/
│   ├── mobile/              # React Native + Expo
│   │   ├── app/             # Expo Router screens
│   │   ├── components/
│   │   └── package.json
│   │
│   ├── web/                 # Next.js (Admin + Display)
│   │   ├── app/
│   │   │   ├── (admin)/     # Rotas admin
│   │   │   └── display/     # Rotas display
│   │   └── package.json
│   │
│   └── api/                 # NestJS Backend
│       ├── src/
│       │   ├── modules/     # Feature modules
│       │   └── main.ts
│       └── package.json
│
├── packages/
│   ├── ui/                  # Componentes compartilhados (Tamagui)
│   ├── shared/              # Types, utils, Zod schemas
│   ├── config/              # ESLint, TypeScript, Tailwind
│   └── database/            # Prisma schema e client
│
├── infrastructure/
│   └── terraform/           # IaC para AWS
│
├── docs/                    # Especificações técnicas
├── docker-compose.yml       # Dev environment
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## Ambiente Local

### Pré-requisitos

```bash
node --version    # 20+
pnpm --version    # 8+
docker --version  # 24+
```

### Setup Inicial

```bash
# Clonar e instalar dependências
git clone git@github.com:GabriielCM/A-hub.git
cd A-hub
pnpm install

# Subir banco de dados e Redis
docker compose up -d

# Copiar variáveis de ambiente
cp .env.example .env

# Rodar migrations
pnpm db:migrate

# Iniciar desenvolvimento
pnpm dev
```

### Docker Compose (dev)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ahub
      POSTGRES_PASSWORD: ahub_dev
      POSTGRES_DB: ahub_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## Comandos de Desenvolvimento

### Desenvolvimento

```bash
pnpm dev              # Todos os apps em paralelo
pnpm dev:mobile       # Apenas mobile (Expo)
pnpm dev:web          # Apenas web (Next.js)
pnpm dev:api          # Apenas backend (NestJS)
```

### Database

```bash
pnpm db:migrate       # Rodar migrations
pnpm db:studio        # Abrir Prisma Studio
pnpm db:generate      # Gerar Prisma Client
pnpm db:reset         # Reset do banco (dev only)
```

### Testes

```bash
pnpm test             # Testes unitários
pnpm test:watch       # Modo watch
pnpm test:coverage    # Com cobertura
pnpm test:e2e         # Testes E2E (Playwright)
```

### Build & Lint

```bash
pnpm build            # Build de produção
pnpm lint             # ESLint
pnpm typecheck        # TypeScript check
pnpm format           # Prettier
```

---

## Roadmap de Implementação

O roadmap completo está em `docs/00-overview/roadmap.md`.

**Ordem de implementação (9 fases):**

1. **Fase 0:** Infraestrutura (Auth, Design System, API, WebSocket)
2. **Fase 1:** Core (Sistema de Pontos + Assinaturas)
3. **Fase 2:** Identidade (Perfil + Carteirinha + Minha Carteira)
4. **Fase 3:** Engajamento (Eventos)
5. **Fase 4:** Comunicação (Notificações + Mensagens) - paralelo
6. **Fase 5:** Transações (PDV + Loja) - paralelo
7. **Fase 6:** Locações (Espaços + Reservas) - paralelo
8. **Fase 7:** Unificação (Pedidos + Suporte + Rankings)
9. **Fase 8:** Agregador (Dashboard)

**Exclusão:** Módulo 15-jukebox NÃO será implementado nesta versão.

---

## Padrões de Código

### TypeScript

- **Strict mode** habilitado
- Sem `any` (usar `unknown` se necessário)
- Types em `packages/shared/src/types/`
- Schemas Zod em `packages/shared/src/validation/`

### Estrutura de Módulo NestJS

```
src/modules/pontos/
├── pontos.module.ts
├── pontos.controller.ts
├── pontos.service.ts
├── dto/
│   ├── create-pontos.dto.ts
│   └── update-pontos.dto.ts
├── entities/
│   └── pontos.entity.ts
└── __tests__/
    ├── pontos.controller.spec.ts
    └── pontos.service.spec.ts
```

### Testes

- **Cobertura mínima:** 80%
- **Unit tests:** Vitest + Testing Library
- **E2E tests:** Playwright
- **Mocking:** MSW (Mock Service Worker)

### Linting

- ESLint + Prettier
- Husky + lint-staged para pre-commit
- TypeScript strict

---

## Workflow de Desenvolvimento

### Git Flow (Trunk-based)

```bash
# Criar branch de feature
git checkout -b feat/sistema-pontos

# Trabalhar, commitar
git add .
git commit -m "feat: implementa cálculo de pontos"

# Push e PR
git push -u origin feat/sistema-pontos
# Criar PR para main via GitHub
```

### Padrões de Commit

```text
feat: implementa sistema de pontos

- Adiciona modelo de dados para transações
- Cria endpoints CRUD
- Implementa regras de negócio

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

**Tipos:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

### Pull Requests

- Título descritivo
- Descrição com contexto
- Testes passando (CI)
- Review obrigatório

---

## Decisões de Negócio

| Área | Decisão |
|------|---------|
| Moeda | Association-points (nome customizável por associação) |
| Pagamento Loja | Pontos, PIX ou misto (configurável por produto) |
| Pagamento PDV | APENAS pontos OU PIX (nunca misto) |
| Limite planos | Máximo 3 assinaturas ativas por usuário |
| Descontos | Não acumulam com promoções (usa o maior) |
| Cashback | Percentual global configurável por associação |
| Strava | Máximo 5km/dia pontuáveis |
| Pontos | Não expiram |

---

## Dependências Críticas

**Sistema de Pontos é o CORE:**
- Praticamente todos os módulos de transação dependem dele
- Deve ser implementado primeiro (Fase 1)

**Dashboard é o AGREGADOR:**
- Integra todos os outros módulos
- Deve ser implementado por último (Fase 8)

**Assinaturas entra cedo:**
- Fornece multiplicadores que afetam Pontos, Loja, PDV e Espaços
- Implementar junto com Sistema de Pontos evita retrabalho

---

## Documentação de Referência

Toda especificação técnica está em `docs/`:

| Diretório | Conteúdo |
|-----------|----------|
| `docs/00-overview/` | Roadmap, glossário, visão geral |
| `docs/01-dashboard/` a `docs/17-assinaturas/` | Specs de cada módulo |
| `docs/shared/` | Design system, auth, performance |
| `docs/api/` | Endpoints de referência |

### Arquivos Importantes

- `docs/shared/technology-stack.md` - Stack completa
- `docs/shared/design-system.md` - Cores, tipografia, componentes
- `docs/shared/authentication.md` - Fluxos de auth
- `docs/api/endpoints-reference.md` - Todos os endpoints

### Como Usar Durante Implementação

1. **Antes de implementar um módulo:** Ler `docs/XX-modulo/spec.md`
2. **Para endpoints:** Consultar `docs/XX-modulo/api.md`
3. **Para validar:** Usar `docs/XX-modulo/acceptance-criteria.md`
4. **Para UI:** Consultar `docs/shared/design-system.md`

---

## MCPs e Ferramentas

### MCPs Habilitados

- **Context7** - Documentação de bibliotecas em tempo real
- **Stripe MCP** - Integração com pagamentos (Fase 5)
- **Firebase MCP** - Analytics e Crashlytics
- **Playwright MCP** - Testes E2E automatizados

### CLIs Úteis

```bash
# NestJS
nest g resource nome-modulo    # Gerar módulo completo
nest g controller nome         # Gerar controller
nest g service nome            # Gerar service

# Prisma
npx prisma migrate dev         # Criar migration
npx prisma studio              # GUI do banco
npx prisma generate            # Gerar client

# Expo
npx expo start                 # Dev server
eas build --profile dev        # Build de dev

# Stripe (Fase 5)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Skills Disponíveis

- `/gap-review` - Análise de gaps na documentação

---

## Idioma

- **Código:** Inglês (variáveis, funções, comentários técnicos)
- **Commits:** Português
- **Documentação:** Português brasileiro
- **UI/UX:** Português brasileiro
