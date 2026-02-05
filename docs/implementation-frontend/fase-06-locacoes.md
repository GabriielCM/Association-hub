# Fase 6: Locações (Espaços + Reservas)

**Complexidade:** Média
**Duração estimada:** 2 semanas
**Dependências:** Fase 5

## Objetivo

Implementar sistema de locação de espaços:
- Listagem de espaços disponíveis
- Formulário de reserva (dia, turno ou hora)
- Workflow de aprovação
- Fila de espera com notificações

---

## Arquivos para Ler Antes de Implementar

### Documentação
```
docs/09-espacos/spec.md
docs/09-espacos/api.md
docs/09-espacos/acceptance-criteria.md
docs/10-reservas/spec.md
docs/10-reservas/api.md
docs/10-reservas/acceptance-criteria.md
```

### Backend (DTOs de referência)
```
apps/api/src/modules/spaces/dto/
apps/api/src/modules/spaces/spaces.controller.ts
apps/api/src/modules/bookings/dto/
apps/api/src/modules/bookings/bookings.controller.ts
```

---

## Arquivos para Criar

### Mobile - Espaços e Reservas

#### Screens
```
apps/mobile/src/features/spaces/screens/
├── SpacesScreen.tsx               # Lista de espaços
├── SpaceDetailScreen.tsx          # Detalhes do espaço
├── BookingScreen.tsx              # Formulário de reserva
├── MyBookingsScreen.tsx           # Minhas reservas
└── BookingDetailScreen.tsx        # Detalhes da reserva
```

#### Components
```
apps/mobile/src/features/spaces/components/
├── SpaceCard.tsx                  # Card de espaço
├── SpaceGallery.tsx               # Galeria de fotos
├── SpaceInfo.tsx                  # Capacidade, amenidades
├── CalendarPicker.tsx             # Seletor de data
├── ShiftPicker.tsx                # Manhã/Tarde/Noite
├── HourPicker.tsx                 # Range de horas
├── BookingStatus.tsx              # Badge de status
├── WaitlistButton.tsx             # Entrar na fila
└── WaitlistPosition.tsx           # Posição na fila
```

#### Hooks
```
apps/mobile/src/features/spaces/hooks/
├── useSpaces.ts                   # Lista de espaços
├── useSpace.ts                    # Espaço único
├── useAvailability.ts             # Disponibilidade
├── useBooking.ts                  # Criar reserva
├── useMyBookings.ts               # Minhas reservas
└── useWaitlist.ts                 # Fila de espera
```

#### API
```
apps/mobile/src/features/spaces/api/
├── spaces.api.ts
└── bookings.api.ts
```

---

### Web Admin - Espaços

#### Components
```
apps/web/src/features/spaces/components/
├── SpacesTable.tsx                # Tabela de espaços
├── CreateSpaceForm.tsx            # Criar/editar espaço
├── BlockDatesForm.tsx             # Bloquear datas
├── BookingsCalendar.tsx           # Calendário de reservas
├── PendingBookings.tsx            # Fila de aprovação
└── BookingActions.tsx             # Aprovar/rejeitar
```

#### Pages
```
apps/web/src/features/spaces/pages/
├── SpacesPage.tsx
└── BookingsPage.tsx
```

---

## Endpoints da API

### Espaços
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/spaces` | Listar espaços |
| GET | `/spaces/:id` | Detalhes do espaço |
| GET | `/spaces/:id/availability` | Disponibilidade |
| GET | `/spaces/:id/images` | Imagens |

### Reservas - Usuário
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/bookings/my` | Minhas reservas |
| GET | `/bookings/:id` | Detalhes da reserva |
| POST | `/bookings` | Criar reserva |
| DELETE | `/bookings/:id` | Cancelar reserva |
| POST | `/bookings/:id/waitlist` | Entrar na fila |
| DELETE | `/bookings/:id/waitlist` | Sair da fila |
| GET | `/bookings/:id/waitlist/position` | Posição na fila |

### Espaços - Admin
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/spaces` | Todos os espaços |
| POST | `/admin/spaces` | Criar espaço |
| PUT | `/admin/spaces/:id` | Atualizar espaço |
| DELETE | `/admin/spaces/:id` | Excluir espaço |
| POST | `/admin/spaces/:id/block` | Bloquear datas |
| DELETE | `/admin/spaces/:id/block/:blockId` | Desbloquear |

### Reservas - Admin
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/bookings` | Todas as reservas |
| GET | `/admin/bookings/pending` | Pendentes |
| POST | `/admin/bookings/:id/approve` | Aprovar |
| POST | `/admin/bookings/:id/reject` | Rejeitar |
| GET | `/admin/bookings/calendar` | Calendário |

