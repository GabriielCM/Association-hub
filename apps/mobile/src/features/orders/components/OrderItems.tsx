import { Image, StyleSheet } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Badge } from '@ahub/ui';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';
import type { OrderItem } from '@ahub/shared/types';

interface OrderItemsProps {
  items: OrderItem[];
}

export function OrderItems({ items }: OrderItemsProps) {
  return (
    <YStack gap="$3">
      <Text weight="semibold" size="sm">
        Itens do pedido
      </Text>
      {items.map((item) => (
        <OrderItemRow key={item.id} item={item} />
      ))}
    </YStack>
  );
}

function OrderItemRow({ item }: { item: OrderItem }) {
  return (
    <XStack gap="$3" alignItems="center">
      {item.productImage ? (
        <Image
          source={{ uri: item.productImage }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text size="lg">📦</Text>
        </View>
      )}

      <YStack flex={1} gap={2}>
        <XStack gap="$1" alignItems="center">
          <Text size="sm" weight="medium" numberOfLines={1} flex={1}>
            {item.productName}
          </Text>
          {item.type === 'VOUCHER' && (
            <Badge variant="info" size="sm">
              Voucher
            </Badge>
          )}
        </XStack>
        {item.variantName ? (
          <Text size="xs" color="secondary">
            {item.variantName}
          </Text>
        ) : null}
        <XStack justifyContent="space-between" alignItems="center">
          <Text size="xs" color="secondary">
            Qtd: {item.quantity}
          </Text>
          <XStack gap="$1">
            {item.totalPoints > 0 && (
              <Text size="xs" weight="semibold" color="accent">
                {formatPoints(item.totalPoints)} pts
              </Text>
            )}
            {item.totalMoney > 0 && (
              <Text size="xs" weight="semibold">
                {formatCurrency(item.totalMoney)}
              </Text>
            )}
          </XStack>
        </XStack>
      </YStack>
    </XStack>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  placeholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
