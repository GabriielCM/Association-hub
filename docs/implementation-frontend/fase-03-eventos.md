# Fase 3: Engajamento (Eventos)

**Complexidade:** Alta
**Duração estimada:** 2-3 semanas
**Dependências:** Fase 2

## Objetivo

Implementar o sistema de eventos:
- Lista de eventos com filtros
- Detalhes do evento e comentários
- Check-in por QR code dinâmico
- Animação de celebração
- Modo Display para TVs/Kiosks (WebSocket real-time)

---

## Arquivos para Ler Antes de Implementar

### Documentação
```
docs/04-eventos/spec.md
docs/04-eventos/api.md
docs/04-eventos/acceptance-criteria.md
docs/04-eventos/creation.md
docs/04-eventos/display.md
docs/04-eventos/checkin-system.md
docs/04-eventos/qr-code-security.md
docs/04-eventos/badges.md
docs/04-eventos/analytics.md
```

### Backend (DTOs de referência)
```
apps/api/src/modules/events/dto/
apps/api/src/modules/events/controllers/
apps/api/src/modules/events/events.gateway.ts
```

---

## Arquivos para Criar

### Mobile - Eventos

#### Screens
```
apps/mobile/src/features/events/screens/
├── EventsListScreen.tsx           # Lista com filtros
├── EventDetailScreen.tsx          # Detalhes do evento
├── CheckInScreen.tsx              # Fluxo de check-in
└── EventCommentsScreen.tsx        # Comentários
```

#### Components
```
apps/mobile/src/features/events/components/
├── EventCard.tsx                  # Card de preview
├── EventFilters.tsx               # Filtros (categoria, data)
├── EventHeader.tsx                # Header do detalhe
├── EventInfo.tsx                  # Data, local, pontos
├── CheckInProgress.tsx            # Progresso (1/3)
├── CheckInButton.tsx              # Botão de scan
├── CelebrationAnimation.tsx       # Confetti/sucesso
├── BadgeEarned.tsx                # Modal de badge ganho
├── CommentItem.tsx                # Comentário individual
└── CommentInput.tsx               # Input de comentário
```

#### Hooks
```
apps/mobile/src/features/events/hooks/
├── useEvents.ts                   # Query de eventos
├── useEvent.ts                    # Query de evento único
├── useCheckIn.ts                  # Mutation de check-in
├── useConfirmPresence.ts          # Mutation de confirmação
└── useEventComments.ts            # Query/mutation de comentários
```

#### API
```
apps/mobile/src/features/events/api/
└── events.api.ts
```

---

### Web Admin - Eventos

#### Components
```
apps/web/src/features/events/components/
├── EventsTable.tsx                # Lista de eventos admin
├── CreateEventForm.tsx            # Form multi-step
├── EventAnalytics.tsx             # Estatísticas real-time
├── CheckInsList.tsx               # Lista de check-ins
└── ManualCheckIn.tsx              # Check-in manual
```

#### Pages
```
apps/web/src/features/events/pages/
├── EventsPage.tsx                 # Lista de eventos
├── CreateEventPage.tsx            # Criar/editar evento
└── EventDetailPage.tsx            # Detalhes + analytics
```

---

### Web Display (TVs/Kiosks)

#### Pages
```
apps/web/app/display/[eventId]/
├── page.tsx                       # Página principal
└── components/
    ├── DisplayLayout.tsx          # Layout fullscreen
    ├── QRCodeRotating.tsx         # QR rotativo (1min)
    ├── CheckInCounter.tsx         # Contador real-time
    ├── EventBanner.tsx            # Banner do evento
    └── StatusIndicator.tsx        # Status do evento
```

#### Hooks
```
apps/web/src/features/display/hooks/
└── useDisplayWebSocket.ts         # Conexão WebSocket
```

---

## Endpoints da API

