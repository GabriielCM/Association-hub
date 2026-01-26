---
module: sistema-pontos
document: spec
status: complete
priority: mvp
last_updated: 2026-01-14
---

# Sistema de Pontos - Especificação

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Modelo de Dados](#2-modelo-de-dados)
3. [Fontes de Pontos](#3-fontes-de-pontos)
4. [Consumo de Pontos](#4-consumo-de-pontos)
5. [Transferência entre Usuários](#5-transferência-entre-usuários)
6. [Integração Strava](#6-integração-strava)
7. [Rankings](#7-rankings)
8. [Configuração ADM](#8-configuração-adm)
9. [Estados e Feedback](#9-estados-e-feedback)
10. [Notificações](#10-notificações)
11. [Performance e Cache](#11-performance-e-cache)
12. [Segurança](#12-segurança)
13. [Métricas de Sucesso](#13-métricas-de-sucesso)
14. [Módulos que Integram](#14-módulos-que-integram)
15. [Multiplicadores de Assinatura](#15-multiplicadores-de-assinatura)

---

## 1. Visão Geral

### 1.1 Objetivo

O Sistema de Pontos é o mecanismo central de gamificação do A-hub, permitindo que associados:
- Acumulem pontos através de ações no app (check-in, Strava, posts)
- Gastem pontos em recompensas (loja, jukebox, PDVs)
- Transfiram pontos entre si

### 1.2 Nomenclatura

| Termo | Descrição |
|-------|-----------|
| **Association-points** | Nome oficial da moeda (customizável por associação) |
| **Saldo** | Total de pontos disponíveis do usuário |
| **Crédito** | Entrada de pontos (ganho) |
| **Débito** | Saída de pontos (gasto/transferência) |
| **Transação** | Registro de movimentação de pontos |

### 1.3 Prioridade e Status

| Item | Valor |
|------|-------|
| Prioridade | 🔴 MVP |
| Status | 🟡 Em Especificação |
| Usuários | Common User, ADM |

---

## 2. Modelo de Dados

### 2.1 UserPoints (Saldo do Usuário)

```json
{
  "user_id": "uuid",
  "balance": 1250,
  "lifetime_earned": 3500,
  "lifetime_spent": 2250,
  "last_transaction_at": "2026-01-11T10:30:00Z",
  "created_at": "2025-06-15T08:00:00Z",
  "updated_at": "2026-01-11T10:30:00Z"
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `user_id` | UUID | ID do usuário |
| `balance` | Integer | Saldo atual de pontos |
| `lifetime_earned` | Integer | Total de pontos ganhos (histórico) |
| `lifetime_spent` | Integer | Total de pontos gastos (histórico) |
| `last_transaction_at` | DateTime | Data da última transação |

### 2.2 PointTransaction (Transação)

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "type": "credit",
  "amount": 50,
  "balance_after": 1250,
  "source": "event_checkin",
  "source_id": "event-uuid",
  "metadata": {
    "event_name": "Happy Hour Sexta",
    "event_date": "2026-01-10"
  },
  "description": "Check-in no evento Happy Hour Sexta",
  "created_at": "2026-01-10T18:30:00Z"
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único da transação |
| `user_id` | UUID | ID do usuário |
| `type` | Enum | `credit` ou `debit` |
| `amount` | Integer | Valor da transação (sempre positivo) |
| `balance_after` | Integer | Saldo após a transação |
| `source` | Enum | Fonte da transação (ver tabela abaixo) |
| `source_id` | UUID | ID do recurso relacionado (evento, PDV, etc.) |
| `metadata` | JSON | Dados adicionais contextuais |
| `description` | String | Descrição legível para o usuário |

### 2.3 Tipos de Source (Fonte)

| Source | Tipo | Descrição |
|--------|------|-----------|
| `event_checkin` | credit | Check-in em evento |
| `strava_activity` | credit | Atividade sincronizada do Strava |
| `daily_post` | credit | Primeiro post do dia no feed |
| `admin_grant` | credit | Crédito manual pelo ADM |
| `transfer_received` | credit | Recebimento de transferência |
| `shop_cashback` | credit | Cashback de compra na Loja (pagamento em dinheiro) |
| `pdv_cashback` | credit | Cashback de compra no PDV (pagamento via PIX) |
| `shop_purchase` | debit | Compra na loja |
| `jukebox_payment` | debit | Pagamento no jukebox |
| `pdv_purchase` | debit | Compra em PDV (kiosk) |
| `transfer_sent` | debit | Envio de transferência |
| `admin_deduct` | debit | Débito manual pelo ADM |
| `refund` | credit/debit | Estorno de transação |

### 2.4 PointConfig (Configuração)

```json
{
  "id": "uuid",
  "source_type": "strava_run",
  "points_per_unit": 10,
  "unit": "km",
  "max_daily": 50,
  "is_active": true,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-11T00:00:00Z"
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `source_type` | String | Tipo de fonte |
| `points_per_unit` | Integer | Pontos por unidade |
| `unit` | String | Unidade de medida (km, unidade, etc.) |
| `max_daily` | Integer | Limite diário (null = sem limite) |
| `is_active` | Boolean | Se a fonte está ativa |

### 2.5 PointsGlobalConfig (Configuração Global)

```json
{
  "id": "uuid",
  "points_to_money_rate": 0.50,
  "cashback_percent": 5.0,
  "updated_at": "2026-01-13T00:00:00Z",
  "updated_by": "admin-uuid"
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `points_to_money_rate` | Decimal | Taxa de conversão: 1 ponto = R$ X,XX |
| `cashback_percent` | Decimal | Percentual de cashback em compras com dinheiro/PIX |
| `updated_at` | DateTime | Data da última atualização |
| `updated_by` | UUID | ADM que fez a alteração |

> **Uso:**
> - **Loja:** Calcula preço em R$ quando produto aceita dinheiro
> - **PDV:** Calcula preço em R$ para opção PIX
> - **Cashback:** Percentual aplicado em compras com dinheiro/PIX (Loja e PDV)
>
> **Exemplo:** Com `points_to_money_rate: 0.50` e `cashback_percent: 5.0`:
> - Produto de 100 pts = R$ 50,00
> - Compra de R$ 50,00 via PIX = 2,50 pts de cashback (arredondado para 2 ou 3 pts)

---

## 3. Fontes de Pontos

### 3.1 Check-in em Eventos

```
┌─────────────────────────────────────────────────────────────┐
│                  FLUXO: CHECK-IN → PONTOS                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuário faz check-in no evento                          │
│     └─ Escaneia QR ou confirma presença                     │
│                                                             │
│  2. Sistema valida check-in                                 │
│     └─ Verifica se já fez check-in (duplicação)             │
│     └─ Verifica se evento está ativo                        │
│                                                             │
│  3. Crédito IMEDIATO de pontos                              │
│     └─ Valor definido pelo ADM para o evento                │
│     └─ Cria transação com source = event_checkin            │
│                                                             │
│  4. Feedback ao usuário                                     │
│     └─ Celebração em TELA CHEIA                             │
│     └─ Mostra pontos ganhos e novo saldo                    │
│                                                             │
│  5. Notificação push (se app em background)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Configuração:**
- Pontos por evento: Definido pelo ADM ao criar/editar evento
- Valor padrão sugerido: 50 pontos
- Crédito: Imediato (no momento do check-in)

**Regras:**
- Um check-in por evento por usuário
- Evento cancelado: Pontos já creditados NÃO são removidos
- Check-in duplicado: Bloqueado silenciosamente

### 3.2 Integração Strava

```
┌─────────────────────────────────────────────────────────────┐
│                  FLUXO: STRAVA → PONTOS                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuário conecta conta Strava (uma vez)                  │
│     └─ OAuth 2.0 → Token permanente                         │
│                                                             │
│  2. Usuário clica "Sincronizar" na Carteira                 │
│     └─ Sync MANUAL (não automático)                         │
│                                                             │
│  3. Sistema busca atividades recentes                       │
│     └─ Filtra por tipos elegíveis (config ADM)              │
│     └─ Filtra atividades já sincronizadas                   │
│                                                             │
│  4. Calcula pontos                                          │
│     └─ Soma km das atividades elegíveis                     │
│     └─ Aplica taxa de conversão por tipo                    │
│     └─ Respeita limite diário (5km)                         │
│                                                             │
│  5. Crédito de pontos                                       │
│     └─ Cria transação com source = strava_activity          │
│     └─ Metadata inclui atividades processadas               │
│                                                             │
│  6. Feedback ao usuário                                     │
│     └─ Toast animado com pontos ganhos                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Configuração Padrão:**

| Tipo de Atividade | Pontos/km | Código Strava |
|-------------------|-----------|---------------|
| Corrida (Run) | 10 pts | `Run` |
| Ciclismo (Ride) | 5 pts | `Ride` |
| Caminhada (Walk) | 5 pts | `Walk` |
| Natação (Swim) | 15 pts | `Swim` |
| Trilha (Hike) | 8 pts | `Hike` |

**Limites:**
- Máximo pontuável por dia: **5 km** (configurável ADM)
- Exemplo: 5km de corrida = 50 pontos/dia máximo

**Regras:**
- Cada atividade só pode ser sincronizada uma vez (anti-fraude)
- Atividades com menos de 0.5km são ignoradas
- Sync manual para evitar processamento desnecessário
- Conexão OAuth permanente (não expira)

### 3.3 Primeiro Post do Dia

```
┌─────────────────────────────────────────────────────────────┐
│              FLUXO: PRIMEIRO POST → PONTOS                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuário cria post no feed                               │
│     └─ Apenas posts no FEED (stories não contam)            │
│                                                             │
│  2. Sistema verifica se é o primeiro do dia                 │
│     └─ Considera timezone do usuário                        │
│     └─ Reset à meia-noite local                             │
│                                                             │
│  3. Se for o primeiro:                                      │
│     └─ Crédito de pontos (valor config ADM)                 │
│     └─ source = daily_post                                  │
│                                                             │
│  4. Feedback ao usuário                                     │
│     └─ Toast animado com pontos ganhos                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Configuração:**
- Valor padrão sugerido: 5-10 pontos
- Configurável pelo ADM
- Apenas posts no feed (não stories)

---

## 4. Consumo de Pontos

### 4.1 Visão Geral dos Destinos

| Destino | Módulo | Descrição |
|---------|--------|-----------|
| Loja | [12-loja](../12-loja/) | Resgate de produtos e benefícios |
| Jukebox | [15-jukebox](../15-jukebox/) | Pagar para sugerir/pular músicas |
| PDV | [16-pdv](../16-pdv/) | Compras em kiosks (ex: geladeira) |
| Transferência | Este módulo | Envio para outros usuários |

### 4.2 Fluxo de Débito

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO: DÉBITO                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuário inicia ação de gasto                            │
│     └─ Compra, pagamento ou transferência                   │
│                                                             │
│  2. Sistema valida saldo                                    │
│     └─ balance >= amount                                    │
│     └─ Se insuficiente: erro + feedback                     │
│                                                             │
│  3. Confirmação com biometria                               │
│     └─ Face ID / Touch ID                                   │
│     └─ Fallback: PIN do dispositivo                         │
│                                                             │
│  4. Débito atômico                                          │
│     └─ Atualiza saldo                                       │
│     └─ Cria transação                                       │
│     └─ Notifica sistemas relacionados                       │
│                                                             │
│  5. Feedback ao usuário                                     │
│     └─ Confirmação visual                                   │
│     └─ Novo saldo exibido                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Transferência entre Usuários

### 5.1 Fluxo de Transferência

```
┌─────────────────────────────────────────────────────────────┐
│               FLUXO: TRANSFERÊNCIA                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuário escolhe destinatário                            │
│     └─ Escanear QR da carteirinha                           │
│     └─ Buscar por nome                                      │
│     └─ Selecionar de recentes                               │
│                                                             │
│  2. Informa valor                                           │
│     └─ Sem valor mínimo                                     │
│     └─ Máximo: saldo disponível                             │
│                                                             │
│  3. Tela de confirmação                                     │
│     └─ Nome e foto do destinatário                          │
│     └─ Valor a transferir                                   │
│     └─ Saldo atual → Saldo após                             │
│                                                             │
│  4. Autenticação biométrica                                 │
│     └─ Face ID / Touch ID                                   │
│                                                             │
│  5. Processamento                                           │
│     └─ Débito no remetente (transfer_sent)                  │
│     └─ Crédito no destinatário (transfer_received)          │
│     └─ Ambas transações com referência cruzada              │
│                                                             │
│  6. Feedback                                                │
│     └─ Remetente: Confirmação de envio                      │
│     └─ Destinatário: Push + Toast ao abrir app              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Busca de Destinatário

| Método | Descrição |
|--------|-----------|
| QR Code | Escanear QR da carteirinha do destinatário |
| Busca por nome | Pesquisar associados por nome |
| Recentes | Lista dos últimos 5 destinatários |

### 5.3 Regras

- **Sem valor mínimo**: Qualquer valor ≥ 1 ponto
- **Sem limite diário**: Usuário pode transferir qualquer quantidade
- **Sem taxa**: Transferência gratuita
- **Atomicidade**: Débito e crédito são transação única
- **Irreversível**: Só ADM pode estornar

---

## 6. Integração Strava

### 6.1 Fluxo de Conexão

```
┌─────────────────────────────────────────────────────────────┐
│                FLUXO: CONECTAR STRAVA                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuário acessa Minha Carteira → Strava                  │
│                                                             │
│  2. Clica "Conectar Strava"                                 │
│     └─ Abre browser/webview para OAuth                      │
│                                                             │
│  3. Autoriza no Strava                                      │
│     └─ Permissão: read activities                           │
│                                                             │
│  4. Callback para o app                                     │
│     └─ Recebe access_token e refresh_token                  │
│     └─ Armazena tokens de forma segura                      │
│                                                             │
│  5. Conexão estabelecida                                    │
│     └─ Status "Conectado" exibido                           │
│     └─ Botão "Sincronizar" liberado                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Fluxo de Sincronização

```
┌─────────────────────────────────────────────────────────────┐
│              FLUXO: SINCRONIZAR ATIVIDADES                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuário clica "Sincronizar"                             │
│                                                             │
│  2. Sistema busca atividades via Strava API                 │
│     └─ GET /athlete/activities                              │
│     └─ Últimos 7 dias                                       │
│                                                             │
│  3. Filtra atividades                                       │
│     └─ Tipos elegíveis (config ADM)                         │
│     └─ Não sincronizadas anteriormente                      │
│     └─ Distância >= 0.5km                                   │
│                                                             │
│  4. Calcula km pontuável hoje                               │
│     └─ km_hoje = min(total_km, limite_diario - ja_usado)    │
│     └─ Limite padrão: 5km/dia                               │
│                                                             │
│  5. Converte em pontos                                      │
│     └─ Aplica taxa por tipo de atividade                    │
│     └─ Arredonda para inteiro                               │
│                                                             │
│  6. Credita pontos                                          │
│     └─ Uma transação por sync                               │
│     └─ Metadata com detalhes das atividades                 │
│                                                             │
│  7. Marca atividades como processadas                       │
│     └─ Previne duplicação                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Dados Armazenados

```json
{
  "user_id": "uuid",
  "strava_athlete_id": 12345678,
  "access_token": "encrypted",
  "refresh_token": "encrypted",
  "token_expires_at": "2026-01-12T10:00:00Z",
  "connected_at": "2025-10-01T15:30:00Z",
  "last_sync_at": "2026-01-11T08:00:00Z",
  "km_used_today": 3.5,
  "synced_activities": ["activity-id-1", "activity-id-2"]
}
```

---

## 7. Rankings

### 7.1 Tipos de Ranking

| Ranking | Descrição | Critério |
|---------|-----------|----------|
| Pontos Totais | Ranking geral | `lifetime_earned` |
| Eventos | Mais check-ins | Contagem de check-ins |
| Strava | Mais ativo fisicamente | km sincronizados |

### 7.2 Estrutura do Ranking

```json
{
  "type": "points",
  "period": "all_time",
  "updated_at": "2026-01-11T12:00:00Z",
  "entries": [
    {
      "position": 1,
      "user_id": "uuid",
      "user_name": "João Silva",
      "user_avatar": "url",
      "value": 5000,
      "is_current_user": false
    },
    {
      "position": 2,
      "user_id": "uuid",
      "user_name": "Maria Santos",
      "user_avatar": "url",
      "value": 4500,
      "is_current_user": true
    }
  ],
  "current_user_position": 2
}
```

### 7.3 Períodos

- `all_time` - Desde sempre
- `monthly` - Mês atual
- `weekly` - Semana atual

---

## 8. Configuração ADM

### 8.1 Painel de Configuração

#### Configurações por Fonte

| Configuração | Tipo | Padrão |
|--------------|------|--------|
| Pontos por check-in (padrão) | Integer | 50 |
| Strava - Corrida pts/km | Integer | 10 |
| Strava - Bike pts/km | Integer | 5 |
| Strava - Limite diário km | Float | 5.0 |
| Strava - Tipos ativos | Array | Run, Ride, Walk |
| Post do dia pts | Integer | 5 |
| Post do dia ativo | Boolean | true |

#### Configurações Globais (Loja + PDV)

| Configuração | Tipo | Padrão | Descrição |
|--------------|------|--------|-----------|
| Taxa de conversão | Decimal | 0.50 | 1 ponto = R$ X,XX |
| Cashback % | Decimal | 5.0 | % de cashback em compras PIX/dinheiro |

> **Impacto das Configurações Globais:**
> - **Taxa de conversão:** Define o preço em R$ de produtos na Loja e PDV
> - **Cashback:** Percentual creditado ao usuário em compras via PIX/dinheiro
> - Afeta tanto a Loja (source: `shop_cashback`) quanto o PDV (source: `pdv_cashback`)

### 8.2 Ações ADM

| Ação | Descrição |
|------|-----------|
| Crédito manual | Adicionar pontos a um usuário |
| Débito manual | Remover pontos de um usuário |
| Estorno | Reverter uma transação específica |
| Exportar CSV | Download do histórico de transações |
| Relatórios | Visualizar métricas e gráficos |

### 8.3 Relatórios Disponíveis

- Total de pontos em circulação
- Pontos distribuídos por fonte (pizza)
- Pontos distribuídos por período (linha)
- Top 10 usuários por pontos
- Transações recentes
- Exportação CSV completa

---

## 9. Estados e Feedback

### 9.1 Estados da Tela de Saldo

| Estado | Descrição | Visual |
|--------|-----------|--------|
| Loading | Carregando saldo | Skeleton + spinner |
| Success | Saldo carregado | Valor exibido |
| Error | Erro de conexão | Mensagem + retry |
| Zero | Saldo zerado | Valor 0 + dicas de como ganhar |

### 9.2 Feedback de Ganho

| Fonte | Tipo de Feedback |
|-------|------------------|
| Check-in em evento | **Tela cheia** com celebração |
| Strava | Toast animado |
| Post do dia | Toast animado |
| Transferência recebida | Push + Toast |
| Crédito ADM | Push + Toast |
| Cashback (Loja/PDV) | Toast + destaque na tela de sucesso |

### 9.3 Feedback de Gasto

| Ação | Tipo de Feedback |
|------|------------------|
| Compra na loja (pontos) | Confirmação + novo saldo |
| Compra na loja (PIX/dinheiro) | Confirmação + cashback ganho |
| Pagamento jukebox | Confirmação rápida |
| Pagamento PDV (pontos) | Confirmação + QR validado |
| Pagamento PDV (PIX) | Confirmação + cashback ganho |
| Transferência enviada | Confirmação + destinatário |

---

## 10. Notificações

### 10.1 Notificações Push

| Evento | Título | Corpo |
|--------|--------|-------|
| Recebeu pontos (evento) | "+{amount} pontos!" | "Check-in em {evento}" |
| Recebeu pontos (Strava) | "+{amount} pontos!" | "Atividade física sincronizada" |
| Recebeu transferência | "+{amount} pontos!" | "{nome} transferiu pontos para você" |
| Recebeu cashback (Loja) | "+{amount} pontos!" | "Cashback da sua compra na Loja" |
| Recebeu cashback (PDV) | "+{amount} pontos!" | "Cashback da sua compra no PDV" |
| Gastou pontos | "-{amount} pontos" | "Compra em {destino}" |

### 10.2 Configuração de Notificações

Usuário pode desativar categorias específicas:
- [ ] Notificar ao receber pontos
- [ ] Notificar ao gastar pontos
- [ ] Lembretes de pontos (semanal)

---

## 11. Performance e Cache

### 11.1 Metas de Performance

| Operação | Meta |
|----------|------|
| Carregar saldo | < 2 segundos |
| Carregar histórico (primeira página) | < 2 segundos |
| Processar transferência | < 3 segundos |
| Sync Strava | < 5 segundos |

### 11.2 Estratégia de Cache

| Dado | Cache | TTL |
|------|-------|-----|
| Saldo | Local + Memory | 5 min |
| Histórico | Local | 10 min |
| Rankings | Memory | 15 min |
| Config | Memory | 1 hora |

### 11.3 Offline

- **Saldo**: Último valor cacheado exibido com indicador "offline"
- **Histórico**: Últimas 50 transações cacheadas
- **Ações**: Bloqueadas (requer conexão)

---

## 12. Segurança

### 12.1 Autenticação de Transações

| Ação | Autenticação Requerida |
|------|------------------------|
| Ver saldo | Token JWT |
| Ver histórico | Token JWT |
| Transferir | Token JWT + Biometria |
| Pagar em PDV | Token JWT + Biometria |
| Comprar na loja | Token JWT + Biometria |

### 12.2 Proteções

- **Rate limiting**: 10 transações/minuto por usuário
- **Atomicidade**: Transações são atômicas (all-or-nothing)
- **Auditoria**: Todas as transações são logadas
- **Tokens Strava**: Armazenados criptografados
- **Biometria**: Fallback para PIN do dispositivo

---

## 13. Métricas de Sucesso

### 13.1 KPIs do Sistema

| Métrica | Meta | Medição |
|---------|------|---------|
| Usuários com saldo > 0 | > 80% | Semanal |
| Transações/dia | > 100 | Diário |
| Tempo médio de carregamento | < 2s | Contínuo |
| Erros de transação | < 0.1% | Contínuo |

### 13.2 Engajamento

| Métrica | Meta |
|---------|------|
| Usuários que fizeram check-in | > 60% por evento |
| Usuários com Strava conectado | > 30% |
| Transferências entre usuários | > 20/semana |

---

## 14. Módulos que Integram

O Sistema de Pontos é central para a gamificação do A-hub. Os seguintes módulos integram ou integrarão com este sistema:

### 14.1 Módulos MVP

| Módulo | Integração | Status |
|--------|------------|--------|
| [Eventos](../04-eventos/) | Check-in gera pontos | 🟢 Implementado |
| [Minha Carteira](../05-minha-carteira/) | Interface de saldo e transferências | 🟢 Implementado |
| [PDV](../16-pdv/) | Pagamento com pontos em kiosks | 🟢 Implementado |

### 14.2 Módulos Fase 2

| Módulo | Integração Prevista | Status |
|--------|---------------------|--------|
| [Pedidos](../11-pedidos/) | Pagamento com pontos no bar/restaurante | ⚪ Não Iniciado |
| [Loja](../12-loja/) | Resgate de produtos e benefícios | ⚪ Não Iniciado |
| [Rankings](../13-rankings/) | Exibição de rankings por pontos | ⚪ Não Iniciado |

### 14.3 Módulos Nice to Have

| Módulo | Integração Prevista | Status |
|--------|---------------------|--------|
| [Jukebox](../15-jukebox/) | Pagar para sugerir/pular músicas | ⚪ Não Iniciado |

### 14.4 Módulos que NÃO Integram

| Módulo | Motivo |
|--------|--------|
| [Espaços](../09-espacos/) | Reservas não usam sistema de pontos |
| [Reservas](../10-reservas/) | Custo é opcional e definido pelo ADM (não usa pontos) |

---

## 15. Multiplicadores de Assinatura

> **Integração com [Assinaturas](../17-assinaturas/)**

O módulo de Assinaturas permite que associados com planos premium tenham multiplicadores de pontos em diversas fontes.

### 15.1 Como Funcionam os Multiplicadores

Usuários com assinatura ativa têm seus pontos multiplicados conforme configuração do plano:

| Fonte | Cálculo | Exemplo |
|-------|---------|---------|
| Check-in Eventos | `pontos_evento × mutador` | 50 pts × 1.5 = 75 pts |
| Strava | `(km × pts/km) × mutador` | (5km × 10) × 1.5 = 75 pts |
| Primeiro Post | `pontos_post × mutador` | 5 pts × 2.0 = 10 pts |

### 15.2 Regras de Aplicação

1. **Verificação em tempo real:** Ao calcular pontos, sistema verifica se usuário tem assinatura ativa
2. **Mutador do plano:** Cada plano define seus mutadores (configurável pelo ADM)
3. **Limites mantidos:** Multiplicadores NÃO afetam limites diários (ex: 5km Strava)
4. **Registro transparente:** Transação registra o valor FINAL (já multiplicado)

### 15.3 Implementação

```typescript
// Pseudocódigo para cálculo de pontos
function calcularPontos(userId: string, fonteBase: number, fonte: string): number {
  const subscription = getUserSubscription(userId);

  if (!subscription || subscription.status !== 'active') {
    return fonteBase; // Sem assinatura = sem multiplicador
  }

  const mutador = subscription.plan.mutators[`points_${fonte}`] || 1.0;
  return Math.round(fonteBase * mutador);
}

// Exemplo de uso no check-in
const pontosEvento = 50;
const pontosFinais = calcularPontos(userId, pontosEvento, 'events');
// Com mutador 1.5x: 75 pontos
```

### 15.4 Considerações

- **Perda de assinatura:** Próximas transações usam multiplicador 1.0x
- **Troca de plano:** Novos mutadores aplicam imediatamente
- **Histórico:** Transações passadas não são recalculadas

### 15.5 Configuração no ADM

Os mutadores são definidos por plano no módulo de [Assinaturas](../17-assinaturas/spec.md#mutadores-de-benefícios).

---

## Relacionados

- [API](api.md) - Documentação de endpoints
- [Critérios de Aceitação](acceptance-criteria.md) - Checklist de validação
- [Minha Carteira](../05-minha-carteira/) - Interface do usuário
- [PDV](../16-pdv/) - Sistema de kiosks
- [Eventos - Check-in](../04-eventos/checkin-system.md) - Integração
- [Assinaturas](../17-assinaturas/) - Multiplicadores de pontos
