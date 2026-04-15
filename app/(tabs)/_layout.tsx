import { Tabs } from "expo-router";
import {
  House,
  Search,
  BookOpen,
  Settings,
  GraduationCap,
  LayoutDashboard,
} from "lucide-react-native";
import { useTheme } from "@/theme";
import { Platform, View } from "react-native";
import { LearnLanguageGate } from "@/components/onboarding/LearnLanguageGate";
import { useAuth } from "@/lib/auth-context";
import { isAdminUser } from "@/lib/admin";

export default function TabLayout() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const showAdminTab = isAdminUser(user?.id);

  return (
    <View style={{ flex: 1 }}>
      <LearnLanguageGate />
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontFamily: "PlusJakartaSans-SemiBold",
          fontSize: 10,
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          height: 62 + (Platform.OS === "ios" ? 34 : 0),
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 34 : 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 12,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <House size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="analyze"
        options={{
          title: "Analyze",
          tabBarIcon: ({ color, size }) => (
            <Search size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size }) => (
            <GraduationCap size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: "Review",
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          href: showAdminTab ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}
