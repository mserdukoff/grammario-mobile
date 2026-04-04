import React, { useEffect } from "react";
import { Alert, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { MoreVertical } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";
import { isAdminUser } from "@/lib/admin";
import { useTheme } from "@/theme";

export default function AdminStackLayout() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    if (!isAdminUser(user?.id)) {
      router.replace("/(tabs)");
    }
  }, [user?.id, router]);

  const menu = () => {
    Alert.alert("Admin", undefined, [
      { text: "Back to app", onPress: () => router.replace("/(tabs)") },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          signOut().catch(() => {});
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  if (!isAdminUser(user?.id)) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.card },
        headerShadowVisible: false,
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontFamily: "PlusJakartaSans-SemiBold",
          fontSize: 17,
          color: colors.foreground,
        },
        headerRight: () => (
          <Pressable
            onPress={menu}
            hitSlop={12}
            style={{ padding: 8, marginRight: 4 }}
          >
            <MoreVertical size={22} color={colors.foreground} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Overview" }} />
      <Stack.Screen name="users" options={{ title: "Users" }} />
      <Stack.Screen name="requests" options={{ title: "Requests & Data" }} />
      <Stack.Screen name="vocabulary" options={{ title: "Vocabulary" }} />
      <Stack.Screen name="feedback" options={{ title: "Sentence Feedback" }} />
      <Stack.Screen name="backend" options={{ title: "Backend" }} />
    </Stack>
  );
}
