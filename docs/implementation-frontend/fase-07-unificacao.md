# Fase 7: Unificação (Pedidos + Suporte + Rankings)

**Complexidade:** Média
**Duração estimada:** 2-3 semanas
**Dependências:** Fase 6

## Objetivo

Implementar módulos de unificação:
- Histórico unificado de pedidos (Loja + PDV)
- Sistema de suporte (Tickets + FAQ + Chat)
- Rankings (Pontos, Eventos, Strava)

---

## Arquivos para Ler Antes de Implementar

### Documentação
```
docs/11-pedidos/spec.md
docs/11-pedidos/api.md
docs/11-pedidos/acceptance-criteria.md
docs/14-suporte/spec.md
docs/14-suporte/api.md
docs/14-suporte/acceptance-criteria.md
docs/13-rankings/spec.md
docs/13-rankings/api.md
docs/13-rankings/acceptance-criteria.md
docs/13-rankings/badges.md
```

### Backend (DTOs de referência)
```
apps/api/src/modules/orders/dto/
apps/api/src/modules/orders/orders.controller.ts
apps/api/src/modules/support/dto/
apps/api/src/modules/support/controllers/
apps/api/src/modules/rankings/dto/
apps/api/src/modules/rankings/rankings.controller.ts
```

---

## Arquivos para Criar

### Mobile - Pedidos

#### Screens
```
apps/mobile/src/features/orders/screens/
├── OrdersScreen.tsx               # Histórico unificado
├── OrderDetailScreen.tsx          # Detalhes do pedido
└── VoucherScreen.tsx              # Voucher digital
```

#### Components
```
apps/mobile/src/features/orders/components/
├── OrderCard.tsx                  # Card de pedido
├── OrderTimeline.tsx              # Timeline de status
├── OrderItems.tsx                 # Itens do pedido
├── VoucherCode.tsx                # Código do voucher
├── PickupQR.tsx                   # QR para retirada
└── ReceiptDownload.tsx            # Baixar recibo
```

#### Hooks
```
apps/mobile/src/features/orders/hooks/
├── useOrders.ts
└── useOrder.ts
```

#### API
```
apps/mobile/src/features/orders/api/
└── orders.api.ts
```

---

### Mobile - Suporte

#### Screens
```
apps/mobile/src/features/support/screens/
├── SupportScreen.tsx              # Home do suporte
├── FAQScreen.tsx                  # Lista de FAQs
├── TicketsScreen.tsx              # Meus tickets
├── CreateTicketScreen.tsx         # Criar ticket
├── TicketDetailScreen.tsx         # Conversa do ticket
└── LiveChatScreen.tsx             # Chat ao vivo
```

#### Components
```
apps/mobile/src/features/support/components/
├── FAQItem.tsx                    # Accordion FAQ
├── TicketCard.tsx                 # Card de ticket
├── TicketForm.tsx                 # Form de criação
├── TicketMessage.tsx              # Mensagem do ticket
├── ChatMessage.tsx                # Mensagem do chat
├── QueuePosition.tsx              # Posição na fila
├── RatingPrompt.tsx               # Avaliar atendimento
└── AttachmentPicker.tsx           # Upload de arquivos
```

#### Hooks
```
apps/mobile/src/features/support/hooks/
├── useFAQ.ts
├── useTickets.ts
├── useTicket.ts
└── useLiveChat.ts
```

#### API
```
apps/mobile/src/features/support/api/
└── support.api.ts
```

---

### Mobile - Rankings

#### Screens
```
apps/mobile/src/features/rankings/screens/
└── RankingsScreen.tsx             # Tela de rankings
```

#### Components
```
apps/mobile/src/features/rankings/components/
├── RankingTabs.tsx                # Tabs (Pontos/Eventos/Strava)
├── LeaderboardItem.tsx            # Item do ranking
├── PeriodPicker.tsx               # All-time/Mensal/Semanal
└── MyRank.tsx                     # Minha posição
```

#### Hooks
```
apps/mobile/src/features/rankings/hooks/
└── useRankings.ts
```

#### API
```
apps/mobile/src/features/rankings/api/
└── rankings.api.ts
```

---

### Web Admin - Pedidos

#### Components
```
apps/web/src/features/orders/components/
├── AllOrdersTable.tsx             # Tabela de pedidos
├── OrderActions.tsx               # Atualizar status
└── PickupValidator.tsx            # Validar QR de retirada
```

#### Pages
```
apps/web/src/features/orders/pages/
└── OrdersManagementPage.tsx
```

---

### Web Admin - Suporte

#### Components
```
apps/web/src/features/support/components/
├── TicketsQueue.tsx               # Fila de tickets
├── TicketResponse.tsx             # Responder ticket
├── LiveChatAgent.tsx              # Interface do agente
└── FAQManager.tsx                 # CRUD de FAQs
```

#### Pages
```
apps/web/src/features/support/pages/
├── SupportPage.tsx
└── FAQPage.tsx
```

---

## Endpoints da API

### Pedidos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/orders` | Meus pedidos |
| GET | `/orders/:id` | Detalhes do pedido |
| GET | `/orders/:id/receipt` | Recibo PDF |
| GET | `/orders/:id/voucher` | Código do voucher |

### Pedidos - Admin
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/orders` | Todos os pedidos |
| PUT | `/admin/orders/:id/status` | Atualizar status |
| POST | `/admin/orders/:id/validate-pickup` | Validar retirada |

### Suporte - FAQ
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/support/faq` | Listar FAQs |
| GET | `/support/faq/search` | Buscar FAQs |
| GET | `/support/faq/:id` | Detalhes |

