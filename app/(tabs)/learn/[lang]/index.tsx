import React, { useLayoutEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useTheme } from "@/theme";
import { getLanguageName, LANGUAGES, type LanguageCode } from "@/lib/utils";
import { CEFR_LEVELS } from "@/lib/learn-curriculum";
import { Card } from "@/components/ui/Card";

export default function LearnLevelsScreen() {
  const { colors } = useTheme();
  const { lang } = useLocalSearchParams<{ lang: string }>();
  const router = useRouter();
  const navigation = useNavigation();

  const code = lang as LanguageCode;
  const valid = LANGUAGES.some((l) => l.code === code);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: valid ? getLanguageName(code) : "Learn",
    });
  }, [navigation, code, valid]);

  if (!valid) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Text
          style={{
            fontFamily: "PlusJakartaSans",
            padding: 16,
            color: colors.mutedForeground,
          }}
        >
          Unknown language.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text
          style={{
            fontFamily: "PlusJakartaSans",
            fontSize: 14,
            color: colors.mutedForeground,
            marginBottom: 4,
          }}
        >
          Open a CEFR band to see outline topics for this language.
        </Text>
        {CEFR_LEVELS.map((level) => (
          <Pressable
            key={level}
            onPress={() => router.push(`/learn/${code}/${level}`)}
          >
            <Card
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: 17,
                    color: colors.foreground,
                  }}
                >
                  {level}
                </Text>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans",
                    fontSize: 13,
                    color: colors.mutedForeground,
                    marginTop: 2,
                  }}
                >
                  Topics for {getLanguageName(code)}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.mutedForeground} />
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
