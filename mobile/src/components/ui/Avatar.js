import { View, StyleSheet } from "react-native";
import { AppText } from "./Text";
import { colors, radius } from "../../theme";

function initials(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/);
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}

// Initials avatar with the brand blush tint.
export default function Avatar({ name, size = 44, tint = "blush", style }) {
  const palette =
    tint === "navy"
      ? { bg: colors.secondary, fg: colors.white }
      : tint === "red"
        ? { bg: colors.primary, fg: colors.white }
        : { bg: colors.blushCard, fg: colors.primary };
  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: palette.bg },
        style,
      ]}
    >
      <AppText weight="bold" size={size * 0.38} color={palette.fg}>
        {initials(name).toUpperCase()}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: "center", justifyContent: "center" },
});
