---
module: assinaturas
status: complete
priority: phase2
last_updated: 2026-01-14
---

# Assinaturas

[← Voltar ao Índice](../README.md)

---

**Status:** 🟢 Especificação Completa
**Prioridade:** 🟡 Fase 2

---

## Links Rápidos

| Documento | Descrição |
|-----------|-----------|
| [Especificação](spec.md) | Planos, mutadores e fluxos completos |
| [API](api.md) | Endpoints de assinaturas |
| [Critérios de Aceitação](acceptance-criteria.md) | Checklist de validação |

---

## Visão Geral

Sistema de assinaturas premium que permite ao ADM criar planos com benefícios exclusivos. Assinantes ganham multiplicadores de pontos, descontos em compras e locações, cashback ampliado e distintivo visual (verificado dourado).

**Objetivo principal:** Gerar receita adicional para a associação.

---

## Objetivos

- Permitir criação de até 3 planos de assinatura pelo ADM
- Oferecer mutadores de benefícios configuráveis por plano
- Exibir verificado dourado para identificar assinantes
- Integrar com convênios para controle de público-alvo
- Fornecer relatórios de assinantes para o ADM

---

## Componentes Principais

### 1. Planos de Assinatura
- Nome, descrição, preço mensal
- Ícone e cor personalizados
- Ordem de exibição na vitrine
- Status ativo/inativo

### 2. Mutadores de Benefícios
| Mutador | Descrição |
|---------|-----------|
| Pontos Eventos | Multiplicador sobre pontos de check-in |
| Pontos Strava | Multiplicador sobre pts/km |
| Pontos Posts | Multiplicador sobre bônus do 1º post |
| Desconto Loja | % de desconto em produtos |
| Desconto PDV | % de desconto em compras no PDV |
| Desconto Espaços | % de desconto em locação |
| Cashback | % de cashback (substitui base) |

### 3. Verificado Dourado
- Ícone ao lado do nome do usuário
- Visível em: posts, stories, perfil
- Dinâmico (desaparece ao perder assinatura)

### 4. Gestão ADM
- Criar/editar/desativar planos
- Suspender/reativar assinaturas
- Relatórios e dashboard

---

## Fluxo Principal

```
┌─────────────────────────────────────────────────────────┐
│                    USUÁRIO                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Dashboard → Acessos Rápidos → "Assinaturas"           │
│                       ↓                                 │
│              ┌───────────────┐                          │
│              │   VITRINE     │                          │
│              │  (3 planos)   │                          │
│              └───────────────┘                          │
│                       ↓                                 │
│              ┌───────────────┐                          │
│              │  DETALHES DO  │                          │
│              │    PLANO      │                          │
│              │  (benefícios) │                          │
│              └───────────────┘                          │
│                       ↓                                 │
│              ┌───────────────┐                          │
│              │   ASSINAR     │                          │
│              │ (confirmação) │                          │
│              └───────────────┘                          │
│                       ↓                                 │
│              ┌───────────────┐                          │
│              │  ASSINATURA   │                          │
│              │    ATIVA      │                          │
│              │ + Verificado  │                          │
│              └───────────────┘                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| Exclusividade | 1 plano por associado |
| Limite de planos | Máximo 3 planos ativos |
| Cancelamento | Livre, a qualquer momento |
| Benefícios pós-cancelamento | Mantidos até fim do período |
| Inadimplência | Suspende assinatura automaticamente |
| Edição de plano | Aplica imediatamente a todos |
| Troca de plano | Efeito imediato |
| Cobrança | Externa (fora do sistema) |

---

## Dependências

**Depende de:**
- [Sistema de Pontos](../06-sistema-pontos/) - Aplicar mutadores
- [Perfil](../02-perfil/) - Exibir verificado
- [Dashboard](../01-dashboard/) - Acesso rápido e verificado em posts

**Módulos que dependem:**
- [Carteirinha/Benefícios](../03-carteirinha/benefits.md) - Público-alvo de convênios
- [Loja](../14-loja/) - Aplicar descontos
- [PDV](../16-pdv/) - Aplicar descontos
- [Espaços/Reservas](../10-reservas/) - Aplicar descontos

---

## Notificações

| Evento | Notificação |
|--------|-------------|
| Assinatura ativada | "Sua assinatura [Plano] está ativa!" |
| Assinatura suspensa | "Sua assinatura foi suspensa" |
| Assinatura cancelada | "Sua assinatura foi cancelada" |
| Troca de plano | "Você trocou para o plano [Novo Plano]" |

---

## Métricas de Sucesso

**KPIs a Acompanhar:**

1. **Conversão:**
   - % de associados que assinam
   - Plano mais popular

2. **Retenção:**
   - Taxa de cancelamento mensal
   - Tempo médio de assinatura

3. **Receita:**
   - Receita mensal por assinaturas
   - Receita por plano

4. **Engajamento:**
   - Uso de benefícios por assinantes vs não-assinantes
   - Acesso a convênios exclusivos
