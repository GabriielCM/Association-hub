# Fase 4: Comunicação (Notificações + Mensagens)

**Complexidade:** Alta
**Duração estimada:** 2-3 semanas
**Dependências:** Fase 3

## Objetivo

Implementar sistema de comunicação:
- Push notifications (FCM para Android, APNs para iOS)
- Central de notificações com categorias
- Mensagens diretas e em grupo
- Indicadores de digitação e online
- WebSocket para tempo real

---

## Arquivos para Ler Antes de Implementar

### Documentação - Notificações
```
docs/07-notificacoes/spec.md
docs/07-notificacoes/api.md
docs/07-notificacoes/acceptance-criteria.md
```

### Documentação - Mensagens
```
docs/08-mensagens/spec.md
docs/08-mensagens/api.md
docs/08-mensagens/acceptance-criteria.md
```

### Backend (DTOs de referência)
```
apps/api/src/modules/notifications/dto/
apps/api/src/modules/notifications/notifications.controller.ts
apps/api/src/modules/notifications/notifications.gateway.ts
apps/api/src/modules/messages/dto/
apps/api/src/modules/messages/controllers/
apps/api/src/modules/messages/messages.gateway.ts
```

---

## Arquivos para Criar

### Mobile - Notificações

#### Screens
```
apps/mobile/src/features/notifications/screens/
├── NotificationsScreen.tsx        # Central de notificações
└── NotificationSettingsScreen.tsx # Configurações por categoria
```

#### Components
```
apps/mobile/src/features/notifications/components/
├── NotificationItem.tsx           # Item individual
├── NotificationGroup.tsx          # Grupo de notificações
├── NotificationBadge.tsx          # Badge contador
├── NotificationDropdown.tsx       # Dropdown no header
└── DNDSettings.tsx                # Do Not Disturb
```

#### Hooks
```
apps/mobile/src/features/notifications/hooks/
├── useNotifications.ts            # Query de notificações
├── useUnreadCount.ts              # Contagem não lidas
├── useNotificationSettings.ts     # Configurações
└── useNotificationWebSocket.ts    # Real-time
```

#### Services
```
apps/mobile/src/features/notifications/services/
├── push.service.ts                # FCM/APNs setup
└── notification.handler.ts        # Handler de recebimento
```

#### API
```
apps/mobile/src/features/notifications/api/
└── notifications.api.ts
```

---

### Mobile - Mensagens

#### Screens
```
apps/mobile/src/features/messages/screens/
├── ConversationsScreen.tsx        # Lista de conversas
├── ChatScreen.tsx                 # Tela de chat
├── NewConversationScreen.tsx      # Nova conversa
└── GroupInfoScreen.tsx            # Info do grupo
```

#### Components
```
apps/mobile/src/features/messages/components/
├── ConversationItem.tsx           # Item da lista
├── MessageBubble.tsx              # Balão de mensagem
├── MessageInput.tsx               # Input com mídia
├── TypingIndicator.tsx            # "Digitando..."
├── OnlineStatus.tsx               # Bolinha online/offline
├── ReactionPicker.tsx             # Picker de emoji
├── ImageMessage.tsx               # Mensagem com imagem
├── AudioMessage.tsx               # Mensagem de áudio
├── GroupAvatar.tsx                # Avatar múltiplo
└── ParticipantsList.tsx           # Lista de participantes
```

#### Hooks
```
apps/mobile/src/features/messages/hooks/
├── useConversations.ts            # Lista de conversas
├── useMessages.ts                 # Mensagens da conversa
├── useSendMessage.ts              # Enviar mensagem
├── useMessageWebSocket.ts         # Real-time
└── useTyping.ts                   # Indicador de digitação
```

#### API
```
apps/mobile/src/features/messages/api/
└── messages.api.ts
```

---

### Web Admin - Notificações

#### Components
```
apps/web/src/features/notifications/components/
├── NotificationCenter.tsx         # Central admin
└── BroadcastForm.tsx              # Enviar broadcast
```

---

## Endpoints da API

### Notificações
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/notifications` | Listar notificações |
| GET | `/notifications/unread-count` | Contagem por categoria |
| GET | `/notifications/:id` | Detalhes |
| POST | `/notifications/:id/read` | Marcar como lida |
| POST | `/notifications/read-all` | Marcar todas como lidas |
| POST | `/notifications/read-category/:cat` | Marcar categoria |
| POST | `/notifications/group/:key/read` | Marcar grupo |
| DELETE | `/notifications/:id` | Excluir |
| DELETE | `/notifications/clear` | Limpar lidas |
| GET | `/notifications/settings` | Configurações |
| GET | `/notifications/settings/:cat` | Config da categoria |
| PUT | `/notifications/settings/:cat` | Atualizar config |
| GET | `/notifications/dnd` | Do Not Disturb |
| PUT | `/notifications/dnd` | Atualizar DND |

### Conversas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/conversations` | Listar conversas |
| POST | `/conversations` | Criar conversa |
| GET | `/conversations/:id` | Detalhes |
| PUT | `/conversations/:id/settings` | Configurações |
| DELETE | `/conversations/:id` | Sair da conversa |
| POST | `/conversations/:id/read` | Marcar como lida |
| POST | `/conversations/:id/typing` | Indicar digitação |
| GET | `/conversations/:id/messages` | Listar mensagens |
| POST | `/conversations/:id/messages` | Enviar mensagem |

