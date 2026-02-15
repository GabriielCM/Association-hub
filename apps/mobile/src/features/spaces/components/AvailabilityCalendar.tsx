import { useState, useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text } from '@ahub/ui';
import { useSpaceAvailability } from '../hooks/useSpaces';
import type { AvailabilityStatus } from '@ahub/shared/types';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const STATUS_COLORS: Record<AvailabilityStatus, string> = {
  disponivel: '#22C55E',
  pendente: '#EAB308',
  ocupado: '#EF4444',
  bloqueado: '#9CA3AF',
  manutencao: '#F97316',
};

interface AvailabilityCalendarProps {
  spaceId: string;
  onSelectDate: (date: string) => void;
  onOccupiedDate: (date: string) => void;
}

function getMonthRange(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  return {
    startDate: firstDay.toISOString().split('T')[0] as string,
    endDate: lastDay.toISOString().split('T')[0] as string,
    firstDayOfWeek: firstDay.getDay(),
    daysInMonth: lastDay.getDate(),
  };
}

export function AvailabilityCalendar({
  spaceId,
  onSelectDate,
  onOccupiedDate,
}: AvailabilityCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const { startDate, endDate, firstDayOfWeek, daysInMonth } = useMemo(
    () => getMonthRange(year, month),
    [year, month],
  );

  const { data } = useSpaceAvailability(spaceId, startDate, endDate);

  const availMap = useMemo(() => {
    const map = new Map<string, AvailabilityStatus>();
    if (data?.availability) {
      for (const day of data.availability as any[]) {
        let status: AvailabilityStatus;
        if (day.status) {
          status = day.status;
        } else if (day.available) {
          status = 'disponivel';
        } else {
          switch (day.reason) {
            case 'booked': status = 'ocupado'; break;
            case 'blocked': status = 'bloqueado'; break;
            case 'blocked_weekday': status = 'bloqueado'; break;
            case 'maintenance': status = 'manutencao'; break;
            default: status = 'bloqueado';
          }
        }
        map.set(day.date, status);
      }
    }
    return map;
  }, [data]);

  const monthLabel = new Date(year, month).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const goToPrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDayPress = (dateStr: string, status: AvailabilityStatus | undefined) => {
    if (status === 'disponivel') {
      onSelectDate(dateStr);
    } else if (status === 'ocupado' || status === 'pendente') {
      onOccupiedDate(dateStr);
    }
  };

  const todayStr = today.toISOString().split('T')[0];

  const cells: Array<{ day: number; dateStr: string } | null> = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr });
  }

  return (
    <YStack gap="$3">
      {/* Month navigation */}
      <XStack justifyContent="space-between" alignItems="center">
        <Pressable onPress={goToPrevMonth} style={styles.navButton}>
          <Text size="lg">‹</Text>
        </Pressable>
        <Text weight="semibold" size="base" style={styles.monthLabel}>
          {monthLabel}
        </Text>
        <Pressable onPress={goToNextMonth} style={styles.navButton}>
          <Text size="lg">›</Text>
        </Pressable>
      </XStack>

      {/* Weekday headers */}
      <XStack>
        {WEEKDAYS.map((wd) => (
          <View key={wd} style={styles.cell}>
            <Text size="xs" color="secondary" style={styles.centered}>
              {wd}
            </Text>
          </View>
        ))}
      </XStack>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {cells.map((cell, idx) => {
          if (!cell) {
            return <View key={`empty-${idx}`} style={styles.cell} />;
          }

          const status = availMap.get(cell.dateStr);
          const isPast = cell.dateStr < (todayStr ?? '');
          const isToday = cell.dateStr === todayStr;
          const bgColor = isPast
            ? '#E5E7EB'
            : status
              ? STATUS_COLORS[status]
              : '#F9FAFB';
          const textColor = isPast || status === 'bloqueado' ? '#6B7280' : '#FFFFFF';

          return (
            <Pressable
              key={cell.dateStr}
              style={[
                styles.cell,
                styles.dayCell,
                { backgroundColor: bgColor },
                isToday && styles.todayBorder,
              ]}
              onPress={() => !isPast && handleDayPress(cell.dateStr, status)}
              disabled={isPast}
            >
              <Text
                size="xs"
                style={[
                  styles.centered,
                  { color: !status && !isPast ? '#374151' : textColor },
                ]}
              >
                {cell.day}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <XStack flexWrap="wrap" gap="$2" justifyContent="center">
        {([
          ['disponivel', 'Disponível'],
          ['pendente', 'Pendente'],
          ['ocupado', 'Ocupado'],
          ['bloqueado', 'Bloqueado'],
          ['manutencao', 'Manutenção'],
        ] as const).map(([key, label]) => (
          <XStack key={key} gap="$1" alignItems="center">
            <View
              style={[styles.legendDot, { backgroundColor: STATUS_COLORS[key] }]}
            />
            <Text size="xs" color="secondary">
              {label}
            </Text>
          </XStack>
        ))}
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  navButton: {
    padding: 8,
  },
  monthLabel: {
    textTransform: 'capitalize',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.285%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCell: {
    borderRadius: 6,
    margin: 1,
    width: '13.5%',
  },
  todayBorder: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  centered: {
    textAlign: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
