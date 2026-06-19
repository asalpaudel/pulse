import { View } from "react-native";
import { colors } from "../../theme";

export default function Divider({ style }) {
  return (
    <View
      style={[{ height: 1, backgroundColor: colors.neutral100, marginVertical: 4 }, style]}
    />
  );
}
