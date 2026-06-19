import { useCallback, useEffect, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Bell,
  Droplet,
  MapPin,
  CalendarClock,
  Siren,
  HeartHandshake,
  CalendarHeart,
} from "lucide-react-native";

import {
  Screen,
  Card,
  StatCard,
  SectionHeader,
  BloodGroupBadge,
  Spinner,
  EmptyState,
  AppText,
  Title,
  Body,
  Caption,
} from "../components/ui";
import { LogoMark } from "../components/Logo";
import RequestCard from "../components/RequestCard";
import EventCard from "../components/EventCard";
import AvailabilityCard from "../components/AvailabilityCard";

import * as donorsApi from "../api/donors";
import * as requestsApi from "../api/requests";
import * as eventsApi from "../api/events";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNotifications } from "../context/NotificationsContext";

import { bloodGroupLabel, formatDate } from "../lib/constants";
import { colors, radius, spacing, shadow } from "../theme";

const firstName = (full) => {
  if (!full) return "there";
  return String(full).trim().split(/\s+/)[0] || "there";
};

const isEmergency = (r) => String(r?.urgency).toUpperCase() === "EMERGENCY";
const isOpen = (r) => String(r?.status).toUpperCase() === "OPEN";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { profile, setProfile, refreshMe } = useAuth();
  const { toast } = useToast();
  const { unreadCount } = useNotifications();

  const [requests, setRequests] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState(false);

  const load = useCallback(
    async ({ silent } = {}) => {
      if (!silent) setLoading(true);
      try {
        const [, openReqs, allEvents] = await Promise.all([
          // Keep auth profile fresh; ignore failure (we fall back to ctx profile).
          donorsApi.getMyDonorProfile().catch(() => null),
          requestsApi.listRequests({ status: "OPEN" }).catch(() => []),
          eventsApi.listEvents().catch(() => []),
        ]);
        setRequests(Array.isArray(openReqs) ? openReqs : []);
        setEvents(Array.isArray(allEvents) ? allEvents : []);
      } catch (e) {
        toast.error("Couldn't load your dashboard. Pull to retry.");
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([load({ silent: true }), refreshMe()]);
    setRefreshing(false);
  }, [load, refreshMe]);

  const onToggleAvailability = useCallback(
    async (next) => {
      if (toggling) return;
      const prev = profile?.available;
      setToggling(true);
      // Optimistic update.
      if (profile) setProfile({ ...profile, available: next });
      try {
        await donorsApi.updateMyDonorProfile({
          fullName: profile?.fullName,
          bloodGroup: profile?.bloodGroup,
          phone: profile?.phone,
          latitude: profile?.latitude,
          longitude: profile?.longitude,
          address: profile?.address,
          available: next,
        });
        await refreshMe();
        toast.success(
          next ? "You're now available to donate" : "Availability turned off",
        );
      } catch (e) {
        // Roll back on failure.
        if (profile) setProfile({ ...profile, available: prev });
        toast.error("Couldn't update availability. Try again.");
      } finally {
        setToggling(false);
      }
    },
    [profile, setProfile, refreshMe, toast, toggling],
  );

  const emergencyOpen = requests.filter((r) => isOpen(r) && isEmergency(r));
  const openCount = requests.filter(isOpen).length;
  // Prioritise emergencies first, then the rest of the open feed.
  const urgentPreview = [
    ...emergencyOpen,
    ...requests.filter((r) => isOpen(r) && !isEmergency(r)),
  ].slice(0, 3);
  const eventPreview = events.slice(0, 2);

  if (loading) {
    return (
      <Screen scroll={false}>
        <Header
          name={firstName(profile?.fullName)}
          unreadCount={unreadCount}
          onBell={() => navigation.navigate("Notifications")}
        />
        <View style={styles.loadingFill}>
          <Spinner label="Loading your dashboard…" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <Header
        name={firstName(profile?.fullName)}
        unreadCount={unreadCount}
        onBell={() => navigation.navigate("Notifications")}
      />

      {/* Navy hero — donor identity card */}
      <View style={styles.hero}>
        <View style={styles.heroWatermark} pointerEvents="none">
          <LogoMark size={150} color="rgba(255,255,255,0.06)" />
        </View>

        <View style={styles.heroTop}>
          <View style={styles.heroBadgeWrap}>
            <BloodGroupBadge
              group={profile?.bloodGroup}
              variant="solid"
              size="lg"
            />
          </View>
          <View style={styles.heroHead}>
            <Caption color="rgba(255,255,255,0.65)">YOUR BLOOD TYPE</Caption>
            <AppText weight="extrabold" size={26} color={colors.white}>
              {bloodGroupLabel(profile?.bloodGroup)}
            </AppText>
            <AppText weight="medium" size={13} color="rgba(255,255,255,0.75)">
              {profile?.fullName || "Pulse donor"}
            </AppText>
          </View>
        </View>

        <View style={styles.heroChips}>
          <HeroChip icon={MapPin} label={profile?.address || "Location not set"} />
          <HeroChip
            icon={CalendarClock}
            label={
              profile?.lastDonationDate
                ? `Last donated ${formatDate(profile.lastDonationDate)}`
                : "No donations yet"
            }
          />
        </View>
      </View>

      {/* Availability toggle */}
      <View style={styles.block}>
        <AvailabilityCard
          available={!!profile?.available}
          onToggle={onToggleAvailability}
          loading={toggling}
        />
      </View>

      {/* Stat grid */}
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <StatCard
            icon={Siren}
            tint="red"
            label="Open emergencies"
            value={emergencyOpen.length}
          />
          <StatCard
            icon={Droplet}
            tint="navy"
            label="Open requests"
            value={openCount}
          />
        </View>
        <View style={styles.gridRow}>
          <StatCard
            icon={CalendarHeart}
            tint="blue"
            label="Upcoming events"
            value={events.length}
          />
          <StatCard
            icon={HeartHandshake}
            tint="green"
            label="Your blood group"
            value={bloodGroupLabel(profile?.bloodGroup)}
          />
        </View>
      </View>

      {/* Urgent requests */}
      <View style={styles.block}>
        <SectionHeader
          title="Urgent requests"
          subtitle="People near you who need blood"
          actionLabel="View all"
          onAction={() => navigation.navigate("Requests")}
        />
        <View style={styles.list}>
          {urgentPreview.length === 0 ? (
            <EmptyState
              icon={Droplet}
              title="No open requests"
              message="There are no active blood requests right now. We'll alert you the moment one appears nearby."
            />
          ) : (
            urgentPreview.map((req, i) => (
              <RequestCard
                key={req.id}
                request={req}
                compact
                elevated={i === 0}
                onPress={() =>
                  navigation.navigate("RequestDetail", { id: req.id })
                }
              />
            ))
          )}
        </View>
      </View>

      {/* Donation events */}
      <View style={styles.block}>
        <SectionHeader
          title="Donation events"
          subtitle="Drives and camps you can join"
          actionLabel="View all"
          onAction={() => navigation.navigate("Events")}
        />
        <View style={styles.list}>
          {eventPreview.length === 0 ? (
            <EmptyState
              icon={CalendarHeart}
              title="No events scheduled"
              message="No donation drives are listed yet. Check back soon for upcoming camps."
            />
          ) : (
            eventPreview.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                compact
                onPress={() => navigation.navigate("EventDetail", { id: ev.id })}
              />
            ))
          )}
        </View>
      </View>
    </Screen>
  );
}

