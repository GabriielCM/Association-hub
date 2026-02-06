import { createTamagui, createTokens } from 'tamagui';
import { createAnimations } from '@tamagui/animations-react-native';
import {
  colors,
  space,
  size,
  radius,
  zIndex,
  fonts,
  fontSizes,
  lineHeights,
  fontWeights,
} from './src/themes/tokens';
import { lightTheme } from './src/themes/light';
import { darkTheme } from './src/themes/dark';

const animations = createAnimations({
  fast: {
    type: 'timing',
    duration: 150,
  },
  normal: {
    type: 'timing',
    duration: 250,
  },
  slow: {
    type: 'timing',
    duration: 400,
  },
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
});

const tokens = createTokens({
  color: colors,
  space,
  size,
  radius,
  zIndex,
});

export const config = createTamagui({
  animations,
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  fonts: {
    body: {
      family: fonts.body,
      size: fontSizes,
      lineHeight: lineHeights,
      weight: fontWeights,
      letterSpacing: {
        true: 0,
        xs: 0,
        sm: 0,
        base: 0,
        lg: -0.2,
        xl: -0.4,
        '2xl': -0.6,
        '3xl': -0.8,
        '4xl': -1,
      },
    },
    heading: {
      family: fonts.heading,
      size: fontSizes,
      lineHeight: lineHeights,
      weight: {
        ...fontWeights,
        default: '700',
      },
      letterSpacing: {
        true: -0.2,
        xs: 0,
        sm: 0,
        base: -0.2,
        lg: -0.4,
        xl: -0.6,
        '2xl': -0.8,
        '3xl': -1,
        '4xl': -1.2,
      },
    },
    mono: {
      family: fonts.mono,
      size: fontSizes,
      lineHeight: lineHeights,
      weight: fontWeights,
      letterSpacing: {
        true: 0,
        xs: 0,
        sm: 0,
        base: 0,
        lg: 0,
        xl: 0,
        '2xl': 0,
        '3xl': 0,
        '4xl': 0,
      },
    },
  },
  shorthands: {
    // Layout
    p: 'padding',
    pt: 'paddingTop',
    pb: 'paddingBottom',
    pl: 'paddingLeft',
    pr: 'paddingRight',
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    m: 'margin',
    mt: 'marginTop',
    mb: 'marginBottom',
    ml: 'marginLeft',
    mr: 'marginRight',
    mx: 'marginHorizontal',
    my: 'marginVertical',
    w: 'width',
    h: 'height',
    bg: 'backgroundColor',
    br: 'borderRadius',
    // Flex
    f: 'flex',
    fd: 'flexDirection',
    fw: 'flexWrap',
    ai: 'alignItems',
    ac: 'alignContent',
    jc: 'justifyContent',
    as: 'alignSelf',
    // Other
    o: 'opacity',
  } as const,
  defaultTheme: 'light',
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
