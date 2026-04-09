import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  LayoutRectangle,
  ActivityIndicator,
  Alert,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { useTheme } from "@/theme";
import type { TokenNode } from "@/lib/api";
import {
  UPOS_LABELS,
  humanizeFeature,
  getFeatureInfo,
} from "@/lib/grammar-features";
import { saveVocabularyFromAnalyzer, addXP, XP_REWARDS } from "@/lib/db";
import { useToast } from "@/components/gamification/AchievementToast";
import { useAppStore } from "@/store/useAppStore";
import { impact } from "@/lib/haptics";

// Vertical padding above the word row to give arcs room to draw above words.
// Max arc height per spec is 90px; 100px gives a comfortable margin.
const ARC_TOP_PADDING = 100;

const WORD_FONT_SIZE = 32;

function isPunct(token: TokenNode): boolean {
  return token.upos === "PUNCT" || token.upos === "SYM";
}

/**
 * Splits a token's surface form into stem and suffix for display.
 * Prefers morpheme segments when available; falls back to lemma comparison.
 */
function getStemSuffix(token: TokenNode): { stem: string; suffix: string } {
  if (token.segments && token.segments.length > 0) {
    const morphSegs = token.segments.filter((s) => !s.includes("="));
    if (morphSegs.length >= 2) {
      return { stem: morphSegs[0], suffix: morphSegs.slice(1).join("") };
    }
  }

  const text = token.text;
  const textLower = text.toLowerCase();
  const lemmaLower = token.lemma.toLowerCase();

  let prefixLen = 0;
  while (
    prefixLen < lemmaLower.length &&
    prefixLen < textLower.length &&
    textLower[prefixLen] === lemmaLower[prefixLen]
  ) {
    prefixLen++;
  }

  if (prefixLen >= 2 && prefixLen < text.length) {
    return { stem: text.slice(0, prefixLen), suffix: text.slice(prefixLen) };
  }

  return { stem: text, suffix: "" };
}

interface SentenceViewProps {
  nodes: TokenNode[];
  language: string;
  sentence: string;
  analysisId: string | null;
  userId: string | null;
  selectedTokenId: number | null;
  onSelectToken: (id: number | null) => void;
  sentenceTranslation?: string | null;
  onSaved?: () => void;
}

