import { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Phone,
  MapPin,
  CalendarClock,
  Bell,
  LogOut,
  Pencil,
  Droplet,
  HeartPulse,
} from "lucide-react-native";

import {
  Screen,
  Card,
  Button,
  Avatar,
  Divider,
  MetaRow,
  EmptyState,
  Title,
  Heading,
  Body,
  Caption,
  Label,
  AppText,
} from "../components/ui";
import { VerifiedPill } from "../components/ui/StatusPill";
import BloodGroupBadge from "../components/ui/BloodGroupBadge";
import AvailabilityCard from "../components/AvailabilityCard";
import { LogoMark } from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNotifications } from "../context/NotificationsContext";
import * as donorsApi from "../api/donors";
import { formatDate } from "../lib/constants";
import { colors, spacing, radius } from "../theme";

// Days since a date, or null when unset/invalid.
function daysSince(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, profile, refreshMe, setProfile, logout } = useAuth();
  const { toast } = useToast();
  const { unreadCount } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [togglingAvail, setTogglingAvail] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshMe();
    } catch {
      toast.error("Couldn't refresh your profile. Pull to try again.");
    } finally {
      setRefreshing(false);
    }
  }, [refreshMe, toast]);

  const toggleAvailability = useCallback(
    async (next) => {
      setTogglingAvail(true);
      try {
        const updated = await donorsApi.updateMyDonorProfile({ available: next });
        setProfile(updated);
        toast.success(
          next ? "You're now available to donate" : "Availability turned off",
        );
      } catch {
        toast.error("Couldn't update availability. Please try again.");
      } finally {
        setTogglingAvail(false);
      }
    },
    [setProfile, toast],
  );

  const sinceDays = daysSince(profile?.lastDonationDate);

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      {/* Profile hero */}
      <Card padded style={styles.hero}>
        <View style={styles.watermark} pointerEvents="none">
          <LogoMark size={120} color={colors.white} />
        </View>

        <View style={styles.heroTop}>
          <Avatar name={profile?.fullName} size={64} tint="red" style={styles.heroAvatar} />
          <View style={styles.heroText}>
            <Title color={colors.white} numberOfLines={1}>
              {profile?.fullName || "Your profile"}
            </Title>
            <Caption color="rgba(255,255,255,0.72)" numberOfLines={1}>
              {user?.email || "—"}
            </Caption>
          </View>
          <BloodGroupBadge group={profile?.bloodGroup} variant="solid" size="md" />
        </View>

        <View style={styles.heroPills}>
          <VerifiedPill verified={user?.verified} />
          <View style={styles.donorTag}>
            <Droplet size={13} color={colors.white} strokeWidth={2.2} />
            <AppText weight="bold" size={11} color={colors.white} style={styles.donorTagText}>
              DONOR
            </AppText>
          </View>
        </View>
      </Card>

      {/* Availability */}
      <View style={styles.block}>
        <AvailabilityCard
          available={!!profile?.available}
          onToggle={toggleAvailability}
          loading={togglingAvail}
        />
      </View>

      {/* Contact info */}
      <Card padded style={styles.block}>
        <Label style={styles.cardLabel}>Contact details</Label>
        <View style={styles.infoRow}>
          <MetaRow icon={Phone} iconColor={colors.primary} color={colors.text}>
            {profile?.phone || "No phone number"}
          </MetaRow>
        </View>
        <Divider />
        <View style={styles.infoRow}>
          <MetaRow icon={MapPin} iconColor={colors.primary} color={colors.text}>
            {profile?.address || "No address set"}
          </MetaRow>
        </View>
        <Divider />
        <View style={styles.infoRow}>
          <MetaRow icon={CalendarClock} iconColor={colors.primary} color={colors.text}>
            Last donation: {formatDate(profile?.lastDonationDate)}
          </MetaRow>
        </View>
      </Card>

      {/* Donation history summary */}
      <Card padded style={styles.block}>
        <Label style={styles.cardLabel}>Donation history</Label>
        {profile?.lastDonationDate ? (
          <View style={styles.historyBody}>
            <View style={styles.historyDisc}>
              <HeartPulse size={24} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={styles.historyText}>
              <Heading>Last donated {formatDate(profile.lastDonationDate)}</Heading>
              <Body color={colors.neutral600} size={13}>
                {sinceDays === 0
                  ? "Recorded today — thank you for giving."
                  : `${sinceDays} day${sinceDays === 1 ? "" : "s"} ago. ${
                      sinceDays >= 90
                        ? "You may be eligible to donate again."
                        : "Keep up the lifesaving work."
                    }`}
              </Body>
            </View>
          </View>
        ) : (
          <EmptyState
            icon={Droplet}
            title="No donations recorded yet"
            message="Once you complete a donation, your history will appear here."
            style={styles.emptyHistory}
          />
        )}
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          variant="outline"
          icon={Pencil}
          title="Edit profile"
          onPress={() => navigation.navigate("EditProfile")}
        />
        <Button
          variant="ghost"
          icon={Bell}
          title={
            unreadCount > 0 ? `Notifications (${unreadCount})` : "Notifications"
          }
          onPress={() => navigation.navigate("Notifications")}
        />
        <Button variant="danger" icon={LogOut} title="Log out" onPress={logout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary700,
    overflow: "hidden",
  },
  watermark: {
    position: "absolute",
    right: -28,
    top: -28,
    opacity: 0.06,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  heroAvatar: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  heroText: { flex: 1, gap: 2 },
  heroPills: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  donorTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  donorTagText: { letterSpacing: 0.5, includeFontPadding: false },
  block: { marginTop: spacing.lg },
  cardLabel: { marginBottom: spacing.md },
  infoRow: { paddingVertical: spacing.sm },
  historyBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  historyDisc: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.blushCard,
    alignItems: "center",
    justifyContent: "center",
  },
  historyText: { flex: 1, gap: 2 },
  emptyHistory: { paddingVertical: spacing.xl },
  actions: { marginTop: spacing.xl, gap: spacing.md },
});
