import { View, StyleSheet } from "react-native";
import { AppText } from "./Text";
import { bloodGroupLabel } from "../../lib/constants";
import { colors, radius } from "../../theme";

// Circular blood-group badge. variant: "solid" | "outline". size: sm|md|lg.
const SIZES = {
  sm: { box: 38, font: 13 },
  md: { box: 50, font: 16 },
  lg: { box: 60, font: 20 },
};

export default function BloodGroupBadge({ group, variant = "solid", size = "md", style }) {
  const s = SIZES[size] || SIZES.md;
  const label = group?.includes("_") ? bloodGroupLabel(group) : group || "—";
  const solid = variant === "solid";
  return (
    <View
      style={[
        styles.badge,
        { width: s.box, height: s.box, borderRadius: s.box / 2 },
        solid
          ? { backgroundColor: colors.primary }
          : { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.primary },
        style,
      ]}
    >
      <AppText weight="extrabold" size={s.font} color={solid ? colors.white : colors.primary}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: "center", justifyContent: "center" },
});
