import { useThemeContext } from '@/providers/ThemeProvider';

export function useStoreTheme() {
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
    refreshTint: isDark ? '#22D3EE' : '#8B5CF6',

    // ──── Search ────
    searchBg: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6',
    clearBtnBg: isDark ? 'rgba(255,255,255,0.15)' : '#D1D5DB',

    // ──── Chips ────
    chipBg: isDark ? 'rgba(255,255,255,0.07)' : '#F9FAFB',
    chipBorder: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
    chipSelectedBg: isDark ? 'rgba(34,211,238,0.15)' : '#F5F3FF',
    chipSelectedBorder: isDark ? '#22D3EE' : '#7C3AED',

    // ──── Menu/Dropdown ────
    menuBg: isDark ? '#1A0A2E' : '#FFFFFF',
    menuShadow: isDark ? {} : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    backdropBg: isDark ? 'rgba(13,5,32,0.92)' : 'rgba(0,0,0,0.3)',

    // ──── Payment Options ────
    optionBg: isDark ? 'rgba(255,255,255,0.07)' : '#FFFFFF',
    optionBorder: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
    optionSelectedBg: isDark ? 'rgba(34,211,238,0.12)' : '#F5F3FF',
    optionSelectedBorder: isDark ? '#22D3EE' : '#7C3AED',
    radioBorder: isDark ? 'rgba(255,255,255,0.25)' : '#D1D5DB',
    radioSelectedBorder: isDark ? '#22D3EE' : '#7C3AED',
    radioSelectedFill: isDark ? '#22D3EE' : '#7C3AED',

    // ──── Stars (same in both modes) ────
    starFilled: '#F59E0B',
    starEmpty: isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB',

    // ──── Rating Bars ────
    barBg: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
    barFill: '#F59E0B',

    // ──── Overlays ────
    promoBg: '#EF4444',
    exclusiveBg: '#7C3AED',
    soldOutOverlay: 'rgba(0,0,0,0.55)',

    // ──── Gallery ────
    dotColor: isDark ? 'rgba(255,255,255,0.25)' : '#D1D5DB',
    dotActiveColor: isDark ? '#22D3EE' : '#7C3AED',
    placeholderBg: isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6',

    // ──── Floating Buttons ────
    floatingBtnBg: isDark ? 'rgba(26,10,46,0.9)' : 'rgba(255,255,255,0.9)',
    favBtnBg: isDark ? 'rgba(26,10,46,0.85)' : 'rgba(255,255,255,0.9)',

    // ──── Cart ────
    separatorColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
    unavailableBg: isDark ? 'rgba(239,68,68,0.15)' : '#FEF2F2',

    // ──── Bottom Bar ────
    bottomBarBg: isDark ? '#1A0A2E' : '#FFFFFF',
    bottomBarBorder: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',

    // ──── Timer ────
    warningBg: isDark ? 'rgba(253,224,71,0.15)' : '#FEF3C7',
    urgentBg: isDark ? 'rgba(248,113,113,0.15)' : '#FEE2E2',

    // ──── Confirmation ────
    successCircleBg: isDark ? 'rgba(74,222,128,0.15)' : '#DCFCE7',
    qrContainerBg: '#FFFFFF',
    qrContainerBorder: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',

    // ──── Slider ────
    sliderMinTrack: isDark ? '#22D3EE' : '#7C3AED',
    sliderMaxTrack: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
    sliderThumb: isDark ? '#22D3EE' : '#7C3AED',
    pointsColor: isDark ? '#22D3EE' : '#7C3AED',
    moneyColor: '#3B82F6',

    // ──── Category ────
    categorySelectedBorder: isDark ? '#22D3EE' : '#7C3AED',
  };
}

export type StoreTheme = ReturnType<typeof useStoreTheme>;
