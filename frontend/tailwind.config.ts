import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fdfcf9',
          100: '#faf7f0',
          200: '#f5f0e6',
          300: '#ede5d8',
          400: '#ded1bd',
          500: '#cbb79a',
          DEFAULT: '#f7f4ed',
        },
        crimson: {
          50: '#fdf2f2',
          100: '#fde8e8',
          200: '#fbd5d5',
          300: '#f8b4b4',
          400: '#f98080',
          500: '#f05252',
          600: '#e02424',
          700: '#c81e1e',
          800: '#9b1c1c',
          900: '#771d1d',
          DEFAULT: '#991b1b',
        },
        mahogany: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
          DEFAULT: '#78350f',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          DEFAULT: '#d97706',
        },
        police: {
          navy: '#2d1515',
          dark: '#1c1917',
          blue: '#991b1b',
          accent: '#b91c1c',
          gold: '#d97706',
        },
      },
      fontFamily: {
        serif: ['Cinzel', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;

