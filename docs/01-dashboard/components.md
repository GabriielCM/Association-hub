---
module: dashboard
document: components
status: complete
priority: mvp
last_updated: 2026-01-10
---

# Dashboard - Componentes UI

[← Voltar ao Índice](README.md)

---

## Índice

- [1. Cabeçalho / Identidade do Usuário](#1-cabeçalho--identidade-do-usuário)
- [2. Card de Saldo de Pontos](#2-card-de-saldo-de-pontos)
- [3. Acessos Rápidos](#3-acessos-rápidos)
- [4. Stories de Usuários](#4-stories-de-usuários)
- [5. Feed de Usuários](#5-feed-de-usuários)
- [6. Sistema de Pontos no Feed](#6-sistema-de-pontos-no-feed)
- [7. Moderação e Privacidade](#7-moderação-e-privacidade)
- [8. Onboarding do Dashboard](#8-onboarding-do-dashboard)

---

## 1. Cabeçalho / Identidade do Usuário

### 1.1 Layout e Elementos

**Estrutura (Esquerda → Direita):**
```
[Foto] Olá, [Nome]          [🔔] [⚙️]
```

**Elementos:**

1. **Foto de Perfil**
   - Tamanho: 40x40px
   - Formato: Circular
   - Border: 2px sólido (cor primária)
   - Fallback: Iniciais do nome em fundo colorido

2. **Saudação Personalizada**
   - Texto: "Olá, [primeiro nome]"
   - Tipografia: 16px, semi-bold
   - Cor: Texto primário
   - Truncar nome se > 12 caracteres

3. **Badge de Notificações**
   - Ícone: Sino (🔔)
   - Tamanho: 24x24px
   - Badge contador: Círculo vermelho com número
   - Máx exibido: 99+ (se > 99)

4. **Ícone de Configurações**
   - Ícone: Engrenagem (⚙️)
   - Tamanho: 24x24px
   - Cor: Cinza médio

---

### 1.2 Interações

**Foto de Perfil:**
- Toque → Navega para perfil do usuário
- Feedback: Escala 0.95 (pressed state)

**Badge de Notificações:**
- Toque → Abre dropdown inline de notificações
- Animação: Slide down (200ms)
- Posição: Abaixo do ícone, alinhado à direita

**Ícone de Configurações:**
- Toque → Abre menu de configurações rápidas
- Animação: Fade in (150ms)

---

### 1.3 Dropdown de Notificações

**Layout:**
```
┌─────────────────────────────────┐
│ Notificações (3)          [×]   │
├─────────────────────────────────┤
│ 👤 João curtiu seu post         │
│    há 5 minutos                 │
├─────────────────────────────────┤
│ 💬 Maria comentou: "Que legal!" │
│    há 15 minutos                │
├─────────────────────────────────┤
│ 🎉 Novo evento: Festa Junina    │
│    há 1 hora                    │
├─────────────────────────────────┤
│ [Ver todas as notificações]     │
└─────────────────────────────────┘
```

**Características:**
- Max-height: 300px (scroll se necessário)
- Exibe últimas 5 notificações
- Card por notificação com:
  - Ícone representativo
  - Texto da notificação
  - Tempo relativo (ex: "há 5 minutos")
  - Background diferente se não lida
- Botão "Ver todas" no final → Navega para página de Notificações
- Botão "×" no canto → Fecha dropdown

**Interações:**
- Toque na notificação → Navega para contexto (post, perfil, evento)
- Marca como lida automaticamente
- Toque fora → Fecha dropdown
- Swipe down na notificação → Remove (opcional)

**Estados:**
- [ ] Sem notificações (mensagem "Você está em dia!")
- [ ] Com notificações não lidas (badge + background)
- [ ] Com notificações lidas (sem badge)
- [ ] Loading (skeleton)

---

### 1.4 Menu de Configurações Rápidas

**Itens do Menu:**

1. **Perfil**
   - Ícone: 👤
   - Ação: Navega para perfil do usuário

2. **Modo Escuro**
   - Ícone: 🌙 / ☀️ (toggle)
   - Ação: Alterna tema
   - Estado: Switch on/off

3. **Notificações**
   - Ícone: 🔔
   - Ação: Navega para configurações de notificações
   - Badge: "Nova" se houver configs pendentes

4. **Configurações**
   - Ícone: ⚙️
   - Ação: Navega para configurações gerais

5. **Suporte**
   - Ícone: 💬
   - Ação: Navega para módulo de suporte

6. **Sair**
   - Ícone: 🚪
   - Ação: Modal de confirmação → Logout
   - Cor: Vermelho (destaque)

**UX:**
- Animação: Slide from right (250ms)
- Overlay escuro atrás (70% opacidade)
- Toque fora → Fecha menu
- Divider entre "Suporte" e "Sair"

---

## 2. Card de Saldo de Pontos

### 2.1 Layout e Design

**Estrutura:**
```
┌─────────────────────────────────┐
│ ⭐ Seus Pontos          [📊]    │
│                                 │
│     1.250 pts                   │
│     ↗ +50 hoje                  │
│                                 │
│ ───────────────────────────     │
│ Últimos 7 dias                  │
│     ▁▂▃▄▅▆▇                     │
└─────────────────────────────────┘
```

**Elementos:**

1. **Header**
   - Ícone de pontos: ⭐ (24x24px)
   - Título: "Seus Pontos"
   - Ícone de navegação: 📊 ou → (direita)

2. **Saldo Principal**
   - Valor: Grande, bold (32px)
   - Formato: "X.XXX pts"
   - Cor: Destaque (primária ou dourado)
   - Animação ao aumentar: Count up effect

3. **Variação Diária**
   - Texto: "↗ +50 hoje" ou "↘ -20 hoje"
   - Tipografia: 14px
   - Cor: Verde (ganho) ou Vermelho (perda)
   - Ícone de tendência: ↗ ou ↘

4. **Gráfico de Evolução**
   - Título: "Últimos 7 dias"
   - Gráfico: Mini bar chart ou line chart
   - Altura: 40px
   - Cor: Gradiente da cor primária
   - Interativo (opcional): Tooltip ao tocar

**Background:**
- Gradiente suave ou cor sólida
- Elevação: Shadow 2dp
- Border radius: 12px
- Padding: 16px

---

### 2.2 Interações

**Card Inteiro:**
- Toque → Navega para "Sistema de Pontos"
- Feedback: Pressed state com scale 0.98
- Animação: Transition suave (200ms)

**Ícone de Navegação:**
- Indicador visual de que é clicável
- Rotação sutil ao carregar (opcional)

---

### 2.3 Estados

**Estados do Card:**
- [ ] Saldo positivo (normal)
- [ ] Saldo zerado (mensagem motivacional: "Ganhe seus primeiros pontos!")
- [ ] Loading (skeleton com shimmer)
- [ ] Erro ao carregar (ícone + "Tentar novamente")

**Regras de Negócio:**
- Atualização em tempo real ao ganhar/gastar pontos
- Animação celebratória ao ganhar pontos (confetti - opcional)
- Notificação push quando ganhar pontos
- Cache de 5 minutos (atualiza no background)

---

## 3. Acessos Rápidos

### 3.1 Layout e Estrutura

**Design:** Carrossel horizontal (scroll)

**Ordem Fixa dos Módulos:**
1. Carteirinha (🎫)
2. Minha Carteira (💳) - Scanner QR
3. Eventos (🎉)
4. Espaços (🏢)
5. Reservas (📅)
6. Pedidos (🍔)
7. Loja (🛒)
8. Rankings (🏆)
9. Jukebox (🎵)
10. Suporte (💬)

**Quantidade Visível:**
- Mobile: 3.5-4 ícones visíveis
- Tablet: 5-6 ícones visíveis
- Scroll horizontal suave
- Indicador de scroll (dots) abaixo

---

### 3.2 Padrão de Card

**Cada Card Contém:**

1. **Ícone**
   - Tamanho: 32x32px
   - Estilo: Outline ou filled (consistente)
   - Cor: Primária ou específica do módulo

2. **Label**
   - Texto: Nome do módulo
   - Tipografia: 12px, medium
   - Cor: Texto secundário
   - Alinhamento: Centro
   - Max 2 linhas

3. **Badge de Novidade** (opcional)
   - Posição: Canto superior direito
   - Cor: Vermelho ou laranja
   - Tamanho: 8x8px (dot) ou contador
   - Exemplo: "3" para 3 notificações pendentes

**Design do Card:**
- Tamanho: 80x80px
- Background: Branco ou cor suave
- Border radius: 12px
- Shadow: 1dp
- Padding: 12px

---

### 3.3 Interações

**Card Individual:**
- Toque → Navega para módulo correspondente
- Feedback: Pressed state + scale 0.95
- Haptic feedback (leve)

**Scroll Horizontal:**
- Swipe suave
- Snap to grid (alinha cards)
- Momentum scroll

---

### 3.4 Estados

**Estados dos Cards:**
- [ ] Carregado (normal)
- [ ] Loading (skeleton 10 cards)
- [ ] Com novidade (badge vermelho)
- [ ] Desabilitado (módulo em manutenção - opacidade 50%)

**Badges por Módulo:**
- Carteirinha: Badge se status inativo
- Eventos: Número de eventos próximos
- Reservas: Número de reservas pendentes
- Pedidos: Número de pedidos em andamento
- Mensagens: Número de mensagens não lidas

---

## 4. Stories de Usuários

### 4.1 Layout e Estrutura

**Design:** Lista horizontal (scroll)

**Estrutura:**
```
[+] [Avatar1] [Avatar2] [Avatar3] ...
Seu  João     Maria     Pedro
```

**Primeiro Item - "Adicionar Story":**
- Ícone: "+" grande dentro de círculo
- Texto: "Seu story" ou "Adicionar"
- Background: Gradiente ou cor primária
- Destaque visual

**Demais Itens - Stories de Usuários:**
- Avatar circular (60x60px)
- Anel colorido se não visto (gradiente)
- Anel cinza se já visto
- Nome abaixo (10px, truncado)
- Espaçamento: 12px entre avatares

---

### 4.2 Criação de Stories

**Ao Clicar em "+":**
- Abre modal/tela de criação
- Opções disponíveis:
  - 📷 Câmera (capturar foto/vídeo na hora)
  - 🖼️ Galeria (selecionar foto/vídeo)
  - ✏️ Texto sobre fundo colorido

**Editor de Story:**

**Modo Foto/Vídeo:**
- Preview da mídia
- Filtros (opcional - Fase 2)
- Texto sobreposto
- Desenhar (opcional - Fase 2)
- Botões: "Cancelar" | "Publicar"

**Modo Texto:**
- Campo de texto central
- Limite: 280 caracteres
- Seletor de background (6-8 cores/gradientes)
- Font selector (3-4 fontes)
- Botões: "Cancelar" | "Publicar"

**Validações:**
- Foto: JPG, PNG (máx 10MB)
- Vídeo: MP4 (máx 30s, máx 50MB)
- Texto: Min 1 caractere, máx 280

---

### 4.3 Visualização de Stories

**Ao Clicar em Story:**
- Abre visualizador fullscreen
- Transição: Zoom from thumbnail

**Interface do Visualizador:**

```
┌─────────────────────────────────┐
│ [← João Silva        [×]        │
│    há 2h             [⋮]        │
│                                 │
│                                 │
│        [CONTEÚDO]               │
│                                 │
│                                 │
│ [━━━━━━━━━━━━] 1/3             │
│                                 │
│ [💬 Responder]                  │
└─────────────────────────────────┘
```

**Header:**
- Avatar + nome do autor
- Tempo desde publicação
- Botão fechar (×)
- Menu (⋮) - opções: denunciar, compartilhar

**Barra de Progresso:**
- Indica story atual (ex: 1/3)
- Auto-avança após 5s (foto) ou duração (vídeo)
- Múltiplas barras se usuário tem vários stories

**Footer:**
- Campo "Responder" → Abre chat com autor
- **Se for MEU story:** Botão "Visualizações" (👁️ X)

**Interações:**
- Toque esquerda → Story anterior
- Toque direita → Próximo story
- Toque longo → Pausa
- Swipe down → Fecha visualizador

---

### 4.4 Visualizações do Story (Apenas Próprio)

**Ao Clicar em "Visualizações" no MEU Story:**
- Abre bottom sheet
- Lista de quem visualizou:
  - Avatar + nome
  - Tempo da visualização ("há 5 min")
  - Ordenado: Mais recente primeiro
- Contador total no header
- Atualização em tempo real

---

### 4.5 Regras de Negócio

**Duração e Visibilidade:**
- Stories duram 24 horas
- Após 24h, são automaticamente deletados
- Notificação 1h antes de expirar (opcional)

**Ordem de Exibição:**
- Stories não vistos primeiro
- Depois stories já vistos
- Dentro de cada categoria: ordem cronológica

**Limites:**
- Usuário pode postar até 10 stories por dia
- Cada story individual: Máx 30s (vídeo) ou tempo ilimitado (foto/texto)

---

### 4.6 Estados

**Estados da Seção:**
- [ ] Sem stories (apenas botão "+")
- [ ] Com stories não vistos
- [ ] Com stories já vistos
- [ ] Loading (skeleton de avatares)
- [ ] Erro ao carregar

**Estados do Visualizador:**
- [ ] Loading story
- [ ] Reproduzindo
- [ ] Pausado (toque longo)
- [ ] Erro ao carregar (próximo story)

---

## 5. Feed de Usuários

### 5.1 Estrutura Geral

**Layout:** Lista vertical (scroll infinito)

**Tipos de Post:**
1. Foto + Descrição
2. Enquete
3. Evento (Apenas ADM)

**Carregamento Inicial:**
- 10 posts carregados inicialmente
- Ao chegar no final → Carrega automaticamente mais 10
- Loading indicator no final da lista

---

### 5.2 Post com Foto + Descrição

**Estrutura do Card:**

```
┌─────────────────────────────────┐
│ 👤 João Silva           [⋮]     │
│    há 2 horas                   │
├─────────────────────────────────┤
│                                 │
│         [FOTO]                  │
│       (1:1 ou 4:5)              │
│                                 │
├─────────────────────────────────┤
│ ❤️ 24    💬 5                   │
│                                 │
│ Descrição do post aqui...       │
│ Ver mais                        │
└─────────────────────────────────┘
```

**Header do Post:**
- Avatar (36x36px) + nome do autor
- Tempo desde publicação (relativo: "há 2h")
- Menu de opções (⋮) no canto direito

**Imagem:**
- Proporção: 1:1 (quadrado) ou 4:5 (vertical)
- Width: 100% do card
- Tap para expandir (lightbox)
- Pinch to zoom no lightbox
- Swipe para fechar

**Ações (Barra de Botões):**
- ❤️ Curtir (contador visível)
- 💬 Comentar (contador visível)
- Estado: Preenchido se usuário já interagiu

**Descrição:**
- Máx 500 caracteres
- Truncar após 3 linhas
- Botão "Ver mais" se > 3 linhas
- Suporte a:
  - Quebras de linha
  - Hashtags clicáveis (opcional - Fase 2)
  - Menções @username (clicáveis)

---

### 5.3 Interações no Post

**Avatar/Nome:**
- Toque → Navega para perfil do autor

**Curtir:**
- Toque → Anima ícone (coração bate)
- Incrementa contador
- Cor muda para vermelho
- Haptic feedback
- Double tap na imagem também curte

**Comentar:**
- Toque → Abre modal de comentários
- Focus automático no campo de texto

**Menu de Opções (⋮):**

**Se for POST DE OUTRO USUÁRIO:**
- Denunciar → Modal de confirmação + motivo
- Ocultar → Remove do feed (ação reversível)

**Se for MEU POST:**
- Editar → Abre editor (apenas descrição)
- Excluir → Modal de confirmação

---

### 5.4 Modal de Comentários

**Layout:**

```
┌─────────────────────────────────┐
│ Comentários (5)          [×]    │
├─────────────────────────────────┤
│ 👤 Maria Silva       [❤️ 2]     │
│    Que legal! 🎉                │
│    há 1 hora                    │
│      └ Responder                │
│                                 │
│    └─ 👤 João Silva             │
│       Obrigado! 😊              │
│       há 30 min      [❤️ 1]     │
├─────────────────────────────────┤
│ 👤 Pedro Santos                 │
│    Parabéns!                    │
│    há 2 horas                   │
│      └ Responder                │
├─────────────────────────────────┤
│ [Digite um comentário...]  [>]  │
└─────────────────────────────────┘
```

**Características:**
- Lista de comentários (ordem: mais recentes primeiro)
- Scroll vertical
- Comentário pai + respostas aninhadas (1 nível)
- Max-height: 70% da tela

**Cada Comentário Contém:**
- Avatar (32x32px) + nome
- Texto do comentário
- Tempo relativo
- Botão "Responder"
- Reações rápidas: ❤️ 👍 😂 😮 (contador ao lado)

**Campo de Texto:**
- Placeholder: "Digite um comentário..."
- Suporte a:
  - Texto (máx 500 caracteres)
  - Emojis
  - Menções @username (autocomplete)
- Botão enviar (>)
- Contador de caracteres se > 400

**Interações:**
- Toque em "Responder" → Campo muda para "Respondendo a @fulano" + focus
- Toque em reação → Adiciona/remove reação
- Avatar do comentário → Abre perfil
- Swipe no comentário (próprio) → Opção de excluir

---

### 5.5 Post com Enquete

**Estrutura do Card:**

```
┌─────────────────────────────────┐
│ 👤 Maria Silva          [⋮]     │
│    há 3 horas                   │
├─────────────────────────────────┤
│ 📊 Qual seu horário preferido?  │
│                                 │
│ ☐ Manhã (9h-12h)      35% ███  │
│ ☑ Tarde (14h-18h)     45% ████ │
│ ☐ Noite (19h-22h)     20% ██   │
│                                 │
│ 125 votos • Encerra em 2 dias   │
├─────────────────────────────────┤
│ 💬 3 comentários                │
└─────────────────────────────────┘
```

**Header do Post:**
- Avatar + nome do autor
- Tempo desde publicação
- Menu de opções (⋮)

**Pergunta:**
- Ícone: 📊
- Título da enquete (bold, 16px)
- Máx 200 caracteres

**Opções de Resposta:**

**ANTES DE VOTAR:**
- Checkbox vazio (☐)
- Texto da opção
- Todas opções clicáveis

**DEPOIS DE VOTAR:**
- Checkbox preenchido (☑) na opção votada
- Barra de progresso visual (gradiente)
- Porcentagem ao lado
- Opções não mais clicáveis

**Rodapé:**
- Total de votos
- Tempo restante (ex: "Encerra em 2 dias")
- Se encerrada: "Enquete encerrada"

**Comentários:**
- Botão "💬 X comentários"
- Mesma funcionalidade do post normal

---

### 5.6 Regras de Enquetes

**Criação:**
- Pergunta: 10-200 caracteres
- Opções: Min 2, máx 4
- Cada opção: 3-80 caracteres
- Prazo: Criador escolhe (1 dia, 3 dias, 7 dias, sem prazo)

**Votação:**
- Um voto por usuário
- Não pode alterar voto
- Não pode ver quem votou em cada opção
- Resultados visíveis após votar

**Encerramento:**
- Após prazo definido
- Criador pode encerrar manualmente (Fase 2)
- Após encerrada: apenas visualização

---

### 5.7 Post de Evento (Apenas ADM)

> **⚠️ IMPORTANTE:** Posts de eventos **NÃO são criados manualmente** no feed. Eles são gerados **automaticamente** quando um ADM cria um evento no Módulo de Eventos. O post aparece no feed como divulgação do evento.

**Estrutura do Card:**

```
┌─────────────────────────────────┐
│ 🛡️ ADMINISTRAÇÃO        [⋮]     │
│    há 1 hora                    │
├─────────────────────────────────┤
│        [BANNER EVENTO]          │
│       (16:9 proporção)          │
├─────────────────────────────────┤
│ 🎉 Festa Junina 2026            │
│                                 │
│ 📅 15 de Junho • 19h            │
│ 📍 Salão Principal              │
│                                 │
│ [✓ Tenho Interesse] (42)        │
├─────────────────────────────────┤
│ ❤️ 18    💬 7                   │
└─────────────────────────────────┘
```

**Header Especial:**
- Badge "🛡️ ADMINISTRAÇÃO" (destacado)
- Nome do ADM que criou o evento
- Tempo desde criação do evento

**Banner:**
- Imagem 16:9 (capa do evento)
- Obrigatório (definida ao criar evento)
- Tap para expandir

**Informações:**
- Título do evento (bold, 18px)
- Data e hora (📅 ícone)
- Local (📍 ícone)
- Descrição resumida (máx 200 caracteres)

**Botão de Interesse:**
- Texto: "Tenho Interesse" ou "Interessado" (se já marcou)
- Contador de interessados visível
- Toggle on/off

**Ações Sociais:**
- Curtir (❤️)
- Comentar (💬)
- Funciona igual post normal

**Interações:**
- Toque no card (fora do botão) → Abre página completa do evento (Módulo Eventos)
- Botão "Tenho Interesse" → RSVP (confirmação leve)
- Comentários → Dúvidas sobre o evento

**Regras de Negócio:**
- Post é criado automaticamente ao criar evento no Módulo Eventos
- Apenas ADM pode criar eventos (logo, apenas ADM gera esses posts)
- Post é sincronizado com o evento (edições refletem no post)
- Se evento for deletado, post também é removido do feed
- Post de evento não gera pontos (criação automática)

---

### 5.8 Atualização do Feed

**Pull-to-Refresh:**
- Gesto: Arrastar para baixo no topo
- Indicador: Spinner circular
- Ação: Recarrega últimos 10 posts

**Notificação de Novos Posts:**
- Aparece no topo do feed (sticky)
- Design: Banner discreto
- Texto: "3 novos posts"
- Ação: Toque para rolar ao topo e carregar

**Ordem dos Posts:**
- Posts fixados (ADM) sempre no topo
- Demais posts em ordem cronológica (mais recente primeiro)
- Posts fixados têm ícone de pin (📌)

---

### 5.9 Estados do Feed

**Estados Gerais:**
- [ ] Carregado com posts
- [ ] Loading inicial (skeleton 3 posts)
- [ ] Loading mais posts (spinner no final)
- [ ] Sem posts ("Nenhum post ainda" + ícone)
- [ ] Erro ao carregar (botão "Tentar novamente")
- [ ] Fim do feed ("Você está em dia! 🎉")

**Estados de Post Individual:**
- [ ] Carregado
- [ ] Imagem loading (placeholder blur)
- [ ] Erro ao carregar imagem (ícone quebrado)
- [ ] Post deletado (card cinza: "Post removido")

---

## 6. Sistema de Pontos no Feed

### 6.1 Gamificação

**Ação que Gera Pontos:**
- ✅ Criar post: +10 pontos (apenas o primeiro post do dia)
- ❌ Curtir: 0 pontos
- ❌ Comentar: 0 pontos

**Limitação:**
- Usuário pode criar **quantos posts quiser** por dia
- **Apenas o primeiro post do dia** ganha 10 pontos
- Posts subsequentes no mesmo dia: 0 pontos
- Reset diário à meia-noite
- Sem limite de quantidade de posts

**Feedback Visual:**
- **Primeiro post do dia:** Toast "+10 pontos! ⭐" + animação no card
- **Posts subsequentes:** Toast "Post publicado!" (sem pontos)
- Indicador visual discreto mostrando "Próximo post com pontos: amanhã"

**Objetivo:**
- Incentivar criação diária de conteúdo
- Evitar spam/farming de pontos
- Permitir liberdade de expressão (sem limite artificial)
- Manter qualidade dos posts

---

## 7. Moderação e Privacidade

### 7.1 Quem Pode Postar

**Permissões:**
- ✅ Qualquer membro da associação
- ✅ Não requer aprovação prévia
- ✅ Mesmo membros inadimplentes (decisão de negócio)

**Exceções:**
- **Posts de eventos:** Criados automaticamente pelo sistema quando ADM cria evento no Módulo Eventos (não podem ser criados manualmente no feed)
- **Posts fixados:** Apenas ADM pode fixar posts no topo do feed

---

### 7.2 Sistema de Moderação

**Denúncias:**
- Qualquer usuário pode denunciar post/comentário
- Motivos:
  - Spam
  - Conteúdo impróprio
  - Assédio ou bullying
  - Informação falsa
  - Outro (texto livre)

**Ações de Moderação (ADM):**
- Visualizar denúncias em painel ADM
- Remover post/comentário
- Suspender usuário temporariamente:
  - 24 horas (leve)
  - 7 dias (médio)
  - 30 dias (grave)
  - Permanente (casos extremos)
- Histórico de ações de moderação

**Notificações:**
- ADM recebe notificação de denúncia
- Usuário denunciado recebe notificação de suspensão
- Comunidade não vê motivo de remoção (privacidade)

---

## 8. Onboarding do Dashboard

### 8.1 Primeira Utilização

**Estratégia:** Tooltips interativos

**Fluxo:**
1. Usuário completa cadastro/login
2. Chega no Dashboard pela primeira vez
3. Tooltips aparecem sequencialmente

**Tooltips (em ordem):**

1. **Card de Pontos**
   - Posição: Acima do card
   - Texto: "Aqui você vê seu saldo de pontos. Ganhe pontos criando posts!"
   - Botão: "Próximo"

2. **Acessos Rápidos**
   - Posição: Acima do carrossel
   - Texto: "Acesse rapidamente suas funcionalidades favoritas"
   - Botão: "Próximo"

3. **Stories**
   - Posição: Acima do botão "+"
   - Texto: "Compartilhe momentos que desaparecem em 24h"
   - Botão: "Próximo"

4. **Feed**
   - Posição: Acima do primeiro post (ou área vazia)
   - Texto: "Aqui você vê posts da comunidade. Curta e comente!"
   - Botão: "Começar"

**Características:**
- Backdrop escuro (overlay 50% opacidade)
- Spotlight no elemento destacado
- Pode pular (botão "Pular tutorial")
- Não repete após primeira vez
- Opção "Ver novamente" em Configurações

**Animações:**
- Fade in de cada tooltip (300ms)
- Seta pulsante apontando para elemento

---

## Relacionados

- [Especificação](spec.md)
- [API](api.md)
- [Critérios de Aceitação](acceptance-criteria.md)
