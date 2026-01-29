---
section: overview
document: index
status: complete
priority: mvp
last_updated: 2026-01-27
---

# Visão Geral

[← Voltar ao Índice](../README.md)

---

## Conteúdo desta Seção

| Documento | Descrição |
|-----------|-----------|
| [Visão do Produto](product-overview.md) | Descrição geral do A-hub |
| [Tipos de Usuários](user-types.md) | Common User, ADM, Display |
| [**Roadmap de Implementação**](roadmap.md) | **9 fases para code agents** |
| [Glossário](glossary.md) | Termos e definições |

---

## Resumo do Projeto

O **A-hub** é um aplicativo mobile completo para associações, oferecendo:

- **Engajamento Social:** Feed de posts, stories, comentários, curtidas
- **Gamificação:** Sistema de pontos, badges, rankings
- **Identificação:** Carteirinha digital com QR Code
- **Eventos:** Gestão completa com check-in via QR Code dinâmico
- **Benefícios:** Convênios com estabelecimentos parceiros
- **Comunicação:** Mensagens diretas, notificações push
- **Transações:** PDV e Loja com pontos e PIX
- **Locações:** Espaços físicos e sistema de reservas

---

## Roadmap de Implementação (Code Agents)

O [Roadmap](roadmap.md) define 9 fases de implementação otimizadas para code agents:

```
Fase 0: Infraestrutura ──► Fase 1: Core (Pontos + Assinaturas)
                                    │
                                    ▼
                          Fase 2: Identidade
                                    │
                                    ▼
                          Fase 3: Eventos
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
    Fase 4: Comunicação     Fase 5: Transações     Fase 6: Locações
            │                       │                       │
            └───────────────────────┼───────────────────────┘
                                    ▼
                          Fase 7: Unificação
                                    │
                                    ▼
                          Fase 8: Dashboard (Agregador)
```

**Módulo Core:** Sistema de Pontos (todos dependem dele)
**Agregador Final:** Dashboard (integra todos)
**Exclusão:** Jukebox NÃO será implementado nesta versão

---

## Arquitetura de Alto Nível

```
┌─────────────────────────────────────────┐
│              APLICATIVO                 │
├─────────────────────────────────────────┤
│  Dashboard  │  Perfil  │  Carteirinha   │
├─────────────────────────────────────────┤
│  Eventos    │  Pontos  │  Mensagens     │
├─────────────────────────────────────────┤
│  PDV  │  Loja  │  Espaços  │  Reservas  │
├─────────────────────────────────────────┤
│  Notificações  │  Suporte  │ Assinaturas│
├─────────────────────────────────────────┤
│           API Backend + WebSocket       │
└─────────────────────────────────────────┘
```

---

## Próximos Passos

1. Consultar [Roadmap](roadmap.md) para ordem de implementação
2. Iniciar pela Fase 0 (Infraestrutura)
3. Seguir dependências entre fases
