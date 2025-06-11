/* eslint-env node */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // This enables class-based dark mode
  content: [
    "./index.html", // Explicitly include index.html
    "./src/pages/Dashbord.jsx", // Be very specific for the dashboard test case
    "./src/**/*.{js,jsx,ts,tsx}", // Keep the original broader pattern
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}