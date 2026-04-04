import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { TrendingUp, Flame, Target, ListChecks } from "lucide-react-native";
import { useTheme } from "@/theme";
import { useAuth, xpProgress, xpForNextLevel } from "@/lib/auth-context";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getDailyGoal } from "@/lib/db";
import type { DailyGoal } from "@/lib/database.types";

export function StatsPanel() {
  const { colors } = useTheme();
  const { profile, user } = useAuth();
  const [todayGoal, setTodayGoal] = useState<DailyGoal | null>(null);

  useEffect(() => {
    if (!user) return;
    getDailyGoal(user.id).then(setTodayGoal).catch(() => setTodayGoal(null));
  }, [user?.id, profile?.total_analyses]);

  if (!profile) return null;

  const progress = xpProgress(profile.xp, profile.level);
  const nextLevel = xpForNextLevel(profile.level);

  const goalProgress =
    todayGoal && todayGoal.target > 0
      ? Math.min(100, (todayGoal.completed / todayGoal.target) * 100)
      : 0;

  const stats = [
    {
      icon: <TrendingUp size={18} color={colors.primary} />,
      label: `Level ${profile.level}`,
      detail: `${profile.xp} XP total`,
      iconBg: colors.surface2,
    },
    {
      icon: <Flame size={18} color={colors.warning} />,
      label: `${profile.streak} day streak`,
      detail: `Best: ${profile.longest_streak} days`,
      iconBg: colors.surface2,
    },
    {
      icon: <Target size={18} color={colors.success} />,
      label: `${profile.total_analyses} analyses`,
      detail: "Total sentences analyzed",
      iconBg: colors.surface2,
    },
    ...(todayGoal
      ? [
          {
            icon: <ListChecks size={18} color={colors.primary} />,
            label: `Daily goal ${todayGoal.completed}/${todayGoal.target}`,
            detail: todayGoal.is_achieved
              ? "Completed today"
              : "Analyses toward today’s target",
            iconBg: colors.surface2,
          },
        ]
      : []),
  ];

  return (
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
        Your Progress
      </Text>

      <View style={{ gap: 4, marginBottom: 8 }}>
        <ProgressBar progress={progress} />
        <Text
          style={{
            fontFamily: "PlusJakartaSans",
            fontSize: 11,
            color: colors.mutedForeground,
            textAlign: "right",
          }}
        >
          {profile.xp} / {nextLevel} XP
        </Text>
      </View>

      {todayGoal && (
        <View style={{ gap: 4, marginBottom: 12 }}>
          <ProgressBar progress={goalProgress} fillColor={colors.success} />
        </View>
      )}

      {stats.map((stat, i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: stat.iconBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {stat.icon}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "PlusJakartaSans-Medium",
                fontSize: 14,
                color: colors.foreground,
              }}
            >
              {stat.label}
            </Text>
            <Text
              style={{
                fontFamily: "PlusJakartaSans",
                fontSize: 12,
                color: colors.mutedForeground,
              }}
            >
              {stat.detail}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
