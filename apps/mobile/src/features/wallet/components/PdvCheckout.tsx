import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Heading, Button, Spinner, Card } from '@ahub/ui';
import { formatPoints } from '@ahub/shared/utils';
import type { PdvCheckoutDetails, PdvCheckoutItem } from '@ahub/shared/types';

type PaymentMethod = 'points' | 'pix';

interface PdvCheckoutProps {
  checkout: PdvCheckoutDetails;
  isPaying: boolean;
  onPay: () => void;
  onPayPix: () => void;
  onCancel: () => void;
}

export function PdvCheckout({
  checkout,
  isPaying,
  onPay,
  onPayPix,
  onCancel,
}: PdvCheckoutProps) {
  const { items, totalPoints, totalMoney, pdv, user } = checkout;
  const [method, setMethod] = useState<PaymentMethod>('points');

  const hasMoneyPrice = totalMoney > 0;

  return (
    <YStack flex={1} gap="$4">
      {/* PDV Info */}
      <YStack gap={4} alignItems="center">
        <Text style={{ fontSize: 32 }}>🏪</Text>
        <Heading level={4}>{pdv.name}</Heading>
        <Text color="secondary" size="sm">{pdv.location}</Text>
      </YStack>

      {/* Items */}
      <Card variant="flat">
        <YStack gap="$2">
          <Text weight="semibold" size="sm">Itens</Text>
          {items.map((item, index) => (
            <CheckoutItemRow key={`${item.product_id}-${index}`} item={item} />
          ))}
        </YStack>
      </Card>

      {/* Total */}
      <Card variant="flat" style={styles.totalCard}>
        <XStack justifyContent="space-between" alignItems="center">
          <Text weight="semibold">Total</Text>
          <YStack alignItems="flex-end">
            <Heading level={3}>{formatPoints(totalPoints)} pts</Heading>
            {hasMoneyPrice && (
              <Text size="sm" color="secondary">
                ou R$ {totalMoney.toFixed(2)}
              </Text>
            )}
          </YStack>
        </XStack>
      </Card>

      {/* Payment Method Selector */}
      {hasMoneyPrice && (
        <Card variant="flat">
          <YStack gap="$2">
            <Text weight="semibold" size="sm">Forma de pagamento</Text>
            <XStack gap="$2">
              <Pressable
                onPress={() => setMethod('points')}
                style={[
                  styles.methodButton,
                  method === 'points' && styles.methodButtonActive,
                ]}
              >
                <Text
                  size="sm"
                  weight={method === 'points' ? 'semibold' : 'regular'}
                  align="center"
                >
                  Pontos
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMethod('pix')}
                style={[
                  styles.methodButton,
                  method === 'pix' && styles.methodButtonActive,
                ]}
              >
                <Text
                  size="sm"
                  weight={method === 'pix' ? 'semibold' : 'regular'}
                  align="center"
                >
                  PIX
                </Text>
              </Pressable>
            </XStack>
          </YStack>
        </Card>
      )}

      {/* Balance Preview (Points) */}
      {method === 'points' && (
        <Card variant="flat">
          <YStack gap="$1">
            <XStack justifyContent="space-between">
              <Text color="secondary" size="sm">Saldo atual</Text>
              <Text size="sm">{formatPoints(user.balance)} pts</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text color="secondary" size="sm">Após pagamento</Text>
              <Text
                size="sm"
                weight="semibold"
                color={user.canPayWithPoints ? undefined : 'error'}
              >
                {formatPoints(user.balance - totalPoints)} pts
              </Text>
            </XStack>
          </YStack>
        </Card>
      )}

      {/* PIX Info */}
      {method === 'pix' && (
        <Card variant="flat">
          <YStack gap="$1">
            <XStack justifyContent="space-between">
              <Text color="secondary" size="sm">Valor PIX</Text>
              <Text size="sm" weight="semibold">
                R$ {totalMoney.toFixed(2)}
              </Text>
            </XStack>
            <Text size="xs" color="secondary">
              Voce sera redirecionado para a tela de pagamento PIX
            </Text>
          </YStack>
        </Card>
      )}

      {/* Actions */}
      <YStack gap="$2" marginTop="auto">
        {method === 'points' && !user.canPayWithPoints && (
          <Text color="error" size="sm" align="center">
            Saldo insuficiente para este pagamento
          </Text>
        )}
        <Button
          onPress={method === 'points' ? onPay : onPayPix}
          disabled={(method === 'points' && !user.canPayWithPoints) || isPaying}
          opacity={
            (method === 'pix' || user.canPayWithPoints) && !isPaying ? 1 : 0.5
          }
        >
          {isPaying ? (
            <XStack gap="$2" alignItems="center">
              <Spinner size="sm" />
              <Text style={{ color: '#fff' }}>Processando...</Text>
            </XStack>
          ) : method === 'points' ? (
            'Pagar com Pontos'
          ) : (
            'Pagar com PIX'
          )}
        </Button>
        <Button variant="outline" onPress={onCancel} disabled={isPaying}>
          Cancelar
        </Button>
      </YStack>
    </YStack>
  );
}

function CheckoutItemRow({ item }: { item: PdvCheckoutItem }) {
  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical={4}>
      <XStack gap="$2" flex={1}>
        <Text size="sm" color="secondary">{item.quantity}x</Text>
        <Text size="sm" numberOfLines={1} flex={1}>{item.name}</Text>
      </XStack>
      <Text size="sm" weight="medium">
        {formatPoints(item.unit_price_points * item.quantity)} pts
      </Text>
    </XStack>
  );
}

const styles = StyleSheet.create({
  totalCard: {
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  methodButtonActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F0FF',
  },
});
