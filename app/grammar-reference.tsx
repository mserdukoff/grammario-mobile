import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X, Lightbulb } from "lucide-react-native";
import { useTheme } from "@/theme";
import {
  getFeatureInfo,
  getFeatureExample,
  getCategoryLabel,
  getUposInfo,
  type GrammarFeatureInfo,
} from "@/lib/grammar-features";
import { Badge } from "@/components/ui/Badge";

export default function GrammarReferenceScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { type, key, language } = useLocalSearchParams<{
    type: string;
    key: string;
    language?: string;
  }>();

  let title = "";
  let description = "";
  let category = "";
  let example: string | null = null;
  let tip: string | null = null;
  let rawTag = key || "";

  if (type === "upos" && key) {
    const info = getUposInfo(key);
    if (info) {
      title = info.label;
      description = info.description;
      category = "Part of Speech";
    } else {
      title = key;
      description = "Unknown part of speech tag.";
    }
  } else if (type === "feature" && key) {
    const info = getFeatureInfo(key);
    if (info) {
      title = info.label;
      description = info.description;
      category = getCategoryLabel(info.category);
      example = getFeatureExample(info, language || "it");
      tip = info.tip || null;
    } else {
      const parts = key.split("=");
      title = parts.length === 2 ? `${parts[0]}: ${parts[1]}` : key;
      description = "No detailed information available for this feature.";
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Close Button */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityLabel="Close"
            accessibilityRole="button"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Category */}
        {category ? (
          <Badge
            label={category}
            color={colors.primary}
            backgroundColor={colors.primary + "16"}
          />
        ) : null}

        {/* Title */}
        <Text
          style={{
            fontFamily: "InstrumentSerif-Italic",
            fontSize: 24,
            color: colors.foreground,
          }}
        >
          {title}
        </Text>

        {/* Description */}
        <Text
          style={{
            fontFamily: "PlusJakartaSans",
            fontSize: 14,
            color: colors.mutedForeground,
            lineHeight: 22,
          }}
        >
          {description}
        </Text>

        {/* Example */}
        {example && (
          <View
            style={{
              backgroundColor: colors.surface2,
              borderRadius: 10,
              padding: 16,
              gap: 6,
            }}
          >
            <Text
              style={{
                fontFamily: "PlusJakartaSans-SemiBold",
                fontSize: 10,
                color: colors.mutedForeground,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Example
            </Text>
            <Text
              style={{
                fontFamily: "PlusJakartaSans",
                fontSize: 14,
                color: colors.foreground,
                fontStyle: "italic",
                lineHeight: 21,
              }}
            >
              {example}
            </Text>
          </View>
        )}

        {/* Tip */}
        {tip && (
          <View
            style={{
              backgroundColor: colors.primary + "0D",
              borderWidth: 1,
              borderColor: colors.primary + "30",
              borderRadius: 10,
              padding: 16,
              gap: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Lightbulb size={14} color={colors.primary} />
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-SemiBold",
                  fontSize: 11,
                  color: colors.primary,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Tip
              </Text>
            </View>
            <Text
              style={{
                fontFamily: "PlusJakartaSans",
                fontSize: 14,
                color: colors.foreground,
                lineHeight: 21,
              }}
            >
              {tip}
            </Text>
          </View>
        )}

        {/* Raw UD Tag */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface2,
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                fontSize: 12,
                color: colors.mutedForeground,
              }}
            >
              {rawTag}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: "PlusJakartaSans",
              fontSize: 12,
              color: colors.mutedForeground,
            }}
          >
            Universal Dependencies tag
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
