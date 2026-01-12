---
module: minha-carteira
document: acceptance-criteria
status: complete
priority: mvp
last_updated: 2026-01-11
---

# Minha Carteira - Critérios de Aceitação

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Home da Carteira](#1-home-da-carteira)
2. [Scanner Universal](#2-scanner-universal)
3. [Transferência](#3-transferência)
4. [Histórico](#4-histórico)
5. [Conexão Strava](#5-conexão-strava)
6. [Pagamento PDV](#6-pagamento-pdv)
7. [Validação Final](#7-validação-final)

---

## 1. Home da Carteira

### 1.1 Layout Visual

- [ ] Design de carteira/wallet é aplicado
- [ ] Saldo é exibido em destaque (fonte grande)
- [ ] QR Code da carteirinha é visível
- [ ] Nome da moeda é exibido corretamente
- [ ] Resumo do mês mostra ganhos, gastos e saldo líquido

### 1.2 Ações Rápidas

- [ ] Botão "Transferir" navega para tela de transferência
- [ ] Botão "Scanner" abre câmera
- [ ] Botão "Histórico" navega para lista de transações
- [ ] Botão "Strava" navega para configuração

### 1.3 QR Code

- [ ] QR Code é o mesmo da carteirinha
- [ ] Tap no QR abre modal ampliado
- [ ] Modal permite compartilhar/salvar QR
- [ ] QR é escaneável por outros usuários

### 1.4 Interações

- [ ] Pull-to-refresh atualiza saldo
- [ ] Loading exibe skeleton
- [ ] Erro exibe mensagem e botão retry

---

## 2. Scanner Universal

### 2.1 Interface

- [ ] Câmera abre corretamente
- [ ] Viewfinder indica área de leitura
- [ ] Botão de flash funciona
- [ ] Botão de fechar retorna à tela anterior

### 2.2 Detecção de QR

- [ ] QR de check-in é detectado e processado
- [ ] QR de transferência abre tela com destinatário
- [ ] QR de PDV abre tela de pagamento
- [ ] QR de carteirinha exibe dados do membro
- [ ] QR inválido exibe mensagem de erro

### 2.3 Feedback Rico

- [ ] Vibração háptica ao detectar QR
- [ ] Som de confirmação ao detectar
- [ ] Borda verde no viewfinder ao detectar
- [ ] Preview mostra informações do QR

### 2.4 Histórico de Scans

- [ ] Últimos scans são listados abaixo do viewfinder
- [ ] Tap em scan recente mostra detalhes

---

## 3. Transferência

### 3.1 Busca de Destinatário

- [ ] Campo de busca aceita entrada de texto
- [ ] Resultados aparecem após 2+ caracteres
- [ ] Resultados carregam em < 1 segundo
- [ ] Foto e nome do usuário são exibidos
- [ ] Lista de recentes mostra últimos 5 destinatários
- [ ] Botão de scan QR abre scanner

### 3.2 Informar Valor

- [ ] Campo aceita apenas números inteiros
- [ ] Valor mínimo é 1 ponto
- [ ] Valor máximo é saldo disponível
- [ ] Saldo atual e saldo após são exibidos
- [ ] Teclado numérico é exibido automaticamente

### 3.3 Confirmação

- [ ] Tela mostra foto e nome do destinatário
- [ ] Valor a transferir é exibido em destaque
- [ ] Saldo atual e saldo após são exibidos
- [ ] Botão "Confirmar com Face ID" funciona
- [ ] Fallback para PIN do dispositivo funciona

### 3.4 Processamento

- [ ] Loading é exibido durante processamento
- [ ] Transferência completa em < 3 segundos
- [ ] Débito e crédito são atômicos

### 3.5 Sucesso

- [ ] Animação de confirmação é exibida
- [ ] Novo saldo é mostrado
- [ ] Botão "Voltar" retorna à home

### 3.6 Erros

- [ ] Saldo insuficiente exibe mensagem clara
- [ ] Transferência para si mesmo é bloqueada
- [ ] Erro de conexão permite retry

---

## 4. Histórico

### 4.1 Lista de Transações

- [ ] Transações ordenadas por data (recente primeiro)
- [ ] Cada item mostra tipo, valor, saldo após, data
- [ ] Créditos (+) em verde
- [ ] Débitos (-) em vermelho
- [ ] Scroll infinito carrega mais itens

### 4.2 Filtros

- [ ] Filtro por período funciona (hoje, semana, mês, custom)
- [ ] Filtro por tipo funciona (ganhos, gastos, todos)
- [ ] Filtro por fonte funciona
- [ ] Múltiplos filtros combinam corretamente
- [ ] Botão "Limpar filtros" reseta todos

### 4.3 Detalhes

- [ ] Tap em transação abre modal de detalhes
- [ ] Modal mostra todas as informações
- [ ] Transferências mostram nome do outro usuário
- [ ] Eventos mostram nome do evento

### 4.4 Estados

- [ ] Loading exibe skeleton
- [ ] Lista vazia exibe estado empty
- [ ] Pull-to-refresh atualiza lista

---

## 5. Conexão Strava

### 5.1 Estado Não Conectado

- [ ] Benefícios são listados (pts/km)
- [ ] Botão "Conectar Strava" é visível
- [ ] Tap abre fluxo OAuth

### 5.2 Fluxo de Conexão

- [ ] OAuth abre browser/webview
- [ ] Autorização no Strava funciona
- [ ] Callback retorna ao app
- [ ] Status muda para "Conectado"

### 5.3 Estado Conectado

- [ ] Nome do atleta é exibido
- [ ] Data de conexão é exibida
- [ ] Barra de progresso mostra km usado/disponível
- [ ] Botão "Sincronizar" é visível
- [ ] Lista de atividades sincronizadas é exibida

### 5.4 Sincronização

- [ ] Tap em "Sincronizar" inicia processo
- [ ] Loading é exibido durante sync
- [ ] Atividades são processadas corretamente
- [ ] Limite diário (5km) é respeitado
- [ ] Pontos são creditados
- [ ] Resultado mostra km e pontos ganhos
- [ ] Mensagem de limite atingido é clara

### 5.5 Desconexão

- [ ] Botão "Desconectar" é visível
- [ ] Confirmação é solicitada
- [ ] Desconexão remove tokens
- [ ] Estado volta para "Não Conectado"

---

## 6. Pagamento PDV

### 6.1 Detecção do QR

- [ ] QR de checkout PDV é reconhecido
- [ ] Tela de pagamento abre automaticamente

### 6.2 Tela de Confirmação

- [ ] Nome do PDV é exibido
- [ ] Lista de itens é exibida
- [ ] Preço de cada item em pontos
- [ ] Total é calculado corretamente
- [ ] Saldo atual é exibido
- [ ] Saldo após pagamento é exibido
- [ ] Botão "Pagar com Face ID" é visível
- [ ] Botão "Cancelar" é visível

### 6.3 Processamento

- [ ] Biometria é solicitada
- [ ] Loading é exibido
- [ ] Pagamento completa em < 3 segundos
- [ ] Saldo é debitado

### 6.4 Sucesso

- [ ] Animação de confirmação
- [ ] Novo saldo é exibido
- [ ] PDV recebe confirmação (display atualiza)

### 6.5 Erros

- [ ] Saldo insuficiente exibe mensagem
- [ ] Checkout expirado exibe mensagem
- [ ] Checkout já pago exibe mensagem
- [ ] Erro permite tentar novamente

---

## 7. Validação Final

### 7.1 Funcional

- [ ] Todos os fluxos funcionam end-to-end
- [ ] Saldo é consistente em todas as telas
- [ ] Transferências são processadas corretamente
- [ ] Scanner reconhece todos os tipos de QR
- [ ] Strava sincroniza corretamente
- [ ] Pagamentos PDV funcionam

### 7.2 Performance

| Operação | Meta | Status |
|----------|------|--------|
| Carregar home | < 2s | [ ] |
| Abrir scanner | < 1s | [ ] |
| Processar QR | < 500ms | [ ] |
| Transferir | < 3s | [ ] |
| Carregar histórico | < 2s | [ ] |
| Sync Strava | < 5s | [ ] |
| Pagar PDV | < 3s | [ ] |

### 7.3 Acessibilidade

- [ ] Contrast ratio mínimo 4.5:1
- [ ] Touch targets mínimo 48x48px
- [ ] Labels acessíveis em botões
- [ ] Screen reader lê valores corretamente
- [ ] Navegação por teclado funciona

### 7.4 Responsividade

| Breakpoint | Range | Status |
|------------|-------|--------|
| Mobile | < 768px | [ ] |
| Tablet | 768px - 1024px | [ ] |

### 7.5 Segurança

- [ ] Biometria funciona para transferências
- [ ] Biometria funciona para pagamentos
- [ ] Rate limiting bloqueia abusos
- [ ] QR de pagamento expira corretamente
- [ ] Tokens são armazenados de forma segura

### 7.6 Offline

- [ ] Saldo cacheado é exibido offline
- [ ] Histórico cacheado é exibido offline
- [ ] Indicador de modo offline é visível
- [ ] Ações são bloqueadas com mensagem clara

---

## Relacionados

- [Especificação](spec.md) - Telas e fluxos
- [API](api.md) - Endpoints
- [Sistema de Pontos](../06-sistema-pontos/acceptance-criteria.md) - Critérios relacionados
