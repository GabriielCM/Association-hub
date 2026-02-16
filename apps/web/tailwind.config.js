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
        // Glassmorphism
        'glass': '0 8px 32px rgba(139, 92, 246, 0.15)',
        'glass-lg': '0 12px 48px rgba(139, 92, 246, 0.2)',
        'glow-purple': '0 0 60px rgba(139, 92, 246, 0.3)',
        'glow-purple-sm': '0 0 30px rgba(139, 92, 246, 0.2)',
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
        'fade-scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'fade-scale-out': {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.95)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)' },
          '50%': { boxShadow: '0 0 80px rgba(139, 92, 246, 0.4)' },
        },
        'float-orb': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 1.5s infinite',
        spin: 'spin 1s linear infinite',
        'fade-scale-in': 'fade-scale-in 0.3s ease-out forwards',
        'fade-scale-out': 'fade-scale-out 0.2s ease-in forwards',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'float-orb': 'float-orb 20s ease-in-out infinite',
        'bounce-soft': 'bounce-soft 0.3s ease-in-out',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
