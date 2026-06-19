import { useState, useCallback } from "react";
import { View, Switch, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import {
  User,
  Phone,
  MapPin,
  Navigation,
  Check,
} from "lucide-react-native";

import {
  Screen,
  Card,
  Button,
  Input,
  Divider,
  Title,
  Heading,
  Body,
  Caption,
  Label,
  AppText,
} from "../components/ui";
import BloodGroupBadge from "../components/ui/BloodGroupBadge";
import { LogoMark } from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import * as donorsApi from "../api/donors";
import { BLOOD_GROUPS, bloodGroupLabel, DEFAULT_COORDS } from "../lib/constants";
import { colors, spacing, radius } from "../theme";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { profile, setProfile } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [address, setAddress] = useState(profile?.address || "");
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup || null);
  const [available, setAvailable] = useState(!!profile?.available);
  const [coords, setCoords] = useState({
    latitude: profile?.latitude ?? null,
    longitude: profile?.longitude ?? null,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const hasCoords = coords.latitude != null && coords.longitude != null;

  const updateLocation = useCallback(async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        toast.error(
          "Location permission denied. Your existing location is kept.",
          "Permission needed",
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      toast.success("Location updated");
    } catch {
      toast.error("Couldn't fetch your location. Try again outdoors.");
    } finally {
      setLocating(false);
    }
  }, [toast]);

  const validate = useCallback(() => {
    const next = {};
    if (!fullName.trim()) next.fullName = "Your name is required";
    if (!bloodGroup) next.bloodGroup = "Select your blood group";
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [fullName, bloodGroup]);

  const onSave = useCallback(async () => {
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        bloodGroup,
        latitude: hasCoords ? coords.latitude : profile?.latitude ?? DEFAULT_COORDS.latitude,
        longitude: hasCoords ? coords.longitude : profile?.longitude ?? DEFAULT_COORDS.longitude,
        available,
      };
      const updated = await donorsApi.updateMyDonorProfile(payload);
      setProfile(updated);
      toast.success("Profile updated");
      navigation.goBack();
    } catch {
      toast.error("Couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [
    validate,
    toast,
    fullName,
    phone,
    address,
    bloodGroup,
    hasCoords,
    coords,
    profile,
    available,
    setProfile,
    navigation,
  ]);

  return (
    <Screen keyboardAvoiding>
      {/* Hero */}
      <Card padded style={styles.hero}>
        <View style={styles.watermark} pointerEvents="none">
          <LogoMark size={110} color={colors.white} />
        </View>
        <Title color={colors.white}>Edit your profile</Title>
        <Caption color="rgba(255,255,255,0.72)" style={styles.heroSub}>
          Keep your details current so nearby requests can reach you fast.
        </Caption>
      </Card>

      {/* Personal details */}
      <Card padded style={styles.block}>
        <Label style={styles.cardLabel}>Personal details</Label>
        <View style={styles.fields}>
          <Input
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            icon={User}
            autoCapitalize="words"
            error={errors.fullName}
          />
          <Input
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="98XXXXXXXX"
            icon={Phone}
            keyboardType="phone-pad"
          />
          <Input
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Street, city"
            icon={MapPin}
            autoCapitalize="words"
            multiline
          />
        </View>
      </Card>

      {/* Blood group */}
      <Card padded style={styles.block}>
        <Label style={styles.cardLabel}>Blood group</Label>
        {errors.bloodGroup ? (
          <Caption color={colors.primary} style={styles.fieldError}>
            {errors.bloodGroup}
          </Caption>
        ) : null}
        <View style={styles.groupGrid}>
          {BLOOD_GROUPS.map((bg) => {
            const active = bloodGroup === bg;
            return (
              <Pressable
                key={bg}
                onPress={() => setBloodGroup(bg)}
                style={[styles.groupCell, active && styles.groupCellActive]}
              >
                <AppText
                  weight="extrabold"
                  size={16}
                  color={active ? colors.white : colors.primary}
                >
                  {bloodGroupLabel(bg)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Availability */}
      <Card padded style={styles.block}>
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Heading>Available to donate</Heading>
            <Body color={colors.neutral600} size={13}>
              {available
                ? "You'll receive nearby emergency alerts"
                : "Turn on to get matched with requests"}
            </Body>
          </View>
          <Switch
            value={available}
            onValueChange={setAvailable}
            trackColor={{ false: colors.neutral200, true: colors.green600 }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.neutral200}
          />
        </View>
      </Card>

      {/* Location */}
      <Card padded style={styles.block}>
        <Label style={styles.cardLabel}>Location</Label>
        <View style={styles.locRow}>
          <View style={styles.locIcon}>
            <MapPin size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.locText}>
            <Heading>{hasCoords ? "Coordinates set" : "No location set"}</Heading>
            <Caption color={colors.neutral600}>
              {hasCoords
                ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
                : "Used to match you with nearby requests"}
            </Caption>
          </View>
        </View>
        <Divider style={styles.locDivider} />
        <Button
          variant="secondary"
          size="md"
          icon={Navigation}
          title={hasCoords ? "Update my location" : "Use my current location"}
          onPress={updateLocation}
          loading={locating}
        />
      </Card>

      {/* Save */}
      <View style={styles.saveBlock}>
        <Button
          variant="primary"
          size="lg"
          icon={Check}
          title="Save changes"
          onPress={onSave}
          loading={saving}
        />
        <Button
          variant="ghost"
          title="Cancel"
          onPress={() => navigation.goBack()}
          disabled={saving}
        />
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
    right: -24,
    top: -24,
    opacity: 0.06,
  },
  heroSub: { marginTop: 4, maxWidth: 280 },
  block: { marginTop: spacing.lg },
  cardLabel: { marginBottom: spacing.md },
  fields: { gap: spacing.lg },
  fieldError: { marginBottom: spacing.sm },
  groupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  groupCell: {
    minWidth: 64,
    flexGrow: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary100,
    backgroundColor: colors.white,
  },
  groupCellActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  switchText: { flex: 1, gap: 2 },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  locIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.blushCard,
    alignItems: "center",
    justifyContent: "center",
  },
  locText: { flex: 1, gap: 2 },
  locDivider: { marginVertical: spacing.lg },
  saveBlock: { marginTop: spacing.xl, gap: spacing.sm },
});
