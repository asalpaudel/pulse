import { useCallback, useEffect, useMemo, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Layers, Siren, CalendarClock, Droplet } from "lucide-react-native";
import {
  Screen,
  Title,
  Body,
  Caption,
  FilterChip,
  Spinner,
  EmptyState,
} from "../components/ui";
import RequestCard from "../components/RequestCard";
import { requestsApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { bloodGroupLabel } from "../lib/constants";
import { colors, spacing } from "../theme";

const isEmergency = (r) => String(r?.urgency).toUpperCase() === "EMERGENCY";

export default function RequestsScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const myGroup = profile?.bloodGroup || null;

  const load = useCallback(
    async ({ silent } = {}) => {
      if (!silent) setLoading(true);
      try {
        const data = await requestsApi.listRequests({ status: "OPEN" });
        setRequests(Array.isArray(data) ? data : []);
      } catch (e) {
        toast.error(e?.message || "Could not load requests", "Something went wrong");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load({ silent: true });
  }, [load]);

  // Build filter chips dynamically — "My group" only when we know the group.
  const chips = useMemo(() => {
    const base = [
      { key: "ALL", label: "All", icon: Layers },
      { key: "EMERGENCY", label: "Emergency", icon: Siren },
      { key: "ROUTINE", label: "Routine", icon: CalendarClock },
    ];
    if (myGroup) {
      base.push({ key: "MINE", label: `My group · ${bloodGroupLabel(myGroup)}`, icon: Droplet });
    }
    return base;
  }, [myGroup]);

  const filtered = useMemo(() => {
    let list = requests;
    if (filter === "EMERGENCY") list = list.filter(isEmergency);
    else if (filter === "ROUTINE") list = list.filter((r) => !isEmergency(r));
    else if (filter === "MINE" && myGroup) list = list.filter((r) => r.bloodGroup === myGroup);
    // Surface emergencies first, then newest.
    return [...list].sort((a, b) => {
      const ea = isEmergency(a) ? 1 : 0;
      const eb = isEmergency(b) ? 1 : 0;
      if (ea !== eb) return eb - ea;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [requests, filter, myGroup]);

  const emergencyCount = useMemo(
    () => requests.filter(isEmergency).length,
    [requests]
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Title>Blood Requests</Title>
      <Body color={colors.neutral600} style={styles.subtitle}>
        {emergencyCount > 0
          ? `${emergencyCount} emergency call${emergencyCount === 1 ? "" : "s"} need a donor right now.`
          : "Open requests from hospitals near you. One response can save a life."}
      </Body>

      <FlatList
        data={chips}
        horizontal
        keyExtractor={(c) => c.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        renderItem={({ item }) => (
          <FilterChip
            label={item.label}
            icon={item.icon}
            active={filter === item.key}
            onPress={() => setFilter(item.key)}
          />
        )}
      />

      {!loading && filtered.length > 0 ? (
        <Caption color={colors.neutral500} style={styles.count}>
          {filtered.length} {filter === "ALL" ? "open" : "matching"} request
          {filtered.length === 1 ? "" : "s"}
        </Caption>
      ) : null}
    </View>
  );

  if (loading) {
    return (
      <Screen scroll={false}>
        {renderHeader()}
        <View style={styles.loading}>
          <Spinner label="Loading requests…" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false} padded={false}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            elevated={isEmergency(item)}
            onPress={() => navigation.navigate("RequestDetail", { id: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={Droplet}
            title={
              filter === "MINE"
                ? "No requests for your group"
                : filter === "EMERGENCY"
                ? "No emergencies right now"
                : "No open requests"
            }
            message={
              filter === "ALL"
                ? "There are no open blood requests at the moment. Pull to refresh."
                : "Try a different filter to see more open requests."
            }
            actionLabel={filter === "ALL" ? undefined : "Show all"}
            onAction={filter === "ALL" ? undefined : () => setFilter("ALL")}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing["4xl"],
  },
  header: { marginBottom: spacing.lg },
  subtitle: { marginTop: 6, marginBottom: spacing.lg },
  chipsRow: { gap: spacing.sm, paddingRight: spacing.xl, paddingVertical: 2 },
  count: { marginTop: spacing.lg },
  sep: { height: spacing.md },
  loading: { paddingTop: spacing["4xl"] },
});
