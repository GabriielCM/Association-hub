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

  // Messages - solid WhatsApp-style colors
  messageBubbleOwn: '#8B5CF6',
  messageBubbleOther: '#FFFFFF',
  messageBubbleBorderOwn: 'transparent',
  messageBubbleBorderOther: '#E5E7EB',
  messageInput: '#FFFFFF',
  messageInputField: '#F3F4F6',
  messageDateChip: 'rgba(0, 0, 0, 0.06)',
  messageScrollBtn: '#FFFFFF',
  messageContextMenu: 'rgba(255, 255, 255, 0.95)',
  messageChip: '#F3F4F6',
  messageChipActive: 'rgba(139, 92, 246, 0.12)',
  messageChatBg: '#F5F3FF',
} as const;

export type LightTheme = typeof lightTheme;
