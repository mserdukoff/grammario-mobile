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
import { History, ArrowRight } from "lucide-react-native";
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
} from "@/lib/db";
import { PillToggle } from "@/components/ui/PillToggle";
import { Button } from "@/components/ui/Button";
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

      const savedId = await saveAnalysis(user.id, result);
      setAnalysisId(savedId);
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
    setHistoryVisible(false);
    setTimeout(() => {
      analysisSheetRef.current?.snapToIndex(1);
    }, 300);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            padding: 16,
            gap: 12,
          }}
        >
          {languageOptions.length <= 1 ? (
            <View style={{ gap: 4 }}>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-Medium",
                  fontSize: 12,
                  color: colors.mutedForeground,
                }}
              >
                Learning language (free tier)
              </Text>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-SemiBold",
                  fontSize: 15,
                  color: colors.foreground,
                }}
              >
                {LANGUAGES.find((l) => l.code === language)?.name ?? language}
              </Text>
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
              borderWidth: 1,
              borderColor: colors.input,
              borderRadius: 10,
              backgroundColor: colors.background,
              paddingHorizontal: 12,
            }}
          >
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Enter a sentence to analyze..."
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="go"
              onSubmitEditing={handleAnalyze}
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
              hitSlop={8}
              accessibilityLabel="View analysis history"
              accessibilityRole="button"
              style={{ padding: 8 }}
            >
              <History size={20} color={colors.mutedForeground} />
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

          {!analysis && !loading && (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 120,
                paddingHorizontal: 32,
              }}
            >
              <Text
                style={{
                  fontFamily: "InstrumentSerif-Italic",
                  fontSize: 22,
                  color: colors.mutedForeground,
                  textAlign: "center",
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
