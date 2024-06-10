/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        background: "#1e1e20",
        primary: "#dfdfd7",
        secondary: "#9999a0",
        card: "#252529",
        main: "#e36002",
        button: "#877eff"
      },
      animation: {
        spin: 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
}