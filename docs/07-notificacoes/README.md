---
module: notificacoes
status: partial
priority: mvp
last_updated: 2026-01-10
---

# Notificações

[← Voltar ao Índice](../README.md)

---

**Status:** 🟡 Parcial
**Prioridade:** 🔴 MVP

---

## Visão Geral

Sistema centralizado de notificações para manter usuários informados sobre atividades relevantes.

---

## Tipos de Notificações

### Feed Social
- [ ] Nova curtida em post
- [ ] Novo comentário em post
- [ ] Resposta em comentário
- [ ] Menção em post/comentário

### Eventos
- [ ] Novo evento criado
- [ ] Lembrete 1 dia antes
- [ ] Lembrete 1 hora antes
- [ ] Evento começou
- [ ] Lembrete de check-in
- [ ] Badge conquistado
- [ ] Evento cancelado
- [ ] Progresso de check-ins

### Sistema
- [ ] Nova mensagem
- [ ] Pontos ganhos/gastos
- [ ] Novo ranking alcançado
- [ ] Novos parceiros (benefícios)
- [ ] Carteirinha bloqueada

---

## Configurações do Usuário

Usuário pode desabilitar:
- [ ] Notificações de novos eventos
- [ ] Lembretes de eventos confirmados
- [ ] Lembretes de check-in
- [ ] Notificações de badges
- [ ] Notificações de curtidas
- [ ] Notificações de comentários

---

## Componentes

[A preencher]

---

## API

[A preencher]

---

## Dependências

- [Dashboard](../01-dashboard/) - Badge contador no header
- [Eventos](../04-eventos/) - Notificações de eventos
- [Mensagens](../08-mensagens/)

---

## Relacionados

- [Dashboard - Header](../01-dashboard/components.md)
- [Eventos - Notificações](../04-eventos/spec.md)
