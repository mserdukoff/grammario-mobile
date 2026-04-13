import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  Map,
  List,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  BookOpen,
  X,
  BarChart2,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme";
import { useAuth } from "@/lib/auth-context";
import { getAllItalianAnalyses } from "@/lib/db";
import {
  IT_GRAMMAR_TAXONOMY,
  CEFR_ORDER,
  getTaxonomyByLevel,
  matchConceptToTaxonomy,
  getMasteryStatus,
  getMasteryColors,
  getMasteryLabel,
  type ItGrammarConcept,
} from "@/lib/it-grammar-taxonomy";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { CefrLevel } from "@/lib/learn-curriculum";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ConceptStats {
  conceptId: string;
  count: number;
  status: MasteryStatus;
  matchingAnalyses: Array<{
    id: string;
    text: string;
    created_at: string;
    difficulty_level?: string | null;
  }>;
}

function getCefrBadgeColors(
  level: CefrLevel,
  colors: ReturnType<typeof useTheme>["colors"]
) {
  if (level.startsWith("A"))
    return { bg: colors.successLight, fg: colors.success };
  if (level.startsWith("B"))
    return { bg: colors.warningLight, fg: colors.warning };
  return { bg: colors.errorLight, fg: colors.error };
}

function relativeDate(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1d ago";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

// ── Concept chip (list view) ──────────────────────────────────────────────────

function ConceptChip({
  concept,
  stats,
  onPress,
  colors,
}: {
  concept: ItGrammarConcept;
  stats: ConceptStats | undefined;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const status = stats?.status ?? "not_seen";
  const mc = getMasteryColors(status, colors);

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: mc.border,
        backgroundColor: mc.bg,
        flex: 1,
        minWidth: (SCREEN_WIDTH - 48) / 2 - 6,
        maxWidth: (SCREEN_WIDTH - 48) / 2 - 6,
      }}
      accessibilityRole="button"
      accessibilityLabel={`${concept.title}: ${getMasteryLabel(status)}`}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            fontFamily: "PlusJakartaSans-SemiBold",
            fontSize: 13,
            color: mc.fg,
            lineHeight: 17,
          }}
          numberOfLines={2}
        >
          {concept.title}
        </Text>
        <Text
          style={{
            fontFamily: "PlusJakartaSans",
            fontSize: 10,
            color: mc.fg + "AA",
          }}
        >
          {getMasteryLabel(status)}
          {stats && stats.count > 0 ? ` · ${stats.count}×` : ""}
        </Text>
      </View>
    </Pressable>
  );
}

// ── Map node (map view) ───────────────────────────────────────────────────────

