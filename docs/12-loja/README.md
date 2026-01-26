---
module: loja
document: README
status: complete
priority: phase2
last_updated: 2026-01-13
---

# Loja

[← Voltar ao Índice](../README.md)

---

**Status:** 🟢 Concluído
**Prioridade:** 🟡 Fase 2

---

## Visão Geral

A Loja é o módulo de e-commerce do A-hub, permitindo que associados adquiram produtos, benefícios e serviços usando pontos e/ou dinheiro (PIX/cartão via Stripe).

### Tipos de Produto

| Tipo | Descrição | Entrega |
|------|-----------|---------|
| **Físico** | Camisetas, bonés, canecas, brindes | Retirada presencial (QR Code) |
| **Voucher** | Descontos, cupons, benefícios em parceiros | Digital automático (código no app) |
| **Serviço** | Aulas, consultas, experiências | Agendamento separado após compra |

### Formas de Pagamento

- **Apenas Pontos** - Produto pago 100% com pontos
- **Apenas Dinheiro** - Produto pago via Stripe (PIX/cartão)
- **Misto** - Combinação de pontos + dinheiro (configurável por produto)

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

- Navegar catálogo por categorias
- Visualizar produtos com galeria de imagens
- Selecionar variações (tamanho, cor)
- Adicionar aos favoritos
- Adicionar ao carrinho ou comprar direto
- Checkout com pontos, dinheiro ou misto
- Avaliar produtos (1-5 estrelas + comentário)
- Acompanhar pedidos em [Pedidos](../11-pedidos/)

### Para Administradores (ADM)

- CRUD de categorias
- CRUD de produtos com variações
- Upload de galeria de imagens
- Gestão de estoque
- Configurar preços promocionais
- Destacar produtos
- Restringir produtos por plano de associação
- Moderar avaliações
- Dashboard de vendas
- Relatórios com exportação CSV

---

## Componentes Principais

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITETURA DA LOJA                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   Catálogo   │    │   Carrinho   │    │   Checkout   │   │
│  │   (Grid)     │───▶│   (Reserva)  │───▶│   (Pag.)     │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│         │                                       │            │
│         ▼                                       ▼            │
│  ┌──────────────┐                       ┌──────────────┐    │
│  │   Detalhes   │                       │   Pedidos    │    │
│  │   Produto    │                       │   (11)       │    │
│  └──────────────┘                       └──────────────┘    │
│         │                                       │            │
│         ▼                                       ▼            │
│  ┌──────────────┐                       ┌──────────────┐    │
│  │   Reviews    │                       │   Sistema    │    │
│  │              │                       │   Pontos (6) │    │
│  └──────────────┘                       └──────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Integrações

### Sistema de Pontos (Módulo 06)

| Operação | Source | Tipo |
|----------|--------|------|
| Compra com pontos | `shop_purchase` | debit |
| Cashback | `shop_cashback` | credit |
| Estorno (cancelamento) | `refund` | credit |

### Stripe

- Pagamento via PIX
- Pagamento via cartão de crédito/débito
- Webhooks para confirmação

### Notificações (Módulo 07)

| Evento | Notificação |
|--------|-------------|
| Compra confirmada | Push + in-app |
| Pedido pronto | Push + in-app |
| Voucher disponível | Push |
| Voucher expirando | Push (7 dias antes) |

### Carteirinha (Módulo 03)

- Verificação de plano de associação para produtos exclusivos

---

## Dependências

- [Sistema de Pontos](../06-sistema-pontos/) - Pagamento e cashback
- [Notificações](../07-notificacoes/) - Alertas ao usuário
- [Carteirinha](../03-carteirinha/) - Verificação de plano

---

## Relacionados

- [Pedidos](../11-pedidos/) - Histórico de compras
- [PDV](../16-pdv/) - Ponto de venda físico (integra com Pedidos)
- [Minha Carteira](../05-minha-carteira/) - Visualização de saldo

---

## Fluxos Principais

### Compra com Pontos

```
Catálogo → Produto → Carrinho → Checkout (pontos) → Confirmação → Pedido
```

### Compra com Dinheiro

```
Catálogo → Produto → Carrinho → Checkout → Stripe PIX → Confirmação → Pedido
```

### Retirada de Produto Físico

```
Pedido Pronto → Notificação → App (QR Code) → ADM escaneia → Entregue
```

### Uso de Voucher

```
Pedido Concluído → Voucher no App → Usuário mostra código → Parceiro valida
```
