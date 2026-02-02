---
module: shared
document: claude-code-setup
status: complete
priority: mvp
last_updated: 2026-01-29
---

# Configuração do Claude Code para A-hub

[← Voltar ao Índice](README.md)

---

> **Versão:** 1.0
> **Última atualização:** 29/01/2026
> **Status:** Completo

---

## Visão Geral

Este documento especifica toda a configuração necessária do Claude Code para um agente implementar o projeto A-hub. Inclui MCPs (Model Context Protocol servers), plugins, hooks e skills customizados.

O A-hub é um projeto de grande escala com:

- **3 plataformas client:** Mobile (Expo), Web Admin (Next.js), Web Display (Next.js)
- **1 backend:** NestJS + Prisma + Socket.io
- **9 fases de implementação:** Conforme [roadmap.md](../00-overview/roadmap.md)
- **17 módulos:** Cada um com especificações completas

---

## Índice

1. [MCPs Necessários](#mcps-necessários)
2. [Plugins Habilitados](#plugins-habilitados)
3. [Hooks Customizados](#hooks-customizados)
4. [Skills/Commands](#skillscommands)
5. [Configurações do Projeto](#configurações-do-projeto)
6. [Ferramentas por Fase](#ferramentas-por-fase)
7. [Checklist de Instalação](#checklist-de-instalação)

---

## MCPs Necessários

### MCPs Existentes (Disponíveis Hoje)

Estes MCPs estão disponíveis e devem ser configurados:

| MCP | Propósito | Prioridade | Status |
|-----|-----------|------------|--------|
| **Context7** | Documentação de bibliotecas em tempo real | Alto | ✅ Habilitado |
| **GitHub MCP** | PRs, issues, branches, API GitHub | Alto | 📦 Disponível |
| **Filesystem MCP** | Leitura/escrita de arquivos | Crítico | 📦 Disponível |
| **PostgreSQL MCP** | Queries SQL, schema inspection | Crítico | 📦 Disponível |
| **Slack MCP** | Notificações de deploy/erros | Médio | 📦 Disponível |
| **Brave Search MCP** | Busca web para documentação | Médio | 📦 Disponível |

#### Configuração Context7

O Context7 já está habilitado no projeto. Uso recomendado:

```
# Buscar documentação de biblioteca
resolve-library-id: "nestjs" → "/nestjs/docs"
query-docs: "/nestjs/docs" + "guards and interceptors"
```

**Bibliotecas frequentes no projeto:**

- `/nestjs/docs` - Backend patterns
- `/prisma/docs` - ORM e migrations
- `/expo/expo` - Mobile SDK
- `/vercel/next.js` - Web framework
- `/tanstack/query` - Data fetching
- `/stripe/stripe-node` - Pagamentos

---

### MCPs Ideais/Hipotéticos

Estes MCPs não existem oficialmente mas seriam extremamente úteis. São substituídos por CLI tools ou SDKs.

#### Database & Cache (Fase 0)

| MCP Ideal | Propósito | Alternativa |
|-----------|-----------|-------------|
| **Redis MCP** | Cache, sessions, BullMQ | `redis-cli`, ioredis SDK |
| **Prisma MCP** | Migrations, Studio, type generation | `npx prisma` CLI |

**Comandos Redis alternativos:**

```bash
# Conectar ao Redis local
redis-cli -h localhost -p 6379

# Verificar keys
redis-cli KEYS "session:*"

# Flush cache de desenvolvimento
redis-cli FLUSHDB
```

**Comandos Prisma alternativos:**

```bash
# Gerar client após mudanças no schema
npx prisma generate

# Criar migration
npx prisma migrate dev --name nome_da_migration

# Abrir Prisma Studio
npx prisma studio

# Reset do banco (dev only)
npx prisma migrate reset
```

---

#### Cloud/Infraestrutura (Fase 0)

| MCP Ideal | Propósito | Alternativa |
|-----------|-----------|-------------|
| **AWS SDK MCP** | RDS, ECS, S3, CloudFront | `aws` CLI, AWS SDK |
| **Terraform MCP** | IaC, state management | `terraform` CLI |

**Comandos AWS alternativos:**

```bash
# Verificar identidade
aws sts get-caller-identity

# Listar buckets S3
aws s3 ls

# Deploy para ECS
aws ecs update-service --cluster ahub --service api --force-new-deployment

# Verificar logs CloudWatch
aws logs tail /ecs/ahub-api --follow
```

**Comandos Terraform alternativos:**

```bash
# Inicializar
terraform init

# Planejar mudanças
terraform plan -out=tfplan

# Aplicar
terraform apply tfplan

# Verificar estado
terraform state list
```

---

#### Frameworks (Fase 0-2)

| MCP Ideal | Propósito | Alternativa |
|-----------|-----------|-------------|
| **NestJS MCP** | Scaffolding, patterns | `nest` CLI |
| **Expo MCP** | EAS builds, OTA updates | `expo` / `eas` CLI |
| **Next.js MCP** | App Router patterns | Context7 + docs |

**Comandos NestJS alternativos:**

```bash
# Gerar módulo completo
nest g resource nome-modulo

# Gerar apenas controller
nest g controller nome

# Gerar apenas service
nest g service nome

# Gerar guard
nest g guard auth
```

**Comandos Expo/EAS alternativos:**

```bash
# Iniciar dev server
npx expo start

# Build de desenvolvimento
eas build --profile development --platform all

# Build de produção
eas build --profile production --platform all

# Submeter para stores
eas submit --platform all

# OTA update
eas update --branch production --message "hotfix v1.0.1"
```

---

#### Pagamentos & Integrações (Fase 1-5)

| MCP Ideal | Propósito | Alternativa |
|-----------|-----------|-------------|
| **Stripe MCP** | Payments, webhooks | Stripe CLI, SDK |
| **Strava MCP** | OAuth, activities | HTTP requests, SDK |
| **Firebase MCP** | Analytics, Crashlytics | Firebase CLI |

**Comandos Stripe alternativos:**

```bash
# Login
stripe login

# Escutar webhooks localmente
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Disparar evento de teste
stripe trigger payment_intent.succeeded

# Listar produtos
stripe products list
```

**Comandos Firebase alternativos:**

```bash
# Login
firebase login

# Verificar projeto
firebase projects:list

# Deploy de configurações
firebase deploy --only remoteconfig
```

---

#### Real-time (Fase 3)

| MCP Ideal | Propósito | Alternativa |
|-----------|-----------|-------------|
| **Socket.io MCP** | WebSocket patterns | Context7 + docs |

Para Socket.io, usar Context7:

```
query-docs: "/socketio/socket.io" + "rooms and namespaces nestjs"
```

---

## Plugins Habilitados

### Configuração Atual (.claude/settings.json)

```json
{
  "enabledPlugins": {
    "frontend-design@claude-plugins-official": true,
    "code-review@claude-plugins-official": true,
    "context7@claude-plugins-official": true
  }
}
```

### Plugins Ativos

| Plugin | Uso no Projeto |
|--------|----------------|
| **frontend-design** | Tamagui (mobile), shadcn/ui (web), Tailwind CSS |
| **code-review** | Review de PRs, qualidade de código |
| **context7** | Referência de documentação de bibliotecas |

### Plugins Recomendados Adicionais

Estes plugins seriam úteis se disponíveis:

| Plugin | Uso | Fase |
|--------|-----|------|
| **testing-plugin** | Vitest, Testing Library, Playwright | 0 |
| **accessibility-plugin** | WCAG 2.1 AA compliance | 0 |
| **devops-plugin** | Docker, Terraform, AWS | 0 |
| **security-plugin** | Auth, encryption, rate limiting | 0 |

---

## Hooks Customizados

Os hooks do Claude Code executam comandos em resposta a eventos. Configurar conforme o projeto evolui.

### Pre-Commit Hooks

Executam antes de cada commit git:

| Hook | Descrição | Comando |
|------|-----------|---------|
| **typecheck** | Verifica TypeScript strict mode | `pnpm typecheck` |
| **lint** | ESLint + Prettier | `pnpm lint` |
| **test** | Testes unitários | `pnpm test` |
| **coverage** | Cobertura mínima 80% | `pnpm test:coverage --threshold 80` |

### Post-Edit Hooks

Executam após edição de arquivos:

| Hook | Descrição | Trigger |
|------|-----------|---------|
| **changelog-reminder** | Lembra de atualizar CHANGELOG | Edição em `docs/**/*.md` |
| **version-sync** | Sincroniza versão docs/package.json | Edição em `package.json` |

### Pre-Push Hooks

Executam antes de push para remote:

| Hook | Descrição | Comando |
|------|-----------|---------|
| **e2e-tests** | Testes E2E com Playwright | `pnpm test:e2e` |
| **build-check** | Verifica build completo | `pnpm build` |

### Exemplo de Configuração (.claude/hooks.json)

```json
{
  "hooks": {
    "pre-commit": [
      {
        "name": "typecheck",
        "command": "pnpm typecheck",
        "failOnError": true
      },
      {
        "name": "lint",
        "command": "pnpm lint --fix",
        "failOnError": true
      },
      {
        "name": "test",
        "command": "pnpm test --run",
        "failOnError": true
      }
    ],
    "post-edit": [
      {
        "name": "changelog-reminder",
        "pattern": "docs/**/*.md",
        "message": "Lembre-se de atualizar o CHANGELOG.md"
      }
    ],
    "pre-push": [
      {
        "name": "e2e-tests",
        "command": "pnpm test:e2e",
        "failOnError": true
      }
    ]
  }
}
```

---

## Skills/Commands

Skills são comandos customizados invocados com `/nome-do-skill`.

### Skills Existentes

| Skill | Descrição | Arquivo |
|-------|-----------|---------|
| `/gap-review` | Executa análise de gaps na documentação | `.claude/commands/gap-review.md` |

### Skills Recomendados (Implementação Futura)

Criar conforme necessidade durante o desenvolvimento:

| Skill | Descrição | Fase | Prioridade |
|-------|-----------|------|------------|
| `/module-create` | Scaffold completo de módulo NestJS | 0 | Alta |
| `/component-create` | Gera componente Tamagui/shadcn | 2 | Alta |
| `/api-endpoint` | Cria endpoint com boilerplate | 0 | Alta |
| `/migration-create` | Gera migration Prisma | 1 | Média |
| `/test-generate` | Gera testes para arquivo | 0 | Média |
| `/deploy-check` | Verifica pré-deploy | 0 | Média |

### Especificação: `/module-create`

**Propósito:** Criar módulo NestJS com estrutura completa e padrões do projeto.

**Uso:**

```
/module-create pontos
```

**Estrutura Gerada:**

```
apps/api/src/pontos/
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

**Inclui automaticamente:**

- Swagger decorators (@ApiTags, @ApiOperation, @ApiResponse)
- Zod validation schemas
- Guard placeholders (@UseGuards(JwtAuthGuard))
- Error handling (NotFoundException, BadRequestException)
- Unit test stubs com mocks

### Especificação: `/component-create`

**Propósito:** Criar componente UI seguindo design system.

**Uso:**

```
/component-create Button --platform mobile
/component-create DataTable --platform web
```

**Para Mobile (Tamagui):**

```
packages/ui/src/Button/
├── Button.tsx
├── Button.styles.ts
├── Button.test.tsx
└── index.ts
```

**Para Web (shadcn/ui):**

```
apps/web/src/components/ui/
├── data-table.tsx
└── data-table.test.tsx
```

### Especificação: `/api-endpoint`

**Propósito:** Criar endpoint REST com boilerplate completo.

**Uso:**

```
/api-endpoint POST /eventos/:id/checkin
```

**Gera:**

- Controller method com decorators
- DTO de request/response
- Service method stub
- Teste unitário
- Entrada no Swagger

### Especificação: `/test-generate`

**Propósito:** Gerar testes para arquivo existente.

**Uso:**

```
/test-generate apps/api/src/pontos/pontos.service.ts
```

**Gera:**

- Arquivo `pontos.service.spec.ts`
- Mocks para dependências injetadas
- Casos de teste baseados nos métodos públicos
- Setup/teardown adequado

### Especificação: `/deploy-check`

**Propósito:** Verificar prontidão para deploy.

**Uso:**

```
/deploy-check staging
/deploy-check production
```

**Verifica:**

- [ ] Todos os testes passando
- [ ] Build sem erros
- [ ] Migrations sincronizadas
- [ ] Variáveis de ambiente configuradas
- [ ] Sem secrets expostos no código
- [ ] CHANGELOG atualizado
- [ ] Version bump realizado

---

## Configurações do Projeto

### Estrutura .claude/

```
.claude/
├── CLAUDE.md           # Instruções principais do projeto
├── settings.json       # Plugins habilitados
├── settings.local.json # Permissões locais (não commitado)
├── hooks.json          # Hooks customizados (criar quando necessário)
└── commands/
    └── gap-review.md   # Skill de gap review
```

### CLAUDE.md - Seção de Code Agent

Adicionar ao `.claude/CLAUDE.md` existente:

```markdown
## Configuração de Code Agent

Para implementar o projeto, o agente precisa dos seguintes recursos:

### MCPs Obrigatórios

Ver `docs/shared/claude-code-setup.md` para lista completa.

**Mínimo para Fase 0:**

- Context7 (documentação)
- GitHub MCP (PRs, issues)
- PostgreSQL MCP (queries)

### CLIs Necessárias

```bash
# Verificar instalação
node --version    # 20+
pnpm --version    # 8+
docker --version  # 24+
aws --version     # 2+
terraform --version # 1.5+
```

### Comandos Disponíveis

- `/gap-review` - Análise de documentação
- `/module-create` - Scaffold de módulo NestJS (futuro)
- `/component-create` - Scaffold de componente UI (futuro)
- `/api-endpoint` - Criar endpoint da API (futuro)
- `/test-generate` - Gerar testes (futuro)

### Padrões de Commit

- Usar `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`
- Commits semânticos (feat:, fix:, docs:, refactor:, test:)
- Mensagens em português
- Exemplo:

```
feat: implementa sistema de pontos

- Adiciona modelo de dados para transações
- Cria endpoints CRUD
- Implementa regras de negócio (máx 5km/dia Strava)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```
```

---

## Ferramentas por Fase

Mapeamento de MCPs e CLIs necessários em cada fase de implementação:

| Fase | MCPs Existentes | CLIs/SDKs Necessários |
|------|-----------------|----------------------|
| **0 - Infraestrutura** | Context7, GitHub MCP, PostgreSQL MCP | `aws`, `terraform`, `nest`, `prisma`, `docker` |
| **1 - Core** | Context7, PostgreSQL MCP | `prisma`, `redis-cli` |
| **2 - Identidade** | Context7 | `expo`, `eas` |
| **3 - Engajamento** | Context7, GitHub MCP | Socket.io SDK |
| **4 - Comunicação** | Context7 | `firebase`, Expo Push |
| **5 - Transações** | Context7 | `stripe` CLI/SDK |
| **6 - Locações** | (ferramentas anteriores) | - |
| **7 - Unificação** | (ferramentas anteriores) | - |
| **8 - Dashboard** | (ferramentas anteriores) | - |

### Detalhamento Fase 0

A Fase 0 (Infraestrutura) é a mais crítica. Requisitos:

**1. Monorepo Setup:**

```bash
# Inicializar Turborepo
npx create-turbo@latest

# Estrutura
apps/
  mobile/    # Expo
  web/       # Next.js
  api/       # NestJS
packages/
  ui/        # Tamagui components
  shared/    # Types, utils, Zod schemas
  config/    # ESLint, TypeScript
  database/  # Prisma
```

**2. Database Setup:**

```bash
# Docker Compose para dev
docker compose up -d postgres redis

# Prisma init
cd packages/database
npx prisma init
```

**3. AWS Setup:**

```bash
# Configurar profile
aws configure --profile ahub

# Terraform init
cd infrastructure/terraform
terraform init
terraform workspace new dev
```

---

## Checklist de Instalação

### Pré-requisitos do Sistema

- [ ] Node.js 20+ instalado (`node --version`)
- [ ] pnpm 8+ instalado (`pnpm --version`)
- [ ] Docker Desktop instalado e rodando
- [ ] Git configurado com SSH key
- [ ] Claude Code CLI instalado

### Contas e Acessos

- [ ] Conta AWS com permissões adequadas
- [ ] Conta Vercel vinculada ao repositório
- [ ] Conta Expo/EAS configurada
- [ ] Conta Stripe (dev) com API keys
- [ ] Conta Strava API (dev) registrada

### MCPs Configurados

- [ ] Context7 habilitado em `.claude/settings.json`
- [ ] GitHub MCP configurado (opcional)
- [ ] PostgreSQL MCP configurado (opcional)

### Plugins Habilitados

- [ ] `frontend-design@claude-plugins-official`
- [ ] `code-review@claude-plugins-official`
- [ ] `context7@claude-plugins-official`

### Ambiente Local

- [ ] Repositório clonado
- [ ] `pnpm install` executado na raiz
- [ ] Docker Compose up (`docker compose up -d`)
- [ ] Arquivo `.env` configurado (copiar de `.env.example`)
- [ ] Prisma migrations aplicadas (`pnpm db:migrate`)

### Verificação Final

```bash
# Deve passar sem erros
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

---

## Relacionados

- [Stack Tecnológica](technology-stack.md) - Tecnologias escolhidas
- [Roadmap](../00-overview/roadmap.md) - Fases de implementação
- [Convenções](conventions.md) - Padrões de documentação
