# Fase 8: Dashboard (Agregador)

**Complexidade:** Alta
**Duração estimada:** 2-3 semanas
**Dependências:** TODAS as fases anteriores

## Objetivo

Implementar a tela principal que agrega todos os módulos:
- Card de pontos com mini gráfico
- Acesso rápido aos módulos
- Stories (24h efêmeros)
- Feed de posts, enquetes e eventos
- Badge verificado em posts
- Moderação de conteúdo

---

## Arquivos para Ler Antes de Implementar

### Documentação
```
docs/01-dashboard/spec.md
docs/01-dashboard/api.md
docs/01-dashboard/acceptance-criteria.md
docs/01-dashboard/components.md
```

### Backend (DTOs de referência)
```
apps/api/src/modules/dashboard/dto/
apps/api/src/modules/dashboard/controllers/
```

---

## Arquivos para Criar

### Mobile - Dashboard

#### Screens
```
apps/mobile/src/features/dashboard/screens/
├── DashboardScreen.tsx            # Tela principal
├── StoriesViewerScreen.tsx        # Visualizar stories
├── CreateStoryScreen.tsx          # Criar story
├── CreatePostScreen.tsx           # Criar post
└── PostDetailScreen.tsx           # Post com comentários
```

#### Components
```
apps/mobile/src/features/dashboard/components/
├── DashboardHeader.tsx            # Avatar + notificações
├── PointsCard.tsx                 # Card de pontos
├── QuickAccessGrid.tsx            # Grid de atalhos
├── QuickAccessItem.tsx            # Item do grid
├── StoriesRow.tsx                 # Carrossel de stories
├── StoryAvatar.tsx                # Avatar com ring
├── StoryViewer.tsx                # Visualizador fullscreen
├── StoryProgress.tsx              # Barras de progresso
├── StoryCreator.tsx               # Câmera/galeria/texto
├── FeedList.tsx                   # Lista virtual do feed
├── PostCard.tsx                   # Card de post
├── PhotoPost.tsx                  # Post de foto
├── PollPost.tsx                   # Post de enquete
├── EventPost.tsx                  # Auto-post de evento
├── PostActions.tsx                # Like, comentar, compartilhar
├── CommentsModal.tsx              # Bottom sheet de comentários
├── CommentItem.tsx                # Comentário individual
├── ReactionBar.tsx                # Reações em comentários
├── PollOptions.tsx                # Opções de votação
├── VerifiedBadge.tsx              # Check dourado
├── NewPostsNotice.tsx             # "X novos posts"
└── OnboardingTooltips.tsx         # Dicas primeira vez
```

#### Hooks
```
apps/mobile/src/features/dashboard/hooks/
├── useDashboard.ts                # Dados agregados
├── useStories.ts                  # Stories
├── useFeed.ts                     # Feed
├── useCreatePost.ts               # Criar post
├── useCreateStory.ts              # Criar story
├── useLike.ts                     # Curtir
├── useComments.ts                 # Comentários
└── usePoll.ts                     # Votação
```

#### API
```
apps/mobile/src/features/dashboard/api/
├── dashboard.api.ts
├── stories.api.ts
└── feed.api.ts
```

---

### Web Admin - Dashboard

#### Components
```
apps/web/src/features/dashboard/components/
├── AdminDashboard.tsx             # Painel admin
├── StatsCards.tsx                 # Cards de métricas
├── RecentActivity.tsx             # Atividades recentes
├── ModerationQueue.tsx            # Fila de moderação
├── ReportItem.tsx                 # Item reportado
└── UserSuspension.tsx             # Suspender usuário
```

#### Pages
```
apps/web/src/features/dashboard/pages/
├── AdminHomePage.tsx
└── ModerationPage.tsx
```

---

## Endpoints da API

### Dashboard
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/dashboard` | Dados agregados |
| GET | `/dashboard/quick-access` | Configuração de atalhos |

### Stories
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/stories` | Stories dos seguidos |
| GET | `/stories/my` | Meus stories |
| POST | `/stories` | Criar story |
| DELETE | `/stories/:id` | Excluir story |
| POST | `/stories/:id/view` | Registrar visualização |