### Eventos - Usuário
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/events` | Listar eventos (paginado) |
| GET | `/events/:id` | Detalhes do evento |
| POST | `/events/:id/confirm` | Confirmar presença |
| DELETE | `/events/:id/confirm` | Remover confirmação |
| POST | `/events/:id/checkin` | Fazer check-in |
| GET | `/events/:id/comments` | Listar comentários |
| POST | `/events/:id/comments` | Criar comentário |

### Eventos - Admin
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/events` | Listar todos os eventos |
| POST | `/admin/events` | Criar evento |
| PUT | `/admin/events/:id` | Atualizar evento |
| DELETE | `/admin/events/:id` | Excluir evento |
| POST | `/admin/events/:id/publish` | Publicar evento |
| POST | `/admin/events/:id/cancel` | Cancelar evento |
| POST | `/admin/events/:id/pause` | Pausar/despausar |
| POST | `/admin/events/:id/checkin/manual` | Check-in manual |
| GET | `/admin/events/:id/analytics` | Analytics |
| GET | `/admin/events/:id/participants` | Lista de participantes |
| GET | `/admin/events/:id/export/csv` | Exportar CSV |

### Display
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/display/:eventId` | Página HTML |
| GET | `/display/:eventId/data` | Dados JSON (polling) |

---

## Especificações Técnicas

### QR Code Dinâmico (Rotação 1min)

```typescript
// Backend gera novo código a cada minuto
// Frontend valida com janela de 2 minutos

interface QRPayload {
  eventId: string;
  timestamp: number;
  code: string;      // Código rotativo
  hash: string;      // HMAC-SHA256
}

// Validação no backend:
// - Código deve ser o atual ou anterior (2min window)
// - Hash válido
// - Usuário não fez check-in ainda
// - Evento em andamento
```

### Animação de Celebração

```typescript
// apps/mobile/src/features/events/components/CelebrationAnimation.tsx
import ConfettiCannon from 'react-native-confetti-cannon';
import LottieView from 'lottie-react-native';

const CelebrationAnimation = ({ points, badge, onComplete }) => {
  return (
    <View style={styles.container}>
      <ConfettiCannon
        count={200}
        origin={{ x: width / 2, y: 0 }}
        fadeOut
      />

      <LottieView
        source={require('./success.json')}
        autoPlay
        loop={false}
        onAnimationFinish={onComplete}
      />

      <Text style={styles.points}>+{points} pontos!</Text>

      {badge && (
        <View style={styles.badge}>
          <Image source={{ uri: badge.iconUrl }} />
          <Text>Badge conquistado: {badge.name}</Text>
        </View>
      )}
    </View>
  );
};
```

### WebSocket para Display

```typescript
// apps/web/src/features/display/hooks/useDisplayWebSocket.ts
import { io } from 'socket.io-client';

export const useDisplayWebSocket = (eventId: string) => {
  const [data, setData] = useState<DisplayData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(WS_URL, {
      query: { eventId, type: 'display' },
      transports: ['websocket'],
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('qr:rotate', (newQR) => {
      setData(prev => ({ ...prev, qrCode: newQR }));
    });

    socket.on('checkin:new', (checkin) => {
      setData(prev => ({
        ...prev,
        checkInCount: prev.checkInCount + 1,
        recentCheckIns: [checkin, ...prev.recentCheckIns.slice(0, 4)],
      }));
    });

    socket.on('event:update', (event) => {
      setData(prev => ({ ...prev, event }));
    });

    return () => socket.disconnect();
  }, [eventId]);

  return { data, isConnected };
};
```

---

## Regras de Negócio

### Check-in
- QR code rotaciona a cada **1 minuto**
- Janela de validação: **2 minutos**
- **Um check-in** por usuário por evento
- Duplicatas são bloqueadas silenciosamente
- Pontos creditados **imediatamente**
- Check-in manual apenas por **admin**

### Eventos
- Status: DRAFT → PUBLISHED → ACTIVE → FINISHED / CANCELLED
- Pontos não são removidos se evento cancelado
- Badges auto-concedidos quando critério atingido

### Display
- Fullscreen para TVs
- Auto-refresh via WebSocket
- Fallback para polling se desconectar
- Funciona **offline** com cache

---

## Critérios de Verificação

- [ ] Listar eventos com filtros
- [ ] Ver detalhes do evento
- [ ] Confirmar/remover presença
- [ ] Escanear QR e fazer check-in
- [ ] Ver animação de celebração
- [ ] Ver badge ganho (se aplicável)
- [ ] Comentar em evento
- [ ] Admin: criar/editar/excluir evento
- [ ] Admin: publicar/cancelar/pausar evento
- [ ] Admin: check-in manual
- [ ] Admin: ver analytics em tempo real
- [ ] Display: QR rotativo funcionando
- [ ] Display: contador atualizando em tempo real
- [ ] Display: offline com cache
