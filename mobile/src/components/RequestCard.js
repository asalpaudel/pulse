import { Pressable, View, StyleSheet } from "react-native";
import { Droplet, Clock, MapPin, ChevronRight } from "lucide-react-native";
import Card from "./ui/Card";
import BloodGroupBadge from "./ui/BloodGroupBadge";
import { PriorityPill } from "./ui/StatusPill";
import StatusPill from "./ui/StatusPill";
import MetaRow from "./ui/MetaRow";
import Button from "./ui/Button";
import { Heading } from "./ui/Text";
import { bloodGroupLabel, timeAgo } from "../lib/constants";
import { colors, spacing } from "../theme";

/**
 * Shared blood-request card. Used in the Requests feed and the Home preview.
 *
 * props:
 *  - request    : BloodRequest { bloodGroup, units, urgency, status, note, createdAt, latitude, longitude }
 *  - distanceKm : optional number → renders a "Xkm away" row
 *  - onPress    : open detail
 *  - onRespond  : optional → renders a primary "Respond to donate" button
 *  - responding : bool — button loading
 *  - responded  : bool — already offered (disables button)
 *  - elevated   : visually lift (e.g. the top emergency card)
 *  - compact    : tighter padding for previews
 */
export default function RequestCard({
  request,
  distanceKm,
  onPress,
  onRespond,
  responding = false,
  responded = false,
  elevated = false,
  compact = false,
}) {
  if (!request) return null;
  const isEmergency = String(request.urgency).toUpperCase() === "EMERGENCY";
  const units = request.units || 0;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <Card elevated={elevated} style={[styles.card, compact && styles.compact]}>
        <View style={styles.top}>
          <BloodGroupBadge group={request.bloodGroup} size={compact ? "sm" : "md"} />
          <View style={styles.topText}>
            <Heading numberOfLines={1}>
              {units} unit{units === 1 ? "" : "s"} of {bloodGroupLabel(request.bloodGroup)}
            </Heading>
            <View style={styles.pills}>
              <PriorityPill urgency={request.urgency} />
              {request.status ? <StatusPill status={request.status} /> : null}
            </View>
          </View>
          {onPress && !onRespond ? (
            <ChevronRight size={18} color={colors.neutral300} />
          ) : null}
        </View>

        <View style={styles.meta}>
          <MetaRow icon={Droplet} iconColor={colors.primary}>
            {units} unit{units === 1 ? "" : "s"} required
          </MetaRow>
          {typeof distanceKm === "number" ? (
            <MetaRow icon={MapPin}>{distanceKm.toFixed(1)} km away</MetaRow>
          ) : null}
          <MetaRow icon={Clock}>{timeAgo(request.createdAt) || "Recently"}</MetaRow>
        </View>

        {request.note && !compact ? (
          <View style={styles.note}>
            <MetaRow color={colors.neutral600}>{request.note}</MetaRow>
          </View>
        ) : null}

        {onRespond ? (
          <Button
            title={responded ? "Already responding" : "Respond to donate"}
            variant={isEmergency ? "primary" : "outline"}
            onPress={onRespond}
            loading={responding}
            disabled={responded}
            style={styles.action}
          />
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  compact: { padding: spacing.lg, gap: spacing.sm },
  pressed: { opacity: 0.9, transform: [{ scale: 0.992 }] },
  top: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  topText: { flex: 1, gap: 6 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  meta: { gap: 7 },
  note: {
    backgroundColor: colors.blushSoft,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  action: { marginTop: 2 },
});
