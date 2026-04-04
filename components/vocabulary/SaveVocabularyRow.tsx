import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { BookmarkPlus } from "lucide-react-native";
import { useTheme } from "@/theme";
import { saveVocabularyFromAnalyzer, addXP, XP_REWARDS } from "@/lib/db";
import type { TokenNode } from "@/lib/api";
import { useToast } from "@/components/gamification/AchievementToast";
import { useAppStore } from "@/store/useAppStore";
import { impact } from "@/lib/haptics";

interface SaveVocabularyRowProps {
  userId: string;
  analysisId: string | null;
  token: TokenNode;
  sentence: string;
  language: string;
  sentenceTranslation?: string | null;
  onSaved?: () => void;
}

export function SaveVocabularyRow({
  userId,
  analysisId,
  token,
  sentence,
  language,
  sentenceTranslation,
  onSaved,
}: SaveVocabularyRowProps) {
  const { colors } = useTheme();
  const { showXPToast, showLevelUpToast } = useToast();
  const soundsEnabled = useAppStore((s) => s.preferences.enableSounds);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [duplicate, setDuplicate] = useState(false);

  if (token.upos === "PUNCT" || !analysisId) return null;

  const handleSave = async () => {
    if (busy || saved || duplicate) return;
    setBusy(true);
    try {
      const result = await saveVocabularyFromAnalyzer(userId, {
        word: token.text,
        lemma: token.lemma,
        language,
        part_of_speech: token.upos,
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
      if (xpResult.leveledUp) {
        showLevelUpToast(xpResult.newLevel);
      }
      impact(soundsEnabled);
      setSaved(true);
      onSaved?.();
    } catch (e: unknown) {
      Alert.alert(
        "Could not save",
        e instanceof Error ? e.message : "Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <BookmarkPlus size={22} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "PlusJakartaSans-SemiBold",
            fontSize: 14,
            color: colors.foreground,
          }}
        >
          Save &ldquo;{token.text}&rdquo; for review
        </Text>
        <Text
          style={{
            fontFamily: "PlusJakartaSans",
            fontSize: 12,
            color: colors.mutedForeground,
            marginTop: 2,
          }}
        >
          Lemma: {token.lemma} · Adds to spaced repetition deck
        </Text>
      </View>
      <Pressable
        onPress={handleSave}
        disabled={busy || saved || duplicate}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 8,
          backgroundColor:
            saved || duplicate ? colors.surface2 : colors.primary,
        }}
        accessibilityRole="button"
        accessibilityLabel="Save word for vocabulary review"
      >
        {busy ? (
          <ActivityIndicator size="small" color={colors.primaryForeground} />
        ) : (
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 13,
              color:
                saved || duplicate
                  ? colors.mutedForeground
                  : colors.primaryForeground,
            }}
          >
            {saved ? "Saved" : duplicate ? "In deck" : "Save"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
