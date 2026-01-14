---
module: loja
document: acceptance-criteria
status: complete
priority: phase2
last_updated: 2026-01-13
---

# Loja - Critérios de Aceitação

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Catálogo de Produtos](#1-catálogo-de-produtos)
2. [Página de Produto](#2-página-de-produto)
3. [Carrinho de Compras](#3-carrinho-de-compras)
4. [Checkout](#4-checkout)
5. [Favoritos](#5-favoritos)
6. [Avaliações](#6-avaliações)
7. [Painel ADM](#7-painel-adm)
8. [Integrações](#8-integrações)
9. [Performance](#9-performance)
10. [Acessibilidade](#10-acessibilidade)

---

## 1. Catálogo de Produtos

### 1.1 Listagem Geral

- [ ] **CAT-01** Usuário visualiza grid de produtos com 2 colunas em mobile
- [ ] **CAT-02** Card exibe: imagem, nome, rating, preço em pontos e/ou dinheiro
- [ ] **CAT-03** Produtos esgotados aparecem com overlay "Esgotado"
- [ ] **CAT-04** Produtos exclusivos exibem badge do plano requerido
- [ ] **CAT-05** Produtos em promoção exibem badge com desconto
- [ ] **CAT-06** Paginação infinita carrega mais itens ao rolar

### 1.2 Destaques

- [ ] **CAT-07** Seção de destaques aparece no topo com scroll horizontal
- [ ] **CAT-08** Apenas produtos com `is_featured = true` aparecem em destaques
- [ ] **CAT-09** Máximo de 10 produtos na seção de destaques

### 1.3 Categorias

- [ ] **CAT-10** Chips de categoria aparecem abaixo dos destaques
- [ ] **CAT-11** Tap em categoria filtra produtos
- [ ] **CAT-12** Chip "Todos" remove filtro de categoria
- [ ] **CAT-13** Apenas categorias com produtos ativos são exibidas

### 1.4 Ordenação

- [ ] **CAT-14** Dropdown de ordenação com opções: Recentes, Preço (menor/maior), Mais Vendidos, A-Z
- [ ] **CAT-15** Ordenação padrão é "Mais Recentes"
- [ ] **CAT-16** Seleção persiste durante navegação na loja

---

## 2. Página de Produto

### 2.1 Informações Básicas

- [ ] **PRD-01** Exibe galeria de imagens com carrossel
- [ ] **PRD-02** Indicadores (dots) mostram posição na galeria
- [ ] **PRD-03** Tap na imagem abre visualização em tela cheia
- [ ] **PRD-04** Pinch to zoom funciona na visualização ampliada
- [ ] **PRD-05** Exibe nome do produto em destaque
- [ ] **PRD-06** Exibe rating médio e link para ver avaliações
- [ ] **PRD-07** Exibe preço em pontos (se aceita pontos)
- [ ] **PRD-08** Exibe preço em dinheiro (se aceita dinheiro)
- [ ] **PRD-09** Exibe saldo de pontos do usuário
- [ ] **PRD-10** Exibe percentual de cashback (se configurado)

### 2.2 Variações

- [ ] **PRD-11** Exibe opções de variação (tamanho, cor, etc.)
- [ ] **PRD-12** Variações esgotadas ficam desabilitadas (cinza)
- [ ] **PRD-13** Seleção de variação atualiza imagem (se variação tem imagem)
- [ ] **PRD-14** Seleção de variação atualiza preço (se variação tem preço diferente)
- [ ] **PRD-15** Seleção de variação atualiza estoque disponível
- [ ] **PRD-16** Não permite adicionar ao carrinho sem selecionar variação

### 2.3 Descrição e Especificações

- [ ] **PRD-17** Exibe descrição curta visível
- [ ] **PRD-18** Exibe descrição longa com "Ver mais" expansível
- [ ] **PRD-19** Exibe especificações em formato chave-valor
- [ ] **PRD-20** Exibe local de retirada para produtos físicos

### 2.4 Restrições

- [ ] **PRD-21** Exibe "Limite: X por pessoa" quando configurado
- [ ] **PRD-22** Exibe estoque disponível
- [ ] **PRD-23** Produto exclusivo mostra mensagem se usuário não é elegível
- [ ] **PRD-24** Botões de ação desabilitados se usuário não é elegível

### 2.5 Ações

- [ ] **PRD-25** Botão "Adicionar ao Carrinho" funcional
- [ ] **PRD-26** Botão "Comprar Agora" leva direto ao checkout
- [ ] **PRD-27** Ícone de favorito alterna estado
- [ ] **PRD-28** Botão de compartilhar abre sheet nativo

---

## 3. Carrinho de Compras

### 3.1 Visualização

- [ ] **CRT-01** Exibe lista de itens com foto, nome, variação, preço
- [ ] **CRT-02** Exibe timer de expiração da reserva
- [ ] **CRT-03** Exibe subtotal em pontos
- [ ] **CRT-04** Exibe subtotal em dinheiro
- [ ] **CRT-05** Exibe saldo de pontos do usuário

### 3.2 Manipulação

- [ ] **CRT-06** Botões +/- alteram quantidade
- [ ] **CRT-07** Quantidade não excede estoque disponível
- [ ] **CRT-08** Quantidade não excede limite por usuário
- [ ] **CRT-09** Botão remover exclui item do carrinho
- [ ] **CRT-10** Confirma antes de remover último item

### 3.3 Reserva de Estoque

- [ ] **CRT-11** Itens reservam estoque por 30 minutos
- [ ] **CRT-12** Timer exibe tempo restante
- [ ] **CRT-13** Qualquer alteração renova timer para 30 minutos
- [ ] **CRT-14** Após expiração, itens são removidos e estoque liberado
- [ ] **CRT-15** Notificação exibida se carrinho expirar com app aberto

### 3.4 Validações

- [ ] **CRT-16** Item indisponível é destacado com alerta
- [ ] **CRT-17** Preço atualizado se promoção expirar
- [ ] **CRT-18** Usuário notificado sobre alterações de preço/disponibilidade

---

## 4. Checkout

### 4.1 Seleção de Pagamento

- [ ] **CHK-01** Opção "Pagar com Pontos" disponível se produto aceita
- [ ] **CHK-02** Opção "Pagar com Pontos" desabilitada se saldo insuficiente
- [ ] **CHK-03** Exibe mensagem "Faltam X pontos" quando saldo insuficiente
- [ ] **CHK-04** Opção "Pagar com Dinheiro" disponível se produto aceita
- [ ] **CHK-05** Opção "Pagamento Misto" disponível se produto aceita ambos
- [ ] **CHK-06** Slider de pontos permite definir quantidade no pagamento misto
- [ ] **CHK-07** Exibe cashback a ser ganho em compras com dinheiro

### 4.2 Pagamento com Pontos

- [ ] **CHK-08** Solicita biometria/PIN antes de debitar
- [ ] **CHK-09** Debita pontos do saldo do usuário
- [ ] **CHK-10** Cria transação com source = `shop_purchase`
- [ ] **CHK-11** Exibe tela de sucesso com animação
- [ ] **CHK-12** Exibe QR Code de retirada para produtos físicos

### 4.3 Pagamento com Dinheiro (Stripe)

- [ ] **CHK-13** Opção PIX exibe QR Code
- [ ] **CHK-14** QR Code PIX expira em 15 minutos
- [ ] **CHK-15** Opção Cartão abre form Stripe Elements
- [ ] **CHK-16** Webhook confirma pagamento
- [ ] **CHK-17** Cashback creditado após confirmação
- [ ] **CHK-18** Exibe tela de sucesso após confirmação

### 4.4 Pagamento Misto

- [ ] **CHK-19** Debita pontos selecionados primeiro
- [ ] **CHK-20** Processa restante via Stripe
- [ ] **CHK-21** Credita cashback sobre valor em dinheiro
- [ ] **CHK-22** Rollback de pontos se pagamento Stripe falhar

### 4.5 Pós-Checkout

- [ ] **CHK-23** Pedido criado com status `pending`
- [ ] **CHK-24** Estoque definitivamente decrementado
- [ ] **CHK-25** Carrinho limpo após sucesso
- [ ] **CHK-26** Push notification enviada
- [ ] **CHK-27** Voucher gerado com código (se tipo = voucher)
- [ ] **CHK-28** Voucher com validade configurada (se aplicável)

---

## 5. Favoritos

### 5.1 Funcionalidade

- [ ] **FAV-01** Tap no coração adiciona aos favoritos
- [ ] **FAV-02** Tap novamente remove dos favoritos
- [ ] **FAV-03** Estado do coração persiste entre sessões
- [ ] **FAV-04** Badge no header mostra quantidade de favoritos

### 5.2 Tela de Favoritos

- [ ] **FAV-05** Lista todos os produtos favoritados
- [ ] **FAV-06** Ordenado por data de adição (mais recentes primeiro)
- [ ] **FAV-07** Produtos indisponíveis aparecem com overlay
- [ ] **FAV-08** Tap no card abre página do produto
- [ ] **FAV-09** Swipe ou tap no coração remove da lista

---

## 6. Avaliações

### 6.1 Visualização

- [ ] **REV-01** Página de produto exibe rating médio
- [ ] **REV-02** Link "Ver avaliações" abre lista completa
- [ ] **REV-03** Lista exibe distribuição de ratings (gráfico de barras)
- [ ] **REV-04** Cada avaliação mostra: nome, rating, comentário, data
- [ ] **REV-05** Apenas avaliações aprovadas são exibidas

### 6.2 Criação

- [ ] **REV-06** Botão "Avaliar" aparece apenas para quem comprou
- [ ] **REV-07** Usuário pode avaliar apenas uma vez por produto
- [ ] **REV-08** Form requer rating (1-5 estrelas)
- [ ] **REV-09** Comentário é opcional (máx 500 caracteres)
- [ ] **REV-10** Mensagem confirma envio para moderação

### 6.3 Moderação

- [ ] **REV-11** Avaliação criada com status `pending`
- [ ] **REV-12** ADM recebe na fila de moderação
- [ ] **REV-13** ADM pode aprovar ou rejeitar
- [ ] **REV-14** Aprovação publica a avaliação
- [ ] **REV-15** Rejeição permite usuário editar e reenviar
- [ ] **REV-16** Rating médio atualizado após aprovação

---

## 7. Painel ADM

### 7.1 Dashboard

- [ ] **ADM-01** Exibe total de vendas no período
- [ ] **ADM-02** Exibe receita em R$ e pontos
- [ ] **ADM-03** Exibe total de pedidos
- [ ] **ADM-04** Exibe cashback distribuído
- [ ] **ADM-05** Exibe produtos com estoque baixo
- [ ] **ADM-06** Exibe ranking de produtos mais vendidos
- [ ] **ADM-07** Filtro por período funcional

### 7.2 Categorias

- [ ] **ADM-08** Listar todas as categorias (ativas e inativas)
- [ ] **ADM-09** Criar categoria com nome, descrição, imagem
- [ ] **ADM-10** Editar categoria existente
- [ ] **ADM-11** Desativar categoria (soft delete)
- [ ] **ADM-12** Reordenar categorias por drag and drop

### 7.3 Produtos

- [ ] **ADM-13** Listar produtos com filtros (categoria, status, tipo)
- [ ] **ADM-14** Buscar produto por nome
- [ ] **ADM-15** Criar produto com todos os campos
- [ ] **ADM-16** Upload de múltiplas imagens com drag and drop
- [ ] **ADM-17** Criar variações com SKU único
- [ ] **ADM-18** Definir estoque por variação
- [ ] **ADM-19** Ativar/desativar promoção
- [ ] **ADM-20** Marcar/desmarcar como destaque
- [ ] **ADM-21** Definir planos elegíveis
- [ ] **ADM-22** Editar produto existente
- [ ] **ADM-23** Desativar produto (soft delete)

### 7.4 Moderação

- [ ] **ADM-24** Listar avaliações pendentes
- [ ] **ADM-25** Visualizar avaliação completa
- [ ] **ADM-26** Aprovar avaliação
- [ ] **ADM-27** Rejeitar avaliação
- [ ] **ADM-28** Filtrar por status

### 7.5 Relatórios

- [ ] **ADM-29** Relatório de vendas por período
- [ ] **ADM-30** Relatório de vendas por produto
- [ ] **ADM-31** Relatório de vendas por categoria
- [ ] **ADM-32** Relatório de formas de pagamento
- [ ] **ADM-33** Exportar relatório em CSV

---

## 8. Integrações

### 8.1 Sistema de Pontos

- [ ] **INT-01** Débito de pontos cria transação `shop_purchase`
- [ ] **INT-02** Cashback cria transação `shop_cashback`
- [ ] **INT-03** Cancelamento cria transação `refund`
- [ ] **INT-04** Saldo atualizado em tempo real
- [ ] **INT-05** Histórico de transações acessível em Minha Carteira

### 8.2 Stripe

- [ ] **INT-06** PaymentIntent criado corretamente
- [ ] **INT-07** QR Code PIX gerado e exibido
- [ ] **INT-08** Form de cartão funcional
- [ ] **INT-09** Webhook `payment_intent.succeeded` processado
- [ ] **INT-10** Webhook `payment_intent.payment_failed` processado
- [ ] **INT-11** Webhook `charge.refunded` processado

### 8.3 Notificações

- [ ] **INT-12** Push enviado ao confirmar compra
- [ ] **INT-13** Push enviado quando pedido pronto
- [ ] **INT-14** Push enviado quando voucher disponível
- [ ] **INT-15** Push enviado 7 dias antes de voucher expirar
- [ ] **INT-16** Notificação in-app para todos os eventos

### 8.4 Carteirinha

- [ ] **INT-17** Verificação de plano ao acessar produto exclusivo
- [ ] **INT-18** Mensagem clara se usuário não é elegível
- [ ] **INT-19** Produto oculto ou com badge de exclusividade

---

## 9. Performance

### 9.1 Carregamento

- [ ] **PRF-01** Listagem de produtos carrega em < 2 segundos
- [ ] **PRF-02** Página de produto carrega em < 1.5 segundos
- [ ] **PRF-03** Imagens com lazy loading
- [ ] **PRF-04** Skeleton screens durante carregamento

### 9.2 Cache

- [ ] **PRF-05** Lista de categorias cacheada por 1 hora
- [ ] **PRF-06** Lista de produtos cacheada por 15 minutos
- [ ] **PRF-07** Cache invalidado após CRUD
- [ ] **PRF-08** Estoque nunca cacheado (tempo real)

### 9.3 Paginação

- [ ] **PRF-09** Listagem com 20 itens por página
- [ ] **PRF-10** Scroll infinito carrega próxima página
- [ ] **PRF-11** Indicador de loading durante carregamento

---

## 10. Acessibilidade

### 10.1 Navegação

- [ ] **A11Y-01** Todos os elementos interativos acessíveis via VoiceOver/TalkBack
- [ ] **A11Y-02** Labels descritivos em botões e links
- [ ] **A11Y-03** Ordem de foco lógica
- [ ] **A11Y-04** Contraste adequado em todos os textos

### 10.2 Formulários

- [ ] **A11Y-05** Campos de seleção acessíveis
- [ ] **A11Y-06** Erros anunciados por leitores de tela
- [ ] **A11Y-07** Hints disponíveis para campos complexos

### 10.3 Feedback

- [ ] **A11Y-08** Feedback háptico em ações importantes
- [ ] **A11Y-09** Mensagens de sucesso/erro visíveis e anunciadas
- [ ] **A11Y-10** Timer de carrinho anunciado

---

## Resumo de Testes

| Seção | Total | Críticos |
|-------|-------|----------|
| Catálogo | 16 | 6 |
| Produto | 28 | 10 |
| Carrinho | 18 | 8 |
| Checkout | 28 | 15 |
| Favoritos | 9 | 3 |
| Avaliações | 16 | 6 |
| Painel ADM | 33 | 12 |
| Integrações | 19 | 11 |
| Performance | 11 | 5 |
| Acessibilidade | 10 | 4 |
| **TOTAL** | **188** | **80** |
