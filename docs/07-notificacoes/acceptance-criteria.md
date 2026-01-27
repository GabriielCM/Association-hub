---
module: notificacoes
document: acceptance-criteria
status: complete
priority: mvp
last_updated: 2026-01-26
---

# Notificações - Critérios de Aceitação

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Central de Notificações](#1-central-de-notificações)
2. [Recebimento de Notificações](#2-recebimento-de-notificações)
3. [Agrupamento (Batching)](#3-agrupamento-batching)
4. [Leitura e Marcação](#4-leitura-e-marcação)
5. [Configurações por Categoria](#5-configurações-por-categoria)
6. [Modo Não Perturbe](#6-modo-não-perturbe)
7. [Badge e Contadores](#7-badge-e-contadores)
8. [Real-time (WebSocket)](#8-real-time-websocket)
9. [Push Notifications](#9-push-notifications)
10. [Offline](#10-offline)
11. [Performance](#11-performance)
12. [Acessibilidade](#12-acessibilidade)
13. [Validação End-to-End](#13-validação-end-to-end)

---

## 1. Central de Notificações

### 1.1 Visualização

- [ ] **NOT-01** Tela carrega em menos de 2 segundos
- [ ] **NOT-02** Lista exibe notificações ordenadas por data (mais recentes primeiro)
- [ ] **NOT-03** Notificações agrupadas por período (Hoje, Ontem, Esta semana, etc.)
- [ ] **NOT-04** Cada item exibe: ícone/avatar, título, preview, tempo relativo
- [ ] **NOT-05** Indicador visual (●) para notificações não lidas
- [ ] **NOT-06** Máximo de 500 notificações na lista

### 1.2 Filtros

- [ ] **NOT-07** Chips de categoria exibidos no topo
- [ ] **NOT-08** Chip "Todas" selecionado por padrão
- [ ] **NOT-09** Tap em chip filtra lista pela categoria
- [ ] **NOT-10** Contador de não lidas exibido em cada chip
- [ ] **NOT-11** Scroll horizontal nos chips se houver overflow

### 1.3 Navegação

- [ ] **NOT-12** Pull-to-refresh atualiza lista
- [ ] **NOT-13** Scroll infinito carrega mais notificações
- [ ] **NOT-14** Tap em notificação abre deep link correspondente
- [ ] **NOT-15** Tap em notificação marca como lida automaticamente
- [ ] **NOT-16** Botão configurações (⚙️) no header funciona
- [ ] **NOT-17** Botão limpar (🗑️) no header funciona

---

## 2. Recebimento de Notificações

### 2.1 Push Notifications

- [ ] **REC-01** Push recebido quando app está em background
- [ ] **REC-02** Push recebido quando app está fechado
- [ ] **REC-03** Tap no push abre app na tela correta (deep link)
- [ ] **REC-04** Push não é enviado se categoria desabilitada
- [ ] **REC-05** Push não é enviado durante horário Não Perturbe

### 2.2 In-App Notifications

- [ ] **REC-06** Notificação aparece em tempo real via WebSocket
- [ ] **REC-07** Badge atualizado imediatamente ao receber
- [ ] **REC-08** Lista atualiza se tela estiver aberta
- [ ] **REC-09** Notificação não aparece se in-app desabilitado para categoria

### 2.3 Tipos de Notificação

- [ ] **REC-10** Curtida em post gera notificação correta
- [ ] **REC-11** Comentário em post gera notificação correta
- [ ] **REC-12** Menção gera notificação correta
- [ ] **REC-13** Novo evento gera notificação correta
- [ ] **REC-14** Lembrete de evento gera notificação correta
- [ ] **REC-15** Check-in realizado gera notificação correta
- [ ] **REC-16** Badge conquistado gera notificação correta
- [ ] **REC-17** Pontos recebidos gera notificação correta
- [ ] **REC-18** Nova mensagem gera notificação correta
- [ ] **REC-19** Reserva aprovada/rejeitada gera notificação correta

---

## 3. Agrupamento (Batching)

### 3.1 Regras de Agrupamento

- [ ] **GRP-01** Curtidas no mesmo post são agrupadas
- [ ] **GRP-02** Comentários no mesmo post são agrupadas
- [ ] **GRP-03** Novos seguidores são agrupados
- [ ] **GRP-04** Views em stories são agrupadas
- [ ] **GRP-05** Agrupamento ocorre em janela de 1 hora

### 3.2 Exibição Agrupada

- [ ] **GRP-06** Notificação agrupada exibe contador ("5 pessoas...")
- [ ] **GRP-07** Avatares dos primeiros 3 usuários exibidos
- [ ] **GRP-08** Tap em grupo expande para ver todos
- [ ] **GRP-09** Tela expandida lista todas as notificações do grupo
- [ ] **GRP-10** Botão "Ver post original" funciona

### 3.3 Push Agrupado

- [ ] **GRP-11** Múltiplas notificações em 5min geram push único
- [ ] **GRP-12** Push agrupado exibe contador correto
- [ ] **GRP-13** Tap em push agrupado abre lista ou post

---

## 4. Leitura e Marcação

### 4.1 Marcar Individual

- [ ] **READ-01** Swipe left marca como lida
- [ ] **READ-02** Feedback visual ao marcar (animação/haptic)
- [ ] **READ-03** Indicador (●) some imediatamente
- [ ] **READ-04** Contador atualiza em tempo real

### 4.2 Marcar em Lote

- [ ] **READ-05** Long press no chip exibe opção "Marcar todas"
- [ ] **READ-06** "Marcar todas da categoria" funciona
- [ ] **READ-07** "Marcar todas" no header funciona
- [ ] **READ-08** Confirmação exibida antes de marcar todas
- [ ] **READ-09** Contador reseta corretamente

### 4.3 Deletar

- [ ] **READ-10** Swipe right deleta notificação
- [ ] **READ-11** Confirmação exibida antes de deletar
- [ ] **READ-12** "Limpar todas" remove apenas as lidas
- [ ] **READ-13** Confirmação exibida antes de limpar todas

---

## 5. Configurações por Categoria

### 5.1 Tela de Configurações

- [ ] **CFG-01** Lista 5 categorias com descrição
- [ ] **CFG-02** Cada categoria tem toggle Push e In-app
- [ ] **CFG-03** Alteração salva automaticamente
- [ ] **CFG-04** Feedback visual ao salvar (toast ou check)

### 5.2 Comportamento

- [ ] **CFG-05** Desabilitar Push para de enviar push da categoria
- [ ] **CFG-06** Desabilitar In-app para de exibir na lista
- [ ] **CFG-07** Configuração persiste entre sessões
- [ ] **CFG-08** Configuração sincroniza entre dispositivos

### 5.3 Categorias

- [ ] **CFG-09** Categoria Social configurável
- [ ] **CFG-10** Categoria Eventos configurável
- [ ] **CFG-11** Categoria Pontos configurável
- [ ] **CFG-12** Categoria Reservas configurável
- [ ] **CFG-13** Categoria Sistema configurável

---

## 6. Modo Não Perturbe

### 6.1 Configuração

- [ ] **DND-01** Toggle para ativar/desativar DND
- [ ] **DND-02** Seletor de horário início (HH:mm)
- [ ] **DND-03** Seletor de horário fim (HH:mm)
- [ ] **DND-04** Seletor de dias da semana
- [ ] **DND-05** Permite selecionar múltiplos dias
- [ ] **DND-06** Configuração salva automaticamente

### 6.2 Comportamento

- [ ] **DND-07** Push silenciado durante horário configurado
- [ ] **DND-08** Notificações ainda aparecem na lista
- [ ] **DND-09** Badge ainda atualiza
- [ ] **DND-10** DND respeita timezone do dispositivo
- [ ] **DND-11** DND funciona corretamente em virada de dia

### 6.3 Feedback

- [ ] **DND-12** Indicador visual quando DND ativo
- [ ] **DND-13** Texto explicativo sobre comportamento

---

## 7. Badge e Contadores

### 7.1 Badge no Header

- [ ] **BDG-01** Badge exibido no ícone de notificações
- [ ] **BDG-02** Contador exibe número de não lidas
- [ ] **BDG-03** Exibe "99+" se mais de 99
- [ ] **BDG-04** Badge some quando todas lidas
- [ ] **BDG-05** Tap no badge abre Central de Notificações

### 7.2 Contadores por Categoria

- [ ] **BDG-06** Contador exibido em cada chip de filtro
- [ ] **BDG-07** Contadores atualizados em tempo real
- [ ] **BDG-08** Total = soma das categorias

### 7.3 Sincronização

- [ ] **BDG-09** Badge atualiza via WebSocket
- [ ] **BDG-10** Badge sincroniza ao abrir app
- [ ] **BDG-11** Badge consistente em todas as telas

---

## 8. Real-time (WebSocket)

### 8.1 Conexão

- [ ] **WS-01** Conexão WebSocket estabelecida ao abrir app
- [ ] **WS-02** Reconexão automática em caso de falha
- [ ] **WS-03** Heartbeat mantém conexão ativa

### 8.2 Eventos

- [ ] **WS-04** `notification.new` recebido e processado
- [ ] **WS-05** `notification.read` sincroniza leitura
- [ ] **WS-06** `unread_count.update` atualiza badge
- [ ] **WS-07** `settings.changed` atualiza config local

### 8.3 Latência

- [ ] **WS-08** Notificação aparece em < 500ms
- [ ] **WS-09** Badge atualiza em < 300ms
- [ ] **WS-10** Sem duplicatas em alta frequência

---

## 9. Push Notifications

### 9.1 iOS (APNs)

- [ ] **PSH-01** Push recebido em foreground
- [ ] **PSH-02** Push recebido em background
- [ ] **PSH-03** Push exibe título e corpo
- [ ] **PSH-04** Badge do app atualiza
- [ ] **PSH-05** Som de notificação toca (se habilitado)

### 9.2 Android (FCM)

- [ ] **PSH-06** Push recebido em foreground
- [ ] **PSH-07** Push recebido em background
- [ ] **PSH-08** Push agrupado por categoria
- [ ] **PSH-09** Ícone de notificação correto
- [ ] **PSH-10** Canal de notificação configurável

### 9.3 Deep Links

- [ ] **PSH-11** Tap em push abre tela correta
- [ ] **PSH-12** Deep link para posts funciona
- [ ] **PSH-13** Deep link para eventos funciona
- [ ] **PSH-14** Deep link para mensagens funciona
- [ ] **PSH-15** Deep link para carteira funciona

---

## 10. Offline

### 10.1 Comportamento

- [ ] **OFF-01** Lista exibe cache offline
- [ ] **OFF-02** Push continua funcionando
- [ ] **OFF-03** Ações de leitura enfileiradas
- [ ] **OFF-04** Indicador "Sem conexão" exibido

### 10.2 Sincronização

- [ ] **OFF-05** Ações pendentes enviadas ao reconectar
- [ ] **OFF-06** Cache atualizado com novos dados
- [ ] **OFF-07** Conflitos resolvidos corretamente
- [ ] **OFF-08** Badge reconciliado após sync

---

## 11. Performance

### 11.1 Carregamento

| Operação | Meta |
|----------|------|
| Lista inicial | < 2s |
| Carregar mais | < 1s |
| Marcar como lida | < 300ms |
| Atualizar badge | < 300ms |

- [ ] **PRF-01** Lista inicial carrega em < 2s
- [ ] **PRF-02** Scroll infinito carrega em < 1s
- [ ] **PRF-03** Marcar como lida responde em < 300ms
- [ ] **PRF-04** Badge atualiza em < 300ms

### 11.2 Memória

- [ ] **PRF-05** Máximo 500 notificações em memória
- [ ] **PRF-06** Imagens carregadas sob demanda
- [ ] **PRF-07** Scroll suave sem jank

### 11.3 Rede

- [ ] **PRF-08** Paginação com 20 itens por request
- [ ] **PRF-09** Compressão de payloads
- [ ] **PRF-10** Retry em falhas de rede

---

## 12. Acessibilidade

### 12.1 Navegação

- [ ] **A11-01** Todos os elementos acessíveis via VoiceOver/TalkBack
- [ ] **A11-02** Labels descritivos em todos os botões
- [ ] **A11-03** Ordem de foco lógica
- [ ] **A11-04** Touch targets >= 44x44px

### 12.2 Visual

- [ ] **A11-05** Contraste adequado (WCAG AA)
- [ ] **A11-06** Não depende apenas de cor para indicar estado
- [ ] **A11-07** Textos legíveis sem zoom
- [ ] **A11-08** Suporta tamanho de fonte dinâmico

### 12.3 Feedback

- [ ] **A11-09** Feedback háptico em ações
- [ ] **A11-10** Mensagens de sucesso/erro anunciadas
- [ ] **A11-11** Estado de leitura anunciado
- [ ] **A11-12** Contador anunciado corretamente

---

## 13. Validação End-to-End

### 13.1 Fluxo Completo - Recebimento

- [ ] **E2E-01** Receber notificação de curtida
- [ ] **E2E-02** Verificar push notification
- [ ] **E2E-03** Verificar badge atualizado
- [ ] **E2E-04** Abrir Central de Notificações
- [ ] **E2E-05** Verificar notificação na lista
- [ ] **E2E-06** Tap para abrir post

### 13.2 Fluxo Completo - Agrupamento

- [ ] **E2E-07** Receber 3 curtidas no mesmo post
- [ ] **E2E-08** Verificar notificação agrupada
- [ ] **E2E-09** Expandir grupo
- [ ] **E2E-10** Verificar todas as curtidas listadas

### 13.3 Fluxo Completo - Configuração

- [ ] **E2E-11** Desabilitar push para Social
- [ ] **E2E-12** Receber curtida (sem push)
- [ ] **E2E-13** Verificar notificação apenas in-app
- [ ] **E2E-14** Reabilitar push

### 13.4 Fluxo Completo - Não Perturbe

- [ ] **E2E-15** Configurar DND 22:00-07:00
- [ ] **E2E-16** Receber notificação durante DND
- [ ] **E2E-17** Verificar push silenciado
- [ ] **E2E-18** Verificar notificação na lista

### 13.5 Fluxo Completo - Marcar como Lida

- [ ] **E2E-19** Swipe para marcar como lida
- [ ] **E2E-20** Verificar indicador removido
- [ ] **E2E-21** Verificar badge decrementado
- [ ] **E2E-22** Marcar todas como lidas

---

## Resumo de Testes

| Seção | Total | Críticos |
|-------|-------|----------|
| Central de Notificações | 17 | 7 |
| Recebimento | 19 | 10 |
| Agrupamento | 13 | 6 |
| Leitura e Marcação | 13 | 6 |
| Configurações | 13 | 5 |
| Modo Não Perturbe | 13 | 6 |
| Badge e Contadores | 11 | 5 |
| Real-time | 10 | 5 |
| Push Notifications | 15 | 8 |
| Offline | 8 | 4 |
| Performance | 10 | 4 |
| Acessibilidade | 12 | 5 |
| Validação E2E | 22 | 12 |
| **TOTAL** | **176** | **83** |
