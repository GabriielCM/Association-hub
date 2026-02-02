---
module: shared
document: technology-stack
status: complete
priority: mvp
last_updated: 2026-01-29
---

# Stack Tecnológica

[<- Voltar ao Índice](README.md)

---

> **Versao:** 1.0
> **Ultima atualizacao:** 29/01/2026
> **Status:** Definido

---

## Indice

- [Visao Geral](#visao-geral)
- [Stack Mobile](#stack-mobile)
- [Stack Web Admin](#stack-web-admin)
- [Stack Web Display](#stack-web-display)
- [Stack Backend](#stack-backend)
- [Stack Database e Cache](#stack-database-e-cache)
- [Stack Cloud e Infraestrutura](#stack-cloud-e-infraestrutura)
- [Stack Monitoramento](#stack-monitoramento)
- [Stack Testing](#stack-testing)
- [Estrutura do Monorepo](#estrutura-do-monorepo)
- [Diagrama de Arquitetura](#diagrama-de-arquitetura)

---

## Visao Geral

O A-hub e composto por tres interfaces distintas que compartilham codigo e infraestrutura:

| Interface | Plataforma | Usuarios | Tecnologia Principal |
|-----------|------------|----------|---------------------|
| **App Mobile** | iOS + Android | Common User, ADM | React Native + Expo |
| **Web Admin** | Browser (Desktop) | ADM | Next.js |
| **Web Display** | Browser (TV/Kiosk) | Display | Next.js (compartilhado) |

### Requisitos Tecnicos Criticos

- **Real-time:** WebSocket via Socket.io
- **Offline-first:** Funcoes criticas funcionam sem conexao
- **Push Notifications:** Expo Push + FCM/APNs
- **Camera/QR Code:** Scanning nativo via Expo
- **Biometria:** Face ID / Touch ID / PIN
- **Pagamentos:** Stripe (PIX)
- **Integracao externa:** Strava OAuth
- **Performance:** Dashboard < 3s, QR scan < 500ms

---

## Stack Mobile

**Framework:** React Native + Expo (Managed Workflow)

O app mobile sera publicado na **App Store** (iOS) e **Play Store** (Android).

| Categoria | Tecnologia | Justificativa |
|-----------|------------|---------------|
| Framework | **React Native** | Compartilha codigo com web React, grande ecossistema |
| Tooling | **Expo (Managed)** | OTA updates, builds na nuvem (EAS), simplifica config nativa |
| UI/Design System | **Tamagui** | Universal (web + native), alta performance, theming avancado |
| Navegacao | **React Navigation** | Padrao da comunidade, flexivel, bem documentado |
| State Management | **Zustand** | Leve, TypeScript nativo, persistencia facil com MMKV |
| Data Fetching | **TanStack Query** | Cache inteligente, offline support, revalidation |
| QR Scanner | **expo-camera + expo-barcode-scanner** | Integrado ao Expo, suporte oficial |
| Storage Local | **MMKV** | Ultra rapido, criptografia opcional, substitui AsyncStorage |
| Biometria | **expo-local-authentication** | Face ID, Touch ID, PIN - API unificada |
| Push Notifications | **Expo Push + FCM/APNs** | Abstracao simples, gratuito ate escala |
| Animacoes | **React Native Reanimated** | Animacoes na UI thread, alta performance |
| Celebracoes | **Lottie** | Animacoes ricas pre-feitas (confetti, success) |

### Bibliotecas Adicionais Mobile

| Biblioteca | Uso |
|------------|-----|
| `react-native-mmkv` | Storage local performatico |
| `lottie-react-native` | Animacoes Lottie |
| `react-native-gesture-handler` | Gestos nativos |
| `react-native-safe-area-context` | Safe areas iOS/Android |

---

## Stack Web Admin

**Framework:** Next.js (App Router)

Painel administrativo para gestao de eventos, usuarios, relatorios e configuracoes.

| Categoria | Tecnologia | Justificativa |
|-----------|------------|---------------|
| Framework | **Next.js** | SSR/SSG, App Router, otimizado para Vercel |
| UI Components | **shadcn/ui** | Componentes copiaveis, customizaveis, Radix primitives |
| Styling | **Tailwind CSS** | Utility-first, produtivo, padrao atual |
| Tabelas | **TanStack Table** | Headless, sorting/filtering/pagination |
| Graficos | **Recharts** | React-native, declarativo, bom para dashboards |
| Formularios | **React Hook Form + Zod** | Performance, validacao type-safe |
| Upload | **react-dropzone** | Drag & drop, preview, leve |
| Exportacao | **Backend (Sharp + PDFKit)** | Geracao de Excel/PDF no servidor |

### Funcionalidades Admin

- Dashboard com metricas em tempo real
- CRUD de eventos com preview
- Gestao de usuarios e permissoes
- Relatorios exportaveis (Excel, PDF)
- Moderacao de conteudo
- Configuracoes de associacao

---

## Stack Web Display

**Framework:** Next.js (compartilhado com Admin)

Interface fullscreen para TVs e kiosks em eventos.

| Categoria | Tecnologia | Justificativa |
|-----------|------------|---------------|
| Framework | **Next.js (rotas /display/*)** | Mesmo projeto do Admin, code sharing |
| Fullscreen | **Fullscreen API + CSS** | API nativa do browser, sem dependencias |
| QR Code | **qrcode.react** | React component, SVG/Canvas, customizavel |
| Reconexao WS | **Exponential backoff** | Evita flood no servidor em falhas |

### Funcionalidades Display

- QR Code dinamico (rotacao a cada 1 minuto)
- Contador de check-ins em tempo real
- Informacoes do evento
- Modo offline com cache
- URL de acesso: `/display/[EVENT_ID]`

---

## Stack Backend

**Framework:** NestJS (Node.js + TypeScript)

API REST centralizada servindo todas as interfaces.

| Categoria | Tecnologia | Justificativa |
|-----------|------------|---------------|
| Runtime | **Node.js + TypeScript** | Ecossistema unificado com frontend |
| Framework | **NestJS** | Arquitetura modular, DI, decorators, enterprise-ready |
| ORM | **Prisma** | Type-safe, migrations, studio GUI, DX excelente |
| API Style | **REST** | Padrao amplamente adotado, caching HTTP |
| API Docs | **OpenAPI/Swagger** | Auto-gerado pelo NestJS |
| Auth | **Passport.js + JWT** | Strategies modulares, refresh tokens |
| Auth Service | **Proprio** | Controle total, sem vendor lock-in |
| WebSocket | **Socket.io** | Rooms/namespaces, reconexao automatica |
| Validacao | **class-validator + class-transformer** | Decorators, integrado ao NestJS |
| Jobs | **BullMQ** | Filas robustas, retry, delay, dashboard |

### Modulos do Backend

```text
src/
├── auth/           # JWT, Passport, guards
├── users/          # Gestao de usuarios
├── events/         # Eventos e check-ins
├── points/         # Sistema de pontos
├── subscriptions/  # Assinaturas premium
├── notifications/  # Push notifications
├── messages/       # Chat
├── store/          # E-commerce
├── spaces/         # Espacos e reservas
├── display/        # WebSocket para displays
└── common/         # Shared (guards, pipes, interceptors)
```

---

## Stack Database e Cache

| Categoria | Tecnologia | Justificativa |
|-----------|------------|---------------|
| Database | **PostgreSQL** | Relacional robusto, JSON support, extensoes |
| Cache | **Redis** | In-memory, pub/sub, sessions, rate limiting |
| Job Queue | **BullMQ + Redis** | Jobs robustos, retry, delay, cron |
| Full-Text Search | **PostgreSQL Full-Text** | Built-in, suficiente para MVP |

### Servicos AWS

| Servico | Uso |
|---------|-----|
| **RDS (PostgreSQL)** | Database principal |
| **ElastiCache (Redis)** | Cache e filas |

### Estrategia de Cache

| Dado | TTL | Estrategia |
|------|-----|------------|
| Sessoes JWT | 30 dias | Redis |
| Feed posts | 5 min | TanStack Query |
| Saldo pontos | 5 min | Redis + Client |
| Catalogo produtos | 10 min | Redis |

---

## Stack Cloud e Infraestrutura

| Categoria | Tecnologia | Justificativa |
|-----------|------------|---------------|
| Cloud Provider | **AWS** | Completo, enterprise, todas regioes Brasil |
| Backend Deploy | **Docker + ECS** | Containers, escalavel, Fargate serverless |
| Frontend Deploy | **Vercel** | Otimizado para Next.js, edge functions |
| CDN | **CloudFront** | Integrado S3, baixa latencia global |
| File Storage | **S3** | Padrao da industria, lifecycle policies |
| Image Processing | **Sharp** | Biblioteca Node.js, processa no upload |
| CI/CD | **GitHub Actions** | Integrado ao GitHub, YAML workflows |
| IaC | **Terraform** | Multi-cloud, declarativo, state management |

### Ambientes

| Ambiente | URL | Proposito |
|----------|-----|-----------|
| **Production** | `api.ahub.com.br` | Usuarios finais |
| **Staging** | `api-staging.ahub.com.br` | QA e testes |
| **Development** | `localhost:3000` | Desenvolvimento local |

### Arquitetura AWS

```text
┌─────────────────────────────────────────────────────────────┐
│                        AWS Cloud                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  CloudFront │    │     ALB     │    │    Route53  │     │
│  │    (CDN)    │    │ (Load Bal.) │    │    (DNS)    │     │
│  └──────┬──────┘    └──────┬──────┘    └─────────────┘     │
│         │                  │                                │
│         ▼                  ▼                                │
│  ┌─────────────┐    ┌─────────────┐                        │
│  │     S3      │    │  ECS/Fargate│                        │
│  │  (Assets)   │    │  (Backend)  │                        │
│  └─────────────┘    └──────┬──────┘                        │
│                            │                                │
│         ┌──────────────────┼──────────────────┐            │
│         ▼                  ▼                  ▼            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │     RDS     │    │ ElastiCache │    │   Secrets   │    │
│  │ (PostgreSQL)│    │   (Redis)   │    │   Manager   │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack Monitoramento

| Categoria | Tecnologia | Justificativa |
|-----------|------------|---------------|
| Error Tracking | **AWS CloudWatch + X-Ray** | Nativo AWS, traces distribuidos |
| Logs | **AWS CloudWatch Logs** | Integrado, queries com Insights |
| Mobile Analytics | **Firebase Analytics + Crashlytics** | Gratuito, crashes, eventos |
| Uptime/Alertas | **AWS CloudWatch Alarms** | Nativo, metricas infra, SNS |

### Metricas Monitoradas

| Metrica | Threshold | Acao |
|---------|-----------|------|
| CPU > 80% | 5 min | Scale up |
| Memory > 85% | 5 min | Scale up |
| Error rate > 1% | 1 min | Alerta |
| Response time > 3s | 5 min | Investigar |
| Database connections > 80% | 5 min | Alerta |

### Dashboards

- **Infrastructure:** CPU, memoria, rede, disco
- **Application:** Requests, latencia, erros
- **Business:** Usuarios ativos, check-ins, transacoes

---

## Stack Testing

| Categoria | Tecnologia | Justificativa |
|-----------|------------|---------------|
| Unit/Integration | **Vitest + Testing Library** | Rapido, TypeScript nativo |
| E2E | **Playwright** | Cross-browser, visual testing |
| API Testing | **Supertest** | Testes de integracao HTTP |
| Mocking | **MSW (Mock Service Worker)** | Mocks de API no browser/node |

### Estrategia de Testes

| Tipo | Cobertura | Ferramenta |
|------|-----------|------------|
| Unit | Funcoes puras, hooks | Vitest |
| Integration | Componentes, API | Testing Library + Supertest |
| E2E | Fluxos criticos | Playwright |
| Visual | UI regression | Playwright screenshots |

### Comandos

```bash
# Unit + Integration
pnpm test

# E2E
pnpm test:e2e

# Coverage
pnpm test:coverage
```

---

## Estrutura do Monorepo

**Ferramenta:** Turborepo + pnpm workspaces

```text
a-hub/
├── apps/
│   ├── mobile/              # React Native + Expo
│   │   ├── app/             # Expo Router screens
│   │   ├── components/      # Componentes mobile
│   │   └── package.json
│   │
│   ├── web/                 # Next.js (Admin + Display)
│   │   ├── app/             # App Router
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
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── shared/              # Types, utils, validations
│   │   ├── src/
│   │   │   ├── types/       # TypeScript types
│   │   │   ├── utils/       # Funcoes utilitarias
│   │   │   └── validation/  # Schemas Zod
│   │   └── package.json
│   │
│   ├── config/              # Configs compartilhadas
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   │
│   └── database/            # Prisma schema e client
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
│
├── infrastructure/
│   └── terraform/           # IaC para AWS
│       ├── environments/
│       │   ├── production/
│       │   └── staging/
│       └── modules/
│
├── turbo.json               # Config Turborepo
├── package.json             # Root package.json
├── pnpm-workspace.yaml      # pnpm workspaces
└── .github/
    └── workflows/           # GitHub Actions
```

### Scripts do Monorepo

```bash
# Desenvolvimento
pnpm dev              # Todos os apps
pnpm dev:mobile       # Apenas mobile
pnpm dev:web          # Apenas web
pnpm dev:api          # Apenas backend

# Build
pnpm build            # Build de todos
pnpm build:mobile     # Build mobile (EAS)
pnpm build:web        # Build web
pnpm build:api        # Build backend

# Testes
pnpm test             # Testes de todos
pnpm test:e2e         # E2E com Playwright

# Linting
pnpm lint             # Lint de todos
pnpm typecheck        # TypeScript check
```

---

## Diagrama de Arquitetura

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
├───────────────────┬───────────────────┬─────────────────────────────────┤
│    Mobile App     │    Web Admin      │         Web Display             │
│   (Expo/RN)       │   (Next.js)       │         (Next.js)               │
│   iOS + Android   │   Vercel          │         Vercel                  │
│                   │                   │                                 │
│ ┌───────────────┐ │ ┌───────────────┐ │ ┌─────────────────────────────┐ │
│ │   Tamagui    │ │ │  shadcn/ui   │ │ │     QR Code Display         │ │
│ │   Zustand    │ │ │  Tailwind    │ │ │     WebSocket Client        │ │
│ │ TanStack Query│ │ │  Recharts    │ │ │     Fullscreen Mode         │ │
│ └───────────────┘ │ └───────────────┘ │ └─────────────────────────────┘ │
└────────┬──────────┴────────┬──────────┴────────────┬────────────────────┘
         │                   │                        │
         │    REST API       │      REST API          │   WebSocket
         │    + Push         │                        │   (Socket.io)
         ▼                   ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (NestJS)                                 │
│                         Docker + ECS/Fargate                             │
├───────────────────┬───────────────────┬─────────────────────────────────┤
│   Auth Module     │   API Modules     │      WebSocket Gateway          │
│   (Passport)      │   (REST)          │      (Socket.io)                │
│                   │                   │                                 │
│ ┌───────────────┐ │ ┌───────────────┐ │ ┌─────────────────────────────┐ │
│ │ JWT + Refresh │ │ │   Events     │ │ │   Display Updates           │ │
│ │ Guards        │ │ │   Points     │ │ │   Notifications             │ │
│ │ Strategies    │ │ │   Store      │ │ │   Messages                  │ │
│ └───────────────┘ │ └───────────────┘ │ └─────────────────────────────┘ │
└────────┬──────────┴────────┬──────────┴────────────┬────────────────────┘
         │                   │                        │
         ▼                   ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                     │
├───────────────────┬───────────────────┬─────────────────────────────────┤
│   PostgreSQL      │      Redis        │          AWS S3                 │
│   (RDS)           │   (ElastiCache)   │       (Files/Images)            │
│                   │                   │                                 │
│ ┌───────────────┐ │ ┌───────────────┐ │ ┌─────────────────────────────┐ │
│ │   Prisma      │ │ │   Sessions   │ │ │     CloudFront (CDN)        │ │
│ │   Migrations  │ │ │   Cache      │ │ │     Image Optimization      │ │
│ │   Full-Text   │ │ │   BullMQ     │ │ │     Lifecycle Policies      │ │
│ └───────────────┘ │ └───────────────┘ │ └─────────────────────────────┘ │
└───────────────────┴───────────────────┴─────────────────────────────────┘
```

---

## Referencias

- [Design System](design-system.md) - Cores, tipografia, componentes
- [Autenticacao](authentication.md) - Fluxos de auth
- [Performance](performance.md) - Metricas e otimizacoes
- [Roadmap de Implementacao](../00-overview/roadmap.md) - Fases do projeto
