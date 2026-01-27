---
section: overview
document: roadmap
status: complete
priority: mvp
last_updated: 2026-01-27
---

# Roadmap de Implementação

[← Voltar ao Índice](README.md)

---

## Visão Geral

Este roadmap define a **ordem lógica de implementação** dos módulos do A-hub, otimizado para **code agents** (Cursor, Claude Code, etc.).

**Exclusão:** O módulo 15-jukebox não será implementado nesta versão.

```
┌────────────────────────────────────────────────────────────────┐
│  FASE 0: Infraestrutura Base                                   │
│  Autenticação, Design System, API REST, WebSocket              │
├────────────────────────────────────────────────────────────────┤
│  FASE 1: Core (Sistema de Pontos + Assinaturas)                │
│  Fundação de gamificação e benefícios                          │
├────────────────────────────────────────────────────────────────┤
│  FASE 2: Identidade (Perfil + Carteirinha + Minha Carteira)    │
│  Interface do usuário com o sistema de pontos                  │
├────────────────────────────────────────────────────────────────┤
│  FASE 3: Engajamento (Eventos)                                 │
│  Check-in, Display, Badges                                     │
├────────────────────────────────────────────────────────────────┤
│  FASE 4: Comunicação (Notificações + Mensagens)                │
│  Hub central de comunicação                                    │
├────────────────────────────────────────────────────────────────┤
│  FASE 5: Transações (PDV + Loja)                               │
│  Pagamentos com pontos e PIX                                   │
├────────────────────────────────────────────────────────────────┤
│  FASE 6: Locações (Espaços + Reservas)                         │
│  Gestão de espaços físicos                                     │
├────────────────────────────────────────────────────────────────┤
│  FASE 7: Unificação (Pedidos + Suporte + Rankings)             │
│  Histórico e atendimento                                       │
├────────────────────────────────────────────────────────────────┤
│  FASE 8: Agregador (Dashboard)                                 │
│  Tela principal que integra todos os módulos                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Resumo das Fases

| Fase | Módulos | Foco | Complexidade |
|------|---------|------|--------------|
| 0 | Infraestrutura | Base técnica | Alta |
| 1 | Sistema de Pontos + Assinaturas | Core de gamificação | Alta |
| 2 | Perfil + Carteirinha + Minha Carteira | Identidade do usuário | Média |
| 3 | Eventos | Engajamento + Check-in | Alta |
| 4 | Notificações + Mensagens | Comunicação | Alta |
| 5 | PDV + Loja | Transações comerciais | Alta |
| 6 | Espaços + Reservas | Locações físicas | Média |
| 7 | Pedidos + Suporte + Rankings | Unificação e suporte | Média |
| 8 | Dashboard | Agregador final | Alta |

---

## Fase 0: Infraestrutura Base

### Objetivo
Estabelecer os alicerces técnicos que todos os módulos consumirão.

### Componentes

| Componente | Descrição | Referência |
|------------|-----------|------------|
| Autenticação JWT | Tokens, refresh, sessão 30 dias | [authentication.md](../shared/authentication.md) |
| Design System | Tema Vibrante, cores, Phosphor Icons | [design-system.md](../shared/design-system.md) |
| API REST Base | Padrão de endpoints, paginação, erros | [endpoints-reference.md](../api/endpoints-reference.md) |
| WebSocket | Conexão base para real-time (heartbeat 30s) | [endpoints-reference.md](../api/endpoints-reference.md) |
| Storage/CDN | Upload de imagens, compressão | - |

### Dependências
Nenhuma (é a base).

---

## Fase 1: Core - Sistema de Pontos e Assinaturas

### Objetivo
Implementar o núcleo de gamificação que todos os módulos de transação dependem.

### 1.1 Sistema de Pontos (06-sistema-pontos) 🔴 MVP

**Por que primeiro:** Praticamente todos os módulos dependem dele.

| Funcionalidade | Descrição |
|----------------|-----------|
| UserPoints | Saldo, lifetime_earned, lifetime_spent |
| PointTransaction | 13 sources de transação |
| Transferências | Entre usuários com biometria |
| Integração Strava | OAuth, sync manual, 5km/dia máx |
| Rankings | Por pontos, eventos, Strava |
| Painel ADM | Config, crédito/débito manual, estorno |

**Referência:** [06-sistema-pontos/spec.md](../06-sistema-pontos/spec.md)

### 1.2 Assinaturas (17-assinaturas) 🟡 Fase 2

**Por que junto:** Fornece multiplicadores que afetam pontos, loja, PDV e espaços.

| Funcionalidade | Descrição |
|----------------|-----------|
| Planos | Até 3 ativos simultaneamente |
| Mutadores | Multiplicadores de pontos (1.5x - 2.0x) |
| Descontos | Loja, PDV, Espaços (percentuais) |
| Verificado dourado | Badge visual em posts e perfil |

**Referência:** [17-assinaturas/spec.md](../17-assinaturas/spec.md)

### Dependências
- Fase 0 (Infraestrutura)

---

## Fase 2: Identidade do Usuário

### Objetivo
Definir como o usuário interage com o sistema de pontos.

### Módulos

| Módulo | Prioridade | Descrição |
|--------|------------|-----------|
| [Perfil](../02-perfil/) | 🔴 MVP | Dados, foto, badges, verificado dourado |
| [Carteirinha](../03-carteirinha/) | 🔴 MVP | QR Code estático, convênios/benefícios |
| [Minha Carteira](../05-minha-carteira/) | 🔴 MVP | Scanner universal, transferências |

### Dependências
- Fase 1 (Sistema de Pontos + Assinaturas)

---

## Fase 3: Eventos e Check-in

### Objetivo
Implementar o principal gerador de engajamento e pontos.

### Eventos (04-eventos) 🔴 MVP

| Funcionalidade | Descrição |
|----------------|-----------|
| CRUD | Criação e gestão por ADM |
| Check-in | QR Code dinâmico (rotação 1 min, janela 2 min) |
| Display | Fullscreen para Kiosk/TV via WebSocket |
| Badges | Automáticas ao atingir critérios |
| Crédito de pontos | Imediato no check-in |

**Referência:** [04-eventos/spec.md](../04-eventos/spec.md)

### Dependências
- Fase 1 (Sistema de Pontos para crédito)
- Fase 2 (Perfil para badges)
- Fase 0 (WebSocket para Display)

---

## Fase 4: Comunicação

### Objetivo
Implementar o hub central de comunicação do app.

**Podem ser implementados em paralelo.**

### 4.1 Notificações (07-notificacoes) 🔴 MVP

| Funcionalidade | Descrição |
|----------------|-----------|
| 27 tipos | Em 5 categorias (Social, Eventos, Pontos, Reservas, Sistema) |
| Push | FCM (Android) e APNs (iOS) |
| In-app | Badge e Central de Notificações |
| Agrupamento | Batching em janela de 1 hora |
| WebSocket | Real-time |

**Referência:** [07-notificacoes/spec.md](../07-notificacoes/spec.md)

### 4.2 Mensagens (08-mensagens) 🔴 MVP

| Funcionalidade | Descrição |
|----------------|-----------|
| Chat | 1:1 e grupos |
| Mídia | Texto, imagem, áudio |
| Reações | Emoji em mensagens |
| Status | Online, digitando, lido |
| WebSocket | Real-time |

**Referência:** [08-mensagens/spec.md](../08-mensagens/spec.md)

### Dependências
- Fase 0 (WebSocket)
- Fase 2 (Perfil para usuários)

---

## Fase 5: Transações Comerciais

### Objetivo
Implementar pagamentos com pontos e PIX.

**Podem ser implementados em paralelo.**

### 5.1 PDV (16-pdv) 🔴 MVP

| Funcionalidade | Descrição |
|----------------|-----------|
| Kiosks | Displays touchscreen |
| Pagamento | **APENAS pontos OU PIX** (nunca misto) |
| Stripe | Integração para PIX |
| Cashback | Em compras PIX |
| WebSocket | Confirmação real-time |

**Referência:** [16-pdv/spec.md](../16-pdv/spec.md)

### 5.2 Loja (12-loja) 🟡 Fase 2

| Funcionalidade | Descrição |
|----------------|-----------|
| Catálogo | Categorias e variações (SKU) |
| Tipos | Físico, voucher, serviço |
| Pagamento | **Pontos, PIX ou MISTO** |
| Carrinho | Reserva de estoque (30 min) |
| Cashback | Configurável |

**Referência:** [12-loja/spec.md](../12-loja/spec.md)

### Dependências
- Fase 1 (Sistema de Pontos para débito)
- Fase 4 (Notificações para confirmações)

---

## Fase 6: Espaços e Reservas

### Objetivo
Implementar gestão de espaços físicos e reservas.

**Podem ser implementados em paralelo (Espaços primeiro).**

### 6.1 Espaços (09-espacos) 🟡 Fase 2

| Funcionalidade | Descrição |
|----------------|-----------|
| CRUD | Espaços físicos (churrasqueira, salão, quadra, piscina) |
| Configuração | Período, taxa, intervalo entre locações |
| Bloqueios | Datas específicas (manutenção, feriados) |

**Referência:** [09-espacos/spec.md](../09-espacos/spec.md)

### 6.2 Reservas (10-reservas) 🟡 Fase 2

| Funcionalidade | Descrição |
|----------------|-----------|
| Fluxo | Funcionário solicita → Gerente/ADM aprova |
| Bloqueio | Reserva pendente bloqueia data |
| Fila de espera | Com notificações |
| Privacidade | Não exibe quem reservou |

**Referência:** [10-reservas/spec.md](../10-reservas/spec.md)

### Dependências
- Fase 4 (Notificações para aprovações e fila)
- Fase 1 (Assinaturas para descontos)

---

## Fase 7: Unificação e Suporte

### Objetivo
Unificar históricos e fornecer suporte ao usuário.

### 7.1 Pedidos (11-pedidos) 🟡 Fase 2

| Funcionalidade | Descrição |
|----------------|-----------|
| Histórico | **UNIFICADO de Loja + PDV** |
| Timeline | Pendente → Confirmado → Pronto → Concluído |
| QR retirada | Para produtos físicos |
| Vouchers | Código, validade, uso |

**Referência:** [11-pedidos/spec.md](../11-pedidos/spec.md)

### 7.2 Suporte (14-suporte) 🟡 Fase 2

| Funcionalidade | Descrição |
|----------------|-----------|
| Tickets | Bug, Sugestão, Dúvida |
| Chat ao vivo | 24/7 com fila |
| FAQ | Busca e accordion |
| Crash | Captura automática |

**Referência:** [14-suporte/spec.md](../14-suporte/spec.md)

### 7.3 Rankings (13-rankings) 🟡 Fase 2 (Stub)

| Funcionalidade | Descrição |
|----------------|-----------|
| Rankings | Por pontos, eventos, Strava |
| Períodos | All-time, monthly, weekly |

**Referência:** [13-rankings/spec.md](../13-rankings/spec.md)

### Dependências
- Fase 5 (Loja + PDV para histórico)
- Fase 4 (Notificações e WebSocket para suporte)

---

## Fase 8: Dashboard - Agregador Final

### Objetivo
Implementar a tela principal que integra TODOS os módulos.

### Dashboard (01-dashboard) 🔴 MVP

**Por que por último:** Depende de todos os outros módulos.

| Componente | Integração |
|------------|------------|
| Card de pontos | Sistema de Pontos |
| Acessos rápidos | Todos os módulos |
| Stories | Feed social |
| Feed | Posts, curtidas, comentários |
| Verificado dourado | Assinaturas |
| Badge de notificações | Notificações |

**Referência:** [01-dashboard/spec.md](../01-dashboard/spec.md)

### Dependências
- **TODAS as fases anteriores**

---

## Mapa de Dependências

```
Fase 0 (Infraestrutura)
    │
    ▼
