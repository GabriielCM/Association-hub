---
module: projeto
document: changelog
status: complete
priority: mvp
last_updated: 2026-01-26
---

# Changelog

Histórico de alterações na documentação do A-hub.

---

## [1.7.0] - 2026-01-26

### Módulo de Notificações

Sistema completo de notificações centralizado para manter usuários informados sobre atividades relevantes no app. Suporta push notifications (FCM/APNs), notificações in-app, agrupamento de notificações similares (batching), configuração por categoria e modo Não Perturbe.

### Adicionado

**Módulo Notificações (07-notificacoes/):**
- `README.md` - Atualizado de parcial para completo
- `spec.md` - Especificação completa com modelos de dados, 5 telas e 4 fluxos
- `api.md` - 15+ endpoints REST e eventos WebSocket
- `acceptance-criteria.md` - 176 critérios de aceitação

**Funcionalidades documentadas:**

*Sistema de Notificações:*
- 27 tipos de notificação em 5 categorias (Social, Eventos, Pontos, Reservas, Sistema)
- Push notifications via FCM (Android) e APNs (iOS)
- Notificações in-app com badge e Central de Notificações
- Agrupamento (batching) de notificações similares em janela de 1 hora
- Configuração de push e in-app separados por categoria
- Modo Não Perturbe com horário e dias configuráveis
- Deep links para navegação contextual
- Histórico de até 500 notificações mais recentes

*Central de Notificações:*
- Lista agrupada por período (Hoje, Ontem, Esta semana, etc.)
- Filtros por categoria com contador de não lidas
- Swipe para marcar como lida ou deletar
- Marcar todas como lidas (por categoria ou todas)
- Pull-to-refresh e scroll infinito

*Real-time:*
- WebSocket para recebimento instantâneo
- Eventos: notification.new, notification.read, notification.deleted
- Atualização de badge em tempo real
- Sincronização de configurações entre dispositivos

### Alterado

- `docs/README.md` - Status de Notificações atualizado para Completo
- Versão atualizada para 1.7

### Decisões de Negócio Documentadas

- **Retenção:** Permanente (limite 500 mais recentes)
- **Agrupamento:** Sim, notificações similares em janela de 1 hora
- **Configuração:** Por categoria (5 categorias), não por tipo individual
- **Não Perturbe:** Sim, com horário e dias da semana configuráveis
- **Sons:** Padrão do sistema operacional
- **Offline:** Push funciona, lista sincroniza ao reconectar
- **Sistema de Pontos:** NÃO integra (notificações não geram pontos)

---

## [1.6.0] - 2026-01-26

### Módulo de Suporte

Sistema completo de suporte ao usuário com múltiplos canais de atendimento: tickets categorizados, chat ao vivo 24/7 e FAQ básico. Inclui captura automática de erros do app.

### Adicionado

**Novo Módulo Suporte (14-suporte/):**
- `README.md` - Atualizado de stub para completo
- `spec.md` - Especificação completa com modelos de dados, 10 telas e 4 fluxos
- `api.md` - 30+ endpoints para usuário, chat e ADM
- `acceptance-criteria.md` - 216 critérios de aceitação

**Funcionalidades documentadas:**

*Para Usuários:*
- Tickets categorizados (Bug, Sugestão, Dúvida)
- Chat ao vivo 24/7 com fila de espera
- FAQ básico com busca e accordion
- Anexos até 5 arquivos (10MB cada)
- Avaliação 1-5 estrelas após resolução
- Tickets automáticos em crash (captura device info)
- Notificações push + in-app para atualizações

*Para Administradores:*
- Lista de tickets com filtros por status e categoria
- Responder e gerenciar status de tickets
- Visualização de device info em tickets automáticos
- CRUD de FAQ com reordenação drag-and-drop
- Fila de chat ao vivo
- Aceitar, atender e transferir chats

**Real-time:**
- WebSocket para atualizações de tickets
- WebSocket para chat ao vivo
- Posição na fila atualizada em tempo real
- Indicador "digitando" no chat

### Alterado

- `docs/README.md` - Status de Suporte atualizado para Completo
- Versão atualizada para 1.6

### Decisões de Negócio Documentadas

