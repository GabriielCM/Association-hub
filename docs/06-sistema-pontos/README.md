---
module: sistema-pontos
status: partial
priority: mvp
last_updated: 2026-01-10
---

# Sistema de Pontos

[← Voltar ao Índice](../README.md)

---

**Status:** 🟡 Parcial
**Prioridade:** 🔴 MVP

---

## Visão Geral

Sistema de gamificação através de pontos que podem ser ganhos e gastos no aplicativo.

---

## Formas de Ganhar Pontos

- [ ] Check-in em eventos
- [ ] Participação em enquetes
- [ ] Posts no feed
- [ ] Indicação de novos membros
- [ ] Consumo no bar/restaurante
- [ ] [A definir]

---

## Formas de Gastar Pontos

- [ ] Descontos na loja
- [ ] Reserva de espaços premium
- [ ] Itens exclusivos
- [ ] [A definir]

---

## Integração com Eventos

- Check-in realizado → Pontos creditados automaticamente
- Atualiza saldo em tempo real
- Histórico de transações registra fonte
- **Rollback:** Se evento cancelado após check-ins, pontos NÃO são retirados

---

## Componentes

[A preencher]

---

## API

[A preencher]

---

## Dependências

- [Eventos](../04-eventos/) - Distribuição de pontos via check-in
- [Dashboard](../01-dashboard/) - Exibição do saldo

---

## Relacionados

- [Dashboard - Card Pontos](../01-dashboard/components.md)
- [Minha Carteira](../05-minha-carteira/)
- [Loja](../12-loja/)
