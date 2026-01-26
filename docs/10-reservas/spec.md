---
module: reservas
document: spec
status: complete
priority: phase2
last_updated: 2026-01-14
---

# Reservas - Especificação

[← Voltar ao Índice](README.md)

---

## Índice

- [Visão Geral](#visão-geral)
- [Tipos de Usuários](#tipos-de-usuários)
- [Estados e Ciclo de Vida](#estados-e-ciclo-de-vida)
- [Regras de Negócio](#regras-de-negócio)
- [Fila de Espera](#fila-de-espera)
- [Visualização](#visualização)
- [Notificações](#notificações)
- [Privacidade](#privacidade)
- [Integrações](#integrações)
- [Responsividade](#responsividade)
- [Notas de Desenvolvimento](#notas-de-desenvolvimento)
- [Fases de Implementação](#fases-de-implementação)
- [Métricas de Sucesso](#métricas-de-sucesso)

---

## Visão Geral

**Prioridade:** 🟡 Fase 2
**Status:** 🟢 Especificação Completa

**Descrição:**
Sistema de reservas de espaços físicos com fluxo de aprovação. Funcionários solicitam reservas que aguardam aprovação de Gerentes/ADMs. Reservas pendentes bloqueiam a data até deliberação, expirando automaticamente se não aprovadas a tempo. Sistema inclui fila de espera com notificações e mantém privacidade total sobre os solicitantes.

---

## Tipos de Usuários

### 1. Common User (Funcionário)

**Pode:**
- ✅ Visualizar calendário de disponibilidade (todos os espaços)
- ✅ Solicitar reserva de espaço disponível
- ✅ Ver status das próprias reservas (minhas reservas)
- ✅ Cancelar próprias reservas (pendentes ou aprovadas)
- ✅ Entrar na fila de espera para datas ocupadas
- ✅ Ver própria posição na fila
- ✅ Sair da fila de espera

**Não pode:**
- ❌ Aprovar ou rejeitar reservas
- ❌ Ver quem fez outras reservas
- ❌ Ver lista de reservas de outros usuários
- ❌ Fazer exceções às regras

---

### 2. Gerente

**Pode:**
- ✅ Tudo que Funcionário pode
- ✅ Ver lista de reservas pendentes de todos os espaços
- ✅ Aprovar reservas pendentes
- ✅ Rejeitar reservas pendentes
- ✅ Ver nome do solicitante de cada reserva
- ✅ Ver histórico de reservas por espaço
- ✅ Filtrar reservas por status, data, espaço

**Não pode:**
- ❌ Cancelar reservas aprovadas de outros usuários
- ❌ Fazer exceções às regras de espaço
- ❌ Exportar relatórios

---

### 3. ADM (Administrador)

**Pode:**
- ✅ Tudo que Gerente pode
- ✅ Cancelar reservas aprovadas de qualquer usuário
- ✅ Fazer exceções às regras (ignorar intervalo entre locações)
- ✅ Criar reserva direta (sem passar por aprovação)
- ✅ Exportar relatórios de reservas (CSV, PDF)
- ✅ Ver analytics de uso dos espaços

---

## Estados e Ciclo de Vida

### Diagrama de Estados

```
                    ┌─────────────────────────────────────────┐
                    │                                         │
                    ▼                                         │
[Solicitar] → [Pendente] ──────────────────────────────► [Rejeitado]
                 │                                            │
                 │ (Aprovar)                                  │
                 ▼                                            │
            [Aprovado] ──────────────────────────────► [Cancelado]
                 │                                            │
                 │ (Data chegou)                              │
                 ▼                                            │
           [Concluído]                                        │
                                                              │
[Pendente] ─────────────────────────────────────────► [Expirado]
           (Data chegou sem aprovação)                        │
                                                              │
                    └─────────────────────────────────────────┘
                              (Libera para fila de espera)
```

### Detalhamento dos Estados

**1. Pendente**
- Reserva criada, aguardando aprovação
- **BLOQUEIA** a data para novas reservas
- Visível para Gerente/ADM na lista de pendências
- Solicitante pode cancelar
- **Transições:**
  - → Aprovado: Gerente/ADM aprova
  - → Rejeitado: Gerente/ADM rejeita
  - → Cancelado: Solicitante cancela
  - → Expirado: Data chega sem deliberação

**2. Aprovado**
- Reserva confirmada para uso
- Data permanece bloqueada
- Solicitante pode cancelar (até X horas antes)
- ADM pode cancelar a qualquer momento
- **Transições:**
  - → Cancelado: Solicitante ou ADM cancela
  - → Concluído: Data passa (automático)

**3. Rejeitado**
- Reserva foi recusada
- Data é liberada para novas reservas
- **Dispara notificação para fila de espera**
- Estado final (não pode ser alterado)

**4. Cancelado**
- Reserva foi cancelada (pelo solicitante, ADM ou sistema)
- Data é liberada para novas reservas
- **Dispara notificação para fila de espera**
- Registra quem cancelou e motivo (se houver)
- Estado final

**5. Expirado**
- Reserva pendente que não foi aprovada até a data
- Executado por job automático (meia-noite da data)
- Data é liberada para novas reservas
- **Dispara notificação para fila de espera**
- Notifica solicitante sobre expiração
- Estado final

**6. Concluído**
- Data da reserva passou
- Reserva foi utilizada (presumido)
- Usado para histórico e relatórios
- Estado final

---

## Regras de Negócio

### Bloqueio de Data

**Regra fundamental:** Uma data/período só pode ter UMA reserva (pendente ou aprovada).

```
Se existe reserva com status IN (pendente, aprovado) para:
  - Mesmo espaço
  - Mesma data
  - Mesmo período (dia/turno/hora)
→ BLOQUEAR nova solicitação
→ OFERECER fila de espera
```

### Bloqueio de Espaços Relacionados

Se espaço A tem `espacos_bloqueados: [B, C]`:
- Ao reservar A, verificar disponibilidade de B e C
- Se B ou C tem reserva (pendente/aprovada) → Permitir reserva de A
- Ao aprovar reserva de A → Bloquear B e C para mesma data

```
Reserva de A (pendente) → B e C ficam "bloqueados por dependência"
Reserva de A (aprovado) → B e C permanecem bloqueados
Reserva de A (cancelado/rejeitado) → B e C liberados
```

### Antecedência

Definida por espaço em [Espaços](../09-espacos/spec.md#antecedência).

```
Data da solicitação: hoje
Data desejada: D
Antecedência mínima: min_dias
Antecedência máxima: max_dias

VÁLIDO se: hoje + min_dias ≤ D ≤ hoje + max_dias
```

**Mensagens de erro:**
- "Você precisa reservar com pelo menos X dias de antecedência"
- "Você só pode reservar até Y dias no futuro"

### Intervalo entre Locações

Definido por espaço. Impede que o mesmo usuário reserve o mesmo espaço repetidamente.

```
Última reserva APROVADA do usuário para espaço X: data R
Intervalo do espaço: I meses
Nova solicitação para espaço X: data N

VÁLIDO se: N ≥ R + I meses
```

**Exceções:**
- Reservas canceladas/rejeitadas NÃO contam
- ADM pode ignorar esta regra (fazer exceção)

**Mensagem de erro:**
- "Você poderá reservar este espaço novamente a partir de [data]"

### Expiração Automática

Job executado diariamente à meia-noite:

```
Para cada reserva com status = 'pendente':
  Se data_reserva < hoje:
    - Alterar status para 'expirado'
    - Notificar solicitante
    - Processar fila de espera
```

### Cancelamento de Reserva Aprovada

**Por solicitante:**
- Permitido até X horas antes da data (configurável, default: 24h)
- Após o limite, não pode mais cancelar

**Por ADM:**
- Permitido a qualquer momento
- Registra motivo obrigatório
- Notifica solicitante

---

## Fila de Espera

### Funcionamento

1. **Entrar na fila:**
   - Funcionário vê data ocupada (pendente/aprovada)
   - Clica em "Entrar na fila de espera"
   - Sistema registra posição (ordem de entrada)

2. **Liberação de vaga:**
   - Reserva é cancelada/rejeitada/expirada
   - Sistema notifica primeiro da fila
   - Primeiro tem 24h para confirmar interesse

3. **Confirmação:**
   - Se confirmar: cria reserva pendente automaticamente
   - Se não confirmar em 24h: passa para próximo da fila
   - Processo repete até fila vazia ou alguém confirmar

4. **Sair da fila:**
   - Funcionário pode sair a qualquer momento
   - Posições são recalculadas automaticamente

### Estrutura de Dados

```typescript
interface FilaEspera {
  id: string;
  espaco_id: string;
  data: string;
  periodo?: string; // turno ou horário, se aplicável
  usuario_id: string;
  posicao: number;
  notificado_em: string | null;
  expira_em: string | null; // 24h após notificação
  created_at: string;
}
```

### Regras

- Usuário só pode estar UMA vez na fila por data/espaço
- Ao ser notificado, tem 24h para responder
- Se não responder, perde a vez e sai da fila
- Se confirmar mas não atender regras (ex: intervalo), é informado e passa para próximo
- Máximo de pessoas na fila: 10 (configurável)

---

## Visualização

### Calendário Mensal

**Interface:**
- Grade de 7 colunas (dias da semana)
- Navegação: < Mês anterior | Mês atual | Próximo mês >
- Hoje destacado com borda

**Cores das datas:**

| Cor | Classe | Significado |
|-----|--------|-------------|
| Verde (#22C55E) | `disponivel` | Pode reservar |
| Amarelo (#EAB308) | `pendente` | Reserva aguardando aprovação |
| Vermelho (#EF4444) | `ocupado` | Reserva aprovada |
| Cinza (#9CA3AF) | `bloqueado` | Bloqueado pelo ADM |
| Laranja (#F97316) | `manutencao` | Espaço em manutenção |
| Cinza claro (#E5E7EB) | `passado` | Data já passou |
| Cinza escuro (#6B7280) | `fora_antecedencia` | Fora do período permitido |

**Interações:**
- Tap em data disponível → Modal de confirmação de reserva
- Tap em data ocupada/pendente → Modal com opção de fila de espera
- Tap em data bloqueada → Toast com motivo do bloqueio

### Lista de Datas

**Interface:**
- Lista vertical de próximas datas
- Cada item: Data | Dia da semana | Status | Ação

**Filtros:**
- Apenas disponíveis
- Todas as datas
- Por espaço

**Ordenação:**
- Cronológica (padrão)
- Por status

### Minhas Reservas

**Interface:**
- Tabs: Pendentes | Aprovadas | Histórico
- Card de reserva: Espaço | Data | Status | Ações

**Ações por status:**
- Pendente: Cancelar
- Aprovada: Cancelar (se dentro do prazo)
- Histórico: Apenas visualização

### Painel de Aprovação (Gerente/ADM)

**Interface:**
- Lista de reservas pendentes
- Filtros: Por espaço | Por data | Por solicitante
- Card: Espaço | Data | Solicitante | Ações

**Ações:**
- Aprovar (verde)
- Rejeitar (vermelho)
- Ver detalhes

**Badge contador:**
- Ícone no menu com número de pendências

---

## Notificações

### Tipos de Notificação

| ID | Evento | Destinatário | Prioridade |
|----|--------|--------------|------------|
| `reserva_nova` | Nova solicitação | Gerentes/ADMs | Normal |
| `reserva_aprovada` | Reserva aprovada | Solicitante | Alta |
| `reserva_rejeitada` | Reserva rejeitada | Solicitante | Alta |
| `reserva_expirada` | Reserva expirou | Solicitante | Alta |
| `reserva_cancelada` | Reserva cancelada | Solicitante | Alta |
| `fila_vaga` | Vaga liberada na fila | Próximo da fila | Alta |
| `fila_expirando` | 2h para confirmar vaga | Notificado | Urgente |

### Templates

**reserva_aprovada:**
```
Sua reserva foi aprovada!
📍 {espaco.nome}
📅 {reserva.data} ({dia_semana})
```

**reserva_rejeitada:**
```
Sua reserva foi recusada
📍 {espaco.nome}
📅 {reserva.data}
```

**fila_vaga:**
```
Uma vaga foi liberada!
📍 {espaco.nome}
📅 {data}
Você tem 24h para confirmar.
[Confirmar] [Desistir]
```

---

## Privacidade

### Níveis de Visibilidade

| Informação | Funcionário | Gerente | ADM |
|------------|-------------|---------|-----|
| Estado da data (disponível/ocupado) | ✅ | ✅ | ✅ |
| Quem reservou | ❌ | ✅ | ✅ |
| Histórico do espaço | ❌ | ✅ | ✅ |
| Próprias reservas | ✅ | ✅ | ✅ |
| Fila de espera (própria posição) | ✅ | ✅ | ✅ |
| Fila de espera (todos) | ❌ | ✅ | ✅ |

### Feed Social

- **Permitido:** "Churrasqueira 1 está ocupada em 20/01"
- **Proibido:** "João reservou a Churrasqueira 1"

---

## Integrações

### Módulo de Espaços

**Consome:**
- Lista de espaços ativos
- Configurações de reserva (período, antecedência, intervalo)
- Bloqueio de espaços relacionados
- Bloqueios de data
- Status de manutenção

**Fornece:**
- Ocupação para cálculo de disponibilidade

### Notificações

**Envia:**
- Notificações conforme tabela acima
- Integra com badge contador no sino

### Feed Social

**Publica:**
- Estado de ocupação (sem identificar usuário)
- Formato: card simples com espaço e data

### Assinaturas

> **Integração com [Assinaturas](../17-assinaturas/)**

Usuários com assinatura ativa podem ter desconto na locação de espaços.

**Como funciona:**

1. Ao confirmar reserva, sistema verifica assinatura do usuário
2. Se ativa, aplica `discount_spaces` do plano ao valor
3. Desconto é exibido na tela de confirmação

**Exemplo:**
```
Espaço: Salão de Festas
Valor/hora: R$ 100,00
Reserva: 4 horas = R$ 400,00
Desconto do plano: 15%
Valor final: R$ 340,00
```

**Regras:**
- Aplica a TODOS os espaços
- Desconto visível na confirmação de reserva
- Histórico registra valor com desconto
- ADM vê o desconto aplicado no painel

---

## Responsividade

### Mobile (360px - 414px)

**Calendário:**
- Grade compacta
- Números sem texto adicional
- Legenda abaixo em linha única
- Swipe para mudar mês

**Lista:**
- Cards fullwidth
- Ações em swipe (iOS) ou menu (Android)

**Formulário:**
- Campos empilhados
- Date picker nativo

### Tablet (768px - 1024px)

**Calendário:**
- Grade maior com espaço para texto
- Legenda ao lado
- Clique para interagir

**Lista:**
- Grid 2 colunas
- Ações visíveis em hover

### Desktop (>1024px)

**Calendário:**
- Grade completa com mini-preview no hover
- Sidebar com detalhes do dia selecionado

**Lista:**
- Grid 3 colunas
- Filtros em sidebar fixa

**Painel de aprovação:**
- Split view: lista à esquerda, detalhes à direita

---

## Notas de Desenvolvimento

### Performance

**Otimizações:**
- Cache de disponibilidade por espaço (5 min TTL)
- Invalidação de cache ao criar/alterar reserva
- Paginação na lista de reservas (20 por página)
- Índices no banco: (espaco_id, data, status)

**Métricas Alvo:**
- Calendário de disponibilidade: <500ms
- Criar reserva: <1s
- Aprovar/rejeitar: <500ms
- Lista de pendências: <1s

### Concorrência

**Problema:** Dois usuários tentam reservar mesma data simultaneamente.

**Solução:**
1. Lock otimista com versão
2. Verificação no momento da criação
3. Se conflito, retorna erro e sugere fila de espera

```sql
-- Verificação atômica
INSERT INTO reservas (...)
SELECT ... WHERE NOT EXISTS (
  SELECT 1 FROM reservas
  WHERE espaco_id = ? AND data = ? AND status IN ('pendente', 'aprovado')
)
```

### Jobs Agendados

| Job | Frequência | Descrição |
|-----|------------|-----------|
| `expirar_pendentes` | Diário 00:00 | Expira reservas não aprovadas |
| `concluir_reservas` | Diário 00:00 | Marca como concluído reservas passadas |
| `notificar_fila` | A cada 5 min | Processa fila de espera |
| `expirar_notificacoes_fila` | A cada hora | Remove da fila quem não respondeu |

### Segurança

**Validações:**
- Verificar se usuário pode reservar (ativo, não bloqueado)
- Verificar se espaço está ativo
- Verificar todas as regras do espaço
- Rate limiting: 5 solicitações por minuto por usuário

**Auditoria:**
- Log de todas as ações (criar, aprovar, rejeitar, cancelar)
- Registrar IP e user agent
- Registrar quem aprovou/rejeitou

---

## Fases de Implementação

### Fase 1 - MVP

✅ Solicitar reserva (dia inteiro)
✅ Fluxo de aprovação básico
✅ Bloqueio de data durante pendência
✅ Calendário de disponibilidade
✅ Minhas reservas (lista)
✅ Painel de aprovação (Gerente/ADM)
✅ Notificações básicas (aprovado/rejeitado)
✅ Expiração automática

### Fase 2 - Aprimoramentos

🟡 Suporte a turnos
🟡 Suporte a horas
🟡 Fila de espera
🟡 Bloqueio de espaços relacionados
🟡 Intervalo entre locações
🟡 Cancelamento com prazo
🟡 Histórico detalhado
🟡 Feed social (espaço ocupado)

### Fase 3 - Nice to Have

🟢 Reserva recorrente (semanal/mensal)
🟢 Exportar relatórios
🟢 Analytics de uso
🟢 Integração com calendário externo
🟢 Lembretes antes da data

---

## Métricas de Sucesso

### KPIs a Acompanhar

**Volume:**
- Total de reservas por mês
- Reservas por espaço
- Taxa de ocupação (dias reservados / dias disponíveis)

**Fluxo:**
- Tempo médio de aprovação (pendente → aprovado)
- Taxa de aprovação (aprovados / total)
- Taxa de expiração (expirados / pendentes)
- Taxa de cancelamento

**Fila de Espera:**
- Tamanho médio da fila por espaço
- Taxa de conversão (notificado → confirmou)
- Tempo médio na fila

**Engajamento:**
- Usuários únicos fazendo reservas
- Reservas por usuário (média)
- Espaços mais procurados

---

## Relacionados

- [README](README.md)
- [API](api.md)
- [Critérios de Aceitação](acceptance-criteria.md)
- [Espaços - Especificação](../09-espacos/spec.md)
- [Notificações](../07-notificacoes/)
