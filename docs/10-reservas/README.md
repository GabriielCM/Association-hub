---
module: reservas
status: complete
priority: phase2
last_updated: 2026-01-12
---

# Reservas

[← Voltar ao Índice](../README.md)

---

**Status:** 🟢 Completo
**Prioridade:** 🟡 Fase 2

---

## Links Rápidos

| Documento | Descrição |
|-----------|-----------|
| [Especificação](spec.md) | Detalhamento técnico completo |
| [API](api.md) | Endpoints REST |
| [Critérios de Aceitação](acceptance-criteria.md) | Checklist de validação |

---

## Visão Geral

Sistema de reservas de espaços físicos da associação. Funcionários podem solicitar reservas de [espaços](../09-espacos/) cadastrados, e Gerentes/ADMs aprovam ou rejeitam as solicitações. O sistema impede conflitos de agendamento e implementa fila de espera para datas ocupadas.

---

## Objetivos

- Permitir que funcionários solicitem reservas de espaços
- Implementar fluxo de aprovação por Gerente/ADM
- Bloquear datas com reservas pendentes até deliberação
- Prevenir agendamentos duplicados e conflitos
- Implementar fila de espera para datas ocupadas
- Expirar reservas pendentes automaticamente na data
- Manter privacidade (não exibir quem reservou)

---

## Tipos de Usuários

### Common User (Funcionário)
- ✅ Visualizar calendário de disponibilidade
- ✅ Solicitar reserva de espaço
- ✅ Ver status das próprias reservas
- ✅ Cancelar próprias reservas pendentes
- ✅ Entrar na fila de espera
- ❌ Aprovar/rejeitar reservas
- ❌ Ver quem fez outras reservas

### Gerente
- ✅ Tudo que Funcionário pode
- ✅ Aprovar/rejeitar reservas de qualquer funcionário
- ✅ Ver lista de reservas pendentes
- ✅ Ver histórico de reservas do espaço
- ❌ Configurar regras de reserva (espaço)

### ADM (Administrador)
- ✅ Tudo que Gerente pode
- ✅ Fazer exceções às regras (ex: ignorar intervalo)
- ✅ Cancelar reservas aprovadas
- ✅ Exportar relatórios de reservas

---

## Fluxo Principal

```
[Funcionário solicita] → [Pendente] → [Gerente/ADM aprova] → [Aprovado]
                              ↓                                   ↓
                         [Rejeitado]                        [Executado]
                              ↓                                   ↓
                    [Notifica próximo da fila]             [Concluído]
```

**Regras importantes:**
- Reserva pendente **bloqueia** a data para novas reservas
- Se não aprovada até a data, **expira automaticamente**
- Ao liberar (rejeitar/expirar/cancelar), **notifica fila de espera**

---

## Estados da Reserva

| Estado | Descrição | Permite novas reservas? |
|--------|-----------|------------------------|
| Pendente | Aguardando aprovação | Não (bloqueia a data) |
| Aprovado | Confirmado para uso | Não |
| Rejeitado | Recusado pelo aprovador | Sim |
| Cancelado | Cancelado pelo usuário ou sistema | Sim |
| Expirado | Não aprovado até a data | Sim |
| Concluído | Data passou, reserva utilizada | N/A |

---

## Visualização

### Calendário Mensal
- Visão de mês com estados por cor
- Navegação entre meses
- Clique na data para ver detalhes/reservar

### Lista de Datas
- Próximas datas disponíveis
- Ordenação cronológica
- Filtro por espaço

### Cores dos Estados
| Cor | Significado |
|-----|-------------|
| Verde | Disponível |
| Amarelo | Pendente (bloqueado) |
| Vermelho | Ocupado (aprovado) |
| Cinza | Bloqueado (ADM) |
| Laranja | Manutenção |

---

## Fila de Espera

Quando uma data está ocupada ou pendente:
1. Funcionário pode entrar na fila de espera
2. Se a reserva for cancelada/rejeitada/expirada:
   - Primeiro da fila é notificado
   - Tem 24h para confirmar interesse
   - Se não confirmar, próximo da fila é notificado
3. Posição na fila é visível para o usuário

---

## Notificações

| Evento | Destinatário |
|--------|--------------|
| Nova solicitação | Gerentes/ADMs (badge no painel) |
| Reserva aprovada | Solicitante |
| Reserva rejeitada | Solicitante |
| Reserva expirada | Solicitante |
| Vaga liberada | Próximo da fila de espera |

---

## Integrações

### Espaços
- Consome lista de espaços e regras de reserva
- Respeita configurações de período, antecedência, intervalo
- Aplica bloqueio de espaços relacionados

### Feed Social
- Mostra apenas "Espaço X está ocupado em [data]"
- Não revela quem reservou (privacidade)

### Sistema de Pontos
- **Não integra** (conforme definido)

### Carteirinha
- **Não integra** (conforme definido)

---

## Privacidade

- Funcionários veem apenas estado (disponível/ocupado/pendente)
- Não é possível ver quem fez a reserva
- Apenas Gerente/ADM veem o solicitante
- Histórico pessoal visível apenas para o próprio usuário

---

## Dependências

- [Espaços](../09-espacos/) - Cadastro de locais
- [Notificações](../07-notificacoes/) - Envio de alertas

---

## Relacionados

- [Especificação Técnica](spec.md)
- [API](api.md)
- [Critérios de Aceitação](acceptance-criteria.md)
- [Espaços](../09-espacos/)
- [Espaços - Especificação](../09-espacos/spec.md)
