/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    safelist: [
      'text-green-400',
      'text-red-400',
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  