import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { TrendingUp, Flame, Target, ListChecks } from "lucide-react-native";
import { useTheme } from "@/theme";
import { useAuth } from "@/lib/auth-context";
import { xpProgress, xpForNextLevel } from "@/lib/db";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getDailyGoal } from "@/lib/db";
import type { DailyGoal } from "@/lib/database.types";

type StatTileProps = {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  detail: string;
};

function StatTile({ icon, iconBg, label, detail }: StatTileProps) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: isDark ? "#000" : "#2A2926",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.2 : 0.06,
        shadowRadius: 6,
        elevation: 2,
        gap: 10,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
      <View style={{ gap: 2 }}>
        <Text
          style={{
            fontFamily: "PlusJakartaSans-SemiBold",
            fontSize: 15,
            color: colors.foreground,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: "PlusJakartaSans",
            fontSize: 11,
            color: colors.mutedForeground,
            lineHeight: 15,
          }}
        >
          {detail}
        </Text>
      </View>
    </View>
  );
}

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

  return (
    <View style={{ gap: 14 }}>
      <Text
        style={{
          fontFamily: "PlusJakartaSans-SemiBold",
          fontSize: 11,
          color: colors.mutedForeground,
          textTransform: "uppercase",
          letterSpacing: 1.4,
        }}
      >
        Your Progress
      </Text>

      {/* XP level bar */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 15,
              color: colors.foreground,
            }}
          >
            Level {profile.level}
          </Text>
          <Text
            style={{
              fontFamily: "PlusJakartaSans-Medium",
              fontSize: 12,
              color: colors.mutedForeground,
            }}
          >
            {profile.xp} / {nextLevel} XP
          </Text>
        </View>
        <ProgressBar progress={progress} />

        {todayGoal && (
          <View style={{ gap: 6, marginTop: 4 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-Medium",
                  fontSize: 12,
                  color: colors.mutedForeground,
                }}
              >
                Daily goal
              </Text>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-Medium",
                  fontSize: 12,
                  color: todayGoal.is_achieved ? colors.success : colors.mutedForeground,
                }}
              >
                {todayGoal.completed}/{todayGoal.target}
                {todayGoal.is_achieved ? " ✓" : ""}
              </Text>
            </View>
            <ProgressBar progress={goalProgress} fillColor={colors.success} />
          </View>
        )}
      </View>

      {/* 2x2 grid of stat tiles */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <StatTile
          icon={<Flame size={18} color={colors.warning} />}
          iconBg={colors.warningLight}
          label={`${profile.streak}d`}
          detail={`Best ${profile.longest_streak} days`}
        />
        <StatTile
          icon={<Target size={18} color={colors.success} />}
          iconBg={colors.successLight}
          label={`${profile.total_analyses}`}
          detail="Sentences analyzed"
        />
      </View>
    </View>
  );
}
