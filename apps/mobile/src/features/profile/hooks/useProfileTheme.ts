import { useThemeContext } from '@/providers/ThemeProvider';

export function useProfileTheme() {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  return {
    isDark,
    // Screen
    screenBg: isDark ? '#0D0520' : '#FFFFFF',
    // Text
    textPrimary: isDark ? '#FFFFFF' : '#1F2937',
    textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
    textTertiary: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',
    // Cards & surfaces
    cardBg: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(139,92,246,0.05)',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'transparent',
    surfaceBg: isDark ? '#252542' : '#FFFFFF',
    // Borders
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
    // Icons
    iconColor: isDark ? 'rgba(255,255,255,0.7)' : '#6B7280',
    // Accent (purple light → cyan dark)
    accent: isDark ? '#22D3EE' : '#8B5CF6',
    accentBg: isDark ? 'rgba(34,211,238,0.10)' : 'rgba(139,92,246,0.1)',
    accentBgSubtle: isDark ? 'rgba(34,211,238,0.06)' : 'rgba(139,92,246,0.05)',
    // Tab bar
    tabIndicator: isDark ? '#22D3EE' : '#8B5CF6',
    tabBorder: isDark ? 'rgba(255,255,255,0.06)' : '#E5E7EB',
    // Glass tint
    glassTint: (isDark ? 'dark' : 'light') as 'dark' | 'light',
    // Avatar
    onlineDotBorder: isDark ? '#0D0520' : '#FFFFFF',
    defaultRingColor: isDark ? '#6B7280' : '#9CA3AF',
    // Modal/Sheet
    modalBg: isDark ? '#1A0A2E' : '#FFFFFF',
    // Locked badge
    lockedBg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(156,163,175,0.08)',
    lockedIconBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(156,163,175,0.12)',
    lockOverlayBg: isDark ? '#374151' : '#F3F4F6',
    lockOverlayBorder: isDark ? '#4B5563' : '#E5E7EB',
    lockedIconColor: isDark ? '#6B7280' : '#9CA3AF',
    lockColor: isDark ? '#9CA3AF' : '#6B7280',
  };
}

export type ProfileTheme = ReturnType<typeof useProfileTheme>;
