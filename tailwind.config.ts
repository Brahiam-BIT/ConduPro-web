import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

/**
 * ConduPro design system — Apple-minimal redesign.
 *
 * Principles:
 *  - Light, spacious, single accent (#0071E3 — Apple blue).
 *  - Typography is the primary visual element (Inter).
 *  - Subtle neutral shadows; no neon/violet/cyan glows.
 *  - Dashboard color *scales* are kept (primary/accent/surface/success/warning/error/info)
 *    but recolored to the Apple-blue / system palette so legacy classes don't break.
 *  - New *semantic* tokens (`bg.*`, `text.*`, `border`, `accent`, `surface`, `hero.*`)
 *    are exposed so new components can use `bg-bg-primary`, `text-text-secondary`, etc.
 *  - Legacy `brand.*` / `font-hero` aliases redirect to the new neutral palette.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── New Apple semantic tokens ─────────────────────────────
        bg: {
          primary: 'rgb(var(--cp-bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--cp-bg-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--cp-bg-tertiary) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--cp-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--cp-text-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--cp-text-tertiary) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--cp-border) / <alpha-value>)',
        },
        hero: {
          bg: '#000000',
          surface: '#1C1C1E',
        },

        // ─── Accent ────────────────────────────────────────────────
        // `bg-accent` / `text-accent` use DEFAULT (Apple blue).
        // `bg-accent-hover` is provided. `bg-accent-50..900` provide a soft
        // tonal scale for hover states, badges, etc.
        accent: {
          DEFAULT: '#0071E3',
          hover: '#0077ED',
          50: '#EAF4FE',
          100: '#D0E4FC',
          200: '#A8CCF8',
          300: '#75B0F2',
          400: '#3F92EB',
          500: '#0071E3',
          600: '#005EBE',
          700: '#004C99',
          800: '#003975',
          900: '#002651',
        },

        // ─── Surface ───────────────────────────────────────────────
        // DEFAULT is the new card surface (#FBFBFD). Scales reassigned to a
        // neutral Apple-gray ladder for legacy `bg-surface-*` callers.
        surface: {
          DEFAULT: 'rgb(var(--cp-surface-default) / <alpha-value>)',
          50: '#FFFFFF',
          100: '#FBFBFD',
          200: '#F5F5F7',
          300: '#E8E8ED',
          400: '#D2D2D7',
          500: '#AEAEB2',
          600: '#6E6E73',
          700: '#48484A',
          800: '#1D1D1F',
          900: '#000000',
          950: '#000000',
        },

        // ─── Legacy `primary` scale → re-mapped to Apple blue ──────
        // Kept so existing dashboard utilities (`bg-primary-50` …) keep
        // working with the new look.
        primary: {
          50: '#EAF4FE',
          100: '#D0E4FC',
          200: '#A8CCF8',
          300: '#75B0F2',
          400: '#3F92EB',
          500: '#0071E3',
          600: '#005EBE',
          700: '#004C99',
          800: '#003975',
          900: '#002651',
          950: '#001530',
        },

        // ─── Apple system colors ───────────────────────────────────
        success: {
          50: '#E8F8EE',
          100: '#D1F1DD',
          500: '#34C759',
          600: '#2BA84B',
          700: '#21873C',
        },
        warning: {
          50: '#FFF7E5',
          100: '#FFEDC2',
          500: '#FF9500',
          600: '#D67E00',
          700: '#A86200',
        },
        error: {
          50: '#FFE9E7',
          100: '#FFCFCB',
          500: '#FF3B30',
          600: '#D7332A',
          700: '#A82822',
        },
        info: {
          50: '#EAF4FE',
          100: '#D0E4FC',
          500: '#0071E3',
          600: '#005EBE',
          700: '#004C99',
        },

        // ─── Legacy `brand.*` (used by remaining auth/landing helpers)
        // Mapped onto the new neutral palette so old class names degrade
        // gracefully while we finish the migration.
        brand: {
          primary: '#0071E3',
          secondary: '#0077ED',
          dark: '#1D1D1F',
          surface: '#FBFBFD',
          mid: '#D2D2D7',
          light: '#FFFFFF',
        },
      },
      fontFamily: {
        // Inter is now the single UI typeface (Apple SF stand-in).
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Inter', ...defaultTheme.fontFamily.sans],
        body: ['Inter', ...defaultTheme.fontFamily.sans],
        // Aliases kept for legacy classes — both point to Inter.
        hero: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '600' }],
        'display-xl': ['3.75rem', { lineHeight: '1.08', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-lg': ['3rem', { lineHeight: '1.12', letterSpacing: '-0.025em', fontWeight: '600' }],
        'display-md': ['2.25rem', { lineHeight: '1.18', letterSpacing: '-0.02em', fontWeight: '600' }],
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
        lg: '12px',
        xl: '14px',
        '2xl': '16px',
        '3xl': '20px',
        full: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.06), 0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        md: '0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        lg: '0 12px 24px -8px rgba(0, 0, 0, 0.10)',
        xl: '0 24px 48px -12px rgba(0, 0, 0, 0.12)',
        glow: '0 0 0 4px rgba(0, 113, 227, 0.18)',
        'glow-error': '0 0 0 4px rgba(255, 59, 48, 0.18)',
        'glow-success': '0 0 0 4px rgba(52, 199, 89, 0.18)',
        'inner-soft': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
      },
      ringColor: {
        DEFAULT: '#0071E3',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
        snappy: 'cubic-bezier(0.5, 0, 0.1, 1)',
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
      },
      backgroundImage: {
        // Subtle radial used by the register page background.
        'register-radial':
          'radial-gradient(ellipse at 60% 0%, #E8F0FE 0%, #F5F5F7 40%, #FFFFFF 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
