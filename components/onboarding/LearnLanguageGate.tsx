import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme } from "@/theme";
import { useAuth } from "@/lib/auth-context";
import { useAppStore } from "@/store/useAppStore";
import { LANGUAGES } from "@/lib/utils";
import { updateUserLearnLanguage } from "@/lib/db";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LEARN_LANG_CHANGE_AT_KEY = "grammario-last-learn-language-change-at";

export function LearnLanguageGate() {
  const { colors } = useTheme();
  const { user, profile, refreshProfile } = useAuth();
  const setPreference = useAppStore((s) => s.setPreference);
  const [busy, setBusy] = useState(false);

  const needsPick =
    !!user &&
    !!profile &&
    !profile.is_pro &&
    !profile.learn_language;

  const pickLanguage = async (code: string) => {
    if (!user) return;
    setBusy(true);
    try {
      await updateUserLearnLanguage(user.id, code);
      await AsyncStorage.setItem(LEARN_LANG_CHANGE_AT_KEY, String(Date.now()));
      setPreference("defaultLanguage", code);
      await refreshProfile();
    } catch (e) {
      Alert.alert(
        "Could not save language",
        e instanceof Error
          ? e.message
          : "Check your connection or try again later."
      );
    } finally {
      setBusy(false);
    }
  };

  if (!needsPick) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            gap: 16,
          }}
        >
          <Text
            style={{
              fontFamily: "InstrumentSerif-Italic",
              fontSize: 24,
              color: colors.foreground,
            }}
          >
            Choose your learning language
          </Text>
          <Text
            style={{
              fontFamily: "PlusJakartaSans",
              fontSize: 14,
              color: colors.mutedForeground,
              lineHeight: 20,
            }}
          >
            On the free plan, analysis, review, and vocabulary stay scoped to one
            language. You can change it later in Settings (cooldown rules apply).
          </Text>

          {busy ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <View style={{ gap: 8 }}>
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.code}
                  onPress={() => pickLanguage(lang.code)}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                    backgroundColor: colors.surface2,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${lang.name}`}
                >
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans-SemiBold",
                      fontSize: 16,
                      color: colors.foreground,
                    }}
                  >
                    {lang.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
