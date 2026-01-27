---
module: notificacoes
document: README
status: complete
priority: mvp
last_updated: 2026-01-26
---

# Notificações

[← Voltar ao Índice](../README.md)

---

**Status:** 🟢 Completo
**Prioridade:** 🔴 MVP

---

## Visão Geral

Sistema centralizado de notificações para manter usuários informados sobre atividades relevantes no app. Suporta push notifications, notificações in-app, agrupamento de notificações similares (batching), configuração por categoria e modo Não Perturbe com horário configurável.

---

## Índice de Documentos

| Documento | Descrição |
|-----------|-----------|
| [Especificação](spec.md) | Modelo de dados, telas, fluxos, componentes |
| [API](api.md) | Endpoints REST e WebSocket |
| [Critérios de Aceitação](acceptance-criteria.md) | Checklist de validação (176 critérios) |

---

## Funcionalidades Principais

| Funcionalidade | Descrição |
|----------------|-----------|
| Push Notifications | Notificações nativas via FCM (Android) e APNs (iOS) |
| In-App | Badge no header e Central de Notificações |
| Agrupamento | Notificações similares agrupadas ("5 pessoas curtiram...") |
| Configuração por Categoria | 5 categorias configuráveis (push e in-app separados) |
| Não Perturbe | Horário configurável para silenciar push |
| Marcar como Lido | Individual, por categoria ou todas |
| Histórico | Até 500 notificações mais recentes |

---

## Categorias de Notificação

| Categoria | Tipos | Descrição |
|-----------|-------|-----------|
| **Social** | 7 tipos | Curtidas, comentários, menções, seguidores, stories, enquetes |
| **Eventos** | 9 tipos | Novos eventos, lembretes, check-in, badges, cancelamentos |
| **Pontos** | 5 tipos | Ganhos, gastos, rankings, transferências, Strava |
| **Reservas** | 4 tipos | Aprovações, rejeições, lembretes, fila de espera |
| **Sistema** | 5 tipos | Mensagens, benefícios, carteirinha, comunicados |

---

## Tipos de Notificações (27 total)

### Social (7)
- Nova curtida em post
- Novo comentário em post
- Resposta em comentário
- Menção em post/comentário
- Novo seguidor
- View em story
- Enquete finalizada

### Eventos (9)
- Novo evento criado
- Lembrete 1 dia antes
- Lembrete 1 hora antes
- Evento começou
- Lembrete de check-in
- Badge conquistado
- Evento cancelado
- Evento atualizado
- Progresso de check-ins

### Pontos (5)
- Pontos recebidos
- Pontos gastos
- Subiu no ranking
- Transferência recebida
- Sincronização Strava

### Reservas (4)
- Reserva aprovada
- Reserva rejeitada
- Lembrete de reserva
- Vaga na fila de espera

### Sistema (5)
- Nova mensagem
- Novo benefício disponível
- Carteirinha bloqueada
- Carteirinha desbloqueada
- Comunicado da administração

---

## Componentes

| Componente | Descrição |
|------------|-----------|
| NotificationCenter | Tela principal com lista e filtros |
| NotificationItem | Item individual de notificação |
| NotificationGroupItem | Item de notificação agrupada |
| CategoryFilter | Chips de filtro por categoria |
| NotificationBadge | Badge com contador no header |
| SettingsToggle | Toggle de push/in-app por categoria |
| DoNotDisturbConfig | Configuração de horário DND |

---

## Integrações

| Módulo | Tipo | Notificações |
|--------|------|--------------|
| [Dashboard](../01-dashboard/) | Exibe | Badge contador no header |
| [Mensagens](../08-mensagens/) | Dispara | Nova mensagem, menção |
| [Eventos](../04-eventos/) | Dispara | Lembretes, check-in, badges |
| [Reservas](../10-reservas/) | Dispara | Aprovação, rejeição, fila |
| [Sistema de Pontos](../06-sistema-pontos/) | Dispara | Pontos ganhos/gastos, ranking |
| [Perfil](../02-perfil/) | Dispara | Novos seguidores |
| [Loja](../12-loja/) | Dispara | Pedido confirmado, voucher |
| [Suporte](../14-suporte/) | Dispara | Ticket atualizado |

---

## Decisões de Negócio

| Área | Decisão |
|------|---------|
| Retenção | Permanente (limite 500 mais recentes) |
| Agrupamento | Sim, notificações similares em janela de 1 hora |
| Configuração | Por categoria (5 categorias), não por tipo individual |
| Não Perturbe | Sim, com horário e dias da semana configuráveis |
| Sons | Padrão do sistema operacional |
| Offline | Push funciona, lista sincroniza ao reconectar |
| Pontos | NÃO integra com sistema de pontos |

---

## Relacionados

- [Dashboard](../01-dashboard/) - Badge no header
- [Eventos](../04-eventos/) - Notificações de eventos
- [Mensagens](../08-mensagens/) - Notificações de chat
- [Sistema de Pontos](../06-sistema-pontos/) - Notificações de pontos
- [Reservas](../10-reservas/) - Notificações de reservas
