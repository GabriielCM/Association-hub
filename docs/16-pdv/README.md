---
module: pdv
document: README
status: partial
priority: mvp
last_updated: 2026-01-11
---

# PDV (Ponto de Venda)

[← Voltar ao Índice](../README.md)

---

**Status:** 🟡 Em Especificação
**Prioridade:** 🔴 MVP

---

## Visão Geral

Sistema de Pontos de Venda (PDV) que permite a criação de kiosks com displays para venda de produtos usando pontos como moeda. Cada PDV opera de forma independente com seu próprio catálogo, estoque e relatórios.

O primeiro PDV será a **Geladeira**, um display 24h ao lado de uma geladeira de bebidas.

---

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [Especificação](spec.md) | Arquitetura, fluxos e componentes |
| [API](api.md) | Endpoints para display e ADM |
| [Critérios de Aceitação](acceptance-criteria.md) | Checklist de validação |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      SISTEMA PDV                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌─────────────────────────┐   │
│  │     DISPLAY     │         │         APP             │   │
│  │   (24h ligado)  │         │    (usuário final)      │   │
│  │                 │         │                         │   │
│  │  • Catálogo     │  ←───→  │  • Scanner QR           │   │
│  │  • Carrinho     │   API   │  • Confirmação          │   │
│  │  • Checkout     │         │  • Pagamento            │   │
│  │  • QR Code      │         │                         │   │
│  └─────────────────┘         └─────────────────────────┘   │
│           │                                                 │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     BACKEND                          │   │
│  │                                                      │   │
│  │  • Gestão de PDVs       • Processamento pagamento   │   │
│  │  • Controle estoque     • Relatórios de vendas      │   │
│  │  • Catálogo produtos    • Integração Sistema Pontos │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Compra

```
1. Display exibe catálogo de produtos
        ↓
2. Usuário seleciona produtos no display
        ↓
3. Usuário faz checkout no display
        ↓
4. Display gera QR Code de pagamento
        ↓
5. Usuário escaneia QR com o App
        ↓
6. App mostra detalhes e solicita confirmação
        ↓
7. Usuário confirma com biometria
        ↓
8. App debita pontos e notifica display
        ↓
9. Display confirma pagamento e volta à home
        ↓
10. Usuário pega produto (liberação manual)
```

---

## Componentes do Sistema

### Display (Interface Kiosk)

| Componente | Descrição |
|------------|-----------|
| Catálogo | Lista de produtos com foto, nome e preço |
| Carrinho | Itens selecionados para compra |
| Checkout | Resumo da compra e geração de QR |
| Status | Indicador de pagamento (aguardando/confirmado) |

### App (Minha Carteira)

| Componente | Descrição |
|------------|-----------|
| Scanner | Leitura do QR de pagamento |
| Confirmação | Detalhes da compra e biometria |
| Sucesso | Feedback de pagamento realizado |

### ADM

| Componente | Descrição |
|------------|-----------|
| Gestão de PDVs | Criar, editar, ativar/desativar |
| Catálogo | Produtos disponíveis por PDV |
| Estoque | Controle de quantidade |
| Relatórios | Vendas por período, produto, PDV |

---

## Características

- **Múltiplos PDVs**: Cada PDV é independente
- **Estoque Individual**: Controle por PDV
- **Bloqueio Automático**: Produto bloqueado quando estoque = 0
- **Relatórios por PDV**: Vendas separadas por kiosk
- **QR com Validade**: Checkout expira em 5 minutos
- **Liberação Manual**: Confiança (usuário pega produto)

---

## Dependências

| Módulo | Relação |
|--------|---------|
| [Sistema de Pontos](../06-sistema-pontos/) | Débito de pontos |
| [Minha Carteira](../05-minha-carteira/) | Scanner e pagamento |
| [Notificações](../07-notificacoes/) | Confirmação de pagamento |

---

## Relacionados

- [Sistema de Pontos](../06-sistema-pontos/) - Core do sistema
- [Minha Carteira](../05-minha-carteira/) - Interface de pagamento
- [Loja](../12-loja/) - Outro ponto de resgate
