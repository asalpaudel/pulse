import { View, StyleSheet } from "react-native";
import { AppText, Label } from "./Text";
import { colors, radius, shadow, spacing, fonts } from "../../theme";

// Small white card: tinted icon square, uppercase label, large value.
// `tint`: red | blue | green | amber | navy.
const TINTS = {
  red: { bg: colors.primary50, fg: colors.primary },
  blue: { bg: colors.tertiary50, fg: colors.tertiary },
  green: { bg: colors.green50, fg: colors.green600 },
  amber: { bg: colors.amber50, fg: colors.amber700 },
  navy: { bg: colors.secondary50, fg: colors.secondary },
};

export default function StatCard({ icon: Icon, label, value, tint = "red", style }) {
  const t = TINTS[tint] || TINTS.red;
  return (
    <View style={[styles.card, shadow.card, style]}>
      {Icon ? (
        <View style={[styles.iconBox, { backgroundColor: t.bg }]}>
          <Icon size={20} color={t.fg} strokeWidth={2} />
        </View>
      ) : null}
      <View style={styles.text}>
        <Label numberOfLines={1}>{label}</Label>
        <AppText weight="extrabold" size={26} color={colors.secondary} style={styles.value}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral100,
    padding: spacing.lg,
    gap: spacing.md,
    minWidth: 0,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { gap: 2 },
  value: { letterSpacing: -0.5 },
});
