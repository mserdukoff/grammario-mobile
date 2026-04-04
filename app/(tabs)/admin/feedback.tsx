import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TextInput,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react-native";
import { useTheme } from "@/theme";
import { AdminNav } from "@/components/admin/AdminNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getAdminFeedback, patchAdminFeedback, type AdminFeedbackItem } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import { ADMIN_LANGS, formatDateTime, pickStr, num } from "@/lib/admin-format";

const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "accuracy", label: "Accuracy" },
  { value: "translation", label: "Translation" },
  { value: "grammar_tips", label: "Grammar Tips" },
  { value: "difficulty", label: "Difficulty" },
  { value: "other", label: "Other" },
] as const;

const RESOLVED_FILTERS = [
  { value: "", label: "All" },
  { value: "false", label: "Unresolved" },
  { value: "true", label: "Resolved" },
] as const;

function categoryLabel(code: string): string {
  const c = CATEGORIES.find((x) => x.value === code);
  return c?.label ?? code;
}

export default function AdminFeedbackScreen() {
  const { colors } = useTheme();
  const [category, setCategory] = useState("");
  const [resolved, setResolved] = useState("");
  const [data, setData] = useState<{
    summary?: { total?: number; unresolved?: number; unresolved_count?: number; avg_rating?: number };
    feedback?: AdminFeedbackItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await getAdminFeedback({
        category: category || undefined,
        resolved: resolved || undefined,
      });
      setData(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, [category, resolved]);

  React.useEffect(() => {
    load();
  }, [load]);

  const items = data?.feedback ?? [];
  const summary = data?.summary;
  const totalFb = num(summary?.total);
  const unresolved = num(summary?.unresolved ?? summary?.unresolved_count);
  const avgRating = num(summary?.avg_rating);

  const toggleResolved = async (id: string, next: boolean) => {
    try {
      await patchAdminFeedback({ id, is_resolved: next });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Update failed");
    }
  };

  const saveNotes = async (id: string) => {
    try {
      await patchAdminFeedback({
        id,
        admin_notes: noteDrafts[id] ?? "",
      });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Save failed");
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "PlusJakartaSans" as const,
    color: colors.foreground,
    backgroundColor: colors.background,
    minHeight: 80,
    textAlignVertical: "top" as const,
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />
        }
      >
        <AdminNav current="feedback" />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "InstrumentSerif-Italic",
              fontSize: 26,
              color: colors.foreground,
              flex: 1,
            }}
          >
            Sentence feedback
          </Text>
          <Button title="Refresh" onPress={load} variant="outline" />
        </View>

        {error ? (
          <Text style={{ fontFamily: "PlusJakartaSans", color: colors.destructive }}>{error}</Text>
        ) : null}

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <Card style={{ flex: 1, minWidth: "30%" }}>
            <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 12, color: colors.mutedForeground }}>
              Total
            </Text>
            <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", fontSize: 22, color: colors.foreground }}>
              {totalFb}
            </Text>
          </Card>
          <Card style={{ flex: 1, minWidth: "30%" }}>
            <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 12, color: colors.mutedForeground }}>
              Unresolved
            </Text>
            <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", fontSize: 22, color: colors.foreground }}>
              {unresolved}
            </Text>
          </Card>
          <Card style={{ flex: 1, minWidth: "30%" }}>
            <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 12, color: colors.mutedForeground }}>
              Avg rating
            </Text>
            <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", fontSize: 22, color: colors.foreground }}>
              {avgRating.toFixed(1)} /5
            </Text>
          </Card>
        </View>

        <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>
          {items.length} result{items.length === 1 ? "" : "s"}
        </Text>

        <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", color: colors.foreground }}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.value || "all"}
              onPress={() => setCategory(c.value)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: category === c.value ? colors.primary : colors.muted,
              }}
            >
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-Medium",
                  fontSize: 12,
                  color: category === c.value ? colors.primaryForeground : colors.foreground,
                }}
              >
                {c.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", color: colors.foreground }}>Resolved</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {RESOLVED_FILTERS.map((c) => (
            <Pressable
              key={c.value || "all-res"}
              onPress={() => setResolved(c.value)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: resolved === c.value ? colors.primary : colors.muted,
              }}
            >
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-Medium",
                  fontSize: 12,
                  color: resolved === c.value ? colors.primaryForeground : colors.foreground,
                }}
              >
                {c.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {items.map((row, idx) => {
          const id = pickStr(row.id);
          const open = expanded === id;
          const rating = num(row.rating);
          const cat = pickStr(row.category);
          const lang = pickStr(row.language);
          const flag = ADMIN_LANGS.find((l) => l.code === lang)?.flag ?? "🌐";
          const sentence = pickStr(row.sentence ?? row.text);
          const userLabel = pickStr(row.user_email ?? row.user_id).slice(0, 48);
          const isRes = Boolean(row.is_resolved ?? row.resolved);
          const created = pickStr(row.created_at);

          return (
            <Card key={id || String(idx)}>
              <Pressable
                onPress={() => setExpanded(open ? null : id)}
                style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}
              >
                <Pressable
                  onPress={() => toggleResolved(id, !isRes)}
                  hitSlop={8}
                  style={{ marginTop: 2 }}
                >
                  {isRes ? (
                    <CheckCircle2 size={22} color={colors.success} />
                  ) : (
                    <Circle size={22} color={colors.mutedForeground} />
                  )}
                </Pressable>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    <Text style={{ fontFamily: "PlusJakartaSans-Medium", color: colors.warning }}>
                      {"★".repeat(Math.min(5, Math.max(0, Math.round(rating))))}
                      {"☆".repeat(Math.max(0, 5 - Math.round(rating)))}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        backgroundColor: colors.muted,
                      }}
                    >
                      <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 11 }}>
                        {categoryLabel(cat)}
                      </Text>
                    </View>
                    <Text>{flag}</Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans",
                      color: colors.foreground,
                      marginTop: 6,
                    }}
                    numberOfLines={open ? undefined : 2}
                  >
                    &ldquo;{sentence}&rdquo;
                  </Text>
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans",
                      fontSize: 12,
                      color: colors.mutedForeground,
                      marginTop: 4,
                    }}
                  >
                    {userLabel} · {formatDateTime(created)}
                  </Text>
                </View>
                {open ? (
                  <ChevronUp color={colors.mutedForeground} />
                ) : (
                  <ChevronDown color={colors.mutedForeground} />
                )}
              </Pressable>

              {open ? (
                <View style={{ marginTop: 14, gap: 10, paddingLeft: 32 }}>
                  <Text style={{ fontFamily: "PlusJakartaSans", color: colors.foreground }}>{sentence}</Text>
                  {pickStr(row.user_comment) ? (
                    <Text style={{ fontFamily: "PlusJakartaSans-Italic", color: colors.mutedForeground }}>
                      Comment: {pickStr(row.user_comment)}
                    </Text>
                  ) : null}
                  <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 12, color: colors.mutedForeground }}>
                    {pickStr(row.user_email)} · {formatDateTime(created)}
                  </Text>
                  <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", color: colors.foreground }}>
                    Admin notes
                  </Text>
                  <TextInput
                    multiline
                    placeholder="Notes visible to admins…"
                    placeholderTextColor={colors.mutedForeground}
                    value={
                      noteDrafts[id] !== undefined
                        ? noteDrafts[id]
                        : pickStr(row.admin_notes)
                    }
                    onChangeText={(t) => setNoteDrafts((d) => ({ ...d, [id]: t }))}
                    style={inputStyle}
                  />
                  <Button title="Save notes" onPress={() => saveNotes(id)} />
                </View>
              ) : null}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
