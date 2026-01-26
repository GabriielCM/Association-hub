---
module: pedidos
document: acceptance-criteria
status: complete
priority: phase2
last_updated: 2026-01-13
---

# Pedidos - Critérios de Aceitação

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Lista de Pedidos](#1-lista-de-pedidos)
2. [Detalhes do Pedido](#2-detalhes-do-pedido)
3. [Timeline de Status](#3-timeline-de-status)
4. [QR Code de Retirada](#4-qr-code-de-retirada)
5. [Vouchers](#5-vouchers)
6. [Comprovante](#6-comprovante)
7. [Painel ADM](#7-painel-adm)
8. [Cancelamento e Estorno](#8-cancelamento-e-estorno)
9. [Notificações](#9-notificações)
10. [Performance](#10-performance)

---

## 1. Lista de Pedidos

### 1.1 Visualização

- [ ] **LST-01** Usuário visualiza lista de todos os seus pedidos
- [ ] **LST-02** Pedidos ordenados por data (mais recentes primeiro)
- [ ] **LST-03** Card exibe: status, código, preview de itens, valor, data
- [ ] **LST-04** Preview mostra até 3 thumbnails + contador
- [ ] **LST-05** Badge de status com cor correspondente
- [ ] **LST-06** Exibe fonte do pedido (Loja ou nome do PDV)

### 1.2 Filtros

- [ ] **LST-07** Filtro "Todos" exibe pedidos de todas as fontes
- [ ] **LST-08** Filtro "Loja" exibe apenas pedidos da loja
- [ ] **LST-09** Filtro "PDV" exibe apenas pedidos de kiosks
- [ ] **LST-10** Filtro persiste durante navegação

### 1.3 Paginação

- [ ] **LST-11** Scroll infinito carrega mais pedidos
- [ ] **LST-12** Indicador de loading durante carregamento
- [ ] **LST-13** Mensagem quando não há mais pedidos

### 1.4 Estados Vazios

- [ ] **LST-14** Mensagem amigável quando não há pedidos
- [ ] **LST-15** CTA para ir à Loja quando lista vazia

---

## 2. Detalhes do Pedido

### 2.1 Informações Básicas

- [ ] **DET-01** Exibe código do pedido em destaque
- [ ] **DET-02** Exibe status atual com cor e ícone
- [ ] **DET-03** Exibe fonte do pedido (Loja ou PDV)
- [ ] **DET-04** Exibe data e hora do pedido

### 2.2 Itens

- [ ] **DET-05** Lista todos os itens do pedido
- [ ] **DET-06** Cada item exibe: imagem, nome, variação, quantidade, preço
- [ ] **DET-07** Preço exibido em pontos e/ou dinheiro conforme compra
- [ ] **DET-08** Itens tipo voucher têm indicador visual

### 2.3 Pagamento

- [ ] **DET-09** Exibe subtotal do pedido
- [ ] **DET-10** Exibe pontos utilizados (se aplicável)
- [ ] **DET-11** Exibe valor pago em dinheiro (se aplicável)
- [ ] **DET-12** Exibe cashback ganho (se aplicável)

### 2.4 Retirada

- [ ] **DET-13** Exibe local de retirada para produtos físicos
- [ ] **DET-14** Exibe horário de funcionamento
- [ ] **DET-15** QR Code de retirada visível quando status = ready

---

## 3. Timeline de Status

### 3.1 Visualização

- [ ] **TML-01** Timeline exibe histórico completo de status
- [ ] **TML-02** Status atual destacado no topo
- [ ] **TML-03** Cada status exibe data/hora
- [ ] **TML-04** Descrição opcional exibida (quando disponível)
- [ ] **TML-05** Status futuro em cinza (previsão)

### 3.2 Transições

- [ ] **TML-06** Transição pending → confirmed registrada
- [ ] **TML-07** Transição confirmed → ready registrada
- [ ] **TML-08** Transição ready → completed registrada
- [ ] **TML-09** Cancelamento registrado com motivo

---

## 4. QR Code de Retirada

### 4.1 Exibição

- [ ] **QRC-01** QR Code exibido apenas quando status = ready
- [ ] **QRC-02** QR Code em tamanho legível para scanner
- [ ] **QRC-03** Instrução "Apresente na retirada" visível
- [ ] **QRC-04** Código alfanumérico exibido abaixo do QR

### 4.2 Segurança

- [ ] **QRC-05** QR Code contém assinatura válida
- [ ] **QRC-06** QR Code não funciona após conclusão
- [ ] **QRC-07** QR Code não funciona após cancelamento

---

## 5. Vouchers

### 5.1 Acesso

- [ ] **VCH-01** Voucher acessível na tela de detalhes do pedido
- [ ] **VCH-02** Indicador visual identifica itens tipo voucher
- [ ] **VCH-03** Tap no item voucher abre tela dedicada

### 5.2 Tela do Voucher

- [ ] **VCH-04** Exibe nome/descrição do voucher
- [ ] **VCH-05** Exibe código alfanumérico em destaque
- [ ] **VCH-06** Exibe QR Code do voucher
- [ ] **VCH-07** Exibe instruções de uso
- [ ] **VCH-08** Exibe data de validade
- [ ] **VCH-09** Exibe dias restantes até expiração

### 5.3 Estados

- [ ] **VCH-10** Status "Disponível" quando não utilizado
- [ ] **VCH-11** Status "Utilizado" com data de uso
- [ ] **VCH-12** Status "Expirado" após data de validade
- [ ] **VCH-13** Visual diferenciado para cada estado

---

## 6. Comprovante

### 6.1 Acesso

- [ ] **RCP-01** Botão "Ver Comprovante" disponível nos detalhes
- [ ] **RCP-02** Comprovante abre em modal ou tela dedicada

### 6.2 Conteúdo

- [ ] **RCP-03** Exibe número do comprovante
- [ ] **RCP-04** Exibe dados do pedido (código, data)
- [ ] **RCP-05** Exibe dados do comprador
- [ ] **RCP-06** Lista todos os itens com quantidades e preços
- [ ] **RCP-07** Exibe subtotal
- [ ] **RCP-08** Exibe detalhes do pagamento
- [ ] **RCP-09** Exibe local de retirada

---

## 7. Painel ADM

### 7.1 Dashboard

- [ ] **ADM-01** Exibe contador de pedidos pendentes
- [ ] **ADM-02** Exibe contador de pedidos prontos
- [ ] **ADM-03** Exibe contador de cancelados (hoje)
- [ ] **ADM-04** Lista de pedidos com filtros

### 7.2 Filtros

- [ ] **ADM-05** Filtro por fonte (Loja/PDV)
- [ ] **ADM-06** Filtro por status
- [ ] **ADM-07** Filtro por período
- [ ] **ADM-08** Busca por código ou nome do cliente

### 7.3 Gestão de Pedidos

- [ ] **ADM-09** Visualizar detalhes completos do pedido
- [ ] **ADM-10** Atualizar status individualmente
- [ ] **ADM-11** Adicionar nota ao atualizar status
- [ ] **ADM-12** Selecionar múltiplos pedidos
- [ ] **ADM-13** Atualizar status em lote

### 7.4 Validação de Retirada

- [ ] **ADM-14** Botão para escanear QR Code
- [ ] **ADM-15** Câmera abre para leitura do QR
- [ ] **ADM-16** Campo para digitar código manualmente
- [ ] **ADM-17** Validação exibe dados do pedido
- [ ] **ADM-18** Mensagem de erro clara para QR inválido
- [ ] **ADM-19** Confirmar entrega com um tap
- [ ] **ADM-20** Status atualizado para completed

### 7.5 Relatórios

- [ ] **ADM-21** Relatório de pedidos por período
- [ ] **ADM-22** Relatório por fonte (Loja vs PDV)
- [ ] **ADM-23** Relatório por status
- [ ] **ADM-24** Tempo médio de processamento
- [ ] **ADM-25** Exportar relatório em CSV

---

## 8. Cancelamento e Estorno

### 8.1 Cancelamento

- [ ] **CNC-01** ADM pode cancelar pedido pendente
- [ ] **CNC-02** ADM pode cancelar pedido confirmado
- [ ] **CNC-03** ADM pode cancelar pedido pronto
- [ ] **CNC-04** Motivo obrigatório para cancelamento
- [ ] **CNC-05** Confirmação antes de cancelar

### 8.2 Estorno de Pontos

- [ ] **CNC-06** Pontos utilizados são estornados automaticamente
- [ ] **CNC-07** Transação de estorno criada (source = refund)
- [ ] **CNC-08** Saldo do usuário atualizado imediatamente
- [ ] **CNC-09** Cashback removido (se foi creditado)

### 8.3 Estorno de Dinheiro

- [ ] **CNC-10** Refund iniciado no Stripe automaticamente
- [ ] **CNC-11** Webhook processa confirmação do estorno
- [ ] **CNC-12** Status de estorno registrado no pedido

### 8.4 Estoque

- [ ] **CNC-13** Estoque dos produtos restaurado
- [ ] **CNC-14** Variações específicas atualizadas

### 8.5 Notificação

- [ ] **CNC-15** Usuário notificado sobre cancelamento
- [ ] **CNC-16** Push inclui motivo e info de estorno

---

## 9. Notificações

### 9.1 Push Notifications

- [ ] **NTF-01** Push enviado ao confirmar pedido
- [ ] **NTF-02** Push enviado quando pedido pronto
- [ ] **NTF-03** Push enviado ao concluir pedido
- [ ] **NTF-04** Push enviado ao cancelar pedido
- [ ] **NTF-05** Push enviado 7 dias antes do voucher expirar

### 9.2 In-App

- [ ] **NTF-06** Notificações aparecem na central do app
- [ ] **NTF-07** Tap na notificação abre o pedido
- [ ] **NTF-08** Badge de não lidas atualizado

---

## 10. Performance

### 10.1 Carregamento

- [ ] **PRF-01** Lista de pedidos carrega em < 2 segundos
- [ ] **PRF-02** Detalhes do pedido carrega em < 1 segundo
- [ ] **PRF-03** Skeleton screens durante carregamento

### 10.2 Cache

- [ ] **PRF-04** Lista de pedidos com cache curto (1 minuto)
- [ ] **PRF-05** Cache invalidado ao mudar status
- [ ] **PRF-06** Pull-to-refresh funcional

### 10.3 Paginação

- [ ] **PRF-07** 20 pedidos por página
- [ ] **PRF-08** Scroll infinito sem travamentos

---

## Resumo de Testes

| Seção | Total | Críticos |
|-------|-------|----------|
| Lista de Pedidos | 15 | 6 |
| Detalhes | 15 | 8 |
| Timeline | 9 | 5 |
| QR Code | 7 | 4 |
| Vouchers | 13 | 6 |
| Comprovante | 9 | 4 |
| Painel ADM | 25 | 12 |
| Cancelamento | 16 | 10 |
| Notificações | 8 | 5 |
| Performance | 8 | 4 |
| **TOTAL** | **125** | **64** |