### Feed
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/feed` | Feed principal |
| GET | `/feed/following` | Apenas seguidos |
| POST | `/posts` | Criar post |
| GET | `/posts/:id` | Detalhes do post |
| DELETE | `/posts/:id` | Excluir post |
| POST | `/posts/:id/like` | Curtir |
| DELETE | `/posts/:id/like` | Descurtir |
| GET | `/posts/:id/comments` | Comentários |
| POST | `/posts/:id/comments` | Comentar |
| POST | `/posts/:id/report` | Reportar |

### Enquetes
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/polls/:id/vote` | Votar |
| GET | `/polls/:id/results` | Resultados |

### Moderação - Admin
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/moderation/reports` | Denúncias |
| POST | `/admin/moderation/reports/:id/action` | Ação |
| POST | `/admin/moderation/users/:id/suspend` | Suspender |
| DELETE | `/admin/moderation/users/:id/suspend` | Remover suspensão |

---

## Especificações Técnicas

### Dashboard Scroll Architecture

```typescript
// apps/mobile/src/features/dashboard/screens/DashboardScreen.tsx
const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header fixo */}
      <DashboardHeader />

      <ScrollView
        stickyHeaderIndices={[1]} // Points card sticky
        showsVerticalScrollIndicator={false}
      >
        {/* Card de pontos */}
        <PointsCard />

        {/* Acesso rápido - scroll horizontal */}
        <QuickAccessGrid />

        {/* Stories - scroll horizontal */}
        <StoriesRow />

        {/* Feed - scroll vertical infinito */}
        <FeedList />
      </ScrollView>
    </View>
  );
};
```

### Story Viewer

```typescript
// apps/mobile/src/features/dashboard/components/StoryViewer.tsx
const StoryViewer = ({ stories, initialIndex, onClose }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const progress = useSharedValue(0);

  const currentUser = stories[currentUserIndex];
  const currentStory = currentUser.stories[currentStoryIndex];

  useEffect(() => {
    // Auto-progress (5 segundos por story)
    progress.value = withTiming(1, { duration: 5000 }, (finished) => {
      if (finished) {
        runOnJS(nextStory)();
      }
    });
  }, [currentStoryIndex, currentUserIndex]);

  const nextStory = () => {
    if (currentStoryIndex < currentUser.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
    progress.value = 0;
  };

  return (
    <View style={styles.container}>
      <StoryProgress
        count={currentUser.stories.length}
        current={currentStoryIndex}
        progress={progress}
      />

      <Pressable
        onPress={(e) => {
          const { locationX } = e.nativeEvent;
          if (locationX < width / 2) {
            prevStory();
          } else {
            nextStory();
          }
        }}
      >
        {currentStory.type === 'IMAGE' && (
          <Image source={{ uri: currentStory.mediaUrl }} />
        )}
        {currentStory.type === 'VIDEO' && (
          <Video source={{ uri: currentStory.mediaUrl }} />
        )}
        {currentStory.type === 'TEXT' && (
          <View style={[styles.textBg, { backgroundColor: currentStory.bgColor }]}>
            <Text style={styles.text}>{currentStory.text}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
};
```

### Feed with Virtual Scroll

```typescript
// apps/mobile/src/features/dashboard/components/FeedList.tsx
import { FlashList } from '@shopify/flash-list';

const FeedList = () => {
  const { data, fetchNextPage, hasNextPage, isFetching } = useFeed();

  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  const renderPost = ({ item }) => {
    switch (item.type) {
      case 'PHOTO':
        return <PhotoPost post={item} />;
      case 'POLL':
        return <PollPost post={item} />;
      case 'EVENT':
        return <EventPost post={item} />;
      default:
        return null;
    }
  };

  return (
    <FlashList
      data={posts}
      renderItem={renderPost}
      estimatedItemSize={400}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetching ? <Loading /> : null}
    />
  );
};
```

### Poll Component

```typescript
// apps/mobile/src/features/dashboard/components/PollPost.tsx
const PollPost = ({ post }) => {
  const { mutate: vote, isLoading } = usePoll(post.poll.id);
  const hasVoted = post.poll.userVote !== null;

  return (
    <PostCard post={post}>
      <Text style={styles.question}>{post.poll.question}</Text>

      {post.poll.options.map((option) => {
        const percentage = hasVoted
          ? Math.round((option.votes / post.poll.totalVotes) * 100)
          : 0;

        return (
          <Pressable
            key={option.id}
            onPress={() => !hasVoted && vote(option.id)}
            disabled={hasVoted || isLoading}
            style={styles.option}
          >
            {hasVoted && (
              <Animated.View
                style={[styles.progress, { width: `${percentage}%` }]}
              />
            )}
            <Text style={styles.optionText}>{option.text}</Text>
            {hasVoted && (
              <Text style={styles.percentage}>{percentage}%</Text>
            )}
            {post.poll.userVote === option.id && (
              <Icon name="Check" />
            )}
          </Pressable>
        );
      })}

      <Text style={styles.totalVotes}>
        {post.poll.totalVotes} votos
      </Text>
    </PostCard>
  );
};
```

### Verified Badge

```typescript
// apps/mobile/src/features/dashboard/components/VerifiedBadge.tsx
const VerifiedBadge = ({ size = 'sm' }) => {
  const sizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <View style={[styles.badge, { width: sizes[size], height: sizes[size] }]}>
      <Icon
        name="SealCheck"
        weight="fill"
        color="#FFD700"
        size={sizes[size]}
      />
    </View>
  );
};

// Uso no PostCard
const PostCard = ({ post, children }) => (
  <Card>
    <View style={styles.header}>
      <Avatar source={{ uri: post.user.avatarUrl }} />
      <View>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{post.user.name}</Text>
          {post.user.isVerified && <VerifiedBadge />}
        </View>
        <Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text>
      </View>
    </View>
    {children}
    <PostActions post={post} />
  </Card>
);
```

---

## Tipos de Post

| Tipo | Descrição | Pontos |
|------|-----------|--------|
| PHOTO | Foto + legenda | 5 pts (1º do dia) |
| POLL | Enquete | 5 pts (1º do dia) |
| EVENT | Auto-gerado ao criar evento | - |

---

## Regras de Negócio

### Stories
- Duração: **24 horas**
- Tipos: IMAGE, VIDEO, TEXT
- Ordem: Não vistos primeiro
- Ring colorido indica não visto

### Feed
- Algoritmo: Cronológico reverso
- Pontos: 5 pts no primeiro post do dia
- Limite: Máximo 10 posts/dia

### Moderação
- Razões: SPAM, INAPPROPRIATE, HARASSMENT, MISINFORMATION, OTHER
- Ações: Ignorar, Remover, Suspender usuário
- Suspensão: Temporária (dias) ou permanente

### Badge Verificado
- Aparece em: Perfil, posts, stories, comentários
- Requisito: Assinatura ativa
- Visual: Check dourado (#FFD700)

---

## Critérios de Verificação

- [ ] Ver dashboard com todas as seções
- [ ] Ver card de pontos com mini gráfico
- [ ] Navegar pelos atalhos rápidos
- [ ] Ver stories dos seguidos
- [ ] Criar story (foto/vídeo/texto)
- [ ] Navegar entre stories (tap esquerda/direita)
- [ ] Progresso automático dos stories
- [ ] Ver feed de posts
- [ ] Criar post com foto
- [ ] Criar enquete
- [ ] Votar em enquete
- [ ] Ver resultados da enquete
- [ ] Curtir post
- [ ] Comentar em post
- [ ] Ver badge verificado em posts
- [ ] Reportar conteúdo
- [ ] Admin: ver fila de moderação
- [ ] Admin: aprovar/rejeitar denúncia
- [ ] Admin: suspender usuário
