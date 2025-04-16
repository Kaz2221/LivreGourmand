/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: "#4A4A5C", // Couleur principale (gris bleu)
          secondary: "#B39B84", // Couleur secondaire (brun rosé)
          background: "#F5E6D3", // Couleur de fond (beige doux)
          white: "#F8F3EE", // Blanc cassé
        },
      },
    },
    plugins: [],
  }