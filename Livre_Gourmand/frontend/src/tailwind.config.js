/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4A4A5C",
        secondary: "#B39B84",
        background: "#F5E6D3",
        white: "#F8F3EE",
      },
    },
  },
  plugins: [],
}