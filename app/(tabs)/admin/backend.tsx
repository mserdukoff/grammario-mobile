import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, ChevronUp, Check, X } from "lucide-react-native";
import { useTheme } from "@/theme";
import { AdminNav } from "@/components/admin/AdminNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getAdminHealth } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import { pickStr, num } from "@/lib/admin-format";
import { copyToClipboard } from "@/components/admin/copyText";

const MEM_CAP_MB = 6144;

function dig(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur === null || cur === undefined) return undefined;
    if (typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function statusTone(
  ok: boolean | undefined,
  colors: { success: string; destructive: string; mutedForeground: string }
) {
  if (ok === true) return colors.success;
  if (ok === false) return colors.destructive;
  return colors.mutedForeground;
}

export default function AdminBackendScreen() {
  const { colors } = useTheme();
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawOpen, setRawOpen] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getAdminHealth();
      setHealth(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load health");
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const overall =
    pickStr(dig(health, ["status"])) ||
    pickStr(dig(health, ["overall_status"])) ||
    (error ? "unreachable" : health ? "unknown" : "loading");
  const version =
    pickStr(dig(health, ["version"])) || pickStr(dig(health, ["app_version"]));

  const services = (dig(health, ["services"]) ?? dig(health, ["service_status"])) as
    | Record<string, unknown>
    | undefined;

  const cache = dig(health, ["cache"]) as Record<string, unknown> | undefined;
  const hits = num(cache?.hits);
  const misses = num(cache?.misses);
  const hitRate = num(cache?.hit_rate ?? cache?.hitRate);
  const hasCacheStats = hits > 0 || misses > 0 || hitRate > 0;

  const nlp = dig(health, ["nlp"]) as Record<string, unknown> | undefined;
  const engines = dig(health, ["engines"]) as Record<string, unknown> | undefined;
  const preferred =
    pickStr(nlp?.preferred_engine ?? nlp?.preferred ?? engines?.preferred);

  const spacy = (dig(health, ["spacy"]) ?? nlp?.spacy) as Record<string, unknown> | undefined;
  const stanza = (dig(health, ["stanza"]) ?? nlp?.stanza) as Record<string, unknown> | undefined;
  const stanzaMax = num(stanza?.max_loaded ?? stanza?.maxLoaded);

  const features = dig(health, ["features"]) as Record<string, unknown> | undefined;

  const memory = (dig(health, ["memory"]) ?? dig(health, ["process_memory"])) as
    | Record<string, unknown>
    | undefined;
  const rssMb = num(memory?.rss_mb ?? memory?.rssMb ?? memory?.rss);
  const vmsMb = num(memory?.vms_mb ?? memory?.vmsMb ?? memory?.vms);

  let memBarColor = colors.success;
  if (rssMb > 5000) memBarColor = colors.destructive;
  else if (rssMb > 3500) memBarColor = colors.warning;

  const bannerOk =
    /healthy|ok|up|running/i.test(overall) && !/unreachable|down|error/i.test(overall);

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
        <AdminNav current="backend" />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "InstrumentSerif-Italic",
              fontSize: 26,
              color: colors.foreground,
            }}
          >
            Backend
          </Text>
          <Button title="Refresh" onPress={load} variant="outline" />
        </View>

        {error ? (
          <Card>
            <Text style={{ fontFamily: "PlusJakartaSans", color: colors.destructive }}>{error}</Text>
            <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 12, color: colors.mutedForeground, marginTop: 6 }}>
              Status: unreachable
            </Text>
          </Card>
        ) : null}

        <Card
          style={{
            borderLeftWidth: 4,
            borderLeftColor: bannerOk ? colors.success : colors.warning,
          }}
        >
          <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", fontSize: 18, color: colors.foreground }}>
            {bannerOk ? "Healthy" : overall === "unknown" ? "Unknown" : overall || "Unknown"}
          </Text>
          {version ? (
            <Text style={{ fontFamily: "JetBrainsMono", fontSize: 12, color: colors.mutedForeground, marginTop: 4 }}>
              {version}
            </Text>
          ) : null}
        </Card>

        {services && typeof services === "object" ? (
          <Card>
            <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", marginBottom: 10, color: colors.foreground }}>
              Services
            </Text>
            {Object.entries(services).map(([key, val]) => {
              const v = val as Record<string, unknown>;
              const active =
                v?.status === "active" ||
                v?.ok === true ||
                v?.healthy === true ||
                pickStr(v?.state) === "active";
              const down =
                v?.status === "down" ||
                v?.ok === false ||
                v?.healthy === false;
              const ok = active ? true : down ? false : undefined;
              return (
                <View
                  key={key}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ fontFamily: "PlusJakartaSans", color: colors.foreground, textTransform: "capitalize" }}>
                    {key.replace(/_/g, " ")}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: statusTone(ok, colors),
                      }}
                    />
                    <Text style={{ fontFamily: "PlusJakartaSans-Medium", color: colors.foreground }}>
                      {ok === true ? "Active" : ok === false ? "Down" : "—"}
                    </Text>
                  </View>
                </View>
              );
            })}
            {hasCacheStats ? (
              <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", color: colors.foreground }}>Cache</Text>
                <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground, marginTop: 4 }}>
                  Hits: {hits.toLocaleString()} · Misses: {misses.toLocaleString()}
                  {hitRate > 0 ? ` · Hit rate ${hitRate.toFixed(1)}%` : ""}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        <Card>
          <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", marginBottom: 8, color: colors.foreground }}>
            NLP engines
          </Text>
          {preferred ? (
            <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground, marginBottom: 8 }}>
              Preferred: {preferred}
            </Text>
          ) : null}
          {spacy && typeof spacy === "object" ? (
            <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 13, color: colors.foreground, marginBottom: 6 }}>
              spaCy:{" "}
              {Object.entries(spacy)
                .filter(([k]) => k !== "preferred")
                .map(([lang, loaded]) => `${lang}:${loaded ? "✓" : "✗"}`)
                .join("  ") || "—"}
            </Text>
          ) : (
            <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground }}>spaCy: —</Text>
          )}
          {stanza && typeof stanza === "object" ? (
            <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 13, color: colors.foreground, marginTop: 6 }}>
              Stanza: max_loaded {stanzaMax || "—"} ·{" "}
              {Object.entries(stanza)
                .filter(([k]) => !["max_loaded", "maxLoaded"].includes(k))
                .map(([lang, loaded]) => `${lang}:${loaded ? "✓" : "✗"}`)
                .join("  ") || "—"}
            </Text>
          ) : (
            <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground, marginTop: 6 }}>
              Stanza: —
            </Text>
          )}
        </Card>

        {features && typeof features === "object" ? (
          <Card>
            <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", marginBottom: 10, color: colors.foreground }}>
              Features
            </Text>
            {Object.entries(features).map(([k, v]) => (
              <View
                key={k}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 4,
                  gap: 12,
                }}
              >
                <Text style={{ fontFamily: "PlusJakartaSans", color: colors.mutedForeground, flex: 1 }}>{k}</Text>
                <FeatureValue value={v} colors={colors} />
              </View>
            ))}
          </Card>
        ) : null}

        {(rssMb > 0 || vmsMb > 0) && (
          <Card>
            <Text style={{ fontFamily: "PlusJakartaSans-SemiBold", marginBottom: 8, color: colors.foreground }}>
              Memory
            </Text>
            <Text style={{ fontFamily: "PlusJakartaSans", color: colors.foreground }}>
              RSS: {rssMb.toFixed(0)} MB · VMS: {vmsMb.toFixed(0)} MB
            </Text>
            {rssMb > 0 ? (
              <View style={{ marginTop: 10 }}>
                <View
                  style={{
                    height: 10,
                    backgroundColor: colors.muted,
                    borderRadius: 5,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${Math.min(100, (rssMb / MEM_CAP_MB) * 100)}%`,
                      height: "100%",
                      backgroundColor: memBarColor,
                    }}
                  />
                </View>
                <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 11, color: colors.mutedForeground, marginTop: 4 }}>
                  vs {MEM_CAP_MB} MB cap (&gt;3500 warning, &gt;5000 error)
                </Text>
              </View>
            ) : null}
          </Card>
        )}

        <Card>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Pressable
              onPress={() => setRawOpen(!rawOpen)}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-SemiBold",
                  color: colors.foreground,
                  flex: 1,
                }}
              >
                Raw health response
              </Text>
              {rawOpen ? (
                <ChevronUp color={colors.mutedForeground} />
              ) : (
                <ChevronDown color={colors.mutedForeground} />
              )}
            </Pressable>
            <Pressable
              onPress={() => health && copyToClipboard(JSON.stringify(health, null, 2), true)}
              hitSlop={8}
            >
              <Text style={{ color: colors.primary, fontFamily: "PlusJakartaSans-Medium" }}>Copy</Text>
            </Pressable>
          </View>
          {rawOpen && health ? (
            <Text
              selectable
              style={{
                fontFamily: "JetBrainsMono",
                fontSize: 10,
                color: colors.foreground,
                marginTop: 12,
              }}
            >
              {JSON.stringify(health, null, 2)}
            </Text>
          ) : null}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureValue({
  value,
  colors,
}: {
  value: unknown;
  colors: { foreground: string; success: string; destructive: string };
}) {
  if (typeof value === "boolean") {
    return value ? (
      <Check size={18} color={colors.success} />
    ) : (
      <X size={18} color={colors.destructive} />
    );
  }
  if (Array.isArray(value)) {
    return (
      <Text style={{ fontFamily: "PlusJakartaSans", fontSize: 12, color: colors.foreground, flexShrink: 1, textAlign: "right" }}>
        {value.map(String).join(", ")}
      </Text>
    );
  }
  return (
    <Text style={{ fontFamily: "JetBrainsMono", fontSize: 11, color: colors.foreground, flexShrink: 1, textAlign: "right" }}>
      {value === null || value === undefined ? "—" : String(value)}
    </Text>
  );
}
