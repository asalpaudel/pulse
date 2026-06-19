import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Body } from "./Text";
import { colors, spacing } from "../../theme";

// Centered loading state with an optional caption.
export default function Spinner({ label, size = "large", style }) {
  return (
    <View style={[styles.wrap, style]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {label ? (
        <Body color={colors.neutral500} style={styles.label}>
          {label}
        </Body>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing["3xl"], gap: spacing.md },
  label: { textAlign: "center" },
});
