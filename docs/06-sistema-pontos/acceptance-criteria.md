---
module: sistema-pontos
document: acceptance-criteria
status: complete
priority: mvp
last_updated: 2026-01-11
---

# Sistema de Pontos - Critérios de Aceitação

[← Voltar ao Módulo](README.md)

---

## Índice

1. [Saldo e Visualização](#1-saldo-e-visualização)
2. [Check-in em Eventos](#2-check-in-em-eventos)
3. [Integração Strava](#3-integração-strava)
4. [Primeiro Post do Dia](#4-primeiro-post-do-dia)
5. [Transferência](#5-transferência)
6. [Histórico de Transações](#6-histórico-de-transações)
7. [Rankings](#7-rankings)
8. [Configuração ADM](#8-configuração-adm)
9. [Relatórios ADM](#9-relatórios-adm)
10. [Notificações](#10-notificações)
11. [Validação Final](#11-validação-final)

---

## 1. Saldo e Visualização

### 1.1 Exibição do Saldo

- [ ] Saldo é exibido no Dashboard (card de pontos)
- [ ] Saldo é exibido na Minha Carteira
- [ ] Saldo é exibido no Perfil do usuário
- [ ] Saldo é atualizado em tempo real após transações
- [ ] Saldo carrega em menos de 2 segundos
- [ ] Skeleton loading é exibido enquanto carrega
- [ ] Valor é formatado corretamente (separador de milhar)

### 1.2 Estados do Saldo

- [ ] Estado de loading exibe skeleton
- [ ] Estado de erro exibe mensagem e botão retry
- [ ] Saldo zero exibe valor "0" (não esconde)
- [ ] Saldo offline exibe último valor cacheado com indicador

### 1.3 Cache

- [ ] Último saldo é armazenado localmente
- [ ] Cache expira após 5 minutos
- [ ] Pull-to-refresh força atualização do cache

---

## 2. Check-in em Eventos

### 2.1 Crédito de Pontos

- [ ] Pontos são creditados IMEDIATAMENTE após check-in válido
- [ ] Valor creditado corresponde ao configurado para o evento
- [ ] Transação criada com source = `event_checkin`
- [ ] Metadata inclui nome e data do evento

### 2.2 Feedback Visual

- [ ] Celebração em TELA CHEIA é exibida ao ganhar pontos
- [ ] Animação mostra quantidade de pontos ganhos
- [ ] Novo saldo é exibido após animação
- [ ] Som de celebração é reproduzido (se não silenciado)

### 2.3 Validações

- [ ] Check-in duplicado é bloqueado
- [ ] Mensagem de erro clara para check-in duplicado
- [ ] Evento cancelado não remove pontos já creditados
- [ ] Evento inativo não permite check-in

---

## 3. Integração Strava

### 3.1 Conexão OAuth

- [ ] Botão "Conectar Strava" abre fluxo OAuth
- [ ] Autorização no Strava redireciona corretamente para o app
- [ ] Tokens são armazenados de forma segura (criptografados)
- [ ] Status "Conectado" é exibido após conexão bem-sucedida
- [ ] Nome do atleta do Strava é exibido

### 3.2 Sincronização

- [ ] Botão "Sincronizar" busca atividades recentes
- [ ] Apenas atividades elegíveis são processadas
- [ ] Atividades já sincronizadas são ignoradas
- [ ] Atividades < 0.5km são ignoradas
- [ ] Loading é exibido durante sincronização
- [ ] Mensagem de sucesso mostra km e pontos ganhos

### 3.3 Limite Diário

- [ ] Limite de 5km/dia é respeitado
- [ ] Km disponível hoje é exibido na interface
- [ ] Mensagem clara quando limite é atingido
- [ ] Limite reseta à meia-noite (timezone do usuário)

### 3.4 Cálculo de Pontos

- [ ] Corrida: 10 pontos por km
- [ ] Ciclismo: 5 pontos por km
- [ ] Outras atividades conforme configuração ADM
- [ ] Arredondamento correto (ex: 3.7km = 37 pts corrida)

### 3.5 Desconexão

- [ ] Botão "Desconectar" remove conexão
- [ ] Confirmação solicitada antes de desconectar
- [ ] Tokens são removidos do sistema
- [ ] Histórico de atividades permanece visível

---

## 4. Primeiro Post do Dia

### 4.1 Crédito de Pontos

- [ ] Primeiro post no FEED do dia credita pontos
- [ ] Stories NÃO contam como primeiro post
- [ ] Valor conforme configuração ADM
- [ ] Reset à meia-noite (timezone do usuário)

### 4.2 Feedback

- [ ] Toast animado mostra pontos ganhos
- [ ] Mensagem: "Primeiro post do dia! +X pontos"
- [ ] Não exibe feedback para posts subsequentes

### 4.3 Validações

- [ ] Segundo post do dia não credita pontos
- [ ] Post editado não conta como novo post
- [ ] Post deletado e recriado não conta novamente

---

## 5. Transferência

### 5.1 Busca de Destinatário

- [ ] Scanner QR reconhece QR da carteirinha
- [ ] Busca por nome retorna resultados em < 1s
- [ ] Lista de recentes mostra últimos 5 destinatários
- [ ] Foto e nome do destinatário são exibidos

### 5.2 Fluxo de Transferência

- [ ] Campo de valor aceita apenas números inteiros
- [ ] Valor mínimo: 1 ponto
- [ ] Valor máximo: saldo disponível
- [ ] Tela de confirmação mostra todos os detalhes
- [ ] Autenticação biométrica é solicitada
- [ ] Fallback para PIN do dispositivo disponível

### 5.3 Processamento

- [ ] Débito e crédito são atômicos
- [ ] Saldo é atualizado imediatamente
- [ ] Transação aparece no histórico de ambos
- [ ] Mensagem opcional é entregue ao destinatário

### 5.4 Feedback

- [ ] Confirmação visual de envio bem-sucedido
- [ ] Novo saldo é exibido
- [ ] Destinatário recebe notificação push
- [ ] Toast no app do destinatário ao abrir

### 5.5 Validações

- [ ] Saldo insuficiente exibe erro claro
- [ ] Transferência para si mesmo é bloqueada
- [ ] Destinatário inexistente exibe erro
- [ ] Rate limiting bloqueia após 10/minuto

---

## 6. Histórico de Transações

### 6.1 Lista de Transações

- [ ] Transações ordenadas por data (mais recente primeiro)
- [ ] Cada item mostra: tipo, valor, saldo após, descrição, data
- [ ] Ícones distintos para crédito (+) e débito (-)
- [ ] Cores distintas: verde para crédito, vermelho para débito
- [ ] Paginação funcional (scroll infinito ou botão)

### 6.2 Filtros

- [ ] Filtro por período funciona (hoje, semana, mês, personalizado)
- [ ] Filtro por tipo funciona (crédito, débito, todos)
- [ ] Filtro por fonte funciona (evento, Strava, transferência, etc.)
- [ ] Múltiplos filtros podem ser combinados
- [ ] Botão "Limpar filtros" disponível

### 6.3 Detalhes

- [ ] Tap em transação abre detalhes
- [ ] Detalhes mostram metadata completa
- [ ] Transferências mostram nome do outro usuário
- [ ] Eventos mostram nome do evento

### 6.4 Performance

- [ ] Primeira página carrega em < 2s
- [ ] Scroll infinito carrega próxima página em < 1s
- [ ] Pull-to-refresh atualiza lista
- [ ] Lista vazia mostra estado empty

---

## 7. Rankings

### 7.1 Ranking de Pontos

- [ ] Lista ordenada por pontos (maior primeiro)
- [ ] Posição do usuário atual é destacada
- [ ] Top 10 sempre visível
- [ ] Foto e nome de cada usuário
- [ ] Valor de pontos exibido

### 7.2 Ranking de Eventos

- [ ] Lista ordenada por check-ins
- [ ] Contagem de check-ins exibida
- [ ] Mesmo formato visual do ranking de pontos

### 7.3 Ranking de Strava

- [ ] Lista ordenada por km sincronizados
- [ ] Distância total exibida
- [ ] Apenas usuários com Strava conectado

### 7.4 Períodos

- [ ] Filtro por período funciona (all-time, mensal, semanal)
- [ ] Dados atualizados conforme período selecionado
- [ ] Indicador de última atualização

---

## 8. Configuração ADM

### 8.1 Acesso

- [ ] Apenas usuários ADM acessam configurações
- [ ] Tela de configuração carrega em < 2s
- [ ] Todas as fontes de pontos são listadas

### 8.2 Configuração de Fontes

- [ ] Valor de pontos por fonte pode ser alterado
- [ ] Fonte pode ser ativada/desativada
- [ ] Alterações são salvas corretamente
- [ ] Feedback de sucesso após salvar

### 8.3 Configuração Strava

- [ ] Limite diário de km pode ser alterado
- [ ] Taxa por tipo de atividade pode ser alterada
- [ ] Tipos de atividade elegíveis podem ser alterados

### 8.4 Ações Manuais

- [ ] Crédito manual funciona corretamente
- [ ] Débito manual funciona corretamente
- [ ] Motivo é obrigatório para ações manuais
- [ ] Transação registra qual ADM executou

### 8.5 Estorno

- [ ] ADM pode estornar qualquer transação
- [ ] Estorno cria transação inversa
- [ ] Transação original é marcada como estornada
- [ ] Saldo é atualizado corretamente

---

## 9. Relatórios ADM

### 9.1 Dashboard de Relatórios

- [ ] Total em circulação é exibido
- [ ] Total ganho no período é exibido
- [ ] Total gasto no período é exibido
- [ ] Gráfico de pizza por fonte funciona
- [ ] Gráfico de linha temporal funciona

### 9.2 Filtros de Relatório

- [ ] Filtro por período funciona
- [ ] Dados atualizam ao mudar filtro
- [ ] Loading exibido durante carregamento

### 9.3 Exportação CSV

- [ ] Botão de exportar disponível
- [ ] Filtro de data para exportação
- [ ] Download inicia corretamente
- [ ] CSV contém todas as colunas esperadas
- [ ] Encoding correto (UTF-8)

---

## 10. Notificações

### 10.1 Notificações Push

- [ ] Push ao receber pontos por check-in
- [ ] Push ao receber pontos do Strava
- [ ] Push ao receber transferência
- [ ] Push ao gastar pontos
- [ ] Título e corpo corretos em cada tipo

### 10.2 Configuração de Notificações

- [ ] Usuário pode desativar notificações de pontos
- [ ] Configuração é persistida
- [ ] Notificações respeitam configuração

### 10.3 Toast In-App

- [ ] Toast animado ao ganhar pontos
- [ ] Toast ao receber transferência
- [ ] Duração adequada (3-4 segundos)
- [ ] Pode ser dispensado com swipe

---

## 11. Validação Final

### 11.1 Funcional

- [ ] Todos os fluxos de crédito funcionam
- [ ] Todos os fluxos de débito funcionam
- [ ] Transferência funciona end-to-end
- [ ] Integração Strava funciona end-to-end
- [ ] Rankings são calculados corretamente
- [ ] Histórico é consistente com transações
- [ ] Configurações ADM persistem corretamente

### 11.2 Performance

| Operação | Meta | Status |
|----------|------|--------|
| Carregar saldo | < 2s | [ ] |
| Carregar histórico | < 2s | [ ] |
| Processar transferência | < 3s | [ ] |
| Sincronizar Strava | < 5s | [ ] |
| Carregar rankings | < 2s | [ ] |

### 11.3 Acessibilidade

- [ ] Contrast ratio mínimo 4.5:1 em textos
- [ ] Touch targets mínimo 48x48px
- [ ] Labels acessíveis em todos os botões
- [ ] Screen reader lê valores corretamente
- [ ] Navegação por teclado funciona

### 11.4 Responsividade

| Breakpoint | Range | Status |
|------------|-------|--------|
| Mobile | < 768px | [ ] |
| Tablet | 768px - 1024px | [ ] |
| Desktop | > 1024px | [ ] |

### 11.5 Segurança

- [ ] Biometria funciona para transferências
- [ ] Rate limiting bloqueia abusos
- [ ] Tokens Strava são criptografados
- [ ] Transações são atômicas
- [ ] Auditoria registra todas as ações

### 11.6 Offline

- [ ] Saldo cacheado é exibido offline
- [ ] Histórico cacheado é exibido offline
- [ ] Indicador visual de modo offline
- [ ] Ações são bloqueadas offline (com mensagem)

---

## Relacionados

- [Especificação](spec.md) - Modelo de dados e fluxos
- [API](api.md) - Documentação de endpoints
- [Minha Carteira](../05-minha-carteira/) - Interface do usuário
