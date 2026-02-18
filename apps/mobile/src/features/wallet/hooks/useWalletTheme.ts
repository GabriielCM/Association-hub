import { useThemeContext } from '@/providers/ThemeProvider';

export function useWalletTheme() {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  return {
    isDark,
    // Backgrounds
    screenBg: isDark ? '#0D0520' : '#FAFAFA',
    gradientColors: isDark
      ? (['#1E0A3C', '#0D0520'] as const)
      : (['#F5F3FF', '#FAFAFA'] as const),
    // Glass panels
    glassBg: isDark ? 'rgba(255,255,255,0.07)' : '#FFFFFF',
    glassBorder: isDark ? 'rgba(34,211,238,0.15)' : 'rgba(139,92,246,0.12)',
    glassBlurTint: (isDark ? 'dark' : 'light') as 'dark' | 'light',
    glassBlurIntensity: isDark ? 18 : 40,
    // Text
    textPrimary: isDark ? '#FFFFFF' : '#1F2937',
    textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
    textTertiary: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',
    // Accent
    accent: isDark ? '#22D3EE' : '#8B5CF6',
    accentBg: isDark ? 'rgba(34,211,238,0.08)' : 'rgba(139,92,246,0.08)',
    accentBorder: isDark ? 'rgba(34,211,238,0.30)' : 'rgba(139,92,246,0.20)',
    // Status colors
    earned: '#4ADE80',
    spent: '#F87171',
    net: isDark ? '#22D3EE' : '#8B5CF6',
    earnedBorder: 'rgba(74,222,128,0.20)',
    spentBorder: 'rgba(248,113,113,0.20)',
    netBorder: isDark ? 'rgba(34,211,238,0.20)' : 'rgba(139,92,246,0.20)',
    // Interactive
    pressedBg: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
    headerButtonBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    separatorColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    // Strava
    strava: '#FC4C02',
    stravaBg: isDark ? 'rgba(252,76,2,0.12)' : 'rgba(252,76,2,0.08)',
    stravaBorder: isDark ? 'rgba(252,76,2,0.35)' : 'rgba(252,76,2,0.20)',
    // QR Button
    qrButtonBg: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(139,92,246,0.08)',
    qrButtonBorder: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(139,92,246,0.15)',
    qrButtonText: isDark ? '#FFFFFF' : '#8B5CF6',
    // Skeleton
    shimmerBg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    shimmerBorder: isDark ? 'rgba(34,211,238,0.08)' : 'rgba(0,0,0,0.06)',
    shimmerGradient: isDark
      ? (['transparent', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0.10)', 'rgba(255,255,255,0.06)', 'transparent'] as const)
      : (['transparent', 'rgba(0,0,0,0.02)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.02)', 'transparent'] as const),
    // Ring track
    ringTrack: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    // Offline
    offlineBg: isDark ? 'rgba(248,113,113,0.12)' : 'rgba(248,113,113,0.08)',
    offlineBorder: isDark ? 'rgba(248,113,113,0.2)' : 'rgba(248,113,113,0.15)',
    // Card shadow (light mode only)
    cardShadow: isDark
      ? {}
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        },
    // Primary button (confirm/pay/close)
    primaryButton: isDark ? '#22D3EE' : '#8B5CF6',
    primaryButtonText: isDark ? '#0D0520' : '#FFFFFF',
    // Outline button (back/cancel)
    outlineButtonBorder: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    outlineButtonText: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
    // Success
    success: '#4ADE80',
    successIcon: isDark ? '#4ADE80' : '#16A34A',
    successBg: isDark ? 'rgba(74,222,128,0.12)' : 'rgba(34,197,94,0.10)',
    successBorder: isDark ? 'rgba(74,222,128,0.20)' : 'rgba(34,197,94,0.15)',
    celebrationCheckBg: isDark ? 'rgba(74,222,128,0.12)' : 'rgba(34,197,94,0.15)',
    // Error
    error: '#F87171',
    errorBg: isDark ? 'rgba(248,113,113,0.12)' : 'rgba(248,113,113,0.08)',
    errorBorder: isDark ? 'rgba(248,113,113,0.25)' : 'rgba(248,113,113,0.15)',
    // Input fields
    inputBg: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
    inputBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    inputPlaceholder: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
    // Overlay (modals, celebration)
    overlayBg: isDark ? 'rgba(13,5,32,0.92)' : 'rgba(0,0,0,0.5)',
    // Scanner
    scannerBg: isDark ? '#0D0520' : '#FAFAFA',
    scannerCorner: isDark ? '#fff' : '#1F2937',
    scannerCornerDetected: isDark ? '#22D3EE' : '#8B5CF6',
    scannerGlow: isDark ? '#22D3EE' : '#8B5CF6',
    // Sheet/modal
    sheetBg: isDark ? '#1A0A2E' : '#FFFFFF',
    sheetBorder: isDark ? 'rgba(34,211,238,0.15)' : 'rgba(139,92,246,0.12)',
    sheetHandle: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
  };
}

export type WalletTheme = ReturnType<typeof useWalletTheme>;
