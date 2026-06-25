/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Defaulting to sleek dark designs
  theme: {
    extend: {
      colors: {
        jurixis: {
          50: '#f4f6fa',
          100: '#e8ecf5',
          200: '#cbd6eb',
          300: '#9fb5dc',
          400: '#6c8dc9',
          500: '#476ab4',
          600: '#375293',
          700: '#2d4379',
          800: '#283864',
          950: '#090d16', // Slate dark base background
          900: '#111827', // Card background
        },
        accent: {
          blue: '#3b82f6',
          teal: '#14b8a6',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
