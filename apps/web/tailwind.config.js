/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#7C3AED',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#06B6D4',
          light: '#22D3EE',
          dark: '#0891B2',
          foreground: '#FFFFFF',
        },
        // Status colors (pastel)
        success: {
          DEFAULT: '#86EFAC',
          dark: '#22C55E',
          background: '#F0FDF4',
        },
        warning: {
          DEFAULT: '#FDE68A',
          dark: '#F59E0B',
          background: '#FFFBEB',
        },
        error: {
          DEFAULT: '#FCA5A5',
          dark: '#EF4444',
          background: '#FEF2F2',
        },
        info: {
          DEFAULT: '#93C5FD',
          dark: '#3B82F6',
          background: '#EFF6FF',
        },
        // Light mode
        background: '#FAFAFA',
        surface: '#FFFFFF',
        foreground: '#1F2937',
        muted: {
          DEFAULT: '#F3F4F6',
          foreground: '#6B7280',
        },
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#8B5CF6',
        // Dark mode specific
        dark: {
          background: '#1A1A2E',
          surface: '#252542',
          foreground: '#F9FAFB',
          muted: '#374151',
          border: '#374151',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '16px',
        md: '8px',
        sm: '4px',
        pill: '9999px',
      },
      boxShadow: {
        // Neumorphism light
        'neu': '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
        'neu-sm': '4px 4px 8px #d1d5db, -4px -4px 8px #ffffff',
        'neu-lg': '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff',
        'neu-inset': 'inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff',
        // Neumorphism dark
        'neu-dark': '8px 8px 16px #0f0f1a, -8px -8px 16px #252542',
        'neu-dark-sm': '4px 4px 8px #0f0f1a, -4px -4px 8px #252542',
        'neu-dark-lg': '12px 12px 24px #0f0f1a, -12px -12px 24px #252542',
        'neu-dark-inset': 'inset 4px 4px 8px #0f0f1a, inset -4px -4px 8px #252542',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 1.5s infinite',
        spin: 'spin 1s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