Fase 1 (Sistema de Pontos + Assinaturas) ◄── CORE
    │
    ▼
Fase 2 (Perfil + Carteirinha + Minha Carteira)
    │
    ▼
Fase 3 (Eventos)
    │
    ├───────────────────────┐
    ▼                       ▼
Fase 4 (Notificações)    Fase 4 (Mensagens)  ◄── paralelo
    │                       │
    └───────────┬───────────┘
                ▼
    ┌───────────┴───────────┐
    ▼                       ▼
Fase 5 (PDV)             Fase 5 (Loja)       ◄── paralelo
    │                       │
    └───────────┬───────────┘
                ▼
    ┌───────────┴───────────┐
    ▼                       ▼
Fase 6 (Espaços)         Fase 6 (Reservas)   ◄── sequencial
    │                       │
    └───────────┬───────────┘
                ▼
Fase 7 (Pedidos + Suporte + Rankings)
                │
                ▼
Fase 8 (Dashboard) ◄── AGREGADOR
```

---

## MVP Mínimo

Se houver restrição de tempo, foque nesta sequência reduzida:

| Ordem | Módulo | Justificativa |
|-------|--------|---------------|
| 1 | Infraestrutura | Base obrigatória |
| 2 | Sistema de Pontos | Core (sem Assinaturas) |
| 3 | Perfil + Carteirinha + Minha Carteira | Identidade |
| 4 | Eventos | Engajamento principal |
| 5 | Notificações | Comunicação básica (sem Mensagens) |
| 6 | PDV | Transações (sem Loja) |
| 7 | Dashboard | Agregador |

**Resultado:** App funcional com pontos, carteirinha, eventos, PDV e dashboard.

---

## Recomendações para Code Agents

### Isolamento de Módulos
- Cada módulo deve ter **testes unitários independentes**
- Use **mocks** para dependências não implementadas
- Documente **interfaces de integração** claramente

### Paralelização Possível
- Fase 4: Notificações e Mensagens
- Fase 5: PDV e Loja
- Fase 6: Espaços e Reservas

### Testes Incrementais
- Após cada fase, execute **testes de integração**
- Valide endpoints conforme [endpoints-reference.md](../api/endpoints-reference.md)
- Teste **WebSocket** com clientes dedicados (onde aplicável)

### Verificação por Fase
1. Testes unitários passando (cobertura > 80%)
2. Testes de integração com módulos anteriores
3. Validação de endpoints conforme API docs
4. Fluxos E2E conforme `acceptance-criteria.md` de cada módulo

---

## Decisões de Negócio Críticas

| Área | Decisão |
|------|---------|
| **PDV** | Pagamento APENAS pontos OU PIX (nunca misto) |
| **Loja** | Pagamento pontos, PIX ou misto (configurável) |
| **Assinaturas** | Máximo 3 planos ativos por usuário |
| **Descontos** | Não acumulam com promoções (usa o maior) |
| **Cashback** | Percentual global por associação |
| **Strava** | Máximo 5km/dia pontuáveis |
| **Pontos** | Não expiram |

---

## Relacionados

- [Status dos Módulos](../README.md#status-dos-módulos)
- [Glossário](glossary.md)
- [API Reference](../api/endpoints-reference.md)
- [Design System](../shared/design-system.md)
