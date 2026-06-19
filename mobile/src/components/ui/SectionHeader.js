import { View, Pressable, StyleSheet } from "react-native";
import { Title, Caption, AppText } from "./Text";
import { colors, spacing } from "../../theme";

// Bold section title + optional subtitle, with an optional right action link.
export default function SectionHeader({ title, subtitle, actionLabel, onAction, style }) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.left}>
        <Title>{title}</Title>
        {subtitle ? <Caption style={styles.sub}>{subtitle}</Caption> : null}
      </View>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <AppText weight="bold" size={13} color={colors.primary}>
            {actionLabel} →
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  left: { flex: 1, gap: 2 },
  sub: { marginTop: 1 },
});
