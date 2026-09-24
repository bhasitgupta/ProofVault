import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: {
        lg: '0.75rem',
        md: 'calc(0.75rem - 2px)',
        sm: 'calc(0.75rem - 4px)',
      },
      colors: {
        // ── Proof Vault Brand Palette ──────────────────────────────
        smoky: {
          DEFAULT: '#11120D',
          900: '#11120D',
          800: '#1e1f18',
          700: '#2b2c23',
          600: '#3a3b31',
        },
        olive: {
          DEFAULT: '#565449',
          700: '#3e3c33',
          600: '#565449',
          500: '#6e6b5e',
          400: '#888573',
          300: '#a09d8f',
          200: '#c0bdb2',
        },
        bone: {
          DEFAULT: '#D8CFBC',
          100: '#f2ede4',
          200: '#e8e0d1',
          300: '#D8CFBC',
          400: '#c4baa5',
          500: '#b0a68e',
          600: '#9a9080',
        },
        floral: {
          DEFAULT: '#FFFBF4',
          50: '#FFFBF4',
          100: '#fdf6eb',
          200: '#f7edd8',
        },
        // Legacy aliases
        parchment: {
          50: '#FFFBF4',
          100: '#fdf6eb',
          200: '#f7edd8',
          300: '#e8e0d1',
          400: '#D8CFBC',
          DEFAULT: '#FFFBF4',
        },
        crimson: {
          50: '#fdf4f4',
          100: '#fbe8e8',
          200: '#f7d2d2',
          300: '#f0a9a9',
          400: '#e67a7a',
          500: '#d44f4f',
          600: '#b83030',
          700: '#962020',
          800: '#7a1818',
          900: '#5e1212',
          DEFAULT: '#7a1818',
        },
        mahogany: { DEFAULT: '#543227' },
        gold: {
          400: '#c8a84b',
          500: '#b8963c',
          600: '#9e7e2a',
          700: '#7e621a',
          DEFAULT: '#b8963c',
        },
        police: {
          navy: '#0F172A',
          dark: '#1E293B',
          blue: '#2563EB',
          accent: '#DC2626',
          gold: '#D97706',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        display: ['Inter', 'sans-serif'],
      },
      animation: {
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'float-med': 'floatMed 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'orbit': 'orbit 20s linear infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-18px) rotate(1deg)' },
        },
        floatMed: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
