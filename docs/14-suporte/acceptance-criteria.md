---
module: suporte
document: acceptance-criteria
status: complete
priority: phase2
last_updated: 2026-01-26
---

# Suporte - Critérios de Aceitação

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Central de Suporte](#1-central-de-suporte)
2. [FAQ](#2-faq)
3. [Criação de Ticket](#3-criação-de-ticket)
4. [Lista de Tickets](#4-lista-de-tickets)
5. [Detalhes do Ticket](#5-detalhes-do-ticket)
6. [Ticket Automático](#6-ticket-automático)
7. [Chat ao Vivo](#7-chat-ao-vivo)
8. [Avaliação](#8-avaliação)
9. [Notificações](#9-notificações)
10. [Painel ADM - Tickets](#10-painel-adm---tickets)
11. [Painel ADM - FAQ](#11-painel-adm---faq)
12. [Painel ADM - Chat](#12-painel-adm---chat)
13. [Performance](#13-performance)
14. [Acessibilidade](#14-acessibilidade)
15. [Validação End-to-End](#15-validação-end-to-end)

---

## 1. Central de Suporte

### 1.1 Tela Principal

- [ ] **SUP-01** Tela carrega em menos de 2 segundos
- [ ] **SUP-02** Card de FAQ exibe ícone e texto descritivo
- [ ] **SUP-03** Card de Chat ao Vivo mostra indicador "24h"
- [ ] **SUP-04** Card de Abrir Ticket exibe ícone e texto descritivo
- [ ] **SUP-05** Lista "Meus Tickets" exibe últimos 3 tickets do usuário

### 1.2 Navegação

- [ ] **SUP-06** Tap em FAQ navega para `/support/faq`
- [ ] **SUP-07** Tap em Chat ao Vivo navega para `/support/chat`
- [ ] **SUP-08** Tap em Abrir Ticket navega para `/support/tickets/new`
- [ ] **SUP-09** Tap em ticket da lista abre detalhes
- [ ] **SUP-10** Tap em "Ver" abre lista completa de tickets

---

## 2. FAQ

### 2.1 Listagem

- [ ] **FAQ-01** Lista carrega perguntas agrupadas por categoria
- [ ] **FAQ-02** Perguntas ordenadas pelo campo `order`
- [ ] **FAQ-03** Apenas perguntas ativas (`is_active = true`) são exibidas
- [ ] **FAQ-04** Cada pergunta exibe em formato accordion (expandir/contrair)

### 2.2 Busca

- [ ] **FAQ-05** Campo de busca exibido no topo
- [ ] **FAQ-06** Busca filtra perguntas em tempo real
- [ ] **FAQ-07** Busca pesquisa em pergunta e resposta
- [ ] **FAQ-08** Resultado exibe "Nenhuma pergunta encontrada" se vazio

### 2.3 Interação

- [ ] **FAQ-09** Tap na pergunta expande resposta
- [ ] **FAQ-10** Tap novamente contrai resposta
- [ ] **FAQ-11** Apenas uma resposta expandida por vez
- [ ] **FAQ-12** Resposta suporta formatação Markdown
- [ ] **FAQ-13** Link "Abrir um Ticket" visível no rodapé

---

## 3. Criação de Ticket

### 3.1 Formulário

- [ ] **TKT-01** Seleção de categoria é obrigatória
- [ ] **TKT-02** Opções de categoria: Bug, Sugestão, Dúvida
- [ ] **TKT-03** Campo assunto é obrigatório
- [ ] **TKT-04** Assunto requer mínimo de 5 caracteres
- [ ] **TKT-05** Assunto aceita máximo de 100 caracteres
- [ ] **TKT-06** Campo descrição é obrigatório
- [ ] **TKT-07** Descrição requer mínimo de 20 caracteres
- [ ] **TKT-08** Descrição aceita máximo de 5000 caracteres
- [ ] **TKT-09** Validação exibida em tempo real

### 3.2 Anexos

- [ ] **TKT-10** Botão de anexar abre picker de arquivos
- [ ] **TKT-11** Picker oferece opções: câmera, galeria, arquivos
- [ ] **TKT-12** Limite de 5 anexos por ticket
- [ ] **TKT-13** Tamanho máximo de 10MB por arquivo
- [ ] **TKT-14** Tipos permitidos: imagem, vídeo, PDF, DOC
- [ ] **TKT-15** Preview de anexos exibido após seleção
- [ ] **TKT-16** Tap em anexo permite visualizar ou remover
- [ ] **TKT-17** Mensagem de erro se arquivo exceder limite

### 3.3 Envio

- [ ] **TKT-18** Botão "Enviar" desabilitado se formulário inválido
- [ ] **TKT-19** Loading indicator durante envio
- [ ] **TKT-20** Ticket criado com status "open"
- [ ] **TKT-21** `is_automatic` = false para tickets manuais
- [ ] **TKT-22** Toast de sucesso "Ticket criado com sucesso"
- [ ] **TKT-23** Redireciona para detalhes do ticket após sucesso

---

## 4. Lista de Tickets

### 4.1 Visualização

- [ ] **LST-01** Lista ordenada por data (mais recente primeiro)
- [ ] **LST-02** Cada card exibe: status badge, assunto, categoria, data
- [ ] **LST-03** Card exibe contador de mensagens
- [ ] **LST-04** Badge de status com cores corretas (verde=resolvido, amarelo=andamento, branco=aberto)

### 4.2 Filtros

- [ ] **LST-05** Dropdown de filtro por status disponível
- [ ] **LST-06** Opções: Todos, Abertos, Em andamento, Resolvidos
- [ ] **LST-07** Filtro persiste durante navegação
- [ ] **LST-08** Lista atualiza ao selecionar filtro

### 4.3 Estados

- [ ] **LST-09** Estado vazio exibe mensagem e CTA
- [ ] **LST-10** Pull-to-refresh funciona
- [ ] **LST-11** FAB "Novo Ticket" sempre visível

---

## 5. Detalhes do Ticket

### 5.1 Informações

- [ ] **DET-01** Header exibe código e assunto do ticket
- [ ] **DET-02** Status badge exibido corretamente
- [ ] **DET-03** Data de criação exibida

### 5.2 Timeline

- [ ] **DET-04** Mensagens exibidas em ordem cronológica
- [ ] **DET-05** Mensagens do usuário alinhadas à direita
- [ ] **DET-06** Mensagens do suporte alinhadas à esquerda
- [ ] **DET-07** Cada mensagem exibe remetente, conteúdo, data
- [ ] **DET-08** Anexos exibidos inline na mensagem
- [ ] **DET-09** Tap em anexo abre visualização

### 5.3 Resposta

- [ ] **DET-10** Campo de input para nova mensagem
- [ ] **DET-11** Botão de anexar arquivo funcional
- [ ] **DET-12** Limite de 5 anexos por mensagem
- [ ] **DET-13** Botão enviar envia mensagem
- [ ] **DET-14** Nova mensagem aparece na timeline
- [ ] **DET-15** Scroll automático para nova mensagem
- [ ] **DET-16** Se ticket resolvido, nova mensagem reabre ticket

---

## 6. Ticket Automático

### 6.1 Captura

- [ ] **AUT-01** Crash do app dispara captura automática
- [ ] **AUT-02** Stack trace capturado corretamente
- [ ] **AUT-03** Versão do app capturada
- [ ] **AUT-04** Versão do SO capturada
- [ ] **AUT-05** Modelo do dispositivo capturado
- [ ] **AUT-06** Plataforma (iOS/Android) capturada

### 6.2 Criação

- [ ] **AUT-07** Ticket criado automaticamente após crash
- [ ] **AUT-08** `is_automatic` = true
- [ ] **AUT-09** `category` = bug
- [ ] **AUT-10** `device_info` preenchido corretamente
- [ ] **AUT-11** Limite de 1 ticket por tipo de erro por dia

### 6.3 Notificação

- [ ] **AUT-12** Banner discreto exibido na próxima abertura
- [ ] **AUT-13** Banner informa "Detectamos um problema"
- [ ] **AUT-14** Tap no banner abre ticket
- [ ] **AUT-15** Usuário pode adicionar contexto ao ticket

---

## 7. Chat ao Vivo

### 7.1 Fila

- [ ] **CHT-01** Tela de fila exibida ao iniciar chat
- [ ] **CHT-02** Posição na fila exibida
- [ ] **CHT-03** Tempo estimado exibido
- [ ] **CHT-04** Posição atualizada em tempo real via WebSocket
- [ ] **CHT-05** Botão "Cancelar" disponível
- [ ] **CHT-06** Cancelar remove da fila

### 7.2 Conexão

- [ ] **CHT-07** Push notification ao conectar com atendente
- [ ] **CHT-08** Tela muda para chat ativo
- [ ] **CHT-09** Nome do atendente exibido no header
- [ ] **CHT-10** Indicador de status (online) exibido

### 7.3 Conversa

- [ ] **CHT-11** Mensagens em tempo real via WebSocket
- [ ] **CHT-12** Mensagens do usuário à direita
- [ ] **CHT-13** Mensagens do atendente à esquerda
- [ ] **CHT-14** Indicador "digitando" exibido
- [ ] **CHT-15** Pode enviar anexos no chat
- [ ] **CHT-16** Limite de 5 anexos por mensagem

### 7.4 Encerramento

- [ ] **CHT-17** Usuário pode encerrar chat
- [ ] **CHT-18** Atendente pode encerrar chat
- [ ] **CHT-19** Modal de avaliação exibido ao encerrar
- [ ] **CHT-20** Notificação se atendente encerrar

---

## 8. Avaliação

### 8.1 Modal

- [ ] **AVL-01** Modal exibido quando ticket resolvido
- [ ] **AVL-02** Modal exibido quando chat encerrado
- [ ] **AVL-03** Rating de 1-5 estrelas exibido
- [ ] **AVL-04** Campo de comentário opcional
- [ ] **AVL-05** Comentário aceita máximo 500 caracteres
- [ ] **AVL-06** Botão "Enviar Avaliação" disponível

### 8.2 Interação

- [ ] **AVL-07** Tap nas estrelas seleciona rating
- [ ] **AVL-08** Rating obrigatório para enviar
- [ ] **AVL-09** Pode pular avaliação
- [ ] **AVL-10** Avaliação salva corretamente
- [ ] **AVL-11** Ticket muda para status "closed" após avaliação
- [ ] **AVL-12** Toast "Obrigado pelo feedback!" exibido

---

## 9. Notificações

### 9.1 Tickets

- [ ] **NOT-01** Push ao criar ticket (confirmação)
- [ ] **NOT-02** Push quando suporte responde
- [ ] **NOT-03** Push quando ticket resolvido
- [ ] **NOT-04** Badge in-app atualizado

### 9.2 Chat

- [ ] **NOT-05** Push quando conectado ao atendente
- [ ] **NOT-06** Push para nova mensagem (app em background)
- [ ] **NOT-07** Badge in-app para mensagens não lidas

### 9.3 Navegação

- [ ] **NOT-08** Tap na notificação abre contexto correto
- [ ] **NOT-09** Deep link para ticket funciona
- [ ] **NOT-10** Deep link para chat funciona

---

## 10. Painel ADM - Tickets

### 10.1 Listagem

- [ ] **ADT-01** Lista todos os tickets do sistema
- [ ] **ADT-02** Ordenação: abertos mais antigos primeiro
- [ ] **ADT-03** Card exibe: código, assunto, usuário, categoria, data
- [ ] **ADT-04** Badge "Auto" para tickets automáticos

### 10.2 Filtros

- [ ] **ADT-05** Filtro por status funciona
- [ ] **ADT-06** Filtro por categoria funciona
- [ ] **ADT-07** Busca por usuário funciona
- [ ] **ADT-08** Busca por assunto funciona
- [ ] **ADT-09** Contador por status exibido

### 10.3 Detalhes

- [ ] **ADT-10** Exibe informações completas do usuário
- [ ] **ADT-11** Exibe device_info para tickets automáticos
- [ ] **ADT-12** Pode visualizar stack trace expandido
- [ ] **ADT-13** Timeline de mensagens exibida

### 10.4 Ações

- [ ] **ADT-14** Dropdown para alterar status funciona
- [ ] **ADT-15** Alteração de status notifica usuário
- [ ] **ADT-16** Campo para responder ticket funciona
- [ ] **ADT-17** Pode anexar arquivos na resposta
- [ ] **ADT-18** Marcar como "resolved" dispara avaliação

---

## 11. Painel ADM - FAQ

### 11.1 Listagem

- [ ] **ADF-01** Lista todas as perguntas (ativas e inativas)
- [ ] **ADF-02** Agrupamento por categoria
- [ ] **ADF-03** Indicador visual para inativas

### 11.2 CRUD

- [ ] **ADF-04** Criar nova pergunta funciona
- [ ] **ADF-05** Campos: pergunta, resposta, categoria
- [ ] **ADF-06** Editar pergunta existente funciona
- [ ] **ADF-07** Ativar/desativar pergunta funciona
- [ ] **ADF-08** Excluir pergunta funciona

### 11.3 Ordenação

- [ ] **ADF-09** Drag and drop para reordenar funciona
- [ ] **ADF-10** Nova ordem salva corretamente

---

## 12. Painel ADM - Chat

### 12.1 Fila

- [ ] **ADC-01** Lista usuários aguardando
- [ ] **ADC-02** Tempo de espera exibido
- [ ] **ADC-03** Botão "Atender" disponível

### 12.2 Atendimento

- [ ] **ADC-04** Aceitar chat remove da fila
- [ ] **ADC-05** Usuário notificado via push
- [ ] **ADC-06** Chat em tempo real funciona
- [ ] **ADC-07** Indicador "digitando" funciona
- [ ] **ADC-08** Pode enviar anexos

### 12.3 Gestão

- [ ] **ADC-09** Lista atendimentos ativos
- [ ] **ADC-10** Pode continuar chat ativo
- [ ] **ADC-11** Pode encerrar chat
- [ ] **ADC-12** Pode transferir chat para outro atendente

---

## 13. Performance

### 13.1 Carregamento

| Operação | Meta |
|----------|------|
| Central de Suporte | < 2s |
| Lista de tickets | < 2s |
| Detalhes do ticket | < 1.5s |
| FAQ | < 1.5s |
| Enviar ticket | < 3s |
| Upload de anexo (10MB) | < 5s |

- [ ] **PRF-01** Central de Suporte carrega em < 2s
- [ ] **PRF-02** Lista de tickets carrega em < 2s
- [ ] **PRF-03** Detalhes do ticket carrega em < 1.5s
- [ ] **PRF-04** FAQ carrega em < 1.5s
- [ ] **PRF-05** Enviar ticket completa em < 3s

### 13.2 Real-time

- [ ] **PRF-06** Latência do WebSocket < 500ms
- [ ] **PRF-07** Posição na fila atualiza em < 1s
- [ ] **PRF-08** Mensagens do chat aparecem em < 500ms

### 13.3 Upload

- [ ] **PRF-09** Upload de arquivo 10MB em < 5s
- [ ] **PRF-10** Progress indicator durante upload
- [ ] **PRF-11** Retry automático em caso de falha

---

## 14. Acessibilidade

### 14.1 Navegação

- [ ] **A11-01** Todos os elementos acessíveis via VoiceOver/TalkBack
- [ ] **A11-02** Labels descritivos em todos os botões
- [ ] **A11-03** Ordem de foco lógica
- [ ] **A11-04** Touch targets >= 44x44px

### 14.2 Visual

- [ ] **A11-05** Contraste adequado (WCAG AA)
- [ ] **A11-06** Texto legível sem zoom
- [ ] **A11-07** Status indicado por mais que cor (ícone + texto)

### 14.3 Formulários

- [ ] **A11-08** Campos com labels associados
- [ ] **A11-09** Erros anunciados por leitores de tela
- [ ] **A11-10** Instruções claras para cada campo

### 14.4 Feedback

- [ ] **A11-11** Feedback háptico em ações importantes
- [ ] **A11-12** Mensagens de sucesso/erro anunciadas
- [ ] **A11-13** Timer de fila acessível

---

## 15. Validação End-to-End

### 15.1 Fluxo Completo - Ticket

- [ ] **E2E-01** Criar ticket com anexos
- [ ] **E2E-02** Receber notificação de resposta
- [ ] **E2E-03** Responder ticket
- [ ] **E2E-04** Ticket resolvido pelo suporte
- [ ] **E2E-05** Avaliar atendimento
- [ ] **E2E-06** Verificar ticket fechado

### 15.2 Fluxo Completo - Chat

- [ ] **E2E-07** Iniciar chat ao vivo
- [ ] **E2E-08** Aguardar na fila
- [ ] **E2E-09** Receber notificação de conexão
- [ ] **E2E-10** Conversar em tempo real
- [ ] **E2E-11** Encerrar chat
- [ ] **E2E-12** Avaliar atendimento

### 15.3 Fluxo Completo - Automático

- [ ] **E2E-13** Simular crash no app
- [ ] **E2E-14** Verificar ticket automático criado
- [ ] **E2E-15** Adicionar contexto ao ticket
- [ ] **E2E-16** Acompanhar resolução

### 15.4 Fluxo ADM

- [ ] **E2E-17** Visualizar ticket pendente
- [ ] **E2E-18** Responder ticket
- [ ] **E2E-19** Marcar como resolvido
- [ ] **E2E-20** Aceitar chat da fila
- [ ] **E2E-21** Atender e encerrar chat
- [ ] **E2E-22** Gerenciar FAQ

---

## Resumo de Testes

| Seção | Total | Críticos |
|-------|-------|----------|
| Central de Suporte | 10 | 4 |
| FAQ | 13 | 5 |
| Criação de Ticket | 23 | 10 |
| Lista de Tickets | 11 | 4 |
| Detalhes do Ticket | 16 | 8 |
| Ticket Automático | 15 | 6 |
| Chat ao Vivo | 20 | 10 |
| Avaliação | 12 | 6 |
| Notificações | 10 | 6 |
| Painel ADM - Tickets | 18 | 8 |
| Painel ADM - FAQ | 10 | 4 |
| Painel ADM - Chat | 12 | 6 |
| Performance | 11 | 6 |
| Acessibilidade | 13 | 5 |
| Validação E2E | 22 | 12 |
| **TOTAL** | **216** | **100** |