### Suporte - Tickets
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/support/tickets` | Meus tickets |
| POST | `/support/tickets` | Criar ticket |
| GET | `/support/tickets/:id` | Detalhes |
| POST | `/support/tickets/:id/messages` | Enviar mensagem |
| POST | `/support/tickets/:id/close` | Fechar ticket |
| POST | `/support/tickets/:id/rate` | Avaliar |

### Suporte - Chat
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/support/chat/start` | Iniciar chat |
| GET | `/support/chat/:id` | Sessão do chat |
| POST | `/support/chat/:id/messages` | Enviar mensagem |
| POST | `/support/chat/:id/end` | Encerrar |
| POST | `/support/chat/:id/rate` | Avaliar |

### Rankings
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/rankings/points` | Ranking de pontos |
| GET | `/rankings/events` | Ranking de eventos |
| GET | `/rankings/strava` | Ranking de Strava |

---

## Especificações Técnicas

### Order Timeline

```typescript
// apps/mobile/src/features/orders/components/OrderTimeline.tsx
const OrderTimeline = ({ history }: Props) => {
  const steps = [
    { key: 'PENDING', label: 'Pendente' },
    { key: 'CONFIRMED', label: 'Confirmado' },
    { key: 'READY', label: 'Pronto' },
    { key: 'COMPLETED', label: 'Concluído' },
  ];

  return (
    <View style={styles.timeline}>
      {steps.map((step, index) => {
        const historyItem = history.find(h => h.status === step.key);
        const isCompleted = !!historyItem;
        const isCurrent = index === history.length - 1;

        return (
          <View key={step.key} style={styles.step}>
            <View style={[
              styles.dot,
              isCompleted && styles.dotCompleted,
              isCurrent && styles.dotCurrent,
            ]} />
            <Text style={styles.label}>{step.label}</Text>
            {historyItem && (
              <Text style={styles.date}>
                {formatDateTime(historyItem.createdAt)}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};
```

### FAQ Accordion

```typescript
// apps/mobile/src/features/support/components/FAQItem.tsx
const FAQItem = ({ item }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const height = useSharedValue(0);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    height.value = withTiming(isExpanded ? 0 : 1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: interpolate(height.value, [0, 1], [0, item.answerHeight]),
    opacity: height.value,
  }));

  return (
    <Card>
      <Pressable onPress={toggleExpand} style={styles.header}>
        <Text style={styles.question}>{item.question}</Text>
        <Icon name={isExpanded ? 'CaretUp' : 'CaretDown'} />
      </Pressable>
      <Animated.View style={[styles.answer, animatedStyle]}>
        <Text>{item.answer}</Text>
      </Animated.View>
    </Card>
  );
};
```

### Live Chat WebSocket

```typescript
// apps/mobile/src/features/support/hooks/useLiveChat.ts
export const useLiveChat = () => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  const startChat = async () => {
    const { data } = await api.post('/support/chat/start');
    setSession(data);

    const socket = io(WS_URL, {
      auth: { sessionId: data.id },
    });

    socket.on('queue:position', (position) => {
      setQueuePosition(position);
    });

    socket.on('agent:connected', (agent) => {
      setQueuePosition(null);
      setSession(prev => ({ ...prev, agent }));
    });

    socket.on('message:new', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('chat:ended', () => {
      setSession(prev => ({ ...prev, status: 'ended' }));
    });

    return socket;
  };

  return { session, messages, queuePosition, startChat };
};
```

### Rankings with Tabs

```typescript
// apps/mobile/src/features/rankings/components/RankingTabs.tsx
const RankingTabs = () => {
  const [activeTab, setActiveTab] = useState<'points' | 'events' | 'strava'>('points');
  const [period, setPeriod] = useState<'ALL_TIME' | 'MONTHLY' | 'WEEKLY'>('MONTHLY');

  const { data, isLoading } = useRankings(activeTab, period);

  return (
    <View>
      <SegmentedControl
        values={['Pontos', 'Eventos', 'Strava']}
        selectedIndex={['points', 'events', 'strava'].indexOf(activeTab)}
        onChange={(index) => setActiveTab(['points', 'events', 'strava'][index])}
      />

      <PeriodPicker value={period} onChange={setPeriod} />

      <MyRank ranking={data?.myRank} />

      <FlatList
        data={data?.rankings}
        renderItem={({ item }) => <LeaderboardItem item={item} />}
        keyExtractor={item => item.userId}
      />
    </View>
  );
};
```

---

## Regras de Negócio

### Pedidos
- Histórico unificado: Loja + PDV
- Timeline: Pending → Confirmed → Ready → Completed
- QR code para retirada (itens físicos)
- Voucher code (itens digitais)

### Suporte
- Categorias de ticket: BUG, SUGGESTION, QUESTION
- Chat ao vivo 24/7 com fila
- Avaliação após atendimento (1-5 estrelas)
- FAQ com busca

### Rankings
- 3 tipos: Pontos, Eventos (check-ins), Strava (km)
- Períodos: All-time, Mensal, Semanal
- Top 100 exibidos
- Posição do usuário sempre visível

---

## Critérios de Verificação

- [ ] Ver histórico de pedidos
- [ ] Ver detalhes do pedido com timeline
- [ ] Baixar recibo
- [ ] Ver voucher de item digital
- [ ] Ver lista de FAQs
- [ ] Buscar em FAQs
- [ ] Criar ticket de suporte
- [ ] Ver meus tickets
- [ ] Responder em ticket
- [ ] Fechar ticket
- [ ] Avaliar atendimento
- [ ] Iniciar chat ao vivo
- [ ] Ver posição na fila
- [ ] Conversar com agente
- [ ] Ver rankings por tipo
- [ ] Ver rankings por período
- [ ] Ver minha posição no ranking
- [ ] Admin: gerenciar pedidos
- [ ] Admin: responder tickets
- [ ] Admin: atender chat
- [ ] Admin: gerenciar FAQs
