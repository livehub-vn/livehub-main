/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      ringOpacity: {
        DEFAULT: '0.5',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  variants: {
    extend: {
      opacity: ['focus', 'hover', 'active', 'disabled'],
      backgroundColor: ['focus', 'hover', 'active', 'disabled'],
      ringOpacity: ['focus', 'hover', 'active'],
      ringColor: ['focus', 'hover', 'active'],
      ringWidth: ['focus', 'hover', 'active'],
    },
  },
} 