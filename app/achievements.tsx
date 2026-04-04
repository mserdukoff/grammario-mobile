import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Trophy, Lock } from "lucide-react-native";
import { useTheme } from "@/theme";
import { useAuth } from "@/lib/auth-context";
import {
  getAchievements,
  getUserAchievements,
} from "@/lib/db";
import type { Achievement } from "@/lib/database.types";

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [list, setList] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [all, mine] = await Promise.all([
        getAchievements(),
        getUserAchievements(user.id),
      ]);
      setList(all);
      setUnlocked(new Set(mine.map((m) => m.achievement_id)));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text
          style={{
            fontFamily: "InstrumentSerif-Italic",
            fontSize: 22,
            color: colors.foreground,
          }}
        >
          Achievements
        </Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={24} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {list.length === 0 ? (
            <Text
              style={{
                fontFamily: "PlusJakartaSans",
                color: colors.mutedForeground,
              }}
            >
              No achievement definitions in the database yet.
            </Text>
          ) : (
            list.map((a) => {
              const isOpen = unlocked.has(a.id);
              return (
                <View
                  key={a.id}
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: isOpen
                        ? colors.primary + "18"
                        : colors.surface2,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isOpen ? (
                      <Trophy size={20} color={colors.primary} />
                    ) : (
                      <Lock size={18} color={colors.mutedForeground} />
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text
                      style={{
                        fontFamily: "PlusJakartaSans-SemiBold",
                        fontSize: 15,
                        color: colors.foreground,
                      }}
                    >
                      {a.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "PlusJakartaSans",
                        fontSize: 13,
                        color: colors.mutedForeground,
                        lineHeight: 19,
                      }}
                    >
                      {a.description}
                    </Text>
                    {a.xp_reward > 0 && (
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans-Medium",
                          fontSize: 12,
                          color: colors.primary,
                        }}
                      >
                        +{a.xp_reward} XP
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
