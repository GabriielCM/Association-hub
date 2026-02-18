import { colors } from './tokens';

export const lightTheme = {
  background: colors.background,
  backgroundHover: colors.borderLight,
  backgroundPress: colors.border,
  backgroundFocus: colors.background,

  surface: colors.surface,
  surfaceHover: colors.borderLight,
  surfacePress: colors.border,

  color: colors.textPrimary,
  colorHover: colors.textPrimary,
  colorPress: colors.textSecondary,
  colorFocus: colors.textPrimary,

  colorSecondary: colors.textSecondary,
  colorTertiary: colors.textTertiary,

  borderColor: colors.border,
  borderColorHover: colors.textTertiary,
  borderColorFocus: colors.primary,
  borderColorPress: colors.primary,

  // Semantic colors
  primary: colors.primary,
  primaryHover: colors.primaryDark,
  primaryPress: colors.primaryDark,

  secondary: colors.secondary,
  secondaryHover: colors.secondaryDark,
  secondaryPress: colors.secondaryDark,

  success: colors.success,
  successBackground: '#F0FDF4',
  warning: colors.warning,
  warningBackground: '#FFFBEB',
  error: colors.error,
  errorBackground: '#FEF2F2',
  info: colors.info,
  infoBackground: '#EFF6FF',

  // Shadows (neumorphic)
  shadowColor: '#d1d5db',
  shadowColorLight: '#ffffff',

  // Overlay
  overlay: colors.overlay,
  overlayLight: colors.overlayLight,

  // Accent
  accent: colors.primary,
  accentHover: colors.primaryDark,
  accentPress: colors.primaryDark,

  // Placeholders
  placeholderColor: colors.textTertiary,

  // Messages
  messageBubbleOwn: 'rgba(139, 92, 246, 0.18)',
  messageBubbleOther: 'rgba(255, 255, 255, 0.65)',
  messageBubbleBorderOwn: 'rgba(139, 92, 246, 0.25)',
  messageBubbleBorderOther: 'rgba(0, 0, 0, 0.06)',
  messageInput: 'rgba(255, 255, 255, 0.60)',
  messageInputField: 'rgba(0, 0, 0, 0.04)',
  messageDateChip: 'rgba(255, 255, 255, 0.75)',
  messageScrollBtn: 'rgba(255, 255, 255, 0.80)',
  messageContextMenu: 'rgba(255, 255, 255, 0.92)',
  messageChip: 'rgba(255, 255, 255, 0.70)',
  messageChipActive: 'rgba(139, 92, 246, 0.15)',
} as const;

export type LightTheme = typeof lightTheme;
