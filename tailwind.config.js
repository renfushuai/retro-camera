/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        handwritten: ['"Patrick Hand"', 'cursive'], // We'll need to import this font
      },
      colors: {
        retro: {
          bg: '#f4f1ea',
          camera: '#333333',
          accent: '#d9534f',
        }
      }
    },
  },
  plugins: [],
}
