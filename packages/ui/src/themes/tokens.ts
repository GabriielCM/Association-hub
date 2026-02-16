/**
 * Design Tokens - A-hub Design System
 *
 * Baseado em docs/shared/design-system.md
 * Estilo: Vibrante/Bold com neumorfismo, pill buttons
 */

export const colors = {
  // Brand colors
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',

  secondary: '#06B6D4',
  secondaryLight: '#22D3EE',
  secondaryDark: '#0891B2',

  // Status colors (pastel)
  success: '#86EFAC',
  successDark: '#22C55E',
  warning: '#FDE68A',
  warningDark: '#F59E0B',
  error: '#FCA5A5',
  errorDark: '#EF4444',
  info: '#93C5FD',
  infoDark: '#3B82F6',

  // Neutrals - Light mode
  white: '#FFFFFF',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Neutrals - Dark mode
  backgroundDark: '#1A1A2E',
  surfaceDark: '#252542',
  textPrimaryDark: '#F9FAFB',
  textSecondaryDark: '#9CA3AF',
  textTertiaryDark: '#6B7280',
  borderDark: '#374151',
  borderLightDark: '#4B5563',

  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export const space = {
  true: 16,
  0: 0,
  0.5: 4,
  1: 8,
  1.5: 12,
  2: 16,
  2.5: 20,
  3: 24,
  4: 32,
  5: 40,
  6: 48,
  8: 64,
  10: 80,
  12: 96,
  16: 128,
} as const;

export const size = {
  true: 16,
  0: 0,
  0.5: 4,
  1: 8,
  1.5: 12,
  2: 16,
  2.5: 20,
  3: 24,
  4: 32,
  5: 40,
  6: 48,
  8: 64,
  10: 80,
  12: 96,
  16: 128,
  full: '100%',
} as const;

export const radius = {
  true: 8,
  0: 0,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
} as const;

export const zIndex = {
  true: 0,
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  modal: 100,
  toast: 200,
} as const;

export const fonts = {
  body: 'Inter',
  heading: 'Inter',
  mono: 'JetBrains Mono',
} as const;

export const fontSizes = {
  true: 16,
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const lineHeights = {
  true: 24,
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 56,
} as const;

export const fontWeights = {
  true: '400',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// Neumorphic shadows
export const shadows = {
  // Light mode
  light: {
    sm: '4px 4px 8px #d1d5db, -4px -4px 8px #ffffff',
    md: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
    lg: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff',
    inset: 'inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff',
  },
  // Dark mode
  dark: {
    sm: '4px 4px 8px #0f0f1a, -4px -4px 8px #252542',
    md: '8px 8px 16px #0f0f1a, -8px -8px 16px #252542',
    lg: '12px 12px 24px #0f0f1a, -12px -12px 24px #252542',
    inset: 'inset 4px 4px 8px #0f0f1a, inset -4px -4px 8px #252542',
  },
} as const;

// Animation durations
export const durations = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

// Gradients
export const gradients = {
  primary: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
  accent: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
} as const;

// Icon sizes
export const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

// Glassmorphism tokens
export const glass = {
  // Blur intensities
  blurSm: 8,
  blurMd: 16,
  blurLg: 24,

  // Light mode backgrounds
  bgLight: 'rgba(255, 255, 255, 0.65)',
  bgLightSubtle: 'rgba(255, 255, 255, 0.45)',

  // Dark mode backgrounds
  bgDark: 'rgba(37, 37, 66, 0.65)',
  bgDarkSubtle: 'rgba(37, 37, 66, 0.45)',

  // Borders
  borderLight: 'rgba(255, 255, 255, 0.25)',
  borderDark: 'rgba(255, 255, 255, 0.15)',

  // Tinted glass (brand colors at low opacity)
  primaryTint: 'rgba(139, 92, 246, 0.12)',
  secondaryTint: 'rgba(6, 182, 212, 0.10)',
  successTint: 'rgba(34, 197, 94, 0.12)',
  errorTint: 'rgba(239, 68, 68, 0.10)',
} as const;