export function SentenceView({
  nodes,
  language,
  sentence,
  analysisId,
  userId,
  selectedTokenId,
  onSelectToken,
  sentenceTranslation,
  onSaved,
}: SentenceViewProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { showXPToast, showLevelUpToast } = useToast();
  const soundsEnabled = useAppStore((s) => s.preferences.enableSounds);

  // Map of token id → measured layout (relative to the wordRow, which shares
  // its origin with the SVG overlay, so these are directly SVG coordinates).
  const [wordLayouts, setWordLayouts] = useState<
    Record<number, LayoutRectangle>
  >({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Save-for-review state (reset when the selected token changes)
  const [saveBusy, setSaveBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [duplicate, setDuplicate] = useState(false);

  // Clear word layouts whenever a new analysis arrives
  useEffect(() => {
    setWordLayouts({});
  }, [nodes]);

  // Reset save state when selection changes
  useEffect(() => {
    setSaved(false);
    setSaveBusy(false);
    setDuplicate(false);
  }, [selectedTokenId]);

  const selectedToken = useMemo(
    () => nodes.find((n) => n.id === selectedTokenId) ?? null,
    [nodes, selectedTokenId]
  );

  // Ids of words visually "affected" by the current selection (head + children)
  const affectedIds = useMemo(() => {
    if (!selectedToken) return new Set<number>();
    const ids = new Set<number>();
    if (selectedToken.head_id !== 0) ids.add(selectedToken.head_id);
    nodes.forEach((n) => {
      if (n.head_id === selectedToken.id) ids.add(n.id);
    });
    return ids;
  }, [selectedToken, nodes]);

  // Build SVG arc paths for arcs that involve the selected token
  const arcPaths = useMemo(() => {
    if (!selectedToken) return [];

    const paths: Array<{ path: string; key: string }> = [];

    const addArc = (fromId: number, toId: number) => {
      const fromLayout = wordLayouts[fromId];
      const toLayout = wordLayouts[toId];
      if (!fromLayout || !toLayout) return;

      // Arc endpoints: horizontal center, top edge of each word's View.
      // wordLayout.y already accounts for the ARC_TOP_PADDING via the
      // paddingTop on the wordRow.
      const fromX = fromLayout.x + fromLayout.width / 2;
      const fromY = fromLayout.y;
      const toX = toLayout.x + toLayout.width / 2;
      const toY = toLayout.y;

      // clamp(36, |fromX - toX| * 0.4, 90) per spec
      const distance = Math.abs(fromX - toX);
      const arcHeight = Math.min(Math.max(36, distance * 0.4), 90);

      // Both cubic bezier control points at the same Y (smooth arch upward)
      const controlY = Math.min(fromY, toY) - arcHeight;

      paths.push({
        path: `M ${fromX} ${fromY} C ${fromX} ${controlY} ${toX} ${controlY} ${toX} ${toY}`,
        key: `${fromId}-${toId}`,
      });
    };

    // Arc from selected word to its head
    if (selectedToken.head_id !== 0) {
      addArc(selectedToken.id, selectedToken.head_id);
    }

    // Arcs from selected word to its dependents
    nodes.forEach((n) => {
      if (n.head_id === selectedToken.id) {
        addArc(selectedToken.id, n.id);
      }
    });

    return paths;
  }, [selectedToken, nodes, wordLayouts]);

  const handleWordPress = useCallback(
    (id: number) => {
      onSelectToken(selectedTokenId === id ? null : id);
    },
    [selectedTokenId, onSelectToken]
  );

  const handleWordLayout = useCallback(
    (id: number, layout: LayoutRectangle) => {
      setWordLayouts((prev) => ({ ...prev, [id]: layout }));
    },
    []
  );

  const handlePosPress = useCallback(() => {
    if (!selectedToken) return;
    router.push({
      pathname: "/grammar-reference",
      params: { type: "upos", key: selectedToken.upos },
    });
  }, [router, selectedToken]);

  const handleFeaturePress = useCallback(
    (feat: string) => {
      router.push({
        pathname: "/grammar-reference",
        params: { type: "feature", key: feat, language },
      });
    },
    [router, language]
  );

  const handleSave = async () => {
    if (
      !userId ||
      !analysisId ||
      !selectedToken ||
      saveBusy ||
      saved ||
      duplicate
    )
      return;

    setSaveBusy(true);
    try {
      const result = await saveVocabularyFromAnalyzer(userId, {
        word: selectedToken.text,
        lemma: selectedToken.lemma,
        language,
        part_of_speech: selectedToken.upos,
        context: sentence,
        analysis_id: analysisId,
        translation: sentenceTranslation?.trim() || null,
      });

      if (result.status === "duplicate") {
        Alert.alert("Already saved", "This lemma is already in your vocabulary.");
        setDuplicate(true);
        return;
      }

      const xpResult = await addXP(userId, XP_REWARDS.SAVE_VOCABULARY);
      showXPToast(XP_REWARDS.SAVE_VOCABULARY);
      if (xpResult.leveledUp) showLevelUpToast(xpResult.newLevel);
      impact(soundsEnabled);
      setSaved(true);
      onSaved?.();
    } catch (e: unknown) {
      Alert.alert(
        "Could not save",
        e instanceof Error ? e.message : "Please try again."
      );
    } finally {
      setSaveBusy(false);
    }
  };

  const stemSuffix = selectedToken
    ? getStemSuffix(selectedToken)
    : { stem: "", suffix: "" };
  const features = selectedToken?.feats?.split("|").filter(Boolean) ?? [];
  const segmentChips =
    selectedToken?.segments?.filter((s) => s.includes("=")) ?? [];
  const posLabel = selectedToken
    ? (UPOS_LABELS[selectedToken.upos]?.label ?? selectedToken.upos)
    : "";
  const showSaveButton =
    !!userId &&
    !!analysisId &&
    !!selectedToken &&
    !isPunct(selectedToken);

  return (
    <View>
      {/* ── Sentence row + SVG arc overlay ─────────────────────────── */}
      <View
        onLayout={(e) => {
          setContainerWidth(e.nativeEvent.layout.width);
          setContainerHeight(e.nativeEvent.layout.height);
        }}
      >
        {/* Word row: flexWrap wraps long sentences naturally */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "center",
            // paddingTop reserves space above the first word row so arcs can
            // be drawn upward without being clipped.
            paddingTop: ARC_TOP_PADDING,
            paddingHorizontal: 16,
            paddingBottom: 8,
            rowGap: 8,
          }}
        >
          {nodes.map((token) => {
            const punct = isPunct(token);
            const isSelected = token.id === selectedTokenId;
            const isAffected = affectedIds.has(token.id);

            if (punct) {
              return (
                <View
                  key={token.id}
                  onLayout={(e) =>
                    handleWordLayout(token.id, e.nativeEvent.layout)
                  }
                  // Pull punct tightly against the preceding word
                  style={{ marginLeft: -2, marginRight: 4 }}
                >
                  <Text
                    style={{
                      fontFamily: "InstrumentSerif",
                      fontSize: WORD_FONT_SIZE,
                      color: colors.mutedForeground,
                    }}
                  >
                    {token.text}
                  </Text>
                </View>
              );
            }

            return (
              <View
                key={token.id}
                onLayout={(e) =>
                  handleWordLayout(token.id, e.nativeEvent.layout)
                }
                style={{ marginHorizontal: 4 }}
              >
                <Pressable
                  onPress={() => handleWordPress(token.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${token.text}, ${posLabel}`}
                  style={{
                    borderWidth: 2,
                    borderStyle: isAffected && !isSelected ? "dashed" : "solid",
                    borderColor: isSelected
                      ? colors.primary
                      : isAffected
                        ? colors.primary + "80"
                        : "transparent",
                    backgroundColor: isSelected
                      ? colors.primary + "0D"
                      : "transparent",
                    borderRadius: 4,
                    paddingTop: 2,
                    paddingBottom: 8,
                    paddingHorizontal: 2,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "InstrumentSerif",
                      fontSize: WORD_FONT_SIZE,
                      color: colors.foreground,
                    }}
                  >
                    {token.text}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* SVG arc layer — absolutely overlays the sentence container.
            The SVG and wordRow share the same origin (both start at
            top-left of this container), so wordLayout x/y values map
            directly to SVG coordinates. */}
        {selectedTokenId !== null &&
          arcPaths.length > 0 &&
          containerWidth > 0 && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: containerWidth,
                height: containerHeight,
              }}
            >
              <Svg width={containerWidth} height={containerHeight}>
                {arcPaths.map(({ path, key }) => (
                  <Path
                    key={key}
                    d={path}
                    stroke={colors.primary}
                    strokeWidth={1.5}
                    fill="none"
                    opacity={0.45}
                  />
                ))}
              </Svg>
            </View>
          )}
      </View>

      {/* ── Word detail panel ───────────────────────────────────────── */}
      {selectedToken && (
        <Animated.View
          key={selectedToken.id}
          entering={FadeInDown.duration(300)}
          style={{
            alignItems: "center",
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 24,
            gap: 6,
          }}
        >
          {/* Divider */}
          <View
            style={{
              width: 48,
              height: 1,
              backgroundColor: colors.border,
              marginBottom: 10,
            }}
          />

          {/* Stem – suffix split */}
          <Text
            style={{
              fontFamily: "InstrumentSerif",
              fontSize: 22,
              color: colors.foreground,
              textAlign: "center",
            }}
          >
            {stemSuffix.stem}
            {stemSuffix.suffix ? (
              <Text style={{ color: colors.primary }}>
                -{stemSuffix.suffix}
              </Text>
            ) : null}
          </Text>

          {/* Lemma */}
          <Text
            style={{
              fontFamily: "PlusJakartaSans",
              fontSize: 14,
              color: colors.mutedForeground,
              fontStyle: "italic",
            }}
          >
            &ldquo;{selectedToken.lemma}&rdquo;
          </Text>

          {/* Part of speech (tappable) */}
          <Pressable
            onPress={handlePosPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Part of speech: ${posLabel}`}
          >
            {({ pressed }) => (
              <Text
                style={{
                  fontFamily: "PlusJakartaSans",
                  fontSize: 14,
                  color: pressed ? colors.primary : colors.mutedForeground,
                }}
              >
                {posLabel}
              </Text>
            )}
          </Pressable>

          {/* Morphological features */}
          {features.map((feat) => {
            const info = getFeatureInfo(feat);
            const label = humanizeFeature(feat);
            return (
              <Pressable
                key={feat}
                onPress={() => handleFeaturePress(feat)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={label}
              >
                {({ pressed }) => (
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans",
                      fontSize: 14,
                      color: pressed
                        ? colors.primary
                        : info
                          ? colors.primary
                          : colors.mutedForeground,
                    }}
                  >
                    {label}
                  </Text>
                )}
              </Pressable>
            );
          })}

          {/* Segment feature chips (Key=Value segments displayed as pills) */}
          {segmentChips.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "center",
                marginTop: 4,
              }}
            >
              {segmentChips.map((seg, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleFeaturePress(seg)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 99,
                    backgroundColor: colors.primary + "14",
                  }}
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans-Medium",
                      fontSize: 12,
                      color: colors.primary,
                    }}
                  >
                    {humanizeFeature(seg)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Save for review */}
          {showSaveButton && (
            <Pressable
              onPress={handleSave}
              disabled={saveBusy || saved || duplicate}
              style={{
                marginTop: 12,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor:
                  saved || duplicate ? colors.surface2 : colors.primary,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                opacity: saveBusy ? 0.7 : 1,
              }}
              accessibilityRole="button"
              accessibilityLabel="Save word for vocabulary review"
            >
              {saveBusy ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primaryForeground}
                />
              ) : saved ? (
                <>
                  <Check size={14} color={colors.mutedForeground} />
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans-Medium",
                      fontSize: 13,
                      color: colors.mutedForeground,
                    }}
                  >
                    Saved
                  </Text>
                </>
              ) : (
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-Medium",
                    fontSize: 13,
                    color: duplicate
                      ? colors.mutedForeground
                      : colors.primaryForeground,
                  }}
                >
                  {duplicate ? "In deck" : "Save for review"}
                </Text>
              )}
            </Pressable>
          )}
        </Animated.View>
      )}
    </View>
  );
}
