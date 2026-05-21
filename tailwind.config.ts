import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

/**
 * ConduPro design system
 * - Primary: violet eléctrico — moderno, premium, distinto del azul corporativo.
 * - Accent:  amber cálido — para CTAs secundarios y badges destacados.
 * - Surface: off-white cálido en light y near-black con tinte violeta en dark.
 * - Tipografía: Plus Jakarta Sans (Google Fonts), geométrica y muy legible en UI.
 * - Radios:  sm 4 / md 8 / lg 16 / xl 24 / full.
 * - Sombras: tintadas con el primario, no negras genéricas.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Visual update — paleta dynamic/sport (landing, login, register)
        brand: {
          primary: '#0AFFE0',
          secondary: '#7000FF',
          dark: '#04020F',
          surface: '#0D0A1E',
          mid: '#1A1535',
          light: '#F0EEFF',
        },
        primary: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        accent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        surface: {
          DEFAULT: '#FAFAF9',
          50: '#FFFFFF',
          100: '#FAFAF9',
          200: '#F4F4F2',
          300: '#E7E5E4',
          400: '#D6D3D1',
          500: '#A8A29E',
          600: '#78716C',
          700: '#44403C',
          800: '#1C1B1F',
          900: '#13121A',
          950: '#0B0A14',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        error: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
        },
        info: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
        display: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
        // Visual update — tipografías para landing/auth (no rompe el dashboard)
        body: ['Inter', ...defaultTheme.fontFamily.sans],
        hero: ['Syne', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-xl': ['3.75rem', { lineHeight: '1.08', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '1.12', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-md': ['2.25rem', { lineHeight: '1.18', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['1.875rem', { lineHeight: '1.22', letterSpacing: '-0.015em', fontWeight: '600' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-md': ['1.25rem', { lineHeight: '1.35', fontWeight: '600' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.55' }],
        'body-md': ['0.9375rem', { lineHeight: '1.5' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.4' }],
        label: ['0.8125rem', { lineHeight: '1.3', fontWeight: '500' }],
      },
      borderRadius: {
        none: '0',
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        full: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(124, 58, 237, 0.06)',
        sm: '0 2px 6px -1px rgba(124, 58, 237, 0.08), 0 1px 2px -1px rgba(124, 58, 237, 0.04)',
        md: '0 6px 16px -4px rgba(124, 58, 237, 0.12), 0 2px 6px -2px rgba(124, 58, 237, 0.06)',
        lg: '0 12px 28px -8px rgba(124, 58, 237, 0.18), 0 4px 10px -4px rgba(124, 58, 237, 0.08)',
        xl: '0 24px 48px -12px rgba(124, 58, 237, 0.22)',
        glow: '0 0 0 4px rgba(124, 58, 237, 0.18)',
        'glow-error': '0 0 0 4px rgba(244, 63, 94, 0.18)',
        'glow-success': '0 0 0 4px rgba(16, 185, 129, 0.18)',
        'inner-soft': 'inset 0 1px 2px 0 rgba(124, 58, 237, 0.08)',
      },
      ringColor: {
        DEFAULT: '#7C3AED',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
        snappy: 'cubic-bezier(0.5, 0, 0.1, 1)',
        // Visual update — easing oficial del estilo dinámico
        brand: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '0': '0ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '400': '400ms',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        // Visual update — keyframes para landing/auth
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-out': 'fade-out 150ms cubic-bezier(0.22, 1, 0.36, 1)',
        'scale-in': 'scale-in 200ms cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-up': 'slide-up 200ms cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-down': 'slide-down 200ms cubic-bezier(0.22, 1, 0.36, 1)',
        'sheet-up': 'sheet-up 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        shimmer: 'shimmer 1.8s linear infinite',
        'spin-slow': 'spin-slow 1.2s linear infinite',
        // Visual update — animaciones del estilo dinámico
        float: 'float 4s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'float-slow': 'float 7s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        marquee: 'marquee 28s linear infinite',
        'bounce-soft': 'bounce-soft 1.6s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 50%, #F59E0B 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(245,158,11,0.12) 100%)',
        'gradient-dark': 'linear-gradient(135deg, #2E1065 0%, #0B0A14 100%)',
        shimmer:
          'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.08) 50%, transparent 100%)',
        // Visual update — gradiente oficial cyan→violeta
        'gradient-dynamic': 'linear-gradient(135deg, #0AFFE0 0%, #7000FF 100%)',
        'gradient-dynamic-soft':
          'linear-gradient(135deg, rgba(10,255,224,0.18) 0%, rgba(112,0,255,0.18) 100%)',
        'gradient-dynamic-radial':
          'radial-gradient(circle at 30% 30%, rgba(10,255,224,0.25) 0%, rgba(112,0,255,0.2) 35%, rgba(4,2,15,0) 70%)',
      },
    },
  },
  plugins: [],
};

export default config;
