import { Tabs } from "expo-router";
import {
  House,
  Search,
  BookOpen,
  Settings,
  GraduationCap,
} from "lucide-react-native";
import { useTheme } from "@/theme";
import { Platform, View } from "react-native";
import { LearnLanguageGate } from "@/components/onboarding/LearnLanguageGate";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <LearnLanguageGate />
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontFamily: "PlusJakartaSans-Medium",
          fontSize: 10,
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 56 + (Platform.OS === "ios" ? 34 : 0),
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? 34 : 8,
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