### Mensagens
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| DELETE | `/messages/:id` | Excluir mensagem |
| POST | `/messages/:id/reactions` | Adicionar reação |
| DELETE | `/messages/:id/reactions/:emoji` | Remover reação |

### Grupos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/conversations/:id/group` | Info do grupo |
| PUT | `/conversations/:id/group` | Atualizar grupo |
| POST | `/conversations/:id/group/participants` | Adicionar membros |
| DELETE | `/conversations/:id/group/participants/:userId` | Remover membro |
| POST | `/conversations/:id/group/admins` | Promover a admin |

---

## Especificações Técnicas

### Push Notifications Setup

```typescript
// apps/mobile/src/features/notifications/services/push.service.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    console.log('Push notifications require physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: EXPO_PROJECT_ID,
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // Enviar token para o backend
  await api.post('/notifications/device-token', {
    token: token.data,
    platform: Platform.OS,
  });

  return token.data;
};
```

### WebSocket para Mensagens

```typescript
// apps/mobile/src/features/messages/hooks/useMessageWebSocket.ts
import { io, Socket } from 'socket.io-client';

export const useMessageWebSocket = (conversationId: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    const socket = io(WS_URL, {
      auth: { token: getAccessToken() },
      transports: ['websocket'],
    });

    socket.emit('join:conversation', conversationId);

    socket.on('message:new', (message) => {
      queryClient.setQueryData(
        ['messages', conversationId],
        (old) => [...old, message]
      );
    });

    socket.on('message:deleted', (messageId) => {
      queryClient.setQueryData(
        ['messages', conversationId],
        (old) => old.filter(m => m.id !== messageId)
      );
    });

    socket.on('typing:start', (userId) => {
      setTypingUsers(prev => [...prev, userId]);
    });

    socket.on('typing:stop', (userId) => {
      setTypingUsers(prev => prev.filter(id => id !== userId));
    });

    socketRef.current = socket;

    return () => {
      socket.emit('leave:conversation', conversationId);
      socket.disconnect();
    };
  }, [conversationId]);

  const sendTyping = useCallback((isTyping: boolean) => {
    socketRef.current?.emit(
      isTyping ? 'typing:start' : 'typing:stop',
      conversationId
    );
  }, [conversationId]);

  return { typingUsers, sendTyping };
};
```

### Typing Indicator com Debounce

```typescript
// apps/mobile/src/features/messages/hooks/useTyping.ts
import { useDebouncedCallback } from 'use-debounce';

export const useTyping = (conversationId: string) => {
  const { sendTyping } = useMessageWebSocket(conversationId);
  const [isTyping, setIsTyping] = useState(false);

  const stopTyping = useDebouncedCallback(() => {
    setIsTyping(false);
    sendTyping(false);
  }, 2000);

  const handleTextChange = useCallback((text: string) => {
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      sendTyping(true);
    }
    stopTyping();
  }, [isTyping, sendTyping, stopTyping]);

  return { handleTextChange };
};
```

---

## Categorias de Notificação

| Categoria | Tipos |
|-----------|-------|
| **Social** | Likes, comentários, follows, menções |
| **Eventos** | Lembretes de check-in, atualizações |
| **Pontos** | Ganhos, perdas, transferências |
| **Reservas** | Aprovações, fila de espera |
| **Sistema** | Novas features, alertas |

---

## Regras de Negócio

### Notificações
- Push via FCM (Android) + APNs (iOS)
- Agrupamento/batching (janela de 1 hora)
- WebSocket para real-time
- "Do Not Disturb" configurável
- Histórico: últimas **500** notificações
- Marcar lida: individual/categoria/todas

### Mensagens
- Conversas diretas e em grupo
- Máximo **50 participantes** por grupo
- Indicador de digitação
- Status online/offline
- Reações com emoji
- Suporte a imagens e áudio

---

## Critérios de Verificação

- [ ] Receber push notification no dispositivo
- [ ] Ver central de notificações
- [ ] Marcar notificações como lidas
- [ ] Configurar preferências por categoria
- [ ] Configurar Do Not Disturb
- [ ] Ver lista de conversas
- [ ] Iniciar nova conversa
- [ ] Enviar e receber mensagens
- [ ] Ver indicador "digitando..."
- [ ] Ver status online/offline
- [ ] Reagir com emoji
- [ ] Criar grupo
- [ ] Adicionar/remover participantes
- [ ] Admin: enviar broadcast
