// Pulse mobile design tokens — mirrors frontend/tailwind.config.js so the
// native app reads as the same product as the web dashboard.
// Brand: primary red #D92D20, secondary navy #102A43, blush surfaces.

export const colors = {
  // Primary — red
  primary: "#D92D20",
  primary50: "#FDECEA",
  primary100: "#FBD5D1",
  primary200: "#F4A9A1",
  primary600: "#B0241A",
  primary700: "#861B13",

  // Secondary — navy
  secondary: "#102A43",
  secondary50: "#E7EBF0",
  secondary100: "#C5CFDB",
  secondary300: "#5A7794",
  secondary500: "#1A3A5C",
  secondary700: "#0C2034",
  secondary800: "#081625",

  // Tertiary — blue
  tertiary: "#0075C2",
  tertiary50: "#E5F2FB",
  tertiary700: "#004676",

  // Neutral — warm taupe
  neutral: "#8A716E",
  neutral100: "#E9E0DE",
  neutral200: "#D2C1BE",
  neutral300: "#BBA29D",
  neutral500: "#8A716E",
  neutral600: "#6F5A58",
  neutral700: "#534442",

  // Surfaces — blush page + lighter pink cards
  blush: "#F5E1DD",
  blushPage: "#F5E1DD",
  blushCard: "#FBEEEB",
  blushSoft: "#FDF6F4",

  // Status tints
  green50: "#ECFDF5",
  green100: "#D1FAE5",
  green600: "#059669",
  green700: "#047857",
  amber50: "#FFFBEB",
  amber100: "#FEF3C7",
  amber700: "#B45309",

  white: "#FFFFFF",
  black: "#000000",

  // Semantic aliases
  text: "#102A43",
  textMuted: "#6F5A58",
  textFaint: "#8A716E",
  border: "#E9E0DE",
  borderStrong: "#D2C1BE",
  bg: "#FDF6F4",
};

// Manrope weights from @expo-google-fonts/manrope (loaded in App.js).
export const fonts = {
  regular: "Manrope_400Regular",
  medium: "Manrope_500Medium",
  semibold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
  extrabold: "Manrope_800ExtraBold",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 999,
};

export const fontSize = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
};

// Soft elevation used by Card and floating surfaces.
export const shadow = {
  card: {
    shadowColor: "#102A43",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  elevated: {
    shadowColor: "#D92D20",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },
};

const theme = { colors, fonts, spacing, radius, fontSize, shadow };
export default theme;
