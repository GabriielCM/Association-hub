import { memo } from 'react';
import { useColorScheme } from 'react-native';
import { View } from 'tamagui';
import { Text } from '@ahub/ui';
import { messageGlass } from '@ahub/ui/themes';
import { formatDateSeparator } from '../utils/dateFormatters';

interface DateSeparatorProps {
  date: string;
}

export const DateSeparator = memo(function DateSeparator({ date }: DateSeparatorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View alignItems="center" paddingVertical="$2">
      <View
        paddingHorizontal="$2"
        paddingVertical="$1"
        borderRadius="$full"
        backgroundColor={isDark ? messageGlass.dateChipDark : messageGlass.dateChipLight}
      >
        <Text
          size="xs"
          weight="medium"
          style={{ color: isDark ? messageGlass.dateChipTextDark : messageGlass.dateChipTextLight }}
        >
          {formatDateSeparator(date)}
        </Text>
      </View>
    </View>
  );
});
