import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        police: {
          navy: '#0a192f',
          dark: '#020c1b',
          blue: '#1e3a8a',
          accent: '#3b82f6',
          gold: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
