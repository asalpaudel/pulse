import { useCallback, useEffect, useMemo, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CalendarHeart } from "lucide-react-native";

import { Screen, Title, Body, AppText, Spinner, EmptyState, Label } from "../components/ui";
import EventCard from "../components/EventCard";
import { eventsApi } from "../api";
import { useToast } from "../context/ToastContext";
import { colors, spacing } from "../theme";

const eventTime = (e) => {
  const t = new Date(e?.eventDate).getTime();
  return Number.isNaN(t) ? 0 : t;
};

export default function EventsScreen() {
  const navigation = useNavigation();
  const { toast } = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (mode = "initial") => {
      if (mode === "refresh") setRefreshing(true);
      try {
        const data = await eventsApi.listEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error(err.message || "Could not load events", "Events");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    load("initial");
  }, [load]);

  const onRefresh = useCallback(() => load("refresh"), [load]);

  // Split into upcoming (date >= now, soonest first) and past (most recent first).
  const sections = useMemo(() => {
    const now = Date.now();
    const upcoming = [];
    const past = [];
    for (const e of events) {
      if (eventTime(e) >= now) upcoming.push(e);
      else past.push(e);
    }
    upcoming.sort((a, b) => eventTime(a) - eventTime(b));
    past.sort((a, b) => eventTime(b) - eventTime(a));

    const rows = [];
    if (upcoming.length) {
      rows.push({ kind: "header", key: "h-up", label: "Upcoming", count: upcoming.length });
      upcoming.forEach((e) => rows.push({ kind: "event", key: `e-${e.id}`, event: e }));
    }
    if (past.length) {
      rows.push({ kind: "header", key: "h-past", label: "Past events", count: past.length });
      past.forEach((e) => rows.push({ kind: "event", key: `e-${e.id}`, event: e, past: true }));
    }
    return rows;
  }, [events]);

  const openEvent = useCallback(
    (id) => navigation.navigate("EventDetail", { id }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }) => {
      if (item.kind === "header") {
        return (
          <View style={styles.sectionRow}>
            <Label color={colors.neutral500}>{item.label}</Label>
            <View style={styles.countPill}>
              <AppText weight="bold" size={11} color={colors.primary700}>
                {item.count}
              </AppText>
            </View>
          </View>
        );
      }
      return (
        <View style={item.past ? styles.pastItem : undefined}>
          <EventCard event={item.event} onPress={() => openEvent(item.event.id)} />
        </View>
      );
    },
    [openEvent],
  );

  const ListHeader = (
    <View style={styles.header}>
      <Title>Donation Events</Title>
      <Body color={colors.neutral600} style={styles.subtitle}>
        Roll up your sleeve — find a drive near you and help save lives.
      </Body>
    </View>
  );

  if (loading) {
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <Spinner label="Loading events…" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false} padded={false}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <EmptyState
            icon={CalendarHeart}
            title="No events scheduled"
            message="There are no donation drives right now. Pull to refresh and check back soon."
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing["4xl"],
    gap: spacing.md,
  },
  header: { marginBottom: spacing.xs },
  subtitle: { marginTop: 4 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: 2,
  },
  countPill: {
    backgroundColor: colors.blushCard,
    borderRadius: 999,
    minWidth: 22,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pastItem: { opacity: 0.72 },
});
