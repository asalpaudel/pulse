/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pulse: {
          DEFAULT: "#7a1f1f",
          dark: "#4a0f0f",
          light: "#a83232",
        },
      },
    },
  },
  plugins: [],
}

