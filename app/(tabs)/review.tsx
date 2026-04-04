import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, X, Check, CheckCheck, RotateCcw, ChevronDown } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme";
import { useAuth } from "@/lib/auth-context";
import {
  getVocabularyDueForReview,
  updateVocabularyReview,
  getVocabularyReviewStats,
} from "@/lib/db";
import type { Vocabulary } from "@/lib/database.types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getLanguageName } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { impact } from "@/lib/haptics";
import { Badge } from "@/components/ui/Badge";

export default function ReviewScreen() {
  const { colors } = useTheme();
  const { user, profile } = useAuth();
  const router = useRouter();
  const soundsEnabled = useAppStore((s) => s.preferences.enableSounds);

  const [words, setWords] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [results, setResults] = useState({ correct: 0, total: 0 });
  const [stats, setStats] = useState({
    total: 0,
    due: 0,
    mastered: 0,
  });
  const [showFineScale, setShowFineScale] = useState(false);

  const langScope =
    profile && !profile.is_pro && profile.learn_language
      ? profile.learn_language
      : null;

  const loadWords = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [due, s] = await Promise.all([
        getVocabularyDueForReview(user.id, langScope ?? undefined),
        getVocabularyReviewStats(user.id, langScope),
      ]);
      setWords(due.slice(0, 20));
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
  }, [user, langScope]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const handleReveal = () => {
    impact(soundsEnabled, Haptics.ImpactFeedbackStyle.Light);
    setRevealed(true);
  };

  const handleRate = async (quality: number) => {
    const word = words[currentIndex];
    if (!word) return;

    impact(soundsEnabled, Haptics.ImpactFeedbackStyle.Light);

    try {
      await updateVocabularyReview(word.id, quality);
    } catch {
      // silent
    }

    const isCorrect = quality >= 3;
    const newResults = {
      correct: results.correct + (isCorrect ? 1 : 0),
      total: results.total + 1,
    };
    setResults(newResults);

    if (currentIndex + 1 >= words.length) {
      setSessionComplete(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setRevealed(false);
      setShowFineScale(false);
    }
  };

  const currentWord = words[currentIndex];
  const progress =
    words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

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
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          gap: 20,
        }}
      >
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontFamily: "InstrumentSerif-Italic",
              fontSize: 28,
              color: colors.foreground,
            }}
          >
            Vocabulary Review
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <Text
              style={{
                fontFamily: "PlusJakartaSans",
                fontSize: 13,
                color: colors.mutedForeground,
              }}
            >
              {stats.total} words
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
              {stats.mastered} mastered (80%+)
            </Text>
          </View>
        </View>

        {profile && !profile.is_pro && !profile.learn_language ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              paddingTop: 80,
            }}
          >
            <Text
              style={{
                fontFamily: "PlusJakartaSans",
                fontSize: 15,
                color: colors.mutedForeground,
                textAlign: "center",
              }}
            >
              Choose a learning language to load vocabulary scoped to your free
              plan.
            </Text>
            <Button
              title="Open Settings"
              onPress={() => router.push("/(tabs)/settings")}
              variant="outline"
            />
          </View>
        ) : words.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              paddingTop: 80,
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
              }}
            >
              No words due for review. Analyze more sentences to build your
              vocabulary.
            </Text>
            <Button
              title="Analyze sentences"
              onPress={() => router.push("/(tabs)/analyze")}
              variant="primary"
              style={{ marginTop: 8 }}
            />
          </View>
        ) : sessionComplete ? (
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
              {results.total} words reviewed, {results.correct} correct,{" "}
              {results.total > 0
                ? Math.round((results.correct / results.total) * 100)
                : 0}
              %
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginTop: 8,
              }}
            >
              <Button
                title="Again"
                onPress={loadWords}
                variant="outline"
                icon={<RotateCcw size={16} color={colors.foreground} />}
              />
              <Button
                title="Analyze more"
                onPress={() => router.push("/(tabs)/analyze")}
                variant="primary"
              />
            </View>
          </View>
        ) : currentWord ? (
          <>
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
                {currentIndex + 1}/{words.length}
              </Text>
            </View>

            <Card
              style={{
                alignItems: "center",
                paddingVertical: 40,
                paddingHorizontal: 24,
                gap: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "JetBrainsMono",
                    fontSize: 11,
                    color: colors.mutedForeground,
                    textTransform: "uppercase",
                  }}
                >
                  {getLanguageName(currentWord.language)}
                </Text>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans",
                    fontSize: 11,
                    color: colors.mutedForeground,
                  }}
                >
                  · {currentWord.mastery}% mastered
                </Text>
                {currentWord.part_of_speech && (
                  <Badge label={currentWord.part_of_speech} mono />
                )}
              </View>

              <Text
                style={{
                  fontFamily: "InstrumentSerif-Italic",
                  fontSize: 32,
                  color: colors.foreground,
                  textAlign: "center",
                }}
              >
                {currentWord.word}
              </Text>

              <Text
                style={{
                  fontFamily: "PlusJakartaSans",
                  fontSize: 14,
                  color: colors.mutedForeground,
                  fontStyle: "italic",
                }}
              >
                {currentWord.lemma}
              </Text>

              {currentWord.context && (
                <View
                  style={{
                    backgroundColor: colors.surface2,
                    borderRadius: 8,
                    padding: 12,
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans-SemiBold",
                      fontSize: 10,
                      color: colors.mutedForeground,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    Context
                  </Text>
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans",
                      fontSize: 13,
                      color: colors.foreground,
                      fontStyle: "italic",
                    }}
                  >
                    &ldquo;{currentWord.context}&rdquo;
                  </Text>
                </View>
              )}

              {!revealed ? (
                <Button
                  title="Show answer"
                  onPress={handleReveal}
                  variant="primary"
                  icon={<Eye size={18} color={colors.primaryForeground} />}
                  style={{ width: "100%", marginTop: 8 }}
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    gap: 16,
                    marginTop: 8,
                    alignItems: "center",
                  }}
                >
                  {currentWord.translation && (
                    <Text
                      style={{
                        fontFamily: "PlusJakartaSans-Medium",
                        fontSize: 20,
                        color: colors.primary,
                        textAlign: "center",
                      }}
                    >
                      {currentWord.translation}
                    </Text>
                  )}

                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans",
                      fontSize: 13,
                      color: colors.mutedForeground,
                    }}
                  >
                    How well did you know this? (SM-2 quality)
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      width: "100%",
                    }}
                  >
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

                  <Pressable
                    onPress={() => setShowFineScale((v) => !v)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
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
                            paddingHorizontal: 14,
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
                              fontSize: 13,
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
