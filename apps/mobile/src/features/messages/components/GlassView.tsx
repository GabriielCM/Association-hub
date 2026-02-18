import { type ReactNode } from 'react';
import { View, Platform, useColorScheme, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { messageGlass } from '@ahub/ui/themes';

type GlassVariant =
  | 'bubble-own'
  | 'bubble-other'
  | 'chip'
  | 'input'
  | 'menu'
  | 'button'
  | 'date-chip';

interface GlassViewProps {
  children: ReactNode;
  variant: GlassVariant;
  style?: ViewStyle;
  borderRadius?: number;
  blurIntensity?: number;
}

interface VariantConfig {
  bg: string;
  bgDark: string;
  border: string;
  borderDark: string;
  blur: number;
  shadowOpacity: number;
  shadowRadius: number;
}

const VARIANT_CONFIG: Record<GlassVariant, VariantConfig> = {
  'bubble-own': {
    bg: messageGlass.bubbleOwnLight,
    bgDark: messageGlass.bubbleOwnDark,
    border: messageGlass.bubbleBorderOwnLight,
    borderDark: messageGlass.bubbleBorderOwnDark,
    blur: 16,
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  'bubble-other': {
    bg: messageGlass.bubbleOtherLight,
    bgDark: messageGlass.bubbleOtherDark,
    border: messageGlass.bubbleBorderOtherLight,
    borderDark: messageGlass.bubbleBorderOtherDark,
    blur: 16,
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  'chip': {
    bg: messageGlass.chipLight,
    bgDark: messageGlass.chipDark,
    border: 'rgba(255, 255, 255, 0.25)',
    borderDark: 'rgba(255, 255, 255, 0.12)',
    blur: 12,
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  'input': {
    bg: messageGlass.inputLight,
    bgDark: messageGlass.inputDark,
    border: 'rgba(0, 0, 0, 0.06)',
    borderDark: 'rgba(255, 255, 255, 0.10)',
    blur: 20,
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  'menu': {
    bg: messageGlass.contextMenuLight,
    bgDark: messageGlass.contextMenuDark,
    border: 'rgba(0, 0, 0, 0.08)',
    borderDark: 'rgba(255, 255, 255, 0.12)',
    blur: 24,
    shadowOpacity: 0.10,
    shadowRadius: 14,
  },
  'button': {
    bg: messageGlass.scrollBtnLight,
    bgDark: messageGlass.scrollBtnDark,
    border: 'rgba(0, 0, 0, 0.06)',
    borderDark: 'rgba(255, 255, 255, 0.10)',
    blur: 12,
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  'date-chip': {
    bg: messageGlass.dateChipLight,
    bgDark: messageGlass.dateChipDark,
    border: 'rgba(0, 0, 0, 0.04)',
    borderDark: 'rgba(255, 255, 255, 0.10)',
    blur: 16,
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
};

/**
 * Glassmorphism wrapper for messages UI components.
 * Uses BlurView on iOS, semi-transparent fallback on Android.
 */
export function GlassView({
  children,
  variant,
  style,
  borderRadius = 16,
  blurIntensity,
}: GlassViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = VARIANT_CONFIG[variant];

  const bgColor = isDark ? config.bgDark : config.bg;
  const borderColor = isDark ? config.borderDark : config.border;
  const blur = blurIntensity ?? config.blur;

  const shadow = Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? config.shadowOpacity * 3 : config.shadowOpacity,
        shadowRadius: config.shadowRadius,
      }
    : {
        elevation: config.shadowRadius > 10 ? 4 : config.shadowRadius > 6 ? 2 : 1,
      };

  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          {
            backgroundColor: bgColor,
            borderRadius,
            borderWidth: 1,
            borderColor,
            overflow: 'hidden',
            ...shadow,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={blur}
      tint={isDark ? 'dark' : 'light'}
      style={[
        {
          borderRadius,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor,
          ...shadow,
        },
        style,
      ]}
    >
      <View style={{ backgroundColor: bgColor }}>
        {children}
      </View>
    </BlurView>
  );
}
