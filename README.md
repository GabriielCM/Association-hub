# A-hub

Aplicação mobile e web para associações com sistema de pontos, eventos, loja e comunicação.

## Stack

- **Mobile:** React Native + Expo + Tamagui
- **Web:** Next.js + shadcn/ui + Tailwind
- **Backend:** NestJS + Prisma + Socket.io
- **Database:** PostgreSQL + Redis
- **Cloud:** AWS (ECS, RDS, S3)

## Estrutura

```
a-hub/
├── apps/
│   ├── api/       # NestJS Backend
│   ├── web/       # Next.js (Admin + Display)
│   └── mobile/    # React Native + Expo
├── packages/
│   ├── database/  # Prisma schema
│   ├── shared/    # Types, utils, validation
│   └── ui/        # Shared components
└── docs/          # Technical specs
```

## Setup

### Pré-requisitos

- Node.js 20+
- pnpm 9+
- Docker

### Instalação

```bash
# Clone
git clone git@github.com:GabriielCM/A-hub.git
cd A-hub

# Instalar dependências
pnpm install

# Subir banco de dados
docker compose up -d

# Copiar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Rodar migrations
pnpm db:migrate

# Iniciar desenvolvimento
pnpm dev
```

## Comandos

```bash
# Desenvolvimento
pnpm dev              # Todos os apps
pnpm dev:api          # Apenas backend
pnpm dev:web          # Apenas web
pnpm dev:mobile       # Apenas mobile

# Database
pnpm db:migrate       # Migrations
pnpm db:studio        # Prisma Studio
pnpm db:generate      # Gerar client
pnpm db:reset         # Reset (dev)

# Testes
pnpm test             # Unit tests
pnpm test:coverage    # Com cobertura
pnpm test:e2e         # E2E

# Build
pnpm build            # Build all
pnpm lint             # Lint
pnpm typecheck        # TypeScript
```

## API Docs

Com o servidor rodando: http://localhost:3001/docs

## Documentação

Ver `docs/` para especificações técnicas completas.

## Licença

Proprietary - All rights reserved
