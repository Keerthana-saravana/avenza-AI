/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FFF9FC',
          primary: '#8B5CF6',
          secondary: '#EC4899',
          accent: '#F472B6',
          dark: '#1E1B4B', // Luxury dark purple for contrast text
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
