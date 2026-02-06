import { styled, GetProps, View, YStack } from 'tamagui';
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

const SpinnerFrame = styled(View, {
  name: 'Spinner',
  borderRadius: '$full',
  borderWidth: 2,
  borderColor: '$primary',
  borderTopColor: 'transparent',

  variants: {
    size: {
      sm: {
        width: 16,
        height: 16,
        borderWidth: 2,
      },
      md: {
        width: 24,
        height: 24,
        borderWidth: 2,
      },
      lg: {
        width: 32,
        height: 32,
        borderWidth: 3,
      },
      xl: {
        width: 48,
        height: 48,
        borderWidth: 4,
      },
    },
    color: {
      primary: {
        borderColor: '$primary',
        borderTopColor: 'transparent',
      },
      secondary: {
        borderColor: '$secondary',
        borderTopColor: 'transparent',
      },
      white: {
        borderColor: '#FFFFFF',
        borderTopColor: 'transparent',
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
});

export type SpinnerProps = GetProps<typeof SpinnerFrame>;

export function Spinner({ size = 'md', color = 'primary', ...props }: SpinnerProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <SpinnerFrame size={size} color={color} {...props} />
    </Animated.View>
  );
}

// Skeleton for content loading
const SkeletonFrame = styled(View, {
  name: 'Skeleton',
  backgroundColor: '$borderColor',
  overflow: 'hidden',

  variants: {
    variant: {
      text: {
        height: 16,
        borderRadius: '$sm',
      },
      circular: {
        borderRadius: '$full',
      },
      rectangular: {
        borderRadius: '$md',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'rectangular',
  },
});

export type SkeletonProps = GetProps<typeof SkeletonFrame> & {
  width?: number | string;
  height?: number | string;
};

export function Skeleton({
  width = '100%',
  height = 20,
  variant = 'rectangular',
  ...props
}: SkeletonProps) {
  const pulseValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 750,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0.3,
          duration: 750,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseValue]);

  return (
    <Animated.View style={{ opacity: pulseValue }}>
      <SkeletonFrame
        variant={variant}
        width={width}
        height={variant === 'circular' ? width : height}
        {...props}
      />
    </Animated.View>
  );
}

// Loading overlay
const LoadingOverlayFrame = styled(View, {
  name: 'LoadingOverlay',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$overlay',
  zIndex: '$modal',
});

export interface LoadingOverlayProps extends GetProps<typeof LoadingOverlayFrame> {
  visible?: boolean;
  spinnerSize?: SpinnerProps['size'];
}

export function LoadingOverlay({
  visible = true,
  spinnerSize = 'lg',
  ...props
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <LoadingOverlayFrame {...props}>
      <Spinner size={spinnerSize} color="white" />
    </LoadingOverlayFrame>
  );
}

// Full page loading
const FullPageLoadingFrame = styled(YStack, {
  name: 'FullPageLoading',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$background',
  gap: '$2',
});

export interface FullPageLoadingProps extends GetProps<typeof FullPageLoadingFrame> {
  message?: string;
}

export function FullPageLoading({ message, ...props }: FullPageLoadingProps) {
  return (
    <FullPageLoadingFrame {...props}>
      <Spinner size="xl" />
      {message && (
        <View>
          {/* Text would go here but avoiding circular import */}
        </View>
      )}
    </FullPageLoadingFrame>
  );
}

// Export all loading components
export const Loading = {
  Spinner,
  Skeleton,
  Overlay: LoadingOverlay,
  FullPage: FullPageLoading,
};
