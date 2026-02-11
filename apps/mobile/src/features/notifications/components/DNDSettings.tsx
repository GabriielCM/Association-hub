import { useState, useCallback } from 'react';
import { Pressable, Switch, StyleSheet } from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { Text, Card } from '@ahub/ui';
import {
  useDndSettings,
  useUpdateDnd,
} from '../hooks/useNotificationSettings';
import type { DoNotDisturbSettings } from '@ahub/shared/types';

const DAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

export function DNDSettings() {
  const { data: dndSettings } = useDndSettings();
  const updateDnd = useUpdateDnd();

  const [localEnabled, setLocalEnabled] = useState(dndSettings?.enabled ?? false);
  const [localStartTime, setLocalStartTime] = useState(dndSettings?.startTime ?? '22:00');
  const [localEndTime, setLocalEndTime] = useState(dndSettings?.endTime ?? '08:00');
  const [localDays, setLocalDays] = useState<number[]>(
    dndSettings?.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6]
  );

  const handleToggle = useCallback(
    (value: boolean) => {
      setLocalEnabled(value);
      updateDnd.mutate({
        enabled: value,
        startTime: localStartTime,
        endTime: localEndTime,
        daysOfWeek: localDays,
      });
    },
    [localStartTime, localEndTime, localDays, updateDnd]
  );

  const handleDayToggle = useCallback(
    (day: number) => {
      const newDays = localDays.includes(day)
        ? localDays.filter((d) => d !== day)
        : [...localDays, day].sort();
      setLocalDays(newDays);

      if (localEnabled) {
        updateDnd.mutate({
          enabled: localEnabled,
          startTime: localStartTime,
          endTime: localEndTime,
          daysOfWeek: newDays,
        });
      }
    },
    [localDays, localEnabled, localStartTime, localEndTime, updateDnd]
  );

  return (
    <Card variant="flat">
      <YStack gap="$3" padding="$3">
        {/* Toggle */}
        <XStack alignItems="center" justifyContent="space-between">
          <YStack gap="$0.5" flex={1}>
            <Text weight="semibold" size="sm">
              Não Perturbe
            </Text>
            <Text color="secondary" size="xs">
              Silenciar notificações em horários específicos
            </Text>
          </YStack>
          <Switch
            value={localEnabled}
            onValueChange={handleToggle}
            trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
            thumbColor="#FFFFFF"
          />
        </XStack>

        {/* Time Range */}
        {localEnabled && (
          <>
            <XStack alignItems="center" gap="$3" justifyContent="center">
              <YStack alignItems="center" gap="$0.5">
                <Text color="secondary" size="xs">Início</Text>
                <View
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$md"
                  backgroundColor="$backgroundHover"
                >
                  <Text weight="semibold" size="lg">{localStartTime}</Text>
                </View>
              </YStack>
              <Text color="secondary" size="lg">→</Text>
              <YStack alignItems="center" gap="$0.5">
                <Text color="secondary" size="xs">Fim</Text>
                <View
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$md"
                  backgroundColor="$backgroundHover"
                >
                  <Text weight="semibold" size="lg">{localEndTime}</Text>
                </View>
              </YStack>
            </XStack>

            {/* Days of week */}
            <YStack gap="$1">
              <Text color="secondary" size="xs" weight="semibold">
                Dias ativos
              </Text>
              <XStack gap="$1" justifyContent="space-between">
                {DAYS.map((day) => {
                  const isActive = localDays.includes(day.value);
                  return (
                    <Pressable
                      key={day.value}
                      onPress={() => handleDayToggle(day.value)}
                    >
                      <View
                        width={36}
                        height={36}
                        borderRadius="$full"
                        backgroundColor={isActive ? '$primary' : '$backgroundHover'}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text
                          size="xs"
                          weight="semibold"
                          color={isActive ? 'white' : 'secondary'}
                        >
                          {day.label}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </XStack>
            </YStack>

            {dndSettings?.isActiveNow && (
              <XStack
                alignItems="center"
                gap="$1"
                padding="$2"
                borderRadius="$md"
                backgroundColor="rgba(139, 92, 246, 0.1)"
              >
                <Text size="sm">🌙</Text>
                <Text color="primary" size="xs" weight="semibold">
                  Não Perturbe está ativo agora
                </Text>
              </XStack>
            )}
          </>
        )}
      </YStack>
    </Card>
  );
}
