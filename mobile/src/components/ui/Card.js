import { View, StyleSheet } from "react-native";
import { colors, radius, shadow, spacing } from "../../theme";

// Base surface — white, rounded, soft shadow, hairline border.
// Mirrors the web design spec's default Card.
export default function Card({ style, padded = true, elevated = false, children, ...rest }) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        elevated ? shadow.elevated : shadow.card,
        elevated && styles.elevatedBorder,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius["2xl"],
    borderWidth: 1,
    borderColor: colors.neutral100,
  },
  padded: { padding: spacing.xl },
  elevatedBorder: { borderColor: colors.primary100 },
});
