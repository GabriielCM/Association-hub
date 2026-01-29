---
module: rankings
document: spec
status: complete
priority: phase2
last_updated: 2026-01-28
---

# Rankings - Especificação

[← Voltar](README.md)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Categorias de Ranking](#2-categorias-de-ranking)
3. [Períodos](#3-períodos)
4. [Modelo de Dados](#4-modelo-de-dados)
5. [Interface do Usuário](#5-interface-do-usuário)
6. [Sistema de Badges](#6-sistema-de-badges)
7. [Integração com Perfil](#7-integração-com-perfil)
8. [Configuração ADM](#8-configuração-adm)
9. [Atualização em Tempo Real](#9-atualização-em-tempo-real)
10. [Performance](#10-performance)

---

## 1. Visão Geral

### 1.1 Objetivo

Classificar usuários em leaderboards com base na origem dos pontos acumulados, incentivando engajamento em diferentes atividades da associação.

### 1.2 Prioridade e Status

- **Prioridade:** 🟡 Fase 2
- **Status:** 🟢 Concluído

### 1.3 Usuários

| Tipo | Acesso |
|------|--------|
| Common User | Visualizar rankings, ver própria posição, histórico |
| ADM | Configurar badges, ativar/desativar categorias |

---

## 2. Categorias de Ranking

### 2.1 Ranking de Posts

| Atributo | Valor |
|----------|-------|
| **ID** | `posts` |
| **Fonte** | Transações com `source: daily_post` |
| **Métrica** | Soma de pontos ganhos com posts |
| **Descrição** | Ranking baseado em pontos do primeiro post do dia |

**Regra:** Apenas transações do tipo `credit` com source `daily_post` são contabilizadas.

### 2.2 Ranking de Eventos

| Atributo | Valor |
|----------|-------|
| **ID** | `events` |
| **Fonte** | Transações com `source: event_checkin` |
| **Métrica** | Soma de pontos ganhos com check-ins |
| **Descrição** | Ranking baseado em participação em eventos |

**Regra:** Contabiliza todos os pontos creditados via check-in em eventos.

### 2.3 Ranking de Strava

| Atributo | Valor |
|----------|-------|
| **ID** | `strava` |
| **Fonte** | Transações com `source: strava_activity` |
| **Métrica** | Soma de pontos ganhos com atividades físicas |
| **Descrição** | Ranking baseado em atividades sincronizadas do Strava |

**Regra:** Contabiliza pontos de todas as atividades (corrida, bike, natação, trilha). Limite de 5km/dia por modalidade mantido na origem.

---

## 3. Períodos

### 3.1 Período Mensal

| Atributo | Valor |
|----------|-------|
| **ID** | `monthly` |
| **Início** | Dia 1 do mês às 00:00:00 (timezone da associação) |
| **Fim** | Último dia do mês às 23:59:59 |
| **Reset** | Automático no dia 1 de cada mês |

**Escopo:** Contabiliza apenas transações dentro do mês corrente.

### 3.2 Período All-time

| Atributo | Valor |
|----------|-------|
| **ID** | `all_time` |
| **Início** | Data de criação da conta do usuário |
| **Fim** | Momento atual |
| **Reset** | Nunca |

**Escopo:** Acumulado histórico de toda a existência do usuário.

### 3.3 Regra de Desempate

Em caso de usuários com a mesma pontuação:

1. **Critério:** Timestamp da transação que atingiu a pontuação
2. **Regra:** Quem atingiu primeiro fica à frente
3. **Campo:** `reached_at` no modelo de dados

```
Exemplo:
- Usuário A: 500 pts (atingiu em 15/01 às 10:00)
- Usuário B: 500 pts (atingiu em 15/01 às 14:00)
→ Usuário A fica à frente (posição menor)
```

---

## 4. Modelo de Dados

### 4.1 RankingEntry

Representa uma entrada no ranking.

```json
{
  "position": 1,
  "user_id": "uuid",
  "user_name": "João Silva",
  "user_avatar": "https://...",
  "value": 5000,
  "reached_at": "2026-01-15T10:00:00Z",
  "is_current_user": false,
  "badge_id": "posts-monthly-top1"
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `position` | Integer | Posição no ranking (1-based) |
| `user_id` | UUID | ID do usuário |
| `user_name` | String | Nome social do usuário |
| `user_avatar` | URL | Avatar do usuário |
| `value` | Integer | Pontuação na categoria |
| `reached_at` | DateTime | Quando atingiu essa pontuação |
| `is_current_user` | Boolean | Se é o usuário logado |
| `badge_id` | String/null | ID da badge (se no pódio) |

### 4.2 RankingResponse

Resposta completa do endpoint de ranking.

```json
{
  "category": "posts",
  "period": "monthly",
  "updated_at": "2026-01-28T12:00:00Z",
  "entries": [
    { "position": 1, "...": "..." },
    { "position": 2, "...": "..." }
  ],
  "current_user": {
    "position": 15,
    "value": 250,
    "reached_at": "2026-01-20T08:30:00Z"
  },
  "total_participants": 342
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `category` | String | posts, events, strava |
| `period` | String | monthly, all_time |
| `updated_at` | DateTime | Última atualização |
| `entries` | Array | Lista de RankingEntry (Top 10) |
| `current_user` | Object | Posição do usuário logado |
| `total_participants` | Integer | Total de participantes |

### 4.3 RankingBadge

Badge de pódio.

```json
{
  "id": "posts-monthly-top1",
  "category": "posts",
  "period": "monthly",
  "position": 1,
  "name": "Rei dos Posts",
  "description": "Top 1 em posts do mês",
  "icon_url": "https://...",
  "colors": {
    "primary": "#FFD700",
    "background": "#FFF8E1"
  },
  "is_active": true
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String | Identificador único (categoria-período-posição) |
| `category` | String | posts, events, strava |
| `period` | String | monthly, all_time |
| `position` | Integer | 1, 2 ou 3 |
| `name` | String | Nome exibido (configurável) |
| `description` | String | Descrição (configurável) |
| `icon_url` | URL | Ícone da badge (configurável) |
| `colors` | Object | Cores (configurável) |
| `is_active` | Boolean | Se está ativa |

### 4.4 UserRankingHistory

Histórico de conquistas do usuário.

```json
{
  "user_id": "uuid",
  "history": [
    {
      "badge_id": "posts-monthly-top1",
      "badge_name": "Rei dos Posts",
      "category": "posts",
      "period": "monthly",
      "position": 1,
      "earned_at": "2026-01-31T23:59:59Z",
      "lost_at": null,
      "reference_period": "2026-01"
    },
    {
      "badge_id": "events-monthly-top2",
      "badge_name": "Vice dos Eventos",
      "category": "events",
      "period": "monthly",
      "position": 2,
      "earned_at": "2025-12-31T23:59:59Z",
      "lost_at": "2026-01-05T14:30:00Z",
      "reference_period": "2025-12"
    }
  ]
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `badge_id` | String | ID da badge |
| `badge_name` | String | Nome no momento da conquista |
| `category` | String | Categoria do ranking |
| `period` | String | Período do ranking |
| `position` | Integer | Posição conquistada |
| `earned_at` | DateTime | Quando ganhou |
| `lost_at` | DateTime/null | Quando perdeu (null se ainda tem) |
| `reference_period` | String | Mês de referência (para badges mensais) |

---

## 5. Interface do Usuário

### 5.1 Acesso

| Ponto de Entrada | Localização |
|------------------|-------------|
| Carrossel Dashboard | Card "Rankings" no carrossel de acesso rápido |
| Perfil | Aba "Rankings" no perfil do usuário |

### 5.2 Tela de Rankings

```
┌─────────────────────────────────────┐
│ ← Rankings                          │
├─────────────────────────────────────┤
│  [Posts]  [Eventos]  [Strava]       │  ← Tabs de categoria
├─────────────────────────────────────┤
│     (Mensal)  ○  All-time           │  ← Toggle de período
├─────────────────────────────────────┤
│                                     │
│  🥇 1. João Silva         5.000 pts │
│  🥈 2. Maria Santos       4.500 pts │
│  🥉 3. Pedro Oliveira     4.200 pts │
│  ─────────────────────────────────  │
│     4. Ana Costa          3.800 pts │
│     5. Carlos Lima        3.500 pts │
│     6. Julia Souza        3.200 pts │
│     7. Rafael Mendes      3.000 pts │
│     8. Fernanda Cruz      2.800 pts │
│     9. Lucas Almeida      2.500 pts │
│    10. Beatriz Rocha      2.300 pts │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ Sua posição: #15    1.250 pts   ││  ← Card fixo do usuário
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### 5.3 Componentes

#### 5.3.1 Tabs de Categoria

| Propriedade | Valor |
|-------------|-------|
| Tipo | Tab horizontal |
| Comportamento | Troca categoria sem recarregar página |
| Estado ativo | Underline + cor primária |
| Animação | Slide suave entre tabs |

#### 5.3.2 Toggle de Período

| Propriedade | Valor |
|-------------|-------|
| Tipo | Segmented control |
| Opções | "Mensal" / "All-time" |
| Default | Mensal |
| Comportamento | Troca período sem recarregar |

#### 5.3.3 Lista de Rankings

| Propriedade | Valor |
|-------------|-------|
| Itens exibidos | Top 10 |
| Pódio | Destaque visual (ícones 🥇🥈🥉) |
| Avatar | 40x40px circular |
| Pontuação | Alinhada à direita |
| Separador | Linha sutil após posição 3 |

#### 5.3.4 Card de Posição do Usuário

| Propriedade | Valor |
|-------------|-------|
| Posição | Fixo na parte inferior |
| Visibilidade | Sempre visível |
| Informações | Posição + pontuação |
| Destaque | Background diferenciado |
| Ação | Tap mostra perfil próprio |

### 5.4 Estados

#### Loading

```
┌─────────────────────────────────────┐
│ ← Rankings                          │
├─────────────────────────────────────┤
│  [████]  [████]  [████]             │  ← Skeleton tabs
├─────────────────────────────────────┤
│  ████████████████████████████       │
│  ████████████████████████████       │
│  ████████████████████████████       │
│  ████████████████████████████       │
│  ████████████████████████████       │
└─────────────────────────────────────┘
```

#### Empty

```
┌─────────────────────────────────────┐
│                                     │
│            🏆                       │
│                                     │
│   Ainda não há participantes        │
│   nesta categoria                   │
│                                     │
│   Seja o primeiro a pontuar!        │
│                                     │
└─────────────────────────────────────┘
```

#### Error

```
┌─────────────────────────────────────┐
│                                     │
│            ⚠️                       │
│                                     │
│   Não foi possível carregar         │
│   o ranking                         │
│                                     │
│   [Tentar novamente]                │
│                                     │
└─────────────────────────────────────┘
```

---

## 6. Sistema de Badges

### 6.1 Matriz de Badges

Total: **18 badges** (3 categorias × 2 períodos × 3 posições)

| ID | Categoria | Período | Posição | Nome Padrão |
|----|-----------|---------|---------|-------------|
| posts-monthly-top1 | Posts | Mensal | 1 | Rei dos Posts |
| posts-monthly-top2 | Posts | Mensal | 2 | Vice Posts |
| posts-monthly-top3 | Posts | Mensal | 3 | Bronze Posts |
| posts-alltime-top1 | Posts | All-time | 1 | Lenda dos Posts |
| posts-alltime-top2 | Posts | All-time | 2 | Elite Posts |
| posts-alltime-top3 | Posts | All-time | 3 | Destaque Posts |
| events-monthly-top1 | Eventos | Mensal | 1 | Rei dos Eventos |
| events-monthly-top2 | Eventos | Mensal | 2 | Vice Eventos |
| events-monthly-top3 | Eventos | Mensal | 3 | Bronze Eventos |
| events-alltime-top1 | Eventos | All-time | 1 | Lenda dos Eventos |
| events-alltime-top2 | Eventos | All-time | 2 | Elite Eventos |
| events-alltime-top3 | Eventos | All-time | 3 | Destaque Eventos |
| strava-monthly-top1 | Strava | Mensal | 1 | Atleta do Mês |
| strava-monthly-top2 | Strava | Mensal | 2 | Vice Atleta |
| strava-monthly-top3 | Strava | Mensal | 3 | Bronze Atleta |
| strava-alltime-top1 | Strava | All-time | 1 | Lenda do Strava |
| strava-alltime-top2 | Strava | All-time | 2 | Elite Strava |
| strava-alltime-top3 | Strava | All-time | 3 | Destaque Strava |

### 6.2 Ciclo de Vida

```
┌─────────────┐     Entra no Top 3     ┌─────────────┐
│   Sem       │ ─────────────────────► │   Com       │
│   Badge     │                        │   Badge     │
└─────────────┘ ◄───────────────────── └─────────────┘
                    Sai do Top 3
```

**Concessão:**
1. Usuário atinge posição 1, 2 ou 3
2. Sistema verifica se badge está ativa
3. Badge é concedida automaticamente
4. Registro em `UserRankingHistory` com `earned_at`

**Remoção:**
1. Outro usuário ultrapassa e empurra para fora do Top 3
2. Badge é removida automaticamente
3. Registro em `UserRankingHistory` atualizado com `lost_at`

### 6.3 Configuração

→ Detalhes completos em [badges.md](badges.md)

---

## 7. Integração com Perfil

### 7.1 Badges no Header

| Propriedade | Valor |
|-------------|-------|
| Localização | Abaixo do nome, ao lado de outras badges |
| Máximo visível | 3 badges |
| Tamanho | 24x24px |
| Interação | Tap abre tooltip com descrição |
| Overflow | Botão "+X" abre modal completo |

### 7.2 Aba Rankings no Perfil

```
┌─────────────────────────────────────┐
│         Sobre | Badges | Rankings   │
├─────────────────────────────────────┤
│                                     │
│  📊 Posições Atuais                 │
│  ─────────────────────────────────  │
│  Posts (Mensal):     #5   1.200pts  │
│  Posts (All-time):   #12  8.500pts  │
│  Eventos (Mensal):   #3 🥉 800pts   │
│  Eventos (All-time): #8   5.200pts  │
│  Strava (Mensal):    #1 🥇 450pts   │
│  Strava (All-time):  #4   3.800pts  │
│                                     │
│  🏆 Histórico de Conquistas         │
│  ─────────────────────────────────  │
│  Jan/26: 🥇 Atleta do Mês           │
│  Jan/26: 🥉 Bronze Eventos          │
│  Dez/25: 🥈 Vice Posts              │
│  Nov/25: 🥇 Rei dos Posts           │
│                                     │
└─────────────────────────────────────┘
```

### 7.3 Timeline de Histórico

| Propriedade | Valor |
|-------------|-------|
| Ordenação | Cronológica decrescente (mais recente primeiro) |
| Informações | Período + Badge + Posição |
| Indicador | Ícone de medalha colorido |
| Scroll | Infinito com lazy loading |

---

## 8. Configuração ADM

### 8.1 Painel de Badges

O ADM pode configurar cada uma das 18 badges:

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Nome | Texto (máx 30 chars) | Sim |
| Descrição | Texto (máx 100 chars) | Sim |
| Ícone | Upload (PNG/SVG, máx 512KB) | Sim |
| Cor primária | Color picker | Sim |
| Cor de fundo | Color picker | Sim |
| Ativo | Toggle | Sim |

### 8.2 Preview

O ADM visualiza a badge em 3 contextos:
1. **Header do perfil** (24x24px)
2. **Modal de badges** (48x48px com descrição)
3. **Lista de ranking** (ao lado do nome)

### 8.3 Configurações Gerais

| Configuração | Tipo | Padrão |
|--------------|------|--------|
| Rankings ativos | Multi-select | Todos |
| Períodos ativos | Multi-select | Mensal + All-time |
| Posições premiadas | Integer | 3 |

---

## 9. Atualização em Tempo Real

### 9.1 Estratégia

| Método | Uso |
|--------|-----|
| **WebSocket** | Quando usuário está na tela de rankings |
| **Polling** | Fallback se WebSocket indisponível (30s) |

### 9.2 Eventos WebSocket

```json
{
  "event": "ranking_update",
  "data": {
    "category": "posts",
    "period": "monthly",
    "changes": [
      { "user_id": "uuid", "old_position": 2, "new_position": 1 },
      { "user_id": "uuid", "old_position": 1, "new_position": 2 }
    ]
  }
}
```

### 9.3 Otimizações

- **Debounce:** Agrupa atualizações em janela de 5 segundos
- **Delta:** Envia apenas mudanças, não o ranking completo
- **Prioridade:** Mudanças no pódio têm prioridade

---

## 10. Performance

### 10.1 Metas

| Métrica | Meta |
|---------|------|
| Carregamento inicial | < 2 segundos |
| Troca de categoria | < 500ms |
| Troca de período | < 500ms |
| Atualização tempo real | < 1 segundo |

### 10.2 Cache

| Dado | TTL | Invalidação |
|------|-----|-------------|
| Ranking (Top 10) | 5 minutos | Nova transação de pontos |
| Posição do usuário | 1 minuto | Transação própria |
| Badges configuradas | 1 hora | Edição pelo ADM |

### 10.3 Índices de Banco

Índices recomendados para queries performáticas:

```sql
-- Ranking por categoria e período
CREATE INDEX idx_transactions_ranking
ON point_transactions (source, created_at, user_id);

-- Posição do usuário
CREATE INDEX idx_user_points
ON users (association_id, lifetime_earned);
```

---

## Relacionados

- [API](api.md) - Endpoints e contratos
- [Badges](badges.md) - Sistema de badges detalhado
- [Critérios de Aceitação](acceptance-criteria.md) - Checklist
- [Sistema de Pontos](../06-sistema-pontos/spec.md) - Fonte de dados
- [Perfil](../02-perfil/spec.md) - Integração de badges
