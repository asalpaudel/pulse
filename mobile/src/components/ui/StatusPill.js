import { View, StyleSheet } from "react-native";
import { TriangleAlert } from "lucide-react-native";
import { AppText } from "./Text";
import Badge from "./Badge";
import { colors, radius } from "../../theme";

// label → tone, mirrors the web StatusPill.
const TONE_BY_LABEL = {
  URGENT: "red",
  EMERGENCY: "red",
  OPEN: "amber",
  PENDING: "amber",
  WARNING: "amber",
  "HIGH PRIORITY": "amber",
  MATCHED: "blue",
  ACTIVE: "blue",
  INFO: "blue",
  ROUTINE: "blue",
  OFFERED: "blue",
  FULFILLED: "green",
  ELIGIBLE: "green",
  VERIFIED: "green",
  ACCEPTED: "green",
  SUCCESS: "green",
  AVAILABLE: "green",
  CLOSED: "neutral",
  INACTIVE: "neutral",
  UNAVAILABLE: "neutral",
};

function toneFor(value) {
  if (!value) return "neutral";
  return TONE_BY_LABEL[String(value).toUpperCase()] || "neutral";
}

export default function StatusPill({ status, icon, style }) {
  return (
    <Badge tone={toneFor(status)} icon={icon} style={style}>
      {String(status || "—").replace(/_/g, " ")}
    </Badge>
  );
}

// PriorityPill — EMERGENCY renders loud solid red with a live dot.
export function PriorityPill({ urgency, priority, style }) {
  const value = String(priority || urgency || "ROUTINE").toUpperCase();
  if (value === "EMERGENCY") {
    return (
      <View style={[styles.emergency, style]}>
        <View style={styles.dot} />
        <AppText weight="bold" size={11} color={colors.white} style={styles.emergencyText}>
          EMERGENCY
        </AppText>
      </View>
    );
  }
  if (value === "URGENT") {
    return (
      <Badge tone="red" icon={TriangleAlert} style={style}>
        URGENT
      </Badge>
    );
  }
  return (
    <Badge tone={toneFor(value)} style={style}>
      {value}
    </Badge>
  );
}

export function VerifiedPill({ verified, style }) {
  return verified ? (
    <Badge tone="green" style={style}>
      Verified
    </Badge>
  ) : (
    <Badge tone="amber" style={style}>
      Pending
    </Badge>
  );
}

const styles = StyleSheet.create({
  emergency: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dot: { height: 6, width: 6, borderRadius: 3, backgroundColor: colors.white },
  emergencyText: { letterSpacing: 0.4, includeFontPadding: false },
});
