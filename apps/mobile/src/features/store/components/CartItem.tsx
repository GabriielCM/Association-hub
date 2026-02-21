import { Pressable, StyleSheet, Image } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Storefront } from '@ahub/ui/src/icons';

import { formatPoints, formatCurrency } from '@ahub/shared/utils';
import { QuantityControl } from './QuantityControl';
import { useStoreTheme } from '../hooks/useStoreTheme';
import type { CartItemData } from '@ahub/shared/types';
import { X } from 'phosphor-react-native';
interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  disabled?: boolean;
  unavailable?: boolean;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  disabled = false,
  unavailable = false,
}: CartItemProps) {
  const st = useStoreTheme();

  return (
    <XStack
      gap="$3"
      paddingVertical="$2"
      paddingHorizontal="$4"
      style={unavailable ? [styles.unavailableRow, {
        backgroundColor: st.unavailableBg,
        borderLeftColor: '#EF4444',
      }] : undefined}
    >
      {/* Thumbnail */}
      {item.product.imageUrl ? (
        <Image
          source={{ uri: item.product.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: st.placeholderBg }]}>
          <Icon icon={Storefront} size="lg" color="muted" />
        </View>
      )}

      {/* Details */}
      <YStack flex={1} gap="$1">
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1} gap={2}>
            <Text weight="semibold" size="sm" numberOfLines={2} style={{ color: st.textPrimary }}>
              {item.product.name}
            </Text>
            {item.variant && (
              <Text size="xs" style={{ color: st.textSecondary }}>
                {item.variant.name}
              </Text>
            )}
          </YStack>

          <Pressable
            onPress={() => onRemove(item.id)}
            disabled={disabled}
            hitSlop={8}
            style={styles.removeButton}
          >
            <Icon icon={X} size="sm" color={st.iconColor} />
          </Pressable>
        </XStack>

        <XStack justifyContent="space-between" alignItems="center">
          <QuantityControl
            value={item.quantity}
            onChange={(qty) => onUpdateQuantity(item.id, qty)}
            disabled={disabled}
          />

          <YStack alignItems="flex-end">
            {item.totalPoints > 0 && (
              <Text weight="bold" size="sm" style={{ color: st.accent }}>
                {formatPoints(item.totalPoints)} pts
              </Text>
            )}
            {item.totalMoney > 0 && (
              <Text size="xs" style={{ color: st.textSecondary }}>
                {formatCurrency(item.totalMoney)}
              </Text>
            )}
          </YStack>
        </XStack>

        {unavailable && (
          <Text size="xs" color="error">
            Este item não está mais disponível
          </Text>
        )}
      </YStack>
    </XStack>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    padding: 4,
  },
  unavailableRow: {
    borderLeftWidth: 3,
  },
});
