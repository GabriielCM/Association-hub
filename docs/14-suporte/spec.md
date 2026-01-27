---
module: suporte
document: spec
status: complete
priority: phase2
last_updated: 2026-01-26
---

# Suporte - Especificação

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Modelo de Dados](#2-modelo-de-dados)
3. [Telas](#3-telas)
4. [Fluxos](#4-fluxos)
5. [Componentes](#5-componentes)
6. [Real-time](#6-real-time)
7. [Erros Automáticos](#7-erros-automáticos)
8. [Notificações](#8-notificações)

---

## 1. Visão Geral

### Objetivo

Sistema de suporte para comunicação entre usuários e equipe de atendimento, com tickets categorizados, chat em tempo real, FAQ básico e captura automática de erros.

### Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| Tickets | Abertura de chamados categorizados (Bug, Sugestão, Dúvida) |
| Chat ao Vivo | Atendimento em tempo real 24/7 com fila de espera |
| FAQ | Perguntas frequentes para autoatendimento |
| Anexos | Até 5 arquivos por mensagem (imagem, vídeo, documento) |
| Avaliação | Rating 1-5 estrelas + comentário após resolução |
| Erros Automáticos | Ticket criado automaticamente em crash/erro grave |

### Restrições

- Tickets não possuem níveis de prioridade (todos são tratados igualmente)
- Não há integração com sistema de pontos
- Categorias de ticket são fixas (não customizáveis pelo ADM)
- Sem métricas avançadas no painel ADM (apenas lista com filtros)

---

## 2. Modelo de Dados

### Ticket

```typescript
interface Ticket {
  id: string;                    // UUID
  user_id: string;               // UUID do usuário
  category: "bug" | "suggestion" | "question";
  subject: string;               // Assunto (min 5 caracteres)
  description: string;           // Descrição (min 20 caracteres)
  status: "open" | "in_progress" | "resolved" | "closed";
  attachments: Attachment[];     // Anexos do ticket inicial
  is_automatic: boolean;         // Criado automaticamente por crash
  device_info?: DeviceInfo;      // Info do dispositivo (se automático)
  rating?: TicketRating;         // Avaliação do atendimento
  created_at: string;            // ISO 8601
  updated_at: string;            // ISO 8601
  resolved_at?: string;          // ISO 8601
}
```

### TicketMessage

```typescript
interface TicketMessage {
  id: string;                    // UUID
  ticket_id: string;             // UUID do ticket
  sender_type: "user" | "support";
  sender_id: string;             // UUID do usuário ou atendente
  content: string;               // Conteúdo da mensagem
  attachments: Attachment[];     // Anexos da mensagem
  created_at: string;            // ISO 8601
}
```

### Attachment

```typescript
interface Attachment {
  id: string;                    // UUID
  type: "image" | "video" | "document";
  url: string;                   // URL do arquivo
  filename: string;              // Nome original
  size_bytes: number;            // Tamanho em bytes (max 10MB)
  mime_type: string;             // Tipo MIME
}
```

### FAQItem

```typescript
interface FAQItem {
  id: string;                    // UUID
  question: string;              // Pergunta
  answer: string;                // Resposta (suporta Markdown)
  category: string;              // Categoria da pergunta
  order: number;                 // Ordem de exibição
  is_active: boolean;            // Ativo/inativo
  created_at: string;            // ISO 8601
  updated_at: string;            // ISO 8601
}
```

### TicketRating

```typescript
interface TicketRating {
  ticket_id: string;             // UUID do ticket
  rating: 1 | 2 | 3 | 4 | 5;     // Rating de 1 a 5 estrelas
  comment?: string;              // Comentário opcional (max 500 caracteres)
  created_at: string;            // ISO 8601
}
```

### DeviceInfo

```typescript
interface DeviceInfo {
  platform: "ios" | "android";   // Plataforma
  os_version: string;            // Versão do SO
  app_version: string;           // Versão do app
  device_model: string;          // Modelo do dispositivo
  stack_trace?: string;          // Stack trace do erro
}
```

### ChatSession

```typescript
interface ChatSession {
  id: string;                    // UUID
  user_id: string;               // UUID do usuário
  agent_id?: string;             // UUID do atendente (quando conectado)
  status: "queued" | "active" | "ended";
  queue_position?: number;       // Posição na fila (se queued)
  started_at?: string;           // Quando conectou com atendente
  ended_at?: string;             // Quando encerrou
  created_at: string;            // ISO 8601
}
```

### ChatMessage

```typescript
interface ChatMessage {
  id: string;                    // UUID
  session_id: string;            // UUID da sessão
  sender_type: "user" | "agent";
  sender_id: string;             // UUID
  content: string;               // Conteúdo
  attachments: Attachment[];     // Anexos
  created_at: string;            // ISO 8601
}
```

---

## 3. Telas

### 3.1 Central de Suporte

**Rota:** `/support`

**Descrição:** Tela principal do módulo de suporte com acesso a FAQ, tickets e chat.

**Layout:**
```
┌─────────────────────────────────────┐
│  ←              Suporte             │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │  ❓ Perguntas Frequentes        ││
│  │  Encontre respostas rápidas     ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  💬 Chat ao Vivo          ● 24h ││
│  │  Fale com nossa equipe          ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  📝 Abrir Ticket                ││
│  │  Reporte bugs ou dê sugestões   ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  Meus Tickets                   Ver │
│  ├─ 🟢 Pedido de recurso    Ontem  │
│  ├─ 🟡 Bug no login        12/01   │
│  └─ ⚪ Dúvida sobre...     10/01   │
│                                     │
└─────────────────────────────────────┘
```

**Elementos:**
- Botão voltar no header
- Card FAQ (acesso às perguntas frequentes)
- Card Chat ao Vivo (com indicador 24h disponível)
- Card Abrir Ticket
- Lista resumida dos últimos tickets do usuário
- Badge de status em cada ticket (🟢 resolvido, 🟡 em andamento, ⚪ aberto)

**Comportamentos:**
- Tap em FAQ: navega para `/support/faq`
- Tap em Chat: navega para `/support/chat`
- Tap em Abrir Ticket: navega para `/support/tickets/new`
- Tap em ticket: abre detalhes `/support/tickets/:id`
- Tap em "Ver": lista completa de tickets

---

### 3.2 FAQ

**Rota:** `/support/faq`

**Descrição:** Lista de perguntas frequentes em formato accordion.

**Layout:**
```
┌─────────────────────────────────────┐
│  ←         Perguntas Frequentes     │
├─────────────────────────────────────┤
│  🔍 Buscar pergunta...              │
├─────────────────────────────────────┤
│                                     │
│  Como faço para...                  │
│  ┌─────────────────────────────────┐│
│  │ Como altero minha senha?       ▼││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ Como funciona o sistema de...  ▼││
│  └─────────────────────────────────┘│
│                                     │
│  Sobre a associação                 │
│  ┌─────────────────────────────────┐│
│  │ Quais são os benefícios?       ▼││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ Horário de funcionamento?      ▶││
│  │─────────────────────────────────││
│  │ A sede funciona de segunda a   ││
│  │ sexta, das 8h às 22h, e aos    ││
│  │ sábados das 8h às 18h.         ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  Não encontrou sua resposta?        │
│  [Abrir um Ticket]                  │
└─────────────────────────────────────┘
```

**Elementos:**
- Campo de busca no topo
- Perguntas agrupadas por categoria
- Cada item é um accordion (expandir/contrair)
- Resposta suporta formatação Markdown
- CTA para abrir ticket se não encontrar resposta

**Comportamentos:**
- Busca filtra perguntas em tempo real
- Tap na pergunta expande/contrai resposta
- Apenas uma resposta expandida por vez
- Tap em "Abrir um Ticket": navega para `/support/tickets/new`

---

### 3.3 Novo Ticket

**Rota:** `/support/tickets/new`

**Descrição:** Formulário para criar novo ticket.

**Layout:**
```
┌─────────────────────────────────────┐
│  ←           Novo Ticket            │
├─────────────────────────────────────┤
│                                     │
│  Categoria *                        │
│  ┌─────────────────────────────────┐│
│  │ ○ 🐛 Reportar Bug               ││
│  │ ○ 💡 Sugestão de Melhoria       ││
│  │ ○ ❓ Dúvida                     ││
│  └─────────────────────────────────┘│
│                                     │
│  Assunto *                          │
│  ┌─────────────────────────────────┐│
│  │ Descreva brevemente...          ││
│  └─────────────────────────────────┘│
│                                     │
│  Descrição *                        │
│  ┌─────────────────────────────────┐│
│  │ Explique em detalhes o que      ││
│  │ aconteceu ou o que você         ││
│  │ gostaria...                     ││
│  │                                 ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  Anexos (opcional)                  │
│  ┌────┐ ┌────┐ ┌────┐              │
│  │ 📷 │ │ 🎬 │ │ +  │  Até 5       │
│  └────┘ └────┘ └────┘  arquivos    │
│                                     │
├─────────────────────────────────────┤
│         [Enviar Ticket]             │
└─────────────────────────────────────┘
```

**Elementos:**
- Radio buttons para categoria (obrigatório)
- Campo assunto (obrigatório, min 5 caracteres)
- Campo descrição (obrigatório, min 20 caracteres)
- Área de anexos (opcional, até 5 arquivos, max 10MB cada)
- Preview de anexos adicionados
- Botão enviar

**Comportamentos:**
- Validação em tempo real dos campos
- Tap em anexo existente: visualiza ou remove
- Tap em "+": abre picker (câmera, galeria, arquivos)
- Ao enviar: ticket criado com status "open"
- Após sucesso: redireciona para detalhes do ticket

---

### 3.4 Lista de Tickets

**Rota:** `/support/tickets`

**Descrição:** Lista completa de tickets do usuário.

**Layout:**
```
┌─────────────────────────────────────┐
│  ←          Meus Tickets            │
├─────────────────────────────────────┤
│  Filtrar:  [Todos ▼]                │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🟢 Pedido de recurso        💬3 ││
│  │ Sugestão • Resolvido • Ontem    ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🟡 Bug no login             💬5 ││
│  │ Bug • Em andamento • 12/01      ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ ⚪ Dúvida sobre pontos      💬2 ││
│  │ Dúvida • Aberto • 10/01         ││
│  └─────────────────────────────────┘│
│                                     │
│                                     │
│  Estado vazio:                      │
│  "Você ainda não abriu nenhum       │
│   ticket. Podemos ajudar?"          │
│  [Abrir Ticket]                     │
│                                     │
└─────────────────────────────────────┘
│         [+ Novo Ticket]             │
└─────────────────────────────────────┘
```

**Elementos:**
- Dropdown de filtro por status (Todos, Abertos, Em andamento, Resolvidos)
- Lista de tickets ordenados por data (mais recente primeiro)
- Cada card exibe: status badge, assunto, categoria, status texto, data, contador de mensagens
- FAB para criar novo ticket
- Estado vazio com CTA

**Comportamentos:**
- Tap no card: abre detalhes `/support/tickets/:id`
- Filtro persiste durante navegação
- Pull-to-refresh

---

### 3.5 Detalhes do Ticket

**Rota:** `/support/tickets/:id`

**Descrição:** Visualização e interação com ticket específico.

**Layout:**
```
┌─────────────────────────────────────┐
│  ←  #TKT-123 Bug no login           │
├─────────────────────────────────────┤
│  Status: 🟡 Em andamento            │
│  Criado: 12/01/2026 às 14:30        │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 👤 Você              12/01 14:30││
│  │─────────────────────────────────││
│  │ O app fecha quando tento fazer  ││
│  │ login com minha conta...        ││
│  │                                 ││
│  │ 📎 screenshot.png               ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🎧 Suporte          12/01 15:45 ││
│  │─────────────────────────────────││
│  │ Olá! Obrigado pelo contato.     ││
│  │ Poderia informar a versão do    ││
│  │ seu aplicativo?                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 👤 Você              12/01 16:00││
│  │─────────────────────────────────││
│  │ Versão 2.1.0                    ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  📎  │ Digite sua mensagem...  │ ➤ │
└─────────────────────────────────────┘
```

**Elementos:**
- Header com código e assunto do ticket
- Badge de status e data de criação
- Timeline de mensagens (usuário e suporte)
- Anexos clicáveis em cada mensagem
- Campo de input para nova mensagem
- Botão de anexar arquivo
- Botão enviar

**Se ticket resolvido - Modal de Avaliação:**
```
┌─────────────────────────────────────┐
│                                     │
│      Seu ticket foi resolvido!      │
│                                     │
│    Como foi o atendimento?          │
│                                     │
│         ☆ ☆ ☆ ☆ ☆                   │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Comentário (opcional)           ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  [Enviar Avaliação]                 │
│                                     │
│  Pular                              │
└─────────────────────────────────────┘
```

**Comportamentos:**
- Timeline cronológica de mensagens
- Tap em anexo: abre visualização
- Nova mensagem reabre ticket se estava resolvido
- Scroll automático para nova mensagem
- Modal de avaliação aparece quando status muda para "resolved"
- Usuário pode pular avaliação

---

### 3.6 Chat ao Vivo

**Rota:** `/support/chat`

**Descrição:** Chat em tempo real com equipe de suporte.

**Layout (Na fila):**
```
┌─────────────────────────────────────┐
│  ←           Chat ao Vivo           │
├─────────────────────────────────────┤
│                                     │
│                                     │
│                                     │
│            ⏳                        │
│                                     │
│     Aguardando atendimento          │
│                                     │
│     Posição na fila: 3              │
│                                     │
│     Tempo estimado: ~5 min          │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│         [Cancelar]                  │
└─────────────────────────────────────┘
```

**Layout (Conectado):**
```
┌─────────────────────────────────────┐
│  ←  🟢 Maria - Suporte              │
├─────────────────────────────────────┤
│                                     │
│        ┌─────────────────┐          │
│        │ Olá! Como posso │ 14:30    │
│        │ ajudar?         │          │
│        └─────────────────┘          │
│                                     │
│  ┌─────────────────────┐            │
│  │ Oi, estou com um    │ 14:31     │
│  │ problema no app...  │            │
│  └─────────────────────┘            │
│                                     │
│        ┌─────────────────┐          │
│        │ Entendi! Pode   │ 14:31    │
│        │ me explicar...  │          │
│        └─────────────────┘          │
│                                     │
│                    digitando...     │
├─────────────────────────────────────┤
│  📎  │ Digite sua mensagem...  │ ➤ │
└─────────────────────────────────────┘
```

**Elementos:**
- Header com status do atendente
- Área de mensagens (similar ao chat do módulo Mensagens)
- Indicador "digitando" do atendente
- Campo de input + anexos + enviar

**Comportamentos:**
- Posição na fila atualizada em tempo real
- Notificação push quando conectado ao atendente
- Mensagens em tempo real via WebSocket
- Ao encerrar: modal de avaliação
- Se app fechado enquanto na fila: mantém posição por 2 minutos

---

### 3.7 Painel ADM - Lista de Tickets

**Rota:** `/admin/support/tickets`

**Descrição:** Gerenciamento de tickets pela equipe de suporte.

**Layout:**
```
┌─────────────────────────────────────┐
│  ←       Tickets de Suporte         │
├─────────────────────────────────────┤
│  🔍 Buscar usuário ou assunto...    │
├─────────────────────────────────────┤
│  Status: [Todos ▼]  Cat: [Todas ▼]  │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │ ⚪ #TKT-125                      ││
│  │ Bug no checkout                 ││
│  │ João Silva • Bug • 2h atrás     ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🟡 #TKT-124                      ││
│  │ Sugestão de dark mode           ││
│  │ Maria Costa • Sugestão • 5h     ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🤖 #TKT-123 (Auto)              ││
│  │ Crash Report                    ││
│  │ Pedro Lima • Bug • Ontem        ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**Elementos:**
- Campo de busca (usuário ou assunto)
- Filtros: status e categoria
- Lista de tickets com informações do usuário
- Badge "Auto" para tickets automáticos

**Comportamentos:**
- Tap no card: abre detalhes ADM
- Ordenação por data (mais antigos com status aberto primeiro)

---

### 3.8 Painel ADM - Detalhes do Ticket

**Rota:** `/admin/support/tickets/:id`

**Descrição:** Visualização detalhada e resposta a tickets.

**Layout:**
```
┌─────────────────────────────────────┐
│  ←  #TKT-123                        │
├─────────────────────────────────────┤
│  Usuário: João Silva                │
│  Email: joao@email.com              │
│  Membro desde: 15/03/2025           │
├─────────────────────────────────────┤
│  Status: [Em andamento ▼]           │
├─────────────────────────────────────┤
│                                     │
│  (Timeline de mensagens)            │
│                                     │
│  Se automático:                     │
│  ┌─────────────────────────────────┐│
│  │ 📱 Informações do Dispositivo   ││
│  │─────────────────────────────────││
│  │ Plataforma: Android             ││
│  │ Versão SO: 14.0                 ││
│  │ Versão App: 2.1.0               ││
│  │ Modelo: Samsung S23             ││
│  │ [Ver Stack Trace]               ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  📎  │ Responder ticket...     │ ➤ │
└─────────────────────────────────────┘
```

**Elementos:**
- Informações do usuário
- Dropdown para alterar status
- Timeline de mensagens
- Seção expandível com device info (se ticket automático)
- Campo para responder

**Comportamentos:**
- Alterar status notifica usuário
- Marcar como "resolved" dispara avaliação para usuário

---

### 3.9 Painel ADM - FAQ

**Rota:** `/admin/support/faq`

**Descrição:** Gerenciamento de perguntas frequentes.

**Layout:**
```
┌─────────────────────────────────────┐
│  ←              FAQ                 │
├─────────────────────────────────────┤
│                                     │
│  Categoria: Conta                   │
│  ┌─────────────────────────────────┐│
│  │ ≡ Como altero minha senha?  ✏️ ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ ≡ Como excluo minha conta?  ✏️ ││
│  └─────────────────────────────────┘│
│                                     │
│  Categoria: Pontos                  │
│  ┌─────────────────────────────────┐│
│  │ ≡ Como ganho pontos?        ✏️ ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
│         [+ Nova Pergunta]           │
└─────────────────────────────────────┘
```

**Elementos:**
- Lista agrupada por categoria
- Handle para reordenar (drag and drop)
- Botão editar em cada item
- FAB para nova pergunta

**Comportamentos:**
- Drag and drop para reordenar
- Tap em editar: abre modal de edição
- Nova pergunta: modal com campos

---

### 3.10 Painel ADM - Chat Queue

**Rota:** `/admin/support/chat`

**Descrição:** Fila de chat e atendimentos ativos.

**Layout:**
```
┌─────────────────────────────────────┐
│  ←         Chat ao Vivo             │
├─────────────────────────────────────┤
│  Fila de Espera (3)                 │
│  ┌─────────────────────────────────┐│
│  │ João Silva        aguardando 5m ││
│  │ [Atender]                       ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ Maria Costa       aguardando 2m ││
│  │ [Atender]                       ││
│  └─────────────────────────────────┘│
│                                     │
│  Meus Atendimentos (1)              │
│  ┌─────────────────────────────────┐│
│  │ 🟢 Pedro Lima       ativo 10m   ││
│  │ [Continuar]                     ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**Elementos:**
- Seção fila de espera com tempo de espera
- Botão atender
- Seção atendimentos ativos
- Botão continuar

---

## 4. Fluxos

### 4.1 Criar Ticket Manual

```
┌─────────────────────────────────────────────────────────────┐
│                   CRIAR TICKET MANUAL                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuário acessa Central de Suporte                       │
│     └─ Tap em "Abrir Ticket"                                │
│                                                             │
│  2. Preenche formulário                                     │
│     └─ Seleciona categoria (Bug/Sugestão/Dúvida)            │
│     └─ Digita assunto (min 5 caracteres)                    │
│     └─ Digita descrição (min 20 caracteres)                 │
│     └─ Anexa arquivos (opcional, até 5)                     │
│                                                             │
│  3. Envia ticket                                            │
│     └─ POST /support/tickets                                │
│     └─ Ticket criado com status "open"                      │
│     └─ is_automatic = false                                 │
│                                                             │
│  4. Feedback ao usuário                                     │
│     └─ Toast "Ticket criado com sucesso"                    │
│     └─ Redireciona para detalhes do ticket                  │
│                                                             │
│  5. Notificação para equipe                                 │
│     └─ Equipe de suporte recebe alerta                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Ticket Automático (Crash)

```
┌─────────────────────────────────────────────────────────────┐
│                   TICKET AUTOMÁTICO (CRASH)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. App detecta crash ou erro grave                         │
│     └─ Exception não tratada                                │
│     └─ Erro de rede crítico                                 │
│                                                             │
│  2. Captura informações do dispositivo                      │
│     └─ Stack trace do erro                                  │
│     └─ Plataforma (iOS/Android)                             │
│     └─ Versão do SO                                         │
│     └─ Versão do app                                        │
│     └─ Modelo do dispositivo                                │
│                                                             │
│  3. Cria ticket automaticamente                             │
│     └─ POST /support/tickets/automatic                      │
│     └─ category = "bug"                                     │
│     └─ is_automatic = true                                  │
│     └─ device_info preenchido                               │
│                                                             │
│  4. Na próxima abertura do app                              │
│     └─ Banner discreto informando o ticket                  │
│     └─ "Detectamos um problema. Ticket #123 criado."        │
│     └─ Tap: abre ticket para adicionar contexto             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Chat ao Vivo

```
┌─────────────────────────────────────────────────────────────┐
│                      CHAT AO VIVO                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuário inicia chat                                     │
│     └─ Tap em "Chat ao Vivo"                                │
│     └─ POST /support/chat/connect                           │
│     └─ Recebe session_id e queue_position                   │
│                                                             │
│  2. Aguarda na fila                                         │
│     └─ Tela de espera com posição                           │
│     └─ Posição atualizada via WebSocket                     │
│     └─ Pode cancelar a qualquer momento                     │
│                                                             │
│  3. Atendente aceita chat                                   │
│     └─ Push notification para usuário                       │
│     └─ Tela muda para chat ativo                            │
│     └─ WebSocket: chat.connected                            │
│                                                             │
│  4. Conversa em tempo real                                  │
│     └─ Mensagens via WebSocket                              │
│     └─ Pode enviar anexos                                   │
│     └─ Indicador "digitando" funcional                      │
│                                                             │
│  5. Encerramento                                            │
│     └─ Atendente ou usuário encerra                         │
│     └─ WebSocket: chat.ended                                │
│     └─ Modal de avaliação aparece                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Resolução e Avaliação

```
┌─────────────────────────────────────────────────────────────┐
│                  RESOLUÇÃO E AVALIAÇÃO                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Suporte marca ticket como resolvido                     │
│     └─ PATCH /support/tickets/:id { status: "resolved" }    │
│                                                             │
│  2. Usuário é notificado                                    │
│     └─ Push notification                                    │
│     └─ Badge in-app                                         │
│                                                             │
│  3. Usuário abre ticket                                     │
│     └─ Modal de avaliação exibido                           │
│     └─ Rating 1-5 estrelas (obrigatório)                    │
│     └─ Comentário (opcional, max 500 chars)                 │
│                                                             │
│  4. Usuário avalia                                          │
│     └─ POST /support/tickets/:id/rating                     │
│     └─ Status muda para "closed"                            │
│     └─ Toast "Obrigado pelo feedback!"                      │
│                                                             │
│  OU                                                         │
│                                                             │
│  4. Usuário pula avaliação                                  │
│     └─ Modal fechado                                        │
│     └─ Status permanece "resolved"                          │
│     └─ Pode avaliar depois                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Componentes

### SupportHome

```
Props:
- recentTickets: Ticket[]    // Últimos tickets do usuário
- onFAQPress: () => void
- onChatPress: () => void
- onNewTicketPress: () => void
- onTicketPress: (id) => void
```

### FAQList

```
Props:
- items: FAQItem[]
- searchQuery: string
- onSearchChange: (query) => void
- onItemPress: (id) => void
```

### FAQAccordion

```
Props:
- item: FAQItem
- isExpanded: boolean
- onToggle: () => void
```

### TicketForm

```
Props:
- onSubmit: (data) => void
- isLoading: boolean
```

### TicketList

```
Props:
- tickets: Ticket[]
- filter: TicketStatus | "all"
- onFilterChange: (filter) => void
- onTicketPress: (id) => void
```

### TicketCard

```
Props:
- ticket: Ticket
- onPress: () => void
```

### TicketDetail

```
Props:
- ticket: Ticket
- messages: TicketMessage[]
- onSendMessage: (content, attachments) => void
- onResolve: () => void
```

### TicketMessage

```
Props:
- message: TicketMessage
- isOwn: boolean
- onAttachmentPress: (attachment) => void
```

### AttachmentPicker

```
Props:
- attachments: Attachment[]
- maxCount: 5
- maxSize: 10MB
- onAdd: (files) => void
- onRemove: (id) => void
```

### AttachmentPreview

```
Props:
- attachment: Attachment
- onPress: () => void
- onRemove?: () => void
```

### LiveChat

```
Props:
- session: ChatSession
- messages: ChatMessage[]
- isTyping: boolean
- onSendMessage: (content, attachments) => void
- onEnd: () => void
```

### QueueIndicator

```
Props:
- position: number
- estimatedTime?: number
- onCancel: () => void
```

### RatingModal

```
Props:
- visible: boolean
- onSubmit: (rating, comment) => void
- onSkip: () => void
```

### StarRating

```
Props:
- value: number
- onChange: (value) => void
- size: "small" | "medium" | "large"
```

---

## 6. Real-time

### WebSocket

**Conexão:** `wss://api.ahub.com.br/v1/ws/support`

**Autenticação:** Token JWT no handshake

### Eventos - Tickets

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `ticket.updated` | Server → Client | Ticket atualizado (status) |
| `ticket.message` | Server → Client | Nova mensagem no ticket |

### Eventos - Chat

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `chat.connected` | Server → Client | Conectado ao atendente |
| `chat.message` | Bidirecional | Nova mensagem no chat |
| `chat.typing` | Bidirecional | Indicador "digitando" |
| `chat.ended` | Server → Client | Chat encerrado |
| `queue.position` | Server → Client | Posição na fila atualizada |

### Payloads

**ticket.updated:**
```json
{
  "event": "ticket.updated",
  "data": {
    "ticket_id": "uuid",
    "status": "resolved",
    "updated_at": "2026-01-26T14:30:00Z"
  }
}
```

**ticket.message:**
```json
{
  "event": "ticket.message",
  "data": {
    "ticket_id": "uuid",
    "message": {
      "id": "uuid",
      "sender_type": "support",
      "content": "Olá, como posso ajudar?",
      "created_at": "2026-01-26T14:30:00Z"
    }
  }
}
```

**chat.message:**
```json
{
  "event": "chat.message",
  "data": {
    "session_id": "uuid",
    "message": {
      "id": "uuid",
      "sender_type": "agent",
      "content": "Como posso ajudar?",
      "created_at": "2026-01-26T14:30:00Z"
    }
  }
}
```

**queue.position:**
```json
{
  "event": "queue.position",
  "data": {
    "session_id": "uuid",
    "position": 2,
    "estimated_minutes": 3
  }
}
```

---

## 7. Erros Automáticos

### Captura de Erros

O sistema captura automaticamente:

| Tipo | Descrição |
|------|-----------|
| Crash | App fecha inesperadamente |
| Exception | Exceção não tratada |
| Network Error | Erro de rede crítico (timeout em APIs essenciais) |

### Informações Coletadas

| Campo | Descrição |
|-------|-----------|
| `platform` | iOS ou Android |
| `os_version` | Versão do sistema operacional |
| `app_version` | Versão do aplicativo |
| `device_model` | Modelo do dispositivo |
| `stack_trace` | Stack trace do erro |

### Comportamento

1. Erro detectado → Informações salvas localmente
2. Na próxima abertura → POST para criar ticket
3. Banner discreto informando o usuário
4. Usuário pode adicionar contexto ao ticket

### Limites

- Máximo 1 ticket automático por tipo de erro por dia
- Stack trace limitado a 10KB
- Não cria ticket se usuário desativou nas configurações

---

## 8. Notificações

### Tipos de Notificação

| Tipo | Trigger | Canal |
|------|---------|-------|
| Ticket criado | Confirmação ao criar | Push + In-app |
| Nova resposta | Suporte responde ticket | Push + In-app |
| Ticket resolvido | Status → resolved | Push + In-app |
| Chat conectado | Atendente aceita chat | Push + In-app |
| Nova mensagem chat | Mensagem no chat ao vivo | Push + In-app |

### Conteúdo

**Ticket criado:**
```
Título: Ticket criado
Corpo: Seu ticket #TKT-123 foi criado. Responderemos em breve!
```

**Nova resposta:**
```
Título: Nova resposta no ticket
Corpo: A equipe de suporte respondeu seu ticket #TKT-123
```

**Ticket resolvido:**
```
Título: Ticket resolvido
Corpo: Seu ticket #TKT-123 foi resolvido. Avalie o atendimento!
```

**Chat conectado:**
```
Título: Chat ao vivo
Corpo: Um atendente está pronto para ajudá-lo!
```

---

## Relacionados

- [API](api.md) - Endpoints
- [Critérios de Aceitação](acceptance-criteria.md) - Checklist
- [Mensagens](../08-mensagens/) - Componentes de chat reutilizados
- [Notificações](../07-notificacoes/) - Sistema de push
- [Perfil](../02-perfil/) - Link para suporte
