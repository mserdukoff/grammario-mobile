import React from "react";
import { View, Text } from "react-native";
import { TrendingUp, Flame, Target } from "lucide-react-native";
import { useTheme } from "@/theme";
import { useAuth, xpProgress, xpForNextLevel } from "@/lib/auth-context";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function StatsPanel() {
  const { colors } = useTheme();
  const { profile } = useAuth();

  if (!profile) return null;

  const progress = xpProgress(profile.xp, profile.level);
  const nextLevel = xpForNextLevel(profile.level);

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
