import { Pressable, StyleSheet, Image } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Storefront } from '@ahub/ui/src/icons';
import X from 'phosphor-react-native/src/icons/X';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';
import { QuantityControl } from './QuantityControl';
import type { CartItemData } from '@ahub/shared/types';

interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  disabled?: boolean;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  disabled = false,
}: CartItemProps) {
  return (
    <XStack gap="$3" paddingVertical="$2" paddingHorizontal="$4">
      {/* Thumbnail */}
      {item.product.imageUrl ? (
        <Image
          source={{ uri: item.product.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Icon icon={Storefront} size="lg" color="muted" />
        </View>
      )}

      {/* Details */}
      <YStack flex={1} gap="$1">
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1} gap={2}>
            <Text weight="semibold" size="sm" numberOfLines={2}>
              {item.product.name}
            </Text>
            {item.variant && (
              <Text size="xs" color="secondary">
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
            <Icon icon={X} size="sm" color="secondary" />
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
              <Text color="accent" weight="bold" size="sm">
                {formatPoints(item.totalPoints)} pts
              </Text>
            )}
            {item.totalMoney > 0 && (
              <Text size="xs" color="secondary">
                {formatCurrency(item.totalMoney)}
              </Text>
            )}
          </YStack>
        </XStack>
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
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    padding: 4,
  },
});
