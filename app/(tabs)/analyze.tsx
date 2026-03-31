import React, { useState, useCallback, useRef } from "react";
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
import { Volume2, History, ArrowRight } from "lucide-react-native";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTheme } from "@/theme";
import { useAuth } from "@/lib/auth-context";
import { useAppStore } from "@/store/useAppStore";
import { analyzeText, type AnalysisResponse } from "@/lib/api";
import {
  saveAnalysis,
  incrementTotalAnalyses,
  addXP,
  incrementDailyGoalProgress,
  checkRateLimit,
  XP_REWARDS,
} from "@/lib/db";
import { PillToggle } from "@/components/ui/PillToggle";
import { Button } from "@/components/ui/Button";
import { DependencyGraph } from "@/components/analysis/DependencyGraph";
import { MorphologyPanel } from "@/components/analysis/MorphologyPanel";
import { AnalysisSheet } from "@/components/analysis/AnalysisSheet";
import { HistorySheet } from "@/components/history/HistorySheet";
import { useToast } from "@/components/gamification/AchievementToast";
import { LANGUAGES } from "@/lib/utils";

const LANGUAGE_OPTIONS = LANGUAGES.map((l) => ({
  label: l.code.toUpperCase(),
  value: l.code,
}));

export default function AnalyzeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showXPToast, showLevelUpToast } = useToast();
  const setCurrentAnalysis = useAppStore((s) => s.setCurrentAnalysis);
  const addRecentAnalysis = useAppStore((s) => s.addRecentAnalysis);
  const defaultLanguage = useAppStore((s) => s.preferences.defaultLanguage);

  const [text, setText] = useState("");
  const [language, setLanguage] = useState(defaultLanguage);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const analysisSheetRef = useRef<BottomSheet>(null);

  const handleSpeak = () => {
    const speakText = analysis?.metadata.text || text;
    if (!speakText) return;
    Speech.speak(speakText, {
      language: language === "it" ? "it-IT" : language === "es" ? "es-ES" : language === "de" ? "de-DE" : language === "ru" ? "ru-RU" : "tr-TR",
    });
  };

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) return;
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to analyze sentences.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

      const result = await analyzeText(text.trim(), language);
      setAnalysis(result);
      setCurrentAnalysis(result);
      addRecentAnalysis(result);

      const savedId = await saveAnalysis(user.id, result);
      setAnalysisId(savedId);
      await incrementTotalAnalyses(user.id);
      const xpResult = await addXP(user.id, XP_REWARDS.ANALYSIS);
      showXPToast(XP_REWARDS.ANALYSIS);
      if (xpResult.leveledUp) {
        showLevelUpToast(xpResult.newLevel);
      }
      await incrementDailyGoalProgress(user.id);

      setTimeout(() => {
        analysisSheetRef.current?.snapToIndex(1);
      }, 300);
    } catch (error: any) {
      Alert.alert("Analysis Failed", error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [text, language, user, setCurrentAnalysis, addRecentAnalysis, showXPToast, showLevelUpToast]);

  const handleLoadAnalysis = (loaded: AnalysisResponse) => {
    setAnalysis(loaded);
    setCurrentAnalysis(loaded);
    setText(loaded.metadata.text);
    setLanguage(loaded.metadata.language);
    setSelectedTokenId(null);
    setHistoryVisible(false);
    setTimeout(() => {
      analysisSheetRef.current?.snapToIndex(1);
    }, 300);
  };

  const selectedToken = analysis?.nodes.find((n) => n.id === selectedTokenId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Input Section */}
        <View
          style={{
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            padding: 16,
            gap: 12,
          }}
        >
          <PillToggle
            options={LANGUAGE_OPTIONS}
            selected={language}
            onSelect={setLanguage}
          />

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
              onPress={handleSpeak}
              hitSlop={8}
              accessibilityLabel="Listen to pronunciation"
              accessibilityRole="button"
              style={{ padding: 8 }}
            >
              <Volume2 size={20} color={colors.mutedForeground} />
            </Pressable>
            <View
              style={{
                width: 1,
                height: 24,
                backgroundColor: colors.border,
                marginHorizontal: 4,
              }}
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

        {/* Graph + Morphology */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 200 }}
        >
          {analysis && (
            <>
              <DependencyGraph
                nodes={analysis.nodes}
                grammarErrors={analysis.grammar_errors}
                selectedTokenId={selectedTokenId}
                onSelectToken={setSelectedTokenId}
              />
              {selectedToken && (
                <MorphologyPanel
                  token={selectedToken}
                  language={analysis.metadata.language}
                />
              )}
            </>
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

        {/* Analysis Bottom Sheet */}
        {analysis && (
          <AnalysisSheet
            ref={analysisSheetRef}
            analysis={analysis}
            analysisId={analysisId}
          />
        )}

        {/* History Bottom Sheet */}
        <HistorySheet
          visible={historyVisible}
          onDismiss={() => setHistoryVisible(false)}
          onLoadAnalysis={handleLoadAnalysis}
        />
      </View>
    </SafeAreaView>
  );
}