- **Categorias:** Fixas (Bug, Sugestão, Dúvida) - ADM não pode criar
- **Prioridades:** NÃO (todos tickets tratados igualmente)
- **Integração Pontos:** NÃO
- **Limite Anexos:** 5 por mensagem, 10MB cada
- **Chat:** 24/7 disponível com fila de espera
- **Avaliação:** 1-5 estrelas + comentário opcional
- **Ticket Automático:** Crash captura stack trace, device info, versão app
- **Métricas ADM:** Básico (lista com filtros, sem dashboard avançado)
- **FAQ:** Básico (perguntas frequentes, sem base de conhecimento completa)

---

## [1.5.0] - 2026-01-14

### Módulo de Assinaturas

Sistema completo de assinaturas premium que permite ao ADM criar planos com mutadores de benefícios. Assinantes ganham multiplicadores de pontos, descontos em compras e locações, cashback ampliado e verificado dourado visual.

### Adicionado

**Novo Módulo Assinaturas (17-assinaturas/):**
- `README.md` - Visão geral e links rápidos
- `spec.md` - Especificação completa com modelos de dados
- `api.md` - 15+ endpoints para usuário e ADM
- `acceptance-criteria.md` - 58 critérios de aceitação

**Funcionalidades documentadas:**
- Até 3 planos simultâneos (exclusivos por associado)
- Mutadores de pontos: eventos (1.5x), Strava (1.5x), posts (2.0x)
- Descontos percentuais: Loja, PDV e Espaços
- Cashback ampliado (substitui base)
- Verificado dourado em posts, stories e perfil
- Vitrine pública de planos
- Gestão ADM: criar, editar, desativar planos
- Suspender/reativar assinaturas por ADM
- Dashboard de relatórios para ADM
- Histórico de assinaturas do usuário

**Integração com Convênios:**
- Público-alvo de convênios (Todos, Assinantes, Não-assinantes, Planos específicos)
- Convênios bloqueados com cadeado para não elegíveis
- Campos `eligible_audiences`, `eligible_plans`, `show_locked_for_ineligible`

### Alterado

- `docs/README.md` - Adicionado módulo 17-assinaturas na lista (v1.5)
- `docs/03-carteirinha/benefits.md` - Seção de público-alvo de convênios
- `docs/06-sistema-pontos/spec.md` - Seção 15 sobre multiplicadores de assinatura
- `docs/01-dashboard/components.md` - Assinaturas no Acessos Rápidos + verificado dourado em posts/stories
- `docs/02-perfil/spec.md` - Verificado dourado no header do perfil
- `docs/12-loja/spec.md` - Seção 10.4 sobre descontos de assinatura
- `docs/16-pdv/spec.md` - Seção 7.3 sobre descontos de assinatura
- `docs/10-reservas/spec.md` - Integração com assinaturas para desconto em locações

### Decisões de Negócio Documentadas

- **Limite de planos:** Máximo 3 ativos
- **Exclusividade:** 1 assinatura por associado
- **Cobrança:** Externa (fora do sistema) - ADM suspende manualmente
- **Cancelamento:** Livre, benefícios até fim do período
- **Troca de plano:** Efeito imediato
- **Edição de plano:** Aplica imediatamente a todos os assinantes
- **Verificado dourado:** Dinâmico (some ao perder assinatura)
- **Descontos:** Não acumulam com promoções (usa o maior)
- **Cashback:** Substitui base (não soma)
- **Limites diários:** Mantidos (mutadores não afetam limite de 5km Strava)

---

## [1.4.0] - 2026-01-13

### Integração PIX no PDV

Extensão do sistema de pagamento PIX (Stripe) para o módulo PDV, permitindo que usuários paguem com pontos OU PIX em compras nos kiosks.

### Adicionado

**Módulo PDV (16-pdv/):**
- Fluxo completo de pagamento via PIX nos displays
- Preço dual em produtos (pontos E R$)
- QR Code PIX dinâmico via Stripe
- Tela "Aguardando PIX" no display
- Cashback em compras via PIX
- Webhooks para confirmação de pagamento PIX
- Novos endpoints de API para pagamento PIX

**Módulo Sistema de Pontos (06-sistema-pontos/):**
- Novo source `pdv_cashback` (credit) - Cashback de compras no PDV via PIX
- Modelo `PointsGlobalConfig` para configuração de taxa de conversão e cashback
- Configurações globais no painel ADM (taxa de conversão, % cashback)
- Notificações de cashback (Loja e PDV)

