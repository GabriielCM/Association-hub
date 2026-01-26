---
module: assinaturas
document: spec
status: complete
priority: phase2
last_updated: 2026-01-14
---

# Assinaturas - Especificação

[← Voltar ao Índice](README.md)

---

## Índice

- [Visão Geral](#visão-geral)
- [Modelo de Dados](#modelo-de-dados)
- [Mutadores de Benefícios](#mutadores-de-benefícios)
- [Fluxos do Usuário](#fluxos-do-usuário)
- [Fluxos do ADM](#fluxos-do-adm)
- [Verificado Dourado](#verificado-dourado)
- [Integração com Convênios](#integração-com-convênios)
- [Notificações](#notificações)
- [Dashboard ADM](#dashboard-adm)
- [Estados e Transições](#estados-e-transições)
- [Design e UX](#design-e-ux)
- [Segurança e Performance](#segurança-e-performance)

---

## Visão Geral

**Prioridade:** 🟡 Fase 2
**Status:** 🟢 Especificação Completa

**Descrição:**
Sistema de assinaturas premium que permite ao ADM criar planos com benefícios exclusivos para associados. Os benefícios são aplicados através de mutadores que afetam pontos, descontos e cashback.

**Características principais:**
- Até 3 planos simultâneos
- 1 assinatura por associado (exclusivo)
- Cobrança gerenciada externamente
- Mutadores configuráveis livremente
- Verificado dourado visual

---

## Modelo de Dados

### SubscriptionPlan (Plano de Assinatura)

```json
{
  "id": "uuid",
  "name": "Plano Gold",
  "description": "Benefícios premium para associados que querem aproveitar ao máximo",
  "price_monthly": 49.90,
  "icon_url": "https://cdn.ahub.com/plans/gold-icon.png",
  "color": "#FFD700",
  "display_order": 1,
  "is_active": true,
  "subscribers_count": 150,
  "mutators": {
    "points_events": 1.5,
    "points_strava": 1.5,
    "points_posts": 2.0,
    "discount_store": 10.0,
    "discount_pdv": 10.0,
    "discount_spaces": 15.0,
    "cashback": 10.0
  },
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-14T10:30:00Z",
  "created_by": "admin-uuid"
}
```

**Campos:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Auto | Identificador único |
| `name` | String | Sim | Nome do plano (3-50 caracteres) |
| `description` | String | Sim | Descrição dos benefícios (10-500 caracteres) |
| `price_monthly` | Decimal | Sim | Preço mensal em R$ (0.01 - 9999.99) |
| `icon_url` | String | Não | URL do ícone do plano |
| `color` | String | Não | Cor em hexadecimal (#RRGGBB) |
| `display_order` | Integer | Sim | Ordem na vitrine (1-3) |
| `is_active` | Boolean | Sim | Se está disponível para novas assinaturas |
| `subscribers_count` | Integer | Auto | Contagem de assinantes ativos |
| `mutators` | Object | Sim | Objeto com os mutadores |
| `created_at` | DateTime | Auto | Data de criação |
| `updated_at` | DateTime | Auto | Última atualização |
| `created_by` | UUID | Auto | ADM que criou |

---

### UserSubscription (Assinatura do Usuário)

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "plan_id": "uuid",
  "plan": {
    "id": "uuid",
    "name": "Plano Gold",
    "color": "#FFD700",
    "mutators": { ... }
  },
  "status": "active",
  "subscribed_at": "2026-01-01T10:00:00Z",
  "current_period_start": "2026-01-01T00:00:00Z",
  "current_period_end": "2026-01-31T23:59:59Z",
  "cancelled_at": null,
  "cancel_reason": null,
  "suspended_at": null,
  "suspended_by": null,
  "suspend_reason": null,
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-14T10:30:00Z"
}
```

**Campos:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `user_id` | UUID | Referência ao usuário |
| `plan_id` | UUID | Referência ao plano |
| `plan` | Object | Dados do plano (populated) |
| `status` | Enum | active, suspended, cancelled |
| `subscribed_at` | DateTime | Quando assinou |
| `current_period_start` | DateTime | Início do período atual |
| `current_period_end` | DateTime | Fim do período atual |
| `cancelled_at` | DateTime | Quando cancelou (se aplicável) |
| `cancel_reason` | String | Motivo do cancelamento |
| `suspended_at` | DateTime | Quando foi suspenso |
| `suspended_by` | UUID | ADM que suspendeu |
| `suspend_reason` | String | Motivo da suspensão |

---

### SubscriptionHistory (Histórico de Assinaturas)

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "plan_id": "uuid",
  "plan_name": "Plano Gold",
  "action": "subscribed",
  "details": {
    "price": 49.90,
    "previous_plan": null
  },
  "performed_by": "user-uuid",
  "created_at": "2026-01-01T10:00:00Z"
}
```

**Ações possíveis:**
- `subscribed` - Assinou um plano
- `changed` - Trocou de plano
- `cancelled` - Cancelou a assinatura
- `suspended` - ADM suspendeu
- `reactivated` - ADM reativou
- `renewed` - Período renovado

---

## Mutadores de Benefícios

### Estrutura dos Mutadores

```json
{
  "points_events": 1.5,      // Multiplicador (1.0 = 100%, 1.5 = 150%)
  "points_strava": 1.5,      // Multiplicador
  "points_posts": 2.0,       // Multiplicador
  "discount_store": 10.0,    // Percentual (10.0 = 10%)
  "discount_pdv": 10.0,      // Percentual
  "discount_spaces": 15.0,   // Percentual
  "cashback": 10.0           // Percentual (substitui o base)
}
```

### Regras de Aplicação

#### 1. Mutador de Pontos (Eventos)

**Aplicação:** Ao fazer check-in em evento
**Cálculo:** `pontos_evento × mutador`
**Exemplo:**
```
Evento dá 50 pontos
Mutador = 1.5
Resultado = 50 × 1.5 = 75 pontos
```

**Exibição:**
- Tela de celebração mostra "+75 pontos" (não mostra cálculo)
- Transação registra: `source = event_checkin`, `amount = 75`

---

#### 2. Mutador de Pontos (Strava)

**Aplicação:** Ao sincronizar atividades do Strava
**Cálculo:** `(km × pts_por_km) × mutador`
**Limite diário:** Mantido (ex: 5km máximo pontuável)

**Exemplo:**
```
Corrida de 5km
Taxa base = 10 pts/km
Mutador = 1.5
Resultado = (5 × 10) × 1.5 = 75 pontos
```

**Regras:**
- Limite de km diário NÃO é afetado pelo mutador
- Mutador aplica sobre os pontos, não sobre km
- Cada tipo de atividade tem seu cálculo separado

---

#### 3. Mutador de Pontos (Posts)

**Aplicação:** Ao publicar o primeiro post do dia
**Cálculo:** `pontos_post × mutador`

**Exemplo:**
```
Bônus do 1º post = 5 pontos
Mutador = 2.0
Resultado = 5 × 2.0 = 10 pontos
```

**Regras:**
- Aplica apenas ao primeiro post do dia
- Segundo post em diante não ganha pontos
- Reset à meia-noite (timezone do usuário)

---

#### 4. Mutador de Desconto (Loja)

**Aplicação:** Ao comprar produtos na Loja
**Cálculo:** Desconto percentual sobre o preço

**Exemplo:**
```
Produto = R$ 100,00 (ou 200 pontos)
Desconto = 10%
Preço final = R$ 90,00 (ou 180 pontos)
```

**Regras:**
- Aplica a TODOS os produtos da loja
- Aplica tanto no preço em R$ quanto em pontos
- Desconto visível no carrinho e checkout
- Cumulativo com promoções? NÃO (usa o maior desconto)

---

#### 5. Mutador de Desconto (PDV)

**Aplicação:** Ao comprar produtos no PDV (kiosks)
**Cálculo:** Igual ao da Loja

**Regras:**
- Mesmo sistema da Loja
- Aplica a todos os produtos do PDV
- Desconto visível na confirmação do app

---

#### 6. Mutador de Desconto (Espaços)

**Aplicação:** Ao reservar espaços (quadras, salões, etc.)
**Cálculo:** Desconto percentual sobre valor/hora

**Exemplo:**
```
Espaço = R$ 100,00/hora
Desconto = 15%
Preço final = R$ 85,00/hora
Reserva de 2h = R$ 170,00 (em vez de R$ 200,00)
```

**Regras:**
- Aplica a TODOS os espaços
- Desconto visível na tela de confirmação de reserva
- Aplica sobre o valor total (não só primeira hora)

---

#### 7. Mutador de Cashback

**Aplicação:** Compras pagas com dinheiro/PIX na Loja e PDV
**Cálculo:** Percentual do valor pago (SUBSTITUI o base)

**Exemplo:**
```
Compra = R$ 100,00 com PIX
Cashback base = 5%
Cashback do plano = 10%
Resultado = 10% (usa o maior, não soma)
→ Usuário recebe 10 pontos de cashback
```

**Regras:**
- Substitui o cashback base (não soma)
- Se produto tem cashback promocional maior, usa o promocional
- Sempre usa o MAIOR valor entre: base, plano, promoção
- Aplica tanto em Loja quanto em PDV

---

### Validações de Mutadores

| Mutador | Mínimo | Máximo | Padrão |
|---------|--------|--------|--------|
| points_events | 0.0 | 10.0 | 1.0 |
| points_strava | 0.0 | 10.0 | 1.0 |
| points_posts | 0.0 | 10.0 | 1.0 |
| discount_store | 0.0 | 100.0 | 0.0 |
| discount_pdv | 0.0 | 100.0 | 0.0 |
| discount_spaces | 0.0 | 100.0 | 0.0 |
| cashback | 0.0 | 100.0 | 5.0 |

**Nota:** Mutadores podem ser 0 (zero) para permitir planos focados em benefícios específicos.

---

## Fluxos do Usuário

### Fluxo 1: Visualizar Planos (Vitrine)

```
1. Usuário acessa "Assinaturas" via:
   - Acessos Rápidos no Dashboard
   - Menu principal
   - Link em convênio bloqueado

2. Sistema exibe vitrine com até 3 planos:
   - Cards ordenados por display_order
   - Cada card mostra: nome, preço, resumo dos benefícios
   - Destaque visual para o plano recomendado (opcional)

3. Usuário pode:
   - Tocar em um plano → Ver detalhes
   - Comparar planos (scroll horizontal)
```

**Tela de Vitrine:**
```
┌─────────────────────────────────────┐
│  ← Assinaturas                      │
├─────────────────────────────────────┤
│                                     │
│  Escolha seu plano                  │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │ BRONZE  │ │  GOLD   │ │PLATINUM││
│  │         │ │ ★ ★ ★   │ │        ││
│  │ R$29,90 │ │ R$49,90 │ │R$79,90 ││
│  │         │ │         │ │        ││
│  │ 1.2x pts│ │ 1.5x pts│ │2.0x pts││
│  │ 5% desc │ │ 10% desc│ │15% desc││
│  │         │ │         │ │        ││
│  │[Ver mais]│ │[Ver mais]│ │[Ver+] ││
│  └─────────┘ └─────────┘ └────────┘│
│                                     │
│  Já é assinante? Ver minha         │
│  assinatura →                       │
│                                     │
└─────────────────────────────────────┘
```

---

### Fluxo 2: Ver Detalhes do Plano

```
1. Usuário toca em um plano

2. Sistema exibe tela de detalhes:
   - Nome e descrição completa
   - Preço mensal
   - Lista detalhada de benefícios com valores
   - Comparativo com não-assinante

3. Botão de ação:
   - Se não tem assinatura: "Assinar este plano"
   - Se já assina outro: "Trocar para este plano"
   - Se já assina este: "Você já possui este plano"
```

**Tela de Detalhes:**
```
┌─────────────────────────────────────┐
│  ← Plano Gold                       │
├─────────────────────────────────────┤
│                                     │
│         [Ícone Gold]                │
│         Plano Gold                  │
│         R$ 49,90/mês               │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  SEUS BENEFÍCIOS                    │
│                                     │
│  🎯 Pontos                          │
│  • Check-in em eventos: 1.5x       │
│  • Atividades Strava: 1.5x         │
│  • Primeiro post do dia: 2.0x      │
│                                     │
│  💰 Descontos                       │
│  • Loja: 10% em todos os produtos  │
│  • PDV: 10% em todas as compras    │
│  • Espaços: 15% na locação         │
│                                     │
│  🎁 Cashback                        │
│  • 10% em compras com PIX/dinheiro │
│                                     │
│  ✨ Destaque                        │
│  • Verificado dourado no perfil    │
│  • Acesso a convênios exclusivos   │
│                                     │
├─────────────────────────────────────┤
│  [      Assinar este plano      ]  │
└─────────────────────────────────────┘
```

---

### Fluxo 3: Assinar Plano

```
1. Usuário toca em "Assinar este plano"

2. Sistema exibe tela de confirmação:
   - Resumo do plano
   - Preço mensal
   - Aviso: "A cobrança será feita junto à sua mensalidade"
   - Checkbox: "Li e aceito os termos"

3. Usuário confirma

4. Sistema:
   - Cria registro de assinatura (status: active)
   - Registra no histórico (action: subscribed)
   - Atualiza contador de assinantes do plano
   - Envia notificação push de confirmação

5. Usuário é redirecionado para tela de sucesso:
   - Animação de celebração
   - Resumo dos benefícios ativados
   - Botão "Começar a aproveitar"
```

---

### Fluxo 4: Trocar de Plano

```
1. Usuário com assinatura ativa acessa outro plano

2. Sistema exibe comparativo:
   - Plano atual vs Plano novo
   - Diferenças de benefícios
   - Diferença de preço

3. Usuário confirma troca

4. Sistema:
   - Atualiza assinatura para novo plano (efeito imediato)
   - Registra no histórico (action: changed)
   - Atualiza contadores de ambos os planos
   - Notifica usuário

5. Novo plano ativo imediatamente
```

---

### Fluxo 5: Cancelar Assinatura

```
1. Usuário acessa "Minha Assinatura"

2. Toca em "Cancelar assinatura"

3. Sistema exibe modal de confirmação:
   - Lista o que será perdido
   - Informa: "Benefícios mantidos até [data fim do período]"
   - Campo opcional: motivo do cancelamento

4. Usuário confirma

5. Sistema:
   - Atualiza status para 'cancelled'
   - Define cancelled_at
   - Registra no histórico (action: cancelled)
   - Mantém benefícios até current_period_end
   - Notifica usuário

6. Após current_period_end:
   - Benefícios são removidos
   - Verificado dourado desaparece
```

---

### Fluxo 6: Ver Minha Assinatura

```
1. Usuário com assinatura ativa acessa "Minha Assinatura"

2. Sistema exibe:
   - Card do plano atual com benefícios
   - Data de início
   - Próxima renovação
   - Histórico de assinaturas

3. Ações disponíveis:
   - Trocar de plano
   - Cancelar assinatura
   - Ver histórico completo
```

---

## Fluxos do ADM

### Fluxo 1: Criar Plano

```
1. ADM acessa painel administrativo → Assinaturas → Planos

2. Toca em "Criar novo plano"
   - Validação: máximo 3 planos ativos

3. Preenche formulário:
   - Nome (obrigatório)
   - Descrição (obrigatório)
   - Preço mensal (obrigatório)
   - Ícone (upload ou URL)
   - Cor (color picker)
   - Ordem de exibição (1-3)
   - Mutadores (sliders ou inputs)

4. Sistema valida:
   - Nome único
   - Preço > 0
   - Mutadores dentro dos limites

5. Confirma criação

6. Plano disponível na vitrine imediatamente
```

---

### Fluxo 2: Editar Plano

```
1. ADM acessa lista de planos

2. Seleciona plano para editar

3. Altera campos desejados

4. Sistema exibe aviso:
   - "Este plano tem X assinantes ativos"
   - "As alterações serão aplicadas imediatamente a todos"

5. ADM confirma

6. Sistema:
   - Atualiza plano
   - Novos mutadores aplicam imediatamente
   - Notifica assinantes (opcional)
```

---

### Fluxo 3: Desativar Plano

```
1. ADM seleciona plano ativo

2. Toca em "Desativar plano"

3. Sistema exibe:
   - "Este plano tem X assinantes"
   - "Plano não aparecerá para novas assinaturas"
   - "Assinantes atuais manterão seus benefícios"

4. ADM confirma

5. Sistema:
   - Define is_active = false
   - Plano some da vitrine
   - Assinantes atuais NÃO são afetados
```

---

### Fluxo 4: Suspender Assinatura de Usuário

```
1. ADM acessa lista de assinantes ou perfil do usuário

2. Seleciona "Suspender assinatura"

3. Preenche motivo (obrigatório)

4. Sistema:
   - Atualiza status para 'suspended'
   - Define suspended_at, suspended_by, suspend_reason
   - Registra no histórico
   - Notifica usuário
   - Remove benefícios imediatamente

5. Verificado dourado desaparece do usuário
```

---

### Fluxo 5: Reativar Assinatura

```
1. ADM acessa usuário com assinatura suspensa

2. Seleciona "Reativar assinatura"

3. Sistema:
   - Atualiza status para 'active'
   - Limpa campos de suspensão
   - Registra no histórico (action: reactivated)
   - Notifica usuário
   - Restaura benefícios

4. Verificado dourado reaparece
```

---

## Verificado Dourado

### Especificação Visual

**Ícone:**
- Formato: Círculo com check (✓) ou estrela
- Cor: Dourado (#FFD700) com gradiente sutil
- Tamanho: 16x16px (mobile), 20x20px (tablet/web)
- Posição: À direita do nome do usuário

**Animação:**
- Entrada: Fade in + scale (200ms) ao carregar
- Hover (web): Leve brilho/glow

### Onde Aparece

| Local | Posição | Comportamento |
|-------|---------|---------------|
| Posts no feed | Ao lado do nome do autor | Sempre visível |
| Stories | Ao lado do nome no viewer | Sempre visível |
| Perfil | Ao lado do nome no header | Sempre visível |
| Comentários | NÃO aparece | - |
| Rankings | NÃO aparece | - |
| Transferências | NÃO aparece | - |

### Componente Visual

```
┌─────────────────────────────────────┐
│ [Avatar] João Silva [✓]            │
│ @joaosilva                          │
│                                     │
│ Conteúdo do post...                │
└─────────────────────────────────────┘
```

### Regras de Exibição

1. **Dinâmico:** Reflete status atual da assinatura
2. **Sem cache:** Verifica status a cada renderização
3. **Tempo real:** Desaparece imediatamente ao perder assinatura
4. **Não ocultável:** Usuário não pode esconder o ícone
5. **Uniforme:** Mesmo ícone para todos os planos

### Implementação

```typescript
// Pseudocódigo para verificação
function hasVerifiedBadge(userId: string): boolean {
  const subscription = getUserSubscription(userId);
  return subscription?.status === 'active';
}

// No componente de exibição de nome
function UserName({ user }) {
  return (
    <View>
      <Text>{user.name}</Text>
      {hasVerifiedBadge(user.id) && <VerifiedBadge />}
    </View>
  );
}
```

---

## Integração com Convênios

### Público-Alvo de Convênios

Com a introdução de assinaturas, os convênios (benefícios da carteirinha) ganham controle de público-alvo.

**Públicos disponíveis:**
- `all` - Todos os associados
- `subscribers` - Apenas assinantes (qualquer plano)
- `non_subscribers` - Apenas NÃO assinantes
- `specific_plans` - Planos específicos (lista de IDs)

### Modelo de Dados Atualizado (Partner)

```json
{
  "id": "uuid",
  "name": "Restaurante Exemplo",
  "...campos existentes...",

  "eligible_audiences": ["subscribers"],
  "eligible_plans": ["plan-gold-uuid", "plan-platinum-uuid"],
  "show_locked_for_ineligible": true
}
```

**Campos novos:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `eligible_audiences` | Array | Públicos elegíveis |
| `eligible_plans` | Array | IDs de planos específicos (se aplicável) |
| `show_locked_for_ineligible` | Boolean | Se mostra com cadeado para não elegíveis |

### Lógica de Elegibilidade

```typescript
function isEligibleForPartner(user, partner): boolean {
  const audiences = partner.eligible_audiences;

  // Todos = sempre elegível
  if (audiences.includes('all')) return true;

  const hasSubscription = user.subscription?.status === 'active';

  // Apenas não-assinantes
  if (audiences.includes('non_subscribers') && !hasSubscription) {
    return true;
  }

  // Apenas assinantes
  if (audiences.includes('subscribers') && hasSubscription) {
    // Verificar se tem plano específico requerido
    if (partner.eligible_plans?.length > 0) {
      return partner.eligible_plans.includes(user.subscription.plan_id);
    }
    return true;
  }

  return false;
}
```

### Exibição para Não Elegíveis

**Se `show_locked_for_ineligible = true`:**
```
┌─────────────────────────────────────┐
│ [Logo] 🔒 Restaurante Exemplo      │
│ [Alimentação]                       │
│                                     │
│ Benefício exclusivo para           │
│ assinantes do plano Gold           │
│                                     │
│ [Assinar para desbloquear →]       │
└─────────────────────────────────────┘
```

**Se `show_locked_for_ineligible = false`:**
- Convênio não aparece na lista

---

## Notificações

### Notificações Push

| Evento | Título | Corpo |
|--------|--------|-------|
| Assinatura ativada | "Assinatura ativada!" | "Seu plano [Nome] está ativo. Aproveite seus benefícios!" |
| Assinatura suspensa | "Assinatura suspensa" | "Sua assinatura foi suspensa. Entre em contato com a associação." |
| Assinatura cancelada | "Assinatura cancelada" | "Sua assinatura foi cancelada. Benefícios válidos até [data]." |
| Troca de plano | "Plano alterado" | "Você agora é assinante do plano [Nome]!" |
| Reativação | "Assinatura reativada!" | "Sua assinatura foi reativada. Aproveite!" |

### Notificações In-App

Exibidas no centro de notificações com os mesmos textos.

---

## Dashboard ADM

### Relatórios Disponíveis

**1. Resumo Geral**
```
┌─────────────────────────────────────┐
│ ASSINATURAS                         │
├─────────────────────────────────────┤
│ Total de assinantes: 450            │
│ Receita mensal estimada: R$ 18.500  │
│                                     │
│ Por plano:                          │
│ • Gold: 250 (55%)                   │
│ • Platinum: 150 (33%)               │
│ • Bronze: 50 (12%)                  │
└─────────────────────────────────────┘
```

**2. Gráfico de Evolução**
- Linha temporal mostrando crescimento de assinantes
- Período: 7 dias, 30 dias, 12 meses
- Filtro por plano

**3. Taxas de Conversão**
- % de associados que assinam
- Taxa de cancelamento mensal (churn)
- Tempo médio de permanência

**4. Lista de Assinantes**
- Filtros: plano, status, data de assinatura
- Ações: ver perfil, suspender, reativar
- Exportar CSV

**5. Histórico de Ações**
- Log de todas as ações (assinaturas, cancelamentos, suspensões)
- Filtros por período e tipo

---

## Estados e Transições

### Estados da Assinatura

```
                    ┌─────────────┐
                    │   (none)    │
                    │ Sem assina- │
                    │   tura      │
                    └──────┬──────┘
                           │ subscribe
                           ▼
                    ┌─────────────┐
         ┌──────────│   ACTIVE    │──────────┐
         │          │  Assinatura │          │
         │          │    ativa    │          │
         │          └──────┬──────┘          │
         │                 │                 │
         │ reactivate      │ cancel          │ suspend
         │                 │                 │
         │          ┌──────▼──────┐          │
         │          │  CANCELLED  │          │
         │          │  Cancelada  │          │
         │          │  (período   │          │
         │          │   restante) │          │
         │          └─────────────┘          │
         │                                   │
         │          ┌─────────────┐          │
         └──────────│  SUSPENDED  │◄─────────┘
                    │  Suspensa   │
                    │  (ADM)      │
                    └─────────────┘
```

### Transições Permitidas

| De | Para | Ação | Ator |
|----|------|------|------|
| none | active | subscribe | Usuário |
| active | active | change_plan | Usuário |
| active | cancelled | cancel | Usuário |
| active | suspended | suspend | ADM |
| suspended | active | reactivate | ADM |
| cancelled | active | subscribe (novo) | Usuário |

---

## Design e UX

### Cores do Sistema

| Elemento | Cor | Uso |
|----------|-----|-----|
| Verificado dourado | #FFD700 | Ícone de verificado |
| Status ativo | #22C55E | Badge "Ativo" |
| Status suspenso | #EF4444 | Badge "Suspenso" |
| Status cancelado | #6B7280 | Badge "Cancelado" |

### Animações

| Ação | Animação | Duração |
|------|----------|---------|
| Assinar | Confetti + sucesso | 1500ms |
| Cancelar | Fade out do verificado | 300ms |
| Trocar plano | Slide/morph entre cards | 400ms |

### Feedback Haptic

| Ação | Intensidade |
|------|-------------|
| Confirmar assinatura | Médio |
| Cancelar | Leve |
| Erro de validação | Leve |

---

## Segurança e Performance

### Validações de Segurança

1. **Limite de planos:** Máximo 3 planos ativos (validado no backend)
2. **Exclusividade:** 1 assinatura por usuário (constraint no banco)
3. **Suspensão:** Apenas ADM pode suspender/reativar
4. **Auditoria:** Todas as ações registradas com timestamp e autor

### Cache e Performance

| Dado | Cache | TTL |
|------|-------|-----|
| Lista de planos | Memory + Local | 5 min |
| Assinatura do usuário | Memory | 1 min |
| Verificado (badge) | Nenhum | Tempo real |
| Relatórios ADM | Memory | 15 min |

### Rate Limiting

| Ação | Limite |
|------|--------|
| Assinar | 1/dia por usuário |
| Cancelar | 1/dia por usuário |
| Trocar plano | 3/dia por usuário |

---

## Relacionados

- [README](README.md)
- [API](api.md)
- [Critérios de Aceitação](acceptance-criteria.md)
- [Sistema de Pontos](../06-sistema-pontos/spec.md)
- [Carteirinha - Benefícios](../03-carteirinha/benefits.md)
