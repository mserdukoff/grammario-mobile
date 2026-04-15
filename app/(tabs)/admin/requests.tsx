import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Trash2,
} from "lucide-react-native";
import { useTheme } from "@/theme";
import { AdminNav } from "@/components/admin/AdminNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getAdminAnalyses, deleteAdminAnalysis } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import { ADMIN_LANGS, formatDateTime, pickStr, num } from "@/lib/admin-format";
import { copyToClipboard } from "@/components/admin/copyText";

const LANG_CODES = ["it", "es", "de", "ru", "tr"] as const;

function extractAnalysesList(data: Record<string, unknown>): Record<string, unknown>[] {
  const a = data.analyses ?? data.items ?? data.data;
  if (Array.isArray(a)) return a as Record<string, unknown>[];
  return [];
}

function extractTotal(data: Record<string, unknown>): number {
  return num(data.total ?? data.count);
}

function rowText(row: Record<string, unknown>): string {
  const meta = row.metadata as Record<string, unknown> | undefined;
  return pickStr(row.text ?? row.sentence ?? meta?.text);
}

function rowTranslation(row: Record<string, unknown>): string {
  const ped = row.pedagogical_data as Record<string, unknown> | undefined;
  return pickStr(ped?.translation ?? row.translation);
}

export default function AdminRequestsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id: detailId } = useLocalSearchParams<{ id?: string }>();

  const [language, setLanguage] = useState<string>("");
  const [page, setPage] = useState(1);
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandId, setExpandId] = useState<string | null>(null);
  const [expandMode, setExpandMode] = useState<"nodes" | "ped" | "raw" | null>(null);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rawOpen, setRawOpen] = useState(true);
  const [nodesOpen, setNodesOpen] = useState(true);
  const [pedOpen, setPedOpen] = useState(true);

  const LIMIT = 20;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const loadList = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getAdminAnalyses({
        page,
        limit: LIMIT,
        ...(language ? { language } : {}),
      });
      setList(extractAnalysesList(data));
      setTotal(extractTotal(data));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load analyses");
    } finally {
      setLoading(false);
    }
  }, [page, language]);

  const loadDetail = useCallback(async () => {
    if (!detailId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    setError(null);
    try {
      const data = await getAdminAnalyses({ id: detailId });
      const one =
        (data.analysis as Record<string, unknown>) ||
        (data.data as Record<string, unknown>) ||
        (typeof data.id === "string" ? data : null);
      setDetail(one && typeof one === "object" ? one : data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load analysis");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, [detailId]);

  React.useEffect(() => {
    if (!detailId) {
      loadList();
    }
  }, [detailId, loadList]);

  React.useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const setLangFilter = (lang: string) => {
    setLanguage(lang);
    setPage(1);
  };

  const toggleExpand = (rowId: string, mode: "nodes" | "ped" | "raw") => {
    if (expandId === rowId && expandMode === mode) {
      setExpandId(null);
      setExpandMode(null);
    } else {
      setExpandId(rowId);
      setExpandMode(mode);
    }
  };

  const copyRowJson = (row: Record<string, unknown>) => {
    copyToClipboard(JSON.stringify(row, null, 2));
  };

  const confirmDelete = (analysisId: string) => {
    Alert.alert("Delete analysis", "Remove this analysis permanently?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAdminAnalysis(analysisId);
            if (detailId === analysisId) {
              router.replace("/(tabs)/admin/requests");
            } else {
              await loadList();
            }
          } catch (e) {
            Alert.alert(
              "Delete failed",
              e instanceof ApiError ? e.message : "Unknown error"
            );
          }
        },
      },
    ]);
  };

  const expandedPayload = (row: Record<string, unknown>, mode: "nodes" | "ped" | "raw") => {
    if (mode === "nodes") return row.nodes ?? row.parse_tree;
    if (mode === "ped") return row.pedagogical_data ?? row.pedagogicalData;
    return row;
  };

  const backFromDetail = () => {
    router.replace("/(tabs)/admin/requests");
  };

  if (detailId) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={[]}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={detailLoading}
              onRefresh={loadDetail}
              tintColor={colors.primary}
            />
          }
        >
          <AdminNav current="requests" />
          <Button title="← Back to list" variant="ghost" onPress={backFromDetail} />

          {error ? (
            <Text style={{ color: colors.destructive, fontFamily: "PlusJakartaSans" }}>
              {error}
            </Text>
          ) : null}

          {detailLoading && !detail ? (
            <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>
              Loading…
            </Text>
          ) : null}

          {detail ? (
            <>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-SemiBold",
                  fontSize: 18,
                  color: colors.foreground,
                }}
              >
                {rowText(detail)}
              </Text>
              <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>
                {pickStr(detail.language)} · {formatDateTime(pickStr(detail.created_at))}
              </Text>
              <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 13, color: colors.mutedForeground }}>
                Owner:{" "}
                {pickStr(detail.owner_email) ||
                  pickStr(detail.user_email) ||
                  pickStr(detail.user_id).slice(0, 8) + "…"}
              </Text>
              {rowTranslation(detail) ? (
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-Italic",
                    color: colors.foreground,
                    marginTop: 4,
                  }}
                >
                  {rowTranslation(detail)}
                </Text>
              ) : null}

              <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                <Button
                  title="Delete"
                  variant="destructive"
                  onPress={() => confirmDelete(pickStr(detail.id))}
                />
              </View>

              <CollapsibleJson
                title="Full raw record"
                data={detail}
                open={rawOpen}
                onToggle={() => setRawOpen(!rawOpen)}
                colors={colors}
              />
              <CollapsibleJson
                title="Nodes (parse tree)"
                data={detail.nodes}
                open={nodesOpen}
                onToggle={() => setNodesOpen(!nodesOpen)}
                colors={colors}
              />
              <CollapsibleJson
                title="Pedagogical data (LLM response)"
                data={detail.pedagogical_data}
                open={pedOpen}
                onToggle={() => setPedOpen(!pedOpen)}
                colors={colors}
              />
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={[]}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadList} tintColor={colors.primary} />
        }
      >
        <AdminNav current="requests" />
        <Text
          style={{
            fontFamily: "InstrumentSerif-Italic",
            fontSize: 26,
            color: colors.foreground,
          }}
        >
          Requests & data
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Pressable
            onPress={() => setLangFilter("")}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: !language ? colors.primary : colors.muted,
            }}
          >
            <Text
              style={{
                fontFamily: "PlusJakartaSans-Medium",
                color: !language ? colors.primaryForeground : colors.foreground,
              }}
            >
              All
            </Text>
          </Pressable>
          {LANG_CODES.map((code) => {
            const meta = ADMIN_LANGS.find((l) => l.code === code);
            const active = language === code;
            return (
              <Pressable
                key={code}
                onPress={() => setLangFilter(code)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: active ? colors.primary : colors.muted,
                }}
              >
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-Medium",
                    color: active ? colors.primaryForeground : colors.foreground,
                  }}
                >
                  {meta?.flag} {code.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {error ? (
          <Text style={{ color: colors.destructive, fontFamily: "PlusJakartaSans" }}>{error}</Text>
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

        {list.map((row, idx) => {
          const rid = pickStr(row.id) || String(idx);
          const lang = pickStr(row.language);
          const flag = ADMIN_LANGS.find((l) => l.code === lang)?.flag ?? "🌐";
          const owner =
            pickStr(row.owner_name) ||
            pickStr(row.owner_email) ||
            pickStr(row.user_email) ||
            `${pickStr(row.user_id).slice(0, 8)}…`;

          return (
            <Card key={rid}>
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                  <Text style={{ fontSize: 18 }}>{flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", color: colors.foreground }}>
                      {rowText(row)}
                    </Text>
                    <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 12, color: colors.mutedForeground }}>
                      {owner} · {formatDateTime(pickStr(row.created_at))}
                    </Text>
                    {rowTranslation(row) ? (
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans-Italic",
                          fontSize: 12,
                          color: colors.mutedForeground,
                          marginTop: 4,
                        }}
                      >
                        {rowTranslation(row)}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/admin/requests",
                        params: { id: rid },
                      })
                    }
                    style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                  >
                    <ExternalLink size={16} color={colors.primary} />
                    <Text style={{ fontFamily: "PlusJakartaSans-Medium", color: colors.primary }}>
                      Detail
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => toggleExpand(rid, "nodes")}
                    style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.muted, borderRadius: 8 }}
                  >
                    <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 12 }}>nodes</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => toggleExpand(rid, "ped")}
                    style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.muted, borderRadius: 8 }}
                  >
                    <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 12 }}>ped</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => toggleExpand(rid, "raw")}
                    style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.muted, borderRadius: 8 }}
                  >
                    <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 12 }}>raw</Text>
                  </Pressable>
                  <Pressable onPress={() => copyRowJson(row)} style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
                    <Copy size={16} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontFamily: "PlusJakartaSans" }}>copy</Text>
                  </Pressable>
                  <Pressable onPress={() => confirmDelete(rid)}>
                    <Trash2 size={18} color={colors.destructive} />
                  </Pressable>
                </View>

                {expandId === rid && expandMode ? (
                  <View style={{ marginTop: 8 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", color: colors.foreground }}>
                        {expandMode === "nodes"
                          ? "Nodes"
                          : expandMode === "ped"
                            ? "Pedagogical"
                            : "Raw row"}
                      </Text>
                      <Pressable
                        onPress={() =>
                          copyToClipboard(
                            JSON.stringify(expandedPayload(row, expandMode), null, 2)
                          )
                        }
                      >
                        <Text style={{ color: colors.primary, fontFamily: "PlusJakartaSans-Medium" }}>
                          Copy JSON
                        </Text>
                      </Pressable>
                    </View>
                    <Text
                      selectable
                      style={{
                        fontFamily: "JetBrainsMono",
                        fontSize: 10,
                        color: colors.foreground,
                      }}
                    >
                      {JSON.stringify(expandedPayload(row, expandMode), null, 2)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function CollapsibleJson({
  title,
  data,
  open,
  onToggle,
  colors,
}: {
  title: string;
  data: unknown;
  open: boolean;
  onToggle: () => void;
  colors: {
    foreground: string;
    primary: string;
    mutedForeground: string;
  };
}) {
  const json = JSON.stringify(data ?? null, null, 2);
  return (
    <Card>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Pressable onPress={onToggle} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              color: colors.foreground,
              flex: 1,
            }}
          >
            {title}
          </Text>
          {open ? (
            <ChevronUp color={colors.mutedForeground} />
          ) : (
            <ChevronDown color={colors.mutedForeground} />
          )}
        </Pressable>
        <Pressable onPress={() => copyToClipboard(json)} hitSlop={8}>
          <Text style={{ color: colors.primary, fontFamily: "PlusJakartaSans-Medium" }}>Copy</Text>
        </Pressable>
      </View>
      {open ? (
        <Text
          selectable
          style={{
            fontFamily: "JetBrainsMono",
            fontSize: 11,
            color: colors.foreground,
            marginTop: 12,
          }}
        >
          {json}
        </Text>
      ) : null}
    </Card>
  );
}
