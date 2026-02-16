import { useState } from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import * as Haptics from 'expo-haptics';
import { colors, glass } from '@ahub/ui/themes';
import type { SpaceDetail } from '@ahub/shared/types';

interface PeriodSelectorProps {
  space: SpaceDetail;
  selectedShift?: string;
  startTime?: string;
  endTime?: string;
  onShiftChange: (shift: string) => void;
  onTimeChange: (start: string, end: string) => void;
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, '0')}:00`,
);

export function PeriodSelector({
  space,
  selectedShift,
  startTime,
  endTime,
  onShiftChange,
  onTimeChange,
}: PeriodSelectorProps) {
  const [localStart, setLocalStart] = useState(startTime ?? space.openingTime ?? '08:00');
  const [localEnd, setLocalEnd] = useState(endTime ?? '');

  if (space.periodType === 'DAY') {
    return (
      <YStack gap="$2">
        <Text size="sm" color="secondary">
          Reserva para o dia inteiro
        </Text>
      </YStack>
    );
  }

  if (space.periodType === 'SHIFT' && space.shifts) {
    return (
      <YStack gap="$2">
        <Text weight="medium" size="sm">
          Selecione o turno
        </Text>
        <XStack flexWrap="wrap" gap="$2">
          {space.shifts.map((shift) => {
            const isSelected = selectedShift === shift.name;
            return (
              <Pressable
                key={shift.name}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  onShiftChange(shift.name);
                }}
                style={[
                  styles.shiftChip,
                  isSelected && styles.shiftChipSelected,
                ]}
              >
                <Text
                  size="sm"
                  weight={isSelected ? 'semibold' : 'regular'}
                  style={{ color: isSelected ? '#FFFFFF' : '#374151' }}
                >
                  {shift.name}
                </Text>
                <Text
                  size="xs"
                  style={{ color: isSelected ? '#E5E7EB' : '#9CA3AF' }}
                >
                  {shift.startTime} - {shift.endTime}
                </Text>
              </Pressable>
            );
          })}
        </XStack>
      </YStack>
    );
  }

  if (space.periodType === 'HOUR') {
    const availableHours = HOUR_OPTIONS.filter((h) => {
      if (space.openingTime && h < space.openingTime) return false;
      if (space.closingTime && h >= space.closingTime) return false;
      return true;
    });

    const endHours = availableHours.filter((h) => {
      if (h <= localStart) return false;
      if (space.minDuration) {
        const startIdx = availableHours.indexOf(localStart);
        const endIdx = availableHours.indexOf(h);
        if (endIdx - startIdx < space.minDuration) return false;
      }
      return true;
    });

    return (
      <YStack gap="$3">
        <Text weight="medium" size="sm">
          Selecione o horário
        </Text>

        <YStack gap="$2">
          <Text size="xs" color="secondary">
            Início
          </Text>
          <XStack flexWrap="wrap" gap="$1.5">
            {availableHours.map((h) => {
              const isSelected = localStart === h;
              return (
                <Pressable
                  key={`start-${h}`}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setLocalStart(h);
                    setLocalEnd('');
                    onTimeChange(h, '');
                  }}
                  style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                >
                  <Text
                    size="xs"
                    style={{ color: isSelected ? '#FFFFFF' : '#374151' }}
                  >
                    {h}
                  </Text>
                </Pressable>
              );
            })}
          </XStack>
        </YStack>

        {localStart && (
          <YStack gap="$2">
            <Text size="xs" color="secondary">
              Fim{space.minDuration ? ` (mín ${space.minDuration}h)` : ''}
            </Text>
            <XStack flexWrap="wrap" gap="$1.5">
              {endHours.map((h) => {
                const isSelected = localEnd === h;
                return (
                  <Pressable
                    key={`end-${h}`}
                    onPress={() => {
                      if (Platform.OS !== 'web') Haptics.selectionAsync();
                      setLocalEnd(h);
                      onTimeChange(localStart, h);
                    }}
                    style={[
                      styles.timeChip,
                      isSelected && styles.timeChipSelected,
                    ]}
                  >
                    <Text
                      size="xs"
                      style={{ color: isSelected ? '#FFFFFF' : '#374151' }}
                    >
                      {h}
                    </Text>
                  </Pressable>
                );
              })}
            </XStack>
          </YStack>
        )}
      </YStack>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  shiftChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: glass.borderLight,
    backgroundColor: glass.bgLightSubtle,
    alignItems: 'center',
  },
  shiftChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: glass.borderLight,
    backgroundColor: glass.bgLightSubtle,
  },
  timeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
});
