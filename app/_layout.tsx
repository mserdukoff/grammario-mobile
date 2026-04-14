import "../global.css";
import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ThemeProvider, useTheme } from "@/theme";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ToastProvider } from "@/components/gamification/AchievementToast";

SplashScreen.preventAutoHideAsync();

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FAFAF8",
        padding: 32,
        gap: 16,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          color: "#1A1A1A",
          textAlign: "center",
        }}
      >
        Something went wrong
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: "#6B6B6B",
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        {error.message || "An unexpected error occurred."}
      </Text>
      <Pressable
        onPress={retry}
        style={{
          backgroundColor: "#1A1A1A",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 10,
          marginTop: 8,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 15 }}>
          Try again
        </Text>
      </Pressable>
    </View>
  );
}

function useProtectedRoute() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);
}

function RootNavigator() {
  const { loading } = useAuth();
  const { isDark } = useTheme();

  useProtectedRoute();

  if (loading) return null;

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen
          name="grammar-reference"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="achievements"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans: require("@/assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("@/assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-SemiBold": require("@/assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "PlusJakartaSans-Bold": require("@/assets/fonts/PlusJakartaSans-Bold.ttf"),
    InstrumentSerif: require("@/assets/fonts/InstrumentSerif-Regular.ttf"),
    "InstrumentSerif-Italic": require("@/assets/fonts/InstrumentSerif-Italic.ttf"),
    JetBrainsMono: require("@/assets/fonts/JetBrainsMono-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <BottomSheetModalProvider>
            <ToastProvider>
              <RootNavigator />
            </ToastProvider>
          </BottomSheetModalProvider>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
