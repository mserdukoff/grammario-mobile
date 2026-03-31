import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/theme";
import type { TokenNode } from "@/lib/api";
import {
  getFeatureInfo,
  humanizeFeature,
} from "@/lib/grammar-features";

interface MorphologyPanelProps {
  token: TokenNode;
  language: string;
}

export function MorphologyPanel({ token, language }: MorphologyPanelProps) {
  const { colors } = useTheme();
  const router = useRouter();

  if (!token.feats) return null;

  const features = token.feats.split("|").filter(Boolean);

  const handleFeaturePress = (feat: string) => {
    router.push({
      pathname: "/grammar-reference",
      params: { type: "feature", key: feat, language },
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      style={{
        padding: 16,
        gap: 8,
      }}
    >
      <Text
        style={{
          fontFamily: "PlusJakartaSans-SemiBold",
          fontSize: 11,
          color: colors.mutedForeground,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Morphological Features
      </Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {features.map((feat) => {
          const info = getFeatureInfo(feat);
          const isKnown = !!info;
          const label = humanizeFeature(feat);

          return (
            <Pressable
              key={feat}
              onPress={() => handleFeaturePress(feat)}
              accessibilityRole="button"
              accessibilityLabel={label}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: isKnown
                  ? colors.primary + "14"
                  : colors.surface2,
              }}
            >
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-Medium",
                  fontSize: 12,
                  color: isKnown ? colors.primary : colors.mutedForeground,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}
