---
module: api
document: endpoints-reference
status: complete
priority: mvp
last_updated: 2026-01-15
---

# Referência de Endpoints

[← Voltar ao Índice](README.md)

---

## Índice

- [Autenticação](#autenticação)
- [Dashboard](#dashboard)
- [Perfil](#perfil)
- [Carteirinha](#carteirinha)
- [Eventos](#eventos)
- [Badges](#badges)
- [Display](#display)
- [Espaços](#espaços)
- [Reservas](#reservas)
- [Minha Carteira](#minha-carteira)
- [Sistema de Pontos](#sistema-de-pontos)
- [Mensagens](#mensagens)
- [Pedidos](#pedidos)
- [Loja](#loja)
- [PDV](#pdv)
- [Assinaturas](#assinaturas)

---

## Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/login` | Login com email/senha |
| POST | `/auth/refresh` | Renovar token |
| POST | `/auth/logout` | Encerrar sessão |
| POST | `/auth/password/reset` | Solicitar reset de senha |

---

## Dashboard

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/dashboard` | Dados consolidados do dashboard | User |
| GET | `/notifications` | Listar notificações | User |
| PUT | `/notifications/:id/read` | Marcar como lida | User |
| PUT | `/notifications/read-all` | Marcar todas como lidas | User |

### Stories

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/stories` | Listar stories ativos | User |
| GET | `/stories/:id` | Visualizar story | User |
| POST | `/stories` | Criar story | ADM |
| DELETE | `/stories/:id` | Deletar story | ADM |

### Feed

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/feed` | Listar posts | User |
| GET | `/feed/:id` | Detalhes do post | User |
| POST | `/feed` | Criar post | User |
| PUT | `/feed/:id` | Editar post | Owner/ADM |
| DELETE | `/feed/:id` | Deletar post | Owner/ADM |
| POST | `/feed/:id/like` | Curtir post | User |
| DELETE | `/feed/:id/like` | Descurtir post | User |
| GET | `/feed/:id/comments` | Listar comentários | User |
| POST | `/feed/:id/comments` | Criar comentário | User |
| DELETE | `/feed/:id/comments/:cid` | Deletar comentário | Owner/ADM |

### Enquetes

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/feed/polls` | Criar enquete | ADM |
| POST | `/feed/polls/:id/vote` | Votar em opção | User |

---

## Perfil

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/user/profile` | Dados do perfil | User |
| PUT | `/user/profile` | Atualizar perfil | User |
| GET | `/user/profile/:id` | Perfil de outro usuário | User |
| GET | `/user/badges` | Badges conquistados | User |
| PUT | `/user/badges/featured` | Selecionar badges exibidos | User |

---

## Carteirinha

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/user/card` | Dados da carteirinha | User |
| GET | `/user/card/status` | Status ativo/inativo | User |
| GET | `/user/card/qrcode` | Gerar QR Code | User |
| GET | `/user/card/history` | Histórico de uso | User |

### Benefícios

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/benefits` | Listar parceiros | User |
| GET | `/benefits/:id` | Detalhes do parceiro | User |
| GET | `/benefits/categories` | Listar categorias | User |
| POST | `/benefits/nearby` | Parceiros próximos | User |

---

## Eventos

### Common User

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/events` | Listar eventos | User |
| GET | `/events/:id` | Detalhes do evento | User |
| POST | `/events/:id/confirm` | Confirmar presença | User |
| DELETE | `/events/:id/confirm` | Remover confirmação | User |
| POST | `/events/:id/checkin` | Fazer check-in | User |
| GET | `/events/:id/comments` | Listar comentários | User |
| POST | `/events/:id/comments` | Criar comentário | User |

### ADM

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/events` | Criar evento | ADM |
| PUT | `/events/:id` | Atualizar evento | ADM |
| DELETE | `/events/:id` | Deletar/Cancelar evento | ADM |
| POST | `/events/:id/publish` | Publicar rascunho | ADM |
| POST | `/events/:id/cancel` | Cancelar evento | ADM |
| POST | `/events/:id/pause` | Pausar check-ins | ADM |
| POST | `/events/:id/checkin/manual` | Check-in manual | ADM |
| GET | `/events/:id/analytics` | Analytics do evento | ADM |
| GET | `/events/:id/export/csv` | Exportar CSV | ADM |
| GET | `/events/:id/export/pdf` | Exportar PDF | ADM |

---

## Badges

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/badges` | Listar badges | ADM |
| POST | `/badges` | Criar badge | ADM |
| PUT | `/badges/:id` | Atualizar badge | ADM |
| DELETE | `/badges/:id` | Deletar badge | ADM |

---

## Display

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/display/:event_id` | Página do Display | Público |
| WS | `/ws/display/:event_id` | WebSocket do Display | Público |

---

## WebSocket Events

### Display (`/ws/display/:event_id`)

| Tipo | Direção | Descrição |
|------|---------|-----------|
| `qr_update` | Server → Client | Novo QR Code |
| `checkin_change` | Server → Client | Mudança de check-in |
| `counter_update` | Server → Client | Atualização do contador |
| `status_change` | Server → Client | Mudança de status |
| `heartbeat` | Bidirecional | Manter conexão viva |

---

## Espaços

### Gestão de Espaços

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/api/v1/espacos` | Listar espaços | Autenticado |
| GET | `/api/v1/espacos/:id` | Obter espaço | Autenticado |
| POST | `/api/v1/espacos` | Criar espaço | ADM |
| PUT | `/api/v1/espacos/:id` | Atualizar espaço | ADM |
| DELETE | `/api/v1/espacos/:id` | Deletar espaço | ADM |

### Operações de Espaço

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| PATCH | `/api/v1/espacos/:id/status` | Alterar status | Gerente, ADM |
| POST | `/api/v1/espacos/:id/bloqueios` | Bloquear datas | Gerente, ADM |
| DELETE | `/api/v1/espacos/:id/bloqueios/:bloqueio_id` | Remover bloqueio | Gerente, ADM |
| GET | `/api/v1/espacos/:id/disponibilidade` | Obter disponibilidade | Autenticado |
| POST | `/api/v1/espacos/:id/imagens` | Upload de imagem | ADM |

---

## Reservas

### Gestão de Reservas

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/api/v1/reservas` | Listar reservas | Gerente, ADM |
| GET | `/api/v1/reservas/:id` | Obter reserva | Autenticado |
| POST | `/api/v1/reservas` | Criar reserva | Autenticado |
| GET | `/api/v1/reservas/minhas` | Minhas reservas | Autenticado |
| GET | `/api/v1/reservas/pendentes` | Reservas pendentes | Gerente, ADM |

### Aprovação e Cancelamento

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/api/v1/reservas/:id/aprovar` | Aprovar reserva | Gerente, ADM |
| POST | `/api/v1/reservas/:id/rejeitar` | Rejeitar reserva | Gerente, ADM |
| POST | `/api/v1/reservas/:id/cancelar` | Cancelar reserva | Autenticado |

### Fila de Espera

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/api/v1/reservas/fila` | Entrar na fila | Autenticado |
| DELETE | `/api/v1/reservas/fila/:id` | Sair da fila | Autenticado |
| POST | `/api/v1/reservas/fila/:id/confirmar` | Confirmar vaga | Autenticado |
| GET | `/api/v1/reservas/fila/posicao` | Minha posição na fila | Autenticado |

---

## Minha Carteira

### Dashboard

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/wallet` | Dados da carteira | User |
| GET | `/wallet/summary` | Resumo por período | User |

### Scanner

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/wallet/scan` | Processar QR Code | User |

### Transferência

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/wallet/transfer` | Transferir pontos | User |
| GET | `/wallet/transfer/recent` | Destinatários recentes | User |
| GET | `/wallet/transfer/search` | Buscar usuários | User |

### Pagamento PDV (App)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/wallet/pdv/checkout/:code` | Detalhes do checkout | User |
| POST | `/wallet/pdv/checkout/:code/pay` | Pagar com pontos | User |
| POST | `/wallet/pdv/checkout/:code/pix` | Iniciar pagamento PIX | User |
| GET | `/wallet/pdv/checkout/:code/pix/status` | Status do PIX | User |
| POST | `/wallet/pdv/checkout/:code/cancel` | Cancelar checkout | User |

---

## Sistema de Pontos

### Saldo e Histórico

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/points/balance` | Saldo atual | User |
| GET | `/points/history` | Histórico de transações | User |
| GET | `/points/summary` | Resumo por período | User |

### Transferência

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/points/transfer` | Transferir pontos | User |
| GET | `/points/transfer/recent` | Destinatários recentes | User |
| GET | `/points/transfer/search` | Buscar usuários | User |

### Integração Strava

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/integrations/strava/connect` | Iniciar OAuth | User |
| GET | `/integrations/strava/callback` | Callback OAuth | Sistema |
| POST | `/integrations/strava/disconnect` | Desconectar | User |
| GET | `/integrations/strava/status` | Status da conexão | User |
| POST | `/integrations/strava/sync` | Sincronizar atividades | User |
| GET | `/integrations/strava/activities` | Listar atividades | User |

### Rankings

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/rankings/points` | Ranking por pontos | User |
| GET | `/rankings/events` | Ranking por check-ins | User |
| GET | `/rankings/strava` | Ranking por atividades | User |

### ADM - Pontos

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/admin/points/config` | Configurações | ADM |
| PUT | `/admin/points/config` | Atualizar configurações | ADM |
| POST | `/admin/points/grant` | Creditar pontos | ADM |
| POST | `/admin/points/deduct` | Debitar pontos | ADM |
| POST | `/admin/points/refund/:id` | Estornar transação | ADM |
| GET | `/admin/points/reports` | Relatórios | ADM |
| GET | `/admin/points/export` | Exportar CSV | ADM |

---

## Mensagens

### Conversas

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/v1/conversations` | Listar conversas | User |
| POST | `/v1/conversations` | Criar conversa | User |
| GET | `/v1/conversations/:id` | Detalhes da conversa | User |
| PUT | `/v1/conversations/:id/settings` | Atualizar configurações | User |
| DELETE | `/v1/conversations/:id` | Sair/deletar conversa | User |

### Mensagens

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/v1/conversations/:id/messages` | Listar mensagens | User |
| POST | `/v1/conversations/:id/messages` | Enviar mensagem | User |
| DELETE | `/v1/messages/:id` | Deletar mensagem | User |
| POST | `/v1/messages/:id/reactions` | Adicionar reação | User |
| DELETE | `/v1/messages/:id/reactions/:emoji` | Remover reação | User |
| POST | `/v1/conversations/:id/read` | Marcar como lida | User |
| POST | `/v1/conversations/:id/typing` | Indicar digitação | User |

### Grupos

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/v1/conversations/:id/group` | Informações do grupo | User |
| PUT | `/v1/conversations/:id/group` | Atualizar grupo | Admin Grupo |
| POST | `/v1/conversations/:id/group/participants` | Adicionar participantes | User |
| DELETE | `/v1/conversations/:id/group/participants/:userId` | Remover participante | Admin Grupo |
| POST | `/v1/conversations/:id/group/admins` | Promover a admin | Admin Grupo |

### WebSocket Mensagens

| Conexão | Descrição |
|---------|-----------|
| `wss://api.ahub.com.br/v1/ws/messages` | WebSocket de mensagens |

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `message.new` | Server → Client | Nova mensagem |
| `message.delivered` | Server → Client | Mensagem entregue |
| `message.read` | Server → Client | Mensagem lida |
| `typing.update` | Server → Client | Digitando |
| `presence.update` | Server → Client | Status online |
| `typing.start` | Client → Server | Começou a digitar |
| `typing.stop` | Client → Server | Parou de digitar |

---

## Pedidos

### Usuário

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/orders` | Listar pedidos | User |
| GET | `/orders/:id` | Detalhes do pedido | User |
| GET | `/orders/:id/receipt` | Comprovante | User |
| GET | `/orders/:id/vouchers` | Vouchers do pedido | User |
| GET | `/orders/:id/vouchers/:voucher_id` | Detalhes do voucher | User |

### ADM - Gestão

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/admin/orders` | Listar todos os pedidos | ADM |
| GET | `/admin/orders/:id` | Detalhes (visão ADM) | ADM |
| PATCH | `/admin/orders/:id/status` | Atualizar status | ADM |
| POST | `/admin/orders/:id/cancel` | Cancelar pedido | ADM |
| POST | `/admin/orders/batch/status` | Atualizar em lote | ADM |
| POST | `/admin/orders/pickup/validate` | Validar QR retirada | ADM |
| POST | `/admin/orders/:id/complete` | Confirmar retirada | ADM |
| POST | `/admin/vouchers/:id/use` | Marcar voucher usado | ADM |

### ADM - Relatórios

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/admin/reports/orders` | Relatório de pedidos | ADM |
| GET | `/admin/reports/orders/export` | Exportar CSV | ADM |

---

## Loja

### Categorias

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/store/categories` | Listar categorias | Público |

### Produtos

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/store/products` | Listar produtos | Público |
| GET | `/store/products/:slug` | Detalhes do produto | Público |
| GET | `/store/products/:id/variants/:variant_id` | Detalhes da variação | Público |

### Carrinho

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/store/cart` | Ver carrinho | User |
| POST | `/store/cart/items` | Adicionar item | User |
| PATCH | `/store/cart/items/:id` | Atualizar quantidade | User |
| DELETE | `/store/cart/items/:id` | Remover item | User |
| DELETE | `/store/cart` | Limpar carrinho | User |

### Checkout

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/store/checkout/validate` | Validar carrinho | User |
| POST | `/store/checkout` | Processar checkout | User |
| POST | `/store/checkout/stripe-intent` | Criar PaymentIntent | User |

### Favoritos

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/store/favorites` | Listar favoritos | User |
| POST | `/store/favorites` | Adicionar favorito | User |
| DELETE | `/store/favorites/:product_id` | Remover favorito | User |

### Avaliações

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/store/products/:id/reviews` | Listar avaliações | Público |
| POST | `/store/products/:id/reviews` | Criar avaliação | User |

### ADM - Loja

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/admin/categories` | Listar categorias | ADM |
| POST | `/admin/categories` | Criar categoria | ADM |
| PATCH | `/admin/categories/:id` | Atualizar categoria | ADM |
| DELETE | `/admin/categories/:id` | Desativar categoria | ADM |
| GET | `/admin/products` | Listar produtos | ADM |
| POST | `/admin/products` | Criar produto | ADM |
| PATCH | `/admin/products/:id` | Atualizar produto | ADM |
| DELETE | `/admin/products/:id` | Desativar produto | ADM |
| POST | `/admin/products/:id/variants` | Adicionar variação | ADM |
| PATCH | `/admin/products/:id/variants/:variant_id` | Atualizar variação | ADM |
| DELETE | `/admin/products/:id/variants/:variant_id` | Remover variação | ADM |
| PATCH | `/admin/products/:id/stock` | Atualizar estoque | ADM |
| POST | `/admin/products/:id/promotion` | Ativar promoção | ADM |
| DELETE | `/admin/products/:id/promotion` | Remover promoção | ADM |
| PATCH | `/admin/products/:id/featured` | Alterar destaque | ADM |
| GET | `/admin/reviews` | Avaliações pendentes | ADM |
| PATCH | `/admin/reviews/:id` | Moderar avaliação | ADM |
| GET | `/admin/reports/sales` | Relatório de vendas | ADM |
| GET | `/admin/reports/products` | Relatório por produto | ADM |
| GET | `/admin/reports/export` | Exportar CSV | ADM |

---

## PDV

### Display (Kiosk)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/pdv/:id/products` | Catálogo de produtos | API Key |
| POST | `/pdv/:id/checkout` | Criar checkout | API Key |
| GET | `/pdv/checkout/:code/status` | Status do checkout | API Key |
| POST | `/pdv/:id/checkout/:code/cancel` | Cancelar checkout | API Key |

### ADM - PDV

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/admin/pdv` | Listar PDVs | ADM |
| POST | `/admin/pdv` | Criar PDV | ADM |
| PUT | `/admin/pdv/:id` | Atualizar PDV | ADM |
| GET | `/admin/pdv/:id/stock` | Ver estoque | ADM |
| PUT | `/admin/pdv/:id/stock` | Atualizar estoque | ADM |
| POST | `/admin/pdv/:id/products` | Adicionar produto | ADM |
| PUT | `/admin/pdv/:id/products/:product_id` | Atualizar produto | ADM |
| DELETE | `/admin/pdv/:id/products/:product_id` | Remover produto | ADM |
| GET | `/admin/pdv/:id/sales` | Relatório de vendas | ADM |

---

## Assinaturas

### Usuário

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/subscriptions/plans` | Listar planos | User |
| GET | `/subscriptions/plans/:id` | Detalhes do plano | User |
| GET | `/subscriptions/my` | Minha assinatura | User |
| POST | `/subscriptions/subscribe` | Assinar plano | User |
| POST | `/subscriptions/change` | Trocar plano | User |
| POST | `/subscriptions/cancel` | Cancelar assinatura | User |
| GET | `/subscriptions/history` | Histórico | User |
| GET | `/subscriptions/benefits` | Benefícios ativos | User |

### ADM - Assinaturas

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/admin/subscriptions/plans` | Listar planos | ADM |
| POST | `/admin/subscriptions/plans` | Criar plano | ADM |
| PUT | `/admin/subscriptions/plans/:id` | Atualizar plano | ADM |
| DELETE | `/admin/subscriptions/plans/:id` | Desativar plano | ADM |
| GET | `/admin/subscriptions/subscribers` | Listar assinantes | ADM |
| POST | `/admin/subscriptions/users/:id/suspend` | Suspender assinatura | ADM |
| POST | `/admin/subscriptions/users/:id/activate` | Reativar assinatura | ADM |
| GET | `/admin/subscriptions/report` | Relatório consolidado | ADM |
| GET | `/admin/subscriptions/history` | Histórico de ações | ADM |

---

## Relacionados

- [Dashboard API](../01-dashboard/api.md)
- [Perfil API](../02-perfil/api.md)
- [Carteirinha API](../03-carteirinha/api.md)
- [Eventos API](../04-eventos/api.md)
- [Minha Carteira API](../05-minha-carteira/api.md)
- [Sistema de Pontos API](../06-sistema-pontos/api.md)
- [Mensagens API](../08-mensagens/api.md)
- [Espaços API](../09-espacos/api.md)
- [Reservas API](../10-reservas/api.md)
- [Pedidos API](../11-pedidos/api.md)
- [Loja API](../12-loja/api.md)
- [PDV API](../16-pdv/api.md)
- [Assinaturas API](../17-assinaturas/api.md)
