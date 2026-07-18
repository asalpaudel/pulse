import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, HeartHandshake, CalendarHeart, MessageCircle, User } from "lucide-react-native";
import { Platform } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import RequestsScreen from "../screens/RequestsScreen";
import EventsScreen from "../screens/EventsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MessagesScreen from "../screens/MessagesScreen";
import { colors, fonts } from "../theme";

const Tab = createBottomTabNavigator();

const ICONS = {
  Home,
  Requests: HeartHandshake,
  Events: CalendarHeart,
  Profile: User,
  Messages: MessageCircle,
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.neutral400,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11, marginTop: 2 },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.neutral100,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 86 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
        },
        tabBarIcon: ({ color, focused }) => {
          const Icon = ICONS[route.name] || Home;
          return <Icon size={23} color={color} strokeWidth={focused ? 2.4 : 1.9} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Requests" component={RequestsScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
      <Tab.Screen name="Messages" component={MessagesScreen} />
