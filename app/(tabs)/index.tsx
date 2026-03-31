import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, BookOpen, ArrowRight } from "lucide-react-native";
import { useTheme } from "@/theme";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/Card";
import { StatsPanel } from "@/components/gamification/StatsPanel";
import { LANGUAGES } from "@/lib/utils";

export default function HomeScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();

  const displayName =
    profile?.display_name || profile?.email?.split("@")[0] || "learner";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ gap: 4, marginTop: 8 }}>
          <Text
            style={{
              fontFamily: "InstrumentSerif-Italic",
              fontSize: 28,
              color: colors.foreground,
            }}
          >
            Welcome back, {displayName}
          </Text>
          <Text
            style={{
              fontFamily: "PlusJakartaSans",
              fontSize: 14,
              color: colors.mutedForeground,
            }}
          >
            Continue your learning across 🇮🇹 🇪🇸 🇩🇪 🇷🇺 🇹🇷
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={{ gap: 12 }}>
          <Card>
            <Pressable
              onPress={() => router.push("/(tabs)/analyze")}
              style={{ gap: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Analyze a sentence"
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: colors.primary + "15",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Search size={20} color={colors.primary} />
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: 16,
                    color: colors.foreground,
                  }}
                >
                  Analyze a sentence
                </Text>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans",
                    fontSize: 13,
                    color: colors.mutedForeground,
                    marginTop: 2,
                  }}
                >
                  Get a full linguistic breakdown with grammar, translation, and
                  tips
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  alignSelf: "flex-start",
                  backgroundColor: colors.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: 14,
                    color: colors.primaryForeground,
                  }}
                >
                  Start
                </Text>
                <ArrowRight size={16} color={colors.primaryForeground} />
              </View>
            </Pressable>
          </Card>

          <Card>
            <Pressable
              onPress={() => router.push("/(tabs)/review")}
              style={{ gap: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Vocabulary review"
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: colors.primary + "15",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpen size={20} color={colors.primary} />
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: 16,
                    color: colors.foreground,
                  }}
                >
                  Vocabulary review
                </Text>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans",
                    fontSize: 13,
                    color: colors.mutedForeground,
                    marginTop: 2,
                  }}
                >
                  Practice your saved words with spaced repetition flashcards
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  alignSelf: "flex-start",
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: 14,
                    color: colors.foreground,
                  }}
                >
                  Review
                </Text>
              </View>
            </Pressable>
          </Card>
        </View>

        {/* Progress Stats */}
        <StatsPanel />

        {/* Languages */}
        <View style={{ gap: 12 }}>
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 11,
              color: colors.mutedForeground,
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            Languages
          </Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {LANGUAGES.map((lang) => (
              <View
                key={lang.code}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: colors.surface2,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-Medium",
                    fontSize: 13,
                    color: colors.foreground,
                  }}
                >
                  {lang.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
