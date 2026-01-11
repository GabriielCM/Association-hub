---
section: overview
document: roadmap
last_updated: 2026-01-10
---

# Roadmap

[← Voltar ao Índice](README.md)

---

## Visão Geral das Fases

```
┌─────────────────────────────────────────────────────────┐
│  FASE 1 - MVP                                           │
│  Dashboard, Perfil, Pontos, Feed, Stories,              │
│  Carteirinha, Notificações, Mensagens                   │
├─────────────────────────────────────────────────────────┤
│  FASE 2                                                 │
│  Eventos, Espaços, Reservas, Pedidos, Loja, Rankings    │
├─────────────────────────────────────────────────────────┤
│  FASE 3 - Nice to Have                                  │
│  Jukebox, Gamificação avançada, Analytics usuários      │
└─────────────────────────────────────────────────────────┘
```

---

## Fase 1 - MVP (Essencial)

**Objetivo:** Lançar versão inicial com funcionalidades core.

### Módulos Incluídos

| Módulo | Status | Descrição |
|--------|--------|-----------|
| [Dashboard](../01-dashboard/) | 🟢 Spec Completa | Tela principal, feed, stories |
| [Perfil](../02-perfil/) | 🟢 Spec Completa | Perfil do usuário, badges |
| [Sistema de Pontos](../06-sistema-pontos/) | 🟡 Parcial | Gamificação básica |
| Feed Social | 🟢 Spec Completa | Posts, enquetes, comentários |
| Stories | 🟢 Spec Completa | Conteúdo efêmero 24h |
| [Carteirinha](../03-carteirinha/) | 🟢 Spec Completa | Identificação, QR Code, benefícios |
| [Notificações](../07-notificacoes/) | 🟡 Parcial | Push notifications |
| [Mensagens](../08-mensagens/) | ⚪ Não Iniciado | DMs entre usuários |

### Funcionalidades Core

- [ ] Login/Cadastro (email + social)
- [ ] Dashboard com feed social
- [ ] Stories de 24 horas
- [ ] Criação de posts (foto + descrição)
- [ ] Enquetes no feed
- [ ] Sistema de curtidas e comentários
- [ ] Carteirinha digital com QR Code
- [ ] Lista de benefícios/parceiros
- [ ] Sistema de pontos básico
- [ ] Notificações push
- [ ] Mensagens diretas

---

## Fase 2 - Expansão

**Objetivo:** Adicionar módulos de gestão e engajamento avançado.

### Módulos Incluídos

| Módulo | Status | Descrição |
|--------|--------|-----------|
| [Eventos](../04-eventos/) | 🟢 Spec Completa | Gestão completa de eventos |
| [Espaços](../09-espacos/) | ⚪ Não Iniciado | Cadastro de espaços físicos |
| [Reservas](../10-reservas/) | ⚪ Não Iniciado | Sistema de reservas |
| [Pedidos](../11-pedidos/) | ⚪ Não Iniciado | Pedidos bar/restaurante |
| [Loja](../12-loja/) | ⚪ Não Iniciado | Loja de produtos |
| [Rankings](../13-rankings/) | ⚪ Não Iniciado | Sistema de rankings |

### Funcionalidades

- [ ] Criação e gestão de eventos (ADM)
- [ ] Check-in via QR Code dinâmico
- [ ] Display fullscreen para TVs
- [ ] Analytics de eventos em tempo real
- [ ] Badges de eventos
- [ ] Cadastro de espaços
- [ ] Sistema de reservas
- [ ] Pedidos no bar/restaurante
- [ ] Loja com pontos
- [ ] Rankings e leaderboards

---

## Fase 3 - Nice to Have

**Objetivo:** Funcionalidades avançadas e diferenciais.

### Módulos Incluídos

| Módulo | Status | Descrição |
|--------|--------|-----------|
| [Jukebox](../15-jukebox/) | ⚪ Não Iniciado | Sistema de música |
| Gamificação Avançada | ⚪ Não Iniciado | Desafios, missões, níveis |
| Analytics Usuários | ⚪ Não Iniciado | Métricas pessoais |

### Funcionalidades

- [ ] Jukebox para controle de música
- [ ] Desafios e missões gamificadas
- [ ] Sistema de níveis de usuário
- [ ] Analytics pessoal de pontos
- [ ] Integração Apple Wallet / Google Pay
- [ ] Check-in facial (futurístico)
- [ ] Transmissão ao vivo

---

## Cronograma Sugerido

> **Nota:** Prazos são estimativas e devem ser validados com a equipe de desenvolvimento.

### Fase 1 - MVP
- Dashboard: 3-4 semanas
- Carteirinha: 3-4 semanas
- Notificações: 1-2 semanas
- Mensagens: 2-3 semanas
- **Total estimado:** 10-14 semanas

### Fase 2
- Eventos: 6-8 semanas
- Espaços/Reservas: 3-4 semanas
- Pedidos: 3-4 semanas
- Loja: 2-3 semanas
- Rankings: 2-3 semanas
- **Total estimado:** 16-22 semanas

### Fase 3
- A definir conforme priorização

---

## Dependências entre Módulos

```
Dashboard ─────────┬── Feed Social ── Stories
                   │
                   ├── Sistema de Pontos
                   │
Carteirinha ───────┼── Benefícios
                   │
Eventos ───────────┼── Badges ── Perfil
                   │
                   └── Espaços ── Reservas
```

---

## Próximos Passos

1. Revisar e detalhar módulo Dashboard
2. Definir Sistema de Pontos completamente
3. Especificar módulo de Mensagens
4. Criar wireframes do Dashboard e Carteirinha

---

## Relacionados

- [Status dos Módulos](../README.md#status-dos-módulos)
- [Glossário](glossary.md)
