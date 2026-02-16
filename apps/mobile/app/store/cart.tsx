import { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Heading, Button, Spinner, ScreenHeader } from '@ahub/ui';
import {
  useCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from '@/features/store/hooks/useCart';
import { CartItem } from '@/features/store/components/CartItem';
import { CartSummary } from '@/features/store/components/CartSummary';
import { CartExpirationTimer } from '@/features/store/components/CartExpirationTimer';

export default function CartScreen() {
  const { addProductId, addVariantId } = useLocalSearchParams<{
    addProductId?: string;
    addVariantId?: string;
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
      );
    }
  }, [addProductId, addVariantId, addToCart]);

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
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      </SafeAreaView>
    );
  }

  const hasItems = cart && cart.items.length > 0;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
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
            <Heading level={4}>Carrinho</Heading>
            {cart && cart.itemCount > 0 && (
              <Text size="sm" color="secondary">
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
            <Text size="2xl">🛒</Text>
            <Text weight="semibold">Carrinho vazio</Text>
            <Text color="secondary" size="sm" align="center">
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
                  onRemove={(id) => removeItem.mutate(id)}
                  disabled={isMutating}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.list}
            />

            {/* Bottom bar */}
            <View style={styles.bottomBar}>
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
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
    gap: 12,
  },
  checkoutButton: {
    width: '100%',
  },
});
