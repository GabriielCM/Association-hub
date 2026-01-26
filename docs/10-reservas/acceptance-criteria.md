---
module: reservas
document: acceptance-criteria
status: complete
priority: phase2
last_updated: 2026-01-12
---

# Reservas - Critérios de Aceitação

[← Voltar ao Índice](README.md)

---

## Índice

- [Criar Reserva](#criar-reserva)
- [Fluxo de Aprovação](#fluxo-de-aprovação)
- [Cancelamento](#cancelamento)
- [Bloqueio de Data](#bloqueio-de-data)
- [Regras de Espaço](#regras-de-espaço)
- [Fila de Espera](#fila-de-espera)
- [Visualização](#visualização)
- [Notificações](#notificações)
- [Privacidade](#privacidade)
- [Expiração Automática](#expiração-automática)
- [Performance](#performance)
- [Acessibilidade](#acessibilidade)

---

## Criar Reserva

### Fluxo Básico

- [ ] Funcionário pode acessar lista de espaços disponíveis
- [ ] Ao selecionar espaço, visualiza calendário de disponibilidade
- [ ] Ao clicar em data disponível, abre modal de confirmação
- [ ] Modal exibe: nome do espaço, data, taxa (se houver)
- [ ] Ao confirmar, reserva é criada com status "pendente"
- [ ] Mensagem de sucesso é exibida: "Reserva criada. Aguarde aprovação."
- [ ] Reserva aparece em "Minhas Reservas" com status pendente

### Validações na Criação

- [ ] Não permite reservar data passada
- [ ] Não permite reservar espaço inativo
- [ ] Não permite reservar espaço em manutenção
- [ ] Não permite reservar data bloqueada
- [ ] Não permite reservar se já existe reserva (pendente/aprovada) para mesma data
- [ ] Valida antecedência mínima configurada no espaço
- [ ] Valida antecedência máxima configurada no espaço
- [ ] Valida intervalo entre locações (se configurado)
- [ ] Exibe mensagem de erro clara em cada caso

### Reserva por Turno

- [ ] Se espaço é por turno, exibe seleção de turnos
- [ ] Mostra disponibilidade por turno (manhã, tarde, noite)
- [ ] Permite reservar apenas turnos disponíveis
- [ ] Bloqueia apenas o turno reservado (outros ficam disponíveis)

### Reserva por Hora

- [ ] Se espaço é por hora, exibe seletores de horário
- [ ] Respeita horário de funcionamento do espaço
- [ ] Valida duração mínima configurada
- [ ] Detecta conflitos com outras reservas no mesmo dia
- [ ] Permite múltiplas reservas no mesmo dia (horários diferentes)

---

## Fluxo de Aprovação

### Painel de Pendências (Gerente/ADM)

- [ ] Badge no menu mostra quantidade de reservas pendentes
- [ ] Lista exibe todas as reservas pendentes
- [ ] Cada item mostra: espaço, data, solicitante, tempo pendente
- [ ] Filtro por espaço funciona
- [ ] Ordenação por data/tempo pendente funciona
- [ ] Paginação funciona corretamente

### Aprovar Reserva

- [ ] Botão "Aprovar" está visível para Gerente/ADM
- [ ] Ao aprovar, status muda para "aprovado"
- [ ] Registra quem aprovou e quando
- [ ] Notifica solicitante sobre aprovação
- [ ] Reserva sai da lista de pendências
- [ ] Data permanece bloqueada no calendário (vermelho)

### Rejeitar Reserva

- [ ] Botão "Rejeitar" está visível para Gerente/ADM
- [ ] Ao rejeitar, status muda para "rejeitado"
- [ ] Registra quem rejeitou e quando
- [ ] Notifica solicitante sobre rejeição
- [ ] Reserva sai da lista de pendências
- [ ] Data é liberada no calendário
- [ ] Dispara processo de fila de espera

---

## Cancelamento

### Cancelar Reserva Pendente

- [ ] Solicitante pode cancelar própria reserva pendente
- [ ] Botão "Cancelar" visível na tela de minhas reservas
- [ ] Pede confirmação antes de cancelar
- [ ] Ao cancelar, status muda para "cancelado"
- [ ] Data é liberada no calendário
- [ ] Dispara processo de fila de espera

### Cancelar Reserva Aprovada (Solicitante)

- [ ] Solicitante pode cancelar até 24h antes da data
- [ ] Se menos de 24h, botão "Cancelar" está desabilitado
- [ ] Tooltip explica: "Não é possível cancelar com menos de 24h"
- [ ] Pede confirmação antes de cancelar
- [ ] Ao cancelar, status muda para "cancelado"
- [ ] Data é liberada no calendário
- [ ] Dispara processo de fila de espera

### Cancelar Reserva Aprovada (ADM)

- [ ] ADM pode cancelar qualquer reserva a qualquer momento
- [ ] Campo de motivo é obrigatório
- [ ] Ao cancelar, registra motivo
- [ ] Notifica solicitante sobre cancelamento com motivo
- [ ] Data é liberada no calendário
- [ ] Dispara processo de fila de espera

---

## Bloqueio de Data

### Reserva Pendente Bloqueia Data

- [ ] Ao criar reserva, data fica bloqueada (amarelo no calendário)
- [ ] Outros usuários não conseguem reservar a mesma data
- [ ] Ao tentar reservar data pendente, exibe: "Data ocupada"
- [ ] Oferece opção de entrar na fila de espera

### Reserva Aprovada Bloqueia Data

- [ ] Após aprovação, data permanece bloqueada (vermelho)
- [ ] Outros usuários não conseguem reservar a mesma data
- [ ] Ao tentar reservar, exibe: "Data ocupada"
- [ ] Oferece opção de entrar na fila de espera

### Bloqueio de Espaços Relacionados

- [ ] Ao reservar espaço A (que bloqueia B), espaço B fica indisponível
- [ ] Calendário do espaço B mostra data como "bloqueada por dependência"
- [ ] Ao liberar reserva de A, espaço B é liberado automaticamente
- [ ] Funciona para reservas pendentes E aprovadas

---

## Regras de Espaço

### Antecedência Mínima

- [ ] Se espaço exige mín 2 dias, não permite reservar para amanhã
- [ ] Datas fora da antecedência aparecem desabilitadas no calendário
- [ ] Ao tentar reservar, exibe: "Reserve com X dias de antecedência"

### Antecedência Máxima

- [ ] Se espaço permite máx 60 dias, não mostra datas além
- [ ] Datas fora do limite aparecem desabilitadas
- [ ] Ao tentar reservar, exibe: "Reserve até Y dias no futuro"

### Intervalo entre Locações

- [ ] Se espaço exige intervalo de 2 meses:
  - [ ] Após reserva aprovada em 15/01
  - [ ] Próxima reserva permitida a partir de 15/03
- [ ] Ao tentar reservar antes, exibe: "Você poderá reservar a partir de [data]"
- [ ] Reservas canceladas/rejeitadas NÃO contam para o intervalo
- [ ] ADM pode fazer exceção (ignorar intervalo)

### Taxa de Locação

- [ ] Se espaço tem taxa, exibe valor na confirmação
- [ ] Taxa é registrada na reserva
- [ ] Aparece no histórico de reservas

---

## Fila de Espera

### Entrar na Fila

- [ ] Opção "Entrar na fila" aparece quando data está ocupada
- [ ] Ao entrar, exibe posição: "Você está na posição X"
- [ ] Usuário só pode estar uma vez na fila por data/espaço
- [ ] Máximo de 10 pessoas na fila (configurável)
- [ ] Se fila cheia, exibe: "Fila de espera está cheia"

### Visualizar Posição

- [ ] Usuário pode ver sua posição em "Minhas Filas"
- [ ] Lista mostra: espaço, data, posição, total na fila
- [ ] Atualiza posição se alguém na frente sair

### Sair da Fila

- [ ] Botão "Sair da fila" disponível
- [ ] Ao sair, posições dos demais são recalculadas
- [ ] Confirmação antes de sair

### Notificação de Vaga

- [ ] Quando vaga é liberada, primeiro da fila é notificado
- [ ] Notificação: "Vaga liberada! Confirme em 24h"
- [ ] Usuário vê prazo para confirmar
- [ ] Lembrete 2h antes de expirar

### Confirmar Vaga

- [ ] Botão "Confirmar" disponível por 24h
- [ ] Ao confirmar, cria reserva pendente automaticamente
- [ ] Usuário sai da fila
- [ ] Se não confirmar em 24h, passa para próximo

### Expiração na Fila

- [ ] Se não confirmar em 24h, usuário sai da fila
- [ ] Próximo da fila é notificado
- [ ] Processo repete até alguém confirmar ou fila vazia

### Regras Aplicadas na Confirmação

- [ ] Ao confirmar vaga, sistema valida regras do espaço
- [ ] Se não atende intervalo entre locações, exibe erro
- [ ] Passa para próximo da fila automaticamente

---

## Visualização

### Calendário de Disponibilidade

- [ ] Exibe mês atual por padrão
- [ ] Navegação entre meses funciona (< >)
- [ ] Cores corretas por status:
  - [ ] Verde: disponível
  - [ ] Amarelo: pendente
  - [ ] Vermelho: ocupado
  - [ ] Cinza: bloqueado
  - [ ] Laranja: manutenção
  - [ ] Cinza claro: passado
  - [ ] Cinza escuro: fora da antecedência
- [ ] Legenda visível
- [ ] Tap em data abre ação apropriada

### Lista de Datas

- [ ] Exibe próximas datas disponíveis
- [ ] Filtro "apenas disponíveis" funciona
- [ ] Filtro por espaço funciona
- [ ] Scroll infinito ou paginação funciona

### Minhas Reservas

- [ ] Tab "Pendentes" mostra reservas aguardando aprovação
- [ ] Tab "Aprovadas" mostra reservas confirmadas
- [ ] Tab "Histórico" mostra passadas e canceladas
- [ ] Card exibe: espaço, data, status, ações
- [ ] Ação de cancelar visível quando permitido

---

## Notificações

### Notificação de Aprovação

- [ ] Solicitante recebe notificação ao aprovar
- [ ] Conteúdo: espaço, data
- [ ] Push notification enviada
- [ ] Aparece no centro de notificações

### Notificação de Rejeição

- [ ] Solicitante recebe notificação ao rejeitar
- [ ] Conteúdo: espaço, data
- [ ] Push notification enviada
- [ ] Aparece no centro de notificações

### Notificação de Expiração

- [ ] Solicitante recebe notificação quando reserva expira
- [ ] Conteúdo: espaço, data, motivo (não aprovada a tempo)
- [ ] Push notification enviada

### Notificação de Cancelamento (por ADM)

- [ ] Solicitante recebe notificação quando ADM cancela
- [ ] Conteúdo: espaço, data, motivo
- [ ] Push notification enviada

### Notificação de Vaga na Fila

- [ ] Primeiro da fila recebe notificação
- [ ] Conteúdo: espaço, data, prazo para confirmar
- [ ] Push notification com alta prioridade
- [ ] Lembrete 2h antes de expirar

### Badge de Pendências

- [ ] Gerente/ADM vê badge no menu com número de pendências
- [ ] Badge atualiza em tempo real
- [ ] Some quando não há pendências

---

## Privacidade

### Funcionário

- [ ] Vê apenas estado da data (disponível/ocupado/pendente)
- [ ] NÃO vê quem fez a reserva
- [ ] Vê apenas próprias reservas em "Minhas Reservas"
- [ ] Vê própria posição na fila (não vê outros)

### Gerente/ADM

- [ ] Vê nome do solicitante nas reservas
- [ ] Vê lista completa de reservas do espaço
- [ ] Vê fila de espera completa

### Feed Social

- [ ] Mostra apenas: "Churrasqueira 1 está ocupada em 20/01"
- [ ] NÃO mostra nome do reservante

---

## Expiração Automática

### Job de Expiração

- [ ] Executa diariamente à meia-noite
- [ ] Identifica reservas pendentes com data = hoje
- [ ] Altera status para "expirado"
- [ ] Notifica solicitante
- [ ] Processa fila de espera para cada reserva expirada

### Concluir Reservas

- [ ] Reservas aprovadas com data passada mudam para "concluído"
- [ ] Status "concluído" é apenas para histórico
- [ ] Não dispara notificações

---

## Performance

### Métricas

- [ ] Calendário de disponibilidade carrega em < 500ms
- [ ] Criar reserva responde em < 1s
- [ ] Aprovar/rejeitar responde em < 500ms
- [ ] Lista de pendências carrega em < 1s
- [ ] Minhas reservas carrega em < 1s

### Cache

- [ ] Disponibilidade é cacheada por 5 minutos
- [ ] Cache é invalidado ao criar/alterar reserva
- [ ] Pull-to-refresh força atualização

### Concorrência

- [ ] Se dois usuários tentam reservar mesma data simultaneamente:
  - [ ] Apenas um consegue
  - [ ] Outro recebe erro "Data ocupada"
  - [ ] É oferecida fila de espera

---

## Acessibilidade

### WCAG 2.1 AA

- [ ] Contraste mínimo de 4.5:1 em todos os textos
- [ ] Touch targets mínimo de 48x48px
- [ ] Calendário navegável por teclado
- [ ] Status são anunciados para screen reader
- [ ] Cores não são único indicador (usa ícones/texto)
- [ ] Mensagens de erro são descritivas
- [ ] Focus visible em todos os elementos
- [ ] Modais têm focus trap

### Mobile

- [ ] Interface responsiva em todas as resoluções
- [ ] Calendário legível em telas pequenas
- [ ] Ações em swipe (iOS) funcionam
- [ ] Formulários adaptados para teclado mobile

---

## Relacionados

- [README](README.md)
- [Especificação](spec.md)
- [API](api.md)
- [Espaços - Critérios de Aceitação](../09-espacos/acceptance-criteria.md)
