/** @type {import('tailwindcss').Config} */
const theme = require('./theme/config')

module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: theme.colors,
      spacing: theme.spacing,
      borderRadius: theme.borderRadius,
      fontSize: theme.fontSize,
      boxShadow: theme.shadows,
      transitionDuration: theme.transitions.duration,
      transitionTimingFunction: theme.transitions.easing,
    },
  },
  plugins: [],
}