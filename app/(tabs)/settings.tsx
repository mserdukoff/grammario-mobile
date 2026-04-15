import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut, ExternalLink, Trophy, ChevronRight } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useTheme, type ThemeMode } from "@/theme";
import type { ThemeColors } from "@/theme/colors";
import { useAuth } from "@/lib/auth-context";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { PillToggle } from "@/components/ui/PillToggle";
import { Button } from "@/components/ui/Button";
import { LANGUAGES } from "@/lib/utils";
import { updateUserLearnLanguage } from "@/lib/db";

const THEME_OPTIONS = [
  { label: "System", value: "system" as ThemeMode },
  { label: "Light", value: "light" as ThemeMode },
  { label: "Dark", value: "dark" as ThemeMode },
];

const DAILY_GOAL_PRESETS = [3, 5, 10, 15, 20] as const;

const DAILY_GOAL_OPTIONS = DAILY_GOAL_PRESETS.map((n) => ({
  label: String(n),
  value: String(n),
}));

const LEARN_LANG_CHANGE_AT_KEY = "grammario-last-learn-language-change-at";

const WEB_ORIGIN =
  process.env.EXPO_PUBLIC_WEB_ORIGIN || "https://grammario.ai";

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const { profile, signOut, user, refreshProfile } = useAuth();
  const router = useRouter();
  const preferences = useAppStore((s) => s.preferences);
  const setPreference = useAppStore((s) => s.setPreference);

  const openLegal = (path: string) => {
    Linking.openURL(`${WEB_ORIGIN}${path}`).catch(() => {});
  };

  const learnLanguageOptions = LANGUAGES.map((l) => ({
    label: l.name,
    value: l.code,
  }));

  const selectedGoalStr = String(
    DAILY_GOAL_PRESETS.includes(preferences.dailyGoalTarget as (typeof DAILY_GOAL_PRESETS)[number])
      ? preferences.dailyGoalTarget
      : 5
  );

  const onDailyGoalSelect = (v: string) => {
    setPreference("dailyGoalTarget", parseInt(v, 10));
  };

  const trySetLearnLanguage = async (code: string) => {
    if (!user) return;
    if (profile?.is_pro) {
      setPreference("defaultLanguage", code);
      return;
    }
    const prev = profile?.learn_language;
    if (prev === code) {
      setPreference("defaultLanguage", code);
      return;
    }

    if (prev) {
      const raw = await AsyncStorage.getItem(LEARN_LANG_CHANGE_AT_KEY);
      const last = raw ? parseInt(raw, 10) : 0;
      const days = (Date.now() - last) / (1000 * 60 * 60 * 24);
      if (last > 0 && days < 30) {
        Alert.alert(
          "Cooldown",
          `You can switch learning language once every 30 days. Try again in about ${Math.ceil(30 - days)} day(s).`
        );
        return;
      }
    }

    try {
      await updateUserLearnLanguage(user.id, code);
      await AsyncStorage.setItem(LEARN_LANG_CHANGE_AT_KEY, String(Date.now()));
      setPreference("defaultLanguage", code);
      await refreshProfile();
    } catch (e) {
      Alert.alert(
        "Could not update",
        e instanceof Error ? e.message : "Please try again."
      );
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 28 }}>
        <Text
          style={{
            fontFamily: "InstrumentSerif-Italic",
            fontSize: 32,
            color: colors.foreground,
          }}
        >
          Settings
        </Text>

        <View style={{ gap: 10 }}>
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 11,
              color: colors.mutedForeground,
              textTransform: "uppercase",
              letterSpacing: 1.4,
            }}
          >
            Account
          </Text>
          <Card style={{ gap: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: colors.primary + "18",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: "InstrumentSerif-Italic", fontSize: 22, color: colors.primary }}>
                  {(profile?.display_name || "U")[0].toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
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
                    marginTop: 2,
                  }}
                >
                  {profile?.email}
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: profile?.is_pro
                  ? colors.primary + "14"
                  : colors.surface2,
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderRadius: 12,
                gap: 4,
              }}
            >
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-SemiBold",
                  fontSize: 13,
                  color: profile?.is_pro
                    ? colors.primary
                    : colors.mutedForeground,
                }}
              >
                {profile?.is_pro ? "Pro" : "Free"} · Beta access
              </Text>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans",
                  fontSize: 12,
                  color: colors.mutedForeground,
                  lineHeight: 18,
                }}
              >
                {profile?.is_pro
                  ? "All supported languages are included."
                  : "Pro upgrades are not yet available during the test release. Stay tuned!"}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 16,
                paddingTop: 4,
              }}
            >
              {[
                { label: "Level", value: String(profile?.level ?? 1) },
                { label: "XP", value: String(profile?.xp ?? 0) },
                { label: "Streak", value: String(profile?.streak ?? 0) },
                { label: "Analyses", value: String(profile?.total_analyses ?? 0) },
              ].map((item) => (
                <View key={item.label} style={{ alignItems: "center", flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans-Bold",
                      fontSize: 16,
                      color: colors.foreground,
                    }}
                  >
                    {item.value}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans",
                      fontSize: 11,
                      color: colors.mutedForeground,
                      marginTop: 2,
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {!profile?.is_pro && profile?.learn_language != null && (
          <View style={{ gap: 10 }}>
            <Text
              style={{
                fontFamily: "PlusJakartaSans-SemiBold",
                fontSize: 11,
                color: colors.mutedForeground,
                textTransform: "uppercase",
                letterSpacing: 1.4,
              }}
            >
              Learning language
            </Text>
            <Card style={{ gap: 12 }}>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans",
                  fontSize: 13,
                  color: colors.mutedForeground,
                  lineHeight: 19,
                }}
              >
                Switching is allowed at most once every 30 days on the free tier.
              </Text>
              <PillToggle
                options={learnLanguageOptions}
                selected={profile.learn_language}
                onSelect={trySetLearnLanguage}
              />
            </Card>
          </View>
        )}

        <View style={{ gap: 10 }}>
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 11,
              color: colors.mutedForeground,
              textTransform: "uppercase",
              letterSpacing: 1.4,
            }}
          >
            Preferences
          </Text>

          <Card style={{ gap: 22 }}>
            {profile?.is_pro && (
              <View style={{ gap: 8 }}>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-Medium",
                    fontSize: 14,
                    color: colors.foreground,
                  }}
                >
                  Default analyze language
                </Text>
                <PillToggle
                  options={learnLanguageOptions}
                  selected={preferences.defaultLanguage}
                  onSelect={(code) => setPreference("defaultLanguage", code)}
                />
              </View>
            )}

            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-Medium",
                  fontSize: 14,
                  color: colors.foreground,
                }}
              >
                Daily goal (analyses)
              </Text>
              <PillToggle
                options={DAILY_GOAL_OPTIONS}
                selected={selectedGoalStr}
                onSelect={onDailyGoalSelect}
              />
            </View>

            <RowToggle
              label="Show translations"
              description="English gloss in the analysis sheet when available"
              value={preferences.showTranslations}
              onValueChange={(v) => setPreference("showTranslations", v)}
              colors={colors}
            />
            <RowToggle
              label="Text-to-speech"
              description="Speak the sentence from the analyze toolbar"
              value={preferences.enableTTS}
              onValueChange={(v) => setPreference("enableTTS", v)}
              colors={colors}
            />
            <RowToggle
              label="Sounds & haptics"
              description="Light feedback taps when reviewing and saving"
              value={preferences.enableSounds}
              onValueChange={(v) => setPreference("enableSounds", v)}
              colors={colors}
            />

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

        <View style={{ gap: 10 }}>
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 11,
              color: colors.mutedForeground,
              textTransform: "uppercase",
              letterSpacing: 1.4,
            }}
          >
            Progress
          </Text>
          <Pressable onPress={() => router.push("/achievements")}>
            <Card
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: colors.primary + "14",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trophy size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: 15,
                    color: colors.foreground,
                  }}
                >
                  Achievements
                </Text>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans",
                    fontSize: 13,
                    color: colors.mutedForeground,
                    marginTop: 2,
                  }}
                >
                  View unlocked milestones
                </Text>
              </View>
              <ChevronRight size={18} color={colors.mutedForeground} />
            </Card>
          </Pressable>
        </View>

        <View style={{ gap: 10 }}>
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 11,
              color: colors.mutedForeground,
              textTransform: "uppercase",
              letterSpacing: 1.4,
            }}
          >
            Legal
          </Text>
          <Card style={{ gap: 0 }}>
            <LegalRow
              title="Terms of Service"
              onPress={() => openLegal("/terms")}
              colors={colors}
            />
            <LegalRow
              title="Privacy Policy"
              onPress={() => openLegal("/privacy")}
              colors={colors}
            />
            <LegalRow
              title="Patch notes"
              onPress={() => openLegal("/patch-notes")}
              colors={colors}
            />
            <LegalRow
              title="Contact support"
              onPress={() =>
                Linking.openURL("mailto:support@grammario.app").catch(() => {})
              }
              colors={colors}
              isLast
            />
          </Card>
        </View>

        <Button
          title="Sign Out"
          onPress={signOut}
          variant="destructive"
          icon={<LogOut size={18} color="#FFFFFF" />}
        />

        <View style={{ alignItems: "center", paddingVertical: 8, gap: 4 }}>
          <Text
            style={{
              fontFamily: "InstrumentSerif-Italic",
              fontSize: 18,
              color: colors.mutedForeground + "80",
            }}
          >
            Grammario
          </Text>
          <Text
            style={{
              fontFamily: "PlusJakartaSans",
              fontSize: 12,
              color: colors.mutedForeground + "80",
            }}
          >
            v1.0.0 · Test Release
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RowToggle({
  label,
  description,
  value,
  onValueChange,
  colors,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  colors: ThemeColors;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "PlusJakartaSans-Medium",
            fontSize: 14,
            color: colors.foreground,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: "PlusJakartaSans",
            fontSize: 12,
            color: colors.mutedForeground,
            marginTop: 2,
          }}
        >
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surface3, true: colors.primary + "99" }}
        thumbColor={value ? colors.primary : colors.mutedForeground}
      />
    </View>
  );
}

function LegalRow({
  title,
  onPress,
  colors,
  isLast,
}: {
  title: string;
  onPress: () => void;
  colors: ThemeColors;
  isLast?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
      accessibilityRole="link"
    >
      <Text
        style={{
          fontFamily: "PlusJakartaSans-Medium",
          fontSize: 15,
          color: colors.foreground,
        }}
      >
        {title}
      </Text>
      <ExternalLink size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}



