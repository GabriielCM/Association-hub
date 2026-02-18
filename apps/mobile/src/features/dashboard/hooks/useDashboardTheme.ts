import { useThemeContext } from '@/providers/ThemeProvider';

export function useDashboardTheme() {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  return {
    isDark,
    // Screen
    screenBg: isDark ? '#0D0520' : '#FAFAFA',
    // Header
    headerBg: isDark ? '#0D0520' : '#FAFAFA',
    greetingText: isDark ? 'rgba(255,255,255,0.7)' : '#6B7280',
    // Cards
    cardBg: isDark ? 'rgba(255,255,255,0.10)' : (undefined as string | undefined),
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : (undefined as string | undefined),
    // Icons
    iconColor: isDark ? '#22D3EE' : (undefined as string | undefined),
    // Refresh control
    refreshTint: isDark ? '#22D3EE' : '#8B5CF6',
    refreshBg: isDark ? '#1A0A2E' : '#FFFFFF',
    // FAB
    fabBg: isDark ? '#22D3EE' : '#8B5CF6',
    fabIcon: isDark ? '#0D0520' : '#FFFFFF',
    fabShadow: isDark
      ? {}
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.27,
          shadowRadius: 4.65,
          elevation: 6,
        },
    // Skeleton
    skeletonBg: isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB',
    skeletonShimmer: isDark
      ? (['transparent', 'rgba(255,255,255,0.08)', 'transparent'] as const)
      : (['transparent', 'rgba(255,255,255,0.5)', 'transparent'] as const),
    // Sheet/Modal
    sheetBg: isDark ? '#1A0A2E' : '#FFFFFF',
    overlayBg: isDark ? 'rgba(13,5,32,0.92)' : 'rgba(0,0,0,0.5)',
    // Input
    inputBg: isDark ? 'rgba(255,255,255,0.07)' : 'transparent',
    inputBorder: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
    inputText: isDark ? '#FFFFFF' : '#1F2937',
    inputPlaceholder: isDark ? 'rgba(255,255,255,0.3)' : '#9CA3AF',
    // Send/Action buttons
    sendBtnBg: isDark ? '#22D3EE' : '#7C3AED',
    sendBtnText: isDark ? '#0D0520' : '#FFFFFF',
    // Text
    textPrimary: isDark ? '#FFFFFF' : '#1F2937',
    textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
    // Borders
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
    // Accent
    accent: isDark ? '#22D3EE' : '#8B5CF6',
    accentBg: isDark ? 'rgba(34,211,238,0.10)' : 'rgba(139,92,246,0.06)',
    // Chips (duration buttons, etc.)
    chipBorder: isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB',
    chipActiveBg: isDark ? '#22D3EE' : '#7C3AED',
    chipActiveBorder: isDark ? '#22D3EE' : '#7C3AED',
    // Cancel button
    cancelBtnBg: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(156,163,175,0.15)',
    // Error
    errorBg: isDark ? '#DC2626' : '#EF4444',
    // Offline
    offlineText: isDark ? '#FFFFFF' : '#000000',
    // Tab bar
    tabBarActive: isDark ? '#22D3EE' : '#8B5CF6',
    tabBarBg: isDark ? '#0D0520' : '#FFFFFF',
    tabBarBorder: isDark ? 'rgba(255,255,255,0.06)' : '#E5E7EB',
    // Story ring
    storyRing: isDark ? '#22D3EE' : '#8B5CF6',
  };
}

export type DashboardTheme = ReturnType<typeof useDashboardTheme>;
