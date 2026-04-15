import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { History, ArrowRight, Clock, Search } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTheme } from "@/theme";
import { useAuth } from "@/lib/auth-context";
import { useAppStore } from "@/store/useAppStore";
import { analyzeText, ApiError, type AnalysisResponse } from "@/lib/api";
import {
  saveAnalysis,
  incrementTotalAnalyses,
  addXP,
  incrementDailyGoalProgress,
  checkRateLimit,
  XP_REWARDS,
  setDailyGoal,
  getAnalysisCountSinceStartOfLocalDay,
  syncAchievementsForUser,
  getSimilarAnalyses,
  type SimilarAnalysis,
} from "@/lib/db";
import { PillToggle } from "@/components/ui/PillToggle";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SentenceView } from "@/components/analysis/SentenceView";
import { AnalysisSheet } from "@/components/analysis/AnalysisSheet";
import { HistorySheet } from "@/components/history/HistorySheet";
import { useToast } from "@/components/gamification/AchievementToast";
import { LANGUAGES } from "@/lib/utils";
import { impact } from "@/lib/haptics";

const LANGUAGE_OPTIONS = LANGUAGES.map((l) => ({
  label: l.code.toUpperCase(),
  value: l.code,
}));

export default function AnalyzeScreen() {
  const { colors } = useTheme();
  const { user, profile, refreshProfile } = useAuth();
  const {
    showXPToast,
    showLevelUpToast,
    showDailyGoalCompleteToast,
    showAchievementToast,
  } = useToast();
  const setCurrentAnalysis = useAppStore((s) => s.setCurrentAnalysis);
  const addRecentAnalysis = useAppStore((s) => s.addRecentAnalysis);
  const preferences = useAppStore((s) => s.preferences);
  const defaultLanguage = preferences.defaultLanguage;
  const enableSounds = preferences.enableSounds;
  const showTranslations = preferences.showTranslations;

  const [text, setText] = useState("");
  const [language, setLanguage] = useState(defaultLanguage);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [similarAnalyses, setSimilarAnalyses] = useState<SimilarAnalysis[]>([]);

  const analysisSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (!user) return;
    setDailyGoal(user.id, preferences.dailyGoalTarget).catch(() => {});
  }, [user?.id, preferences.dailyGoalTarget, user]);

  useEffect(() => {
    if (profile?.is_pro) {
      setLanguage(defaultLanguage);
      return;
    }
    const learn = profile?.learn_language;
    if (learn) setLanguage(learn);
  }, [profile?.is_pro, profile?.learn_language, defaultLanguage]);

  const languageOptions = React.useMemo(() => {
    if (profile?.is_pro) return LANGUAGE_OPTIONS;
    const learn = profile?.learn_language;
    if (!learn) return LANGUAGE_OPTIONS;
    return LANGUAGE_OPTIONS.filter((o) => o.value === learn);
  }, [profile?.is_pro, profile?.learn_language]);

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) return;
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to analyze sentences.");
      return;
    }

    impact(enableSounds, Haptics.ImpactFeedbackStyle.Medium);
    Keyboard.dismiss();
    setLoading(true);
    setAnalysis(null);
    setSelectedTokenId(null);

    try {
      const { allowed, used, limit } = await checkRateLimit(user.id);
      if (!allowed) {
        Alert.alert(
          "Daily Limit Reached",
          `You've used ${used}/${limit} analyses today. Come back tomorrow!`
        );
        return;
      }

      const analysesTodayBefore =
        await getAnalysisCountSinceStartOfLocalDay(user.id);

      const result = await analyzeText(text.trim(), language);
      setAnalysis(result);
      setCurrentAnalysis(result);
      addRecentAnalysis(result);
      setSimilarAnalyses([]);

      const savedId = await saveAnalysis(user.id, result);
      setAnalysisId(savedId);

      if (result.embedding && result.embedding.length > 0) {
        getSimilarAnalyses(user.id, result.embedding, language, savedId)
          .then(setSimilarAnalyses)
          .catch(() => {});
      }
      await incrementTotalAnalyses(user.id);

      let xpGain = XP_REWARDS.ANALYSIS;
      if (analysesTodayBefore === 0) {
        xpGain += XP_REWARDS.FIRST_ANALYSIS_OF_DAY;
      }
      if ((profile?.streak ?? 0) >= 2) {
        xpGain += XP_REWARDS.STREAK_BONUS;
      }

      const xpResult = await addXP(user.id, xpGain);
      showXPToast(xpGain);
      if (xpResult.leveledUp) {
        showLevelUpToast(xpResult.newLevel);
      }

      const { reachedGoal } = await incrementDailyGoalProgress(user.id);
      if (reachedGoal) {
        const goalXp = await addXP(user.id, XP_REWARDS.COMPLETE_DAILY_GOAL);
        showDailyGoalCompleteToast();
        if (goalXp.leveledUp) {
          showLevelUpToast(goalXp.newLevel);
        }
      }

      const { newlyUnlocked, leveledUpTo } =
        await syncAchievementsForUser(user.id);
      for (const a of newlyUnlocked) {
        showAchievementToast(a.name);
      }
      if (newlyUnlocked.length > 0 && leveledUpTo) {
        showLevelUpToast(leveledUpTo);
      }

      await refreshProfile();

      setTimeout(() => {
        analysisSheetRef.current?.snapToIndex(1);
      }, 300);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        if (error.statusCode === 429) {
          Alert.alert("Daily limit", error.message);
          return;
        }
        if (error.statusCode === 403) {
          Alert.alert("Not allowed", error.message);
          return;
        }
      }
      Alert.alert(
        "Analysis Failed",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [
    text,
    language,
    user,
    profile?.streak,
    setCurrentAnalysis,
    addRecentAnalysis,
    showXPToast,
    showLevelUpToast,
    showDailyGoalCompleteToast,
    showAchievementToast,
    refreshProfile,
    enableSounds,
  ]);

  const handleLoadAnalysis = (loaded: AnalysisResponse) => {
    setAnalysis(loaded);
    setCurrentAnalysis(loaded);
    setText(loaded.metadata.text);
    setLanguage(loaded.metadata.language);
    setSelectedTokenId(null);
    setAnalysisId(null);
    setSimilarAnalyses([]);
    setHistoryVisible(false);
    setTimeout(() => {
      analysisSheetRef.current?.snapToIndex(1);
    }, 300);
  };

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

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 18,
            gap: 14,
          }}
        >
          {languageOptions.length <= 1 ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: "PlusJakartaSans",
                  fontSize: 13,
                  color: colors.mutedForeground,
                }}
              >
                Learning
              </Text>
              <View
                style={{
                  backgroundColor: colors.primary + "14",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: 13,
                    color: colors.primary,
                  }}
                >
                  {LANGUAGES.find((l) => l.code === language)?.name ?? language}
                </Text>
              </View>
            </View>
          ) : (
            <PillToggle
              options={languageOptions}
              selected={language}
              onSelect={setLanguage}
            />
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: colors.input,
              borderRadius: 16,
              backgroundColor: colors.background,
              paddingHorizontal: 16,
              minHeight: 52,
            }}
          >
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Enter a sentence to analyze..."
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="go"
              onSubmitEditing={handleAnalyze}
              multiline={false}
              style={{
                flex: 1,
                fontFamily: "PlusJakartaSans",
                fontSize: 16,
                color: colors.foreground,
                paddingVertical: 14,
              }}
              accessibilityLabel="Sentence input"
            />
            <Pressable
              onPress={() => setHistoryVisible(true)}
              hitSlop={12}
              accessibilityLabel="View analysis history"
              accessibilityRole="button"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: colors.surface2,
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 8,
              }}
            >
              <History size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Button
            title={loading ? "" : "Analyze"}
            onPress={handleAnalyze}
            disabled={loading || !text.trim()}
            variant="primary"
            icon={
              loading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primaryForeground}
                />
              ) : undefined
            }
            iconRight={
              !loading ? (
                <ArrowRight size={18} color={colors.primaryForeground} />
              ) : undefined
            }
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 200 }}
        >
          {analysis && (
            <SentenceView
              nodes={analysis.nodes}
              language={analysis.metadata.language}
              sentence={analysis.metadata.text}
              analysisId={analysisId}
              userId={user?.id ?? null}
              selectedTokenId={selectedTokenId}
              onSelectToken={setSelectedTokenId}
              sentenceTranslation={analysis.pedagogical_data?.translation}
              onSaved={refreshProfile}
            />
          )}

          {/* Semantic Memory strip */}
          {similarAnalyses.length > 0 && (
            <View
              style={{
                marginHorizontal: 20,
                marginTop: 4,
                gap: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Clock size={14} color={colors.mutedForeground} />
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: 11,
                    color: colors.mutedForeground,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  You've seen this before
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
              >
                {similarAnalyses.map((sim) => {
                  const pct = Math.round(sim.similarity * 100);
                  let diffBg = colors.surface2;
                  let diffFg = colors.mutedForeground;
                  if (sim.difficulty_level) {
                    if (sim.difficulty_level.startsWith("A")) {
                      diffBg = colors.successLight;
                      diffFg = colors.success;
                    } else if (sim.difficulty_level.startsWith("B")) {
                      diffBg = colors.warningLight;
                      diffFg = colors.warning;
                    } else {
                      diffBg = colors.errorLight;
                      diffFg = colors.error;
                    }
                  }
                  return (
                    <Pressable
                      key={sim.id}
                      onPress={() => {
                        const loaded: AnalysisResponse = {
                          metadata: {
                            text: sim.text,
                            language: sim.language,
                          },
                          nodes:
                            (sim.nodes as AnalysisResponse["nodes"]) ?? [],
                          pedagogical_data: sim.pedagogical_data as
                            | AnalysisResponse["pedagogical_data"]
                            | undefined,
                        };
                        handleLoadAnalysis(loaded);
                      }}
                      style={({ pressed }) => ({
                        width: 210,
                        padding: 14,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.card,
                        gap: 8,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans",
                          fontSize: 13,
                          color: colors.foreground,
                          fontStyle: "italic",
                          lineHeight: 18,
                        }}
                        numberOfLines={2}
                      >
                        {sim.text}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <View
                          style={{
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 4,
                            backgroundColor: colors.primary + "18",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "PlusJakartaSans-Medium",
                              fontSize: 10,
                              color: colors.primary,
                            }}
                          >
                            {pct}% similar
                          </Text>
                        </View>
                        {sim.difficulty_level && (
                          <Badge
                            label={sim.difficulty_level}
                            color={diffFg}
                            backgroundColor={diffBg}
                          />
                        )}
                        <Text
                          style={{
                            fontFamily: "PlusJakartaSans",
                            fontSize: 10,
                            color: colors.mutedForeground,
                          }}
                        >
                          {relativeDate(sim.created_at)}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {!analysis && !loading && (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 100,
                paddingHorizontal: 40,
                gap: 16,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  backgroundColor: colors.primary + "12",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Search size={28} color={colors.primary + "80"} />
              </View>
              <Text
                style={{
                  fontFamily: "InstrumentSerif-Italic",
                  fontSize: 22,
                  color: colors.mutedForeground,
                  textAlign: "center",
                  lineHeight: 30,
                }}
              >
                Type a sentence above to see its linguistic structure
              </Text>
            </View>
          )}
        </ScrollView>

        {analysis && (
          <AnalysisSheet
            ref={analysisSheetRef}
            analysis={analysis}
            analysisId={analysisId}
            showTranslations={showTranslations}
          />
        )}

        <HistorySheet
          visible={historyVisible}
          onDismiss={() => setHistoryVisible(false)}
          onLoadAnalysis={handleLoadAnalysis}
        />
      </View>
    </SafeAreaView>
  );
}
