import { useState, useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  Droplet,
  CheckCircle2,
  Loader,
} from "lucide-react-native";
import {
  Screen,
  Card,
  Button,
  Input,
  Display,
  Body,
  AppText,
  Caption,
} from "../../components/ui";
import Logo from "../../components/Logo";
import BloodGroupPicker from "../../components/BloodGroupPicker";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { DEFAULT_COORDS } from "../../lib/constants";
import { colors, fontSize, radius, spacing } from "../../theme";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    bloodGroup: "",
    address: "",
  });
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [locStatus, setLocStatus] = useState("locating"); // locating | captured | default
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Best-effort location capture — never blocks the form.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (active) setLocStatus("default");
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!active) return;
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocStatus("captured");
      } catch {
        if (active) setLocStatus("default");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 6)
      next.password = "Use at least 6 characters";
    if (!form.phone.trim()) next.phone = "Phone is required";
    if (!form.bloodGroup) next.bloodGroup = "Select your blood group";
    if (!form.address.trim()) next.address = "Address is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (submitting) return;
    if (!validate()) {
      toast.error("Please complete the highlighted fields.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        role: "DONOR",
        profile: {
          fullName: form.fullName.trim(),
          bloodGroup: form.bloodGroup,
          phone: form.phone.trim(),
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: form.address.trim(),
          available: true,
        },
      });
      // Navigator switches automatically once the token is set.
    } catch (err) {
      toast.error(err?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen keyboardAvoiding padded={false} edges={["top", "bottom"]}>
      {/* Navy hero header */}
      <View style={styles.hero}>
        <View style={styles.watermark} pointerEvents="none">
          <Droplet size={130} color={colors.white} strokeWidth={1.2} />
        </View>
        <Logo size={34} withText light />
        <View style={styles.heroCopy}>
          <Display color={colors.white} style={styles.heroTitle}>
            Become a donor.
          </Display>
          <Body color="rgba(255,255,255,0.78)" style={styles.heroSub}>
            Join Pulse and be the first responder when your blood type is
            needed.
          </Body>
        </View>
      </View>

      <View style={styles.body}>
        <Card style={styles.card}>
          <Input
            label="Full name"
            value={form.fullName}
            onChangeText={set("fullName")}
            placeholder="Asha Sharma"
            icon={User}
            autoCapitalize="words"
            error={errors.fullName}
          />
          <Input
            label="Email"
            value={form.email}
            onChangeText={set("email")}
            placeholder="you@example.com"
            icon={Mail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <Input
            label="Password"
            value={form.password}
            onChangeText={set("password")}
            placeholder="At least 6 characters"
            icon={Lock}
            secureTextEntry
            error={errors.password}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChangeText={set("phone")}
            placeholder="98XXXXXXXX"
            icon={Phone}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <BloodGroupPicker
            value={form.bloodGroup}
            onChange={set("bloodGroup")}
            error={errors.bloodGroup}
          />

          <Input
            label="Address"
            value={form.address}
            onChangeText={set("address")}
            placeholder="Area, city"
            icon={MapPin}
            autoCapitalize="words"
            error={errors.address}
          />

          {/* Location confirmation row — non-blocking */}
          <View
            style={[
              styles.locRow,
              locStatus === "captured" && styles.locRowOk,
            ]}
          >
            {locStatus === "locating" ? (
              <Loader size={16} color={colors.neutral600} strokeWidth={2} />
            ) : locStatus === "captured" ? (
              <CheckCircle2 size={16} color={colors.green600} strokeWidth={2.1} />
            ) : (
              <MapPin size={16} color={colors.neutral600} strokeWidth={2} />
            )}
            <Caption
              size={fontSize.sm}
              color={locStatus === "captured" ? colors.green700 : colors.neutral600}
              style={styles.locText}
            >
              {locStatus === "locating"
                ? "Finding your location…"
                : locStatus === "captured"
                  ? "Location captured — donors near requests are matched first."
                  : "Using a default area. You can refine it later in your profile."}
            </Caption>
          </View>

          <Button
            title="Create donor account"
            size="lg"
            icon={ArrowRight}
            iconRight
            loading={submitting}
            onPress={onSubmit}
            style={styles.cta}
          />
        </Card>

        <Pressable onPress={() => navigation.navigate("Login")} hitSlop={8}>
          <View style={styles.footerRow}>
            <Caption color={colors.neutral600} size={fontSize.sm}>
              Already registered?
            </Caption>
            <AppText weight="bold" size={fontSize.sm} color={colors.primary}>
              {"  "}Sign in
            </AppText>
          </View>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["2xl"],
    paddingBottom: spacing["4xl"] + spacing.xl,
    borderBottomLeftRadius: radius["2xl"],
    borderBottomRightRadius: radius["2xl"],
    overflow: "hidden",
  },
  watermark: { position: "absolute", right: -28, top: -18, opacity: 0.07 },
  heroCopy: { marginTop: spacing["2xl"], gap: spacing.sm },
  heroTitle: { fontSize: fontSize["3xl"] },
  heroSub: { maxWidth: 300 },
  body: {
    paddingHorizontal: spacing.xl,
    marginTop: -spacing["3xl"],
  },
  card: { gap: spacing.lg },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.blushSoft,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  locRowOk: { backgroundColor: colors.green50 },
  locText: { flex: 1, lineHeight: 18 },
  cta: { marginTop: spacing.xs },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing["2xl"],
  },
});
