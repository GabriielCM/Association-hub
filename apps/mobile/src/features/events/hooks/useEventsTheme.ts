import { useThemeContext } from '@/providers/ThemeProvider';

export function useEventsTheme() {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  return {
    isDark,

    // ──── Screen ────
    screenBg: isDark ? '#0D0520' : '#FAFAFA',

    // ──── Text ────
    textPrimary: isDark ? '#FFFFFF' : '#1F2937',
    textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
    textTertiary: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',

    // ──── Accent ────
    accent: isDark ? '#22D3EE' : '#8B5CF6',
    accentBg: isDark ? 'rgba(34,211,238,0.10)' : 'rgba(139,92,246,0.08)',

    // ──── Cards ────
    cardBg: isDark ? 'rgba(255,255,255,0.10)' : undefined as string | undefined,
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : undefined as string | undefined,
    cardShadow: isDark ? {} : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },

    // ──── Borders ────
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',

    // ──── Icons ────
    iconColor: isDark ? 'rgba(255,255,255,0.7)' : '#6B7280',

    // ──── Inputs ────
    inputBg: isDark ? 'rgba(255,255,255,0.07)' : 'transparent',
    inputBorder: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
    inputText: isDark ? '#FFFFFF' : '#1F2937',
    inputPlaceholder: isDark ? 'rgba(255,255,255,0.3)' : '#9CA3AF',

    // ──── Sheets/Modals ────
    sheetBg: isDark ? '#1A0A2E' : '#FFFFFF',
    overlayBg: isDark ? 'rgba(13,5,32,0.92)' : 'rgba(0,0,0,0.5)',

    // ──── Interactive ────
    pressedBg: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',

    // ──── Events-specific ────
    checkinCornerColor: isDark ? '#22D3EE' : '#7C3AED',
    errorBg: 'rgba(220,38,38,0.9)',
    infoPanelBg: 'rgba(0,0,0,0.7)',
  };
}

export type EventsTheme = ReturnType<typeof useEventsTheme>;
