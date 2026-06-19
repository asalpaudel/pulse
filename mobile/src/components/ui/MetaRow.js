import { View, StyleSheet } from "react-native";
import { AppText } from "./Text";
import { colors, spacing, fonts } from "../../theme";

// Icon + label meta row used inside cards (distance, units, time, etc.).
export default function MetaRow({ icon: Icon, children, color = colors.neutral600, iconColor, style }) {
  return (
    <View style={[styles.row, style]}>
      {Icon ? <Icon size={15} color={iconColor || colors.neutral400} strokeWidth={2} /> : null}
      <AppText weight="medium" size={13} color={color} style={styles.text}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  text: { flex: 1 },
});