---

## Especificações Técnicas

### Tipos de Período

```typescript
type BookingPeriodType = 'DAY' | 'SHIFT' | 'HOUR';

interface Space {
  id: string;
  name: string;
  periodType: BookingPeriodType;
  // Se HOUR:
  minHours?: number;
  maxHours?: number;
  // Se SHIFT:
  shifts?: {
    morning: { start: '08:00', end: '12:00' };
    afternoon: { start: '13:00', end: '17:00' };
    evening: { start: '18:00', end: '22:00' };
  };
}
```

### Calendar Picker

```typescript
// apps/mobile/src/features/spaces/components/CalendarPicker.tsx
import { Calendar } from 'react-native-calendars';

const CalendarPicker = ({
  spaceId,
  onDateSelect
}: Props) => {
  const { data: availability } = useAvailability(spaceId);

  const markedDates = useMemo(() => {
    const marks: MarkedDates = {};

    availability?.forEach(date => {
      if (date.isBlocked) {
        marks[date.date] = { disabled: true, disableTouchEvent: true };
      } else if (date.isBooked) {
        marks[date.date] = {
          marked: true,
          dotColor: 'red',
          // Pode ter fila de espera
          waitlist: date.hasWaitlist,
        };
      }
    });

    return marks;
  }, [availability]);

  return (
    <Calendar
      markedDates={markedDates}
      onDayPress={onDateSelect}
      minDate={new Date().toISOString().split('T')[0]}
      theme={{
        todayTextColor: '#8B5CF6',
        selectedDayBackgroundColor: '#8B5CF6',
      }}
    />
  );
};
```

### Shift Picker

```typescript
// apps/mobile/src/features/spaces/components/ShiftPicker.tsx
const ShiftPicker = ({
  shifts,
  availability,
  onSelect
}: Props) => {
  return (
    <View style={styles.container}>
      {Object.entries(shifts).map(([key, shift]) => {
        const isAvailable = availability[key];
        const isSelected = selected === key;

        return (
          <Pressable
            key={key}
            onPress={() => isAvailable && onSelect(key)}
            style={[
              styles.shift,
              !isAvailable && styles.unavailable,
              isSelected && styles.selected,
            ]}
          >
            <Text style={styles.label}>
              {key === 'morning' && 'Manhã'}
              {key === 'afternoon' && 'Tarde'}
              {key === 'evening' && 'Noite'}
            </Text>
            <Text style={styles.time}>
              {shift.start} - {shift.end}
            </Text>
            {!isAvailable && (
              <Badge variant="error">Indisponível</Badge>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};
```

### Waitlist Flow

```typescript
// apps/mobile/src/features/spaces/hooks/useWaitlist.ts
export const useWaitlist = (bookingId: string) => {
  const joinWaitlist = useMutation({
    mutationFn: () => api.post(`/bookings/${bookingId}/waitlist`),
    onSuccess: () => {
      queryClient.invalidateQueries(['booking', bookingId]);
      // Notificação será enviada quando posição mudar
    },
  });

  const leaveWaitlist = useMutation({
    mutationFn: () => api.delete(`/bookings/${bookingId}/waitlist`),
  });

  const { data: position } = useQuery({
    queryKey: ['waitlist-position', bookingId],
    queryFn: () => api.get(`/bookings/${bookingId}/waitlist/position`),
  });

  return { joinWaitlist, leaveWaitlist, position };
};
```

---

## Regras de Negócio

### Espaços
- 3 tipos de período: DIA, TURNO, HORA
- Datas podem ser bloqueadas pelo admin
- Imagens e descrição configuráveis

### Reservas
- Workflow: Solicitação → Aprovação/Rejeição
- Reserva pendente **bloqueia** a data
- Privacidade: esconde quem reservou
- Descontos de assinatura aplicam aqui

### Fila de Espera
- Notificação quando posição mudar
- Notificação quando vaga abrir
- Posição visível ao usuário

---

## Critérios de Verificação

- [ ] Listar espaços disponíveis
- [ ] Ver detalhes do espaço
- [ ] Ver disponibilidade no calendário
- [ ] Selecionar data/turno/hora
- [ ] Criar reserva
- [ ] Ver minhas reservas
- [ ] Cancelar reserva
- [ ] Entrar na fila de espera
- [ ] Ver posição na fila
- [ ] Admin: criar/editar espaços
- [ ] Admin: bloquear datas
- [ ] Admin: aprovar/rejeitar reservas
- [ ] Admin: ver calendário de reservas
