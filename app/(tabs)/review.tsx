import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Eye,
  X,
  Check,
  CheckCheck,
  RotateCcw,
  ChevronDown,
  BookOpen,
  GraduationCap,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme";
import { useAuth } from "@/lib/auth-context";
import {
  getGrammarReviews,
  submitGrammarReviewRating,
  type GrammarConceptReview,
} from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { useAppStore } from "@/store/useAppStore";
import { impact } from "@/lib/haptics";

function getCefrColors(level: string | null | undefined, colors: ReturnType<typeof useTheme>["colors"]) {
  if (!level) return { bg: colors.surface2, fg: colors.mutedForeground };
  if (level.startsWith("A")) return { bg: colors.successLight, fg: colors.success };
  if (level.startsWith("B")) return { bg: colors.warningLight, fg: colors.warning };
  return { bg: colors.errorLight, fg: colors.error };
}

function renderMarkdown(text: string, colors: ReturnType<typeof useTheme>["colors"]) {
  const paragraphs = (text || "").split(/\n\n+/).filter(Boolean);
  return paragraphs.map((para, pi) => {
    const segments = para.split(/\*\*(.+?)\*\*/g);
    return (
      <Text
        key={pi}
        style={{
          fontFamily: "PlusJakartaSans",
          fontSize: 14,
          color: colors.foreground,
          lineHeight: 22,
          marginBottom: pi < paragraphs.length - 1 ? 10 : 0,
        }}
      >
        {segments.map((part, si) =>
          si % 2 === 1 ? (
            <Text key={si} style={{ fontFamily: "PlusJakartaSans-SemiBold" }}>
              {part}
            </Text>
          ) : (
            <Text key={si}>{part}</Text>
          )
        )}
      </Text>
    );
  });
}

