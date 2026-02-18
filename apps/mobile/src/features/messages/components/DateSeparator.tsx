import { memo } from 'react';
import { View } from 'tamagui';
import { Text } from '@ahub/ui';
import { GlassView } from './GlassView';
import { formatDateSeparator } from '../utils/dateFormatters';

interface DateSeparatorProps {
  date: string;
}

export const DateSeparator = memo(function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <View alignItems="center" paddingVertical="$2">
      <GlassView variant="date-chip" borderRadius={9999}>
        <View paddingHorizontal="$2" paddingVertical="$1">
          <Text size="xs" weight="medium" color="secondary">
            {formatDateSeparator(date)}
          </Text>
        </View>
      </GlassView>
    </View>
  );
});
