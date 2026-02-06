import { colors } from './tokens';

export const darkTheme = {
  background: colors.backgroundDark,
  backgroundHover: colors.borderLightDark,
  backgroundPress: colors.borderDark,
  backgroundFocus: colors.backgroundDark,

  surface: colors.surfaceDark,
  surfaceHover: colors.borderDark,
  surfacePress: colors.borderLightDark,

  color: colors.textPrimaryDark,
  colorHover: colors.textPrimaryDark,
  colorPress: colors.textSecondaryDark,
  colorFocus: colors.textPrimaryDark,

  colorSecondary: colors.textSecondaryDark,
  colorTertiary: colors.textTertiaryDark,

  borderColor: colors.borderDark,
  borderColorHover: colors.textTertiaryDark,
  borderColorFocus: colors.primary,
  borderColorPress: colors.primary,

  // Semantic colors
  primary: colors.primary,
  primaryHover: colors.primaryLight,
  primaryPress: colors.primaryLight,

  secondary: colors.secondary,
  secondaryHover: colors.secondaryLight,
  secondaryPress: colors.secondaryLight,

  success: colors.success,
  successBackground: '#052E16',
  warning: colors.warning,
  warningBackground: '#451A03',
  error: colors.error,
  errorBackground: '#450A0A',
  info: colors.info,
  infoBackground: '#1E3A5F',

  // Shadows (neumorphic)
  shadowColor: '#0f0f1a',
  shadowColorLight: '#252542',

  // Overlay
  overlay: colors.overlay,
  overlayLight: colors.overlayLight,

  // Placeholders
  placeholderColor: colors.textTertiaryDark,
} as const;

export type DarkTheme = typeof darkTheme;