**Módulo Loja (12-loja/):**
- Campo `allow_mixed_payment` no modelo de Produto
- Tabela de regras de pagamento misto (Loja vs PDV)

### Alterado

- `docs/16-pdv/spec.md` - Adicionada seção completa de pagamento PIX
- `docs/16-pdv/api.md` - Novos endpoints de pagamento PIX no app
- `docs/16-pdv/acceptance-criteria.md` - Critérios de aceitação para PIX
- `docs/12-loja/spec.md` - Flag `allow_mixed_payment` no modelo de dados
- `docs/06-sistema-pontos/spec.md` - Modelo PointsGlobalConfig e source pdv_cashback
- Versão atualizada para 1.4

### Decisões de Negócio Documentadas

- **PDV**: Pagamento APENAS pontos OU PIX (nunca misto)
- **Loja**: Pagamento pontos, PIX, ou misto (configurável por produto)
- **Taxa de conversão**: Global, definida pelo ADM (ex: 1 ponto = R$ 0,50)
- **Cashback**: Percentual global para compras com dinheiro/PIX (Loja e PDV)
- **Expiração PIX**: 5 minutos (mesmo do QR do display)
- **Webhook Stripe**: Confirmação automática de pagamento PIX
- **Feedback no display**: Status em tempo real durante pagamento PIX

---

## [1.3.0] - 2026-01-13

### Módulos Loja e Pedidos

Documentação completa do sistema de e-commerce e histórico de pedidos do A-hub.

### Adicionado

**Módulo Loja (12-loja/):**
- `README.md` - Atualizado de stub para completo
- `spec.md` - Especificação completa com modelo de dados detalhado
- `api.md` - Endpoints REST para catálogo, carrinho, checkout e ADM
- `acceptance-criteria.md` - 188 critérios de aceitação

Funcionalidades documentadas:
- Catálogo com categorias customizáveis pelo ADM
- Produtos com variações (SKU separado por tamanho/cor)
- Galeria de imagens por produto
- Três tipos: físico, voucher e serviço
- Pagamento: apenas pontos, apenas dinheiro (Stripe PIX) ou misto
- Carrinho com reserva de estoque (30 minutos)
- Compra direta ou via carrinho
- Sistema de favoritos
- Avaliações com moderação (1-5 estrelas + comentário)
- Preço promocional temporário
- Produtos em destaque (curado pelo ADM)
- Produtos exclusivos por plano de associação
- Limite de compra por usuário configurável
- Cashback percentual em compras com dinheiro
- Vouchers com validade configurável
- Retirada via QR Code
- Dashboard ADM com relatórios e exportação CSV

**Módulo Pedidos (11-pedidos/):**
- `README.md` - Atualizado de stub para completo
- `spec.md` - Especificação com modelo de dados e fluxos
- `api.md` - Endpoints para histórico, vouchers e gestão ADM
- `acceptance-criteria.md` - 125 critérios de aceitação

Funcionalidades documentadas:
- Histórico unificado Loja + PDV
- Mesmo nível de detalhe para ambas as fontes
- Timeline de status (Pendente → Confirmado → Pronto → Concluído)
- QR Code de retirada para produtos físicos
- Comprovante digital completo
- Gestão de vouchers (código, validade, uso)
- Dashboard ADM com pedidos pendentes
- Ações em lote (atualizar status)
- Scanner QR para confirmar retirada
- Cancelamento com estorno automático de pontos
- Relatórios com exportação CSV

**Integração Sistema de Pontos:**
- Novo source `shop_cashback` (credit) - Cashback de compras na Loja

### Alterado

- `docs/README.md` - Atualizado status de Loja e Pedidos para Completo
- `docs/06-sistema-pontos/spec.md` - Adicionado source `shop_cashback`
- Versão atualizada para 1.3

### Decisões de Negócio Documentadas

