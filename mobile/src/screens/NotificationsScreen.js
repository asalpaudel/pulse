import { useCallback, useMemo, useState } from "react";
import {
  View,
  SectionList,
  Pressable,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { Bell, CheckCheck } from "lucide-react-native";
import {
  Screen,
  Spinner,
  EmptyState,
  Title,
  Label,
  Caption,
  AppText,
} from "../components/ui";
import { LogoMark } from "../components/Logo";
import NotificationItem from "../components/NotificationItem";
import { useNotifications } from "../context/NotificationsContext";
import { useToast } from "../context/ToastContext";
import { colors, spacing, radius, fontSize, shadow } from "../theme";

// --- date bucketing helpers -------------------------------------------------
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

// Returns a human label for the day a notification belongs to.
function bucketLabel(iso) {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return "Earlier";
  const today = startOfDay(new Date());
  const day = startOfDay(t);
  const diffDays = Math.round((today - day) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This week";
  return "Earlier";
}

// Group an already-newest-first list into ordered sections.
function buildSections(notifications) {
  const order = ["Today", "Yesterday", "This week", "Earlier"];
  const byLabel = {};
  notifications.forEach((n) => {
    const label = bucketLabel(n.createdAt);
    if (!byLabel[label]) byLabel[label] = [];
    byLabel[label].push(n);
  });
  return order
    .filter((label) => byLabel[label]?.length)
    .map((label) => ({ title: label, data: byLabel[label] }));
}

export default function NotificationsScreen() {
  const { notifications, unreadCount, loading, load, markRead, markAllRead } =
    useNotifications();
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const sections = useMemo(
    () => buildSections(notifications),
    [notifications],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } catch {
      toast.error("Couldn't refresh notifications");
    } finally {
      setRefreshing(false);
    }
  }, [load, toast]);

  const handleMarkAll = useCallback(async () => {
    try {
      await markAllRead();
    } catch {
      toast.error("Couldn't mark all as read");
    }
  }, [markAllRead, toast]);

  const isEmpty = notifications.length === 0;

  // First paint, nothing loaded yet.
  if (loading && isEmpty) {
    return (
      <Screen scroll={false}>
        <Hero unreadCount={0} onMarkAll={handleMarkAll} />
        <View style={styles.center}>
          <Spinner label="Loading notifications…" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false} padded={false}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[
          styles.listContent,
          isEmpty && styles.listContentEmpty,
        ]}
        ListHeaderComponent={
          <Hero unreadCount={unreadCount} onMarkAll={handleMarkAll} />
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Label color={colors.neutral500}>{section.title}</Label>
            <View style={styles.sectionLine} />
          </View>
        )}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => !item.read && markRead(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        ListEmptyComponent={
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            message="Alerts about nearby emergencies, request responses and events will land here."
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </Screen>
  );
}

// Navy highlight panel with a faint droplet watermark and live unread count.
function Hero({ unreadCount, onMarkAll }) {
  const hasUnread = unreadCount > 0;
  return (
    <View style={styles.hero}>
      <View style={styles.watermark} pointerEvents="none">
        <LogoMark size={120} color="rgba(255,255,255,0.06)" />
      </View>
      <View style={styles.heroTop}>
        <View style={styles.heroBell}>
          <Bell size={18} color={colors.white} strokeWidth={2.2} />
        </View>
        <View style={styles.flex}>
          <Title color={colors.white} style={styles.heroTitle}>
            Notifications
          </Title>
          <Caption color="rgba(255,255,255,0.72)">
            {hasUnread
              ? `${unreadCount} unread alert${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </Caption>
        </View>
      </View>

      {hasUnread ? (
        <Pressable
          onPress={onMarkAll}
          style={({ pressed }) => [
            styles.markAll,
            pressed && { opacity: 0.7 },
          ]}
          hitSlop={8}
        >
          <CheckCheck size={15} color={colors.white} strokeWidth={2.2} />
          <AppText
            weight="semibold"
            size={fontSize.sm}
            color={colors.white}
          >
            Mark all read
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing["4xl"],
  },
  listContentEmpty: { flexGrow: 1 },
  gap: { height: spacing.xs },

  hero: {
    backgroundColor: colors.secondary,
    borderRadius: radius["2xl"],
    padding: spacing.xl,
    marginBottom: spacing.xl,
    overflow: "hidden",
    ...shadow.card,
  },
  watermark: {
    position: "absolute",
    right: -24,
    bottom: -28,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  heroBell: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { marginBottom: 2 },
  markAll: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
});