export default function ReviewScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const soundsEnabled = useAppStore((s) => s.preferences.enableSounds);

  const [items, setItems] = useState<GrammarConceptReview[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [results, setResults] = useState({ correct: 0, total: 0 });
  const [stats, setStats] = useState({ total: 0, due: 0, mastered: 0 });
  const [showFineScale, setShowFineScale] = useState(false);

  const loadItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { items: due, stats: s } = await getGrammarReviews();
      setItems(due);
      setStats(s);
      setCurrentIndex(0);
      setRevealed(false);
      setSessionComplete(false);
      setResults({ correct: 0, total: 0 });
      setShowFineScale(false);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleReveal = () => {
    impact(soundsEnabled, Haptics.ImpactFeedbackStyle.Light);
    setRevealed(true);
  };

  const handleRate = async (quality: number) => {
    const item = items[currentIndex];
    if (!item) return;

    impact(soundsEnabled, Haptics.ImpactFeedbackStyle.Light);

    try {
      await submitGrammarReviewRating(item.id, quality);
    } catch {
      // silent
    }

    const isCorrect = quality >= 3;
    const newResults = {
      correct: results.correct + (isCorrect ? 1 : 0),
      total: results.total + 1,
    };
    setResults(newResults);

    if (currentIndex + 1 >= items.length) {
      setSessionComplete(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setRevealed(false);
      setShowFineScale(false);
    }
  };

  const currentItem = items[currentIndex];
  const progress = items.length > 0 ? ((currentIndex + 1) / items.length) * 100 : 0;
  const cefrColors = currentItem ? getCefrColors(currentItem.level, colors) : null;
  const conceptTitle = currentItem?.concept_name ?? "Grammar Concept";
  const conceptBody = currentItem?.body || currentItem?.concept_description || "";
  const examples = currentItem?.concept_examples || [];

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16, gap: 20 }}
      >
        {/* Header */}
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <BookOpen size={24} color={colors.primary} />
            <Text
              style={{
                fontFamily: "InstrumentSerif-Italic",
                fontSize: 28,
                color: colors.foreground,
              }}
            >
              Grammar Review
            </Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <Text
              style={{
                fontFamily: "PlusJakartaSans",
                fontSize: 13,
                color: colors.mutedForeground,
              }}
            >
              {stats.total} concepts
            </Text>
            <Text
              style={{
                fontFamily: "PlusJakartaSans-Medium",
                fontSize: 13,
                color: colors.warning,
              }}
            >
              {stats.due} due
            </Text>
            <Text
              style={{
                fontFamily: "PlusJakartaSans-Medium",
                fontSize: 13,
                color: colors.success,
              }}
            >
              {stats.mastered} mastered
            </Text>
          </View>
        </View>

        {/* Empty / No concepts queued */}
        {items.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              paddingTop: 60,
            }}
          >
            <CheckCheck size={48} color={colors.success} />
            <Text
              style={{
                fontFamily: "PlusJakartaSans-SemiBold",
                fontSize: 18,
                color: colors.foreground,
                textAlign: "center",
              }}
            >
              All caught up!
            </Text>
            <Text
              style={{
                fontFamily: "PlusJakartaSans",
                fontSize: 14,
                color: colors.mutedForeground,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              No grammar concepts due for review. Analyze sentences or browse
              Learn topics to queue new concepts.
            </Text>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <Button
                title="Analyze"
                onPress={() => router.push("/(tabs)/analyze")}
                variant="primary"
                icon={<BookOpen size={16} color={colors.primaryForeground} />}
              />
              <Button
                title="Learn"
                onPress={() => router.push("/(tabs)/learn")}
                variant="outline"
                icon={<GraduationCap size={16} color={colors.foreground} />}
              />
            </View>
          </View>
        ) : sessionComplete ? (
          /* Session complete */
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              paddingTop: 60,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.successLight,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check size={40} color={colors.success} />
            </View>
            <Text
              style={{
                fontFamily: "InstrumentSerif-Italic",
                fontSize: 24,
                color: colors.foreground,
              }}
            >
              Session complete
            </Text>
            <Text
              style={{
                fontFamily: "PlusJakartaSans",
                fontSize: 14,
                color: colors.mutedForeground,
                textAlign: "center",
              }}
            >
              {results.total} concepts reviewed ·{" "}
              {results.total > 0
                ? Math.round((results.correct / results.total) * 100)
                : 0}
              % accuracy
            </Text>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <Button
                title="Again"
                onPress={loadItems}
                variant="outline"
                icon={<RotateCcw size={16} color={colors.foreground} />}
              />
              <Button
                title="Go to Learn"
                onPress={() => router.push("/(tabs)/learn")}
                variant="primary"
                icon={<GraduationCap size={16} color={colors.primaryForeground} />}
              />
            </View>
          </View>
        ) : currentItem ? (
          <>
            {/* Progress */}
            <View style={{ gap: 4 }}>
              <ProgressBar progress={progress} />
              <Text
                style={{
                  fontFamily: "PlusJakartaSans",
                  fontSize: 11,
                  color: colors.mutedForeground,
                  textAlign: "right",
                }}
              >
                {currentIndex + 1}/{items.length}
              </Text>
            </View>

            {/* Card front */}
            <Card style={{ gap: 16 }}>
              {/* Meta row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {currentItem.level && cefrColors && (
                  <Badge
                    label={currentItem.level}
                    color={cefrColors.fg}
                    backgroundColor={cefrColors.bg}
                  />
                )}
                {currentItem.language && (
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      fontSize: 11,
                      color: colors.mutedForeground,
                      textTransform: "uppercase",
                    }}
                  >
                    {currentItem.language}
                  </Text>
                )}
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans",
                    fontSize: 11,
                    color: colors.mutedForeground,
                  }}
                >
                  {currentItem.mastery}% mastered
                </Text>
              </View>

              {/* Mastery progress */}
              <View style={{ gap: 4 }}>
                <ProgressBar
                  progress={currentItem.mastery}
                  fillColor={cefrColors?.fg ?? colors.primary}
                />
              </View>

              {/* Title */}
              <Text
                style={{
                  fontFamily: "InstrumentSerif-Italic",
                  fontSize: 28,
                  color: colors.foreground,
                  textAlign: "center",
                  paddingVertical: 8,
                }}
              >
                {conceptTitle}
              </Text>

              {/* Reveal / back side */}
              {!revealed ? (
                <Button
                  title="Show explanation"
                  onPress={handleReveal}
                  variant="primary"
                  icon={<Eye size={18} color={colors.primaryForeground} />}
                  style={{ marginTop: 8 }}
                />
              ) : (
                <View style={{ gap: 16 }}>
                  {/* Explanation body */}
                  {conceptBody ? (
                    <View
                      style={{
                        backgroundColor: colors.surface1,
                        borderRadius: 10,
                        padding: 14,
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
                          marginBottom: 6,
                        }}
                      >
                        Explanation
                      </Text>
                      {renderMarkdown(conceptBody, colors)}
                    </View>
                  ) : null}

                  {/* Examples */}
                  {examples.length > 0 && (
                    <View style={{ gap: 8 }}>
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans-SemiBold",
                          fontSize: 10,
                          color: colors.mutedForeground,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        Examples
                      </Text>
                      {examples.slice(0, 4).map((ex, i) => (
                        <View
                          key={i}
                          style={{
                            backgroundColor: colors.surface2,
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            borderLeftWidth: 2,
                            borderLeftColor: colors.primary + "60",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "PlusJakartaSans",
                              fontSize: 14,
                              color: colors.foreground,
                              fontStyle: "italic",
                            }}
                          >
                            {ex}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Rating prompt */}
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans",
                      fontSize: 13,
                      color: colors.mutedForeground,
                      textAlign: "center",
                    }}
                  >
                    How well did you know this?
                  </Text>

                  {/* Primary ratings */}
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <Pressable
                      onPress={() => handleRate(1)}
                      style={{
                        flex: 1,
                        alignItems: "center",
                        paddingVertical: 14,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: colors.error,
                        gap: 4,
                      }}
                      accessibilityLabel="Wrong"
                      accessibilityRole="button"
                    >
                      <X size={20} color={colors.error} />
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans-Medium",
                          fontSize: 12,
                          color: colors.error,
                        }}
                      >
                        Wrong (1)
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleRate(3)}
                      style={{
                        flex: 1,
                        alignItems: "center",
                        paddingVertical: 14,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: colors.warning,
                        gap: 4,
                      }}
                      accessibilityLabel="Hard"
                      accessibilityRole="button"
                    >
                      <Check size={20} color={colors.warning} />
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans-Medium",
                          fontSize: 12,
                          color: colors.warning,
                        }}
                      >
                        Hard (3)
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleRate(4)}
                      style={{
                        flex: 1,
                        alignItems: "center",
                        paddingVertical: 14,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: colors.success,
                        gap: 4,
                      }}
                      accessibilityLabel="Good"
                      accessibilityRole="button"
                    >
                      <Check size={20} color={colors.success} />
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans-Medium",
                          fontSize: 12,
                          color: colors.success,
                        }}
                      >
                        Good (4)
                      </Text>
                    </Pressable>
                  </View>

                  {/* Expandable fine-scale */}
                  <Pressable
                    onPress={() => setShowFineScale((v) => !v)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "PlusJakartaSans-Medium",
                        fontSize: 13,
                        color: colors.primary,
                      }}
                    >
                      More ratings (0–5)
                    </Text>
                    <ChevronDown
                      size={16}
                      color={colors.primary}
                      style={{
                        transform: [{ rotate: showFineScale ? "180deg" : "0deg" }],
                      }}
                    />
                  </Pressable>

                  {showFineScale && (
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 8,
                        justifyContent: "center",
                      }}
                    >
                      {[0, 2, 5].map((q) => (
                        <Pressable
                          key={q}
                          onPress={() => handleRate(q)}
                          style={{
                            paddingHorizontal: 18,
                            paddingVertical: 10,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: colors.border,
                            backgroundColor: colors.surface2,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "PlusJakartaSans-Medium",
                              fontSize: 14,
                              color: colors.foreground,
                            }}
                          >
                            {q}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </Card>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
