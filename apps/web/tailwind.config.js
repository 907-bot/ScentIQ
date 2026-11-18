/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#151e2e',
          950: '#0a0f1d',
        },
        scent: {
          teal: '#14b8a6',
          violet: '#8b5cf6',
          amber: '#f59e0b',
          rose: '#f43f5e',
          cyan: '#06b6d4',
        }
      }
    },
  },
  plugins: [],
}
