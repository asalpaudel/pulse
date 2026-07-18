import { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Mail, Lock, ArrowRight, Droplet, ShieldCheck } from "lucide-react-native";
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
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { colors, fontSize, radius, spacing, shadow } from "../../theme";

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, verifyDevice } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState("");
  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = "Email is required";
    if (!password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      const result = challenge
        ? await verifyDevice({ challengeId: challenge.challengeId, code })
        : await login({ email: email.trim(), password });
      if (result?.deviceVerificationRequired) setChallenge(result);
      // Navigator swaps to the app stack automatically once the token is set.
    } catch (err) {
      toast.error(err?.message || "Unable to sign in. Check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen keyboardAvoiding padded={false} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* Navy hero band with droplet watermark */}
        <View style={styles.hero}>
          <View style={styles.watermark} pointerEvents="none">
            <Droplet size={150} color={colors.white} strokeWidth={1.2} />
          </View>
          <Logo size={40} withText light subtitle="Real-time blood coordination" />
          <View style={styles.heroCopy}>
            <Display color={colors.white} style={styles.heroTitle}>
              Welcome back.
            </Display>
            <Body color="rgba(255,255,255,0.78)" style={styles.heroSub}>
              Sign in to answer requests and save lives near you.
            </Body>
          </View>
        </View>

        {/* Form card lifts over the hero */}
        <View style={styles.formWrap}>
          <Card elevated style={styles.card}>
            {challenge ? (
              <>
                <View style={styles.securityNote}>
                  <ShieldCheck size={20} color={colors.primary} />
                  <Body size={13}>Enter the six-digit code sent to your email to trust this device.</Body>
                </View>
                <Input label="Verification code" value={code} onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))} keyboardType="number-pad" maxLength={6} />
              </>
            ) : <>
            <Input
              label="Email"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
              }}
              placeholder="you@example.com"
              icon={Mail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errors.password)
                  setErrors((e) => ({ ...e, password: undefined }));
              }}
              placeholder="Your password"
              icon={Lock}
              secureTextEntry
              error={errors.password}
            />
            </>}
            <Button
              title={challenge ? "Verify device" : "Sign in"}
              size="lg"
              icon={ArrowRight}
              iconRight
              loading={submitting}
              onPress={onSubmit}
              style={styles.cta}
            />
          </Card>

          <Pressable onPress={() => navigation.navigate("Register")} hitSlop={8}>
            <View style={styles.footerRow}>
              <Caption color={colors.neutral600} size={fontSize.sm}>
                Don't have an account?
              </Caption>
              <AppText weight="bold" size={fontSize.sm} color={colors.primary}>
                {"  "}Become a donor
              </AppText>
            </View>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["3xl"],
    paddingBottom: spacing["4xl"] + spacing["2xl"],
    borderBottomLeftRadius: radius["2xl"],
    borderBottomRightRadius: radius["2xl"],
    overflow: "hidden",
  },
  watermark: {
    position: "absolute",
    right: -34,
    top: -24,
    opacity: 0.07,
  },
  heroCopy: { marginTop: spacing["3xl"], gap: spacing.sm },
  heroTitle: { fontSize: fontSize["4xl"] },
  heroSub: { maxWidth: 280 },
  formWrap: {
    paddingHorizontal: spacing.xl,
    marginTop: -spacing["3xl"],
  },
  card: { gap: spacing.lg, ...shadow.elevated },
  cta: { marginTop: spacing.xs },
  securityNote: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing["2xl"],
  },
});
