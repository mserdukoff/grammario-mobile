import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme";
import { getAdminStats, type AdminStats } from "@/lib/admin-api";
import {
  ADMIN_LANGS,
  pickStat,
  analysesByLanguage,
  listFromStats,
  formatDate,
  truncate,
  pickStr,
  num,
} from "@/lib/admin-format";
import { AdminNav } from "@/components/admin/AdminNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";

function analysisSentence(row: Record<string, unknown>): string {
  const meta = row.metadata as Record<string, unknown> | undefined;
  return pickStr(row.text ?? row.sentence ?? meta?.text);
}

function analysisId(row: Record<string, unknown>): string {
  return pickStr(row.id);
}

export default function AdminOverviewScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const langCounts = stats ? analysesByLanguage(stats) : {};
  const totalLang = ADMIN_LANGS.reduce((s, l) => s + (langCounts[l.code] || 0), 0);

  const recentAnalyses = stats ? listFromStats(stats, "recent_analyses") : [];
  const recentSignups = stats ? listFromStats(stats, "recent_signups") : [];

  const kpis = stats
    ? [
        {
          label: "Total users",
          value: pickStat(stats, "total_users", "totalUsers", "users_count", "user_count"),
        },
        {
          label: "Active this week",
          value: pickStat(stats, "active_this_week", "activeThisWeek", "weekly_active_users", "wau"),
        },
        {
          label: "Total analyses",
          value: pickStat(stats, "total_analyses", "totalAnalyses", "analyses_count", "request_count"),
        },
        {
          label: "Analyses today",
          value: pickStat(stats, "analyses_today", "analysesToday", "today_analyses", "daily_analyses"),
        },
        {
          label: "Analyses this week",
          value: pickStat(stats, "analyses_this_week", "analysesThisWeek", "weekly_analyses", "week_analyses"),
        },
        {
          label: "Pro users",
          value: pickStat(stats, "pro_users", "proUsers", "pro_count", "premium_users"),
        },
        {
          label: "Vocabulary total",
          value: pickStat(stats, "vocabulary_total", "vocabularyTotal", "vocab_count", "saved_words"),
          subtitle: (() => {
            const m = pickStat(stats, "vocabulary_mastered", "vocabularyMastered", "vocab_mastered");
            return m > 0 ? `${m} mastered` : undefined;
          })(),
        },
      ]
    : [];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={[]}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />
        }
      >
        <AdminNav current="overview" />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "InstrumentSerif-Italic",
              fontSize: 26,
              color: colors.foreground,
            }}
          >
            Overview
          </Text>
          <Button title="Refresh" onPress={load} variant="outline" />
        </View>

        {error ? (
          <Card>
            <Text
              selectable
              style={{
                fontFamily: "PlusJakartaSans",
                fontSize: 13,
                lineHeight: 20,
                color: colors.destructive,
              }}
            >
              {error}
            </Text>
          </Card>
        ) : null}


        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {kpis.map((k) => (
            <View key={k.label} style={{ width: "48%", flexGrow: 1 }}>
              <Card style={{ minHeight: 88 }}>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans",
                    fontSize: 12,
                    color: colors.mutedForeground,
                  }}
                >
                  {k.label}
                </Text>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: 22,
                    color: colors.foreground,
                    marginTop: 4,
                  }}
                >
                  {k.value.toLocaleString()}
                </Text>
                {k.subtitle ? (
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans",
                      fontSize: 11,
                      color: colors.mutedForeground,
                      marginTop: 2,
                    }}
                  >
                    {k.subtitle}
                  </Text>
                ) : null}
              </Card>
            </View>
          ))}
        </View>

        <Text
          style={{
            fontFamily: "PlusJakartaSans-SemiBold",
            fontSize: 16,
            color: colors.foreground,
          }}
        >
          Analyses by language
        </Text>
        {totalLang === 0 ? (
          <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>
            No data yet
          </Text>
        ) : (
          <Card>
            <View style={{ gap: 12 }}>
              {ADMIN_LANGS.map((lang) => {
                const c = langCounts[lang.code] || 0;
                const pct = totalLang > 0 ? (c / totalLang) * 100 : 0;
                return (
                  <View key={lang.code} style={{ gap: 4 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ fontFamily: "PlusJakartaSans", color: colors.foreground }}>
                        {lang.flag} {lang.name}
                      </Text>
                      <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>
                        {c.toLocaleString()}
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 8,
                        backgroundColor: colors.muted,
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          backgroundColor: colors.primary,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 16,
              color: colors.foreground,
            }}
          >
            Recent analyses
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/admin/requests")}>
            <Text style={{ fontFamily: "PlusJakartaSans-Medium", color: colors.primary }}>
              View all
            </Text>
          </Pressable>
        </View>
        <Card>
          <View style={{ gap: 12 }}>
            {recentAnalyses.length === 0 ? (
              <Text style={{ color: colors.mutedForeground, fontFamily: "PlusJakartaSans" }}>
                No recent analyses
              </Text>
            ) : (
              recentAnalyses.map((row, i) => {
                const id = analysisId(row);
                const lang = pickStr(row.language);
                const flag = ADMIN_LANGS.find((l) => l.code === lang)?.flag ?? "🌐";
                return (
                  <Pressable
                    key={id || String(i)}
                    onPress={() =>
                      id
                        ? router.push({
                            pathname: "/(tabs)/admin/requests",
                            params: { id },
                          })
                        : undefined
                    }
                  >
                    <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                      <Text style={{ fontSize: 18 }}>{flag}</Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: "PlusJakartaSans",
                            color: colors.foreground,
                          }}
                        >
                          {truncate(analysisSentence(row), 120)}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "PlusJakartaSans",
                            fontSize: 12,
                            color: colors.mutedForeground,
                            marginTop: 2,
                          }}
                        >
                          {formatDate(pickStr(row.created_at))}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </Card>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 16,
              color: colors.foreground,
            }}
          >
            Recent sign-ups
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/admin/users")}>
            <Text style={{ fontFamily: "PlusJakartaSans-Medium", color: colors.primary }}>
              View all
            </Text>
          </Pressable>
        </View>
        <Card>
          <View style={{ gap: 14 }}>
            {recentSignups.length === 0 ? (
              <Text style={{ color: colors.mutedForeground, fontFamily: "PlusJakartaSans" }}>
                No recent sign-ups
              </Text>
            ) : (
              recentSignups.map((row, i) => {
                const id = pickStr(row.id);
                const email = pickStr(row.email);
                const name = pickStr(row.display_name) || email.split("@")[0] || "?";
                return (
                  <View
                    key={id || String(i)}
                    style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: colors.primary,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans-SemiBold",
                          color: colors.primaryForeground,
                        }}
                      >
                        {name.slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", color: colors.foreground }}>
                        {name}
                      </Text>
                      <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 12, color: colors.mutedForeground }}>
                        {email}
                      </Text>
                      <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 11, color: colors.mutedForeground }}>
                        Joined {formatDate(pickStr(row.created_at))}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
