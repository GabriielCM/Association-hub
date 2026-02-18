import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { PersonSimpleRun, Bicycle, PersonSimpleWalk, SwimmingPool, Timer } from '@ahub/ui/src/icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { GlassPanel } from './GlassPanel';

interface StravaConnectScreenProps {
  onConnect: () => void;
  isConnecting: boolean;
}

export function StravaConnectScreen({
  onConnect,
  isConnecting,
}: StravaConnectScreenProps) {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleConnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onConnect();
  };

  return (
    <YStack flex={1} justifyContent="center" paddingHorizontal={24} gap={32}>
      {/* Logo Pulsing */}
      <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: 'center' }}>
        <Animated.View style={pulseStyle}>
          <View style={styles.iconCircle}>
            <LinearGradient
              colors={['rgba(252, 76, 2, 0.25)', 'rgba(252, 76, 2, 0.08)']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <PersonSimpleRun size={48} color="#FC4C02" weight="duotone" />
          </View>
        </Animated.View>
        <YStack alignItems="center" gap={8} marginTop={20}>
          <Text style={styles.title}>Conecte seu Strava</Text>
          <Text style={styles.subtitle}>
            Ganhe pontos automaticamente com suas atividades fisicas
          </Text>
        </YStack>
      </Animated.View>

      {/* Benefits - Stagger */}
      <YStack gap={10}>
        {BENEFITS.map((b, i) => (
          <BenefitItem key={b.title} {...b} index={i} />
        ))}
      </YStack>

      {/* Limit Info */}
      <Animated.View entering={FadeIn.delay(400).duration(300)}>
        <GlassPanel padding={14} borderRadius={14} borderColor="rgba(252, 76, 2, 0.12)">
          <XStack alignItems="center" justifyContent="center" gap={8}>
            <Timer size={16} color="rgba(255,255,255,0.5)" />
            <Text style={styles.limitText}>
              Maximo de <Text style={styles.limitBold}>5 km/dia</Text> pontuaveis
            </Text>
          </XStack>
        </GlassPanel>
      </Animated.View>

      {/* Connect Button */}
      <Animated.View entering={FadeIn.delay(500).duration(300)}>
        <Pressable
          onPress={handleConnect}
          disabled={isConnecting}
          style={({ pressed }) => [
            styles.connectButton,
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            isConnecting && { opacity: 0.6 },
          ]}
        >
          <LinearGradient
            colors={['#FC4C02', '#E8430A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]}
          />
          <Text style={styles.connectText}>
            {isConnecting ? 'Conectando...' : 'Conectar com Strava'}
          </Text>
        </Pressable>
      </Animated.View>
    </YStack>
  );
}

const BENEFITS = [
  { icon: PersonSimpleRun, title: 'Corrida', description: 'Ganhe pontos por km percorrido', color: '#FC4C02' },
  { icon: Bicycle, title: 'Ciclismo', description: 'Pedale e acumule pontos', color: '#F97316' },
  { icon: PersonSimpleWalk, title: 'Caminhada', description: 'Cada passo conta', color: '#FB923C' },
  { icon: SwimmingPool, title: 'Natacao', description: 'Nade e ganhe recompensas', color: '#FDBA74' },
] as const;

function BenefitItem({
  icon: IconComponent,
  title,
  description,
  color,
  index,
}: {
  icon: PhosphorIcon;
  title: string;
  description: string;
  color: string;
  index: number;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withDelay(index * 80, withSpring(1, { damping: 15 })),
    transform: [
      {
        translateX: withDelay(
          index * 80,
          withSpring(0, { damping: 15 }),
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[{ opacity: 0, transform: [{ translateX: -20 }] }, animatedStyle]}>
      <GlassPanel padding={14} borderRadius={14} borderColor="rgba(252, 76, 2, 0.10)">
        <XStack alignItems="center" gap={14}>
          <View style={[styles.benefitIcon, { backgroundColor: `${color}15` }]}>
            <IconComponent size={22} color={color} weight="duotone" />
          </View>
          <YStack flex={1} gap={2}>
            <Text style={styles.benefitTitle}>{title}</Text>
            <Text style={styles.benefitDesc}>{description}</Text>
          </YStack>
        </XStack>
      </GlassPanel>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(252, 76, 2, 0.20)',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  benefitIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  benefitDesc: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
  },
  limitText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textAlign: 'center',
  },
  limitBold: {
    color: '#FC4C02',
    fontWeight: '700',
    fontSize: 13,
  },
  connectButton: {
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  connectText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
