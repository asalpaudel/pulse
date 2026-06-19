import { View, StyleSheet } from "react-native";
import { Inbox } from "lucide-react-native";
import { Title, Body } from "./Text";
import Button from "./Button";
import { colors, radius, spacing } from "../../theme";

// On-brand empty state — soft blush icon disc, title, supporting line,
// optional CTA. Used for empty feeds, lists, history.
export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  message,
  actionLabel,
  onAction,
  style,
}) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.disc}>
        <Icon size={30} color={colors.primary} strokeWidth={1.8} />
      </View>
      <Title style={styles.title}>{title}</Title>
      {message ? (
        <Body color={colors.neutral500} style={styles.message}>
          {message}
        </Body>
      ) : null}
      {actionLabel ? (
        <Button title={actionLabel} onPress={onAction} fullWidth={false} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: spacing["3xl"], paddingHorizontal: spacing.xl },
  disc: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.blushCard,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: { textAlign: "center" },
  message: { textAlign: "center", marginTop: 6, maxWidth: 280 },
  action: { marginTop: spacing.xl },
});
