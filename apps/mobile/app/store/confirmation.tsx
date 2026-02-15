import { StyleSheet } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Heading, Card, Button } from '@ahub/ui';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';

export default function ConfirmationScreen() {
  const { orderId, orderCode, pointsUsed, moneyPaid, cashbackEarned } =
    useLocalSearchParams<{
      orderId?: string;
      orderCode?: string;
      pointsUsed?: string;
      moneyPaid?: string;
      cashbackEarned?: string;
    }>();

  const pointsNum = pointsUsed ? Number(pointsUsed) : 0;
  const moneyNum = moneyPaid ? Number(moneyPaid) : 0;
  const cashbackNum = cashbackEarned ? Number(cashbackEarned) : 0;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} padding="$6" justifyContent="center" alignItems="center" gap="$6">
        {/* Success icon */}
        <YStack
          width={80}
          height={80}
          borderRadius={40}
          backgroundColor="#DCFCE7"
          alignItems="center"
          justifyContent="center"
        >
          <Text size="2xl">✓</Text>
        </YStack>

        <YStack gap="$2" alignItems="center">
          <Heading level={3}>Pedido confirmado!</Heading>
          <Text size="sm" color="secondary" align="center">
            Seu pedido foi realizado com sucesso
          </Text>
        </YStack>

        {/* Order code card */}
        {orderCode ? (
          <Card variant="flat">
            <YStack gap="$2" alignItems="center" paddingVertical="$2">
              <Text size="xs" color="secondary">
                Codigo do pedido
              </Text>
              <Text
                weight="bold"
                size="xl"
                style={styles.orderCode}
              >
                {orderCode}
              </Text>
              <Text size="xs" color="secondary">
                Apresente este codigo para retirada
              </Text>
            </YStack>
          </Card>
        ) : null}

        {/* Payment details */}
        <Card variant="flat">
          <YStack gap="$3">
            {pointsNum > 0 && (
              <XStack justifyContent="space-between" alignItems="center">
                <Text size="sm" color="secondary">
                  Pontos utilizados
                </Text>
                <Text size="sm" weight="semibold" color="accent">
                  {formatPoints(pointsNum)} pts
                </Text>
              </XStack>
            )}

            {moneyNum > 0 && (
              <XStack justifyContent="space-between" alignItems="center">
                <Text size="sm" color="secondary">
                  Valor pago
                </Text>
                <Text size="sm" weight="semibold">
                  {formatCurrency(moneyNum)}
                </Text>
              </XStack>
            )}

            {cashbackNum > 0 && (
              <XStack justifyContent="space-between" alignItems="center">
                <Text size="sm" color="secondary">
                  Cashback recebido
                </Text>
                <Text size="sm" weight="bold" color="accent">
                  +{formatPoints(cashbackNum)} pts
                </Text>
              </XStack>
            )}
          </YStack>
        </Card>

        {/* Action buttons */}
        <YStack gap="$3" width="100%">
          {orderId ? (
            <Button
              onPress={() =>
                router.replace({
                  pathname: '/orders/[id]' as any,
                  params: { id: orderId },
                })
              }
            >
              Ver pedido
            </Button>
          ) : null}
          <Button
            variant="outline"
            onPress={() => router.replace('/store' as any)}
          >
            Continuar comprando
          </Button>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  orderCode: {
    fontFamily: 'monospace',
    letterSpacing: 3,
  },
});
