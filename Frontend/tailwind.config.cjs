/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "itf-darkSurface": "#0b132f",
        "itf-darkCard": "#111c42",
        "itf-darkBorder": "#1f2e55",
        "itf-accent": "#6b35f4",
      },
    },
  },
  plugins: [],
};
