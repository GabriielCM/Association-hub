import { useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, Animated } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Heading, Card, Button, Icon } from '@ahub/ui';
import { CheckCircle, Coin, CreditCard, CurrencyDollar } from '@ahub/ui/src/icons';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';
import { useStoreTheme } from '@/features/store/hooks/useStoreTheme';
import QRCode from 'react-native-qrcode-svg';

export default function ConfirmationScreen() {
  const st = useStoreTheme();
  const {
    orderId,
    orderCode,
    pointsUsed,
    moneyPaid,
    cashbackEarned,
    pickupCode,
    productType,
    voucherCode,
    voucherExpiresAt,
  } = useLocalSearchParams<{
    orderId?: string;
    orderCode?: string;
    pointsUsed?: string;
    moneyPaid?: string;
    cashbackEarned?: string;
    pickupCode?: string;
    productType?: string;
    voucherCode?: string;
    voucherExpiresAt?: string;
  }>();

  const pointsNum = pointsUsed ? Number(pointsUsed) : 0;
  const moneyNum = moneyPaid ? Number(moneyPaid) : 0;
  const cashbackNum = cashbackEarned ? Number(cashbackEarned) : 0;

  const qrData = pickupCode || orderCode || '';
  const isVoucher = productType === 'VOUCHER';

  // Entry animation
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const cardTheme = st.cardBg
    ? {
        backgroundColor: st.cardBg,
        borderWidth: 1,
        borderColor: st.cardBorder,
        shadowOpacity: 0,
      }
    : {};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: st.screenBg }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <YStack alignItems="center" gap="$5">
          {/* Success icon — animated */}
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            }}
          >
            <YStack
              width={80}
              height={80}
              borderRadius={40}
              backgroundColor={st.successCircleBg}
              alignItems="center"
              justifyContent="center"
            >
              <Icon icon={CheckCircle} size={40} weight="fill" color="success" />
            </YStack>
          </Animated.View>

          {/* Title — animated */}
          <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
            <YStack gap="$2" alignItems="center">
              <Heading level={3} style={{ color: st.textPrimary }}>
                Pedido confirmado!
              </Heading>
              <Text size="sm" align="center" style={{ color: st.textSecondary }}>
                Seu pedido foi realizado com sucesso
              </Text>
            </YStack>
          </Animated.View>

          {/* Order code + QR Code card */}
          {orderCode ? (
            <Card variant="flat" width="100%" {...cardTheme}>
              <YStack gap="$3" alignItems="center" paddingVertical="$2">
                <Text size="xs" style={{ color: st.textSecondary }}>
                  Código do pedido
                </Text>
                <Text
                  weight="bold"
                  size="xl"
                  style={[styles.orderCode, { color: st.textPrimary }]}
                >
                  {orderCode}
                </Text>

                {/* QR Code for pickup — always white bg */}
                {qrData ? (
                  <YStack alignItems="center" gap="$2" paddingTop="$2">
                    <View
                      style={[
                        styles.qrContainer,
                        {
                          backgroundColor: st.qrContainerBg,
                          borderColor: st.qrContainerBorder,
                        },
                      ]}
                    >
                      <QRCode
                        value={qrData}
                        size={160}
                        backgroundColor="white"
                        color="black"
                      />
                    </View>
                    <Text size="xs" style={{ color: st.textSecondary }}>
                      Apresente este QR Code para retirada
                    </Text>
                  </YStack>
                ) : (
                  <Text size="xs" style={{ color: st.textSecondary }}>
                    Apresente este código para retirada
                  </Text>
                )}
              </YStack>
            </Card>
          ) : null}

          {/* Voucher info */}
          {isVoucher && voucherCode && (
            <Card variant="flat" width="100%" {...cardTheme}>
              <YStack gap="$2" alignItems="center">
                <Text size="xs" style={{ color: st.textSecondary }}>
                  Código do voucher
                </Text>
                <Text
                  weight="bold"
                  size="lg"
                  style={[styles.orderCode, { color: st.textPrimary }]}
                >
                  {voucherCode}
                </Text>
                {voucherExpiresAt && (
                  <Text size="xs" color="warning">
                    Válido até{' '}
                    {new Date(voucherExpiresAt).toLocaleDateString('pt-BR')}
                  </Text>
                )}
              </YStack>
            </Card>
          )}

          {/* Payment details */}
          <Card variant="flat" width="100%" {...cardTheme}>
            <YStack gap="$3">
              <Text
                size="xs"
                weight="semibold"
                style={{
                  color: st.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Resumo do pagamento
              </Text>

              {pointsNum > 0 && (
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack gap="$2" alignItems="center">
                    <Icon icon={Coin} size={16} color={st.accent} />
                    <Text size="sm" style={{ color: st.textSecondary }}>
                      Pontos utilizados
                    </Text>
                  </XStack>
                  <Text size="sm" weight="bold" style={{ color: st.accent }}>
                    {formatPoints(pointsNum)} pts
                  </Text>
                </XStack>
              )}

              {moneyNum > 0 && (
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack gap="$2" alignItems="center">
                    <Icon icon={CreditCard} size={16} color={st.moneyColor} />
                    <Text size="sm" style={{ color: st.textSecondary }}>
                      Valor pago
                    </Text>
                  </XStack>
                  <Text size="sm" weight="bold" style={{ color: st.textPrimary }}>
                    {formatCurrency(moneyNum)}
                  </Text>
                </XStack>
              )}

              {cashbackNum > 0 && (
                <>
                  <View
                    style={{
                      height: 1,
                      backgroundColor: st.separatorColor,
                    }}
                  />
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack gap="$2" alignItems="center">
                      <Icon
                        icon={CurrencyDollar}
                        size={16}
                        color={st.accent}
                      />
                      <Text size="sm" style={{ color: st.textSecondary }}>
                        Cashback recebido
                      </Text>
                    </XStack>
                    <Text size="sm" weight="bold" style={{ color: st.accent }}>
                      +{formatPoints(cashbackNum)} pts
                    </Text>
                  </XStack>
                </>
              )}
            </YStack>
          </Card>
        </YStack>
      </ScrollView>

      {/* Action buttons — fixed at bottom */}
      <YStack
        padding="$4"
        paddingTop="$2"
        gap="$3"
        style={{
          borderTopWidth: 1,
          borderTopColor: st.separatorColor,
        }}
      >
        {orderId ? (
          <Button
            onPress={() => {
              router.dismissTo('/(tabs)/loja' as any);
              setTimeout(() => {
                router.push({
                  pathname: '/orders/[id]' as any,
                  params: { id: orderId },
                });
              }, 300);
            }}
          >
            Ver pedido
          </Button>
        ) : null}
        <Button
          variant="outline"
          onPress={() => router.dismissTo('/(tabs)/loja' as any)}
        >
          Continuar comprando
        </Button>
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  orderCode: {
    fontFamily: 'monospace',
    letterSpacing: 3,
  },
  qrContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
});