- Tipos de produto: físico, voucher e serviço
- Entrega: físicos = retirada presencial, digitais = automático
- Pagamento: pontos, dinheiro (Stripe PIX) ou misto (configurável por produto)
- Estoque: configurável por item (limitado ou ilimitado)
- Categorias: customizáveis pelo ADM
- Variações: SKU separado com estoque independente
- Carrinho: opção de compra direta + carrinho
- Limite por usuário: configurável por produto
- Promoções: apenas preço promocional temporário
- Destaques: curado pelo ADM
- Exclusividade: por tipo de associado/plano
- Descrição: campos estruturados (curta, longa, especificações)
- Favoritos: lista simples sem notificação
- Reviews: com moderação (1-5 estrelas + comentário)
- Cashback: percentual configurável
- Vouchers: validade configurável, uso via código no app
- Ordenação: recentes, preço, mais vendidos, alfabético
- Ponto de retirada: único (sede principal)
- Histórico de pedidos: completo (Loja + PDV unificados)
- Status: fluxo simples (Pendente → Confirmado → Pronto → Concluído)
- Cancelamento: apenas por ADM com estorno automático
- Comprovante: digital completo (apenas visualização)
- Dashboard ADM: completo com relatórios

---

## [1.2.0] - 2026-01-12

### Módulos Espaços e Reservas

Documentação completa do sistema de espaços físicos e reservas do A-hub.

### Adicionado

**Módulo Espaços (09-espacos/):**
- `README.md` - Atualizado de stub para completo
- `spec.md` - Especificação com CRUD, configurações e estados
- `api.md` - Endpoints para gestão de espaços e disponibilidade
- `acceptance-criteria.md` - Critérios de aceitação detalhados
- Campos configuráveis: nome, descrição, galeria, capacidade, taxa
- Período de reserva configurável (dia/turno/hora)
- Antecedência mín/máx configurável por espaço
- Intervalo entre locações do mesmo usuário
- Bloqueio de espaços relacionados
- Estados: Ativo, Manutenção, Inativo
- Bloqueio de datas específicas

**Módulo Reservas (10-reservas/):**
- `README.md` - Atualizado de stub para completo
- `spec.md` - Fluxo completo de reservas com aprovação
- `api.md` - Endpoints para reservas, aprovação e fila de espera
- `acceptance-criteria.md` - Critérios de aceitação detalhados
- Fluxo: Funcionário solicita, Gerente/ADM aprova
- Reserva pendente bloqueia data até deliberação
- Expiração automática se não aprovada até a data
- Fila de espera com notificação de vaga
- Privacidade total (não exibe quem reservou)
- Estados: Pendente, Aprovado, Rejeitado, Cancelado, Expirado, Concluído

### Alterado

- `docs/README.md` - Atualizado status de Espaços e Reservas para Completo
- Versão atualizada para 1.2

### Decisões de Negócio Documentadas

- Tipos de espaços: Áreas de lazer (churrasqueira, salão, quadra, piscina)
- Papéis: Funcionário (solicita), Gerente (aprova), ADM (administra)
- Custo: Opcional por espaço (ADM define)
- Período: Configurável por espaço (dia inteiro, turno ou hora)
- Aprovação: Fluxo simples (sem justificativa obrigatória)
- Notificações: Básicas (apenas aprovação/rejeição)
- Sistema de pontos: Não integra
- Carteirinha: Não integra
- Feed social: Mostra apenas "espaço ocupado" (privacidade)
- Funcionamento offline: Não suportado
- Fila de espera: Máximo 10 pessoas, 24h para confirmar vaga
- Cancelamento: Até 24h antes para funcionário, qualquer momento para ADM

---

## [1.1.0] - 2026-01-11

### Sistema de Pontos, Minha Carteira e PDV

Documentação completa do sistema central de gamificação do A-hub.

### Adicionado

**Módulo Sistema de Pontos (06-sistema-pontos/):**
- `spec.md` - Especificação completa com modelo de dados, fluxos e regras
- `api.md` - Endpoints para saldo, histórico, transferências, Strava e ADM
- `acceptance-criteria.md` - Critérios de aceitação detalhados
- Integração com Strava (OAuth, sincronização manual, limite 5km/dia)
- Sistema de rankings (pontos, eventos, Strava)
- Configuração ADM (taxas, estorno, relatórios CSV)

**Módulo Minha Carteira (05-minha-carteira/):**
- `spec.md` - Especificação com telas, fluxos e componentes
- `api.md` - Endpoints da carteira, scanner e transferência
- `acceptance-criteria.md` - Critérios de aceitação
- Scanner universal (detecta QR de check-in, transferência, PDV)
- Design de carteira visual com QR pessoal
- Fluxo de transferência com biometria

