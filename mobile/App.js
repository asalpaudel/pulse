import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";

import { ToastProvider } from "./src/context/ToastContext";
import { AuthProvider } from "./src/context/AuthContext";
import { NotificationsProvider } from "./src/context/NotificationsContext";
import RootNavigator from "./src/navigation/RootNavigator";
import Spinner from "./src/components/ui/Spinner";
import { colors } from "./src/theme";

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {!fontsLoaded ? (
          <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <Spinner />
          </View>
        ) : (
          <ToastProvider>
            <AuthProvider>
              <NotificationsProvider>
                <RootNavigator />
              </NotificationsProvider>
            </AuthProvider>
          </ToastProvider>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
