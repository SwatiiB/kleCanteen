/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary color - warm orange
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Main primary color
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Secondary color - fresh mint green
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Main secondary color
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Accent color - vibrant coral
        accent: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e', // Main accent color
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        // Background colors - warm tones
        background: {
          light: '#fff7ed', // Light warm background (primary-50)
          default: '#ffedd5', // Default background (primary-100)
          dark: '#fed7aa', // Darker background (primary-200)
          card: '#fff7ed', // Card background
          sidebar: '#7c2d12', // Sidebar background (primary-900)
          header: '#9a3412', // Header background (primary-800)
        },
        // Neutral colors with warmer tones
        neutral: {
          50: '#fafaf8', // Slightly warm white
          100: '#f5f5f0', // Warm off-white
          200: '#e5e5e0', // Warm light gray
          300: '#d4d4d0', // Warm medium-light gray
          400: '#a3a39e', // Warm medium gray
          500: '#73736e', // Warm gray
          600: '#52524d', // Warm dark gray
          700: '#40403b', // Warm darker gray
          800: '#262622', // Warm very dark gray
          900: '#171715', // Warm almost black
          950: '#0a0a09', // Warm black
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 0 20px rgba(0, 0, 0, 0.05)',
        'hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}