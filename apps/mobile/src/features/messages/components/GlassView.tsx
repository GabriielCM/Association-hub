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
    blur: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  'bubble-other': {
    bg: messageGlass.bubbleOtherLight,
    bgDark: messageGlass.bubbleOtherDark,
    border: messageGlass.bubbleBorderOtherLight,
    borderDark: messageGlass.bubbleBorderOtherDark,
    blur: 0,
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  'chip': {
    bg: messageGlass.chipLight,
    bgDark: messageGlass.chipDark,
    border: 'transparent',
    borderDark: 'transparent',
    blur: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  'input': {
    bg: messageGlass.inputLight,
    bgDark: messageGlass.inputDark,
    border: messageGlass.inputBorderLight,
    borderDark: messageGlass.inputBorderDark,
    blur: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
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
    border: '#E5E7EB',
    borderDark: '#3D3D5C',
    blur: 0,
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  'date-chip': {
    bg: messageGlass.dateChipLight,
    bgDark: messageGlass.dateChipDark,
    border: 'transparent',
    borderDark: 'transparent',
    blur: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
  },
};

/**
 * View wrapper for messages UI components.
 * Uses solid backgrounds for most variants, BlurView only for menu on iOS.
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

  const shadow = config.shadowOpacity > 0
    ? Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? config.shadowOpacity * 2 : config.shadowOpacity,
          shadowRadius: config.shadowRadius,
        }
      : {
          elevation: config.shadowRadius > 10 ? 4 : config.shadowRadius > 3 ? 2 : 1,
        }
    : {};

  // Use solid View for variants with no blur
  if (blur === 0 || Platform.OS === 'android') {
    return (
      <View
        style={[
          {
            backgroundColor: bgColor,
            borderRadius,
            borderWidth: borderColor !== 'transparent' ? 1 : 0,
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

  // Only use BlurView for menu variant on iOS
  return (
    <BlurView
      intensity={blur}
      tint={isDark ? 'dark' : 'light'}
      style={[
        {
          borderRadius,
          overflow: 'hidden',
          borderWidth: borderColor !== 'transparent' ? 1 : 0,
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
