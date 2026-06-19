import { useState } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { AppText, Label } from "./Text";
import { colors, fonts, radius, spacing, fontSize } from "../../theme";

// Labeled text field with focus ring, optional leading icon, error text,
// and a password reveal toggle. Matches the web Input conventions.
export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  icon: Icon,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = "none",
  multiline = false,
  editable = true,
  style,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  const borderColor = error
    ? colors.primary
    : focused
      ? colors.primary
      : colors.neutral200;

  return (
    <View style={[styles.wrap, style]}>
      {label ? <Label style={styles.label}>{label}</Label> : null}
      <View
        style={[
          styles.field,
          { borderColor, backgroundColor: editable ? colors.white : colors.blushSoft },
          focused && styles.focusRing,
          multiline && styles.multiline,
        ]}
      >
        {Icon ? <Icon size={18} color={focused ? colors.primary : colors.neutral400} strokeWidth={1.9} /> : null}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral400}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          multiline={multiline}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            {hidden ? (
              <EyeOff size={18} color={colors.neutral400} />
            ) : (
              <Eye size={18} color={colors.neutral500} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText weight="medium" size={fontSize.xs} color={colors.primary} style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { marginLeft: 2 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  multiline: { alignItems: "flex-start", paddingVertical: spacing.md, minHeight: 96 },
  focusRing: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  input: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  error: { marginLeft: 2 },
});
