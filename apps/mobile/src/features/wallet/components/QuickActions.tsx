import { Pressable, StyleSheet, View } from 'react-native';
import { XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { WALLET_ICONS } from '@ahub/ui/src/icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useWalletTheme, type WalletTheme } from '../hooks/useWalletTheme';

interface QuickActionsProps {
  onTransfer: () => void;
  onScanner: () => void;
  onHistory: () => void;
}

export function QuickActions({ onTransfer, onScanner, onHistory }: QuickActionsProps) {
  const t = useWalletTheme();

  return (
    <XStack justifyContent="space-around" paddingVertical={4}>
      <GlassActionButton icon={WALLET_ICONS.transfer} label="Transferir" onPress={onTransfer} t={t} />
      <GlassActionButton icon={WALLET_ICONS.scanner} label="Scanner" onPress={onScanner} t={t} />
      <GlassActionButton icon={WALLET_ICONS.history} label="Historico" onPress={onHistory} t={t} />
    </XStack>
  );
}

function GlassActionButton({
  icon: IconComponent,
  label,
  onPress,
  t,
}: {
  icon: PhosphorIcon;
  label: string;
  onPress: () => void;
  t: WalletTheme;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.button, animatedStyle]}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: t.accentBg,
              borderColor: t.accentBorder,
            },
          ]}
        >
          <IconComponent size={26} color={t.accent} weight="regular" />
        </View>
        <Text style={[styles.label, { color: t.textPrimary }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    gap: 8,
    minWidth: 80,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
