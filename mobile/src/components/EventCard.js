import { Pressable, View, StyleSheet } from "react-native";
import { CalendarHeart, MapPin, ChevronRight } from "lucide-react-native";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import MetaRow from "./ui/MetaRow";
import { Heading, Body } from "./ui/Text";
import { formatDateTime } from "../lib/constants";
import { colors, radius, spacing } from "../theme";

/**
 * Shared donation-event card. Used in the Events feed and Home preview.
 *
 * props:
 *  - event   : DonationEvent { title, description, eventDate, address }
 *  - onPress : open detail
 *  - onJoin  : optional → renders a "Join event" button
 *  - joining : bool — button loading
 *  - joined  : bool — already enrolled
 *  - compact : tighter layout for previews
 */
export default function EventCard({
  event,
  onPress,
  onJoin,
  joining = false,
  joined = false,
  compact = false,
}) {
  if (!event) return null;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <Card style={styles.card}>
        <View style={styles.top}>
          <View style={styles.iconBox}>
            <CalendarHeart size={22} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.head}>
            <Heading numberOfLines={2}>{event.title || "Donation Event"}</Heading>
            <MetaRow icon={CalendarHeart}>{formatDateTime(event.eventDate)}</MetaRow>
          </View>
          {onPress && !onJoin ? <ChevronRight size={18} color={colors.neutral300} /> : null}
        </View>

        {event.address ? <MetaRow icon={MapPin}>{event.address}</MetaRow> : null}

        {event.description && !compact ? (
          <Body color={colors.neutral600} numberOfLines={3}>
            {event.description}
          </Body>
        ) : null}

        {joined ? <Badge tone="green">You're enrolled</Badge> : null}

        {onJoin && !joined ? (
          <Button title="Join event" variant="primary" onPress={onJoin} loading={joining} style={styles.action} />
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  pressed: { opacity: 0.9, transform: [{ scale: 0.992 }] },
  top: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.blushCard,
    alignItems: "center",
    justifyContent: "center",
  },
  head: { flex: 1, gap: 5 },
  action: { marginTop: 2 },
});
