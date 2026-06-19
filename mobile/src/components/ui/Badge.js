import { View, StyleSheet } from "react-native";
import { AppText } from "./Text";
import { colors, radius, fonts } from "../../theme";

// Tone → tint mapping per the design spec.
const TONES = {
  red: { bg: colors.primary50, fg: colors.primary700 },
  amber: { bg: colors.amber50, fg: colors.amber700 },
  blue: { bg: colors.tertiary50, fg: colors.tertiary700 },
  green: { bg: colors.green50, fg: colors.green700 },
  neutral: { bg: colors.neutral100, fg: colors.neutral600 },
  solidRed: { bg: colors.primary, fg: colors.white },
};

export default function Badge({ tone = "neutral", icon: Icon, children, style }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }, style]}>
      {Icon ? <Icon size={12} color={t.fg} strokeWidth={2.4} /> : null}
      <AppText weight="bold" size={11} color={t.fg} style={styles.text}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: { letterSpacing: 0.3, includeFontPadding: false },
});