/* ---------- screen-local helpers ---------- */

function Header({ name, unreadCount, onBell }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Title>Hi, {name}</Title>
        <Body color={colors.neutral600} size={13}>
          Every drop counts — thanks for being a donor.
        </Body>
      </View>
      <Pressable
        onPress={onBell}
        hitSlop={8}
        style={({ pressed }) => [styles.bell, pressed && styles.bellPressed]}
      >
        <Bell size={20} color={colors.secondary} strokeWidth={2} />
        {unreadCount > 0 ? (
          <View style={styles.bellBadge}>
            <AppText weight="bold" size={10} color={colors.white}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </AppText>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

function HeroChip({ icon: Icon, label }) {
  return (
    <View style={styles.heroChip}>
      <Icon size={14} color="rgba(255,255,255,0.85)" strokeWidth={2} />
      <AppText
        weight="medium"
        size={12}
        color="rgba(255,255,255,0.92)"
        numberOfLines={1}
        style={styles.heroChipText}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingFill: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerText: { flex: 1, gap: 2 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral100,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  bellPressed: { opacity: 0.85, transform: [{ scale: 0.96 }] },
  bellBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  hero: {
    backgroundColor: colors.secondary,
    borderRadius: radius["2xl"],
    padding: spacing.xl,
    gap: spacing.lg,
    overflow: "hidden",
    ...shadow.elevated,
  },
  heroWatermark: {
    position: "absolute",
    right: -34,
    bottom: -34,
  },
  heroTop: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  heroBadgeWrap: {
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.18)",
    padding: 4,
  },
  heroHead: { flex: 1, gap: 2 },
  heroChips: { gap: spacing.sm },
  heroChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  heroChipText: { flex: 1 },

  block: { marginTop: spacing["2xl"], gap: spacing.md },

  grid: { marginTop: spacing["2xl"], gap: spacing.md },
  gridRow: { flexDirection: "row", gap: spacing.md },

  list: { gap: spacing.md },
});
