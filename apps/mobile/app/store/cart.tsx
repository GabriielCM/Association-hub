import { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Heading, Button, Spinner, ScreenHeader, Icon } from '@ahub/ui';
import { ShoppingCart } from '@ahub/ui/src/icons';
import {
  useCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from '@/features/store/hooks/useCart';
import { useStoreTheme } from '@/features/store/hooks/useStoreTheme';
import { CartItem } from '@/features/store/components/CartItem';
import { CartSummary } from '@/features/store/components/CartSummary';
import { CartExpirationTimer } from '@/features/store/components/CartExpirationTimer';

export default function CartScreen() {
  const st = useStoreTheme();
  const { addProductId, addVariantId, buyNow } = useLocalSearchParams<{
    addProductId?: string;
    addVariantId?: string;
    buyNow?: string;
  }>();
  const { data: cart, isLoading } = useCart();
  const addToCart = useAddToCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCartMutation = useClearCart();
  const addedRef = useRef(false);

  // Auto-add product if coming from product detail
  useEffect(() => {
    if (addProductId && !addedRef.current) {
      addedRef.current = true;
      addToCart.mutate(
        addVariantId
          ? { productId: addProductId, variantId: addVariantId, quantity: 1 }
          : { productId: addProductId, quantity: 1 },
        {
          onSuccess: () => {
            if (buyNow === 'true') {
              router.push('/store/checkout' as any);
            }
          },
        },
      );
    }
  }, [addProductId, addVariantId, addToCart, buyNow]);

  const handleExpired = () => {
    Alert.alert(
      'Reserva expirada',
      'O tempo de reserva do seu carrinho expirou. Os itens podem não estar mais disponíveis.',
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  const handleClear = () => {
    Alert.alert('Limpar carrinho', 'Tem certeza que deseja limpar o carrinho?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar',
        style: 'destructive',
        onPress: () => clearCartMutation.mutate(),
      },
    ]);
  };

  const isMutating =
    addToCart.isPending ||
    updateItem.isPending ||
    removeItem.isPending ||
    clearCartMutation.isPending;

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: st.screenBg }} edges={['top', 'bottom']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      </SafeAreaView>
    );
  }

  const hasItems = cart && cart.items.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: st.screenBg }} edges={['top', 'bottom']}>
      <YStack flex={1}>
        {/* Header */}
        <ScreenHeader
          onBack={() => router.back()}
          rightContent={
            hasItems ? (
              <Pressable onPress={handleClear} hitSlop={8}>
                <Text size="sm" color="error">
                  Limpar
                </Text>
              </Pressable>
            ) : undefined
          }
        >
          <XStack gap="$2" alignItems="center" flex={1}>
            <Heading level={4} style={{ color: st.textPrimary }}>Carrinho</Heading>
            {cart && cart.itemCount > 0 && (
              <Text size="sm" style={{ color: st.textSecondary }}>
                ({cart.itemCount})
              </Text>
            )}
          </XStack>
        </ScreenHeader>

        {/* Expiration timer */}
        {cart?.reservedUntil && (
          <CartExpirationTimer
            reservedUntil={cart.reservedUntil}
            onExpired={handleExpired}
          />
        )}

        {/* Cart content */}
        {!hasItems ? (
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            gap="$3"
            padding="$4"
          >
            <Icon icon={ShoppingCart} size="xl" color="muted" weight="duotone" />
            <Text weight="semibold" style={{ color: st.textPrimary }}>Carrinho vazio</Text>
            <Text size="sm" align="center" style={{ color: st.textSecondary }}>
              Adicione produtos da loja ao seu carrinho
            </Text>
            <Button
              onPress={() => router.back()}
              size="sm"
              variant="outline"
            >
              Explorar loja
            </Button>
          </YStack>
        ) : (
          <>
            <FlatList
              data={cart.items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CartItem
                  item={item}
                  onUpdateQuantity={(id, qty) =>
                    updateItem.mutate({ itemId: id, quantity: qty })
                  }
                  onRemove={(id) => {
                    if (cart.items.length === 1) {
                      Alert.alert(
                        'Remover item',
                        'Este é o último item do carrinho. Deseja removê-lo?',
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Remover',
                            style: 'destructive',
                            onPress: () => removeItem.mutate(id),
                          },
                        ],
                      );
                    } else {
                      removeItem.mutate(id);
                    }
                  }}
                  disabled={isMutating}
                />
              )}
              ItemSeparatorComponent={() => (
                <View style={[styles.separator, { backgroundColor: st.separatorColor }]} />
              )}
              contentContainerStyle={styles.list}
            />

            {/* Bottom bar */}
            <View style={[styles.bottomBar, {
              backgroundColor: st.bottomBarBg,
              borderTopColor: st.bottomBarBorder,
            }]}>
              <CartSummary
                subtotalPoints={cart.subtotalPoints}
                subtotalMoney={cart.subtotalMoney}
                itemCount={cart.itemCount}
              />
              <Button
                onPress={() => router.push('/store/checkout' as any)}
                disabled={isMutating}
                style={styles.checkoutButton}
              >
                Finalizar compra
              </Button>
            </View>
          </>
        )}
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  checkoutButton: {
    width: '100%',
  },
});
