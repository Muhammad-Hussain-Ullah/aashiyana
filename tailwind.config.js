/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17231e',
        forest: '#0c7566',
        lime: '#c8dc68',
        paper: '#f6f8f3',
        sand: '#ecefdf',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(26, 55, 45, 0.10)',
        card: '0 10px 30px rgba(26, 55, 45, 0.07)',
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
