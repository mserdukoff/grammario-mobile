import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookOpen } from "lucide-react-native";
import { useTheme } from "@/theme";
import { AdminNav } from "@/components/admin/AdminNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getAdminVocabulary } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import { ADMIN_LANGS, pickStr, num, formatDate } from "@/lib/admin-format";

const LIMIT = 30;

function extractRows(data: Record<string, unknown>): Record<string, unknown>[] {
  const r = data.vocabulary ?? data.items ?? data.rows ?? data.data;
  if (Array.isArray(r)) return r as Record<string, unknown>[];
  return [];
}

function masteryColor(pct: number, colors: { success: string; warning: string; destructive: string }) {
  if (pct >= 80) return colors.success;
  if (pct >= 40) return colors.warning;
  return colors.destructive;
}

export default function AdminVocabularyScreen() {
  const { colors } = useTheme();
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getAdminVocabulary({ page, limit: LIMIT });
      setRows(extractRows(data));
      setTotal(num(data.total));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load vocabulary");
    } finally {
      setLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={[]}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />
        }
      >
        <AdminNav current="vocabulary" />
        <Text
          style={{
            fontFamily: "InstrumentSerif-Italic",
            fontSize: 26,
            color: colors.foreground,
          }}
        >
          Vocabulary
        </Text>
        <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>
          {total.toLocaleString()} saved words across all users
        </Text>

        {error ? (
          <Text style={{ fontFamily: "PlusJakartaSans", color: colors.destructive }}>{error}</Text>
        ) : null}

        {rows.length === 0 && !loading ? (
          <Card>
            <View style={{ alignItems: "center", gap: 12, paddingVertical: 24 }}>
              <BookOpen size={40} color={colors.mutedForeground} />
              <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>
                No vocabulary saved yet
              </Text>
            </View>
          </Card>
        ) : null}

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Button
            title="Prev"
            variant="outline"
            disabled={page <= 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
          />
          <Text style={{ alignSelf: "center", fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>
            Page {page} of {totalPages}
          </Text>
          <Button
            title="Next"
            variant="outline"
            disabled={page >= totalPages}
            onPress={() => setPage((p) => p + 1)}
          />
        </View>

        {rows.map((row, i) => {
          const word = pickStr(row.word ?? row.surface);
          const lemma = pickStr(row.lemma);
          const translation = pickStr(row.translation);
          const lang = pickStr(row.language ?? row.lang);
          const pos = pickStr(row.pos ?? row.upos);
          const mastery = num(row.mastery ?? row.mastery_score ?? row.mastery_pct);
          const reviews = num(row.review_count ?? row.reviews);
          const nextReview = pickStr(row.next_review_at ?? row.next_review);
          const context = pickStr(row.context ?? row.example_context);
          const created = pickStr(row.created_at);
          const flag = ADMIN_LANGS.find((l) => l.code === lang)?.flag ?? "🌐";
          const barColor = masteryColor(mastery, colors);

          return (
            <Card key={pickStr(row.id) || String(i)}>
              <View style={{ gap: 8 }}>
                <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", fontSize: 17, color: colors.foreground }}>
                  {word}
                </Text>
                <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>
                  Lemma: {lemma || "—"}
                </Text>
                <Text style={{ fontFamily: "PlusJakartaSans", color: colors.foreground }}>
                  Translation: {translation || "—"}
                </Text>
                <Text style={{ fontFamily: "PlusJakartaSans" }}>
                  {flag} {lang.toUpperCase() || "—"}
                </Text>
                <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>
                  POS: {pos || "—"}
                </Text>
                <View style={{ gap: 4 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>
                      Mastery
                    </Text>
                    <Text style={{ fontFamily: "PlusJakartaSans-Medium", color: barColor }}>
                      {mastery}%
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
                        width: `${Math.min(100, mastery)}%`,
                        height: "100%",
                        backgroundColor: barColor,
                      }}
                    />
                  </View>
                </View>
                <Text style={{ fontFamily: "PlusJakartaSans", color: colors.foreground }}>
                  Reviews: {reviews}
                </Text>
                <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>
                  Next review: {nextReview ? formatDate(nextReview) : "—"}
                </Text>
                <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 13, color: colors.foreground }}>
                  Context: {context.length > 160 ? `${context.slice(0, 159)}…` : context || "—"}
                </Text>
                <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 12, color: colors.mutedForeground }}>
                  Created: {formatDate(created)}
                </Text>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
