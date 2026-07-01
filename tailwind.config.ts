import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0F172A',
        ice: '#F1F5F9',
        slate: '#94A3B8',
        indigo: '#6366F1',
        aurora: '#22D3AA',
        mint: '#6EE7B7',
        surface: '#1E293B',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-inter)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
