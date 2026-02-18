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

  // Accent
  accent: colors.primary,
  accentHover: colors.primaryLight,
  accentPress: colors.primaryLight,

  // Placeholders
  placeholderColor: colors.textTertiaryDark,

  // Messages - solid WhatsApp-style colors
  messageBubbleOwn: '#6D28D9',
  messageBubbleOther: '#2A2A4A',
  messageBubbleBorderOwn: 'transparent',
  messageBubbleBorderOther: '#3D3D5C',
  messageInput: '#252542',
  messageInputField: 'rgba(255, 255, 255, 0.08)',
  messageDateChip: 'rgba(255, 255, 255, 0.08)',
  messageScrollBtn: '#252542',
  messageContextMenu: 'rgba(30, 30, 46, 0.95)',
  messageChip: '#2A2A4A',
  messageChipActive: 'rgba(139, 92, 246, 0.25)',
  messageChatBg: '#1A1A2E',
} as const;

export type DarkTheme = typeof darkTheme;
