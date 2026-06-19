import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors, fonts } from "../theme";

// Pulse mark — a heartbeat line inside a droplet. Mirrors the web Logo.
export function LogoMark({ size = 32, color = colors.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16 2C16 2 5 13.5 5 21a11 11 0 0022 0C27 13.5 16 2 16 2Z"
        fill={color}
      />
      <Path
        d="M9 21h3l2-4 3 8 2.5-5H24"
        stroke={colors.white}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function Logo({
  size = 32,
  withText = false,
  subtitle,
  light = false,
  markColor,
}) {
  const wordColor = light ? colors.white : colors.secondary;
  const subColor = light ? "rgba(255,255,255,0.7)" : colors.neutral600;
  return (
    <View style={styles.row}>
      <LogoMark size={size} color={markColor || colors.primary} />
      {withText && (
        <View style={styles.textCol}>
          <Text style={[styles.word, { color: wordColor }]}>Pulse</Text>
          {subtitle ? (
            <Text style={[styles.sub, { color: subColor }]}>{subtitle}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  textCol: { justifyContent: "center" },
  word: {
    fontFamily: fonts.extrabold,
    fontSize: 20,
    letterSpacing: -0.5,
    lineHeight: 22,
  },
  sub: { fontFamily: fonts.medium, fontSize: 12, marginTop: 2 },
});