**Módulo PDV - Novo (16-pdv/):**
- `README.md` - Visão geral do sistema de pontos de venda
- `spec.md` - Arquitetura, interface do display, fluxos
- `api.md` - Endpoints para display e gestão ADM
- `acceptance-criteria.md` - Critérios de aceitação
- Sistema de kiosks com displays touchscreen
- Gestão de estoque por PDV
- Fluxo de pagamento via QR Code
- Relatórios de vendas por PDV

### Alterado

- `06-sistema-pontos/README.md` - Atualizado com índice e visão geral completa
- `05-minha-carteira/README.md` - Atualizado com índice e funcionalidades

### Decisões de Negócio Documentadas

- Nome da moeda: Association-points (customizável por associação)
- Pontos não expiram
- Transferências sem limite e sem valor mínimo
- Confirmação de transações via biometria (Face ID / Touch ID)
- Strava: sincronização manual, máximo 5km/dia pontuáveis
- Taxas Strava: Corrida 10pts/km, Bike 5pts/km (configurável ADM)
- PDV: usuário escaneia QR do display, liberação manual do produto
- Rankings múltiplos: por pontos, eventos e atividades físicas

---

## [1.0.0] - 2026-01-10

### Reestruturação Completa

A documentação foi reestruturada de um único arquivo (`a-hub.md` com ~5.045 linhas) para uma estrutura modular com ~50 arquivos organizados em 18 pastas.

### Adicionado

**Estrutura de Pastas:**
- `docs/` - Diretório raiz da documentação
- `00-overview/` - Visão geral do produto
- `01-dashboard/` - Módulo Dashboard
- `02-perfil/` - Módulo Perfil do Usuário
- `03-carteirinha/` - Módulo Carteirinha Digital
- `04-eventos/` - Módulo Eventos (maior módulo)
- `05-minha-carteira/` - Módulo Scanner (stub)
- `06-sistema-pontos/` - Módulo Pontos (parcial)
- `07-notificacoes/` - Módulo Notificações (parcial)
- `08-mensagens/` - Módulo Mensagens (stub)
- `09-espacos/` - Módulo Espaços (stub, Fase 2)
- `10-reservas/` - Módulo Reservas (stub, Fase 2)
- `11-pedidos/` - Módulo Pedidos (stub, Fase 2)
- `12-loja/` - Módulo Loja (stub, Fase 2)
- `13-rankings/` - Módulo Rankings (stub, Fase 2)
- `14-suporte/` - Módulo Suporte (stub, Fase 2)
- `15-jukebox/` - Módulo Jukebox (stub, Nice to Have)
- `shared/` - Componentes e padrões compartilhados
- `api/` - Documentação da API

**Documentos Principais:**
- README.md principal com índice e status de todos os módulos
- YAML front matter em todos os arquivos para metadados
- Links internos entre documentos relacionados
- Seções de "Relacionados" em cada documento

**Módulos Completos (MVP):**
- Dashboard: spec, components, api, acceptance-criteria
- Perfil: spec, api, acceptance-criteria
- Carteirinha: spec, benefits, qr-code, api, acceptance-criteria
- Eventos: spec, creation, display, checkin-system, qr-code-security, badges, analytics, api, acceptance-criteria

**Seções Compartilhadas:**
- Design System
- Autenticação
- Responsividade
- Acessibilidade (WCAG 2.1 AA)
- Performance
- Convenções de documentação

**Referência de API:**
- Índice consolidado de endpoints
- Organização por módulo
- Documentação de WebSocket

### Melhorado

- Navegação entre documentos com links relativos
- Consistência na estrutura de cada módulo
- Metadados YAML para automação futura
- Separação clara entre conteúdo MVP, Fase 2 e Nice to Have

### Notas

- Todo o conteúdo original foi preservado
- Módulos stub contêm placeholder "[A preencher]" para expansão futura
- Conteúdo duplicado foi consolidado na pasta `shared/`

---

## Formato do Changelog

Este changelog segue o formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

Tipos de mudanças:
- **Adicionado** - Novos recursos
- **Alterado** - Mudanças em recursos existentes
- **Obsoleto** - Recursos que serão removidos em breve
- **Removido** - Recursos removidos
- **Corrigido** - Correções de bugs
- **Segurança** - Vulnerabilidades corrigidas
