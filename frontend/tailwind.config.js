/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      colors: {
        // Primary — #D92D20 (red)
        primary: {
          50: "#FDECEA",
          100: "#FBD5D1",
          200: "#F4A9A1",
          300: "#EC7D72",
          400: "#E45446",
          500: "#D92D20",
          DEFAULT: "#D92D20",
          600: "#B0241A",
          700: "#861B13",
          800: "#5C120D",
          900: "#320A07",
          950: "#1E0604",
        },
        // Secondary — #102A43 (navy)
        secondary: {
          50: "#E7EBF0",
          100: "#C5CFDB",
          200: "#8FA3B8",
          300: "#5A7794",
          400: "#2E4D6E",
          500: "#1A3A5C",
          600: "#102A43",
          DEFAULT: "#102A43",
          700: "#0C2034",
          800: "#081625",
          900: "#040B15",
        },
        // Tertiary — #0075C2 (blue)
        tertiary: {
          50: "#E5F2FB",
          100: "#BFDFF4",
          200: "#80BFEA",
          300: "#409FDF",
          400: "#1185D0",
          500: "#0075C2",
          DEFAULT: "#0075C2",
          600: "#005E9C",
          700: "#004676",
          800: "#002F4F",
          900: "#001729",
        },
        // Neutral — #8A716E (warm taupe)
        neutral: {
          50: "#F6F2F1",
          100: "#E9E0DE",
          200: "#D2C1BE",
          300: "#BBA29D",
          400: "#A2867F",
          500: "#8A716E",
          DEFAULT: "#8A716E",
          600: "#6F5A58",
          700: "#534442",
          800: "#382D2C",
          900: "#1C1716",
        },
        // Surfaces — blush page + lighter pink cards
        blush: {
          DEFAULT: "#F5E1DD",
          page: "#F5E1DD",
          card: "#FBEEEB",
          soft: "#FDF6F4",
        },
        // Back-compat alias — existing `pulse` classes map to primary red
        pulse: {
          DEFAULT: "#D92D20",
          dark: "#B0241A",
          light: "#E45446",
        },
      },
    },
  },
  plugins: [],
}
