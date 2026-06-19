import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import { Animated, StyleSheet, Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react-native";
import { colors, fonts, radius, shadow, spacing } from "../theme";

const ToastContext = createContext(null);

const TONES = {
  info: { bg: colors.secondary, accent: colors.tertiary, Icon: Info },
  success: { bg: colors.secondary, accent: colors.green600, Icon: CircleCheck },
  error: { bg: colors.secondary, accent: colors.primary, Icon: CircleAlert },
  alert: { bg: colors.primary, accent: colors.white, Icon: TriangleAlert },
};

let idSeq = 0;

export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const anim = useState(() => new Animated.Value(0))[0];
  const hideTimer = useRef(null);

  const dismiss = useCallback(() => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, [anim]);

  const show = useCallback(
    (tone, message, title) => {
      if (!message) return;
      if (hideTimer.current) clearTimeout(hideTimer.current);
      idSeq += 1;
      setToast({ id: idSeq, tone, message, title });
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 9,
        tension: 80,
      }).start();
      hideTimer.current = setTimeout(dismiss, tone === "alert" ? 6000 : 3500);
    },
    [anim, dismiss],
  );

  useEffect(() => () => hideTimer.current && clearTimeout(hideTimer.current), []);

  const api = useMemo(
    () => ({
      info: (m, t) => show("info", m, t),
      success: (m, t) => show("success", m, t),
      error: (m, t) => show("error", m, t),
      alert: (m, t) => show("alert", m, t),
    }),
    [show],
  );

  const cfg = toast ? TONES[toast.tone] || TONES.info : TONES.info;
  const Icon = cfg.Icon;

  return (
    <ToastContext.Provider value={{ toast: api }}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.wrap,
            { top: insets.top + spacing.sm },
            {
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-24, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable
            onPress={dismiss}
            style={[styles.toast, { backgroundColor: cfg.bg }, shadow.elevated]}
          >
            <View style={[styles.iconWrap, { backgroundColor: "rgba(255,255,255,0.14)" }]}>
              <Icon size={18} color={cfg.accent} strokeWidth={2.2} />
            </View>
            <View style={styles.body}>
              {toast.title ? <Text style={styles.title}>{toast.title}</Text> : null}
              <Text style={styles.message} numberOfLines={3}>
                {toast.message}
              </Text>
            </View>
            <X size={16} color="rgba(255,255,255,0.6)" />
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 1000,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    height: 34,
    width: 34,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  title: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 1,
  },
  message: {
    color: "rgba(255,255,255,0.92)",
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
});

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
