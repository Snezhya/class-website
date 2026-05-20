/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        brand: {
          950: '#030712', // GitHub dark dark
          900: '#0b1326', // deep navy background
          800: '#111b33', // slightly lighter navy card background
          700: '#1d2c4f', // borders and accents
          600: '#2c3e6b',
          500: '#3b82f6', // primary blue
          400: '#60a5fa',
          300: '#93c5fd',
          200: '#bfdbfe',
          100: '#dbeafe',
          50: '#eff6ff',
        },
        terminal: {
          green: '#10b981',
          cyan: '#06b6d4',
          blue: '#3b82f6',
          yellow: '#f59e0b',
          red: '#ef4444',
          gray: '#9ca3af',
          dark: '#030712',
          black: '#02040a',
        }
      },
    },
  },
  plugins: [],
}
