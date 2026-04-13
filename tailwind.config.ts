import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        smoke: {
          50: '#f7f6f5',
          100: '#ede8e3',
          200: '#dcd4ca',
          300: '#cfc0ad',
          400: '#c2ac90',
          500: '#b59873',
          600: '#a2825d',
          700: '#7d6447',
          800: '#5d4a33',
          900: '#3d3024',
          950: '#2a211a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
