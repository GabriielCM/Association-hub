---
module: notificacoes
document: spec
status: complete
priority: mvp
last_updated: 2026-01-26
---

# Notificações - Especificação

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Modelo de Dados](#2-modelo-de-dados)
3. [Telas](#3-telas)
4. [Fluxos](#4-fluxos)
5. [Componentes](#5-componentes)
6. [Real-time](#6-real-time)
7. [Offline](#7-offline)
8. [Push Notifications](#8-push-notifications)

---

## 1. Visão Geral

### Objetivo

Sistema centralizado de notificações para manter usuários informados sobre atividades relevantes no app, com suporte a push notifications, agrupamento de notificações similares e configuração por categoria.

### Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| Push Notifications | Notificações nativas do dispositivo |
| In-App | Badge e lista de notificações dentro do app |
| Agrupamento | Notificações similares agrupadas ("5 pessoas curtiram...") |
| Configuração por Categoria | 5 categorias configuráveis pelo usuário |
| Não Perturbe | Horário configurável para silenciar notificações |
| Marcar como Lido | Individual, por categoria ou todas |
| Histórico | Até 500 notificações mais recentes |

### Restrições

- Notificações não expiram (retenção permanente, limite 500)
- Sons usam padrão do sistema operacional
- Configuração por categoria (não por tipo individual)
- Não há integração com sistema de pontos

---

## 2. Modelo de Dados

### Notification

```typescript
interface Notification {
  id: string;                    // UUID
  user_id: string;               // UUID do destinatário
  type: NotificationType;        // Tipo específico (27 tipos)
  category: NotificationCategory; // Categoria (5 categorias)
  title: string;                 // Título da notificação
  body: string;                  // Corpo da notificação
  data: Record<string, any>;     // Dados extras (IDs, URLs, etc.)
  image_url?: string;            // Imagem opcional (avatar, thumbnail)
  action_url?: string;           // Deep link para ação
  group_key?: string;            // Chave para agrupamento
  is_read: boolean;              // Lida ou não
  created_at: string;            // ISO 8601
}
```

### NotificationGroup

```typescript
interface NotificationGroup {
  group_key: string;             // Ex: "post_likes_123"
  category: NotificationCategory;
  title: string;                 // "5 pessoas curtiram seu post"
  body: string;                  // Preview
  count: number;                 // Quantidade agrupada
  notifications: Notification[]; // Notificações do grupo
  latest_at: string;             // Data da mais recente
  is_read: boolean;              // Todas lidas?
}
```

### NotificationSettings

```typescript
interface NotificationSettings {
  user_id: string;               // UUID do usuário
  category: NotificationCategory;
  push_enabled: boolean;         // Push ativo para categoria
  in_app_enabled: boolean;       // In-app ativo para categoria
}
```

### DoNotDisturb

```typescript
interface DoNotDisturb {
  user_id: string;               // UUID do usuário
  enabled: boolean;              // Modo ativo
  start_time: string;            // Hora início (HH:mm)
  end_time: string;              // Hora fim (HH:mm)
  days_of_week: number[];        // 0=Dom, 1=Seg, ..., 6=Sab
}
```

### NotificationCategory

```typescript
enum NotificationCategory {
  SOCIAL = "social",             // Feed, curtidas, comentários
  EVENTS = "events",             // Eventos, lembretes, check-in
  POINTS = "points",             // Pontos, rankings, transferências
  RESERVATIONS = "reservations", // Espaços, aprovações
  SYSTEM = "system"              // Mensagens, carteirinha, admin
}
```

### NotificationType

```typescript
enum NotificationType {
  // SOCIAL (7 tipos)
  NEW_LIKE = "new_like",
  NEW_COMMENT = "new_comment",
  COMMENT_REPLY = "comment_reply",
  MENTION = "mention",
  NEW_FOLLOWER = "new_follower",
  STORY_VIEW = "story_view",
  POLL_ENDED = "poll_ended",

  // EVENTS (9 tipos)
  NEW_EVENT = "new_event",
  EVENT_REMINDER_1DAY = "event_reminder_1d",
  EVENT_REMINDER_1HOUR = "event_reminder_1h",
  EVENT_STARTED = "event_started",
  CHECKIN_REMINDER = "checkin_reminder",
  BADGE_EARNED = "badge_earned",
  EVENT_CANCELLED = "event_cancelled",
  EVENT_UPDATED = "event_updated",
  CHECKIN_PROGRESS = "checkin_progress",

  // POINTS (5 tipos)
  POINTS_RECEIVED = "points_received",
  POINTS_SPENT = "points_spent",
  RANKING_UP = "ranking_up",
  TRANSFER_RECEIVED = "transfer_received",
  STRAVA_SYNC = "strava_sync",

  // RESERVATIONS (4 tipos)
  RESERVATION_APPROVED = "reservation_approved",
  RESERVATION_REJECTED = "reservation_rejected",
  RESERVATION_REMINDER = "reservation_reminder",
  WAITLIST_AVAILABLE = "waitlist_available",

  // SYSTEM (5 tipos)
  NEW_MESSAGE = "new_message",
  NEW_BENEFIT = "new_benefit",
  CARD_BLOCKED = "card_blocked",
  CARD_UNBLOCKED = "card_unblocked",
  ADMIN_ANNOUNCEMENT = "admin_announcement"
}
```

### UnreadCount

```typescript
interface UnreadCount {
  total: number;                 // Total não lidas
  by_category: {
    social: number;
    events: number;
    points: number;
    reservations: number;
    system: number;
  };
}
```

---

## 3. Telas

### 3.1 Central de Notificações

**Rota:** `/notifications`

**Descrição:** Lista principal de todas as notificações do usuário.

**Layout:**
```
┌─────────────────────────────────────┐
│  ←      Notificações        ⚙️ 🗑️  │
├─────────────────────────────────────┤
│  [Todas] [Social] [Eventos] [+2]   │
├─────────────────────────────────────┤
│                                     │
│  Hoje                               │
│  ┌─────────────────────────────────┐│
│  │ 👥 5 pessoas curtiram seu post  ││
│  │    "Treino de hoje foi..."  2m  ││
│  │    ● (não lida)                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📅 Lembrete: Corrida Matinal    ││
│  │    Amanhã às 6:00          30m  ││
│  └─────────────────────────────────┘│
│                                     │
│  Ontem                              │
│  ┌─────────────────────────────────┐│
│  │ 💬 João Silva enviou mensagem   ││
│  │    "Oi, tudo bem?"         1d   ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🏆 Você ganhou 50 pontos!       ││
│  │    Check-in no evento      1d   ││
│  └─────────────────────────────────┘│
│                                     │
│           (scroll infinito)         │
│                                     │
└─────────────────────────────────────┘
```

**Header:**
- Botão voltar
- Título "Notificações"
- Botão configurações (⚙️)
- Botão limpar todas (🗑️)

**Filtros:**
- Chips para filtrar por categoria
- "Todas" selecionada por padrão
- Scroll horizontal para mais categorias

**Lista:**
- Agrupada por data (Hoje, Ontem, Esta semana, etc.)
- Notificações agrupadas exibem contador
- Indicador visual para não lidas (●)
- Avatar/ícone à esquerda
- Título, preview, tempo à direita

**Comportamentos:**
- Pull-to-refresh
- Scroll infinito (máx 500)
- Tap: abre deep link ou expande grupo
- Swipe left: marcar como lida
- Swipe right: deletar
- Long press: menu de opções

---

### 3.2 Notificação Agrupada (Expandida)

**Rota:** `/notifications/group/:groupKey`

**Descrição:** Visualização expandida de notificações agrupadas.

**Layout:**
```
┌─────────────────────────────────────┐
│  ←   5 pessoas curtiram seu post   │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 👤 Maria Silva              2m  ││
│  │    curtiu seu post              ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 👤 João Santos              5m  ││
│  │    curtiu seu post              ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 👤 Ana Costa               10m  ││
│  │    curtiu seu post              ││
│  └─────────────────────────────────┘│
│                                     │
│  (mais 2 pessoas)                   │
│                                     │
├─────────────────────────────────────┤
│  [Ver post original]                │
└─────────────────────────────────────┘
```

---

### 3.3 Configurações de Notificações

**Rota:** `/notifications/settings`

**Descrição:** Configuração de preferências por categoria.

**Layout:**
```
┌─────────────────────────────────────┐
│  ←        Configurações             │
├─────────────────────────────────────┤
│                                     │
│  Não Perturbe                       │
│  ┌─────────────────────────────────┐│
│  │ Ativar modo silencioso    [OFF] ││
│  │ Configurar horário          →   ││
│  └─────────────────────────────────┘│
│                                     │
│  Notificações por Categoria         │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 💬 Social                       ││
│  │ Curtidas, comentários, menções  ││
│  │ Push [ON]    In-app [ON]        ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📅 Eventos                      ││
│  │ Lembretes, check-in, badges     ││
│  │ Push [ON]    In-app [ON]        ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🏆 Pontos                       ││
│  │ Ganhos, gastos, rankings        ││
│  │ Push [ON]    In-app [ON]        ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🏠 Reservas                     ││
│  │ Aprovações, lembretes           ││
│  │ Push [ON]    In-app [ON]        ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ ⚙️ Sistema                      ││
│  │ Mensagens, carteirinha          ││
│  │ Push [ON]    In-app [ON]        ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

---

### 3.4 Configuração Não Perturbe

**Rota:** `/notifications/settings/dnd`

**Descrição:** Configuração de horário de silêncio.

**Layout:**
```
┌─────────────────────────────────────┐
│  ←        Não Perturbe              │
├─────────────────────────────────────┤
│                                     │
│  Ativar                      [ON]   │
│                                     │
│  Horário                            │
│  ┌────────────┐ ┌────────────┐     │
│  │ Início     │ │ Fim        │     │
│  │   22:00    │ │   07:00    │     │
│  └────────────┘ └────────────┘     │
│                                     │
│  Dias da Semana                     │
│  ┌───┬───┬───┬───┬───┬───┬───┐     │
│  │ D │ S │ T │ Q │ Q │ S │ S │     │
│  │ ● │ ● │ ● │ ● │ ● │ ● │ ● │     │
│  └───┴───┴───┴───┴───┴───┴───┘     │
│                                     │
│  Durante este período, você não     │
│  receberá notificações push. As     │
│  notificações ainda aparecerão no   │
│  app quando você abrir.             │
│                                     │
└─────────────────────────────────────┘
```

---

### 3.5 Badge no Header (Dashboard)

**Localização:** Header do Dashboard

**Descrição:** Indicador de notificações não lidas.

**Layout:**
```
┌─────────────────────────────────────┐
│  🔔               A-hub        👤   │
│  [12]                               │
└─────────────────────────────────────┘
```

**Comportamentos:**
- Badge vermelho com contador (máx 99+)
- Tap: abre Central de Notificações
- Badge some quando todas são lidas
- Atualiza em tempo real via WebSocket

---

## 4. Fluxos

### 4.1 Receber Notificação

```
┌─────────────────────────────────────────────────────────────┐
│                   RECEBER NOTIFICAÇÃO                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Evento ocorre no sistema                                │
│     └─ Ex: Alguém curte um post                             │
│                                                             │
│  2. Backend cria Notification                               │
│     └─ Verifica categoria e tipo                            │
│     └─ Gera group_key se aplicável                          │
│                                                             │
│  3. Verifica configurações do usuário                       │
│     └─ Categoria habilitada?                                │
│     └─ Modo Não Perturbe ativo?                             │
│                                                             │
│  4. Se push habilitado E fora do DND:                       │
│     └─ Envia push notification (FCM/APNs)                   │
│     └─ Agrupa se houver notificações recentes               │
│                                                             │
│  5. Salva no banco de dados                                 │
│     └─ Mantém limite de 500 por usuário                     │
│     └─ Remove mais antigas se exceder                       │
│                                                             │
│  6. Envia via WebSocket                                     │
│     └─ notification.new                                     │
│     └─ Atualiza badge counter                               │
│                                                             │
│  7. App recebe e exibe                                      │
│     └─ Atualiza lista se estiver aberta                     │
│     └─ Atualiza badge no header                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Marcar como Lida

```
┌─────────────────────────────────────────────────────────────┐
│                   MARCAR COMO LIDA                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  OPÇÃO 1: Individual                                        │
│  └─ Swipe left na notificação                               │
│  └─ POST /notifications/:id/read                            │
│  └─ is_read = true                                          │
│                                                             │
│  OPÇÃO 2: Por Categoria                                     │
│  └─ Long press no chip de categoria                         │
│  └─ "Marcar todas como lidas"                               │
│  └─ POST /notifications/read-category/:category             │
│                                                             │
│  OPÇÃO 3: Todas                                             │
│  └─ Tap no botão 🗑️ no header                               │
│  └─ Confirma "Marcar todas como lidas?"                     │
│  └─ POST /notifications/read-all                            │
│                                                             │
│  Após qualquer opção:                                       │
│  └─ WebSocket: notification.read                            │
│  └─ Badge atualizado em tempo real                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Configurar Preferências

```
┌─────────────────────────────────────────────────────────────┐
│                CONFIGURAR PREFERÊNCIAS                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuário abre Configurações                              │
│     └─ GET /notifications/settings                          │
│     └─ Carrega config atual (5 categorias + DND)            │
│                                                             │
│  2. Altera toggle de categoria                              │
│     └─ PUT /notifications/settings/:category                │
│     └─ { push_enabled: true, in_app_enabled: false }        │
│                                                             │
│  3. Configura Não Perturbe                                  │
│     └─ PUT /notifications/dnd                               │
│     └─ { enabled, start_time, end_time, days_of_week }      │
│                                                             │
│  4. Mudanças aplicadas imediatamente                        │
│     └─ Próximas notificações seguem nova config             │
│     └─ DND verifica horário local do usuário                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Agrupamento de Notificações

```
┌─────────────────────────────────────────────────────────────┐
│                  AGRUPAMENTO (BATCHING)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Regras de Agrupamento:                                     │
│                                                             │
│  1. Mesmo tipo + mesmo alvo + janela de 1 hora              │
│     └─ Ex: Curtidas no mesmo post                           │
│     └─ group_key = "likes_post_{post_id}"                   │
│                                                             │
│  2. Tipos agrupáveis:                                       │
│     └─ NEW_LIKE (mesmo post)                                │
│     └─ NEW_COMMENT (mesmo post)                             │
│     └─ NEW_FOLLOWER (últimos seguidores)                    │
│     └─ STORY_VIEW (mesma story)                             │
│                                                             │
│  3. Exibição agrupada:                                      │
│     └─ "5 pessoas curtiram seu post"                        │
│     └─ Mostra avatares dos primeiros 3                      │
│     └─ Tap expande para ver todos                           │
│                                                             │
│  4. Push agrupado:                                          │
│     └─ Se 2+ notificações em 5min                           │
│     └─ Agrupa em um único push                              │
│     └─ "3 novas interações no seu post"                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Componentes

### NotificationCenter

```
Props:
- notifications: Notification[] | NotificationGroup[]
- filter: NotificationCategory | "all"
- onFilterChange: (category) => void
- onNotificationPress: (notification) => void
- onMarkAsRead: (id) => void
- onDelete: (id) => void
- onRefresh: () => void
- isLoading: boolean
```

### NotificationItem

```
Props:
- notification: Notification
- isGrouped: boolean
- groupCount?: number
- onPress: () => void
- onSwipeLeft: () => void  // Marcar como lida
- onSwipeRight: () => void // Deletar
```

### NotificationGroupItem

```
Props:
- group: NotificationGroup
- onPress: () => void
- onExpand: () => void
```

### CategoryFilter

```
Props:
- categories: NotificationCategory[]
- selected: NotificationCategory | "all"
- unreadCounts: Record<NotificationCategory, number>
- onChange: (category) => void
```

### NotificationBadge

```
Props:
- count: number
- maxDisplay: 99
- onPress: () => void
```

### SettingsToggle

```
Props:
- category: NotificationCategory
- pushEnabled: boolean
- inAppEnabled: boolean
- onPushChange: (enabled) => void
- onInAppChange: (enabled) => void
```

### DoNotDisturbConfig

```
Props:
- settings: DoNotDisturb
- onSave: (settings) => void
```

### TimePicker

```
Props:
- value: string  // HH:mm
- onChange: (time) => void
- label: string
```

### DaySelector

```
Props:
- selected: number[]  // 0-6
- onChange: (days) => void
```

---

## 6. Real-time

### WebSocket

**Conexão:** `wss://api.ahub.com.br/v1/ws/notifications`

**Autenticação:** Token JWT no handshake

### Eventos

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `notification.new` | Server → Client | Nova notificação recebida |
| `notification.read` | Server → Client | Notificação marcada como lida |
| `notification.deleted` | Server → Client | Notificação deletada |
| `unread_count.update` | Server → Client | Contador de não lidas atualizado |
| `settings.changed` | Server → Client | Configurações alteradas |

### Payloads

**notification.new:**
```json
{
  "event": "notification.new",
  "data": {
    "notification": {
      "id": "uuid",
      "type": "new_like",
      "category": "social",
      "title": "Maria curtiu seu post",
      "body": "Treino de hoje...",
      "image_url": "https://...",
      "action_url": "/posts/123",
      "group_key": "likes_post_123",
      "created_at": "2026-01-26T14:30:00Z"
    },
    "unread_count": {
      "total": 12,
      "by_category": {
        "social": 5,
        "events": 3,
        "points": 2,
        "reservations": 1,
        "system": 1
      }
    }
  }
}
```

**unread_count.update:**
```json
{
  "event": "unread_count.update",
  "data": {
    "total": 10,
    "by_category": {
      "social": 4,
      "events": 3,
      "points": 2,
      "reservations": 0,
      "system": 1
    }
  }
}
```

---

## 7. Offline

### Comportamento

| Funcionalidade | Offline | Online |
|----------------|---------|--------|
| Push Notifications | Funciona (via FCM/APNs) | Funciona |
| Lista de Notificações | Cache local | Sync com servidor |
| Marcar como Lida | Enfileira | Envia imediatamente |
| Configurações | Somente leitura | Editável |

### Cache Local

- Lista de notificações cacheada no dispositivo
- Máximo 100 notificações no cache offline
- Sincronização ao reconectar

### Sincronização

Ao reconectar:
1. Busca notificações mais recentes
2. Envia ações pendentes (marcar como lida)
3. Atualiza contador de não lidas
4. Reconcilia com cache local

---

## 8. Push Notifications

### Provedores

| Plataforma | Provedor |
|------------|----------|
| iOS | APNs (Apple Push Notification service) |
| Android | FCM (Firebase Cloud Messaging) |

### Payload

**iOS (APNs):**
```json
{
  "aps": {
    "alert": {
      "title": "Maria curtiu seu post",
      "body": "Treino de hoje..."
    },
    "badge": 12,
    "sound": "default",
    "category": "SOCIAL"
  },
  "data": {
    "notification_id": "uuid",
    "type": "new_like",
    "action_url": "/posts/123"
  }
}
```

**Android (FCM):**
```json
{
  "notification": {
    "title": "Maria curtiu seu post",
    "body": "Treino de hoje...",
    "icon": "ic_notification",
    "click_action": "OPEN_NOTIFICATION"
  },
  "data": {
    "notification_id": "uuid",
    "type": "new_like",
    "category": "social",
    "action_url": "/posts/123"
  }
}
```

### Agrupamento de Push

Quando múltiplas notificações em curto período:
- iOS: Usa thread-id para agrupar
- Android: Usa notification group

**Exemplo agrupado:**
```
┌─────────────────────────────────────┐
│ A-hub                               │
│ 3 novas interações                  │
│ Maria, João e Ana curtiram seu post │
└─────────────────────────────────────┘
```

### Deep Links

| Tipo | Action URL |
|------|------------|
| NEW_LIKE | `/posts/:postId` |
| NEW_COMMENT | `/posts/:postId/comments` |
| NEW_EVENT | `/events/:eventId` |
| NEW_MESSAGE | `/messages/:conversationId` |
| BADGE_EARNED | `/profile/badges` |
| POINTS_RECEIVED | `/wallet` |
| RESERVATION_APPROVED | `/reservations/:id` |

---

## Relacionados

- [API](api.md) - Endpoints
- [Critérios de Aceitação](acceptance-criteria.md) - Checklist
- [Dashboard](../01-dashboard/) - Badge no header
- [Eventos](../04-eventos/) - Notificações de eventos
- [Mensagens](../08-mensagens/) - Notificações de chat
- [Sistema de Pontos](../06-sistema-pontos/) - Notificações de pontos
