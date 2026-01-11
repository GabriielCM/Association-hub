---
module: dashboard
document: spec
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Dashboard - Especificação Técnica

[← Voltar ao Índice](README.md)

---

## Índice

- [Visão Geral](#visão-geral)
- [Objetivos](#objetivos)
- [Estrutura Lógica](#estrutura-lógica)
- [Fluxos de Navegação](#fluxos-de-navegação)
- [Responsividade](#responsividade)
- [Estados de Erro](#estados-de-erro)
- [Notas de Desenvolvimento](#notas-de-desenvolvimento)
- [Métricas de Sucesso](#métricas-de-sucesso)

---

## Visão Geral

**Prioridade:** 🔴 MVP
**Status:** 🟢 Especificação Completa

**Descrição:**
Tela principal do aplicativo onde o usuário tem acesso rápido a todas as funcionalidades principais e interage com o feed social. Ponto central de navegação e engajamento da comunidade.

---

## Objetivos

- Fornecer acesso rápido e intuitivo às funcionalidades principais
- Exibir informações relevantes do usuário (saldo de pontos, notificações)
- Promover engajamento através do feed social e stories
- Facilitar descoberta de eventos e novidades da associação
- Criar senso de comunidade através de interações sociais

---

## Estrutura Lógica

### Layout Completo

```
┌─────────────────────────────────────┐
│ [Header]                            │
│ [👤] Olá, João      [🔔] [⚙️]      │
├─────────────────────────────────────┤
│ [Card de Pontos]                    │
│ ⭐ 1.250 pts                        │
│ ↗ +50 hoje                          │
│ [Mini Gráfico]                      │
├─────────────────────────────────────┤
│ [Acessos Rápidos]                   │
│ [🎫] [💳] [🎉] [🏢] ... →          │
├─────────────────────────────────────┤
│ [Stories]                           │
│ [+] [👤] [👤] [👤] ... →           │
├─────────────────────────────────────┤
│ [Feed - Scroll Vertical]            │
│ ┌─────────────────────────────┐     │
│ │ Post 1 - Foto               │     │
│ └─────────────────────────────┘     │
│ ┌─────────────────────────────┐     │
│ │ Post 2 - Enquete            │     │
│ └─────────────────────────────┘     │
│ ┌─────────────────────────────┐     │
│ │ Post 3 - Evento (ADM)       │     │
│ └─────────────────────────────┘     │
│ ...                                 │
│ [Loading mais posts...]             │
└─────────────────────────────────────┘
```

### Hierarquia de Scroll

```
Header (Fixo)
  ↓
Card de Pontos (Scroll)
  ↓
Acessos Rápidos (Scroll horizontal independente)
  ↓
Stories (Scroll horizontal independente)
  ↓
Feed (Scroll vertical principal)
```

---

## Fluxos de Navegação

### Diagrama de Navegação

```
DASHBOARD (Home)
    │
    ├─ [Header]
    │   ├─ Foto → Perfil do Usuário
    │   ├─ Notificações → Dropdown → Contexto específico
    │   └─ Configurações → Menu → Opções
    │
    ├─ [Card Pontos]
    │   └─ Toque → Sistema de Pontos
    │
    ├─ [Acessos Rápidos]
    │   ├─ Carteirinha → Módulo Carteirinha
    │   ├─ Minha Carteira → Scanner QR Code
    │   ├─ Eventos → Módulo Eventos
    │   └─ [demais módulos...]
    │
    ├─ [Stories]
    │   ├─ "+" → Criador de Story
    │   ├─ Story → Visualizador → Responder → Mensagens
    │   └─ Avatar → Perfil do Usuário
    │
    └─ [Feed]
        ├─ Post
        │   ├─ Avatar/Nome → Perfil do Usuário
        │   ├─ Imagem → Lightbox
        │   ├─ Comentar → Modal Comentários
        │   │   └─ Avatar → Perfil do Usuário
        │   └─ Menu → Ações (Editar/Excluir/Denunciar)
        │
        ├─ Enquete
        │   └─ [mesmas opções do post]
        │
        └─ Evento (ADM)
            └─ Toque → Página do Evento (Módulo Eventos)
```

---

## Responsividade

### Mobile (360px - 414px)
- Layout padrão (single column)
- Card de pontos: 100% width
- Acessos rápidos: 3.5 cards visíveis
- Stories: 5-6 avatares visíveis
- Feed: Largura total

### Tablet (768px - 1024px)
- Layout similar
- Card de pontos: 100% width (max-width: 600px centralizado)
- Acessos rápidos: 5-6 cards visíveis
- Stories: 8-10 avatares visíveis
- Feed: Max-width 700px centralizado
- Componentes com mais espaçamento

### Desktop (>1024px) - Fase 2
- Feed centralizado (max-width: 600px)
- Sidebar com info adicional
- Acessos rápidos em grid fixo
- Stories em linha única

---

## Estados de Erro e Edge Cases

### Erros de Conexão

**Sem Internet:**
- Banner no topo: "Você está offline"
- Cache de últimos posts visíveis
- Ações (curtir, comentar) ficam na fila
- Sincroniza quando reconectar

**Erro ao Carregar Feed:**
- Card de erro: Ícone + "Não foi possível carregar o feed"
- Botão "Tentar novamente"
- Código de erro discreto (para suporte)

**Erro ao Postar:**
- Toast: "Erro ao publicar. Tentar novamente?"
- Opções: "Sim" | "Cancelar"
- Salva rascunho localmente

### Edge Cases

**Post Deletado Durante Visualização:**
- Modal desaparece suavemente
- Toast: "Este post foi removido"

**Usuário Bloqueado Visualizando Comentários:**
- Não consegue comentar
- Mensagem: "Você está temporariamente suspenso"

**Story Expirado Durante Visualização:**
- Pula para próximo story
- Se era o último, fecha visualizador

**Enquete Encerrada Antes de Votar:**
- Atualiza para modo "apenas visualização"
- Toast: "Esta enquete foi encerrada"

**Limite de Posts Diários Atingido:**
- Botão "Criar post" desabilitado
- Tooltip: "Limite diário atingido. Tente amanhã!"

---

## Notas de Desenvolvimento

### Performance

**Otimizações Críticas:**
- Lazy loading de imagens (progressive)
- Virtual scroll no feed (se >50 posts)
- Cache de posts (5 minutos)
- Debounce em ações (curtir, comentar)
- Compressão de imagens antes de upload
- Pagination infinita eficiente

**Métricas Alvo:**
- Time to Interactive: <3s
- Feed load time: <2s
- Story transition: <300ms
- Image load: <1s (com progressive)

### Acessibilidade

**Requisitos WCAG 2.1 AA:**
- Contrast ratio mín 4.5:1
- Touch targets mín 48x48px
- Labels descritivos para screen readers
- Suporte a font scaling (até 200%)
- Navegação por teclado (desktop)
- Feedback haptic em ações principais

**VoiceOver/TalkBack:**
- Descrições alternativas para imagens
- Anúncios de mudanças de estado
- Ordem de foco lógica

### Segurança

**Upload de Mídia:**
- Validação de tipo de arquivo
- Limite de tamanho (10MB imagem, 50MB vídeo)
- Scan de malware (backend)
- Sanitização de metadados EXIF

**Moderação de Conteúdo:**
- Filtro de palavras impróprias (opcional)
- Rate limiting (3 posts/hora)
- Detecção de spam (heurísticas simples)

### Testes

**Casos de Teste Críticos:**

1. **Feed:**
   - Carregar feed vazio
   - Carregar feed com 100+ posts
   - Scroll infinito até o final
   - Pull-to-refresh atualiza corretamente

2. **Stories:**
   - Criar story (foto/vídeo/texto)
   - Visualizar sequência de stories
   - Story expira após 24h
   - Visualizações aparecem apenas no próprio

3. **Interações:**
   - Curtir/descurtir post
   - Comentar com menção
   - Responder comentário
   - Votar em enquete

4. **Gamificação:**
   - Criar primeiro post do dia ganha 10 pontos
   - Criar segundo post do dia não ganha pontos
   - Toast correto em cada situação
   - Criar múltiplos posts funciona sem restrição
   - Reset à meia-noite funciona

5. **Eventos:**
   - Criar evento no Módulo Eventos gera post automaticamente no feed
   - Post de evento não pode ser criado manualmente
   - Editar evento atualiza post no feed
   - Deletar evento remove post do feed
   - "Tenho Interesse" funciona corretamente

6. **Offline:**
   - Feed em cache visível offline
   - Ações ficam em fila
   - Sincroniza ao reconectar

7. **Moderação:**
   - Denunciar post
   - ADM remove post
   - Usuário suspenso não pode postar

---

## Métricas de Sucesso

**KPIs a Acompanhar:**

### Engajamento
- DAU (Daily Active Users)
- Tempo médio de sessão
- Taxa de criação de posts (% usuários que postam)
- Taxa de interação (curtidas/comentários por post)

### Stories
- % de usuários que criam stories
- Taxa de visualização de stories
- Taxa de resposta em stories

### Feed
- Posts por dia (total)
- Comentários por post (média)
- Taxa de votação em enquetes
- Taxa de interesse em eventos

### Retenção
- D1, D7, D30 retention
- Frequência de retorno (diária/semanal)

### Moderação
- Número de denúncias
- Tempo médio de resolução
- Taxa de posts removidos

### Performance
- Tempo de carregamento do feed
- Taxa de erro em uploads
- Crash rate

---

## Melhorias Futuras (Backlog)

**Fase 2:**
- 🟡 Hashtags clicáveis
- 🟡 Feed algorítmico (além de cronológico)
- 🟡 Sugestões de pessoas para seguir
- 🟡 Posts salvos (favoritos)
- 🟡 Compartilhar post fora do app
- 🟡 Filtros para fotos
- 🟡 Stickers para stories
- 🟡 Música de fundo em stories

**Fase 3:**
- 🟢 Stories em destaque (permanentes)
- 🟢 Enquetes com múltipla escolha
- 🟢 Transmissão ao vivo
- 🟢 Reações além de curtir (❤️😂😮😢👏)
- 🟢 Feed personalizado (seguir usuários)
- 🟢 Analytics de posts (alcance, engajamento)

---

## Relacionados

- [Componentes UI](components.md)
- [API](api.md)
- [Critérios de Aceitação](acceptance-criteria.md)
