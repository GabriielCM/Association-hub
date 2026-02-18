import { ScrollView, StyleSheet, View, Pressable, Image } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { Storefront, FingerprintSimple, Lock } from '@ahub/ui/src/icons';
import { formatPoints } from '@ahub/shared/utils';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { PdvCheckoutDetails, PdvCheckoutItem } from '@ahub/shared/types';
import { GlassPanel } from './GlassPanel';
import { AnimatedCounterText } from './AnimatedCounterText';
import { useWalletTheme } from '../hooks/useWalletTheme';

interface PdvCheckoutProps {
  checkout: PdvCheckoutDetails;
  isPaying: boolean;
  onPay: () => void;
  onCancel: () => void;
}

export function PdvCheckout({
  checkout,
  isPaying,
  onPay,
  onCancel,
}: PdvCheckoutProps) {
  const { items, totalPoints, totalMoney, pdv, user } = checkout;
  const hasMoneyPrice = totalMoney > 0;
  const balanceAfter = user.balance - totalPoints;
  const t = useWalletTheme();

  const handlePay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPay();
  };

  return (
    <YStack flex={1} gap={16}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        {/* PDV Info */}
        <Animated.View entering={FadeIn.duration(400)}>
          <YStack gap={6} alignItems="center" paddingVertical={8}>
            <View style={[styles.pdvIcon, { backgroundColor: t.accentBg, borderColor: t.accentBorder }]}>
              <Storefront size={28} color={t.accent} weight="duotone" />
            </View>
            <Text style={[styles.pdvName, { color: t.textPrimary }]}>{pdv.name}</Text>
            <Text style={[styles.pdvLocation, { color: t.textTertiary }]}>{pdv.location}</Text>
          </YStack>
        </Animated.View>

        {/* Items */}
        <Animated.View entering={FadeIn.delay(100).duration(300)}>
          <GlassPanel
            padding={16}
            borderRadius={16}
            blurTint={t.glassBlurTint}
            intensity={t.glassBlurIntensity}
            borderColor={t.glassBorder}
          >
            <YStack gap={10}>
              <Text style={[styles.sectionLabel, { color: t.textTertiary }]}>Itens</Text>
              {items.map((item, index) => (
                <CheckoutItemRow key={`${item.product_id}-${index}`} item={item} t={t} />
              ))}
            </YStack>
          </GlassPanel>
        </Animated.View>

        {/* Total */}
        <Animated.View entering={FadeIn.delay(200).duration(300)}>
          <GlassPanel
            padding={20}
            borderRadius={16}
            borderColor={t.accentBorder}
            blurTint={t.glassBlurTint}
            intensity={t.glassBlurIntensity}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text style={[styles.totalLabel, { color: t.textSecondary }]}>Total</Text>
              <YStack alignItems="flex-end">
                <AnimatedCounterText
                  value={totalPoints}
                  suffix=" pts"
                  style={[styles.totalValue, { color: t.accent }]}
                  duration={600}
                />
                {hasMoneyPrice && (
                  <Text style={[styles.moneyPrice, { color: t.textTertiary }]}>
                    ou R$ {totalMoney.toFixed(2)}
                  </Text>
                )}
              </YStack>
            </XStack>
          </GlassPanel>
        </Animated.View>

        {/* Balance Preview */}
        <Animated.View entering={FadeIn.delay(300).duration(300)}>
          <GlassPanel
            padding={16}
            borderRadius={14}
            blurTint={t.glassBlurTint}
            intensity={t.glassBlurIntensity}
            borderColor={t.glassBorder}
          >
            <YStack gap={10}>
              <XStack justifyContent="space-between">
                <Text style={[styles.previewLabel, { color: t.textTertiary }]}>Saldo atual</Text>
                <Text style={[styles.previewValue, { color: t.textSecondary }]}>{formatPoints(user.balance)} pts</Text>
              </XStack>
              <View style={[styles.divider, { backgroundColor: t.separatorColor }]} />
              <XStack justifyContent="space-between">
                <Text style={[styles.previewLabel, { color: t.textTertiary }]}>Apos pagamento</Text>
                <Text
                  style={[
                    styles.previewValueBold,
                    { color: t.textPrimary },
                    !user.canPayWithPoints && { color: t.error },
                  ]}
                >
                  {formatPoints(balanceAfter)} pts
                </Text>
              </XStack>
            </YStack>
          </GlassPanel>
        </Animated.View>
      </ScrollView>

      {/* Actions */}
      <YStack gap={10}>
        {!user.canPayWithPoints && (
          <Text style={[styles.errorText, { color: t.error }]}>
            Saldo insuficiente para este pagamento
          </Text>
        )}
        <Pressable
          onPress={handlePay}
          disabled={!user.canPayWithPoints || isPaying}
          style={({ pressed }) => [
            styles.payButton,
            { backgroundColor: t.primaryButton },
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            (!user.canPayWithPoints || isPaying) && { opacity: 0.4 },
          ]}
        >
          <XStack alignItems="center" gap={10}>
            <FingerprintSimple size={22} color={t.primaryButtonText} />
            <Text style={[styles.payText, { color: t.primaryButtonText }]}>
              {isPaying ? 'Processando...' : 'Pagar com Pontos'}
            </Text>
          </XStack>
        </Pressable>
        <Pressable
          onPress={onCancel}
          disabled={isPaying}
          style={[styles.cancelButton, { borderColor: t.outlineButtonBorder }, isPaying && { opacity: 0.4 }]}
        >
          <Text style={[styles.cancelText, { color: t.outlineButtonText }]}>Cancelar</Text>
        </Pressable>
      </YStack>
    </YStack>
  );
}

function CheckoutItemRow({
  item,
  t,
}: {
  item: PdvCheckoutItem;
  t: ReturnType<typeof useWalletTheme>;
}) {
  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical={3}>
      <XStack gap={8} flex={1}>
        <Text style={[styles.itemQty, { color: t.textTertiary }]}>{item.quantity}x</Text>
        <Text style={[styles.itemName, { color: t.textPrimary }]} numberOfLines={1}>{item.name}</Text>
      </XStack>
      <Text style={[styles.itemPrice, { color: t.textSecondary }]}>
        {formatPoints(item.unit_price_points * item.quantity)} pts
      </Text>
    </XStack>
  );
}

const styles = StyleSheet.create({
  pdvIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  pdvName: {
    fontSize: 20,
    fontWeight: '700',
  },
  pdvLocation: {
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 13,
  },
  itemName: {
    fontSize: 13,
    flex: 1,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  moneyPrice: {
    fontSize: 13,
    marginTop: 2,
  },
  previewLabel: {
    fontSize: 13,
  },
  previewValue: {
    fontSize: 13,
  },
  previewValueBold: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  payButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payText: {
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
