import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, BookOpen, GraduationCap, ChevronRight } from "lucide-react-native";
import { useTheme } from "@/theme";
import { useAuth } from "@/lib/auth-context";
import { StatsPanel } from "@/components/gamification/StatsPanel";
import { LANGUAGES } from "@/lib/utils";

type ActionCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
};

function ActionCard({ icon, title, description, onPress }: ActionCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 18,
        shadowColor: isDark ? "#000" : "#2A2926",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.18 : 0.07,
        shadowRadius: 8,
        elevation: 3,
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.977 : 1 }],
        gap: 10,
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: colors.primary + "16",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
      <View style={{ gap: 3 }}>
        <Text
          style={{
            fontFamily: "PlusJakartaSans-Bold",
            fontSize: 15,
            color: colors.foreground,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: "PlusJakartaSans",
            fontSize: 12,
            color: colors.mutedForeground,
            lineHeight: 17,
          }}
        >
          {description}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 }}>
        <Text
          style={{
            fontFamily: "PlusJakartaSans-SemiBold",
            fontSize: 12,
            color: colors.primary,
          }}
        >
          Open
        </Text>
        <ChevronRight size={13} color={colors.primary} />
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();

  const displayName =
    profile?.display_name || profile?.email?.split("@")[0] || "learner";

  const firstName = displayName.split(" ")[0];

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 28 }}>
          <Text
            style={{
              fontFamily: "PlusJakartaSans-Medium",
              fontSize: 13,
              color: colors.mutedForeground,
              letterSpacing: 0.3,
              marginBottom: 6,
            }}
          >
            Good to see you back
          </Text>
          <Text
            style={{
              fontFamily: "InstrumentSerif-Italic",
              fontSize: 36,
              color: colors.foreground,
              lineHeight: 42,
            }}
          >
            {firstName}
          </Text>
          <Text
            style={{
              fontFamily: "PlusJakartaSans",
              fontSize: 14,
              color: colors.mutedForeground,
              marginTop: 6,
            }}
          >
            Continue your journey across 🇮🇹 🇪🇸 🇩🇪 🇷🇺 🇹🇷
          </Text>
        </View>

        {/* Action cards */}
        <View style={{ paddingHorizontal: 24, gap: 20 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <ActionCard
              icon={<Search size={20} color={colors.primary} />}
              title="Analyze"
              description="Grammar, translation & learning tips"
              onPress={() => router.push("/(tabs)/analyze")}
            />
            <ActionCard
              icon={<GraduationCap size={20} color={colors.primary} />}
              title="Learn"
              description="CEFR levels and grammar topics"
              onPress={() => router.push("/learn")}
            />
          </View>

          <View style={{ flexDirection: "row" }}>
            <ActionCard
              icon={<BookOpen size={20} color={colors.primary} />}
              title="Review"
              description="Spaced repetition flashcards"
              onPress={() => router.push("/(tabs)/review")}
            />
          </View>
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
            marginHorizontal: 24,
            marginVertical: 28,
          }}
        />

        {/* Progress Stats */}
        <View style={{ paddingHorizontal: 24 }}>
          <StatsPanel />
        </View>

        {/* Languages */}
        <View style={{ paddingHorizontal: 24, marginTop: 28 }}>
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 11,
              color: colors.mutedForeground,
              textTransform: "uppercase",
              letterSpacing: 1.4,
              marginBottom: 12,
            }}
          >
            Languages
          </Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {LANGUAGES.map((lang) => (
              <View
                key={lang.code}
                style={{
                  backgroundColor: colors.surface2,
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: colors.border,
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
