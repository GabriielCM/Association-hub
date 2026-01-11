---
module: eventos
document: analytics
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Eventos - Analytics (ADM)

[← Voltar ao Índice](README.md)

---

## Índice

- [Dashboard em Tempo Real](#dashboard-em-tempo-real)
- [Métricas Disponíveis](#métricas-disponíveis)
- [Painel de Controle ao Vivo](#painel-de-controle-ao-vivo)
- [Exportar Relatórios](#exportar-relatórios)

---

## Dashboard em Tempo Real

```
┌─────────────────────────────────────────────┐
│ 📊 Analytics - Festa Junina 2026            │
├─────────────────────────────────────────────┤
│                                             │
│ Visão Geral                                 │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ ✓ 42    │ │ ✓ 28    │ │ 66.7%   │        │
│ │Confirm. │ │Check-ins│ │Taxa Pres│        │
│ └─────────┘ └─────────┘ └─────────┘        │
│                                             │
│ ┌─────────┐ ┌─────────┐                    │
│ │ 1.750   │ │ 25      │                    │
│ │Pts Dist.│ │Badges   │                    │
│ └─────────┘ └─────────┘                    │
│                                             │
├─────────────────────────────────────────────┤
│ Check-ins ao Longo do Tempo                 │
│                                             │
│ [Gráfico de Linha]                          │
│  30│     ╭────                              │
│  20│   ╭─╯                                  │
│  10│ ╭─╯                                    │
│   0└────────────────                        │
│    19h  19h30 20h  20h30                    │
│                                             │
├─────────────────────────────────────────────┤
│ Check-ins por Período                       │
│                                             │
│ ■ Check-in 1: 28 pessoas (25 pts cada)      │
│ ■ Check-in 2: 25 pessoas (25 pts cada)      │
│ □ Check-in 3: 0 pessoas (25 pts cada)       │
│ □ Check-in 4: 0 pessoas (25 pts cada)       │
│                                             │
├─────────────────────────────────────────────┤
│ [Exportar CSV] [Exportar PDF]              │
└─────────────────────────────────────────────┘
```

---

## Métricas Disponíveis

### 1. Total de Confirmados

- Número de pessoas que confirmaram presença
- Lista com nomes e avatares

### 2. Total de Check-ins Realizados

- Número total de check-ins (soma de todos)
- Exemplo: 28 pessoas × 2 check-ins = 56 total

### 3. Gráfico de Check-ins ao Longo do Tempo

- Eixo X: Tempo (intervalos de 15 min)
- Eixo Y: Número de check-ins
- Atualiza em tempo real

### 4. Lista de Quem Fez Check-in

Tabela com:
- Nome
- Check-ins feitos (1/4, 2/4, etc)
- Horário de cada check-in
- Pontos ganhos
- Badge ganho (sim/não)

**Funcionalidades:**
- Ordenação: Alfabética, por horário, por pontos
- Busca por nome
- Exportável

### 5. Taxa de Presença

- **Fórmula:** (Usuários com ≥1 check-in) / (Total de membros) × 100
- **Exemplo:** 28 / 500 = 5.6%
- **Também mostra:** Taxa entre confirmados (28 / 42 = 66.7%)

### 6. Pontos Distribuídos

- Total de pontos já distribuídos
- Pontos ainda disponíveis
- Breakdown por check-in

### 7. Comentários/Feedback

- Lista de comentários do evento
- Possibilidade de responder
- Destacar perguntas não respondidas

---

## Painel de Controle ao Vivo

```
┌─────────────────────────────────────────────┐
│ 🎛️ Controle - Festa Junina 2026 (Ativo)    │
├─────────────────────────────────────────────┤
│                                             │
│ Status: 🟢 Em Andamento                     │
│ Check-in atual: 2 de 4                      │
│ Próxima mudança: em 12 minutos              │
│                                             │
│ [📺 Abrir Display] [⏸️ Pausar Check-ins]   │
│                                             │
├─────────────────────────────────────────────┤
│ Check-ins em Tempo Real (últimos 10)        │
│                                             │
│ 🟢 Maria Silva fez check-in 2  (há 1 min)   │
│ 🟢 João Santos fez check-in 2  (há 2 min)   │
│ 🟢 Ana Costa fez check-in 2    (há 3 min)   │
│ ...                                         │
│                                             │
├─────────────────────────────────────────────┤
│ Ações de Emergência                         │
│                                             │
│ [👤 Check-in Manual]                        │
│ [❌ Cancelar Evento]                        │
│                                             │
└─────────────────────────────────────────────┘
```

### Ações Disponíveis

**1. Ver Check-ins em Tempo Real**
- Feed ao vivo de check-ins
- Atualiza via WebSocket
- Mostra nome + check-in feito + timestamp

**2. Pausar Check-ins Temporariamente**
- Botão toggle
- **Efeito:**
  - Display mostra mensagem "Check-ins pausados"
  - QR Code fica oculto
  - Usuários não conseguem fazer check-in
- **Uso:** Problemas técnicos, intervalo forçado

**3. Check-in Manual (Emergência)**
- Modal com busca de usuário
- ADM seleciona:
  - Usuário
  - Qual check-in (1, 2, 3, 4)
  - Motivo (opcional)
- Confirmação de ação
- **Uso:** Usuário com problema técnico, QR Code não funcionou

**4. Cancelar Evento**
- Botão vermelho
- Modal de confirmação + motivo
- **Efeito:**
  - Evento vai para status "Cancelado"
  - Notifica todos que confirmaram
  - Display mostra mensagem de cancelamento
  - Post no feed é atualizado

**5. Abrir Display**
- Abre Display em nova aba/janela
- Fullscreen mode
- Útil para testar ou projetar

---

## Exportar Relatórios

### Formatos Disponíveis

**CSV:**
```csv
Nome,Email,Check-ins,Pontos,Badge,Confirmou,Check-in_1,Check-in_2,Check-in_3,Check-in_4
Maria Silva,maria@email.com,4/4,100,Sim,Sim,19:05,19:35,20:10,20:45
João Santos,joao@email.com,2/4,50,Não,Sim,19:10,19:40,-,-
```

**PDF:**
- Relatório formatado
- Logo da associação
- Gráficos visuais
- Estatísticas resumidas
- Lista completa de participantes

### Conteúdo do Relatório

- Nome do evento
- Data e hora
- Total de confirmados
- Total de check-ins
- Taxa de presença
- Pontos distribuídos
- Lista de participantes com detalhes

---

## Relacionados

- [Especificação](spec.md)
- [Criação de Eventos](creation.md)
- [Display](display.md)
- [API](api.md)
- [Critérios de Aceitação](acceptance-criteria.md)
