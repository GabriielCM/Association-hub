---
module: pdv
document: acceptance-criteria
status: complete
priority: mvp
last_updated: 2026-01-11
---

# PDV - Critérios de Aceitação

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Interface do Display](#1-interface-do-display)
2. [Fluxo de Compra](#2-fluxo-de-compra)
3. [Integração com App](#3-integração-com-app)
4. [Gestão de Estoque](#4-gestão-de-estoque)
5. [Painel ADM](#5-painel-adm)
6. [Validação Final](#6-validação-final)

---

## 1. Interface do Display

### 1.1 Tela Inicial (Idle)

- [ ] Logo é exibido centralizado
- [ ] Mensagem "Toque para começar" é visível
- [ ] Nome do PDV é exibido
- [ ] Horário atual é exibido
- [ ] Qualquer toque inicia sessão
- [ ] Retorna ao idle após timeout de inatividade

### 1.2 Catálogo de Produtos

- [ ] Produtos são exibidos em grid
- [ ] Cada produto mostra foto, nome e preço
- [ ] Produtos esgotados mostram "Esgotado" (não clicável)
- [ ] Categorias organizam produtos
- [ ] Botão de carrinho mostra contador de itens
- [ ] Botão "Ir para Checkout" é visível

### 1.3 Carrinho/Checkout

- [ ] Lista de itens selecionados
- [ ] Quantidade pode ser alterada (+/-)
- [ ] Item pode ser removido
- [ ] Total é calculado corretamente
- [ ] Botão "Gerar QR" inicia checkout
- [ ] Botão "Cancelar" limpa carrinho

### 1.4 Tela de QR Code

- [ ] QR Code é exibido grande e legível
- [ ] Total é exibido abaixo do QR
- [ ] Timer de expiração é exibido
- [ ] Mensagem "Aguardando pagamento" é visível
- [ ] Animação de loading indica espera
- [ ] Botão "Cancelar" está disponível

### 1.5 Tela de Sucesso

- [ ] Animação de confirmação (✓)
- [ ] Mensagem "Pagamento Confirmado"
- [ ] Instrução para retirar produto
- [ ] Auto-retorno ao idle em 5 segundos

---

## 2. Fluxo de Compra

### 2.1 Seleção de Produtos

- [ ] Tap em produto adiciona ao carrinho
- [ ] Feedback visual ao adicionar
- [ ] Contador do carrinho atualiza
- [ ] Produto esgotado não pode ser adicionado
- [ ] Limite de quantidade respeitado (se configurado)

### 2.2 Criação do Checkout

- [ ] Checkout é criado ao clicar "Gerar QR"
- [ ] QR Code é gerado em < 1 segundo
- [ ] Checkout tem validade de 5 minutos
- [ ] Código único é gerado para cada checkout

### 2.3 Expiração

- [ ] Timer decrementa corretamente
- [ ] Ao expirar, exibe mensagem
- [ ] Retorna ao catálogo automaticamente
- [ ] Checkout marcado como expirado no backend

### 2.4 Cancelamento

- [ ] Botão "Cancelar" funciona
- [ ] Retorna ao catálogo
- [ ] Checkout marcado como cancelado no backend

### 2.5 Pagamento Confirmado

- [ ] Display recebe notificação de pagamento
- [ ] Transição para tela de sucesso < 2s
- [ ] Animação de confirmação é exibida
- [ ] Auto-retorno ao idle funciona

---

## 3. Integração com App

### 3.1 Detecção do QR

- [ ] App detecta QR tipo `pdv_payment`
- [ ] Detalhes do checkout são carregados
- [ ] Nome do PDV é exibido
- [ ] Lista de itens é exibida
- [ ] Total é exibido

### 3.2 Confirmação

- [ ] Saldo atual é exibido
- [ ] Saldo após pagamento é exibido
- [ ] Botão de biometria funciona
- [ ] Fallback para PIN funciona

### 3.3 Processamento

- [ ] Pagamento processa em < 3 segundos
- [ ] Pontos são debitados
- [ ] Transação é registrada
- [ ] Estoque é atualizado

### 3.4 Feedback

- [ ] Tela de sucesso no app
- [ ] Novo saldo é exibido
- [ ] Display é notificado

### 3.5 Erros

- [ ] Saldo insuficiente: mensagem clara
- [ ] Checkout expirado: mensagem clara
- [ ] Checkout já pago: mensagem clara
- [ ] Erro de conexão: permite retry

---

## 4. Gestão de Estoque

### 4.1 Exibição

- [ ] Estoque atual é exibido por produto
- [ ] Produtos esgotados são destacados
- [ ] Estoque baixo (< 5) tem alerta
- [ ] Total de produtos é exibido

### 4.2 Reposição

- [ ] ADM pode alterar estoque
- [ ] Campo aceita valores válidos (≥ 0)
- [ ] Motivo pode ser registrado
- [ ] Alteração é salva corretamente

### 4.3 Débito Automático

- [ ] Estoque é debitado após pagamento
- [ ] Quantidade debitada corresponde à compra
- [ ] Produto fica indisponível quando estoque = 0

### 4.4 Alertas

- [ ] Alerta de estoque baixo é enviado
- [ ] Alerta de produto esgotado é enviado
- [ ] Notificação via email/push para ADM

---

## 5. Painel ADM

### 5.1 Lista de PDVs

- [ ] Todos os PDVs são listados
- [ ] Status (ativo/inativo) é exibido
- [ ] Estatísticas resumidas por PDV
- [ ] Botões de ação funcionam

### 5.2 Criar PDV

- [ ] Formulário de criação funciona
- [ ] Nome e localização são obrigatórios
- [ ] API Key e Secret são gerados
- [ ] PDV é criado como inativo

### 5.3 Editar PDV

- [ ] Dados são carregados
- [ ] Alterações são salvas
- [ ] Status pode ser alterado

### 5.4 Gestão de Produtos

- [ ] Produtos do PDV são listados
- [ ] Produto pode ser adicionado
- [ ] Produto pode ser editado
- [ ] Produto pode ser removido
- [ ] Preço em pontos é obrigatório

### 5.5 Relatórios

- [ ] Relatório de vendas é gerado
- [ ] Filtro por período funciona
- [ ] Total de vendas é exibido
- [ ] Receita em pontos é exibida
- [ ] Produtos mais vendidos são listados
- [ ] Vendas por hora são exibidas
- [ ] Exportação funciona (se implementada)

---

## 6. Validação Final

### 6.1 Funcional (End-to-End)

- [ ] Fluxo completo: Display → App → Pagamento → Sucesso
- [ ] Estoque é debitado corretamente
- [ ] Pontos são debitados corretamente
- [ ] Transação é registrada no histórico
- [ ] Display recebe confirmação

### 6.2 Performance

| Operação | Meta | Status |
|----------|------|--------|
| Carregar catálogo | < 2s | [ ] |
| Gerar checkout/QR | < 1s | [ ] |
| Verificar status (polling) | < 500ms | [ ] |
| Notificar display (webhook) | < 2s | [ ] |
| Processar pagamento | < 3s | [ ] |

### 6.3 Resiliência

- [ ] Display funciona com catálogo cacheado offline
- [ ] Checkout requer conexão (mensagem clara)
- [ ] Retry automático em falhas de rede
- [ ] Webhook tem retry em caso de falha

### 6.4 Segurança

- [ ] API Key autentica display corretamente
- [ ] QR Code expira em 5 minutos
- [ ] QR Code não pode ser reutilizado
- [ ] Biometria é obrigatória no app
- [ ] Transação é atômica

### 6.5 Consistência

- [ ] Estoque nunca fica negativo
- [ ] Checkout expirado não pode ser pago
- [ ] Produto esgotado não pode ser comprado
- [ ] Saldo insuficiente bloqueia pagamento

### 6.6 Acessibilidade do Display

- [ ] Touch targets ≥ 48x48px
- [ ] Contraste adequado
- [ ] Textos legíveis à distância
- [ ] Feedback visual claro

---

## Relacionados

- [Especificação](spec.md) - Arquitetura e fluxos
- [API](api.md) - Endpoints
- [Minha Carteira](../05-minha-carteira/acceptance-criteria.md) - Critérios do app
