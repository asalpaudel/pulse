import { View, Switch, StyleSheet } from "react-native";
import { CircleCheck, CircleSlash } from "lucide-react-native";
import Card from "./ui/Card";
import { Heading, Body } from "./ui/Text";
import { colors, radius, spacing } from "../theme";

/**
 * Donor availability status card with an inline toggle.
 *  - available : bool
 *  - onToggle  : (nextValue) => void
 *  - loading   : disables the switch while a PUT is in flight
 */
export default function AvailabilityCard({ available, onToggle, loading = false }) {
  const tint = available
    ? { bg: colors.green50, border: colors.green100, fg: colors.green700, Icon: CircleCheck }
    : { bg: colors.neutral100, border: colors.neutral200, fg: colors.neutral600, Icon: CircleSlash };
  const Icon = tint.Icon;

  return (
    <Card padded style={[styles.card, { backgroundColor: tint.bg, borderColor: tint.border }]}>
      <View style={styles.left}>
        <View style={[styles.iconBox, { backgroundColor: colors.white }]}>
          <Icon size={22} color={tint.fg} strokeWidth={2.1} />
        </View>
        <View style={styles.text}>
          <Heading color={tint.fg}>
            {available ? "Available to donate" : "Currently unavailable"}
          </Heading>
          <Body color={colors.neutral600} size={13}>
            {available
              ? "You'll receive nearby emergency alerts"
              : "Turn on to get matched with requests"}
          </Body>
        </View>
      </View>
      <Switch
        value={!!available}
        onValueChange={onToggle}
        disabled={loading}
        trackColor={{ false: colors.neutral200, true: colors.green600 }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.neutral200}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  left: { flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: 2 },
});
