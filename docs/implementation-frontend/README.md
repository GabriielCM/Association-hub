# Plano de Implementação do Frontend - A-hub

## Resumo Executivo

Este plano cobre a implementação completa do frontend do A-hub:

| Plataforma | Tecnologia | Usuários |
|------------|------------|----------|
| **App Mobile** | React Native + Expo | Membros da associação |
| **Web Admin** | Next.js | Administradores |
| **Web Display** | Next.js | TVs/Kiosks em eventos |

## Estado Atual

- **Backend:** 100% implementado (19 módulos NestJS, 100+ endpoints)
- **Frontend Fase 0:** ✅ Completa (Auth, Design System, API Client, WebSocket)
- **Frontend Fase 1:** ✅ Completa (Pontos + Assinaturas + Rankings + WebSocket real-time)
- **Frontend Fase 2:** ✅ Completa (Perfil + Carteirinha + Minha Carteira)
- **Frontend Fase 3:** ✅ Completa (Eventos + Check-in + Display)
- **Frontend Fases 4-8:** Pendente
- **Shared:** packages/shared/ tem types, validation schemas e utils prontos

## Stack Tecnológica

### Mobile (React Native + Expo)
- **UI:** Tamagui
- **State:** Zustand + TanStack Query
- **Storage:** MMKV
- **Navigation:** Expo Router

### Web (Next.js)
- **UI:** shadcn/ui + Tailwind CSS
- **State:** Zustand + TanStack Query
- **Forms:** React Hook Form + Zod

### Shared
- **UI Package:** Tamagui (cross-platform)
- **Types:** packages/shared/src/types/
- **Validation:** packages/shared/src/validation/

## Fases de Implementação

| Fase | Foco | Complexidade | Duração | Status |
|------|------|--------------|---------|--------|
| [Fase 0](./fase-00-infraestrutura.md) | Infraestrutura (Auth, Design System, API, WebSocket) | Alta | 2-3 semanas | ✅ Completa |
| [Fase 1](./fase-01-core.md) | Core (Pontos + Assinaturas) | Alta | 2-3 semanas | ✅ Completa |
| [Fase 2](./fase-02-identidade.md) | Identidade (Perfil + Carteirinha + Carteira) | Média | 2 semanas | Pendente |
| [Fase 3](./fase-03-eventos.md) | Engajamento (Eventos + Check-in + Display) | Alta | 2-3 semanas | Pendente |
| [Fase 4](./fase-04-comunicacao.md) | Comunicação (Notificações + Mensagens) | Alta | 2-3 semanas | Pendente |
| [Fase 5](./fase-05-transacoes.md) | Transações (PDV + Loja) | Alta | 3-4 semanas | Pendente |
| [Fase 6](./fase-06-locacoes.md) | Locações (Espaços + Reservas) | Média | 2 semanas | Pendente |
| [Fase 7](./fase-07-unificacao.md) | Unificação (Pedidos + Suporte + Rankings) | Média | 2-3 semanas | Pendente |
| [Fase 8](./fase-08-dashboard.md) | Dashboard (Agregador) | Alta | 2-3 semanas | Pendente |

**Total estimado:** 18-26 semanas

## Arquivos Críticos para Leitura (Todas as Fases)

| Arquivo | Propósito |
|---------|-----------|
| `docs/shared/design-system.md` | Cores, tipografia, espaçamento, sombras neumórficas |
| `docs/shared/authentication.md` | Fluxos de auth, JWT, segurança |
| `docs/api/endpoints-reference.md` | Todos os endpoints da API |
| `packages/shared/src/types/index.ts` | Definições de tipos TypeScript |
| `packages/shared/src/validation/index.ts` | Schemas Zod para formulários |
| `packages/database/prisma/schema.prisma` | Modelos de dados (2250 linhas) |

## Design System

| Token | Valor |
|-------|-------|
| **Primary** | `#8B5CF6` (Purple) |
| **Secondary** | `#06B6D4` (Cyan) |
| **Font** | Inter |
| **Spacing** | 8px base |
| **Style** | Neumorphic shadows, pill-shaped buttons |
| **Icons** | Phosphor Icons |
| **Themes** | Light + Dark mode |

## Grafo de Dependências

```
Fase 0 (Infraestrutura)
    ↓
Fase 1 (Pontos + Assinaturas) ← CORE
    ↓
Fase 2 (Perfil + Carteirinha + Carteira)
    ↓
Fase 3 (Eventos)
    ├→ Fase 4 (Notificações + Mensagens) ─┐
    │                                      │ PARALELO
    └→ Fase 5 (PDV + Loja) ───────────────┘
           ↓
    Fase 6 (Espaços + Reservas)
           ↓
    Fase 7 (Pedidos + Suporte + Rankings)
           ↓
    Fase 8 (Dashboard) ← AGREGADOR (depende de TODAS)
```

## Estratégia de Testes

| Tipo | Ferramenta | Cobertura |
|------|------------|-----------|
| Unitários | Vitest + Testing Library | 80% |
| E2E Web | Playwright | Fluxos críticos |
| E2E Mobile | Detox | Fluxos críticos |

## Estrutura de Pastas

```
docs/implementation-frontend/
├── README.md                      # Este arquivo
├── fase-00-infraestrutura.md
├── fase-01-core.md
├── fase-02-identidade.md
├── fase-03-eventos.md
├── fase-04-comunicacao.md
├── fase-05-transacoes.md
├── fase-06-locacoes.md
├── fase-07-unificacao.md
└── fase-08-dashboard.md
```
