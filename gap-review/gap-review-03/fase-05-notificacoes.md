---
review: gap-review-03
document: fase-05
fase: notificacoes
status: pendente
prioridade: critico-mvp
---

# Fase 5: Módulo Notificações

## Objetivo
Completar documentação do módulo 07-notificacoes, único módulo MVP incompleto.

---

## Situação Atual

### Arquivos Existentes
- `README.md` ✓ (status: partial)

### Arquivos Faltando
- `spec.md` ✗
- `api.md` ✗
- `acceptance-criteria.md` ✗

---

## Impacto

O módulo Notificações é referenciado por:
- **Dashboard** - Exibe contador de notificações
- **Eventos** - Notifica sobre eventos, check-ins
- **Mensagens** - Notifica sobre novas mensagens
- **Reservas** - Notifica sobre status de reservas
- **Sistema de Pontos** - Notifica sobre pontos ganhos
- **Loja/Pedidos** - Notifica sobre status de pedidos

**Criticidade:** Alta - Bloqueador para integração completa do MVP

---

## Requisitos para Documentação

### spec.md deve conter:

1. **Visão Geral**
   - Objetivo do módulo
   - Tipos de usuário (Common User, ADM)

2. **Tipos de Notificação**
   - Push notifications
   - In-app notifications
   - Email (se aplicável)

3. **Categorias**
   - Eventos
   - Mensagens
   - Sistema de Pontos
   - Reservas
   - Pedidos
   - Sistema (manutenção, atualizações)

4. **Componentes UI**
   - Badge de contador
   - Lista de notificações
   - Detalhe de notificação
   - Configurações de preferências

5. **Estados**
   - Loading
   - Empty (sem notificações)
   - Error
   - Lista com itens
   - Notificação lida/não lida

6. **Integrações**
   - Firebase Cloud Messaging (ou similar)
   - Sistema de preferências do usuário

### api.md deve conter:

1. **Endpoints**
   - GET /notificacoes - Listar notificações
   - GET /notificacoes/:id - Detalhe
   - PUT /notificacoes/:id/lida - Marcar como lida
   - PUT /notificacoes/todas/lidas - Marcar todas como lidas
   - DELETE /notificacoes/:id - Remover
   - GET /notificacoes/preferencias - Configurações
   - PUT /notificacoes/preferencias - Atualizar configurações

2. **WebSocket** (se real-time)
   - Evento de nova notificação

3. **Modelos**
   - Notificacao
   - PreferenciasNotificacao

### acceptance-criteria.md deve conter:

1. **Listagem**
   - [ ] Usuário pode ver lista de notificações
   - [ ] Notificações não lidas destacadas
   - [ ] Paginação/infinite scroll

2. **Interação**
   - [ ] Usuário pode marcar como lida
   - [ ] Usuário pode marcar todas como lidas
   - [ ] Usuário pode remover notificação

3. **Preferências**
   - [ ] Usuário pode configurar tipos de notificação
   - [ ] Usuário pode ativar/desativar push

4. **Performance**
   - [ ] Lista carrega em < 2s
   - [ ] Badge atualiza em tempo real

---

## Workflow de Descoberta

Antes de criar os arquivos, aplicar as 20 perguntas de descoberta do CLAUDE.md:

### Perguntas Pendentes

**Visão e Propósito:**
1. Quais são os canais de notificação (push, in-app, email)?
2. Há diferença entre notificações para Common User e ADM?

**Funcionalidades Core:**
3. Notificações são agrupáveis (ex: "3 novas mensagens")?
4. Há notificações silenciosas?

**Integrações:**
5. Qual serviço de push (Firebase, OneSignal)?
6. Notificações são armazenadas por quanto tempo?

**Experiência:**
7. Há som/vibração customizável?
8. Deep linking para conteúdo relacionado?

**Regras de Negócio:**
9. Há limite de notificações armazenadas?
10. Política de retenção?

---

## Checklist de Implementação

- [ ] Realizar discovery com stakeholders
- [ ] Criar docs/07-notificacoes/spec.md
- [ ] Criar docs/07-notificacoes/api.md
- [ ] Criar docs/07-notificacoes/acceptance-criteria.md
- [ ] Atualizar docs/07-notificacoes/README.md (status: complete)
- [ ] Adicionar endpoints em api/endpoints-reference.md

## Critério de Aceite

Módulo 07-notificacoes com os 4 arquivos obrigatórios e status `complete`
