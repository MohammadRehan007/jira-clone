/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jira: {
          blue: '#0052CC',
          'blue-hover': '#0065FF',
          dark: '#0747A6',
          bg: '#091E42',
          surface: '#172B4D',
          panel: '#091e4280',
          board: '#F4F5F7',
          card: '#FFFFFF',
          text: '#172B4D',
          subtle: '#6B778C'
        }
      }
    },
  },
  plugins: [],
}
