/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0d1117',
          100: '#161b22',
          200: '#21262d',
          300: '#30363d',
          400: '#484f58',
          500: '#6e7681',
          600: '#8b949e',
          700: '#c9d1d9',
          800: '#f0f6fc',
        },
      },
    },
  },
  plugins: [],
}