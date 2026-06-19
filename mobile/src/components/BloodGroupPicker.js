import { View, Pressable, StyleSheet } from "react-native";
import { BloodGroupBadge, Label, Caption } from "./ui";
import { BLOOD_GROUPS } from "../lib/constants";
import { colors, radius, spacing } from "../theme";

// Elegant selectable grid of blood groups. Selected group renders solid + a
// lifted blush tile; the rest stay as outline badges. Screen-local helper for
// the donor register flow.
export default function BloodGroupPicker({ value, onChange, error }) {
  return (
    <View style={styles.wrap}>
      <Label style={styles.label}>Blood group</Label>
      <View style={styles.grid}>
        {BLOOD_GROUPS.map((bg) => {
          const selected = value === bg;
          return (
            <Pressable
              key={bg}
              onPress={() => onChange(bg)}
              style={({ pressed }) => [
                styles.tile,
                selected && styles.tileSelected,
                pressed && !selected && styles.tilePressed,
              ]}
            >
              <BloodGroupBadge
                group={bg}
                size="sm"
                variant={selected ? "solid" : "outline"}
              />
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Caption color={colors.primary} style={styles.error}>
          {error}
        </Caption>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  label: { marginLeft: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  tile: {
    width: "23%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral100,
    backgroundColor: colors.white,
  },
  tileSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.blushCard,
  },
  tilePressed: { backgroundColor: colors.blushSoft },
  error: { marginLeft: 2 },
});
