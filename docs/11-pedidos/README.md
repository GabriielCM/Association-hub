---
module: pedidos
document: README
status: complete
priority: phase2
last_updated: 2026-01-13
---

# Pedidos

[← Voltar ao Índice](../README.md)

---

**Status:** 🟢 Concluído
**Prioridade:** 🟡 Fase 2

---

## Visão Geral

O módulo de Pedidos é a central de histórico de compras do usuário, unificando transações da **Loja** (produtos online) e do **PDV** (kiosks físicos).

### Fontes de Pedidos

| Fonte | Descrição | Source |
|-------|-----------|--------|
| **Loja** | Compras no catálogo do app | `store` |
| **PDV** | Compras em kiosks físicos (geladeira, etc) | `pdv` |

### Fluxo de Status

```
pending → confirmed → ready → completed
                                  ↓
                             cancelled
```

| Status | Descrição |
|--------|-----------|
| `pending` | Pagamento confirmado, aguardando processamento |
| `confirmed` | Pedido confirmado, em separação |
| `ready` | Pronto para retirada |
| `completed` | Retirado/concluído |
| `cancelled` | Cancelado (apenas por ADM) |

---

## Índice de Documentos

| Documento | Descrição |
|-----------|-----------|
| [Especificação](spec.md) | Modelo de dados, fluxos e funcionalidades |
| [API](api.md) | Endpoints REST |
| [Critérios de Aceitação](acceptance-criteria.md) | Checklist de validação |

---

## Funcionalidades

### Para Usuários (Common User)

- Visualizar histórico de todos os pedidos
- Filtrar por tipo (Loja/PDV)
- Ver detalhes completos de cada pedido
- Acompanhar timeline de status
- Acessar QR Code de retirada
- Visualizar comprovante digital
- Ver código de vouchers comprados

### Para Administradores (ADM)

- Dashboard de pedidos pendentes
- Atualizar status de pedidos
- Escanear QR Code para confirmar retirada
- Cancelar pedidos com estorno de pontos
- Ações em lote (atualizar múltiplos pedidos)
- Relatórios de vendas
- Exportação CSV

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                   MÓDULO DE PEDIDOS                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    ┌──────────────┐                          │
│                    │   PEDIDOS    │                          │
│                    │  (Histórico) │                          │
│                    └──────────────┘                          │
│                           │                                  │
│              ┌────────────┴────────────┐                     │
│              ▼                         ▼                     │
│     ┌──────────────┐          ┌──────────────┐              │
│     │    LOJA      │          │     PDV      │              │
│     │  (Módulo 12) │          │  (Módulo 16) │              │
│     │              │          │              │              │
│     │ • Produtos   │          │ • Kiosks     │              │
│     │ • Vouchers   │          │ • Bebidas    │              │
│     │ • Serviços   │          │ • Snacks     │              │
│     └──────────────┘          └──────────────┘              │
│              │                         │                     │
│              └────────────┬────────────┘                     │
│                           ▼                                  │
│                    ┌──────────────┐                          │
│                    │   SISTEMA    │                          │
│                    │  DE PONTOS   │                          │
│                    │  (Módulo 6)  │                          │
│                    └──────────────┘                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Integrações

### Loja (Módulo 12)

- Pedidos da loja aparecem com `source = 'store'`
- Inclui produtos físicos, vouchers e serviços
- Detalhes completos: itens, variações, valores

### PDV (Módulo 16)

- Compras em kiosks aparecem com `source = 'pdv'`
- Mesmo nível de detalhe que Loja
- Inclui nome do PDV de origem

### Sistema de Pontos (Módulo 06)

| Operação | Source | Tipo |
|----------|--------|------|
| Compra na Loja | `shop_purchase` | debit |
| Compra no PDV | `pdv_purchase` | debit |
| Cancelamento | `refund` | credit |

### Notificações (Módulo 07)

| Evento | Notificação |
|--------|-------------|
| Pedido confirmado | Push + in-app |
| Pedido pronto | Push + in-app |
| Pedido cancelado | Push + in-app |

---

## Dependências

- [Loja](../12-loja/) - Origem de pedidos de produtos
- [PDV](../16-pdv/) - Origem de pedidos de kiosks
- [Sistema de Pontos](../06-sistema-pontos/) - Estorno em cancelamentos
- [Notificações](../07-notificacoes/) - Alertas de status

---

## Relacionados

- [Minha Carteira](../05-minha-carteira/) - Visualização de transações de pontos

---

## Fluxos Principais

### Visualização de Pedido

```
Lista de Pedidos → Selecionar → Detalhes → Timeline → QR Code (se físico)
```

### Retirada de Produto

```
Pedido Pronto → Notificação → Usuário vai à sede → Mostra QR → ADM escaneia → Concluído
```

### Cancelamento (ADM)

```
Pedido Pendente → ADM cancela → Pontos estornados → Estoque restaurado → Usuário notificado
```

### Uso de Voucher

```
Pedido Concluído (voucher) → Acessar código no pedido → Usar em parceiro
```
