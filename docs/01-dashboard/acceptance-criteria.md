---
module: dashboard
document: acceptance-criteria
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Dashboard - Critérios de Aceitação

[← Voltar ao Índice](README.md)

---

## Índice

- [Header e Navegação](#header-e-navegação)
- [Card de Pontos](#card-de-pontos)
- [Acessos Rápidos](#acessos-rápidos)
- [Stories](#stories)
- [Feed - Posts Normais](#feed---posts-normais)
- [Feed - Comentários](#feed---comentários)
- [Feed - Enquetes](#feed---enquetes)
- [Feed - Eventos](#feed---eventos)
- [Gamificação](#gamificação)
- [Moderação](#moderação)
- [Onboarding](#onboarding)
- [Estados e Erros](#estados-e-erros)

---

## Header e Navegação

- [ ] Foto de perfil navega para perfil do usuário
- [ ] Badge de notificações mostra contador correto
- [ ] Dropdown de notificações abre e fecha corretamente
- [ ] Notificações são marcadas como lidas ao clicar
- [ ] Menu de configurações abre com todas opções
- [ ] Modo escuro alterna corretamente

---

## Card de Pontos

- [ ] Saldo de pontos é exibido corretamente
- [ ] Variação diária é calculada e exibida
- [ ] Gráfico de 7 dias é renderizado
- [ ] Animação de count up funciona ao ganhar pontos
- [ ] Navegação para Sistema de Pontos funciona

---

## Acessos Rápidos

- [ ] Todos os módulos são exibidos
- [ ] Scroll horizontal funciona suavemente
- [ ] Badges de novidades aparecem quando necessário
- [ ] Navegação para cada módulo funciona

---

## Stories

- [ ] Botão "+" abre criador de story
- [ ] Stories são exibidos em ordem correta (não vistos primeiro)
- [ ] Visualizador funciona com todos os tipos (foto/vídeo/texto)
- [ ] Barra de progresso avança automaticamente
- [ ] Responder abre chat com autor
- [ ] Visualizações aparecem apenas no próprio story
- [ ] Stories expiram após 24 horas

---

## Feed - Posts Normais

- [ ] Feed carrega 10 posts inicialmente
- [ ] Scroll infinito carrega mais posts
- [ ] Pull-to-refresh atualiza feed
- [ ] Curtir funciona com animação
- [ ] Comentar abre modal
- [ ] Avatar/nome navegam para perfil
- [ ] Imagem expande em lightbox
- [ ] Menu de opções funciona (editar/excluir/denunciar)

---

## Feed - Comentários

- [ ] Modal de comentários abre e fecha
- [ ] Comentários são exibidos corretamente
- [ ] Responder funciona (1 nível de aninhamento)
- [ ] Reações rápidas funcionam
- [ ] Menções @username funcionam
- [ ] Contador de caracteres aparece

---

## Feed - Enquetes

- [ ] Enquetes são exibidas corretamente
- [ ] Votar funciona (uma vez por usuário)
- [ ] Resultados aparecem após votar
- [ ] Porcentagem é calculada corretamente
- [ ] Tempo restante é exibido
- [ ] Enquetes encerram no prazo

---

## Feed - Eventos

- [ ] Post de evento é criado **automaticamente** ao criar evento no Módulo Eventos
- [ ] ADM não pode criar post de evento manualmente no feed
- [ ] Posts de eventos têm badge de ADM
- [ ] Banner é exibido corretamente
- [ ] Botão "Tenho Interesse" funciona (toggle)
- [ ] Contador de interessados é atualizado em tempo real
- [ ] Navegação para página do evento funciona
- [ ] Editar evento atualiza automaticamente o post no feed
- [ ] Deletar evento remove automaticamente o post do feed
- [ ] Post de evento não gera pontos

---

## Gamificação

- [ ] Usuário pode criar quantos posts quiser por dia
- [ ] Apenas o primeiro post do dia ganha 10 pontos
- [ ] Posts subsequentes no mesmo dia não ganham pontos
- [ ] Toast diferenciado: "+10 pontos!" no primeiro post vs "Post publicado!" nos demais
- [ ] Indicador mostra quando próximo post dará pontos
- [ ] Card de pontos atualiza em tempo real
- [ ] Reset diário à meia-noite funciona corretamente

---

## Moderação

- [ ] Denunciar post funciona
- [ ] ADM vê denúncias em painel
- [ ] ADM pode remover posts
- [ ] ADM pode suspender usuários
- [ ] Usuários suspensos não podem postar/comentar

---

## Onboarding

- [ ] Tooltips aparecem na primeira utilização
- [ ] Sequência de tooltips funciona
- [ ] "Pular tutorial" funciona
- [ ] Não repete após primeira vez

---

## Estados e Erros

- [ ] Loading states funcionam (skeleton)
- [ ] Estados vazios são amigáveis
- [ ] Erros de conexão são tratados
- [ ] Offline mode funciona (cache)

---

## Checklist de Validação Final

### Funcional
- [ ] Todas as navegações funcionam corretamente
- [ ] Todas as ações sociais funcionam (curtir, comentar, etc)
- [ ] Dados são salvos e recuperados corretamente
- [ ] Cache funciona conforme especificado

### Performance
- [ ] Time to Interactive < 3s
- [ ] Feed load time < 2s
- [ ] Story transition < 300ms
- [ ] Imagens carregam < 1s

### Acessibilidade
- [ ] Contrast ratio mínimo 4.5:1
- [ ] Touch targets mínimo 48x48px
- [ ] Labels para screen readers
- [ ] Font scaling funciona

### Responsividade
- [ ] Mobile (360-414px) funciona
- [ ] Tablet (768-1024px) funciona
- [ ] Scroll horizontal funciona em todas telas

---

## Relacionados

- [Especificação](spec.md)
- [Componentes](components.md)
- [API](api.md)
