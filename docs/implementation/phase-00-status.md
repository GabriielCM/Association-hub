---
module: implementation
document: phase-00-status
status: complete
priority: mvp
last_updated: 2026-02-02
---

# Fase 0 - Infraestrutura Base

[← Voltar ao Índice](README.md)

---

## Status: ✅ Completa

**Data de Conclusão:** 2026-02-02

---

## Componentes Implementados

### 1. Autenticação JWT

| Item | Status | Arquivo |
|------|--------|---------|
| Login com email/senha | ✅ | `auth.controller.ts` |
| Refresh Token | ✅ | `auth.service.ts` |
| Sessão 30 dias | ✅ | Configurado via JWT |
| Guards (JWT + Roles) | ✅ | `common/guards/` |
| Decorators (@CurrentUser, @Roles) | ✅ | `common/decorators/` |

**Arquivos:**
- `apps/api/src/modules/auth/`
- `apps/api/src/common/guards/`
- `apps/api/src/common/decorators/`

### 2. Base de Dados

| Item | Status | Detalhes |
|------|--------|----------|
| PostgreSQL | ✅ | Docker Compose |
| Prisma ORM | ✅ | Schema completo |
| PrismaService | ✅ | Injeção de dependência |
| Migrations | ✅ | Via `pnpm db:migrate` |

**Arquivos:**
- `packages/database/prisma/schema.prisma`
- `apps/api/src/common/prisma/`

### 3. API REST Base

| Item | Status | Detalhes |
|------|--------|----------|
| NestJS Setup | ✅ | Configurado |
| Swagger/OpenAPI | ✅ | `/api/docs` |
| Validação DTO | ✅ | class-validator |
| Padrão de resposta | ✅ | `{ success, data }` |

### 4. Ambiente de Desenvolvimento

| Item | Status | Detalhes |
|------|--------|----------|
| Docker Compose | ✅ | PostgreSQL + Redis |
| Vitest | ✅ | Configurado |
| ESLint + Prettier | ✅ | Configurado |
| Turbo | ✅ | Monorepo tasks |

---

## Estrutura de Diretórios

```
apps/api/src/
├── app.module.ts
├── main.ts
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── index.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── index.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── types/
│       └── index.ts
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   └── strategies/
│   └── users/
│       ├── users.controller.ts
│       ├── users.module.ts
│       └── users.service.ts
└── test/
    ├── fixtures/
    └── mocks/
```

---

## Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://ahub:ahub_dev@localhost:5432/ahub_dev

# JWT
JWT_SECRET=<generated-secret>
JWT_EXPIRATION=30d

# Server
PORT=3000
NODE_ENV=development
```

---

## Comandos Disponíveis

```bash
# Desenvolvimento
pnpm dev:api          # Iniciar API

# Database
pnpm db:migrate       # Rodar migrations
pnpm db:generate      # Gerar Prisma Client
pnpm db:studio        # Abrir Prisma Studio

# Testes
pnpm test             # Testes unitários
pnpm test:coverage    # Com cobertura
```

---

## Próxima Fase

→ [Fase 1 - Core (Pontos + Assinaturas)](phase-01-status.md)
