import React, { useLayoutEffect, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useTheme } from "@/theme";
import { LANGUAGES, type LanguageCode } from "@/lib/utils";
import { CEFR_LEVELS, type CefrLevel, getTopicsForLevel } from "@/lib/learn-curriculum";

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
  const { lang, level, slug } = useLocalSearchParams<{
    lang: string;
    level: string;
    slug: string;
  }>();
  const navigation = useNavigation();

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
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
