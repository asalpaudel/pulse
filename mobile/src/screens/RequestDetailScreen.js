import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Linking } from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  Droplet,
  MapPin,
  Clock,
  HeartHandshake,
  CheckCircle2,
  Hospital,
  Navigation,
} from "lucide-react-native";
import {
  Screen,
  Card,
  Button,
  Title,
  Heading,
  Body,
  Label,
  Caption,
  AppText,
  Spinner,
  Divider,
  MetaRow,
  BloodGroupBadge,
  StatusPill,
  PriorityPill,
  EmptyState,
} from "../components/ui";
import { LogoMark } from "../components/Logo";
import { requestsApi } from "../api";
import { useToast } from "../context/ToastContext";
import { bloodGroupLabel, formatDateTime } from "../lib/constants";
import { colors, spacing, radius } from "../theme";

const isDuplicate = (e) => {
  const status = e?.status || e?.response?.status;
  const msg = String(e?.message || "").toLowerCase();
  return (
    status === 409 ||
    msg.includes("already") ||
    msg.includes("duplicate") ||
    msg.includes("conflict")
  );
};

export default function RequestDetailScreen() {
  const { id } = useRoute().params || {};
  const { toast } = useToast();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await requestsApi.getRequest(id);
      setRequest(data);
    } catch (e) {
      setError(true);
      toast.error(e?.message || "Could not load this request");
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const onRespond = useCallback(async () => {
    if (responding || responded) return;
    setResponding(true);
    try {
      await requestsApi.respondToRequest(id);
      setResponded(true);
      setRequest((prev) => (prev ? { ...prev, status: "MATCHED" } : prev));
      toast.success("The requester has been notified. Thank you!", "You're responding");
    } catch (e) {
      if (isDuplicate(e)) {
        setResponded(true);
        toast.info("You've already responded to this request");
      } else {
        toast.error(e?.message || "Could not submit your response");
      }
    } finally {
      setResponding(false);
    }
  }, [id, responding, responded, toast]);

  const openMaps = useCallback(() => {
    if (!request?.latitude || !request?.longitude) return;
    const { latitude, longitude } = request;
    const url = `https://maps.google.com/?q=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => toast.error("Could not open maps"));
  }, [request, toast]);

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <Spinner label="Loading request…" />
        </View>
      </Screen>
    );
  }

  if (error || !request) {
    return (
      <Screen>
        <EmptyState
          icon={Droplet}
          title="Request unavailable"
          message="We couldn't load this blood request. It may have been closed."
          actionLabel="Try again"
          onAction={load}
        />
      </Screen>
    );
  }

  const emergency = String(request.urgency).toUpperCase() === "EMERGENCY";
  const units = request.units || 0;
  const status = request.status;
  const closed = status === "FULFILLED" || status === "CLOSED";
  const hasLocation =
    typeof request.latitude === "number" && typeof request.longitude === "number";

  return (
    <Screen contentStyle={styles.content}>
      {/* Hero — navy panel with droplet watermark */}
      <Card padded={false} style={[styles.hero, emergency && styles.heroEmergency]}>
        <View style={styles.watermark} pointerEvents="none">
          <LogoMark size={120} color={colors.white} />
        </View>
        <View style={styles.heroInner}>
          <View style={styles.heroTop}>
            <PriorityPill urgency={request.urgency} />
            <StatusPill status={status} />
          </View>

          <View style={styles.heroBadgeRow}>
            <BloodGroupBadge group={request.bloodGroup} size="lg" />
            <View style={styles.heroBadgeText}>
              <Label color="rgba(255,255,255,0.65)">Blood type needed</Label>
              <Title color={colors.white} style={styles.heroGroup}>
                {bloodGroupLabel(request.bloodGroup)} · {units} unit{units === 1 ? "" : "s"}
              </Title>
            </View>
          </View>
        </View>
      </Card>

      {/* Key facts */}
      <Card style={styles.section}>
        <View style={styles.factGrid}>
          <Fact icon={Droplet} label="Units required" value={`${units} unit${units === 1 ? "" : "s"}`} />
          <View style={styles.factDivider} />
          <Fact
            icon={Hospital}
            label="Urgency"
            value={emergency ? "Emergency" : "Routine"}
            valueColor={emergency ? colors.primary : colors.secondary}
          />
        </View>
        <Divider style={styles.divider} />
        <MetaRow icon={Clock} iconColor={colors.neutral500}>
          Requested {formatDateTime(request.createdAt)}
        </MetaRow>
        <MetaRow icon={MapPin} iconColor={colors.tertiary}>
          {hasLocation
            ? `${request.latitude.toFixed(4)}, ${request.longitude.toFixed(4)}`
            : "Location not provided"}
        </MetaRow>
      </Card>

      {/* Note */}
      {request.note ? (
        <Card style={styles.section}>
          <Label color={colors.neutral500} style={styles.noteLabel}>
            Note from requester
          </Label>
          <View style={styles.notePanel}>
            <Body color={colors.neutral700}>{request.note}</Body>
          </View>
        </Card>
      ) : null}

      {/* Location action */}
      {hasLocation ? (
        <Button
          variant="outline"
          icon={Navigation}
          title="Open location in maps"
          onPress={openMaps}
          style={styles.section}
        />
      ) : null}

      {responded ? (
        <View style={styles.respondedNote}>
          <CheckCircle2 size={16} color={colors.green600} strokeWidth={2.2} />
          <Caption color={colors.green700}>
            You've offered to donate. The requester will reach out to you.
          </Caption>
        </View>
      ) : null}

      {/* Sticky-ish footer CTA */}
      <View style={styles.footer}>
        {closed ? (
          <Card style={styles.closedCard} padded>
            <Heading style={styles.closedText}>
              This request is {String(status).toLowerCase()}
            </Heading>
            <Caption color={colors.neutral500} style={styles.closedSub}>
              No more donors are needed right now.
            </Caption>
          </Card>
        ) : (
          <Button
            title={responded ? "You're responding" : "Respond to donate"}
            icon={responded ? CheckCircle2 : HeartHandshake}
            variant={responded ? "secondary" : emergency ? "primary" : "inverted"}
            size="lg"
            loading={responding}
            disabled={responded}
            onPress={onRespond}
          />
        )}
      </View>
    </Screen>
  );
}

function Fact({ icon: Icon, label, value, valueColor = colors.secondary }) {
  return (
    <View style={styles.fact}>
      <View style={styles.factIcon}>
        <Icon size={18} color={colors.primary} strokeWidth={2} />
      </View>
      <Label color={colors.neutral500}>{label}</Label>
      <AppText weight="extrabold" size={17} color={valueColor} style={styles.factValue}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  center: { paddingTop: spacing["4xl"] },

  hero: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
    overflow: "hidden",
  },
  heroEmergency: { borderColor: colors.primary, borderWidth: 1.5 },
  watermark: { position: "absolute", right: -24, bottom: -28, opacity: 0.06 },
  heroInner: { padding: spacing.xl, gap: spacing.lg },
  heroTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  heroBadgeRow: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  heroBadgeText: { flex: 1, gap: 4 },
  heroGroup: { letterSpacing: -0.3 },

  section: { gap: spacing.md },

  factGrid: { flexDirection: "row", alignItems: "stretch" },
  fact: { flex: 1, gap: 6 },
  factDivider: { width: 1, backgroundColor: colors.neutral100, marginHorizontal: spacing.lg },
  factIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.blushCard,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  factValue: { letterSpacing: -0.3 },
  divider: { marginVertical: spacing.xs },

  noteLabel: { marginBottom: 2 },
  notePanel: {
    backgroundColor: colors.blushSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral100,
  },

  respondedNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.green50,
    borderRadius: radius.lg,
    padding: spacing.md,
  },

  footer: { marginTop: spacing.sm },
  closedCard: { alignItems: "center", backgroundColor: colors.blushCard, borderColor: colors.neutral100 },
  closedText: { textAlign: "center" },
  closedSub: { textAlign: "center", marginTop: 4 },
});
