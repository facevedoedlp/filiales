/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#c41230',
          light: '#e63946',
          dark: '#9d0e22',
        },
      },
    },
  },
  plugins: [],
}

