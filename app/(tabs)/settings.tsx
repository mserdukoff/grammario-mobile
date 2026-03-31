import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut, ChevronRight, Sun, Moon, Monitor } from "lucide-react-native";
import { useTheme, type ThemeMode } from "@/theme";
import { useAuth } from "@/lib/auth-context";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { PillToggle } from "@/components/ui/PillToggle";
import { Button } from "@/components/ui/Button";
import { LANGUAGES } from "@/lib/utils";

const THEME_OPTIONS = [
  { label: "System", value: "system" as ThemeMode },
  { label: "Light", value: "light" as ThemeMode },
  { label: "Dark", value: "dark" as ThemeMode },
];

const LANG_OPTIONS = LANGUAGES.map((l) => ({
  label: l.name,
  value: l.code,
}));

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const { profile, signOut } = useAuth();
  const preferences = useAppStore((s) => s.preferences);
  const setPreference = useAppStore((s) => s.setPreference);

  const adjustGoal = (delta: number) => {
    const newTarget = Math.max(1, Math.min(20, preferences.dailyGoalTarget + delta));
    setPreference("dailyGoalTarget", newTarget);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        <Text
          style={{
            fontFamily: "InstrumentSerif-Italic",
            fontSize: 28,
            color: colors.foreground,
            marginTop: 8,
          }}
        >
          Settings
        </Text>

        {/* Account */}
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 11,
              color: colors.mutedForeground,
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            Account
          </Text>
          <Card style={{ gap: 12 }}>
            <View>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-SemiBold",
                  fontSize: 16,
                  color: colors.foreground,
                }}
              >
                {profile?.display_name || "User"}
              </Text>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans",
                  fontSize: 13,
                  color: colors.mutedForeground,
                }}
              >
                {profile?.email}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: profile?.is_pro
                  ? colors.primary + "20"
                  : colors.surface2,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-Medium",
                  fontSize: 12,
                  color: profile?.is_pro
                    ? colors.primary
                    : colors.mutedForeground,
                }}
              >
                {profile?.is_pro ? "Pro" : "Free"}
              </Text>
            </View>
          </Card>
        </View>

        {/* Preferences */}
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 11,
              color: colors.mutedForeground,
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            Preferences
          </Text>

          <Card style={{ gap: 20 }}>
            {/* Default Language */}
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-Medium",
                  fontSize: 14,
                  color: colors.foreground,
                }}
              >
                Default Language
              </Text>
              <PillToggle
                options={LANG_OPTIONS}
                selected={preferences.defaultLanguage}
                onSelect={(v) => setPreference("defaultLanguage", v)}
              />
            </View>

            {/* Daily Goal */}
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-Medium",
                  fontSize: 14,
                  color: colors.foreground,
                }}
              >
                Daily Goal
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <Pressable
                  onPress={() => adjustGoal(-1)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: colors.surface2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  accessibilityLabel="Decrease daily goal"
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans-Bold",
                      fontSize: 18,
                      color: colors.foreground,
                    }}
                  >
                    −
                  </Text>
                </Pressable>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: 20,
                    color: colors.foreground,
                    minWidth: 40,
                    textAlign: "center",
                  }}
                >
                  {preferences.dailyGoalTarget}
                </Text>
                <Pressable
                  onPress={() => adjustGoal(1)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: colors.surface2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  accessibilityLabel="Increase daily goal"
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans-Bold",
                      fontSize: 18,
                      color: colors.foreground,
                    }}
                  >
                    +
                  </Text>
                </Pressable>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans",
                    fontSize: 13,
                    color: colors.mutedForeground,
                  }}
                >
                  analyses / day
                </Text>
              </View>
            </View>

            {/* Theme */}
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-Medium",
                  fontSize: 14,
                  color: colors.foreground,
                }}
              >
                Theme
              </Text>
              <PillToggle
                options={THEME_OPTIONS}
                selected={mode}
                onSelect={(v) => setMode(v as ThemeMode)}
              />
            </View>
          </Card>
        </View>

        {/* Sign Out */}
        <Button
          title="Sign Out"
          onPress={signOut}
          variant="destructive"
          icon={<LogOut size={18} color="#FFFFFF" />}
        />

        {/* App Info */}
        <View style={{ alignItems: "center", paddingVertical: 16 }}>
          <Text
            style={{
              fontFamily: "PlusJakartaSans",
              fontSize: 12,
              color: colors.mutedForeground,
            }}
          >
            Grammario v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
