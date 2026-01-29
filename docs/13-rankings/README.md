---
module: rankings
document: README
status: complete
priority: phase2
last_updated: 2026-01-28
---

# Rankings

[← Voltar ao Índice](../README.md)

---

**Status:** 🟢 Concluído
**Prioridade:** 🟡 Fase 2

---

## Links Rápidos

| Documento | Descrição |
|-----------|-----------|
| [Especificação](spec.md) | Detalhes técnicos e fluxos |
| [API](api.md) | Endpoints e contratos |
| [Critérios de Aceitação](acceptance-criteria.md) | Checklist de validação |
| [Badges](badges.md) | Sistema de badges de pódio |

---

## Visão Geral

Sistema de rankings e leaderboards que classifica usuários com base na origem dos pontos acumulados. Os usuários no pódio (Top 3) de cada categoria recebem automaticamente badges de destaque exibidas no perfil.

O ranking opera em **tempo real**, atualizando posições instantaneamente conforme novos pontos são creditados.

---

## Tipos de Rankings

| Categoria | Fonte de Dados | Descrição |
|-----------|----------------|-----------|
| **Posts** | `daily_post` | Pontos ganhos pelo primeiro post do dia |
| **Eventos** | `event_checkin` | Pontos ganhos por check-in em eventos |
| **Strava** | `strava_activity` | Pontos ganhos por atividade física sincronizada |

---

## Períodos

| Período | Descrição | Reset |
|---------|-----------|-------|
| **Mensal** | Ranking do mês atual | Dia 1 de cada mês |
| **All-time** | Ranking histórico acumulado | Nunca |

**Regra de desempate:** Em caso de empate, prevalece quem atingiu a pontuação primeiro (timestamp).

---

## Componentes Principais

1. **Tela de Rankings**
   - Acesso via carrossel de acesso rápido no Dashboard
   - Exibe Top 10 + posição do usuário logado
   - Tabs para alternar entre categorias
   - Toggle para alternar entre períodos

2. **Badges de Pódio**
   - 18 tipos (3 categorias × 2 períodos × 3 posições)
   - Concedidas automaticamente ao entrar no Top 3
   - Removidas automaticamente ao sair do pódio
   - Configuráveis pelo ADM (nome, ícone, cores, descrição)

3. **Timeline de Histórico**
   - Registro de conquistas passadas no perfil
   - Exibição cronológica de badges ganhas/perdidas

---

## Sistema de Badges

O sistema de badges premia os Top 3 de cada categoria e período:

| Posição | Badge Mensal | Badge All-time |
|---------|--------------|----------------|
| Top 1 | Rei do Mês | Lenda |
| Top 2 | Vice | Elite |
| Top 3 | Bronze | Destaque |

**Gestão:** ADM pode personalizar completamente o visual de cada badge.

**Exibição:** Máximo 3 badges visíveis no header do perfil. Usuário escolhe quais exibir.

→ [Detalhes completos em badges.md](badges.md)

---

## Dependências

| Módulo | Relação |
|--------|---------|
| [Sistema de Pontos](../06-sistema-pontos/) | Fonte de dados das transações |
| [Perfil](../02-perfil/) | Exibição de badges e aba Rankings |
| [Dashboard](../01-dashboard/) | Card de acesso rápido |
| [Eventos](../04-eventos/) | Source de check-ins |

---

## Relacionados

- [Sistema de Pontos - Spec](../06-sistema-pontos/spec.md) - Seção 7 (Rankings)
- [Perfil - Spec](../02-perfil/spec.md) - Badges no perfil
- [Dashboard - Components](../01-dashboard/components.md) - Carrossel de acesso rápido
