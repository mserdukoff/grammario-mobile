import React, { useLayoutEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { BookOpen, Check } from "lucide-react-native";
import { useTheme } from "@/theme";
import { useAuth } from "@/lib/auth-context";
import { LANGUAGES, type LanguageCode } from "@/lib/utils";
import {
  CEFR_LEVELS,
  type CefrLevel,
  getTopicsForLevel,
} from "@/lib/learn-curriculum";
import { queueGrammarConcept } from "@/lib/api";

function BoldParagraph({ text }: { text: string }) {
  const { colors } = useTheme();
  const segments = text.split(/\*\*(.+?)\*\*/g);
  return (
    <Text
      style={{
        fontFamily: "PlusJakartaSans",
        fontSize: 15,
        color: colors.foreground,
        lineHeight: 24,
      }}
    >
      {segments.map((part, i) =>
        i % 2 === 1 ? (
          <Text
            key={i}
            style={{ fontFamily: "PlusJakartaSans-SemiBold", fontWeight: "600" }}
          >
            {part}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
}

export default function LearnTopicDetailScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { lang, level, slug } = useLocalSearchParams<{
    lang: string;
    level: string;
    slug: string;
  }>();
  const navigation = useNavigation();
  const router = useRouter();

  const [queueState, setQueueState] = useState<
    "idle" | "loading" | "queued" | "error"
  >("idle");

  const code = lang as LanguageCode;
  const lev = level as CefrLevel;
  const validLang = LANGUAGES.some((l) => l.code === code);
  const validLevel = CEFR_LEVELS.includes(lev);

  const topic = useMemo(() => {
    if (!validLang || !validLevel || !slug) return null;
    return getTopicsForLevel(code, lev).find((t) => t.slug === slug) ?? null;
  }, [code, lev, slug, validLang, validLevel]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: topic?.title ?? "Topic",
    });
  }, [navigation, topic?.title]);

  const topicId = `${code}-${lev.toLowerCase()}-${slug}`;

  const handleAddToReview = useCallback(async () => {
    if (!user || !topic) return;
    if (queueState === "queued" || queueState === "loading") return;

    setQueueState("loading");
    try {
      await queueGrammarConcept({
        topic_id: topicId,
        concept_name: topic.title,
        concept_description: topic.summary,
        language: code,
        level: lev,
      });
      setQueueState("queued");
    } catch {
      setQueueState("error");
      setTimeout(() => setQueueState("idle"), 2000);
    }
  }, [user, topic, queueState, topicId, code, lev]);

  if (!topic) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Text
          style={{
            fontFamily: "PlusJakartaSans",
            padding: 16,
            color: colors.mutedForeground,
          }}
        >
          Topic not found.
        </Text>
      </SafeAreaView>
    );
  }

  const paragraphs = topic.body.split(/\n\n+/).filter(Boolean);
  const isQueued = queueState === "queued";
  const isLoading = queueState === "loading";
  const isError = queueState === "error";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontFamily: "InstrumentSerif-Italic",
              fontSize: 26,
              color: colors.foreground,
            }}
          >
            {topic.title}
          </Text>
          <Text
            style={{
              fontFamily: "PlusJakartaSans",
              fontSize: 14,
              color: colors.mutedForeground,
              lineHeight: 20,
            }}
          >
            {topic.summary}
          </Text>

          {/* Add to Review button */}
          {user && (
            <Pressable
              onPress={isQueued ? () => router.push("/(tabs)/review") : handleAddToReview}
              disabled={isLoading}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: isQueued
                  ? colors.success
                  : isError
                  ? colors.error
                  : colors.primary,
                backgroundColor: isQueued
                  ? colors.successLight
                  : isError
                  ? colors.errorLight
                  : colors.primary + "12",
                marginTop: 4,
              }}
              accessibilityRole="button"
              accessibilityLabel={
                isQueued ? "Already added — go to Review" : "Add to Review"
              }
            >
              {isLoading ? (
                <ActivityIndicator size={16} color={colors.primary} />
              ) : isQueued ? (
                <Check size={16} color={colors.success} />
              ) : (
                <BookOpen size={16} color={isError ? colors.error : colors.primary} />
              )}
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-SemiBold",
                  fontSize: 14,
                  color: isQueued
                    ? colors.success
                    : isError
                    ? colors.error
                    : colors.primary,
                }}
              >
                {isQueued
                  ? "Already added · Open Review"
                  : isError
                  ? "Error — try again"
                  : "Add to Review"}
              </Text>
            </Pressable>
          )}
        </View>

        <View style={{ gap: 16 }}>
          {paragraphs.map((p, i) => (
            <BoldParagraph key={i} text={p} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
