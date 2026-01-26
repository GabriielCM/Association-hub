---
module: espacos
document: acceptance-criteria
status: complete
priority: phase2
last_updated: 2026-01-12
---

# Espaços - Critérios de Aceitação

[← Voltar ao Índice](README.md)

---

## Índice

- [Visualização de Espaços](#visualização-de-espaços)
- [CRUD de Espaços](#crud-de-espaços)
- [Configurações de Reserva](#configurações-de-reserva)
- [Gerenciamento de Status](#gerenciamento-de-status)
- [Bloqueio de Datas](#bloqueio-de-datas)
- [Galeria de Imagens](#galeria-de-imagens)
- [Disponibilidade](#disponibilidade)
- [Integrações](#integrações)
- [Performance](#performance)
- [Acessibilidade](#acessibilidade)

---

## Visualização de Espaços

### Lista de Espaços

- [ ] Lista exibe apenas espaços com status "ativo" para funcionários
- [ ] Lista exibe todos os espaços para Gerente e ADM
- [ ] Card de espaço mostra: foto principal, nome, capacidade, status
- [ ] Espaços em manutenção exibem badge "Em manutenção"
- [ ] Paginação funciona corretamente (20 itens por página)
- [ ] Filtro por status funciona (apenas para Gerente/ADM)
- [ ] Filtro por período de reserva funciona
- [ ] Filtro por capacidade funciona
- [ ] Lista carrega em menos de 1.5 segundos
- [ ] Scroll infinito ou botão "Carregar mais" funciona

### Página de Detalhes

- [ ] Exibe todas as fotos na galeria
- [ ] Galeria permite navegação entre fotos (swipe/setas)
- [ ] Galeria abre em lightbox ao clicar
- [ ] Exibe nome e descrição completa
- [ ] Exibe capacidade máxima
- [ ] Exibe taxa de locação (ou "Gratuito" se não houver)
- [ ] Exibe tipo de período (Dia inteiro / Turno / Hora)
- [ ] Exibe turnos disponíveis (se aplicável)
- [ ] Exibe horário de funcionamento (se aplicável)
- [ ] Exibe regras de antecedência
- [ ] Exibe intervalo entre locações (se aplicável)
- [ ] Exibe calendário de disponibilidade
- [ ] Botão "Reservar" leva para módulo de Reservas
- [ ] Página carrega em menos de 1 segundo

---

## CRUD de Espaços

### Criar Espaço (ADM)

- [ ] Formulário só é acessível para ADM
- [ ] Campo "Nome" é obrigatório e único
- [ ] Campo "Descrição" é obrigatório (mín 10 caracteres)
- [ ] Upload de foto é obrigatório (mín 1 foto)
- [ ] Campo "Capacidade" é obrigatório (1-1000)
- [ ] Campo "Taxa" é opcional (aceita 0 ou valor positivo)
- [ ] Seleção de período é obrigatória
- [ ] Se período = Turno, obriga definir mínimo 2 turnos
- [ ] Se período = Hora, obriga definir horário de funcionamento
- [ ] Antecedência mínima é obrigatória (0-365)
- [ ] Antecedência máxima é obrigatória e maior que mínima
- [ ] Intervalo entre locações é opcional (0-12 meses)
- [ ] Seleção de espaços bloqueados é opcional
- [ ] Ao salvar, espaço é criado com status "Ativo"
- [ ] Mensagem de sucesso é exibida
- [ ] Redireciona para página do espaço criado

### Editar Espaço (ADM)

- [ ] Formulário só é acessível para ADM
- [ ] Todos os campos são editáveis
- [ ] Validações são as mesmas da criação
- [ ] Ao alterar período com reservas futuras, exibe warning
- [ ] Alterações são salvas corretamente
- [ ] Data de atualização é registrada
- [ ] Mensagem de sucesso é exibida

### Deletar Espaço (ADM)

- [ ] Ação só é acessível para ADM
- [ ] Se há reservas futuras, exibe confirmação com opções
- [ ] Opção de cancelar reservas ou manter
- [ ] Soft delete preserva histórico
- [ ] Espaço não aparece mais na listagem pública
- [ ] ADM ainda consegue ver no painel (com badge "Inativo")
- [ ] Mensagem de sucesso é exibida

---

## Configurações de Reserva

### Período - Dia Inteiro

- [ ] Calendário mostra dias como disponível/ocupado/pendente
- [ ] Apenas uma reserva por dia é permitida
- [ ] Bloqueio de espaços relacionados funciona por dia

### Período - Turno

- [ ] Turnos configurados aparecem na interface
- [ ] Cada turno pode ser reservado independentemente
- [ ] Múltiplas reservas no mesmo dia são permitidas (turnos diferentes)
- [ ] Bloqueio de espaços relacionados funciona por turno

### Período - Hora

- [ ] Horário de funcionamento é respeitado
- [ ] Duração mínima é validada
- [ ] Usuário pode selecionar hora início e fim
- [ ] Conflitos de horário são detectados
- [ ] Múltiplas reservas no mesmo dia são permitidas (horários diferentes)

### Antecedência

- [ ] Reservas antes da antecedência mínima são bloqueadas
- [ ] Reservas após antecedência máxima são bloqueadas
- [ ] Mensagem clara explica a restrição

### Intervalo entre Locações

- [ ] Sistema verifica última reserva aprovada do usuário
- [ ] Se dentro do intervalo, bloqueia nova reserva
- [ ] Conta a partir da data da reserva (não da solicitação)
- [ ] Reservas canceladas não contam para o intervalo
- [ ] Mensagem clara explica quando poderá reservar novamente

### Bloqueio de Espaços Relacionados

- [ ] Ao reservar espaço A, espaços configurados ficam indisponíveis
- [ ] Bloqueio é unidirecional (A bloqueia B ≠ B bloqueia A)
- [ ] Aplica-se para reservas aprovadas E pendentes
- [ ] Calendário reflete os bloqueios corretamente

---

## Gerenciamento de Status

### Status Ativo → Manutenção

- [ ] Gerente ou ADM pode executar
- [ ] Exibe confirmação com opções sobre reservas
- [ ] Se cancelar reservas, notifica usuários afetados
- [ ] Espaço aparece com badge "Em manutenção"
- [ ] Novas reservas são bloqueadas

### Status Manutenção → Ativo

- [ ] Gerente ou ADM pode executar
- [ ] Espaço volta a aceitar reservas
- [ ] Badge de manutenção é removido

### Status Ativo → Inativo

- [ ] Apenas ADM pode executar
- [ ] Exibe confirmação severa (ação significativa)
- [ ] Trata reservas futuras conforme configurado
- [ ] Espaço sai da listagem pública
- [ ] Histórico é preservado

### Status Inativo → Ativo

- [ ] Apenas ADM pode executar
- [ ] Espaço volta para listagem pública
- [ ] Aceita novas reservas

---

## Bloqueio de Datas

### Criar Bloqueio

- [ ] Gerente ou ADM pode executar
- [ ] Permite selecionar múltiplas datas
- [ ] Campo de motivo é opcional
- [ ] Reservas pendentes nas datas são automaticamente rejeitadas
- [ ] Reservas aprovadas geram warning (decisão manual)
- [ ] Calendário atualiza imediatamente
- [ ] Mensagem de sucesso mostra quantas reservas foram afetadas

### Remover Bloqueio

- [ ] Gerente ou ADM pode executar
- [ ] Data volta a ficar disponível
- [ ] Calendário atualiza imediatamente

### Visualização de Bloqueios

- [ ] Datas bloqueadas aparecem destacadas no calendário
- [ ] Motivo do bloqueio é exibido no hover/tap
- [ ] Funcionário não consegue selecionar datas bloqueadas

---

## Galeria de Imagens

### Upload

- [ ] Apenas ADM pode fazer upload
- [ ] Aceita JPEG, PNG, WebP
- [ ] Limite de 10MB por imagem
- [ ] Dimensão mínima de 800x600px
- [ ] Máximo de 10 imagens por espaço
- [ ] Preview da imagem antes de confirmar
- [ ] Progress bar durante upload
- [ ] Compressão automática para otimização
- [ ] Thumbnail gerado automaticamente

### Gerenciamento

- [ ] Pode definir foto principal
- [ ] Pode reordenar fotos (drag and drop)
- [ ] Pode excluir fotos (mantendo mínimo 1)
- [ ] Exclusão pede confirmação

### Exibição

- [ ] Foto principal aparece no card da lista
- [ ] Galeria completa na página de detalhes
- [ ] Lightbox para visualização ampliada
- [ ] Lazy loading nas imagens
- [ ] Alt text exibido para acessibilidade

---

## Disponibilidade

### Calendário

- [ ] Exibe mês atual por padrão
- [ ] Permite navegar entre meses
- [ ] Cores diferentes para cada status:
  - Verde: Disponível
  - Amarelo: Pendente
  - Vermelho: Ocupado
  - Cinza: Bloqueado
  - Laranja: Manutenção
- [ ] Legenda explica as cores
- [ ] Não permite selecionar datas passadas
- [ ] Respeita antecedência mínima e máxima

### Lista de Datas

- [ ] Exibe próximas datas disponíveis
- [ ] Ordenação cronológica
- [ ] Mostra status de cada data
- [ ] Permite alternar entre visualização calendário/lista

### Atualização em Tempo Real

- [ ] Disponibilidade atualiza quando outra reserva é feita
- [ ] Cache de 5 minutos com invalidação
- [ ] Pull-to-refresh disponível

---

## Integrações

### Módulo de Reservas

- [ ] Lista de espaços é consumida corretamente
- [ ] Regras de reserva são aplicadas
- [ ] Disponibilidade é consultada
- [ ] Bloqueio de espaços relacionados funciona

### Módulo de Eventos

- [ ] Dropdown de espaços aparece na criação de evento
- [ ] Capacidade é preenchida automaticamente
- [ ] Fotos do espaço aparecem no evento
- [ ] Link para detalhes do espaço funciona

### Notificações

- [ ] Notifica usuários quando espaço entra em manutenção
- [ ] Notifica quando reserva é cancelada por manutenção
- [ ] Notifica quando data é bloqueada (reserva pendente rejeitada)

---

## Performance

### Métricas

- [ ] Lista de espaços carrega em < 1.5s
- [ ] Página de detalhes carrega em < 1s
- [ ] Calendário de disponibilidade carrega em < 500ms
- [ ] Upload de imagem completa em < 3s por imagem

### Otimizações

- [ ] Imagens carregam com lazy loading
- [ ] Paginação implementada corretamente
- [ ] Cache de disponibilidade funcionando
- [ ] Compressão de imagens no upload

---

## Acessibilidade

### WCAG 2.1 AA

- [ ] Contraste mínimo de 4.5:1 em todos os textos
- [ ] Touch targets mínimo de 48x48px
- [ ] Todas as imagens têm alt text
- [ ] Formulários têm labels descritivos
- [ ] Navegação por teclado funciona na galeria
- [ ] Calendário é navegável por screen reader
- [ ] Status são anunciados corretamente
- [ ] Mensagens de erro são descritivas
- [ ] Focus visible em todos os elementos interativos

### Mobile

- [ ] Interface responsiva em todas as resoluções
- [ ] Swipe funciona na galeria
- [ ] Formulários adaptados para mobile
- [ ] Calendário legível em telas pequenas

---

## Relacionados

- [README](README.md)
- [Especificação](spec.md)
- [API](api.md)
- [Reservas - Critérios de Aceitação](../10-reservas/acceptance-criteria.md)
