# A-hub - Especificação de Produto

> **Versão:** 1.0  
> **Última atualização:** 09/01/2026  
> **Status:** 🟡 Em Desenvolvimento

---

## 📋 Índice de Módulos

- [Dashboard](#dashboard)
- [Perfil do Usuário](#perfil-do-usuário)
- [Carteirinha](#carteirinha)
- [Minha Carteira (Scanner)](#minha-carteira-scanner)
- [Eventos](#eventos)
- [Espaços](#espaços)
- [Reservas](#reservas)
- [Pedidos](#pedidos)
- [Jukebox](#jukebox)
- [Loja](#loja)
- [Rankings](#rankings)
- [Suporte](#suporte)
- [Sistema de Pontos](#sistema-de-pontos)
- [Notificações](#notificações)
- [Mensagens](#mensagens)

---
# 🏠 Dashboard - Especificação Completa

## 📊 Visão Geral
**Prioridade:** 🔴 MVP  
**Status:** 🟢 Especificação Completa  
**Responsável:** [Nome]  
**Data:** 09/01/2026

**Descrição:**  
Tela principal do aplicativo onde o usuário tem acesso rápido a todas as funcionalidades principais e interage com o feed social. Ponto central de navegação e engajamento da comunidade.

---

## 🎯 Objetivos
- Fornecer acesso rápido e intuitivo às funcionalidades principais
- Exibir informações relevantes do usuário (saldo de pontos, notificações)
- Promover engajamento através do feed social e stories
- Facilitar descoberta de eventos e novidades da associação
- Criar senso de comunidade através de interações sociais

---

## 🧩 Componentes Detalhados

### 1. Cabeçalho / Identidade do Usuário

#### 1.1 Layout e Elementos

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

#### 1.2 Interações

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

#### 1.3 Dropdown de Notificações

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

#### 1.4 Menu de Configurações Rápidas

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

### 2. Card de Saldo de Pontos

#### 2.1 Layout e Design

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

#### 2.2 Interações

**Card Inteiro:**
- Toque → Navega para "Sistema de Pontos"
- Feedback: Pressed state com scale 0.98
- Animação: Transition suave (200ms)

**Ícone de Navegação:**
- Indicador visual de que é clicável
- Rotação sutil ao carregar (opcional)

---

#### 2.3 Estados

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

### 3. Acessos Rápidos

#### 3.1 Layout e Estrutura

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

#### 3.2 Padrão de Card

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

#### 3.3 Interações

**Card Individual:**
- Toque → Navega para módulo correspondente
- Feedback: Pressed state + scale 0.95
- Haptic feedback (leve)

**Scroll Horizontal:**
- Swipe suave
- Snap to grid (alinha cards)
- Momentum scroll

---

#### 3.4 Estados

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

### 4. Stories de Usuários

#### 4.1 Layout e Estrutura

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

#### 4.2 Criação de Stories

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

#### 4.3 Visualização de Stories

**Ao Clicar em Story:**
- Abre visualizador fullscreen
- Transição: Zoom from thumbnail

**Interface do Visualizador:**

**Elementos na Tela:**
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

#### 4.4 Visualizações do Story (Apenas Próprio)

**Ao Clicar em "Visualizações" no MEU Story:**
- Abre bottom sheet
- Lista de quem visualizou:
  - Avatar + nome
  - Tempo da visualização ("há 5 min")
  - Ordenado: Mais recente primeiro
- Contador total no header
- Atualização em tempo real

---

#### 4.5 Regras de Negócio

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

#### 4.6 Estados

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

### 5. Feed de Usuários

#### 5.1 Estrutura Geral

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

#### 5.2 Post com Foto + Descrição

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

#### 5.3 Interações no Post

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

#### 5.4 Modal de Comentários

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

#### 5.5 Post com Enquete

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

#### 5.6 Regras de Enquetes

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

#### 5.7 Post de Evento (Apenas ADM)

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

#### 5.8 Atualização do Feed

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

#### 5.9 Estados do Feed

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

### 6. Sistema de Pontos no Feed

#### 6.1 Gamificação

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

### 7. Moderação e Privacidade

#### 7.1 Quem Pode Postar

**Permissões:**
- ✅ Qualquer membro da associação
- ✅ Não requer aprovação prévia
- ✅ Mesmo membros inadimplentes (decisão de negócio)

**Exceções:**
- **Posts de eventos:** Criados automaticamente pelo sistema quando ADM cria evento no Módulo Eventos (não podem ser criados manualmente no feed)
- **Posts fixados:** Apenas ADM pode fixar posts no topo do feed

---

#### 7.2 Sistema de Moderação

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

### 8. Onboarding do Dashboard

#### 8.1 Primeira Utilização

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

## 📐 Estrutura Lógica da Tela

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

## 🔄 Fluxos de Navegação

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

## 📱 Responsividade

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

## 🔌 Integrações e APIs Necessárias

### Endpoints - Dashboard Geral

**GET** `/dashboard`
- Retorna dados resumidos de todos os componentes
- Response:
```json
{
  "user": {
    "name": "João Silva",
    "avatar_url": "https://...",
    "points": 1250,
    "points_today": 50,
    "points_chart": [10, 25, 15, 30, 20, 50, 50]
  },
  "unread_notifications": 3,
  "has_stories": true,
  "feed_preview": [...]
}
```

---

### Endpoints - Notificações

**GET** `/notifications`
- Query params: `limit=5`, `unread_only=true`
- Retorna lista de notificações

**PUT** `/notifications/:id/read`
- Marca notificação como lida

**GET** `/notifications/count`
- Retorna contador de não lidas

---

### Endpoints - Stories

**GET** `/stories`
- Retorna lista de stories disponíveis
- Response:
```json
{
  "stories": [
    {
      "user_id": "123",
      "username": "João Silva",
      "avatar_url": "https://...",
      "has_unseen": true,
      "stories_count": 3
    }
  ]
}
```

**POST** `/stories`
- Body: multipart/form-data (imagem/vídeo) ou JSON (texto)
- Cria novo story

**GET** `/stories/:user_id`
- Retorna todos os stories de um usuário
- Response:
```json
{
  "stories": [
    {
      "id": "1",
      "type": "image|video|text",
      "url": "https://...",
      "text": "...",
      "background_color": "#FF5733",
      "created_at": "2026-01-09T10:00:00Z",
      "expires_at": "2026-01-10T10:00:00Z"
    }
  ]
}
```

**POST** `/stories/:id/view`
- Registra visualização

**GET** `/stories/:id/views`
- Retorna lista de quem visualizou (apenas próprio story)

**DELETE** `/stories/:id`
- Deleta story (apenas próprio)

---

### Endpoints - Feed

**GET** `/feed`
- Query params: `offset=0`, `limit=10`
- Retorna posts do feed
- Response:
```json
{
  "posts": [
    {
      "id": "1",
      "type": "photo|poll|event",
      "author": {
        "id": "123",
        "name": "João Silva",
        "avatar_url": "https://..."
      },
      "created_at": "2026-01-09T10:00:00Z",
      "content": {
        "image_url": "https://...",
        "description": "Texto do post",
        "likes_count": 24,
        "comments_count": 5,
        "liked_by_me": false
      }
    }
  ],
  "has_more": true
}
```

**POST** `/posts`
- Body: multipart/form-data (imagem + descrição)
- Cria novo post
- Retorna: post criado + pontos ganhos

**GET** `/posts/:id`
- Retorna post específico

**PUT** `/posts/:id`
- Atualiza post (apenas descrição)

**DELETE** `/posts/:id`
- Deleta post (apenas próprio)

**POST** `/posts/:id/like`
- Curte post

**DELETE** `/posts/:id/like`
- Remove curtida

---

### Endpoints - Comentários

**GET** `/posts/:id/comments`
- Query params: `offset=0`, `limit=20`
- Retorna comentários do post

**POST** `/posts/:id/comments`
- Body: `{ "text": "...", "parent_id": null }`
- Cria comentário (parent_id para respostas)

**DELETE** `/comments/:id`
- Deleta comentário (apenas próprio)

**POST** `/comments/:id/react`
- Body: `{ "reaction": "heart|thumbs_up|laugh|wow" }`
- Adiciona reação

**DELETE** `/comments/:id/react`
- Remove reação

---

### Endpoints - Enquetes

**POST** `/polls`
- Body:
```json
{
  "question": "Qual seu horário preferido?",
  "options": ["Manhã", "Tarde", "Noite"],
  "duration_days": 3
}
```
- Cria enquete

**POST** `/polls/:id/vote`
- Body: `{ "option_index": 1 }`
- Vota na enquete

**GET** `/polls/:id/results`
- Retorna resultados

---

### Endpoints - Eventos (ADM)

**POST** `/events` (ADM only)
- Body: evento + banner
- **Ação:** Cria evento no Módulo Eventos + **gera automaticamente** post no feed
- Response: evento criado + post_id do feed
- **Nota:** O post no feed é vinculado ao evento (sincronizado)

**PUT** `/events/:id` (ADM only)
- Body: dados atualizados do evento
- **Ação:** Atualiza evento + **atualiza automaticamente** o post correspondente no feed

**DELETE** `/events/:id` (ADM only)
- **Ação:** Deleta evento + **remove automaticamente** o post do feed

**POST** `/events/:id/interest`
- Marca interesse no evento
- Atualiza contador no post do feed

**DELETE** `/events/:id/interest`
- Remove interesse
- Atualiza contador no post do feed

---

### Endpoints - Moderação (ADM)

**GET** `/reports` (ADM only)
- Retorna lista de denúncias

**POST** `/posts/:id/report`
- Body: `{ "reason": "spam", "description": "..." }`
- Denuncia post

**DELETE** `/posts/:id` (ADM only)
- Remove post denunciado

**POST** `/users/:id/suspend` (ADM only)
- Body: `{ "duration_days": 7, "reason": "..." }`
- Suspende usuário

---

## ⚠️ Estados de Erro e Edge Cases

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

---

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

## ✅ Critérios de Aceitação

### Header e Navegação
- [ ] Foto de perfil navega para perfil do usuário
- [ ] Badge de notificações mostra contador correto
- [ ] Dropdown de notificações abre e fecha corretamente
- [ ] Notificações são marcadas como lidas ao clicar
- [ ] Menu de configurações abre com todas opções
- [ ] Modo escuro alterna corretamente

### Card de Pontos
- [ ] Saldo de pontos é exibido corretamente
- [ ] Variação diária é calculada e exibida
- [ ] Gráfico de 7 dias é renderizado
- [ ] Animação de count up funciona ao ganhar pontos
- [ ] Navegação para Sistema de Pontos funciona

### Acessos Rápidos
- [ ] Todos os módulos são exibidos
- [ ] Scroll horizontal funciona suavemente
- [ ] Badges de novidades aparecem quando necessário
- [ ] Navegação para cada módulo funciona

### Stories
- [ ] Botão "+" abre criador de story
- [ ] Stories são exibidos em ordem correta (não vistos primeiro)
- [ ] Visualizador funciona com todos os tipos (foto/vídeo/texto)
- [ ] Barra de progresso avança automaticamente
- [ ] Responder abre chat com autor
- [ ] Visualizações aparecem apenas no próprio story
- [ ] Stories expiram após 24 horas

### Feed - Posts Normais
- [ ] Feed carrega 10 posts inicialmente
- [ ] Scroll infinito carrega mais posts
- [ ] Pull-to-refresh atualiza feed
- [ ] Curtir funciona com animação
- [ ] Comentar abre modal
- [ ] Avatar/nome navegam para perfil
- [ ] Imagem expande em lightbox
- [ ] Menu de opções funciona (editar/excluir/denunciar)

### Feed - Comentários
- [ ] Modal de comentários abre e fecha
- [ ] Comentários são exibidos corretamente
- [ ] Responder funciona (1 nível de aninhamento)
- [ ] Reações rápidas funcionam
- [ ] Menções @username funcionam
- [ ] Contador de caracteres aparece

### Feed - Enquetes
- [ ] Enquetes são exibidas corretamente
- [ ] Votar funciona (uma vez por usuário)
- [ ] Resultados aparecem após votar
- [ ] Porcentagem é calculada corretamente
- [ ] Tempo restante é exibido
- [ ] Enquetes encerram no prazo

### Feed - Eventos
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

### Gamificação
- [ ] Usuário pode criar quantos posts quiser por dia
- [ ] Apenas o primeiro post do dia ganha 10 pontos
- [ ] Posts subsequentes no mesmo dia não ganham pontos
- [ ] Toast diferenciado: "+10 pontos!" no primeiro post vs "Post publicado!" nos demais
- [ ] Indicador mostra quando próximo post dará pontos
- [ ] Card de pontos atualiza em tempo real
- [ ] Reset diário à meia-noite funciona corretamente

### Moderação
- [ ] Denunciar post funciona
- [ ] ADM vê denúncias em painel
- [ ] ADM pode remover posts
- [ ] ADM pode suspender usuários
- [ ] Usuários suspensos não podem postar/comentar

### Onboarding
- [ ] Tooltips aparecem na primeira utilização
- [ ] Sequência de tooltips funciona
- [ ] "Pular tutorial" funciona
- [ ] Não repete após primeira vez

### Estados e Erros
- [ ] Loading states funcionam (skeleton)
- [ ] Estados vazios são amigáveis
- [ ] Erros de conexão são tratados
- [ ] Offline mode funciona (cache)

---

## 📝 Notas de Desenvolvimento

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

---

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

---

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

---

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

### Melhorias Futuras (Backlog)

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

## 📊 Métricas de Sucesso

**KPIs a Acompanhar:**

1. **Engajamento:**
   - DAU (Daily Active Users)
   - Tempo médio de sessão
   - Taxa de criação de posts (% usuários que postam)
   - Taxa de interação (curtidas/comentários por post)

2. **Stories:**
   - % de usuários que criam stories
   - Taxa de visualização de stories
   - Taxa de resposta em stories

3. **Feed:**
   - Posts por dia (total)
   - Comentários por post (média)
   - Taxa de votação em enquetes
   - Taxa de interesse em eventos

4. **Retenção:**
   - D1, D7, D30 retention
   - Frequência de retorno (diária/semanal)

5. **Moderação:**
   - Número de denúncias
   - Tempo médio de resolução
   - Taxa de posts removidos

6. **Performance:**
   - Tempo de carregamento do feed
   - Taxa de erro em uploads
   - Crash rate

---

**Status:** 🟢 Especificação Completa  
**Próximo Passo:** Criar wireframes e protótipo navegável  
**Data:** 09/01/2026

---
## 👤 Perfil do Usuário

### 📊 Visão Geral
**Prioridade:** 🔴 MVP  
**Status:** 🟢 Especificação Completa  
**Responsável:** [Nome]

**Descrição:**  
Página de perfil do usuário exibindo informações pessoais, badges, posts e estatísticas.

### 🎯 Objetivos
- Exibir identidade visual do usuário
- Mostrar conquistas e badges
- Permitir edição de informações pessoais
- Exibir histórico de posts

### 🧩 Componentes

#### 1. Header do Perfil

##### 1.1 Foto do Perfil
**Elementos:**
- Imagem circular (120x120px)
- Anel colorido se houver stories ativos
- Ícone de câmera no canto (apenas no próprio perfil)

**Interações:**
- **Toque simples:** Abre stories (se houver)
- **Toque longo:** Amplia foto em modal
- **Ícone de câmera:** Abre seletor de foto

**Estados:**
- [ ] Com stories não vistos (anel colorido)
- [ ] Com stories vistos (anel cinza)
- [ ] Sem stories
- [ ] Loading (skeleton circular)

**Regras:**
- Formatos aceitos: jpg, png
- Tamanho máx: 5MB
- Resolução mín: 200x200px

---

##### 1.2 Nome e Username
**Elementos:**
- Nome social (24px, bold)
- @username (16px, cinza)

**Regras:**
- Nome social: 3-50 caracteres

---

##### 1.3 Badges
**Tipos de Badges:**

**Fixos (Sistema):**
- 🥇 Top 1 (ranking x mensal)
- 🥈 Top 2 (ranking x mensal)
- 🥉 Top 3 (ranking x mensal)
- 🎂 Aniversariante (no mês)

**Personalizados (Usuário escolhe):**
- Badges de eventos participados
- Badges de conquistas especiais

**UX:**
- Máximo 3 badges visíveis
- Ícones 24x24px abaixo do nome
- Botão "+X" para ver todos (se tiver mais de 3)

**Interações:**
- Ao clicar → Tooltip com explicação do badge
- Ao clicar em "+X" → Modal com todos os badges

**Modal de Badges:**
- Grid 3 colunas
- Título + descrição de cada badge
- Opção de selecionar 3 para exibir (apenas próprio perfil)


##### 1.4 Posts
**Elementos:**
- Grid 3 colunas (quadrados)
- Thumbnail das fotos
- Ícone se for enquete ou evento

**Interações:**
- Ao clicar → Abre modal com post completo (estilo Instagram)

**Estados:**
- [ ] Com posts
- [ ] Sem posts (mensagem "Nenhum post ainda")
- [ ] Loading (skeleton grid)


#### 2. Abas de Conteúdo


##### 2.1 Aba: Badges 
- Lista completa de badges conquistados
- Progresso de badges a conquistar

---

##### 2.3 Aba: Rankings 
- Posições em diferentes rankings
- Histórico de conquistas

---

#### 3. Ações do Perfil

##### 3.1 Perfil de Outro Usuário
**Botões disponíveis:**
- 💬 Enviar mensagem
- 📊 Ver rankings
- 🏆 Ver badges

**Ações secundárias (menu):**
- Denunciar
- Bloquear

---

##### 3.2 Meu Perfil
**Botões disponíveis:**
- ✏️ Editar perfil
- 📸 Alterar foto
- 🏆 Selecionar badges (3)

**Atalhos rápidos:**
- 🎫 Carteirinha
- 💬 Mensagens
- ⚙️ Configurações

---

### 📐 Estrutura Lógica da Tela
```
┌─────────────────────────────────┐
│┌─────────┐          [⚙️ Config] │
││  Foto   │        [💬 Mensagem] │
│└─────────┘                      │
│                                 │
│       Nome do Usuário           │
│       @username                 │
│       🥇 🎂 ⭐                    │
│                                 │
│ [🏆 Badges]       [📊 Rankings] │
├─────────────────────────────────┤
|            "Posts"              |
│  ┌───┐     ┌───┐      ┌───┐     │
│  │ 1 │     │ 2 │      │ 3 │     │
│  └───┘     └───┘      └───┘     │
│  ┌───┐     ┌───┐      ┌───┐     │
│  │ 4 │     │ 5 │      │ 6 │     │
│  └───┘     └───┘      └───┘     │
└─────────────────────────────────┘
```

### 🔄 Fluxos de Navegação
```
Perfil → Editar Perfil
Perfil → Post Individual
Perfil → Stories
Perfil → Mensagem (se for outro usuário)
Perfil → Rankings
Perfil → Carteirinha (atalho) (Proprio user)

```

### 🔌 Integrações/APIs Necessárias
- [ ] GET /user/:id/profile
- [ ] GET /user/:id/posts
- [ ] GET /user/:id/badges
- [ ] GET /user/:id/rankings
- [ ] PUT /user/profile
- [ ] POST /user/avatar
- [ ] PUT /user/badges/display

### ✅ Critérios de Aceitação
- [ ] Usuário consegue visualizar perfil próprio
- [ ] Usuário consegue visualizar perfil de outros
- [ ] Usuário consegue editar próprio perfil
- [ ] Usuário consegue alterar foto
- [ ] Usuário consegue selecionar 3 badges para exibir
- [ ] Usuário consegue visualizar posts em grid
- [ ] Usuário consegue abrir posts individualmente
- [ ] Usuário consegue enviar mensagem para outros usuários

---

## 🎫 Carteirinha

## 🎫 Carteirinha

### 📊 Visão Geral
**Prioridade:** 🔴 MVP  
**Status:** 🟢 Especificação Completa  
**Responsável:** [Nome]

**Descrição:**  
Carteirinha digital de identificação do associado com QR Code para validação de benefícios, acesso a parceiros e informações de contato da associação. Funciona parcialmente offline.

### 🎯 Objetivos
- Fornecer identificação digital do associado
- Facilitar validação de benefícios em estabelecimentos parceiros
- Permitir acesso e uso de convênios
- Centralizar informações de contato e instruções de uso
- Funcionar como credencial em eventos e espaços da associação

---

## 🧩 Componentes

### 1. Carteirinha Digital (Frente e Verso)

#### 1.1 Layout Visual
**Formato:** Vertical (estilo carteirinha tradicional)  
**Dimensões:** Proporção 3:5 (padrão cartão de crédito vertical)  
**Animação:** Flip 3D ao virar

**Estados:**
- [ ] Ativa (padrão)
- [ ] Inativa/Bloqueada
- [ ] Loading (skeleton)

---

#### 1.2 Frente da Carteirinha

**Elementos (de cima para baixo):**

1. **Logo da Associação**
   - Posição: Topo centro
   - Tamanho: 60x60px
   - Formato: PNG com transparência

2. **Foto do Usuário**
   - Posição: Centro superior
   - Formato: Circular 100x100px
   - Border: 2px sólido na cor primária
   - Fallback: Ícone de usuário se sem foto

3. **Nome do Usuário**
   - Tipografia: 18px, bold
   - Posição: Abaixo da foto
   - Alinhamento: Centro
   - Max caracteres visíveis: 25 (truncar com "...")

4. **Matrícula/ID**
   - Tipografia: 14px, regular
   - Formato: "Matrícula: #XXXXX"
   - Cor: Cinza médio
   - Posição: Abaixo do nome

5. **QR Code** (Se carteirinha ativa)
   - Tamanho: 180x180px
   - Posição: Centro inferior
   - Formato: QR Code dinâmico
   - Conteúdo codificado: JSON com user_id + timestamp + hash
   - Margem interna: 16px

**OU**

5. **Status Inativo** (Se carteirinha bloqueada)
   - Ícone: ⚠️ ou 🔒
   - Texto: "CARTEIRINHA INATIVA"
   - Subtexto: Motivo (ex: "Inadimplente", "Suspenso")
   - Botão: "Regularizar Situação"
   - Cor de fundo: Overlay vermelho semi-transparente

6. **Ícone de Virar**
   - Posição: Canto inferior direito
   - Ícone: Setas circulares (🔄) ou seta curva
   - Tamanho: 24x24px
   - Cor: Primária ou branca (conforme fundo)

**Background:**
- Gradiente ou cor sólida da identidade visual
- Padrão geométrico sutil (opcional)

**Interações:**
- Toque em qualquer lugar → Flip para o verso
- Toque no ícone de virar → Flip para o verso
- Ao abrir carteirinha → Aumenta brilho da tela automaticamente

---

#### 1.3 Verso da Carteirinha

**Elementos:**

1. **Título**
   - Texto: "Como usar sua carteirinha"
   - Tipografia: 16px, bold
   - Posição: Topo

2. **Instruções de Uso**
   - Lista numerada ou com ícones
   - Tipografia: 12px, regular
   - Espaçamento: 8px entre itens
   - Exemplo:
```
     1. Apresente o QR Code ao estabelecimento parceiro
     2. Aguarde a leitura do código
     3. Confirme seu nome na tela do estabelecimento
     4. Aproveite seu benefício!
```

3. **Informações de Contato da Associação**
   - Ícones + texto
   - 📞 Telefone: (XX) XXXX-XXXX
   - 📧 Email: contato@associacao.com.br
   - 🌐 Site: www.associacao.com.br
   - 📍 Endereço: Rua X, 000 - Cidade

4. **Logo/Marca d'água**
   - Posição: Fundo, centro
   - Opacidade: 10-15%
   - Tamanho: 120x120px

**Interações:**
- Toque em qualquer lugar → Flip para frente
- Toque em telefone → Abre discador
- Toque em email → Abre cliente de email
- Toque em site → Abre navegador
- Toque em endereço → Abre Google Maps

---

### 2. Benefícios e Convênios

#### 2.1 Visão Geral dos Benefícios

**Layout:** Lista vertical com cards

**Header da Seção:**
- Título: "Benefícios e Convênios"
- Contador: "X parceiros disponíveis"
- Barra de busca (ícone 🔍)
- Filtros: Ícone de funil (🔽)

**Funcionalidades:**
- Busca por nome do parceiro
- Filtro por categoria
- Ordenação (A-Z, Mais próximos, Recentes)

---

#### 2.2 Filtros

**Categorias Disponíveis:**
- 🍽️ Alimentação
- 🏥 Saúde
- 🎭 Lazer & Entretenimento
- 🎓 Educação
- 🏃 Esportes & Fitness
- 🛒 Varejo & Serviços
- 🚗 Automotivo
- 💼 Outros

**Ordenação:**
- Alfabética (A-Z)
- Mais próximos (requer localização)
- Adicionados recentemente

**UI do Filtro:**
- Modal bottom sheet
- Checkboxes para múltiplas categorias
- Radio buttons para ordenação
- Botões: "Limpar" e "Aplicar"

---

#### 2.3 Card de Parceiro (Lista)

**Elementos:**

1. **Logo do Parceiro**
   - Tamanho: 60x60px
   - Formato: Circular ou quadrado com bordas arredondadas
   - Posição: Esquerda

2. **Informações Principais**
   - Nome do estabelecimento (16px, bold)
   - Categoria (12px, badge colorido)
   - Descrição resumida do benefício (14px, 2 linhas máx)

3. **Distância**
   - Ícone: 📍
   - Texto: "X,X km"
   - Posição: Canto superior direito
   - Cor: Cinza

4. **Indicador de Detalhes**
   - Seta ou chevron → (direita)

**Interações:**
- Toque no card → Abre detalhes do parceiro

**Estados:**
- [ ] Normal
- [ ] Pressionado (feedback visual)
- [ ] Novo (badge "NOVO" se adicionado há menos de 7 dias)

**Layout:**
- Padding: 16px
- Margem entre cards: 8px
- Divider sutil entre cards

---

#### 2.4 Detalhes do Parceiro

**Estrutura da Página:**

**1. Header com Imagem**
- Banner/foto do estabelecimento (16:9)
- Botão voltar (← canto superior esquerdo)
- Logo circular sobrepondo banner (bottom center)

**2. Informações Principais**
- Nome do estabelecimento (20px, bold)
- Categoria (badge)
- Rating/Avaliação (⭐ opcional - Fase 2)

**3. Benefício Oferecido**
- Card destacado com fundo colorido
- Ícone: 🎁
- Texto: "SEU BENEFÍCIO"
- Descrição: "Ex: 15% de desconto em todos os produtos"
- Tipografia: 16px, bold

**4. Como Usar**
- Ícone: ℹ️
- Instruções específicas deste parceiro
- Ex: "Apresente sua carteirinha antes de fechar a conta"

**5. Informações de Contato**

**Telefone:**
- Ícone: 📞
- Número clicável
- Ação: Discar

**Endereço:**
- Ícone: 📍
- Endereço completo
- Distância do usuário (se permissão de localização)
- Ação: Abrir no Maps

**Horário de Funcionamento:**
- Ícone: 🕐
- Listagem por dia da semana
- Destaque se está aberto agora (verde) ou fechado (vermelho)

**Site:** (Se houver)
- Ícone: 🌐
- Link clicável

**Redes Sociais:** (Se houver)
- Ícones: Instagram, Facebook, WhatsApp
- Links clicáveis

**6. Mapa (Opcional - Fase 2)**
- Minimap mostrando localização
- Botão "Ver no mapa"

**7. Botão de Ação Principal**
- Fixo no bottom (sticky)
- Texto: "Usar Benefício" ou "Ver Direções"
- Ação: 
  - Se no local → Mostra QR Code ou instrução
  - Se longe → Abre navegação

---

### 3. Histórico de Uso

**Localização:** Aba dentro do módulo Carteirinha  
**Tabs:** 
- "Usos do QR Code"
- "Transferências" (linking para módulo de Pontos)

#### 3.1 Aba: Usos do QR Code

**Layout:** Lista cronológica (mais recente primeiro)

**Card de Histórico:**

**Elementos:**
- Ícone representativo:
  - 🏢 Check-in na associação
  - 🎁 Uso de benefício em parceiro
  - 🎫 Validação em evento
- Nome do local
- Data e hora (formato: "DD/MM/YYYY às HH:MM")
- Endereço/Local (se disponível)

**Interações:**
- Toque no card → Expande detalhes (se houver)

**Estados Vazios:**
- Ícone: 📋
- Texto: "Nenhum uso registrado"
- Subtexto: "Seu histórico de uso aparecerá aqui"

**Filtros (Fase 2):**
- Por data
- Por tipo de uso
- Por local

---

### 4. Funcionalidade Offline

**O que funciona offline:**
- ✅ Visualização da carteirinha (frente e verso)
- ✅ QR Code (gerado localmente com cache)
- ✅ Lista completa de benefícios (cache)
- ✅ Detalhes dos parceiros (cache)

**O que requer internet:**
- ❌ Atualização de status (ativo/inativo)
- ❌ Novos parceiros adicionados
- ❌ Histórico de uso
- ❌ Distância até parceiros (requer localização + dados)
- ❌ Sincronização de informações

**Estratégia de Cache:**
- Cache de 7 dias para lista de benefícios
- Cache de 24h para detalhes de parceiros
- QR Code armazenado localmente (atualiza a cada abertura se online)

**Indicadores:**
- Badge "Offline" discreto no header quando sem internet
- Toast informando "Usando dados em cache" ao abrir benefícios offline

---

## 📐 Navegação e Estrutura

### Fluxo Principal
```
Dashboard → Acessos Rápidos → "Minha Carteira"
                                     ↓
                            ┌────────────────┐
                            │  CARTEIRINHA   │
                            │  [Frente/Verso]│
                            └────────────────┘
                                     ↓ 
                    ┌────────────────┴────────────────┐
                    ↓                                 ↓
            ┌───────────────┐                ┌──────────────┐
            │  BENEFÍCIOS   │                │  HISTÓRICO   │
            │   (Lista)     │                │   (Tabs)     │
            └───────────────┘                └──────────────┘
                    ↓
            ┌───────────────┐
            │  DETALHES DO  │
            │   PARCEIRO    │
            └───────────────┘
```

### Estrutura de Tabs
```
┌─────────────────────────────────────────┐
│  [Carteirinha] [Benefícios] [Histórico] │
└─────────────────────────────────────────┘
```

---

## 🎨 Design e UX

### Cores e Estados

**Carteirinha Ativa:**
- Fundo: Gradiente da identidade visual
- Texto: Branco (alto contraste)
- QR Code: Fundo branco, código preto

**Carteirinha Inativa:**
- Fundo: Overlay vermelho/cinza (opacidade 80%)
- Ícone: Vermelho ou amarelo (alerta)
- Texto: Vermelho escuro

**Badges de Categoria:**
```
Alimentação: 🟠 Laranja
Saúde: 🔵 Azul
Lazer: 🟣 Roxo
Educação: 🟢 Verde
Esportes: 🔴 Vermelho
Varejo: 🟡 Amarelo
Automotivo: ⚫ Cinza escuro
Outros: 🟤 Marrom
```

### Animações

**Flip da Carteirinha:**
- Duração: 400ms
- Easing: ease-in-out
- Eixo: Y (vertical flip)

**Transição de Telas:**
- Slide from right (300ms)
- Slide to left ao voltar (300ms)

**Loading States:**
- Skeleton screens para listas
- Shimmer effect
- Spinner circular para ações

### Feedback Visual

**Brilho Automático:**
- Ao abrir carteirinha → Brilho para 100%
- Ao sair → Restaura brilho anterior
- Transição suave (200ms)

**Haptic Feedback:**
- Ao virar carteirinha (leve)
- Ao filtrar benefícios (leve)
- Ao escanear QR Code (médio)

---

## 🔌 Integrações e APIs Necessárias

### Endpoints - Carteirinha

- [ ] **GET** `/user/card` - Obter dados da carteirinha
  - Retorna: foto, nome, matrícula, status, qr_code_data
  
- [ ] **GET** `/user/card/status` - Verificar status ativo/inativo
  - Retorna: active (boolean), reason (string)

- [ ] **GET** `/user/card/qrcode` - Gerar QR Code
  - Retorna: qr_code_string, expiry_timestamp

### Endpoints - Benefícios

- [ ] **GET** `/benefits` - Listar todos os parceiros
  - Query params: category, sort, search
  - Retorna: array de parceiros
  
- [ ] **GET** `/benefits/:id` - Detalhes do parceiro
  - Retorna: dados completos do parceiro
  
- [ ] **GET** `/benefits/categories` - Listar categorias
  - Retorna: array de categorias disponíveis

### Endpoints - Histórico

- [ ] **GET** `/user/card/history` - Histórico de usos
  - Query params: type, limit, offset
  - Retorna: array de usos (timestamp, location, type)

### Endpoints - Geolocalização

- [ ] **POST** `/benefits/nearby` - Parceiros próximos
  - Body: latitude, longitude, radius
  - Retorna: array de parceiros com distância

### Estrutura de Dados

**QR Code JSON:**
```json
{
  "user_id": "12345",
  "card_number": "A-2024-00001",
  "timestamp": 1704067200,
  "hash": "a1b2c3d4e5f6...",
  "type": "member_card"
}
```

**Parceiro:**
```json
{
  "id": "1",
  "name": "Pizzaria Bella",
  "category": "Alimentação",
  "logo_url": "https://...",
  "banner_url": "https://...",
  "benefit": "15% de desconto",
  "instructions": "Apresente a carteirinha antes de fechar a conta",
  "address": {
    "street": "Rua das Flores, 123",
    "city": "São Paulo",
    "state": "SP",
    "zip": "01234-567",
    "lat": -23.5505,
    "lng": -46.6333
  },
  "contact": {
    "phone": "(11) 1234-5678",
    "website": "https://pizzariabella.com.br",
    "instagram": "@pizzariabella",
    "facebook": "pizzariabellasp"
  },
  "hours": {
    "monday": "11:00-23:00",
    "tuesday": "11:00-23:00",
    "wednesday": "11:00-23:00",
    "thursday": "11:00-23:00",
    "friday": "11:00-00:00",
    "saturday": "11:00-00:00",
    "sunday": "11:00-22:00"
  },
  "is_new": false,
  "added_at": "2024-01-01T00:00:00Z"
}
```

---

## 🔐 Segurança e Validação

### QR Code

**Características:**
- Único por usuário
- Contém hash de segurança
- Não sensível (baixo risco de fraude)
- Timestamp de geração

**Validação:**
- Backend valida hash + timestamp
- Expira após leitura (opcional - Fase 2)
- Log de todos os usos

### Prevenção de Fraude

**Nível: Baixo** (ambiente pequeno, todos se conhecem)

**Medidas:**
- QR Code único
- Validação de status antes de gerar QR
- Log de histórico de uso
- Foto do usuário visível na carteirinha

---

## 🔔 Notificações

### Tipos de Notificações

**1. Mudança de Status**
- Trigger: Status alterado para inativo
- Título: "Carteirinha Inativa"
- Mensagem: "Sua carteirinha foi suspensa. [Motivo]"
- Ação: "Regularizar"

**2. Novos Parceiros**
- Trigger: Novo parceiro adicionado
- Título: "Novo Benefício Disponível!"
- Mensagem: "[Nome do Parceiro] agora é parceiro"
- Ação: "Ver Benefícios"

**3. Parceiro Próximo** (Opcional - Fase 2)
- Trigger: Geofencing detecta usuário próximo a parceiro
- Título: "Você está perto de um parceiro!"
- Mensagem: "[Nome] - [Benefício]"
- Ação: "Ver Detalhes"

### Configurações

Usuário pode desabilitar:
- [ ] Notificações de novos parceiros
- [ ] Notificações de proximidade

---

## ✅ Critérios de Aceitação

### Carteirinha Digital

- [ ] Usuário consegue visualizar carteirinha com foto, nome, matrícula e QR Code
- [ ] Usuário consegue virar carteirinha (frente/verso) com toque ou ícone
- [ ] QR Code é exibido corretamente e escaneável
- [ ] Brilho aumenta automaticamente ao abrir carteirinha
- [ ] Carteirinha funciona offline (QR Code visível)
- [ ] Carteirinha inativa exibe estado bloqueado com motivo e link para regularizar
- [ ] Instruções de uso são claras no verso
- [ ] Informações de contato são clicáveis (ligar, email, maps, site)

### Benefícios e Convênios

- [ ] Usuário consegue ver lista de todos os parceiros
- [ ] Usuário consegue buscar parceiro por nome
- [ ] Usuário consegue filtrar por categoria
- [ ] Usuário consegue ordenar (A-Z, mais próximos)
- [ ] Cards de parceiros exibem logo, nome, categoria e distância
- [ ] Usuário consegue acessar detalhes de cada parceiro
- [ ] Página de detalhes exibe todas as informações (benefício, contato, horário)
- [ ] Links e telefones são clicáveis e funcionam
- [ ] Lista de benefícios funciona offline (cache)
- [ ] Badge "NOVO" aparece em parceiros adicionados há menos de 7 dias

### Histórico

- [ ] Usuário consegue ver histórico de uso do QR Code
- [ ] Histórico exibe data/hora e local
- [ ] Histórico é ordenado cronologicamente (mais recente primeiro)
- [ ] Estado vazio é exibido quando não há histórico

### Notificações

- [ ] Usuário recebe notificação ao ter carteirinha bloqueada
- [ ] Usuário recebe notificação de novos parceiros
- [ ] Usuário pode desabilitar notificações nas configurações

### Geral

- [ ] Todas as telas têm loading states adequados
- [ ] Estados vazios são amigáveis e informativos
- [ ] Navegação é intuitiva e fluida
- [ ] App funciona parcialmente offline conforme especificado

---

## 🎯 Dependências

**Módulos Relacionados:**
- [ ] Sistema de Pontos (para transferências via QR Code - outro módulo)
- [ ] Perfil do Usuário (foto, nome, dados)
- [ ] Notificações
- [ ] Geolocalização (para distância de parceiros)

**Permissões Necessárias:**
- [ ] Localização (opcional, para parceiros próximos)
- [ ] Câmera (para futura funcionalidade de scanner - módulo separado)
- [ ] Notificações push

**Serviços Externos:**
- [ ] Google Maps API (para distância e navegação)
- [ ] Geolocalização (GPS)

---

## 📱 Responsividade

**Mobile (Primary):**
- Layout otimizado para telas 360x640 até 414x896
- Carteirinha ocupa 90% da largura da tela
- Benefícios em lista vertical

**Tablet:**
- Carteirinha centralizada (max-width: 400px)
- Benefícios em grid 2 colunas

**Desktop (Web - Fase 2):**
- Carteirinha centralizada
- Benefícios em grid 3 colunas

---

## 📝 Notas de Desenvolvimento

### Performance

- Implementar lazy loading na lista de benefícios (20 por vez)
- Cache agressivo de imagens de logos e banners
- Comprimir imagens antes de exibir
- Virtual scroll na lista de benefícios (se >50 parceiros)

### Acessibilidade

- Contrast ratio mínimo de 4.5:1 em textos
- Tamanho mínimo de toque: 48x48px
- Labels descritivos para screen readers
- Suporte a font scaling (até 200%)

### Testes

**Casos de Teste Críticos:**
1. Carteirinha funciona offline
2. QR Code é escaneável por leitores padrão
3. Flip animation funciona em todos os dispositivos
4. Brilho aumenta/diminui corretamente
5. Cache de benefícios persiste após fechar app
6. Estado bloqueado impede acesso ao QR Code
7. Distância é calculada corretamente
8. Links externos abrem apps corretos (phone, maps, etc)

### Melhorias Futuras (Backlog)

- 🟢 Apple Wallet / Google Pay integration
- 🟢 Avaliações/reviews de parceiros
- 🟢 Mapa interativo com todos os parceiros
- 🟢 Notificações geofencing de parceiros próximos
- 🟢 Modo escuro
- 🟢 Compartilhar benefício com amigo (invite)
- 🟢 Favoritar parceiros
- 🟢 Histórico de benefícios usados (analytics pessoal)

---

## 🚀 Fases de Implementação

### Fase 1 - MVP (Essencial)
**Prazo estimado: 3-4 semanas**

✅ Carteirinha digital (frente/verso)  
✅ QR Code funcional  
✅ Lista de benefícios  
✅ Detalhes de parceiros  
✅ Busca e filtros básicos  
✅ Histórico de uso  
✅ Funcionamento offline  

### Fase 2 - Aprimoramentos
**Prazo estimado: 2-3 semanas**

🟡 Geolocalização e distância  
🟡 Ordenação por proximidade  
🟡 Notificações de novos parceiros  
🟡 Onboarding (tooltips)  
🟡 Mapa de parceiros  

### Fase 3 - Nice to Have
**Prazo: A definir**

🟢 Apple Wallet / Google Pay  
🟢 Avaliações de parceiros  
🟢 Geofencing notifications  
🟢 Analytics pessoal de uso  

---

## 📊 Métricas de Sucesso

**KPIs a Acompanhar:**

1. **Adoção:**
   - % de usuários que acessam carteirinha (meta: >80%)
   - Frequência média de uso por semana

2. **Engajamento com Benefícios:**
   - Taxa de clique em parceiros
   - Parceiros mais visualizados
   - Uso de busca/filtros

3. **Validação:**
   - Quantidade de scans do QR Code por semana
   - Locais mais utilizados

4. **Performance:**
   - Tempo médio de carregamento da carteirinha
   - Taxa de erro ao gerar QR Code
   - Taxa de uso offline

5. **Notificações:**
   - Open rate de notificações de novos parceiros
   - Taxa de conversão (notificação → visualização do parceiro)

---

**Status:** 🟢 Especificação Completa  
**Próximo Passo:** Criar wireframes e protótipo navegável  
**Data:** [Data Atual]
---

# 🎉 Eventos - Especificação Completa

## 📊 Visão Geral
**Prioridade:** 🔴 MVP  
**Status:** 🟢 Especificação Completa  
**Responsável:** [Nome]  
**Data:** 09/01/2026

**Descrição:**  
Sistema completo de gestão de eventos com check-ins por QR Code dinâmico, distribuição de pontos, badges, display fullscreen para TVs/monitores e integração automática com o feed social. Suporta múltiplos check-ins por evento com intervalos configuráveis e sistema de segurança anti-fraude.

---

## 🎯 Objetivos
- Permitir criação e gestão de eventos pela administração
- Facilitar presença física através de check-ins via QR Code
- Distribuir pontos de forma gamificada baseada em presença
- Exibir eventos em displays fullscreen para facilitar check-ins
- Gerar engajamento através do feed social
- Fornecer analytics detalhados sobre participação
- Recompensar presença com badges personalizados

---

## 👥 Tipos de Usuários e Permissões

### 1. Common User (Usuário Comum)
**Pode:**
- ✅ Visualizar lista de eventos
- ✅ Ver detalhes de eventos
- ✅ Confirmar presença (RSVP)
- ✅ Fazer check-in via QR Code (scanner)
- ✅ Ver próprio progresso de check-ins
- ✅ Ganhar pontos e badges
- ✅ Comentar em eventos
- ✅ Ver no mapa (se aplicável)

**Não pode:**
- ❌ Criar/editar/deletar eventos
- ❌ Acessar analytics
- ❌ Fazer check-in manual de outros

---

### 2. ADM (Administrador)
**Pode:**
- ✅ Tudo que Common User pode
- ✅ Criar/editar/deletar eventos
- ✅ Gerenciar badges (módulo separado)
- ✅ Configurar pontos e check-ins
- ✅ Visualizar analytics em tempo real
- ✅ Exportar relatórios
- ✅ Fazer check-in manual (exceções)
- ✅ Pausar/cancelar eventos
- ✅ Acessar painel de controle do Display

**Não pode:**
- ❌ Ver como Display (modo diferente)

---

### 3. Display (Tela de Exibição)
**Características:**
- 📺 Modo fullscreen (kiosk)
- 🔒 Read-only (apenas exibe)
- 🔄 Auto-refresh via WebSocket
- 📱 Não interage (não tem login de usuário)
- 🎯 Vinculado a 1 evento específico
- ⚡ Funciona offline (com cache)

**Exibe:**
- QR Code dinâmico (muda a cada 1 min)
- Informações do evento
- Check-in atual disponível
- Contador de check-ins realizados
- Banner/imagem do evento

---

## 🧩 Componentes do Sistema

---

## 📝 Criação de Evento (ADM)

### 1.1 Formulário de Criação

#### Campos Obrigatórios

**1. Título do Evento**
- Input: Texto
- Limite: 5-100 caracteres
- Exemplo: "Festa Junina 2026"
- Validação: Não pode ser vazio

**2. Descrição**
- Input: Textarea
- Limite: 10-2000 caracteres
- Suporte a quebras de linha
- Preview disponível

**3. Categoria**
- Input: Select/Dropdown
- Opções:
  - 🎉 Social
  - 🏃 Esportivo
  - 🎭 Cultural
  - 🎓 Educacional
  - 💼 Networking
  - 🍔 Gastronômico
  - 🎵 Musical
  - 🎨 Arte
  - 🎮 Games/E-sports
  - 📢 Institucional
- Usado para: Filtros, ícone visual, analytics

**4. Data e Hora de Início**
- Input: DateTime picker
- Validação: Deve ser data futura
- Formato: DD/MM/YYYY HH:MM

**5. Data e Hora de Fim**
- Input: DateTime picker
- Validação: Deve ser após data de início
- Formato: DD/MM/YYYY HH:MM
- Cálculo automático de duração

**6. Local**
- Input: Select de Espaços + Opção "Outro"
- **Se módulo Espaços implementado:**
  - Dropdown com espaços pré-cadastrados
  - Carrega automaticamente: Nome, endereço, capacidade
- **Se "Outro":**
  - Campo de texto livre
  - Opcional: Coordenadas GPS (para mapa)

**7. Imagem do Evento - Feed**
- Upload: JPG, PNG
- Tamanho máx: 5MB
- Proporção recomendada: 1:1 ou 4:5 (mobile feed)
- Preview disponível
- Crop tool para ajustar

**8. Imagem do Evento - Display**
- Upload: JPG, PNG (pode ser múltiplas)
- Tamanho máx: 5MB por imagem
- Proporção: 16:9 (widescreen)
- **Se múltiplas imagens:**
  - Rotacionam no background do Display
  - Intervalo: 10 segundos (configurável)
- Preview fullscreen disponível

**9. Cor Personalizada**
- Input: Color picker
- Usado em:
  - ✅ Background do header da página do evento
  - ✅ Cor do botão "Confirmar Presença"
  - ✅ Borda do card do evento (listagem)
  - ✅ Tema do Display (overlay)
  - ✅ Cor do progresso de check-ins
- Preview em tempo real

**10. Pontos Totais Distribuídos**
- Input: Number
- Min: 1, Max: 10.000
- Exemplo: 100 pontos
- Será dividido entre check-ins

**11. Quantidade de Check-ins**
- Input: Number
- Min: 1, Max: 20
- Exemplo: 4 check-ins
- Define quantas vezes usuário pode fazer check-in

**12. Intervalo entre Check-ins**
- Input: Number + Select (minutos/horas)
- Min: 0 (sem intervalo)
- Max: 24 horas
- Exemplo: "30 minutos" ou "2 horas"
- **Lógica:**
  - Display muda QR Code após intervalo
  - CHECK-IN 1 → espera X tempo → CHECK-IN 2
  - Usuário só pode escanear o check-in atual

---

#### Campos Opcionais

**13. Badge do Evento**
- Input: Select/Modal de seleção
- Fonte: Módulo de Badges (ADM)
- Preview do badge selecionado
- **Se não selecionado:** Evento não tem badge
- **Quando usuário ganha:**
  - ADM escolhe ao criar evento:
    - [ ] Ao fazer primeiro check-in
    - [ ] Ao completar todos os check-ins
    - [x] **Padrão:** Ao fazer pelo menos 1 check-in

**14. Capacidade Máxima**
- Input: Number
- Min: 1, Max: 100.000
- Exemplo: 500 pessoas
- **Efeitos:**
  - Aviso quando X% da capacidade atingido
  - Bloqueia confirmações quando lotado (opcional)
  - Exibido na página do evento

**15. Link Externo**
- Input: URL
- Validação: URL válida
- Exemplo: Site de inscrições, formulário, live stream
- Botão "Mais informações" na página do evento

---

### 1.2 Divisão de Pontos

**Sistema Híbrido:**

**Padrão - Auto-divisão:**
```
Pontos totais: 100
Check-ins: 4
Divisão: 25 pts por check-in
```

**Opção Avançada - Customização:**
- Toggle "Customizar pontos por check-in"
- ADM define manualmente cada um:
  ```
  Check-in 1: 10 pts
  Check-in 2: 20 pts
  Check-in 3: 30 pts
  Check-in 4: 40 pts
  Total: 100 pts (validação automática)
  ```
- Soma total deve bater com "Pontos Totais"

---

### 1.3 Preview e Publicação

**Antes de Publicar:**

**Preview do Display:**
- Botão "Ver preview do Display"
- Modal fullscreen simulando TV
- Mostra como ficará o evento na tela
- Testa rotação de imagens de background

**Preview do Post no Feed:**
- Botão "Ver como ficará no feed"
- Modal mostrando card do post
- Inclui banner, título, data, botão interesse

**Estados de Publicação:**

**Rascunho:**
- Evento salvo mas não publicado
- Apenas ADM vê
- Não aparece em listagens
- Não cria post no feed
- Pode editar livremente

**Publicado (Checkbox):**
- Evento visível para todos
- Aparece em listagens
- **Cria automaticamente:**
  - Display vinculado
  - Post no feed (se checkbox marcado)
  - Notificações (se configurado)

---

## 📺 Display Fullscreen

### 2.1 Geração Automática

**Ao publicar evento:**
- Sistema gera automaticamente 1 Display vinculado
- Display tem ID único: `DISP-[EVENT_ID]`
- URL de acesso: `/display/[EVENT_ID]`
- Token de autenticação gerado

**Acesso:**
- ADM acessa painel de controle do evento
- Seção "Display"
- Botão "Abrir Display em Tela Cheia"
- Abre em nova aba/janela
- Recomendação: F11 para fullscreen

---

### 2.2 Layout do Display

**Modo: Imersivo (Opção C)**

```
┌─────────────────────────────────────────┐
│                                         │
│  [Background: Imagem do evento rotativa]│
│         (Overlay com cor do evento)     │
│                                         │
│          [LOGO ASSOCIAÇÃO - Topo]       │
│                                         │
│         FESTA JUNINA 2026               │
│         15 de Junho • 19h-23h           │
│                                         │
│         ┌─────────────────┐             │
│         │                 │             │
│         │   [QR CODE]     │             │
│         │   Grande        │             │
│         │                 │             │
│         └─────────────────┘             │
│                                         │
│       Escaneie para Check-in            │
│       CHECK-IN 1 de 4 • +25 pontos      │
│                                         │
│       ✓ 42 pessoas fizeram check-in     │
│                                         │
└─────────────────────────────────────────┘
```

**Elementos:**

1. **Background Dinâmico**
   - Imagem(ns) do evento em fullscreen
   - Se múltiplas: Rotação a cada 10s
   - Overlay semi-transparente (cor do evento, 40% opacidade)
   - Blur leve (10px) para destacar conteúdo frontal

2. **Logo da Associação**
   - Posição: Topo centro
   - Tamanho: 80x80px
   - Sempre visível

3. **Informações do Evento**
   - Título (36px, bold, branco)
   - Data e hora (24px, branco)
   - Centralizado

4. **QR Code**
   - Tamanho: 400x400px
   - Background branco (padding 20px)
   - Border radius: 16px
   - Shadow forte para destaque
   - **Conteúdo do QR Code:**
     ```json
     {
       "type": "event_checkin",
       "event_id": "evt_123",
       "checkin_number": 1,
       "security_token": "abc123...",
       "timestamp": 1704067200,
       "expires_at": 1704067260
     }
     ```

5. **Instruções**
   - Texto: "Escaneie para Check-in" (28px)
   - Check-in atual: "CHECK-IN 1 de 4" (24px)
   - Pontos: "+25 pontos" (24px, destaque)
   - Cor: Branco com shadow

6. **Contador de Presença**
   - Ícone: ✓
   - Texto: "42 pessoas fizeram check-in" (global do evento)
   - Atualiza em tempo real (WebSocket)
   - Posição: Bottom center

---

### 2.3 Sistema de QR Code Dinâmico

**Dupla Rotação:**

**Tipo 1: QR Code de Segurança (Anti-Fraude)**
- **Frequência:** Muda a cada **1 minuto**
- **Objetivo:** Evitar screenshots/fotos do QR Code
- **Implementação:**
  - Token de segurança no QR Code
  - Backend valida se timestamp está dentro de janela de **2 minutos**
  - Permite validação offline (tolerância de 1 min)
- **Comportamento:**
  - QR Code visualmente muda (novo hash)
  - Conteúdo interno tem novo token
  - Antigo QR Code expira após 2 min

**Tipo 2: Rotação de Check-ins**
- **Frequência:** Baseada no **intervalo entre check-ins** definido
- **Objetivo:** Controlar quando cada check-in está disponível
- **Implementação:**
  - Display mostra apenas o check-in atual
  - Após intervalo, muda para próximo check-in
  - QR Code de segurança continua mudando a cada 1 min

**Exemplo Completo:**

```
Evento: 4 check-ins, 30 min intervalo, 100 pontos

19:00 - Evento inicia
        Display: CHECK-IN 1 (25 pts)
        QR Security: Token A (válido até 19:01)

19:01 - QR Security: Token B (válido até 19:02)
19:02 - QR Security: Token C (válido até 19:03)
... (continua a cada 1 min)

19:30 - Intervalo passou (30 min)
        Display: CHECK-IN 2 (25 pts)
        QR Security: Token X (válido até 19:31)

20:00 - Display: CHECK-IN 3 (25 pts)
20:30 - Display: CHECK-IN 4 (25 pts)
21:00 - Evento termina
```

---

### 2.4 Tecnologia e Atualização

**WebSocket (Tempo Real):**
- Conexão persistente com backend
- Atualiza automaticamente:
  - Novo QR Code a cada 1 min
  - Mudança de check-in (após intervalo)
  - Contador de presença
  - Status do evento (pausado, cancelado)

**Fallback - Polling:**
- Se WebSocket falhar
- Polling a cada 30 segundos
- Menos eficiente mas funcional

**Funcionamento Offline:**
- Display funciona offline
- QR Code em cache (último válido)
- Backend valida check-ins quando reconectar
- Aviso discreto: "Modo Offline" no canto

**Reconexão:**
- Tenta reconectar a cada 5 segundos
- Sincroniza automaticamente ao voltar online
- Atualiza QR Code imediatamente

---

### 2.5 Estados do Display

**Estados Visuais:**

**1. Aguardando Início:**
```
Evento começa em X horas
Aguarde...
```

**2. Em Andamento:**
- Layout normal (conforme 2.2)
- QR Code ativo e rotacionando

**3. Intervalo entre Check-ins:**
```
[QR CODE]
Próximo check-in disponível em 15 minutos
Aguarde ou escaneie se chegou agora
```
- Mostra QR Code do check-in atual (ainda válido)
- Contador regressivo para próximo

**4. Pausado (ADM):**
```
Check-ins temporariamente pausados
Aguarde instruções
```
- Overlay escuro
- Sem QR Code
- Mensagem clara

**5. Encerrado:**
```
Evento encerrado
Obrigado pela participação!
[Estatísticas finais]
```

---

### 2.6 Múltiplos Displays

**Configuração:**
- **Ilimitados displays por evento**
- Todos mostram:
  - Mesmo evento
  - Mesmo check-in atual
  - Mesmo QR Code (sincronizado)
- Útil para:
  - Múltiplas entradas
  - Eventos grandes
  - Backup de hardware

**Sincronização:**
- WebSocket garante sincronia
- Todos os displays recebem update simultaneamente
- Contador de presença é global (não por display)

---

## 📱 Experiência do Usuário (Common User)

### 3.1 Listagem de Eventos

#### Layout da Página

**Tabs de Filtro:**
```
[Todos] [Próximos] [Passados]
```

**Tab "Todos":**
- Exibe todos os eventos (exceto cancelados)
- Ordenação: Cronológica (próximos primeiro)

**Tab "Próximos":**
- Eventos com data ≥ hoje
- Ordenação: Mais próximo primeiro

**Tab "Passados":**
- Eventos com data < hoje
- Ordenação: Mais recente primeiro

**Filtros Adicionais:**
- Dropdown de Categoria (todas + cada categoria)
- Busca por texto (título/descrição)

---

#### Card de Evento (Versão Resumida)

**Layout do Card:**

```
┌─────────────────────────────────┐
│ [Banner 4:3]           [🎭]     │
├─────────────────────────────────┤
│ Festa Junina 2026               │
│ 15 Jun • 19h • Salão Principal  │
│                                 │
│ ⭐ 100 pts  🏆 Badge  ✓ 42     │
│                                 │
│ [✓ Confirmar Presença]          │
│                                 │
│ Meu progresso: ■■■□ 3/4         │
└─────────────────────────────────┘
```

**Elementos:**

1. **Banner/Thumbnail**
   - Imagem do feed (1:1 ou 4:5)
   - Ícone da categoria no canto superior direito

2. **Título**
   - 18px, bold
   - Truncar após 2 linhas

3. **Informações Básicas**
   - Data: Formato "15 Jun" ou "Hoje" ou "Amanhã"
   - Hora: "19h"
   - Local: Nome resumido

4. **Métricas em Linha**
   - ⭐ Pontos disponíveis
   - 🏆 Badge (se tiver)
   - ✓ Número de confirmados

5. **Status Badge**
   - Posição: Canto superior esquerdo (overlay no banner)
   - Variações:
     - 🟢 "Em Andamento" (verde)
     - 🟡 "Em Breve" (amarelo, se < 24h)
     - ⚪ "Agendado" (cinza)
     - 🔴 "Encerrado" (vermelho)

6. **Botão de Ação**
   - **Se não confirmou:** "Confirmar Presença"
   - **Se já confirmou:** "✓ Presença Confirmada" (verde, outline)
   - Toggle on/off

7. **Meu Progresso** (Se já fez check-in)
   - Barra de progresso visual
   - Texto: "3/4 check-ins"
   - Só aparece se usuário já fez pelo menos 1

**Interações:**
- Toque no card → Abre página detalhada do evento
- Toque no botão → Confirma/desconfirma presença
- Feedback: Haptic + animação

---

### 3.2 Página Detalhada do Evento

#### Header da Página

```
┌─────────────────────────────────┐
│ [← Voltar]           [⋮ Menu]   │
├─────────────────────────────────┤
│     [Banner Fullwidth 16:9]     │
│                                 │
│     🟢 Em Andamento             │
└─────────────────────────────────┘
```

**Banner:**
- Imagem do feed em fullwidth
- Overlay com cor do evento (bottom gradient)
- Status badge no canto

**Menu (⋮):**
- Compartilhar evento
- Adicionar ao calendário
- Ver no mapa (se aplicável)
- Denunciar (se inadequado)

---

#### Informações Principais

**Seção 1: Título e Categoria**
```
🎉 Festa Junina 2026
Categoria: Social
```

**Seção 2: Data, Hora e Local**
```
📅 Sexta, 15 de Junho de 2026
🕐 19h00 - 23h00 (4 horas)
📍 Salão Principal
    Rua das Flores, 123 - São Paulo
    [Ver no Mapa]
```

**Se local é Espaço cadastrado:**
- Link clicável para módulo Espaços
- Mostra capacidade do espaço
- Pode mostrar fotos do espaço

**Seção 3: Descrição**
```
Venha participar da nossa tradicional Festa Junina!
Teremos comidas típicas, quadrilha, pescaria e muito mais.

Traje: Opcional (caipira)
```
- Texto completo (máx 2000 caracteres)
- Suporte a quebras de linha
- Link externo se configurado: Botão "Mais informações"

**Seção 4: Pontos e Recompensas**
```
⭐ 100 pontos disponíveis
🏆 Badge: Participante Festa Junina 2026
   [Preview do badge]
   
✓ Faça pelo menos 1 check-in para ganhar o badge
```

**Seção 5: Check-ins**
```
📋 4 check-ins necessários
⏱️ Intervalo de 30 minutos entre cada

Check-ins disponíveis:
■ Check-in 1: 25 pts (19h00 - 19h30)
■ Check-in 2: 25 pts (19h30 - 20h00)
□ Check-in 3: 25 pts (20h00 - 20h30)
□ Check-in 4: 25 pts (20h30 - 21h00)
```
- ■ = Check-in feito (verde)
- □ = Check-in pendente (cinza)
- Horários aproximados (início + intervalos)

---

#### Seção de Participação

**Card Destacado:**

```
┌─────────────────────────────────┐
│ 👥 Participação                 │
│                                 │
│ ✓ 42 pessoas confirmaram        │
│ ✓ 28 pessoas fizeram check-in   │
│                                 │
│ [Ver lista de confirmados]      │
└─────────────────────────────────┘
```

**Modal "Lista de Confirmados":**
- Lista com avatar + nome
- Ordenação: Alfabética
- Busca por nome
- Badge "✓ Fez check-in" para quem já compareceu

---

#### Botões de Ação

**Antes do Evento:**

**Botão Principal:**
```
[✓ Confirmar Presença]
```
- Grande, destaque (cor do evento)
- Toggle: Confirmado ↔ Não confirmado
- Feedback: Animação + toast

**Botões Secundários:**
- [📅 Adicionar ao Calendário]
- [📍 Ver no Mapa] (se aplicável)
- [🔗 Link Externo] (se configurado)

---

**Durante o Evento:**

**Botão Principal:**
```
[📷 Fazer Check-in]
```
- Grande, cor vibrante (verde)
- Abre scanner de QR Code
- Destaque pulsante se usuário confirmou presença

**Botão Secundário:**
```
[Ver Meu Progresso]
```
- Abre modal com detalhes dos check-ins
- Mostra horário de cada check-in feito
- Pontos ganhos até o momento

---

**Depois do Evento:**

**Resumo de Participação:**
```
┌─────────────────────────────────┐
│ ✅ Você participou deste evento │
│                                 │
│ ✓ 3 de 4 check-ins realizados   │
│ ⭐ 75 pontos ganhos             │
│ 🏆 Badge conquistado!           │
│                                 │
│ [Ver Badge] [Ver Fotos]         │
└─────────────────────────────────┘
```

---

#### Comentários e Discussão

**Seção de Comentários:**

```
┌─────────────────────────────────┐
│ 💬 Comentários (12)             │
├─────────────────────────────────┤
│ 👤 Maria Silva                  │
│    Vai ter comida vegana?       │
│    há 2 horas           [❤️ 3] │
│                                 │
│    └─ 🛡️ ADM João             │
│       Sim! Teremos opções.      │
│       há 1 hora                 │
├─────────────────────────────────┤
│ 👤 Pedro Santos                 │
│    Mal posso esperar! 🎉        │
│    há 5 horas           [❤️ 8] │
├─────────────────────────────────┤
│ [Digite seu comentário...]  [>] │
└─────────────────────────────────┘
```

**Funcionalidades:**
- Comentários ordenados: Mais recentes primeiro
- Reação: ❤️ (curtir)
- Respostas (1 nível)
- ADM tem badge especial
- Menções @username funcionam
- Notifica ADM de novos comentários

---

### 3.3 Scanner de QR Code (Check-in)

#### Abertura do Scanner

**Origem:**
- Botão "Fazer Check-in" na página do evento
- Abre modal fullscreen com câmera

**Permissões:**
- Solicita acesso à câmera
- Se negado: Instrução de como habilitar

---

#### Interface do Scanner

```
┌─────────────────────────────────┐
│ [× Fechar]      Check-in        │
├─────────────────────────────────┤
│                                 │
│     [Preview da Câmera]         │
│                                 │
│     ┌───────────────┐           │
│     │               │           │
│     │  [Área QR]    │           │
│     │               │           │
│     └───────────────┘           │
│                                 │
│ Posicione o QR Code no centro   │
│                                 │
│ CHECK-IN 2 de 4                 │
│ +25 pontos                      │
└─────────────────────────────────┘
```

**Elementos:**
- Preview da câmera (fullscreen)
- Guia visual (quadrado com cantos)
- Instruções claras
- Informações do check-in atual

---

#### Processo de Check-in

**Fluxo:**

1. **Usuário escaneia QR Code no Display**
2. **App valida localmente:**
   - QR Code é válido? (formato correto)
   - Timestamp não expirado? (< 2 min)
   
3. **App envia ao backend:**
   ```json
   POST /events/:id/checkin
   {
     "qr_data": "...",
     "checkin_number": 2,
     "security_token": "abc123",
     "timestamp": 1704067200
   }
   ```

4. **Backend valida:**
   - ✓ Evento existe e está ativo
   - ✓ Check-in atual está disponível
   - ✓ Security token é válido
   - ✓ Timestamp dentro da janela (2 min)
   - ✓ Usuário não fez este check-in ainda
   - ✓ Intervalo desde último check-in respeitado (lado usuário)

5. **Sucesso:**
   ```
   ┌─────────────────────────────────┐
   │  ✅                              │
   │  Check-in realizado!             │
   │                                  │
   │  +25 pontos                      │
   │  3 de 4 check-ins completos      │
   │                                  │
   │  Próximo check-in em 25 minutos  │
   │                                  │
   │  [Fechar]                        │
   └─────────────────────────────────┘
   ```
   - Haptic feedback (sucesso)
   - Animação celebratória
   - Som (opcional)
   - Atualiza progresso automaticamente

6. **Erro:**
   - **QR Code inválido:** "QR Code não reconhecido"
   - **Check-in já feito:** "Você já fez este check-in"
   - **Muito cedo:** "Check-in disponível em X minutos"
   - **Evento não ativo:** "Este evento não está acontecendo"
   - **Token expirado:** "QR Code expirado, escaneie novamente"

---

#### Lógica de Check-ins Atrasados

**Cenário:** Usuário chega atrasado

**Exemplo:**
- Evento: 4 check-ins, 30 min intervalo
- Display está mostrando: CHECK-IN 3

**O que acontece:**
1. Usuário escaneia CHECK-IN 3
2. Sistema registra apenas o CHECK-IN 3
3. **Resultado:**
   - Progresso: 1 de 4 ✓ (fez apenas o 3)
   - Pontos: 25 de 100
   - Badge: Depende da configuração do ADM
     - **Se "pelo menos 1 check-in":** ✅ Ganha badge
     - **Se "todos os check-ins":** ❌ Não ganha badge

**Próximo Check-in:**
- Usuário pode fazer CHECK-IN 4 quando disponível
- Não pode voltar e fazer 1 ou 2 (já passaram)

---

#### Controle de Intervalo (Lado Usuário)

**Objetivo:** Evitar que usuário escaneie múltiplas vezes seguidas

**Implementação:**
- Após fazer check-in, app armazena timestamp
- Se tentar escanear novamente antes do intervalo:
  ```
  ⏱️ Aguarde 28 minutos
  
  Você pode fazer o próximo check-in às 20h00
  ```
- Bloqueia scanner até intervalo passar
- Timer visível na página do evento

**Edge Case - Múltiplos Check-ins Simultâneos:**
- Se evento tem intervalo = 0 (múltiplos check-ins disponíveis)
- Usuário pode escanear todos imediatamente
- Sistema registra todos normalmente

---

## 🔔 Notificações

### 4.1 Tipos de Notificações

**1. Novo Evento Criado**
- **Trigger:** ADM publica evento
- **Destinatários:** Todos os common users
- **Conteúdo:**
  ```
  🎉 Novo Evento!
  Festa Junina 2026
  15 de Junho • 19h
  
  [Confirmar Presença]
  ```

**2. Lembrete - 1 Dia Antes**
- **Trigger:** 24h antes do início
- **Destinatários:** Quem NÃO confirmou presença
- **Conteúdo:**
  ```
  📅 Amanhã tem evento!
  Festa Junina 2026
  Amanhã às 19h
  
  [Confirmar Presença]
  ```

**3. Lembrete - 1 Hora Antes**
- **Trigger:** 1h antes do início
- **Destinatários:** Quem confirmou presença
- **Conteúdo:**
  ```
  ⏰ Evento em 1 hora!
  Festa Junina 2026
  Hoje às 19h • Salão Principal
  
  [Ver Detalhes]
  ```

**4. Evento Começou**
- **Trigger:** Horário de início
- **Destinatários:** Quem confirmou presença
- **Conteúdo:**
  ```
  🎉 O evento começou!
  Não esqueça de fazer check-in
  
  [Fazer Check-in]
  ```

**5. Lembrete de Check-in**
- **Trigger:** Usuário confirmou + evento em andamento + ainda não fez check-in
- **Tempo:** 15 min após início, depois a cada 30 min
- **Conteúdo:**
  ```
  📋 Faça seu check-in!
  Ganhe pontos fazendo check-in no evento
  
  [Fazer Check-in]
  ```

**6. Evento Prestes a Terminar**
- **Trigger:** 30 min antes do fim
- **Destinatários:** Quem está no evento mas não fez todos check-ins
- **Conteúdo:**
  ```
  ⏰ Última chance!
  Evento termina em 30 minutos
  Ainda dá tempo de fazer check-in
  
  [Fazer Check-in]
  ```

**7. Badge Conquistado**
- **Trigger:** Ao completar requisito do badge
- **Destinatários:** Usuário que ganhou
- **Conteúdo:**
  ```
  🏆 Badge conquistado!
  Participante Festa Junina 2026
  
  [Ver Badge]
  ```
- Animação especial ao abrir notificação

**8. Evento Cancelado**
- **Trigger:** ADM cancela evento
- **Destinatários:** Quem confirmou presença
- **Conteúdo:**
  ```
  ❌ Evento cancelado
  Festa Junina 2026 foi cancelado
  
  [Ver Detalhes]
  ```

**9. Notificação de Progresso** (Sugestão aceita)
- **Trigger:** Após cada check-in (exceto o último)
- **Destinatários:** Usuário que fez check-in
- **Conteúdo:**
  ```
  ⭐ Ótimo!
  3 de 4 check-ins completos
  Falta só mais 1 para ganhar o badge! 🏆
  
  Próximo check-in disponível em 25 minutos
  ```

---

### 4.2 Configurações de Notificações

**Usuário pode desabilitar:**
- [ ] Notificações de novos eventos
- [ ] Lembretes de eventos confirmados
- [ ] Lembretes de check-in
- [ ] Notificações de badges

**ADM pode configurar (por evento):**
- [ ] Enviar notificação de novo evento (sim/não)
- [ ] Enviar lembretes (sim/não)

---

## 👨‍💼 Painel do Administrador

### 5.1 Listagem de Eventos (ADM)

**Visão Geral:**

```
┌─────────────────────────────────────────────┐
│ Eventos                    [+ Criar Evento] │
├─────────────────────────────────────────────┤
│ [Todos] [Rascunhos] [Agendados] [Ativos]   │
│ [Encerrados] [Cancelados]                   │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ 🎉 Festa Junina 2026                │    │
│ │ 15 Jun • 19h • 🟢 Agendado          │    │
│ │                                     │    │
│ │ ✓ 42 confirmados • 28 check-ins     │    │
│ │                                     │    │
│ │ [Ver] [Editar] [Analytics] [⋮]     │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ 🏃 Corrida 5K                       │    │
│ │ 20 Jun • 7h • ⚪ Rascunho           │    │
│ │                                     │    │
│ │ [Continuar Edição] [Publicar]      │    │
│ └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Ações Rápidas:**
- Ver: Abre página pública do evento
- Editar: Abre formulário de edição
- Analytics: Abre dashboard de analytics
- Menu (⋮):
  - Duplicar evento
  - Abrir Display
  - Cancelar evento
  - Deletar (apenas rascunhos)

---

### 5.2 Analytics do Evento (ADM)

**Dashboard em Tempo Real:**

```
┌─────────────────────────────────────────────┐
│ 📊 Analytics - Festa Junina 2026            │
├─────────────────────────────────────────────┤
│                                             │
│ Visão Geral                                 │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ ✓ 42    │ │ ✓ 28    │ │ 66.7%   │        │
│ │Confirm. │ │Check-ins│ │Taxa Pres│        │
│ └─────────┘ └─────────┘ └─────────┘        │
│                                             │
│ ┌─────────┐ ┌─────────┐                    │
│ │ 1.750   │ │ 25      │                    │
│ │Pts Dist.│ │Badges   │                    │
│ └─────────┘ └─────────┘                    │
│                                             │
├─────────────────────────────────────────────┤
│ Check-ins ao Longo do Tempo                 │
│                                             │
│ [Gráfico de Linha]                          │
│  30│     ╭────                              │
│  20│   ╭─╯                                  │
│  10│ ╭─╯                                    │
│   0└────────────────                        │
│    19h  19h30 20h  20h30                    │
│                                             │
├─────────────────────────────────────────────┤
│ Check-ins por Período                       │
│                                             │
│ ■ Check-in 1: 28 pessoas (25 pts cada)      │
│ ■ Check-in 2: 25 pessoas (25 pts cada)      │
│ □ Check-in 3: 0 pessoas (25 pts cada)       │
│ □ Check-in 4: 0 pessoas (25 pts cada)       │
│                                             │
├─────────────────────────────────────────────┤
│ [Exportar CSV] [Exportar PDF]              │
└─────────────────────────────────────────────┘
```

**Métricas Disponíveis:**

**1. Total de Confirmados**
- Número de pessoas que confirmaram presença
- Lista com nomes e avatares

**2. Total de Check-ins Realizados**
- Número total de check-ins (soma de todos)
- Exemplo: 28 pessoas × 2 check-ins = 56 total

**3. Gráfico de Check-ins ao Longo do Tempo**
- Eixo X: Tempo (intervalos de 15 min)
- Eixo Y: Número de check-ins
- Atualiza em tempo real

**4. Lista de Quem Fez Check-in**
- Tabela com:
  - Nome
  - Check-ins feitos (1/4, 2/4, etc)
  - Horário de cada check-in
  - Pontos ganhos
  - Badge ganho (sim/não)
- Ordenação: Alfabética, por horário, por pontos
- Busca por nome
- Exportável

**5. Taxa de Presença**
- Fórmula: (Usuários com ≥1 check-in) / (Total de membros da associação) × 100
- Exemplo: 28 / 500 = 5.6%
- Também mostra: Taxa entre confirmados (28 / 42 = 66.7%)

**6. Pontos Distribuídos**
- Total de pontos já distribuídos
- Pontos ainda disponíveis
- Breakdown por check-in

**7. Comentários/Feedback**
- Lista de comentários do evento
- Possibilidade de responder
- Destacar perguntas não respondidas

---

### 5.3 Ações Durante o Evento (ADM)

**Painel de Controle ao Vivo:**

```
┌─────────────────────────────────────────────┐
│ 🎛️ Controle - Festa Junina 2026 (Ativo)    │
├─────────────────────────────────────────────┤
│                                             │
│ Status: 🟢 Em Andamento                     │
│ Check-in atual: 2 de 4                      │
│ Próxima mudança: em 12 minutos              │
│                                             │
│ [📺 Abrir Display] [⏸️ Pausar Check-ins]   │
│                                             │
├─────────────────────────────────────────────┤
│ Check-ins em Tempo Real (últimos 10)        │
│                                             │
│ 🟢 Maria Silva fez check-in 2  (há 1 min)   │
│ 🟢 João Santos fez check-in 2  (há 2 min)   │
│ 🟢 Ana Costa fez check-in 2    (há 3 min)   │
│ ...                                         │
│                                             │
├─────────────────────────────────────────────┤
│ Ações de Emergência                         │
│                                             │
│ [👤 Check-in Manual]                        │
│ [❌ Cancelar Evento]                        │
│                                             │
└─────────────────────────────────────────────┘
```

**Ações Disponíveis:**

**1. Ver Check-ins em Tempo Real**
- Feed ao vivo de check-ins
- Atualiza via WebSocket
- Mostra nome + check-in feito + timestamp

**2. Pausar Check-ins Temporariamente**
- Botão toggle
- **Efeito:**
  - Display mostra mensagem "Check-ins pausados"
  - QR Code fica oculto
  - Usuários não conseguem fazer check-in
- **Uso:** Problemas técnicos, intervalo forçado

**3. Check-in Manual (Emergência)**
- Modal com busca de usuário
- ADM seleciona:
  - Usuário
  - Qual check-in (1, 2, 3, 4)
  - Motivo (opcional)
- Confirmação de ação
- **Uso:** Usuário com problema técnico, QR Code não funcionou

**4. Cancelar Evento**
- Botão vermelho
- Modal de confirmação + motivo
- **Efeito:**
  - Evento vai para status "Cancelado"
  - Notifica todos que confirmaram
  - Display mostra mensagem de cancelamento
  - Post no feed é atualizado

**5. Abrir Display**
- Abre Display em nova aba/janela
- Fullscreen mode
- Útil para testar ou projetar

---

### 5.4 Edição de Eventos

**Regras de Edição:**

**ANTES do Evento:**
- ✅ Pode editar tudo livremente
- ✅ Não precisa notificar quem confirmou
- ⚠️ Se mudar data/hora: Opcional notificar

**DURANTE o Evento:**
- ⚠️ Pode editar apenas: Descrição, Link externo
- ❌ NÃO pode editar: Data, Pontos, Check-ins, Intervalo
- ❌ Mudanças críticas bloqueadas

**DEPOIS do Evento:**
- ✅ Pode editar apenas: Descrição (recap)
- ✅ Pode adicionar: Link de fotos/vídeos
- ❌ Evento fica read-only (exceto recap)
- ❌ Não pode deletar (histórico preservado)

**Deletar Evento:**
- ✅ Apenas RASCUNHOS podem ser deletados
- ❌ Eventos publicados: Apenas cancelar

---

### 5.5 Exportar Relatórios

**Formatos Disponíveis:**

**CSV:**
```csv
Nome,Email,Check-ins,Pontos,Badge,Confirmou,Check-in_1,Check-in_2,Check-in_3,Check-in_4
Maria Silva,maria@email.com,4/4,100,Sim,Sim,19:05,19:35,20:10,20:45
João Santos,joao@email.com,2/4,50,Não,Sim,19:10,19:40,-,-
```

**PDF:**
- Relatório formatado
- Logo da associação
- Gráficos visuais
- Estatísticas resumidas
- Lista completa de participantes

**Conteúdo:**
- Nome do evento
- Data e hora
- Total de confirmados
- Total de check-ins
- Taxa de presença
- Pontos distribuídos
- Lista de participantes com detalhes

---

## 🗂️ Módulo de Badges (ADM)

### 6.1 Gestão de Badges

> **Nota:** Módulo separado e independente. Eventos apenas selecionam badges da biblioteca.

**Página de Badges:**

```
┌─────────────────────────────────────────────┐
│ 🏆 Badges                    [+ Criar Badge]│
├─────────────────────────────────────────────┤
│                                             │
│ ┌───────────────────┐ ┌───────────────────┐│
│ │   [Ícone 🎉]      │ │   [Ícone 🏃]      ││
│ │                   │ │                   ││
│ │ Festa Junina 2026 │ │ Corrida 5K        ││
│ │                   │ │                   ││
│ │ Participe da      │ │ Complete a        ││
│ │ tradicional festa │ │ corrida de 5km    ││
│ │                   │ │                   ││
│ │ 25 conquistados   │ │ 10 conquistados   ││
│ │                   │ │                   ││
│ │ [Editar] [Deletar]│ │ [Editar] [Deletar]││
│ └───────────────────┘ └───────────────────┘│
│                                             │
└─────────────────────────────────────────────┘
```

**Formulário de Criação:**

**Campos:**

1. **Ícone/Imagem**
   - Upload: PNG (transparente) ou JPG
   - Tamanho: 200x200px recomendado
   - Formato: Quadrado
   - Preview em tempo real

2. **Nome**
   - Input: Texto
   - Limite: 5-80 caracteres
   - Exemplo: "Participante Festa Junina 2026"

3. **Descrição**
   - Input: Textarea
   - Limite: 10-200 caracteres
   - Exemplo: "Participe da tradicional Festa Junina da associação"

4. **Cor de Fundo** (Opcional)
   - Color picker
   - Padrão: Cinza claro
   - Usado como fundo do card do badge

**Ações:**
- Criar Badge
- Editar Badge (apenas se não estiver vinculado a evento ativo)
- Deletar Badge (apenas se não estiver vinculado)
- Preview em diferentes contextos (perfil, modal, notificação)

---

### 6.2 Biblioteca de Badges

**Sistema Pré-definido:**
- ADM pode criar badges customizados
- Badges ficam salvos na biblioteca
- Reutilizáveis em múltiplos eventos

**Seleção no Evento:**
- Dropdown com preview
- Busca por nome
- Ordenação: Mais recentes, Alfabética, Mais usados

---

## 🏛️ Estados e Ciclo de Vida

### 7.1 Fluxo de Estados

```
[Rascunho] → [Agendado] → [Em Andamento] → [Encerrado]
     ↓             ↓              ↓
[Cancelado]   [Cancelado]   [Cancelado]
```

---

### 7.2 Detalhamento dos Estados

**1. Rascunho**
- Evento criado mas não publicado
- Visível apenas para ADM
- Não aparece em listagens públicas
- Não cria Display
- Não cria post no feed
- Pode ser editado/deletado livremente

**Transição:**
- Checkbox "Publicar evento" → Agendado

---

**2. Agendado**
- Evento publicado e visível
- Aguardando data de início
- **Ações do sistema:**
  - ✅ Cria Display vinculado
  - ✅ Cria post no feed (se ADM marcou checkbox)
  - ✅ Aparece em listagens públicas
  - ✅ Usuários podem confirmar presença
  - ✅ Envia notificação de novo evento

**Display (enquanto Agendado):**
```
Evento em breve!

Festa Junina 2026
Começa em 2 dias

Fique ligado!
```

**Transição Automática:**
- Ao atingir data/hora de início → Em Andamento

---

**3. Em Andamento**
- Evento acontecendo agora
- Check-ins ativos
- Display mostrando QR Codes

**Comportamento:**
- ✅ Check-ins funcionando
- ✅ QR Code rotacionando (segurança + check-ins)
- ✅ Analytics em tempo real
- ✅ Notificações de lembrete
- ✅ Contador de presença atualizando

**Transição Automática:**
- Ao atingir data/hora de fim → Encerrado

---

**4. Encerrado**
- Evento terminou
- Check-ins desabilitados
- Modo read-only

**Comportamento:**
- ❌ Não aceita mais check-ins
- ✅ Usuários podem ver recap
- ✅ Analytics disponíveis
- ✅ Relatórios podem ser exportados
- ✅ Pode editar descrição (adicionar fotos/recap)

**Display (Encerrado):**
```
Evento Encerrado

Obrigado pela participação!

Total de participantes: 28
Check-ins realizados: 75
```

---

**5. Cancelado (Soft Delete)**
- Evento foi cancelado pelo ADM
- Hidden para common users

**Comportamento:**
- ❌ Não aparece em listagens públicas
- ✅ ADM ainda vê no painel (com badge "Cancelado")
- ✅ Histórico preservado
- ✅ Notifica quem confirmou presença
- ✅ Post no feed é atualizado (badge "Cancelado")
- ✅ Pontos já ganhos são mantidos

**Display (Cancelado):**
```
Evento Cancelado

Desculpe pelo inconveniente.
```

**Não pode:**
- ❌ Voltar a estado anterior
- ❌ Ser deletado (histórico preservado)
- ❌ Aceitar check-ins

---

## 🔗 Integrações com Outros Módulos

### 8.1 Integração com Feed Social

**Post Automático:**

**Quando:** Ao publicar evento (checkbox "Publicar no feed")

**Conteúdo do Post:**
- Tipo: `event`
- Badge: "🛡️ ADMINISTRAÇÃO"
- Banner: Imagem do feed (1:1 ou 4:5)
- Título do evento
- Data e hora
- Local
- Pontos disponíveis
- Botão "Tenho Interesse"
- Ações sociais: Curtir, Comentar

**Sincronização:**
- Editar evento → Atualiza post automaticamente
- Cancelar evento → Badge "Cancelado" no post
- Deletar evento → Remove post (apenas rascunhos)

---

### 8.2 Integração com Sistema de Pontos

**Distribuição de Pontos:**
- Check-in realizado → Pontos creditados automaticamente
- Atualiza saldo em tempo real
- Histórico de transações registra:
  - Fonte: "Check-in - [Nome do Evento]"
  - Quantidade: X pontos
  - Timestamp

**Rollback:**
- Se evento for cancelado APÓS check-ins:
  - Pontos NÃO são retirados (mantidos)
  - Usuário mantém o que ganhou até o momento

---

### 8.3 Integração com Perfil do Usuário

**Badges no Perfil:**
- Badge conquistado → Aparece no perfil automaticamente
- Usuário pode selecionar 3 badges para exibir
- Tooltip ao clicar: Nome + descrição + data de obtenção

**Progresso de Eventos:**
- Seção "Meus Eventos" no perfil
- Lista eventos com:
  - Check-ins feitos
  - Pontos ganhos
  - Badges conquistados

---

### 8.4 Integração com Notificações

**Central de Notificações:**
- Notificações de eventos vão para centro de notificações
- Badge contador no ícone de sino
- Ações rápidas nas notificações:
  - "Confirmar Presença"
  - "Fazer Check-in"
  - "Ver Evento"

---

### 8.5 Integração com Módulo de Espaços

**Dependência:**
- Módulo de Espaços precisa estar implementado
- Se não estiver, campo "Local" é texto livre

**Se Implementado:**
- Dropdown com espaços pré-cadastrados
- Auto-preenche: Endereço, capacidade, fotos
- Link clicável para ver detalhes do espaço
- Mapa integrado

---

### 8.6 Integração com "Minha Carteira" (Scanner)

**Scanner de QR Code:**
- Módulo "Minha Carteira" fornece scanner universal
- Eventos utilizam este scanner
- Scanner detecta tipo de QR Code:
  - `type: "event_checkin"` → Processa check-in
  - `type: "user_transfer"` → Transferência de pontos
  - Outros tipos → Mensagem apropriada

---

## 🔌 APIs e Integrações Técnicas

### Endpoints - Eventos (Common User)

**GET** `/events`
- Query params: `status=all|upcoming|past`, `category=social`, `search=festa`
- Retorna lista de eventos
- Response:
```json
{
  "events": [
    {
      "id": "evt_123",
      "title": "Festa Junina 2026",
      "description": "...",
      "category": "social",
      "start_date": "2026-06-15T19:00:00Z",
      "end_date": "2026-06-15T23:00:00Z",
      "location": {
        "name": "Salão Principal",
        "address": "Rua das Flores, 123",
        "space_id": "spc_456"
      },
      "banner_feed": "https://...",
      "banner_display": ["https://...", "https://..."],
      "color": "#FF5733",
      "points_total": 100,
      "checkins_count": 4,
      "checkin_interval_minutes": 30,
      "badge": {
        "id": "bdg_789",
        "name": "Participante Festa Junina 2026",
        "icon_url": "https://..."
      },
      "status": "scheduled",
      "confirmed_count": 42,
      "checkin_count": 0,
      "my_confirmation": true,
      "my_progress": {
        "checkins_done": 0,
        "total_checkins": 4,
        "points_earned": 0
      }
    }
  ]
}
```

**GET** `/events/:id`
- Retorna detalhes completos do evento
- Inclui comentários (últimos 20)

**POST** `/events/:id/confirm`
- Confirma presença no evento
- Body: vazio
- Retorna: status atualizado

**DELETE** `/events/:id/confirm`
- Remove confirmação

**POST** `/events/:id/checkin`
- Faz check-in via QR Code
- Body:
```json
{
  "qr_data": "...",
  "checkin_number": 2,
  "security_token": "abc123",
  "timestamp": 1704067200
}
```
- Validações backend:
  - Evento existe e está ativo
  - Check-in atual disponível
  - Token válido e não expirado
  - Usuário não fez este check-in ainda
  - Intervalo respeitado (se aplicável)
- Retorna:
```json
{
  "success": true,
  "checkin_number": 2,
  "points_earned": 25,
  "total_points": 50,
  "progress": {
    "checkins_done": 2,
    "total_checkins": 4
  },
  "badge_earned": false,
  "next_checkin_available_at": "2026-06-15T20:00:00Z"
}
```

**GET** `/events/:id/comments`
- Retorna comentários do evento
- Query: `offset`, `limit`

**POST** `/events/:id/comments`
- Cria comentário
- Body: `{ "text": "..." }`

---

### Endpoints - Eventos (ADM)

**POST** `/events` (ADM only)
- Cria novo evento
- Body: FormData (multipart) com todos os campos
- Retorna: evento criado + display_id + post_id (se aplicável)

**PUT** `/events/:id` (ADM only)
- Atualiza evento
- Validações de estado (ver seção 5.4)
- Retorna: evento atualizado

**DELETE** `/events/:id` (ADM only)
- Deleta evento (apenas rascunhos)
- Cancela evento (se publicado)

**POST** `/events/:id/publish` (ADM only)
- Publica rascunho
- Cria Display e Post no feed

**POST** `/events/:id/cancel` (ADM only)
- Cancela evento
- Body: `{ "reason": "..." }`
- Envia notificações

**POST** `/events/:id/pause` (ADM only)
- Pausa check-ins temporariamente
- Body: `{ "paused": true }`

**POST** `/events/:id/checkin/manual` (ADM only)
- Check-in manual de emergência
- Body:
```json
{
  "user_id": "usr_123",
  "checkin_number": 2,
  "reason": "QR Code não funcionou"
}
```

**GET** `/events/:id/analytics` (ADM only)
- Retorna analytics detalhados
- Real-time via WebSocket opcional

**GET** `/events/:id/export/csv` (ADM only)
- Exporta relatório CSV
- Download automático

**GET** `/events/:id/export/pdf` (ADM only)
- Exporta relatório PDF
- Download automático

---

### Endpoints - Display

**GET** `/display/:event_id`
- Página HTML fullscreen do Display
- Não requer autenticação (público)
- Inclui WebSocket connection script

**WebSocket** `/ws/display/:event_id`
- Conexão persistente
- Servidor envia:
  - Novo QR Code (a cada 1 min)
  - Mudança de check-in (após intervalo)
  - Atualização de contador
  - Pausar/retomar
  - Cancelamento
- Formato:
```json
{
  "type": "qr_update",
  "data": {
    "qr_code": "...",
    "security_token": "...",
    "expires_at": 1704067260
  }
}
```

---

### Endpoints - Badges (ADM)

**GET** `/badges`
- Lista todos os badges
- Query: `search`, `sort`

**POST** `/badges` (ADM only)
- Cria novo badge
- Body: FormData (ícone + dados)

**PUT** `/badges/:id` (ADM only)
- Atualiza badge

**DELETE** `/badges/:id` (ADM only)
- Deleta badge (se não vinculado)

---

## 📱 Responsividade

### Mobile (360px - 414px)
- Layout padrão (single column)
- Cards fullwidth
- Display: Não aplicável (TV/monitor)
- Scanner: Câmera fullscreen

### Tablet (768px - 1024px)
- Listagem: Grid 2 colunas
- Página do evento: Max-width 700px
- Display: Fullscreen

### Desktop (>1024px)
- Listagem: Grid 3 colunas
- Página do evento: Max-width 800px centralizado
- Display: Fullscreen (1920x1080 otimizado)

---

## ✅ Critérios de Aceitação

### Criação e Gestão (ADM)

- [ ] ADM consegue criar evento com todos campos obrigatórios
- [ ] Sistema valida campos corretamente
- [ ] Preview do Display funciona antes de publicar
- [ ] Preview do post no feed funciona
- [ ] Rascunho é salvo e editável
- [ ] Publicar cria Display e Post automaticamente
- [ ] Divisão de pontos (auto + customizada) funciona
- [ ] Upload de múltiplas imagens para Display funciona
- [ ] Cor personalizada aplica em todos lugares

### Listagem e Descoberta

- [ ] Usuários veem lista de eventos corretamente
- [ ] Filtros (Todos/Próximos/Passados) funcionam
- [ ] Filtro por categoria funciona
- [ ] Busca por texto funciona
- [ ] Card resumido mostra informações corretas
- [ ] Status do evento é exibido corretamente

### Página do Evento

- [ ] Todas informações são exibidas corretamente
- [ ] Botão "Confirmar Presença" funciona (toggle)
- [ ] Comentários funcionam (criar, listar, curtir)
- [ ] Link externo abre corretamente
- [ ] Mapa é exibido (se aplicável)
- [ ] Meu progresso é exibido corretamente

### Check-in

- [ ] Scanner abre ao clicar em "Fazer Check-in"
- [ ] Câmera funciona corretamente
- [ ] QR Code é escaneado e validado
- [ ] Check-in é registrado corretamente
- [ ] Pontos são creditados imediatamente
- [ ] Progresso é atualizado em tempo real
- [ ] Erro ao escanear QR inválido é exibido
- [ ] Erro ao tentar check-in muito cedo é exibido
- [ ] Badge é concedido quando aplicável
- [ ] Notificação de progresso é exibida

### Display

- [ ] Display é criado automaticamente ao publicar
- [ ] Layout imersivo é renderizado corretamente
- [ ] QR Code muda a cada 1 minuto (segurança)
- [ ] Check-in muda após intervalo configurado
- [ ] Contador de presença atualiza em tempo real
- [ ] WebSocket mantém conexão estável
- [ ] Fallback para polling funciona se WebSocket falhar
- [ ] Display funciona offline (com cache)
- [ ] Múltiplas imagens rotacionam no background
- [ ] Estados (aguardando, ativo, pausado, encerrado) são exibidos

### Lógica de Check-ins

- [ ] Usuário atrasado pode fazer check-in atual
- [ ] Usuário não pode fazer check-in passado
- [ ] Intervalo entre check-ins é respeitado (lado usuário)
- [ ] Progresso é calculado corretamente
- [ ] Badge é concedido conforme configuração do ADM
- [ ] Check-in duplicado é bloqueado

### Notificações

- [ ] Notificação de novo evento é enviada
- [ ] Lembretes (1 dia, 1 hora) são enviados
- [ ] Notificação "evento começou" é enviada
- [ ] Lembretes de check-in são enviados
- [ ] Notificação de badge conquistado é enviada
- [ ] Notificação de cancelamento é enviada
- [ ] Notificação de progresso é enviada

### Analytics (ADM)

- [ ] Dashboard mostra métricas corretas
- [ ] Gráfico de check-ins atualiza em tempo real
- [ ] Lista de participantes é exibida corretamente
- [ ] Taxa de presença é calculada corretamente
- [ ] Exportar CSV funciona
- [ ] Exportar PDF funciona

### Estados e Transições

- [ ] Rascunho → Agendado funciona
- [ ] Agendado → Em Andamento (automático) funciona
- [ ] Em Andamento → Encerrado (automático) funciona
- [ ] Cancelar evento funciona (soft delete)
- [ ] Pontos mantidos após cancelamento
- [ ] Regras de edição são respeitadas

### Integrações

- [ ] Post no feed é criado automaticamente
- [ ] Post é atualizado ao editar evento
- [ ] Post mostra badge "Cancelado" quando aplicável
- [ ] Badge aparece no perfil após conquista
- [ ] Pontos são creditados no Sistema de Pontos
- [ ] Espaços pré-cadastrados aparecem (se módulo implementado)
- [ ] Scanner universal detecta QR de check-in

---

## 📝 Notas de Desenvolvimento

### Performance

**Otimizações Críticas:**
- Cache agressivo de imagens (banner, ícones)
- Lazy loading na listagem de eventos
- Virtual scroll se >50 eventos
- WebSocket com heartbeat (30s) para Display
- Debounce em check-in (500ms) para evitar duplicatas
- Compressão de imagens antes de upload

**Métricas Alvo:**
- Listagem de eventos: <2s
- Página do evento: <1.5s
- Scanner de QR Code: <500ms (reconhecimento)
- Display QR Code update: <200ms
- Analytics em tempo real: <3s

---

### Segurança

**QR Code:**
- Security token com HMAC-SHA256
- Timestamp validation (janela de 2 min)
- Rate limiting: 1 check-in por minuto por usuário
- Detecção de QR Code duplicado (mesmo token)

**Display:**
- URL pública mas dados limitados
- Apenas exibe, não modifica
- WebSocket read-only
- CORS configurado corretamente

**Check-in:**
- Validação no backend (não confiar no app)
- Verificar permissões de usuário
- Log de todas tentativas (sucesso e falha)

---

### Acessibilidade

**WCAG 2.1 AA:**
- Contrast ratio mín 4.5:1 (texto no Display)
- Touch targets mín 48x48px
- Labels descritivos para screen readers
- Suporte a font scaling (até 200%)
- QR Code com alt text explicativo

**Scanner:**
- Feedback sonoro ao escanear (opcional)
- Haptic feedback
- Mensagens de erro claras
- Instruções visuais de posicionamento

---

### Testes

**Casos de Teste Críticos:**

1. **Criação de Evento:**
   - Criar com todos campos obrigatórios
   - Validar campos faltando
   - Preview Display e Feed
   - Publicar e verificar criação de Display/Post

2. **Check-in:**
   - Escanear QR Code válido
   - Escanear QR Code expirado
   - Tentar check-in duplicado
   - Tentar check-in muito cedo (intervalo)
   - Usuário atrasado escaneia check-in atual

3. **Display:**
   - QR Code muda a cada 1 minuto
   - Check-in muda após intervalo
   - WebSocket mantém conexão
   - Fallback para polling
   - Funciona offline

4. **Estados:**
   - Transições automáticas (Agendado → Ativo → Encerrado)
   - Cancelar evento
   - Pausar check-ins
   - Editar evento (diferentes estados)

5. **Notificações:**
   - Novo evento
   - Lembretes
   - Badge conquistado
   - Cancelamento

6. **Analytics:**
   - Métricas corretas
   - Tempo real
   - Exportar relatórios

---

### Melhorias Futuras (Backlog - Fase 2)

**🟡 Eventos Recorrentes:**
- Criar evento semanal/mensal
- Definir recorrência e fim
- Check-ins independentes por ocorrência

**🟡 Mapa e Localização:**
- Mapa interativo na página do evento
- Direções via Google Maps
- Filtrar eventos por proximidade

**🟡 Galeria de Fotos Pós-Evento:**
- Upload de fotos (ADM e usuários)
- Galeria na página do evento
- Integração com feed

**🟡 Analytics Avançado:**
- Dashboard consolidado de todos eventos
- Comparação entre eventos
- Métricas de engajamento
- Previsão de participação

**🟡 Capacidade e Filas:**
- Bloquear confirmações quando lotado
- Fila de espera
- Cancelamento com reposição

**🟡 Tipos de Ingresso:**
- Eventos pagos
- Integração com pagamento
- Diferentes tipos de ingresso

**🟡 Check-in Facial (Futurístico):**
- Reconhecimento facial para check-in
- Sem necessidade de QR Code
- Alta segurança

---

## 🚀 Fases de Implementação

### Fase 1 - MVP (Essencial)
**Prazo estimado: 6-8 semanas**

✅ Criar evento básico (todos campos obrigatórios)  
✅ Listagem e filtros  
✅ Página detalhada do evento  
✅ Confirmar presença  
✅ Sistema de check-in via QR Code  
✅ Display fullscreen  
✅ QR Code dinâmico (segurança + rotação)  
✅ Distribuição de pontos  
✅ Badges (seleção de existentes)  
✅ Post automático no feed  
✅ Categorias de eventos  
✅ Notificações básicas  
✅ Analytics básico (ADM)  

### Fase 2 - Aprimoramentos
**Prazo estimado: 4-5 semanas**

🟡 Eventos recorrentes  
🟡 Mapa/localização  
🟡 Galeria de fotos pós-evento  
🟡 Analytics avançado  
🟡 Exportar relatórios (CSV, PDF)  
🟡 Capacidade e filas  
🟡 Comentários com menções  

### Fase 3 - Nice to Have
**Prazo: A definir**

🟢 Eventos pagos  
🟢 Check-in facial  
🟢 Transmissão ao vivo  
🟢 Integração com redes sociais  

---

## 📊 Métricas de Sucesso

**KPIs a Acompanhar:**

1. **Criação de Eventos:**
   - Eventos criados por mês
   - Taxa de publicação (publicados / criados)
   - Tempo médio de criação

2. **Engajamento:**
   - Taxa de confirmação (confirmados / total de usuários)
   - Taxa de presença (check-ins / confirmados)
   - Check-ins por evento (média)
   - Comentários por evento (média)

3. **Check-ins:**
   - Total de check-ins por mês
   - Taxa de completude (todos check-ins / pelo menos 1)
   - Tempo médio entre check-ins
   - Taxa de check-ins atrasados

4. **Display:**
   - Uptime do Display (%)
   - Taxa de erro do QR Code
   - Latência do WebSocket

5. **Badges:**
   - Taxa de conquista de badges
   - Badges mais populares
   - Tempo médio para conquistar

6. **Notificações:**
   - Open rate por tipo de notificação
   - Taxa de conversão (notificação → ação)

---

**Status:** 🟢 Especificação Completa  
**Próximo Passo:** Criar wireframes e começar desenvolvimento do MVP  
**Data:** 09/01/2026

---
## 🏢 Espaços

### 📊 Visão Geral
**Prioridade:** 🟡 Fase 2  
**Status:** ⚪ Não Iniciado

[A preencher]

---

## 📅 Reservas

### 📊 Visão Geral
**Prioridade:** 🟡 Fase 2  
**Status:** ⚪ Não Iniciado

[A preencher]

---

## 🍔 Pedidos

### 📊 Visão Geral
**Prioridade:** 🟡 Fase 2  
**Status:** ⚪ Não Iniciado

[A preencher]

---

## 🎵 Jukebox

### 📊 Visão Geral
**Prioridade:** 🟢 Nice to Have  
**Status:** ⚪ Não Iniciado

[A preencher]

---

## 🛒 Loja

### 📊 Visão Geral
**Prioridade:** 🟡 Fase 2  
**Status:** ⚪ Não Iniciado

[A preencher]

---

## 🏆 Rankings

### 📊 Visão Geral
**Prioridade:** 🟡 Fase 2  
**Status:** ⚪ Não Iniciado

[A preencher]

---

## 💬 Suporte

### 📊 Visão Geral
**Prioridade:** 🟡 Fase 2  
**Status:** ⚪ Não Iniciado

[A preencher]

---

## 💰 Sistema de Pontos

### 📊 Visão Geral
**Prioridade:** 🔴 MVP  
**Status:** ⚪ Não Iniciado

**Descrição:**  
Sistema de gamificação através de pontos que podem ser ganhos e gastos no aplicativo.

### 🎯 Formas de Ganhar Pontos
- [ ] Check-in em eventos
- [ ] Participação em enquetes
- [ ] Posts no feed
- [ ] Indicação de novos membros
- [ ] Consumo no bar/restaurante
- [ ] [A definir]

### 💸 Formas de Gastar Pontos
- [ ] Descontos na loja
- [ ] Reserva de espaços premium
- [ ] Itens exclusivos
- [ ] [A definir]

### 🧩 Componentes
[A preencher]

---

## 🔔 Notificações

### 📊 Visão Geral
**Prioridade:** 🔴 MVP  
**Status:** ⚪ Não Iniciado

### Tipos de Notificações
- [ ] Nova curtida em post
- [ ] Novo comentário em post
- [ ] Resposta em comentário
- [ ] Menção em post/comentário
- [ ] Nova mensagem
- [ ] Lembrete de evento
- [ ] Pontos ganhos/gastos
- [ ] Novo ranking alcançado

---

## 💬 Mensagens

### 📊 Visão Geral
**Prioridade:** 🔴 MVP  
**Status:** ⚪ Não Iniciado

**Descrição:**  
Sistema de mensagens diretas entre usuários.

### 🧩 Componentes
[A preencher]

---

## 📚 Componentes Globais

### Design System

#### Cores Primárias
```
Primary: #[HEX]
Secondary: #[HEX]
Accent: #[HEX]
Background: #[HEX]
Text: #[HEX]
```

#### Tipografia
```
Heading 1: [Font] - [Size]
Heading 2: [Font] - [Size]
Body: [Font] - [Size]
Caption: [Font] - [Size]
```

#### Componentes Reutilizáveis
- [ ] Botões (Primary, Secondary, Outline)
- [ ] Cards
- [ ] Inputs
- [ ] Modals
- [ ] Bottom Sheets
- [ ] Loading States (Skeleton)
- [ ] Empty States
- [ ] Error States

---

## 🔐 Autenticação & Segurança

### Login
- [ ] Email + Senha
- [ ] Social Login (Google, Apple)
- [ ] Recuperação de senha

### Permissões
- [ ] Usuário Comum
- [ ] Administrador

---

## 📊 Métricas & Analytics

### Eventos a Rastrear
- [ ] Login/Logout
- [ ] Tempo de sessão
- [ ] Posts criados
- [ ] Curtidas dadas
- [ ] Comentários feitos
- [ ] Módulos mais acessados
- [ ] Pontos ganhos/gastos

---

## 🚀 Roadmap

### MVP (Fase 1)
- [ ] Dashboard
- [ ] Perfil
- [ ] Sistema de Pontos
- [ ] Feed Social
- [ ] Stories
- [ ] Carteirinha
- [ ] Notificações
- [ ] Mensagens

### Fase 2
- [ ] Eventos
- [ ] Espaços
- [ ] Reservas
- [ ] Pedidos
- [ ] Loja
- [ ] Rankings

### Fase 3 (Nice to Have)
- [ ] Jukebox
- [ ] Gamificação avançada
- [ ] Analytics para usuários

---

## 📝 Glossário

**Badge:** Distintivo visual representando conquista ou status  
**Story:** Conteúdo efêmero visível por 24 horas  
**Feed:** Fluxo de posts de usuários  
**Tooltip:** Informação contextual ao interagir com elemento  

---

## 📌 Convenções deste Documento

### Símbolos de Prioridade
- 🔴 **MVP:** Essencial para lançamento
- 🟡 **Fase 2:** Importante mas não crítico
- 🟢 **Nice to Have:** Desejável no futuro

### Símbolos de Status
- ⚪ **Não Iniciado**
- 🟡 **Em Especificação**
- 🔵 **Em Desenvolvimento**
- 🟢 **Concluído**
- 🔴 **Bloqueado**

### Como Preencher Novas Seções
1. Copie o template de módulo
2. Preencha **Visão Geral** primeiro
3. Adicione **Objetivos** principais
4. Detalhe **Componentes** progressivamente
5. Defina **Fluxos de Navegação**
6. Liste **APIs Necessárias**
7. Estabeleça **Critérios de Aceitação**

---

3. Especificar módulo de Mensagens

**🎯 Próximos Passos:**
1. Revisar e detalhar módulo Dashboard
2. Definir Sistema de Pontos completamente
3. Especificar módulo de Mensagens
4. Criar wireframes do Dashboard e Carteirinha
4. Criar wireframes do Dashboard
---

## 💳 Minha Carteira (Scanner)

### 📊 Visão Geral
**Prioridade:** 🔴 MVP  
**Status:** ⚪ Não Iniciado  
**Responsável:** [Nome]

**Descrição:**  
Módulo de scanner de QR Code para transferência de pontos entre usuários. Acessível via "Acessos Rápidos" no Dashboard.

### 🎯 Objetivos
- Permitir transferência de pontos entre usuários
- Facilitar identificação rápida do destinatário via QR Code
- Registrar histórico de transferências

### 🧩 Componentes
[A preencher após brainstorming da Dashboard]

---
