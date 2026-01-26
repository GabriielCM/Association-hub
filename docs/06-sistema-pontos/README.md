---
module: sistema-pontos
document: README
status: partial
priority: mvp
last_updated: 2026-01-11
---

# Sistema de Pontos

[← Voltar ao Índice](../README.md)

---

**Status:** 🟡 Em Especificação
**Prioridade:** 🔴 MVP

---

## Visão Geral

Sistema central de gamificação do A-hub que permite aos associados acumular e gastar pontos (Association-points). Os pontos são a moeda única do aplicativo, utilizados para recompensas, transferências entre usuários e pagamentos em PDVs.

---

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [Especificação](spec.md) | Visão completa do sistema, modelo de dados, fluxos |
| [API](api.md) | Endpoints para saldo, histórico, transferências, Strava |
| [Critérios de Aceitação](acceptance-criteria.md) | Checklist de validação e testes |

---

## Fontes de Pontos

| Fonte | Descrição | Configuração |
|-------|-----------|--------------|
| Check-in em eventos | Crédito imediato ao fazer check-in | Por evento (ADM) |
| Integração Strava | Atividades físicas convertidas em pontos | Por tipo de atividade (ADM) |
| Primeiro post do dia | Bônus diário por engajamento no feed | Valor configurável (ADM) |

---

## Consumo de Pontos

| Destino | Descrição |
|---------|-----------|
| [Loja](../12-loja/) | Resgate de produtos e benefícios |
| [Jukebox](../15-jukebox/) | Seleção de músicas em eventos |
| [PDV](../16-pdv/) | Pagamento em kiosks (ex: geladeira) |
| Transferência | Envio de pontos para outros associados |

---

## Funcionalidades Principais

- **Saldo em tempo real** - Visível no dashboard, perfil e carteira
- **Histórico completo** - Filtros por período, tipo e fonte
- **Transferências** - Via QR da carteirinha, busca ou recentes
- **Integração Strava** - OAuth permanente, sync manual, limite 5km/dia
- **Rankings** - Por pontos totais, eventos e atividades físicas
- **Notificações push** - Recebimento, gasto e lembretes

---

## Integrações

### Strava
- Conexão via OAuth 2.0 permanente
- Sincronização manual pelo usuário
- Limite: 5km pontuáveis por dia
- Taxas padrão: Corrida 10pts/km, Bike 5pts/km
- Tipos de atividade configuráveis pelo ADM

### Eventos
- Check-in credita pontos imediatamente
- Celebração em tela cheia
- Pontos por evento configuráveis

### Dashboard
- Card de saldo com acesso rápido
- Toast de celebração para ganhos

---

## Configuração ADM

- Taxas de conversão por fonte
- Ativação/desativação de fontes
- Estorno manual de transações
- Relatórios completos (CSV + gráficos)
- Crédito/débito manual

---

## Dependências

| Módulo | Relação |
|--------|---------|
| [Eventos](../04-eventos/) | Distribuição de pontos via check-in |
| [Dashboard](../01-dashboard/) | Exibição do saldo e card de pontos |
| [Minha Carteira](../05-minha-carteira/) | Interface de gestão de pontos |
| [Notificações](../07-notificacoes/) | Push de recebimento e gasto |

---

## Relacionados

- [Minha Carteira](../05-minha-carteira/) - Interface do usuário
- [PDV](../16-pdv/) - Pagamento em kiosks
- [Loja](../12-loja/) - Resgate de produtos
- [Jukebox](../15-jukebox/) - Pagamento para músicas
- [Rankings](../13-rankings/) - Leaderboards de pontos
