import { Pressable, View, StyleSheet } from "react-native";
import { TriangleAlert, BellRing, HeartHandshake } from "lucide-react-native";
import { Body, Caption } from "./ui/Text";
import { timeAgo } from "../lib/constants";
import { colors, radius, spacing } from "../theme";

// Single notification row. Emergency alerts get a loud red icon disc and a
// blush highlight when unread.
function iconFor(type) {
  const t = String(type || "").toUpperCase();
  if (t.includes("EMERGENCY")) return { Icon: TriangleAlert, tint: colors.primary, bg: colors.primary50 };
  if (t.includes("RESPONSE")) return { Icon: HeartHandshake, tint: colors.green600, bg: colors.green50 };
  return { Icon: BellRing, tint: colors.tertiary, bg: colors.tertiary50 };
}

export default function NotificationItem({ notification, onPress }) {
  if (!notification) return null;
  const { Icon, tint, bg } = iconFor(notification.type);
  const unread = !notification.read;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        unread && styles.unread,
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <Icon size={18} color={tint} strokeWidth={2.1} />
      </View>
      <View style={styles.body}>
        <Body color={colors.secondary} style={unread ? styles.unreadText : null} numberOfLines={3}>
          {notification.message || "New notification"}
        </Body>
        <Caption>{timeAgo(notification.createdAt)}</Caption>
      </View>
      {unread ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  unread: { backgroundColor: colors.blushSoft },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 3 },
  unreadText: { fontFamily: undefined },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
