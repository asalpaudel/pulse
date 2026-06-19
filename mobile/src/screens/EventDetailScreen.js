import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  CalendarHeart,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react-native";

import {
  Screen,
  Card,
  Button,
  Badge,
  Spinner,
  EmptyState,
  MetaRow,
  Heading,
  Title,
  Body,
  Label,
  AppText,
} from "../components/ui";
import { LogoMark } from "../components/Logo";
import { eventsApi } from "../api";
import { useToast } from "../context/ToastContext";
import { formatDateTime, formatDate } from "../lib/constants";
import { colors, spacing, radius, shadow } from "../theme";

const isDuplicate = (msg = "") =>
  /already|enrolled|joined|duplicate|409|exist/i.test(msg);

export default function EventDetailScreen() {
  const navigation = useNavigation();
  const { id } = useRoute().params || {};
  const { toast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await eventsApi.getEvent(id);
      setEvent(data);
    } catch (err) {
      setError(true);
      toast.error(err.message || "Could not load this event", "Events");
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const onJoin = useCallback(async () => {
    setJoining(true);
    try {
      await eventsApi.joinEvent(id);
      setJoined(true);
      toast.success("You're on the list — see you there!", "Enrolled");
    } catch (err) {
      if (isDuplicate(err.message)) {
        setJoined(true);
        toast.info("You're already enrolled in this event.", "Already in");
      } else {
        toast.error(err.message || "Could not join the event", "Join failed");
      }
    } finally {
      setJoining(false);
    }
  }, [id, toast]);

  if (loading) {
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <Spinner label="Loading event…" />
        </View>
      </Screen>
    );
  }

  if (error || !event) {
    return (
      <Screen>
        <EmptyState
          icon={AlertCircle}
          title="Event unavailable"
          message="We couldn't load this donation event. Please try again."
          actionLabel="Retry"
          onAction={load}
        />
      </Screen>
    );
  }

  const eventDate = new Date(event.eventDate);
  const isPast = !Number.isNaN(eventDate.getTime()) && eventDate.getTime() < Date.now();

  return (
    <Screen>
      {/* Navy hero with droplet watermark */}
      <View style={styles.hero}>
        <View style={styles.watermark} pointerEvents="none">
          <LogoMark size={150} color={colors.white} />
        </View>

        <View style={styles.heroBadges}>
          <View style={styles.heroChip}>
            <CalendarHeart size={13} color={colors.white} strokeWidth={2.2} />
            <AppText weight="bold" size={11} color={colors.white} style={styles.heroChipText}>
              {isPast ? "PAST EVENT" : "DONATION DRIVE"}
            </AppText>
          </View>
          {joined ? (
            <Badge tone="green" icon={CheckCircle2}>
              You're enrolled
            </Badge>
          ) : null}
        </View>

        <Title color={colors.white} style={styles.heroTitle}>
          {event.title || "Donation Event"}
        </Title>

        <View style={styles.heroMeta}>
          <Clock size={16} color="rgba(255,255,255,0.85)" strokeWidth={2} />
          <AppText weight="semibold" size={14} color="rgba(255,255,255,0.92)">
            {formatDateTime(event.eventDate)}
          </AppText>
        </View>
      </View>

      {/* Where */}
      {event.address ? (
        <Card style={styles.card}>
          <Label color={colors.neutral500}>Location</Label>
          <MetaRow icon={MapPin} iconColor={colors.primary} color={colors.text}>
            {event.address}
          </MetaRow>
        </Card>
      ) : null}

      {/* About */}
      {event.description ? (
        <Card style={styles.card}>
          <Label color={colors.neutral500}>About this drive</Label>
          <Body color={colors.neutral700} style={styles.desc}>
            {event.description}
          </Body>
        </Card>
      ) : null}

      {/* Details */}
      <Card style={styles.card}>
        <Heading>Event details</Heading>
        <View style={styles.detailRow}>
          <Body color={colors.neutral500}>Date</Body>
          <AppText weight="semibold" size={14} color={colors.text}>
            {formatDate(event.eventDate)}
          </AppText>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Body color={colors.neutral500}>Time</Body>
          <AppText weight="semibold" size={14} color={colors.text}>
            {Number.isNaN(eventDate.getTime())
              ? "—"
              : eventDate.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
          </AppText>
        </View>
      </Card>

      {/* Enroll callout */}
      {joined ? (
        <View style={styles.enrolledNote}>
          <Info size={16} color={colors.green700} strokeWidth={2.1} />
          <Body color={colors.green700} style={styles.enrolledText}>
            You're enrolled. Bring a valid ID and stay hydrated before you donate.
          </Body>
        </View>
      ) : null}

      <Button
        title={joined ? "Enrolled" : isPast ? "This event has ended" : "Join event"}
        variant={joined ? "secondary" : "primary"}
        icon={joined ? CheckCircle2 : CalendarHeart}
        onPress={onJoin}
        loading={joining}
        disabled={joined || isPast}
        style={styles.cta}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: {
    backgroundColor: colors.secondary,
    borderRadius: radius["2xl"],
    padding: spacing.xl,
    paddingVertical: spacing["2xl"],
    overflow: "hidden",
    gap: spacing.md,
    ...shadow.card,
  },
  watermark: {
    position: "absolute",
    right: -38,
    top: -34,
    opacity: 0.08,
  },
  heroBadges: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  heroChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroChipText: { letterSpacing: 0.6, includeFontPadding: false },
  heroTitle: { lineHeight: 28 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  card: { gap: spacing.sm, marginTop: spacing.lg },
  desc: { lineHeight: 22 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  enrolledNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.green50,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  enrolledText: { flex: 1, lineHeight: 20 },
  cta: { marginTop: spacing.xl },
});
