import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Pressable, Platform, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@ahub/ui/themes';
import { NativeViewFallback } from '@ahub/ui';

interface AnimatedConfirmButtonProps {
  price: number | null;
  originalPrice?: number | null;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  label?: string;
  success?: boolean;
}

const BUTTON_HEIGHT = 52;
const CIRCLE_SIZE = 52;
const FULL_WIDTH_PERCENT = 100;

function formatPrice(cents: number | null): string {
  if (cents == null || cents === 0) return 'Gratuito';
  return `R$ ${(cents / 100).toFixed(2)}`;
}

export function AnimatedConfirmButton({
  price,
  originalPrice,
  disabled = false,
  loading = false,
  onPress,
  label = 'Reservar',
  success = false,
}: AnimatedConfirmButtonProps) {
  // Animation values
  const widthPercent = useSharedValue(FULL_WIDTH_PERCENT);
  const textOpacity = useSharedValue(1);
  const spinnerOpacity = useSharedValue(0);
  const spinnerRotation = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const successTextOpacity = useSharedValue(0);
  const bgGreen = useSharedValue(0); // 0 = gradient, 1 = green

  const triggerHapticSuccess = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  // Handle loading state
  useEffect(() => {
    if (loading) {
      // Phase 1: Shrink to circle
      textOpacity.value = withTiming(0, { duration: 100 });
      widthPercent.value = withTiming(
        (CIRCLE_SIZE / 360) * 100, // approximate percentage for circle
        { duration: 200 },
        () => {
          // Phase 2: Show spinner
          spinnerOpacity.value = withTiming(1, { duration: 150 });
          spinnerRotation.value = withRepeat(
            withTiming(360, { duration: 800, easing: Easing.linear }),
            -1,
            false,
          );
        },
      );
    }
  }, [loading]);

  // Handle success state
  useEffect(() => {
    if (success) {
      // Phase 3: Stop spinner, expand
      spinnerRotation.value = spinnerRotation.value; // stop repeat
      spinnerOpacity.value = withTiming(0, { duration: 100 });
      bgGreen.value = withTiming(1, { duration: 300 });
      widthPercent.value = withSpring(FULL_WIDTH_PERCENT, {
        damping: 15,
        stiffness: 120,
      });

      // Phase 4: Show check, then fade to text
      checkOpacity.value = withDelay(100,
        withSequence(
          withTiming(1, { duration: 200 }),
          withDelay(500, withTiming(0, { duration: 200 })),
        ),
      );
      successTextOpacity.value = withDelay(
        800,
        withTiming(1, { duration: 200 }),
      );

      runOnJS(triggerHapticSuccess)();
    }
  }, [success]);

  // Reset when not loading and not success
  useEffect(() => {
    if (!loading && !success) {
      widthPercent.value = withTiming(FULL_WIDTH_PERCENT, { duration: 200 });
      textOpacity.value = withTiming(1, { duration: 200 });
      spinnerOpacity.value = 0;
      spinnerRotation.value = 0;
      checkOpacity.value = 0;
      successTextOpacity.value = 0;
      bgGreen.value = 0;
    }
  }, [loading, success]);

  const handlePress = useCallback(() => {
    if (disabled || loading || success) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  }, [disabled, loading, success, onPress]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    width: `${widthPercent.value}%` as any,
    alignSelf: 'center' as const,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const spinnerStyle = useAnimatedStyle(() => ({
    opacity: spinnerOpacity.value,
    transform: [{ rotate: `${spinnerRotation.value}deg` }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
  }));

  const successTextStyle = useAnimatedStyle(() => ({
    opacity: successTextOpacity.value,
  }));

  const bgOverlayStyle = useAnimatedStyle(() => ({
    opacity: bgGreen.value,
  }));

  const priceLabel = price != null && price > 0 ? formatPrice(price) : null;
  const hasDiscount = originalPrice != null && price != null && originalPrice !== price;
  const buttonText = priceLabel
    ? `${label} - ${priceLabel}`
    : `${label} - Gratuito`;

  return (
    <Animated.View style={[containerStyle]}>
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading || success}
      >
        <Animated.View
          style={[
            styles.button,
            disabled && !loading && !success && styles.disabled,
          ]}
        >
          {/* Gradient background */}
          <NativeViewFallback
            fallback={<View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary }]} />}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </NativeViewFallback>

          {/* Green success overlay */}
          <Animated.View style={[StyleSheet.absoluteFill, styles.successBg, bgOverlayStyle]} />

          {/* Main text */}
          <Animated.View style={[styles.content, textStyle]}>
            <Animated.Text style={styles.buttonText}>
              {buttonText}
            </Animated.Text>
            {hasDiscount && (
              <Animated.Text style={styles.originalPrice}>
                {formatPrice(originalPrice!)}
              </Animated.Text>
            )}
          </Animated.View>

          {/* Spinner */}
          <Animated.View style={[styles.spinnerContainer, spinnerStyle]}>
            <Animated.View style={styles.spinner} />
          </Animated.View>

          {/* Check mark */}
          <Animated.View style={[styles.checkContainer, checkStyle]}>
            <Animated.Text style={styles.checkText}>✓</Animated.Text>
          </Animated.View>

          {/* Success text */}
          <Animated.View style={[styles.content, successTextStyle]}>
            <Animated.Text style={styles.buttonText}>Reservado!</Animated.Text>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    minWidth: CIRCLE_SIZE,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  originalPrice: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '400',
    textDecorationLine: 'line-through',
  },
  successBg: {
    backgroundColor: colors.successDark,
  },
  spinnerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: '#FFFFFF',
  },
  checkContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
});
