---
module: rankings
document: badges
status: complete
priority: phase2
last_updated: 2026-01-28
---

# Rankings - Sistema de Badges

[← Voltar](README.md)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Matriz de Badges](#2-matriz-de-badges)
3. [Gestão ADM](#3-gestão-adm)
4. [Lógica de Concessão e Remoção](#4-lógica-de-concessão-e-remoção)
5. [Exibição no Perfil](#5-exibição-no-perfil)
6. [Timeline de Histórico](#6-timeline-de-histórico)
7. [Integração com Sistema de Pontos](#7-integração-com-sistema-de-pontos)

---

## 1. Visão Geral

O sistema de badges de ranking premia automaticamente os usuários que alcançam o pódio (Top 3) em cada categoria e período de ranking.

### 1.1 Características

| Atributo | Valor |
|----------|-------|
| Total de badges | 18 (3 categorias × 2 períodos × 3 posições) |
| Concessão | Automática ao entrar no Top 3 |
| Remoção | Automática ao sair do Top 3 |
| Configuração | Visual completo pelo ADM |
| Exibição | Máximo 3 no header do perfil |

### 1.2 Estrutura de ID

O ID de cada badge segue o padrão:

```
{categoria}-{periodo}-top{posicao}
```

Exemplos:
- `posts-monthly-top1`
- `events-alltime-top2`
- `strava-monthly-top3`

---

## 2. Matriz de Badges

### 2.1 Badges de Posts

| ID | Período | Posição | Nome Padrão | Descrição Padrão |
|----|---------|---------|-------------|------------------|
| `posts-monthly-top1` | Mensal | 1 | Rei dos Posts | Top 1 em posts do mês |
| `posts-monthly-top2` | Mensal | 2 | Vice Posts | Top 2 em posts do mês |
| `posts-monthly-top3` | Mensal | 3 | Bronze Posts | Top 3 em posts do mês |
| `posts-alltime-top1` | All-time | 1 | Lenda dos Posts | Top 1 histórico em posts |
| `posts-alltime-top2` | All-time | 2 | Elite Posts | Top 2 histórico em posts |
| `posts-alltime-top3` | All-time | 3 | Destaque Posts | Top 3 histórico em posts |

**Cores padrão (Posts):**

| Posição | Primary | Background |
|---------|---------|------------|
| Top 1 | #FFD700 (Ouro) | #FFF8E1 |
| Top 2 | #C0C0C0 (Prata) | #F5F5F5 |
| Top 3 | #CD7F32 (Bronze) | #FFF3E0 |

---

### 2.2 Badges de Eventos

| ID | Período | Posição | Nome Padrão | Descrição Padrão |
|----|---------|---------|-------------|------------------|
| `events-monthly-top1` | Mensal | 1 | Rei dos Eventos | Top 1 em eventos do mês |
| `events-monthly-top2` | Mensal | 2 | Vice Eventos | Top 2 em eventos do mês |
| `events-monthly-top3` | Mensal | 3 | Bronze Eventos | Top 3 em eventos do mês |
| `events-alltime-top1` | All-time | 1 | Lenda dos Eventos | Top 1 histórico em eventos |
| `events-alltime-top2` | All-time | 2 | Elite Eventos | Top 2 histórico em eventos |
| `events-alltime-top3` | All-time | 3 | Destaque Eventos | Top 3 histórico em eventos |

**Cores padrão (Eventos):**

| Posição | Primary | Background |
|---------|---------|------------|
| Top 1 | #FFD700 (Ouro) | #FFF8E1 |
| Top 2 | #C0C0C0 (Prata) | #F5F5F5 |
| Top 3 | #CD7F32 (Bronze) | #FFF3E0 |

---

### 2.3 Badges de Strava

| ID | Período | Posição | Nome Padrão | Descrição Padrão |
|----|---------|---------|-------------|------------------|
| `strava-monthly-top1` | Mensal | 1 | Atleta do Mês | Top 1 no Strava do mês |
| `strava-monthly-top2` | Mensal | 2 | Vice Atleta | Top 2 no Strava do mês |
| `strava-monthly-top3` | Mensal | 3 | Bronze Atleta | Top 3 no Strava do mês |
| `strava-alltime-top1` | All-time | 1 | Lenda do Strava | Top 1 histórico no Strava |
| `strava-alltime-top2` | All-time | 2 | Elite Strava | Top 2 histórico no Strava |
| `strava-alltime-top3` | All-time | 3 | Destaque Strava | Top 3 histórico no Strava |

**Cores padrão (Strava):**

| Posição | Primary | Background |
|---------|---------|------------|
| Top 1 | #FC4C02 (Strava Orange) | #FFF3E0 |
| Top 2 | #C0C0C0 (Prata) | #F5F5F5 |
| Top 3 | #CD7F32 (Bronze) | #FFF3E0 |

---

## 3. Gestão ADM

### 3.1 Tela de Configuração

```
┌─────────────────────────────────────────────────┐
│ ← Configurar Badges de Ranking                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Filtrar: [Todos ▼] [Posts ▼] [Mensal ▼]       │
│                                                 │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐  │
│  │ 🥇 Rei dos Posts                          │  │
│  │ posts-monthly-top1                        │  │
│  │ Posts • Mensal • Top 1                    │  │
│  │ ✓ Ativo                        [Editar]  │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ 🥈 Vice Posts                             │  │
│  │ posts-monthly-top2                        │  │
│  │ Posts • Mensal • Top 2                    │  │
│  │ ✓ Ativo                        [Editar]  │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ... (mais badges)                              │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3.2 Formulário de Edição

```
┌─────────────────────────────────────────────────┐
│ ← Editar Badge                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Categoria: Posts                               │
│  Período: Mensal                                │
│  Posição: Top 1                                 │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Nome*                                          │
│  ┌─────────────────────────────────────────┐   │
│  │ Rei dos Posts                           │   │
│  └─────────────────────────────────────────┘   │
│  Máximo 30 caracteres                          │
│                                                 │
│  Descrição*                                     │
│  ┌─────────────────────────────────────────┐   │
│  │ Top 1 em posts do mês                   │   │
│  └─────────────────────────────────────────┘   │
│  Máximo 100 caracteres                         │
│                                                 │
│  Ícone*                                         │
│  ┌─────────────────────────────────────────┐   │
│  │  [🏆]   [Alterar]   [Remover]           │   │
│  └─────────────────────────────────────────┘   │
│  PNG ou SVG, máximo 512KB                      │
│                                                 │
│  Cores*                                         │
│  ┌──────────────────┐ ┌──────────────────┐    │
│  │ Primary          │ │ Background       │    │
│  │ [████] #FFD700   │ │ [████] #FFF8E1   │    │
│  └──────────────────┘ └──────────────────┘    │
│                                                 │
│  Status                                         │
│  [✓] Badge ativa                               │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Preview:                                       │
│  ┌─────────────────────────────────────────┐   │
│  │ Header (24px): [🏆] Rei dos Posts       │   │
│  │ Modal (48px):  [🏆] Rei dos Posts       │   │
│  │                    Top 1 em posts do mês│   │
│  │ Lista:    🥇 [🏆] João Silva  5.000pts  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│         [Cancelar]        [Salvar]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3.3 Campos Configuráveis

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| Nome | Texto | Sim | Máx 30 chars |
| Descrição | Texto | Sim | Máx 100 chars |
| Ícone | Arquivo | Sim | PNG/SVG, máx 512KB |
| Cor primária | Color | Sim | Hexadecimal válido |
| Cor background | Color | Sim | Hexadecimal válido |
| Ativo | Boolean | Sim | - |

### 3.4 Regras de Negócio ADM

1. **Categoria e posição não editáveis** - Definidos pelo sistema
2. **Ícone padrão** - Se não houver upload, usa ícone de medalha padrão
3. **Desativação** - Badge desativada não é concedida, mas histórico é mantido
4. **Propagação** - Mudanças visuais refletem imediatamente para usuários

---

## 4. Lógica de Concessão e Remoção

### 4.1 Fluxo de Concessão

```
┌──────────────────────────────────────────────────────────────┐
│                    FLUXO DE CONCESSÃO                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐         │
│  │  Usuário   │───►│  Ranking   │───►│  Posição   │         │
│  │  ganha     │    │  é         │    │  <= 3?     │         │
│  │  pontos    │    │  recalculado│    │            │         │
│  └────────────┘    └────────────┘    └─────┬──────┘         │
│                                            │                 │
│                                    Sim ────┘──── Não         │
│                                     │            │           │
│                                     ▼            ▼           │
│                              ┌────────────┐  (fim)           │
│                              │  Badge     │                  │
│                              │  ativa?    │                  │
│                              └─────┬──────┘                  │
│                                    │                         │
│                            Sim ────┘──── Não                 │
│                             │            │                   │
│                             ▼            ▼                   │
│                      ┌────────────┐  (fim)                   │
│                      │  Conceder  │                          │
│                      │  badge     │                          │
│                      └─────┬──────┘                          │
│                            │                                 │
│                            ▼                                 │
│                      ┌────────────┐                          │
│                      │  Registrar │                          │
│                      │  histórico │                          │
│                      └────────────┘                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Fluxo de Remoção

```
┌──────────────────────────────────────────────────────────────┐
│                    FLUXO DE REMOÇÃO                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐         │
│  │  Outro     │───►│  Ranking   │───►│  Usuário   │         │
│  │  usuário   │    │  é         │    │  saiu do   │         │
│  │  ultrapassa│    │  recalculado│    │  Top 3?    │         │
│  └────────────┘    └────────────┘    └─────┬──────┘         │
│                                            │                 │
│                                    Sim ────┘──── Não         │
│                                     │            │           │
│                                     ▼            ▼           │
│                              ┌────────────┐  (fim)           │
│                              │  Tinha     │                  │
│                              │  badge?    │                  │
│                              └─────┬──────┘                  │
│                                    │                         │
│                            Sim ────┘──── Não                 │
│                             │            │                   │
│                             ▼            ▼                   │
│                      ┌────────────┐  (fim)                   │
│                      │  Remover   │                          │
│                      │  badge     │                          │
│                      └─────┬──────┘                          │
│                            │                                 │
│                            ▼                                 │
│                      ┌────────────┐                          │
│                      │  Atualizar │                          │
│                      │  lost_at   │                          │
│                      └────────────┘                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 Casos Especiais

#### Reset Mensal

No dia 1 de cada mês às 00:00:00:

1. Todas as badges mensais são removidas
2. `lost_at` é preenchido com timestamp do reset
3. Novo ranking mensal inicia zerado
4. Badges all-time não são afetadas

#### Desativação de Badge pelo ADM

1. Badge desativada é removida de todos os usuários
2. Histórico é mantido com `lost_at` = momento da desativação
3. Badge não é mais concedida até reativação

#### Empate no Pódio

1. Ambos usuários recebem badge da posição
2. Desempate por timestamp não impede concessão
3. Exemplo: dois Top 1 são possíveis em empate exato

---

## 5. Exibição no Perfil

### 5.1 Header do Perfil

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              ┌───────────┐                      │
│              │   Avatar  │                      │
│              │   80x80   │                      │
│              └───────────┘                      │
│                                                 │
│            João Silva ✓                         │
│            @joaosilva                           │
│                                                 │
│         [🏆] [🥇] [🏅] +2                       │  ← Badges (24x24)
│                                                 │
└─────────────────────────────────────────────────┘
```

### 5.2 Regras de Exibição

| Regra | Descrição |
|-------|-----------|
| Máximo | 3 badges visíveis |
| Overflow | Botão "+X" para ver mais |
| Prioridade | Usuário escolhe quais exibir |
| Default | Badges mais recentes primeiro |
| Tamanho | 24x24px |
| Espaçamento | 8px entre badges |

### 5.3 Modal de Badges

```
┌─────────────────────────────────────────────────┐
│                 Badges de João             [X]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Selecione até 3 para exibir no perfil:         │
│                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │   🏆    │ │   🥇    │ │   🏅    │           │
│  │ Rei dos │ │ Atleta  │ │ Vice    │           │
│  │ Posts   │ │ do Mês  │ │ Eventos │           │
│  │   [✓]   │ │   [✓]   │ │   [✓]   │           │
│  └─────────┘ └─────────┘ └─────────┘           │
│                                                 │
│  ┌─────────┐ ┌─────────┐                       │
│  │   🥈    │ │   🥉    │                       │
│  │ Elite   │ │ Bronze  │                       │
│  │ Strava  │ │ Posts   │                       │
│  │   [ ]   │ │   [ ]   │                       │
│  └─────────┘ └─────────┘                       │
│                                                 │
│              [Salvar seleção]                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 5.4 Tooltip

Ao tocar em uma badge:

```
┌─────────────────────────┐
│ 🏆 Rei dos Posts        │
│ ──────────────────────  │
│ Top 1 em posts do mês   │
│ Conquistado em Jan/2026 │
└─────────────────────────┘
```

---

## 6. Timeline de Histórico

### 6.1 Estrutura

```
┌─────────────────────────────────────────────────┐
│  🏆 Histórico de Conquistas                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  Janeiro 2026                                   │
│  ├─ 28/01 🏆 Rei dos Posts (Mensal)     ativo  │
│  ├─ 15/01 🥇 Atleta do Mês (Mensal)     ativo  │
│  └─ 05/01 🥉 Bronze Eventos (Mensal)  perdido  │
│                                                 │
│  Dezembro 2025                                  │
│  ├─ 31/12 🥈 Vice Posts (Mensal)      perdido  │
│  └─ 20/12 🏅 Elite Strava (All-time)    ativo  │
│                                                 │
│  Novembro 2025                                  │
│  └─ 15/11 🏆 Lenda dos Posts (All-time) ativo  │
│                                                 │
│              [Carregar mais...]                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 6.2 Campos Exibidos

| Campo | Descrição |
|-------|-----------|
| Data | Quando conquistou |
| Ícone | Ícone da badge |
| Nome | Nome da badge |
| Período | Mensal ou All-time |
| Status | Ativo ou Perdido |

### 6.3 Indicadores Visuais

| Status | Indicador |
|--------|-----------|
| Ativo | Cor normal + label "ativo" |
| Perdido | Cor opaca (50%) + label "perdido" |

---

## 7. Integração com Sistema de Pontos

### 7.1 Mapeamento de Sources

| Categoria | Source do Sistema de Pontos |
|-----------|----------------------------|
| Posts | `daily_post` |
| Eventos | `event_checkin` |
| Strava | `strava_activity` |

### 7.2 Cálculo de Pontuação

```sql
-- Ranking de Posts (Mensal)
SELECT
  user_id,
  SUM(amount) as total_points,
  MIN(created_at) as reached_at
FROM point_transactions
WHERE type = 'credit'
  AND source = 'daily_post'
  AND created_at >= '2026-01-01'
  AND created_at < '2026-02-01'
GROUP BY user_id
ORDER BY total_points DESC, reached_at ASC
LIMIT 10;
```

### 7.3 Multiplicadores

Multiplicadores de assinatura **NÃO afetam** a categorização:

- Usuário com multiplicador 1.5x ganha 75 pts por post
- Pontos são creditados com `source: daily_post`
- Ranking contabiliza o valor final (já multiplicado)
- Categorização é feita pelo `source`, não pelo valor

---

## Relacionados

- [Especificação](spec.md) - Detalhes técnicos
- [API](api.md) - Endpoints
- [Critérios de Aceitação](acceptance-criteria.md) - Checklist
- [Perfil - Spec](../02-perfil/spec.md) - Integração de badges
- [Sistema de Pontos - Spec](../06-sistema-pontos/spec.md) - Fonte de dados
