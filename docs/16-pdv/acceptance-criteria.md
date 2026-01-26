---
module: pdv
document: acceptance-criteria
status: complete
priority: mvp
last_updated: 2026-01-13
---

# PDV - Critérios de Aceitação

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Interface do Display](#1-interface-do-display)
2. [Fluxo de Compra](#2-fluxo-de-compra)
3. [Integração com App](#3-integração-com-app)
4. [Pagamento PIX](#4-pagamento-pix)
5. [Gestão de Estoque](#5-gestão-de-estoque)
6. [Painel ADM](#6-painel-adm)
7. [Validação Final](#7-validação-final)

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
- [ ] Cada produto mostra foto, nome, preço em pontos E em R$
- [ ] Preço em R$ é calculado via taxa global
- [ ] Produtos esgotados mostram "Esgotado" (não clicável)
- [ ] Categorias organizam produtos
- [ ] Botão de carrinho mostra contador de itens
- [ ] Botão "Ir para Checkout" é visível

### 1.3 Carrinho/Checkout

- [ ] Lista de itens selecionados
- [ ] Quantidade pode ser alterada (+/-)
- [ ] Item pode ser removido
- [ ] Total em pontos é calculado corretamente
- [ ] Total em R$ é calculado corretamente
- [ ] Botão "Gerar QR" inicia checkout
- [ ] Botão "Cancelar" limpa carrinho

### 1.4 Tela de QR Code

- [ ] QR Code é exibido grande e legível
- [ ] Total em pontos E em R$ é exibido
- [ ] Mensagem "Pague com Pontos ou PIX" é visível
- [ ] Timer de expiração é exibido
- [ ] Mensagem "Aguardando pagamento" é visível
- [ ] Animação de loading indica espera
- [ ] Botão "Cancelar" está disponível

### 1.5 Tela de Aguardando PIX

- [ ] Exibida quando usuário escolhe PIX no app
- [ ] Mensagem "Aguardando pagamento PIX..." é visível
- [ ] Total em R$ é exibido
- [ ] Timer de expiração do PIX é exibido
- [ ] Animação indica espera
- [ ] Botão "Cancelar" está disponível

### 1.6 Tela de Sucesso

- [ ] Animação de confirmação (✓)
- [ ] Mensagem "Pagamento Confirmado"
- [ ] Se PIX: exibe "+X pts de cashback"
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
- [ ] Total em pontos E em R$ é exibido

### 3.2 Escolha de Método de Pagamento

- [ ] Duas opções são exibidas: "Pagar com Pontos" e "Pagar com PIX"
- [ ] Saldo atual de pontos é exibido
- [ ] Preview de cashback é exibido na opção PIX
- [ ] Pagamento misto NÃO é oferecido (diferente da Loja)

### 3.3 Pagamento com Pontos

- [ ] Saldo após pagamento é exibido
- [ ] Botão de biometria funciona
- [ ] Fallback para PIN funciona
- [ ] Pagamento processa em < 3 segundos
- [ ] Pontos são debitados
- [ ] Transação é registrada
- [ ] Estoque é atualizado

### 3.4 Feedback (Pontos)

- [ ] Tela de sucesso no app
- [ ] Novo saldo é exibido
- [ ] Display é notificado

### 3.5 Erros

- [ ] Saldo insuficiente: mensagem clara
- [ ] Checkout expirado: mensagem clara
- [ ] Checkout já pago: mensagem clara
- [ ] Erro de conexão: permite retry

---

## 4. Pagamento PIX

### 4.1 Geração do PIX

- [ ] Ao escolher PIX, QR Code é gerado via Stripe
- [ ] QR Code PIX é exibido no app
- [ ] Código Copia e Cola disponível
- [ ] Valor em R$ é exibido
- [ ] Timer de expiração (5 min) é exibido
- [ ] Display recebe webhook e mostra "Aguardando PIX..."

### 4.2 Pagamento no Banco

- [ ] QR Code pode ser escaneado por app de banco
- [ ] Código Copia e Cola funciona
- [ ] Pagamento é processado pelo banco
- [ ] Stripe envia webhook de confirmação

### 4.3 Confirmação

- [ ] Backend recebe webhook do Stripe
- [ ] Checkout marcado como pago
- [ ] Estoque é debitado
- [ ] Cashback é calculado
- [ ] Cashback é creditado na carteira do usuário
- [ ] Transação de cashback é registrada
- [ ] Display recebe webhook de confirmação
- [ ] App mostra tela de sucesso

### 4.4 Feedback (PIX)

- [ ] Novo saldo (com cashback) é exibido no app
- [ ] Pontos de cashback são destacados
- [ ] Display mostra confirmação

### 4.5 Expiração do PIX

- [ ] Timer decrementa corretamente
- [ ] Ao expirar, app mostra mensagem
- [ ] Usuário pode tentar novamente
- [ ] Display volta ao início

### 4.6 Cancelamento

- [ ] Botão "Cancelar" funciona
- [ ] PIX pendente é cancelado
- [ ] Display volta ao início
- [ ] App volta à tela inicial

### 4.7 Cashback

- [ ] Cashback calculado com taxa global
- [ ] Cashback arredondado corretamente
- [ ] Source `pdv_cashback` na transação
- [ ] Saldo atualizado imediatamente

---

## 5. Gestão de Estoque

### 5.1 Exibição

- [ ] Estoque atual é exibido por produto
- [ ] Produtos esgotados são destacados
- [ ] Estoque baixo (< 5) tem alerta
- [ ] Total de produtos é exibido

### 5.2 Reposição

- [ ] ADM pode alterar estoque
- [ ] Campo aceita valores válidos (≥ 0)
- [ ] Motivo pode ser registrado
- [ ] Alteração é salva corretamente

### 5.3 Débito Automático

- [ ] Estoque é debitado após pagamento
- [ ] Quantidade debitada corresponde à compra
- [ ] Produto fica indisponível quando estoque = 0

### 5.4 Alertas

- [ ] Alerta de estoque baixo é enviado
- [ ] Alerta de produto esgotado é enviado
- [ ] Notificação via email/push para ADM

---

## 6. Painel ADM

### 6.1 Lista de PDVs

- [ ] Todos os PDVs são listados
- [ ] Status (ativo/inativo) é exibido
- [ ] Estatísticas resumidas por PDV
- [ ] Botões de ação funcionam

### 6.2 Criar PDV

- [ ] Formulário de criação funciona
- [ ] Nome e localização são obrigatórios
- [ ] API Key e Secret são gerados
- [ ] PDV é criado como inativo

### 6.3 Editar PDV

- [ ] Dados são carregados
- [ ] Alterações são salvas
- [ ] Status pode ser alterado

### 6.4 Gestão de Produtos

- [ ] Produtos do PDV são listados
- [ ] Produto pode ser adicionado
- [ ] Produto pode ser editado
- [ ] Produto pode ser removido
- [ ] Preço em pontos é obrigatório

### 6.5 Relatórios

- [ ] Relatório de vendas é gerado
- [ ] Filtro por período funciona
- [ ] Total de vendas é exibido
- [ ] Receita em pontos é exibida
- [ ] Produtos mais vendidos são listados
- [ ] Vendas por hora são exibidas
- [ ] Exportação funciona (se implementada)

---

## 7. Validação Final

### 7.1 Funcional (End-to-End)

- [ ] Fluxo completo com PONTOS: Display → App → Pontos → Sucesso
- [ ] Fluxo completo com PIX: Display → App → PIX → Webhook → Sucesso
- [ ] Estoque é debitado corretamente (ambos métodos)
- [ ] Pontos são debitados corretamente (pagamento com pontos)
- [ ] PIX é confirmado via webhook Stripe (pagamento com PIX)
- [ ] Cashback é creditado corretamente (pagamento com PIX)
- [ ] Transação é registrada no histórico (ambos métodos)
- [ ] Display recebe confirmação (ambos métodos)
- [ ] Pagamento misto é rejeitado

### 7.2 Performance

| Operação | Meta | Status |
|----------|------|--------|
| Carregar catálogo | < 2s | [ ] |
| Gerar checkout/QR | < 1s | [ ] |
| Verificar status (polling) | < 500ms | [ ] |
| Notificar display (webhook) | < 2s | [ ] |
| Processar pagamento (pontos) | < 3s | [ ] |
| Gerar QR PIX (Stripe) | < 2s | [ ] |
| Webhook PIX (Stripe → Display) | < 3s | [ ] |

### 7.3 Resiliência

- [ ] Display funciona com catálogo cacheado offline
- [ ] Checkout requer conexão (mensagem clara)
- [ ] Retry automático em falhas de rede
- [ ] Webhook tem retry em caso de falha

### 7.4 Segurança

- [ ] API Key autentica display corretamente
- [ ] QR Code do display expira em 5 minutos
- [ ] QR Code PIX expira em 5 minutos
- [ ] QR Code não pode ser reutilizado
- [ ] Biometria é obrigatória no app (pagamento com pontos)
- [ ] Transação é atômica
- [ ] Webhook Stripe é validado (assinatura)
- [ ] PIX não expõe dados sensíveis do usuário

### 7.5 Consistência

- [ ] Estoque nunca fica negativo
- [ ] Checkout expirado não pode ser pago (pontos ou PIX)
- [ ] PIX expirado não pode ser pago
- [ ] Produto esgotado não pode ser comprado
- [ ] Saldo insuficiente bloqueia pagamento (pontos)
- [ ] Cashback não é creditado se PIX falhar
- [ ] Pagamento misto é sempre rejeitado no PDV

### 7.6 Acessibilidade do Display

- [ ] Touch targets ≥ 48x48px
- [ ] Contraste adequado
- [ ] Textos legíveis à distância
- [ ] Feedback visual claro

---

## Relacionados

- [Especificação](spec.md) - Arquitetura e fluxos
- [API](api.md) - Endpoints
- [Minha Carteira](../05-minha-carteira/acceptance-criteria.md) - Critérios do app