function MapNode({
  concept,
  stats,
  onPress,
  colors,
}: {
  concept: ItGrammarConcept;
  stats: ConceptStats | undefined;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const status = stats?.status ?? "not_seen";
  const mc = getMasteryColors(status, colors);

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 110,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: mc.border,
        backgroundColor: mc.bg,
        alignItems: "center",
        gap: 4,
        margin: 4,
      }}
      accessibilityRole="button"
    >
      <Text
        style={{
          fontFamily: "PlusJakartaSans-SemiBold",
          fontSize: 11,
          color: mc.fg,
          textAlign: "center",
          lineHeight: 15,
        }}
        numberOfLines={3}
      >
        {concept.title}
      </Text>
      {stats && stats.count > 0 && (
        <View
          style={{
            backgroundColor: mc.fg + "25",
            borderRadius: 4,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}
        >
          <Text
            style={{
              fontFamily: "JetBrainsMono",
              fontSize: 9,
              color: mc.fg,
            }}
          >
            {stats.count}×
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// ── Detail bottom sheet content ───────────────────────────────────────────────

function DetailContent({
  concept,
  stats,
  onClose,
  onNavigate,
  colors,
}: {
  concept: ItGrammarConcept;
  stats: ConceptStats | undefined;
  onClose: () => void;
  onNavigate: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const status = stats?.status ?? "not_seen";
  const mc = getMasteryColors(status, colors);
  const cefrColors = getCefrBadgeColors(concept.level, colors);

  return (
    <View style={{ gap: 16 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <View style={{ flex: 1, gap: 6 }}>
          <Text
            style={{
              fontFamily: "InstrumentSerif-Italic",
              fontSize: 22,
              color: colors.foreground,
            }}
          >
            {concept.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Badge
              label={concept.level}
              color={cefrColors.fg}
              backgroundColor={cefrColors.bg}
            />
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                backgroundColor: mc.bg,
                borderWidth: 1,
                borderColor: mc.border,
              }}
            >
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-Medium",
                  fontSize: 11,
                  color: mc.fg,
                }}
              >
                {getMasteryLabel(status)}
              </Text>
            </View>
          </View>
        </View>
        <Pressable
          onPress={onClose}
          style={{ padding: 4 }}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={20} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {/* Analyses count */}
      {stats && stats.count > 0 ? (
        <View
          style={{
            backgroundColor: colors.surface1,
            borderRadius: 10,
            padding: 12,
            gap: 4,
          }}
        >
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 10,
              color: colors.mutedForeground,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            Encountered in {stats.count} analysis{stats.count !== 1 ? "es" : ""}
          </Text>
          {stats.matchingAnalyses.slice(0, 4).map((a) => {
            const dc = a.difficulty_level
              ? getCefrBadgeColors(
                  a.difficulty_level as CefrLevel,
                  colors
                )
              : null;
            return (
              <View
                key={a.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 6,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans",
                    fontSize: 13,
                    color: colors.foreground,
                    flex: 1,
                    fontStyle: "italic",
                  }}
                  numberOfLines={1}
                >
                  {a.text}
                </Text>
                {dc && a.difficulty_level && (
                  <Badge
                    label={a.difficulty_level}
                    color={dc.fg}
                    backgroundColor={dc.bg}
                  />
                )}
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans",
                    fontSize: 11,
                    color: colors.mutedForeground,
                  }}
                >
                  {relativeDate(a.created_at)}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View
          style={{
            backgroundColor: colors.surface1,
            borderRadius: 10,
            padding: 14,
          }}
        >
          <Text
            style={{
              fontFamily: "PlusJakartaSans",
              fontSize: 13,
              color: colors.mutedForeground,
              lineHeight: 19,
            }}
          >
            You haven't analyzed any Italian sentences that mention this concept
            yet. Try analyzing sentences to build your mastery!
          </Text>
        </View>
      )}

      {/* Navigate to Learn topic */}
      <Pressable
        onPress={onNavigate}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.primary + "40",
          backgroundColor: colors.primary + "0E",
        }}
        accessibilityRole="button"
        accessibilityLabel={`Open ${concept.title} in Learn`}
      >
        <BookOpen size={18} color={colors.primary} />
        <Text
          style={{
            fontFamily: "PlusJakartaSans-SemiBold",
            fontSize: 14,
            color: colors.primary,
            flex: 1,
          }}
        >
          Open in Learn
        </Text>
        <ExternalLink size={16} color={colors.primary} />
      </Pressable>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function MasteryMapScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [conceptStats, setConceptStats] = useState<
    Record<string, ConceptStats>
  >({});
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [expandedLevels, setExpandedLevels] = useState<Set<CefrLevel>>(
    new Set(["A1", "A2"])
  );
  const [selectedConcept, setSelectedConcept] =
    useState<ItGrammarConcept | null>(null);

  const detailSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%", "85%"], []);

  const byLevel = getTaxonomyByLevel();

  // ── Load analyses and compute mastery ───────────────────────────────
  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const analyses = await getAllItalianAnalyses(user.id);
      setTotalAnalyses(analyses.length);

      const counts: Record<
        string,
        {
          count: number;
          analyses: Array<{
            id: string;
            text: string;
            created_at: string;
            difficulty_level?: string | null;
          }>;
        }
      > = {};

      for (const a of analyses) {
        const pd = a.pedagogical_data as {
          concepts?: Array<{ name: string }>;
        } | null;
        if (!pd?.concepts) continue;

        for (const c of pd.concepts) {
          const matched = matchConceptToTaxonomy(c.name, IT_GRAMMAR_TAXONOMY);
          if (!matched) continue;
          if (!counts[matched.id]) {
            counts[matched.id] = { count: 0, analyses: [] };
          }
          counts[matched.id].count += 1;
          if (counts[matched.id].analyses.length < 4) {
            counts[matched.id].analyses.push({
              id: a.id,
              text: a.text,
              created_at: a.created_at,
              difficulty_level: a.difficulty_level,
            });
          }
        }
      }

      const stats: Record<string, ConceptStats> = {};
      for (const concept of IT_GRAMMAR_TAXONOMY) {
        const c = counts[concept.id];
        stats[concept.id] = {
          conceptId: concept.id,
          count: c?.count ?? 0,
          status: getMasteryStatus(c?.count ?? 0),
          matchingAnalyses: c?.analyses ?? [],
        };
      }
      setConceptStats(stats);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Derived stats ────────────────────────────────────────────────────
  const encountered = Object.values(conceptStats).filter(
    (s) => s.count > 0
  ).length;
  const total = IT_GRAMMAR_TAXONOMY.length;
  const coverage =
    total > 0 ? Math.round((encountered / total) * 100) : 0;

  // ── Handlers ─────────────────────────────────────────────────────────
  const openDetail = (concept: ItGrammarConcept) => {
    setSelectedConcept(concept);
    detailSheetRef.current?.snapToIndex(0);
  };

  const closeDetail = () => {
    detailSheetRef.current?.close();
    setSelectedConcept(null);
  };

  const navigateToLearnTopic = (concept: ItGrammarConcept) => {
    closeDetail();
    router.push(`/learn/it/${concept.level}/${concept.slug}` as any);
  };

  const toggleLevel = (level: CefrLevel) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
      {/* Stats bar */}
      <View
        style={{
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <BarChart2 size={18} color={colors.primary} />
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 14,
              color: colors.foreground,
              flex: 1,
            }}
          >
            Italian mastery — {encountered}/{total} concepts · {totalAnalyses}{" "}
            analyses
          </Text>
          <Text
            style={{
              fontFamily: "PlusJakartaSans-Medium",
              fontSize: 13,
              color: colors.primary,
            }}
          >
            {coverage}%
          </Text>
        </View>
        <ProgressBar progress={coverage} fillColor={colors.primary} />

        {/* View mode toggle */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginTop: 2,
          }}
        >
          <Pressable
            onPress={() => setViewMode("list")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 8,
              backgroundColor:
                viewMode === "list" ? colors.primary : colors.surface2,
              borderWidth: 1,
              borderColor:
                viewMode === "list" ? colors.primary : colors.border,
            }}
          >
            <List
              size={14}
              color={viewMode === "list" ? colors.primaryForeground : colors.foreground}
            />
            <Text
              style={{
                fontFamily: "PlusJakartaSans-Medium",
                fontSize: 13,
                color:
                  viewMode === "list"
                    ? colors.primaryForeground
                    : colors.foreground,
              }}
            >
              List
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode("map")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 8,
              backgroundColor:
                viewMode === "map" ? colors.primary : colors.surface2,
              borderWidth: 1,
              borderColor: viewMode === "map" ? colors.primary : colors.border,
            }}
          >
            <Map
              size={14}
              color={viewMode === "map" ? colors.primaryForeground : colors.foreground}
            />
            <Text
              style={{
                fontFamily: "PlusJakartaSans-Medium",
                fontSize: 13,
                color:
                  viewMode === "map"
                    ? colors.primaryForeground
                    : colors.foreground,
              }}
            >
              Map
            </Text>
          </Pressable>

          {/* Legend */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 8,
            }}
          >
            {(
              ["not_seen", "spotted", "familiar", "practiced"] as const
            ).map((status) => {
              const mc = getMasteryColors(status, colors);
              return (
                <View
                  key={status}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    backgroundColor: mc.bg,
                    borderWidth: 1,
                    borderColor: mc.border,
                  }}
                />
              );
            })}
          </View>
        </View>
      </View>

      {/* Empty state */}
      {totalAnalyses === 0 && (
        <View
          style={{
            margin: 16,
            padding: 16,
            backgroundColor: colors.surface1,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 8,
          }}
        >
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 14,
              color: colors.foreground,
            }}
          >
            No Italian analyses yet
          </Text>
          <Text
            style={{
              fontFamily: "PlusJakartaSans",
              fontSize: 13,
              color: colors.mutedForeground,
              lineHeight: 19,
            }}
          >
            Analyze Italian sentences to see which grammar concepts you've
            encountered and track your mastery over time.
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/analyze")}
            style={{
              marginTop: 4,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 8,
              backgroundColor: colors.primary,
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                fontFamily: "PlusJakartaSans-SemiBold",
                fontSize: 13,
                color: colors.primaryForeground,
              }}
            >
              Start analyzing
            </Text>
          </Pressable>
        </View>
      )}

      {/* ── List View ── */}
      {viewMode === "list" && (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
        >
          {CEFR_ORDER.map((level) => {
            const concepts = byLevel[level];
            const seenInLevel = concepts.filter(
              (c) => (conceptStats[c.id]?.count ?? 0) > 0
            ).length;
            const levelProgress =
              concepts.length > 0
                ? (seenInLevel / concepts.length) * 100
                : 0;
            const isExpanded = expandedLevels.has(level);
            const cefrColors = getCefrBadgeColors(level, colors);

            return (
              <View key={level}>
                {/* Level header */}
                <Pressable
                  onPress={() => toggleLevel(level)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 2,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${level} — ${seenInLevel}/${concepts.length}`}
                >
                  <Badge
                    label={level}
                    color={cefrColors.fg}
                    backgroundColor={cefrColors.bg}
                  />
                  <View style={{ flex: 1, gap: 4 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans-Medium",
                          fontSize: 13,
                          color: colors.mutedForeground,
                        }}
                      >
                        {seenInLevel}/{concepts.length} seen
                      </Text>
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans-Medium",
                          fontSize: 12,
                          color: cefrColors.fg,
                        }}
                      >
                        {Math.round(levelProgress)}%
                      </Text>
                    </View>
                    <ProgressBar
                      progress={levelProgress}
                      fillColor={cefrColors.fg}
                    />
                  </View>
                  {isExpanded ? (
                    <ChevronDown size={18} color={colors.mutedForeground} />
                  ) : (
                    <ChevronRight size={18} color={colors.mutedForeground} />
                  )}
                </Pressable>

                {/* Concept grid */}
                {isExpanded && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                      paddingBottom: 8,
                    }}
                  >
                    {concepts.map((concept) => (
                      <ConceptChip
                        key={concept.id}
                        concept={concept}
                        stats={conceptStats[concept.id]}
                        onPress={() => openDetail(concept)}
                        colors={colors}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* ── Map View ── */}
      {viewMode === "map" && (
        <ScrollView
          horizontal
          contentContainerStyle={{ padding: 16, gap: 0 }}
          showsHorizontalScrollIndicator={false}
        >
          <ScrollView
            contentContainerStyle={{ gap: 0 }}
            showsVerticalScrollIndicator={false}
          >
            {CEFR_ORDER.map((level) => {
              const concepts = byLevel[level];
              const cefrColors = getCefrBadgeColors(level, colors);

              return (
                <View
                  key={level}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 0,
                    marginBottom: 8,
                  }}
                >
                  {/* Level label */}
                  <View
                    style={{
                      width: 36,
                      alignItems: "center",
                      paddingTop: 8,
                    }}
                  >
                    <View
                      style={{
                        paddingHorizontal: 6,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: cefrColors.bg,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans-SemiBold",
                          fontSize: 10,
                          color: cefrColors.fg,
                        }}
                      >
                        {level}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 1,
                        flex: 1,
                        backgroundColor: cefrColors.fg + "30",
                        marginTop: 4,
                        minHeight: 16,
                      }}
                    />
                  </View>

                  {/* Concept nodes */}
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      maxWidth: concepts.length * 120,
                    }}
                  >
                    {concepts.map((concept) => (
                      <MapNode
                        key={concept.id}
                        concept={concept}
                        stats={conceptStats[concept.id]}
                        onPress={() => openDetail(concept)}
                        colors={colors}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </ScrollView>
      )}

      {/* ── Detail Bottom Sheet ── */}
      <BottomSheet
        ref={detailSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={() => setSelectedConcept(null)}
        backgroundStyle={{
          backgroundColor: colors.card,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        handleIndicatorStyle={{
          backgroundColor: colors.surface3,
          width: 36,
          height: 4,
        }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {selectedConcept && (
            <DetailContent
              concept={selectedConcept}
              stats={conceptStats[selectedConcept.id]}
              onClose={closeDetail}
              onNavigate={() => navigateToLearnTopic(selectedConcept)}
              colors={colors}
            />
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}
