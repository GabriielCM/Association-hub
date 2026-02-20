import { useThemeContext } from '@/providers/ThemeProvider';

export function useCardTheme() {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  return {
    isDark,

    // Screen
    screenBg: isDark ? '#0D0520' : '#FAFAFA',
    screenBgSolid: isDark ? '#111111' : '#FFFFFF',

    // Text
    textPrimary: isDark ? '#FFFFFF' : '#1F2937',
    textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
    textTertiary: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',

    // Accent
    accent: isDark ? '#22D3EE' : '#8B5CF6',
    accentBg: isDark ? 'rgba(34,211,238,0.10)' : 'rgba(139,92,246,0.08)',
    accentBgSubtle: isDark ? 'rgba(34,211,238,0.06)' : 'rgba(139,92,246,0.04)',

    // Cards & surfaces
    cardBg: isDark ? 'rgba(255,255,255,0.10)' : undefined as string | undefined,
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : undefined as string | undefined,
    cardShadow: isDark
      ? {}
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        },
    surfaceBg: isDark ? '#1F1F1F' : '#FFFFFF',

    // Glass
    glassTint: (isDark ? 'light' : 'dark') as 'light' | 'dark',
    glassBlurIntensity: isDark ? 18 : 40,

    // Icons
    iconColor: isDark ? 'rgba(255,255,255,0.7)' : '#6B7280',

    // Borders
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',

    // Inputs (PartnerFilters)
    inputBg: isDark ? '#374151' : '#F3F4F6',
    inputText: isDark ? '#F3F4F6' : '#1F2937',
    inputPlaceholder: isDark ? '#6B7280' : '#9CA3AF',

    // Chips (PartnerFilters)
    chipBg: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)',
    chipActiveBg: '#8B5CF6',
    chipText: isDark ? '#D1D5DB' : '#6B7280',
    chipActiveText: '#FFFFFF',
    chipIcon: isDark ? '#D1D5DB' : '#8B5CF6',
    chipActiveIcon: '#FFFFFF',

    // Segment control (PartnerFilters)
    segmentBg: isDark ? '#1F2937' : '#F3F4F6',
    segmentPillBg: isDark ? '#374151' : '#FFFFFF',
    segmentText: isDark ? '#6B7280' : '#9CA3AF',
    segmentActiveText: isDark ? '#F3F4F6' : '#1F2937',

    // Sheets/Modals
    sheetBg: isDark ? '#1A0A2E' : '#FFFFFF',
    overlayBg: isDark ? 'rgba(13,5,32,0.92)' : 'rgba(0,0,0,0.5)',

    // Partner detail
    partnerCardBg: isDark
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(139,92,246,0.03)',
    partnerCardElevatedBg: isDark ? '#1F1F1F' : '#FFFFFF',
    lockedBannerBg: isDark ? '#78350F' : '#FEF3C7',
    lockedBannerBorder: isDark ? '#92400E' : '#F59E0B',
    lockedTitleColor: isDark ? '#FCD34D' : '#92400E',
    lockedSubtitleColor: isDark ? '#FBBF24' : '#A16207',
    benefitCardBg: isDark
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(139,92,246,0.04)',
    contactCardBg: isDark
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(139,92,246,0.03)',
    addressCardBg: isDark
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(139,92,246,0.03)',
    hoursCardBg: isDark
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(139,92,246,0.03)',
    todayHighlightBg: isDark
      ? 'rgba(34,211,238,0.10)'
      : 'rgba(139,92,246,0.08)',
    backButtonBg: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)',
    backButtonText: isDark ? '#FFFFFF' : '#374151',
    dividerColor: isDark
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(139,92,246,0.1)',
    avatarBorder: isDark ? '#1F1F1F' : '#FFFFFF',

    // QR Glow
    qrGlowColor: isDark
      ? 'rgba(34,211,238,0.25)'
      : 'rgba(139,92,246,0.25)',

    // RefreshControl
    refreshTint: isDark ? '#22D3EE' : '#8B5CF6',

    // History
    historyIconBg: isDark
      ? 'rgba(34,211,238,0.10)'
      : 'rgba(139,92,246,0.1)',

    // Search icon button
    searchIconColor: isDark ? '#D1D5DB' : '#6B7280',

    // Empty state icon
    emptyIconBg: isDark ? '#1F1F1F' : '#F3F4F6',
    emptyIconColor: isDark ? '#6B7280' : '#D1D5DB',

    // Map
    mapStyle: (isDark ? 'dark' : 'light') as 'dark' | 'light',
    mapFallbackBg: isDark
      ? 'rgba(139,92,246,0.08)'
      : 'rgba(139,92,246,0.04)',

    // Bookmark (on banners — stays light)
    bookmarkColor: isDark ? '#22D3EE' : '#8B5CF6',

    // Distance text
    distanceColor: isDark ? '#22D3EE' : '#8B5CF6',

    // Dot indicators (FeaturedCarousel)
    dotColor: isDark ? 'rgba(255,255,255,0.3)' : '#D1D5DB',
    dotActiveColor: isDark ? '#22D3EE' : '#8B5CF6',

    // Logo border on banners
    logoBorderColor: isDark ? '#1F1F1F' : '#FFFFFF',

    // Pressed state
    pressedBg: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
  };
}

export type CardTheme = ReturnType<typeof useCardTheme>;
