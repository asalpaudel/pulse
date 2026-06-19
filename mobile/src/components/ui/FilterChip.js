import { Pressable, StyleSheet } from "react-native";
import { AppText } from "./Text";
import { colors, radius, spacing } from "../../theme";

// Rounded filter pill. Active = solid red; inactive = white w/ border.
export default function FilterChip({ label, active = false, icon: Icon, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active
          ? { backgroundColor: colors.primary, borderColor: colors.primary }
          : { backgroundColor: colors.white, borderColor: colors.neutral200 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {Icon ? (
        <Icon size={14} color={active ? colors.white : colors.neutral600} strokeWidth={2.1} />
      ) : null}
      <AppText weight="semibold" size={13} color={active ? colors.white : colors.neutral700}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
  },
});
