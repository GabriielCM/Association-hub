---
section: overview
last_updated: 2026-01-10
---

# Visão Geral

[← Voltar ao Índice](../README.md)

---

## Conteúdo desta Seção

| Documento | Descrição |
|-----------|-----------|
| [Visão do Produto](product-overview.md) | Descrição geral do A-hub |
| [Tipos de Usuários](user-types.md) | Common User, ADM, Display |
| [Roadmap](roadmap.md) | Fases de implementação |
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
│      Sistema de Notificações            │
├─────────────────────────────────────────┤
│           API Backend                   │
└─────────────────────────────────────────┘
```

---

## Próximos Passos

Ver [Roadmap](roadmap.md) para detalhes das fases de implementação.
