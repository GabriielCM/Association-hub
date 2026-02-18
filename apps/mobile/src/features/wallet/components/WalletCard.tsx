import { Pressable, StyleSheet, View } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { LinearGradient } from 'expo-linear-gradient';
import type { WalletDashboard } from '@ahub/shared/types';
import { QrCode, CaretRight } from '@ahub/ui/src/icons';
import { GlassPanel } from './GlassPanel';
import { AnimatedCounterText } from './AnimatedCounterText';
import { EyeToggle } from './EyeToggle';
import { useBalanceHidden } from '@/stores/wallet.store';
import { useWalletStore } from '@/stores/wallet.store';
import { useWalletTheme } from '../hooks/useWalletTheme';

interface WalletCardProps {
  dashboard: WalletDashboard;
  onQrPress?: () => void;
}

const TIER_GRADIENTS_DARK: Record<string, [string, string]> = {
  standard: ['rgba(124,58,237,0.6)', 'rgba(13,5,32,0.2)'],
  premium: ['rgba(6,182,212,0.5)', 'rgba(124,58,237,0.5)'],
  elite: ['rgba(234,179,8,0.5)', 'rgba(124,58,237,0.6)'],
};

const TIER_GRADIENTS_LIGHT: Record<string, [string, string]> = {
  standard: ['rgba(139,92,246,0.15)', 'rgba(139,92,246,0.05)'],
  premium: ['rgba(6,182,212,0.15)', 'rgba(139,92,246,0.10)'],
  elite: ['rgba(234,179,8,0.15)', 'rgba(139,92,246,0.12)'],
};

export function WalletCard({ dashboard, onQrPress }: WalletCardProps) {
  const { balance } = dashboard;
  const balanceHidden = useBalanceHidden();
  const toggleBalance = useWalletStore((s) => s.toggleBalanceHidden);
  const t = useWalletTheme();

  const tier = (dashboard as any).memberTier ?? 'standard';
  const gradientMap = t.isDark ? TIER_GRADIENTS_DARK : TIER_GRADIENTS_LIGHT;
  const gradientColors = gradientMap[tier] ?? gradientMap.standard;

  return (
    <GlassPanel
      padding={0}
      borderRadius={24}
      borderColor={t.glassBorder}
      blurTint={t.glassBlurTint}
      intensity={t.glassBlurIntensity}
      style={t.cardShadow}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <YStack gap={16} padding={24}>
        {/* Balance */}
        <YStack alignItems="center" gap={6}>
          <XStack alignItems="center" gap={8}>
            <Text style={[styles.balanceLabel, { color: t.textSecondary }]}>
              Saldo disponivel
            </Text>
            <EyeToggle
              hidden={balanceHidden}
              onToggle={toggleBalance}
              color={t.textSecondary}
            />
          </XStack>
          <View style={styles.balanceContainer}>
            {balanceHidden ? (
              <Text style={[styles.hiddenBalance, { color: t.textTertiary }]}>
                {'•  •  •  •  •'}
              </Text>
            ) : (
              <AnimatedCounterText
                value={balance}
                suffix=" pts"
                style={[styles.balance, { color: t.textPrimary }]}
              />
            )}
          </View>
        </YStack>

        {/* QR Mini Button */}
        {dashboard.qrCode && (
          <Pressable
            onPress={onQrPress}
            style={({ pressed }) => [
              styles.qrButton,
              {
                backgroundColor: t.qrButtonBg,
                borderColor: t.qrButtonBorder,
              },
              pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
            ]}
          >
            <XStack alignItems="center" gap={8} flex={1} justifyContent="center">
              <QrCode size={20} color={t.qrButtonText} />
              <Text style={[styles.qrText, { color: t.qrButtonText }]}>Meu QR Code</Text>
              <CaretRight size={16} color={t.textTertiary} />
            </XStack>
          </Pressable>
        )}
      </YStack>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  balanceContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balance: {
    fontSize: 42,
    fontWeight: '700',
    textAlign: 'center',
  },
  hiddenBalance: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 4,
    textAlign: 'center',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: 'center',
  },
  qrText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
