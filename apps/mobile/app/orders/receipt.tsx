import { ScrollView, StyleSheet, Pressable, Share } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Heading, Button, Spinner, Card } from '@ahub/ui';
import { useOrderReceipt } from '@/features/orders/hooks/useOrders';

export default function ReceiptScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { data: receipt, isLoading, isError } = useOrderReceipt(orderId ?? '');

  const handleShare = async () => {
    if (!receipt) return;
    const lines = [
      `Comprovante ${receipt.receiptNumber}`,
      `Pedido: ${receipt.order.code}`,
      `Data: ${new Date(receipt.order.createdAt).toLocaleDateString('pt-BR')}`,
      '',
      'Itens:',
      ...receipt.items.map(
        (i) => `  ${i.quantity}x ${i.name} - ${i.total}`,
      ),
      '',
      `Subtotal: ${receipt.subtotal}`,
      receipt.payment.pointsUsed > 0
        ? `Pontos: ${receipt.payment.pointsUsed} pts`
        : '',
      receipt.payment.moneyPaid > 0
        ? `Valor: R$ ${(receipt.payment.moneyPaid / 100).toFixed(2)}`
        : '',
      receipt.payment.cashback > 0
        ? `Cashback: +${receipt.payment.cashback} pts`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    await Share.share({ message: lines });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      </SafeAreaView>
    );
  }

  if (isError || !receipt) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$3" padding="$4">
          <Text size="2xl">😔</Text>
          <Text weight="semibold">Comprovante nao encontrado</Text>
          <Button onPress={() => router.back()} size="sm">
            Voltar
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      {/* Header */}
      <XStack paddingHorizontal="$4" paddingVertical="$3" alignItems="center" gap="$3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text size="lg">←</Text>
        </Pressable>
        <Heading level={4}>Comprovante</Heading>
      </XStack>

      <ScrollView contentContainerStyle={styles.content}>
        <Card variant="flat">
          <YStack gap="$4" padding="$2">
            {/* Receipt header */}
            <YStack alignItems="center" gap="$1">
              <Text size="xs" color="secondary">
                {receipt.receiptNumber}
              </Text>
              <Heading level={4}>A-hub</Heading>
              <Text size="xs" color="secondary">
                Pedido #{receipt.order.code}
              </Text>
              <Text size="xs" color="secondary">
                {new Date(receipt.order.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </YStack>

            <View style={styles.separator} />

            {/* Customer */}
            <YStack gap="$1">
              <Text size="xs" color="secondary">
                Cliente
              </Text>
              <Text size="sm" weight="medium">
                {receipt.user.name}
              </Text>
              <Text size="xs" color="secondary">
                {receipt.user.email}
              </Text>
            </YStack>

            <View style={styles.separator} />

            {/* Items */}
            <YStack gap="$2">
              <XStack justifyContent="space-between">
                <Text size="xs" color="secondary" flex={1}>
                  Item
                </Text>
                <Text size="xs" color="secondary">
                  Total
                </Text>
              </XStack>
              {receipt.items.map((item, i) => (
                <XStack key={i} justifyContent="space-between" alignItems="center">
                  <Text size="sm" flex={1} numberOfLines={1}>
                    {item.quantity}x {item.name}
                  </Text>
                  <Text size="sm" weight="medium">
                    {item.total}
                  </Text>
                </XStack>
              ))}
            </YStack>

            <View style={styles.separator} />

            {/* Totals */}
            <YStack gap="$1">
              <XStack justifyContent="space-between">
                <Text size="sm" color="secondary">
                  Subtotal
                </Text>
                <Text size="sm">{receipt.subtotal}</Text>
              </XStack>
              {receipt.payment.pointsUsed > 0 && (
                <XStack justifyContent="space-between">
                  <Text size="sm" color="secondary">
                    Pontos
                  </Text>
                  <Text size="sm" color="accent" weight="semibold">
                    {receipt.payment.pointsUsed} pts
                  </Text>
                </XStack>
              )}
              {receipt.payment.moneyPaid > 0 && (
                <XStack justifyContent="space-between">
                  <Text size="sm" color="secondary">
                    Valor pago
                  </Text>
                  <Text size="sm" weight="semibold">
                    R$ {(receipt.payment.moneyPaid / 100).toFixed(2)}
                  </Text>
                </XStack>
              )}
              {receipt.payment.cashback > 0 && (
                <XStack justifyContent="space-between">
                  <Text size="sm" color="secondary">
                    Cashback
                  </Text>
                  <Text size="sm" color="accent" weight="bold">
                    +{receipt.payment.cashback} pts
                  </Text>
                </XStack>
              )}
            </YStack>

            {receipt.pickupLocation ? (
              <>
                <View style={styles.separator} />
                <YStack gap="$1">
                  <Text size="xs" color="secondary">
                    Local de retirada
                  </Text>
                  <Text size="sm">📍 {receipt.pickupLocation}</Text>
                </YStack>
              </>
            ) : null}
          </YStack>
        </Card>

        <Button variant="outline" onPress={handleShare}>
          Compartilhar comprovante
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});
