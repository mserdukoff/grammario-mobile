import React from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme } from "@/theme";
import type { TokenNode, RuleBasedError } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

const POS_COLORS: Record<string, string> = {
  VERB: "primary",
  AUX: "primary",
  NOUN: "foreground",
  PROPN: "foreground",
  ADJ: "foreground",
  ADV: "foreground",
  DET: "mutedForeground",
  ADP: "mutedForeground",
  PRON: "mutedForeground",
  CCONJ: "mutedForeground",
  SCONJ: "mutedForeground",
  PUNCT: "mutedForeground",
  PART: "mutedForeground",
  NUM: "foreground",
};

interface WordCardProps {
  token: TokenNode;
  isSelected: boolean;
  onPress: () => void;
  error?: RuleBasedError;
  onUposPress?: () => void;
}

export function WordCard({
  token,
  isSelected,
  onPress,
  error,
  onUposPress,
}: WordCardProps) {
  const { colors } = useTheme();

  const posColorKey = POS_COLORS[token.upos] || "foreground";
  const textColor = (colors as any)[posColorKey] || colors.foreground;
  const hasError = !!error;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${token.text}, ${token.upos}, lemma: ${token.lemma}`}
      style={{
        minWidth: 90,
        backgroundColor: colors.card,
        borderRadius: 10,
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected
          ? colors.primary
          : hasError
            ? colors.error
            : colors.border,
        padding: 10,
        gap: 4,
        alignItems: "center",
      }}
    >
      {/* Token text */}
      <Text
        style={{
          fontFamily: "PlusJakartaSans-Medium",
          fontSize: 16,
          color: hasError ? colors.error : textColor,
          textDecorationLine: hasError ? "line-through" : "none",
        }}
      >
        {token.text}
      </Text>

      {/* Lemma */}
      <Text
        style={{
          fontFamily: "PlusJakartaSans",
          fontSize: 12,
          color: colors.mutedForeground,
          fontStyle: "italic",
        }}
      >
        {token.lemma}
      </Text>

      {/* UPOS Tag */}
      <Pressable
        onPress={onUposPress}
        hitSlop={4}
        accessibilityLabel={`Part of speech: ${token.upos}`}
      >
        <Badge label={token.upos} mono />
      </Pressable>

      {/* Segment chips */}
      {token.segments && token.segments.length > 0 && (
        <View style={{ flexDirection: "row", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
          {token.segments.map((seg, i) => (
            <View
              key={i}
              style={{
                backgroundColor: colors.surface2,
                borderRadius: 4,
                paddingHorizontal: 4,
                paddingVertical: 1,
              }}
            >
              <Text
                style={{
                  fontFamily: "PlusJakartaSans",
                  fontSize: 10,
                  color: colors.mutedForeground,
                }}
              >
                {seg}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Error indicator */}
      {hasError && (
        <View
          style={{
            backgroundColor: colors.errorLight,
            borderRadius: 4,
            paddingHorizontal: 6,
            paddingVertical: 2,
            marginTop: 2,
          }}
        >
          <Text
            style={{
              fontFamily: "PlusJakartaSans",
              fontSize: 9,
              color: colors.error,
            }}
            numberOfLines={2}
          >
            {error.message}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
