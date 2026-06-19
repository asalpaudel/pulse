import { Text as RNText } from "react-native";
import { colors, fonts, fontSize } from "../../theme";

// Typography presets — keeps Manrope + the brand color scale consistent
// everywhere. Use these instead of raw <Text> so screens stay on-brand.
//
//   <Display>   screen hero numbers / big values
//   <Title>     section + card titles
//   <Heading>   sub-section headers
//   <Body>      default paragraph text
//   <Label>     small uppercase-ish meta labels
//   <Caption>   muted fine print
//   <AppText>   escape hatch with weight/size/color props

const weightMap = {
  regular: fonts.regular,
  medium: fonts.medium,
  semibold: fonts.semibold,
  bold: fonts.bold,
  extrabold: fonts.extrabold,
};

export function AppText({
  weight = "regular",
  size = fontSize.base,
  color = colors.text,
  style,
  children,
  ...rest
}) {
  return (
    <RNText
      style={[{ fontFamily: weightMap[weight] || fonts.regular, fontSize: size, color }, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

export function Display({ style, color = colors.secondary, children, ...rest }) {
  return (
    <RNText
      style={[{ fontFamily: fonts.extrabold, fontSize: fontSize["3xl"], color, letterSpacing: -0.5 }, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

export function Title({ style, color = colors.secondary, children, ...rest }) {
  return (
    <RNText
      style={[{ fontFamily: fonts.bold, fontSize: fontSize.xl, color, letterSpacing: -0.3 }, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

export function Heading({ style, color = colors.secondary, children, ...rest }) {
  return (
    <RNText
      style={[{ fontFamily: fonts.bold, fontSize: fontSize.md, color }, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

export function Body({ style, color = colors.neutral700, children, ...rest }) {
  return (
    <RNText
      style={[{ fontFamily: fonts.regular, fontSize: fontSize.base, color, lineHeight: 21 }, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

export function Label({ style, color = colors.neutral500, children, ...rest }) {
  return (
    <RNText
      style={[
        {
          fontFamily: fonts.semibold,
          fontSize: fontSize.xs,
          color,
          letterSpacing: 0.4,
          textTransform: "uppercase",
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

export function Caption({ style, color = colors.neutral500, children, ...rest }) {
  return (
    <RNText
      style={[{ fontFamily: fonts.medium, fontSize: fontSize.xs, color }, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

export default AppText;
