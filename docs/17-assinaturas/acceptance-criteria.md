---
module: assinaturas
document: acceptance-criteria
status: complete
priority: phase2
last_updated: 2026-01-14
---

# Assinaturas - Critérios de Aceitação

[← Voltar ao Índice](README.md)

---

## Índice

- [Vitrine de Planos](#vitrine-de-planos)
- [Detalhes do Plano](#detalhes-do-plano)
- [Assinar Plano](#assinar-plano)
- [Trocar de Plano](#trocar-de-plano)
- [Cancelar Assinatura](#cancelar-assinatura)
- [Minha Assinatura](#minha-assinatura)
- [Mutadores de Benefícios](#mutadores-de-benefícios)
- [Verificado Dourado](#verificado-dourado)
- [Convênios por Público-Alvo](#convênios-por-público-alvo)
- [ADM - Gestão de Planos](#adm---gestão-de-planos)
- [ADM - Gestão de Assinantes](#adm---gestão-de-assinantes)
- [Notificações](#notificações)
- [Segurança e Performance](#segurança-e-performance)

---

## Vitrine de Planos

### VP-01: Exibição da Vitrine

**Dado** que o usuário acessa a seção "Assinaturas"
**Quando** a tela é carregada
**Então** deve exibir até 3 planos disponíveis
**E** os planos devem estar ordenados por `display_order`
**E** planos inativos NÃO devem aparecer

- [ ] Teste: Vitrine exibe planos ativos ordenados

---

### VP-02: Card do Plano

**Dado** que a vitrine está exibindo planos
**Quando** o usuário visualiza um card
**Então** deve exibir: nome, preço, ícone, cor e resumo dos benefícios

- [ ] Teste: Card exibe todas as informações do plano

---

### VP-03: Indicação de Plano Atual

**Dado** que o usuário já possui assinatura ativa
**Quando** visualiza a vitrine
**Então** o plano atual deve ter destaque visual (badge "Seu plano")
**E** os outros planos devem exibir "Trocar para este"

- [ ] Teste: Plano atual está destacado na vitrine

---

### VP-04: Acesso Rápido no Dashboard

**Dado** que o usuário está no Dashboard
**Quando** visualiza os Acessos Rápidos
**Então** deve existir botão/card "Assinaturas"
**E** ao tocar, deve navegar para a vitrine de planos

- [ ] Teste: Acesso rápido funciona corretamente

---

## Detalhes do Plano

### DP-01: Exibição de Detalhes

**Dado** que o usuário toca em um plano na vitrine
**Quando** a tela de detalhes é carregada
**Então** deve exibir: nome, descrição completa, preço, todos os mutadores

- [ ] Teste: Detalhes exibem informações completas

---

### DP-02: Lista de Benefícios

**Dado** que o usuário visualiza detalhes do plano
**Quando** a seção de benefícios é renderizada
**Então** deve listar todos os mutadores com valores formatados
**E** deve incluir "Verificado dourado no perfil"

- [ ] Teste: Benefícios listados corretamente

---

### DP-03: Botão de Ação Contextual

**Dado** que o usuário visualiza detalhes de um plano
**Quando** não possui assinatura
**Então** o botão deve exibir "Assinar este plano"

**Dado** que o usuário visualiza detalhes de outro plano
**Quando** já possui assinatura diferente
**Então** o botão deve exibir "Trocar para este plano"

**Dado** que o usuário visualiza detalhes do seu plano atual
**Quando** já possui este plano
**Então** o botão deve estar desabilitado com texto "Você já possui este plano"

- [ ] Teste: Botão muda conforme contexto

---

## Assinar Plano

### AP-01: Fluxo de Assinatura

**Dado** que o usuário toca em "Assinar este plano"
**Quando** a confirmação é exibida
**Então** deve mostrar resumo do plano e preço
**E** deve ter checkbox de aceite dos termos

- [ ] Teste: Tela de confirmação exibe informações corretas

---

### AP-02: Confirmação de Assinatura

**Dado** que o usuário aceita os termos e confirma
**Quando** a requisição é processada
**Então** deve criar registro de assinatura com status "active"
**E** deve registrar no histórico com action "subscribed"
**E** deve incrementar `subscribers_count` do plano
**E** deve enviar notificação push de confirmação

- [ ] Teste: Assinatura criada corretamente
- [ ] Teste: Histórico registrado
- [ ] Teste: Contador atualizado
- [ ] Teste: Notificação enviada

---

### AP-03: Tela de Sucesso

**Dado** que a assinatura foi criada com sucesso
**Quando** a confirmação é recebida
**Então** deve exibir animação de celebração
**E** deve mostrar resumo dos benefícios ativados
**E** deve ter botão "Começar a aproveitar"

- [ ] Teste: Tela de sucesso exibida corretamente

---

### AP-04: Bloqueio de Dupla Assinatura

**Dado** que o usuário já possui assinatura ativa
**Quando** tenta assinar outro plano via API
**Então** deve retornar erro 400 com código "ALREADY_SUBSCRIBED"

- [ ] Teste: Dupla assinatura bloqueada

---

## Trocar de Plano

### TP-01: Exibição de Comparativo

**Dado** que o usuário com assinatura toca em outro plano
**Quando** a tela de troca é exibida
**Então** deve mostrar comparativo lado a lado (atual vs novo)
**E** deve destacar diferenças de benefícios e preço

- [ ] Teste: Comparativo exibido corretamente

---

### TP-02: Efeito Imediato

**Dado** que o usuário confirma a troca de plano
**Quando** a requisição é processada
**Então** deve atualizar o plano imediatamente
**E** novos mutadores devem ser aplicados imediatamente
**E** deve registrar no histórico com action "changed"

- [ ] Teste: Troca aplicada imediatamente
- [ ] Teste: Mutadores atualizados

---

### TP-03: Limite de Trocas

**Dado** que o usuário já trocou de plano 3 vezes no dia
**Quando** tenta trocar novamente
**Então** deve exibir erro "Limite de trocas excedido"
**E** deve informar quando poderá trocar novamente

- [ ] Teste: Limite de 3 trocas/dia aplicado

---

## Cancelar Assinatura

### CA-01: Modal de Confirmação

**Dado** que o usuário toca em "Cancelar assinatura"
**Quando** o modal é exibido
**Então** deve listar o que será perdido
**E** deve informar até quando os benefícios serão mantidos
**E** deve ter campo opcional para motivo

- [ ] Teste: Modal de cancelamento correto

---

### CA-02: Processamento do Cancelamento

**Dado** que o usuário confirma o cancelamento
**Quando** a requisição é processada
**Então** deve atualizar status para "cancelled"
**E** deve definir `cancelled_at`
**E** deve manter benefícios até `current_period_end`
**E** deve registrar no histórico

- [ ] Teste: Cancelamento processado
- [ ] Teste: Benefícios mantidos até fim do período

---

### CA-03: Perda de Benefícios

**Dado** que a assinatura foi cancelada
**Quando** `current_period_end` é atingido
**Então** os mutadores devem voltar ao padrão (1.0x, 0%)
**E** o verificado dourado deve desaparecer
**E** convênios exclusivos devem ser bloqueados

- [ ] Teste: Benefícios removidos após período

---

## Minha Assinatura

### MA-01: Visualização do Plano Atual

**Dado** que o usuário acessa "Minha Assinatura"
**Quando** possui assinatura ativa
**Então** deve exibir card do plano com todos os benefícios
**E** deve mostrar data de assinatura
**E** deve mostrar próxima renovação

- [ ] Teste: Informações da assinatura exibidas

---

### MA-02: Histórico de Assinaturas

**Dado** que o usuário acessa o histórico
**Quando** a lista é carregada
**Então** deve exibir todas as ações em ordem cronológica
**E** deve incluir: assinaturas, trocas, cancelamentos

- [ ] Teste: Histórico completo exibido

---

### MA-03: Usuário Sem Assinatura

**Dado** que o usuário acessa "Minha Assinatura"
**Quando** NÃO possui assinatura
**Então** deve exibir mensagem convidando a assinar
**E** deve ter botão para ir à vitrine

- [ ] Teste: Estado vazio tratado corretamente

---

## Mutadores de Benefícios

### MB-01: Multiplicador de Pontos em Eventos

**Dado** que o usuário com assinatura faz check-in em evento
**Quando** os pontos são calculados
**Então** deve aplicar o multiplicador do plano
**E** exemplo: 50 pts × 1.5 = 75 pts

- [ ] Teste: Multiplicador de eventos aplicado
- [ ] Teste: Transação registra valor final

---

### MB-02: Multiplicador de Pontos Strava

**Dado** que o usuário com assinatura sincroniza Strava
**Quando** os pontos são calculados
**Então** deve aplicar o multiplicador sobre pts/km
**E** limite diário (5km) NÃO deve ser alterado

- [ ] Teste: Multiplicador de Strava aplicado
- [ ] Teste: Limite diário mantido

---

### MB-03: Multiplicador de Pontos Posts

**Dado** que o usuário com assinatura publica o 1º post do dia
**Quando** os pontos são creditados
**Então** deve aplicar o multiplicador
**E** 2º post em diante NÃO ganha pontos

- [ ] Teste: Multiplicador de posts aplicado
- [ ] Teste: Apenas 1º post bonifica

---

### MB-04: Desconto na Loja

**Dado** que o usuário com assinatura compra na Loja
**Quando** o preço é calculado
**Então** deve aplicar desconto percentual
**E** desconto visível no carrinho e checkout

- [ ] Teste: Desconto aplicado no carrinho
- [ ] Teste: Desconto aplicado no checkout

---

### MB-05: Desconto no PDV

**Dado** que o usuário com assinatura compra no PDV
**Quando** o preço é calculado
**Então** deve aplicar desconto percentual
**E** desconto visível na confirmação do app

- [ ] Teste: Desconto aplicado no PDV

---

### MB-06: Desconto em Espaços

**Dado** que o usuário com assinatura reserva um espaço
**Quando** o preço é calculado
**Então** deve aplicar desconto percentual sobre valor/hora
**E** desconto visível na tela de confirmação

- [ ] Teste: Desconto aplicado na reserva

---

### MB-07: Cashback Ampliado

**Dado** que o usuário com assinatura compra com PIX/dinheiro
**Quando** o cashback é calculado
**Então** deve usar o MAIOR entre: base, plano, promoção
**E** cashback do plano SUBSTITUI o base (não soma)

- [ ] Teste: Cashback usa maior valor
- [ ] Teste: Cashback não soma

---

### MB-08: Mutador Zero

**Dado** que um plano tem mutador = 0 para algum benefício
**Quando** o benefício é calculado
**Então** não deve aplicar bônus (valor base ou nenhum)

- [ ] Teste: Mutador zero funciona corretamente

---

## Verificado Dourado

### VD-01: Exibição em Posts

**Dado** que o usuário com assinatura ativa publica um post
**Quando** o post é exibido no feed
**Então** deve exibir ícone dourado ao lado do nome

- [ ] Teste: Verificado aparece em posts

---

### VD-02: Exibição em Stories

**Dado** que o usuário com assinatura ativa publica story
**Quando** o story é visualizado
**Então** deve exibir ícone dourado ao lado do nome no viewer

- [ ] Teste: Verificado aparece em stories

---

### VD-03: Exibição no Perfil

**Dado** que o perfil de usuário assinante é visualizado
**Quando** a tela de perfil é carregada
**Então** deve exibir ícone dourado ao lado do nome no header

- [ ] Teste: Verificado aparece no perfil

---

### VD-04: Remoção Dinâmica

**Dado** que a assinatura do usuário é cancelada/suspensa
**Quando** o período acaba ou suspensão é aplicada
**Então** o verificado deve desaparecer de TODOS os lugares
**E** inclui posts antigos, stories, perfil

- [ ] Teste: Verificado removido dinamicamente

---

### VD-05: Não Aparece em Outros Locais

**Dado** que o usuário com assinatura é exibido
**Quando** está em: comentários, rankings, transferências
**Então** o verificado NÃO deve aparecer

- [ ] Teste: Verificado não aparece em locais não especificados

---

### VD-06: Não Ocultável

**Dado** que o usuário tenta ocultar o verificado
**Então** não deve existir opção para esconder

- [ ] Teste: Não há opção de ocultar verificado

---

## Convênios por Público-Alvo

### CP-01: Convênio para Todos

**Dado** que um convênio tem `eligible_audiences = ["all"]`
**Quando** qualquer usuário visualiza a lista
**Então** o convênio deve aparecer normalmente

- [ ] Teste: Convênio universal visível para todos

---

### CP-02: Convênio Exclusivo para Assinantes

**Dado** que um convênio tem `eligible_audiences = ["subscribers"]`
**Quando** um assinante visualiza
**Então** deve aparecer normalmente

**Quando** um não-assinante visualiza
**Então** deve aparecer com cadeado e mensagem "Assine para desbloquear"

- [ ] Teste: Assinante vê normal
- [ ] Teste: Não-assinante vê bloqueado

---

### CP-03: Convênio para Plano Específico

**Dado** que um convênio tem `eligible_plans = ["plan-gold-uuid"]`
**Quando** assinante do Gold visualiza
**Então** deve aparecer normalmente

**Quando** assinante de outro plano visualiza
**Então** deve aparecer com cadeado

- [ ] Teste: Plano específico tem acesso
- [ ] Teste: Outros planos veem bloqueado

---

### CP-04: Link para Vitrine

**Dado** que o usuário toca em convênio bloqueado
**Quando** toca em "Assine para desbloquear"
**Então** deve navegar para a vitrine de planos

- [ ] Teste: Link para vitrine funciona

---

## ADM - Gestão de Planos

### GP-01: Listar Planos

**Dado** que o ADM acessa a gestão de planos
**Quando** a lista é carregada
**Então** deve exibir todos os planos (ativos e inativos)
**E** deve mostrar quantidade de assinantes de cada

- [ ] Teste: Lista completa exibida

---

### GP-02: Criar Plano

**Dado** que o ADM preenche formulário de novo plano
**Quando** confirma a criação
**Então** o plano deve ser criado e aparecer na vitrine
**E** deve validar limite de 3 planos ativos

- [ ] Teste: Plano criado corretamente
- [ ] Teste: Limite de 3 planos validado

---

### GP-03: Editar Plano

**Dado** que o ADM edita um plano com assinantes
**Quando** confirma as alterações
**Então** as mudanças devem aplicar imediatamente a todos
**E** deve exibir aviso sobre assinantes afetados

- [ ] Teste: Edição aplicada imediatamente
- [ ] Teste: Aviso exibido

---

### GP-04: Desativar Plano

**Dado** que o ADM desativa um plano
**Quando** a ação é confirmada
**Então** o plano deve sumir da vitrine
**E** assinantes atuais devem MANTER seus benefícios

- [ ] Teste: Plano removido da vitrine
- [ ] Teste: Assinantes não afetados

---

### GP-05: Validação de Nome Único

**Dado** que o ADM tenta criar plano com nome existente
**Quando** a validação é feita
**Então** deve retornar erro de conflito

- [ ] Teste: Nome duplicado rejeitado

---

## ADM - Gestão de Assinantes

### GA-01: Listar Assinantes

**Dado** que o ADM acessa a lista de assinantes
**Quando** aplica filtros (plano, status, busca)
**Então** deve retornar lista filtrada corretamente

- [ ] Teste: Filtros funcionam corretamente

---

### GA-02: Suspender Assinatura

**Dado** que o ADM suspende assinatura de um usuário
**Quando** a ação é confirmada com motivo
**Então** status deve mudar para "suspended"
**E** benefícios devem ser removidos imediatamente
**E** verificado deve desaparecer
**E** usuário deve ser notificado

- [ ] Teste: Suspensão aplicada
- [ ] Teste: Benefícios removidos
- [ ] Teste: Notificação enviada

---

### GA-03: Reativar Assinatura

**Dado** que o ADM reativa assinatura suspensa
**Quando** a ação é confirmada
**Então** status deve mudar para "active"
**E** benefícios devem ser restaurados
**E** verificado deve reaparecer
**E** usuário deve ser notificado

- [ ] Teste: Reativação aplicada
- [ ] Teste: Benefícios restaurados

---

### GA-04: Relatórios

**Dado** que o ADM acessa relatórios de assinaturas
**Quando** o dashboard é carregado
**Então** deve exibir: total, por plano, receita, churn

- [ ] Teste: Relatórios exibidos corretamente

---

### GA-05: Exportar Dados

**Dado** que o ADM solicita exportação CSV
**Quando** o arquivo é gerado
**Então** deve incluir todos os assinantes com informações

- [ ] Teste: Exportação funciona

---

## Notificações

### NO-01: Assinatura Ativada

**Dado** que o usuário assina um plano
**Quando** a assinatura é confirmada
**Então** deve receber push "Sua assinatura [Plano] está ativa!"

- [ ] Teste: Notificação de ativação enviada

---

### NO-02: Assinatura Suspensa

**Dado** que a assinatura é suspensa pelo ADM
**Quando** a ação é processada
**Então** deve receber push "Sua assinatura foi suspensa"

- [ ] Teste: Notificação de suspensão enviada

---

### NO-03: Assinatura Cancelada

**Dado** que o usuário cancela a assinatura
**Quando** o cancelamento é confirmado
**Então** deve receber push informando data de fim dos benefícios

- [ ] Teste: Notificação de cancelamento enviada

---

### NO-04: Troca de Plano

**Dado** que o usuário troca de plano
**Quando** a troca é confirmada
**Então** deve receber push sobre o novo plano

- [ ] Teste: Notificação de troca enviada

---

## Segurança e Performance

### SP-01: Autenticação de Endpoints

**Dado** que um endpoint é chamado sem token
**Quando** a requisição chega ao servidor
**Então** deve retornar 401 Unauthorized

- [ ] Teste: Endpoints protegidos por auth

---

### SP-02: Permissão de ADM

**Dado** que um usuário comum tenta acessar /admin/
**Quando** a requisição é validada
**Então** deve retornar 403 Forbidden

- [ ] Teste: Endpoints ADM protegidos

---

### SP-03: Rate Limiting

**Dado** que o usuário excede o limite de requisições
**Quando** a próxima requisição é feita
**Então** deve retornar 429 Too Many Requests

- [ ] Teste: Rate limit aplicado

---

### SP-04: Integridade de Dados

**Dado** que uma transação de assinatura ocorre
**Quando** há erro no meio do processo
**Então** a transação deve ser revertida (rollback)

- [ ] Teste: Transações são atômicas

---

### SP-05: Performance de Verificado

**Dado** que um feed com 50 posts é carregado
**Quando** o verificado é verificado para cada autor
**Então** deve completar em menos de 500ms

- [ ] Teste: Performance do verificado aceitável

---

### SP-06: Cache de Planos

**Dado** que a vitrine de planos é acessada
**Quando** já foi carregada recentemente (< 5 min)
**Então** deve usar dados em cache

- [ ] Teste: Cache de planos funciona

---

## Resumo de Critérios

| Categoria | Total | Críticos |
|-----------|-------|----------|
| Vitrine de Planos | 4 | 2 |
| Detalhes do Plano | 3 | 1 |
| Assinar Plano | 4 | 3 |
| Trocar de Plano | 3 | 2 |
| Cancelar Assinatura | 3 | 2 |
| Minha Assinatura | 3 | 1 |
| Mutadores de Benefícios | 8 | 7 |
| Verificado Dourado | 6 | 4 |
| Convênios por Público-Alvo | 4 | 3 |
| ADM - Gestão de Planos | 5 | 3 |
| ADM - Gestão de Assinantes | 5 | 3 |
| Notificações | 4 | 2 |
| Segurança e Performance | 6 | 4 |
| **TOTAL** | **58** | **37** |

---

## Relacionados

- [README](README.md)
- [Especificação](spec.md)
- [API](api.md)
