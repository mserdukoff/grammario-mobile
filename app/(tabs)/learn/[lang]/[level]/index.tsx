import React, { useLayoutEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useTheme } from "@/theme";
import { getLanguageName, LANGUAGES, type LanguageCode } from "@/lib/utils";
import {
  CEFR_LEVELS,
  type CefrLevel,
  getTopicsForLevel,
} from "@/lib/learn-curriculum";
import { Card } from "@/components/ui/Card";

export default function LearnTopicsScreen() {
  const { colors } = useTheme();
  const { lang, level } = useLocalSearchParams<{
    lang: string;
    level: string;
  }>();
  const router = useRouter();
  const navigation = useNavigation();

  const code = lang as LanguageCode;
  const lev = level as CefrLevel;
  const validLang = LANGUAGES.some((l) => l.code === code);
  const validLevel = CEFR_LEVELS.includes(lev);

  const topics = useMemo(() => {
    if (!validLang || !validLevel) return [];
    return getTopicsForLevel(code, lev);
  }, [code, lev, validLang, validLevel]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: validLevel ? `${lev} · ${getLanguageName(code)}` : "Topics",
    });
  }, [navigation, code, lev, validLevel]);

  if (!validLang || !validLevel) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Text
          style={{
            fontFamily: "PlusJakartaSans",
            padding: 16,
            color: colors.mutedForeground,
          }}
        >
          Invalid level or language.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {topics.map((t) => (
          <Pressable
            key={t.slug}
            onPress={() =>
              router.push(`/learn/${code}/${lev}/${t.slug}`)
            }
          >
            <Card style={{ padding: 16, gap: 6 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: 16,
                    color: colors.foreground,
                    flex: 1,
                  }}
                >
                  {t.title}
                </Text>
                <ChevronRight size={20} color={colors.mutedForeground} />
              </View>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans",
                  fontSize: 13,
                  color: colors.mutedForeground,
                  lineHeight: 19,
                }}
              >
                {t.summary}
              </Text>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
