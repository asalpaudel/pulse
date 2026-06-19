import { Pressable, ActivityIndicator, StyleSheet, View } from "react-native";
import { AppText } from "./Text";
import { colors, fonts, radius, shadow, spacing } from "../../theme";

// Variants mirror the web Button: primary (red), inverted (navy),
// secondary (blush), outline, ghost, danger.
const VARIANTS = {
  primary: { bg: colors.primary, pressed: colors.primary600, text: colors.white, border: "transparent", shadow: true },
  inverted: { bg: colors.secondary, pressed: colors.secondary500, text: colors.white, border: "transparent", shadow: true },
  secondary: { bg: colors.blushCard, pressed: colors.blushSoft, text: colors.primary, border: colors.primary100 },
  outline: { bg: colors.white, pressed: colors.blushSoft, text: colors.secondary, border: colors.neutral200 },
  ghost: { bg: "transparent", pressed: colors.neutral100, text: colors.neutral600, border: "transparent" },
  danger: { bg: colors.primary600, pressed: colors.primary700, text: colors.white, border: "transparent", shadow: true },
};

const SIZES = {
  sm: { padV: 9, padH: 14, font: 13, minH: 38 },
  md: { padV: 13, padH: 18, font: 15, minH: 50 },
  lg: { padV: 16, padH: 22, font: 16, minH: 56 },
};

export default function Button({
  variant = "primary",
  size = "md",
  title,
  children,
  onPress,
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight = false,
  fullWidth = true,
  style,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;
  const label = title || children;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        v.shadow && shadow.card,
        {
          backgroundColor: pressed && !isDisabled ? v.pressed : v.bg,
          borderColor: v.border,
          paddingVertical: s.padV,
          paddingHorizontal: s.padH,
          minHeight: s.minH,
          opacity: isDisabled ? 0.55 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <View style={styles.content}>
          {Icon && !iconRight ? <Icon size={18} color={v.text} strokeWidth={2.1} /> : null}
          {label ? (
            <AppText weight="bold" size={s.font} color={v.text} style={styles.label}>
              {label}
            </AppText>
          ) : null}
          {Icon && iconRight ? <Icon size={18} color={v.text} strokeWidth={2.1} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  label: { includeFontPadding: false },
});
