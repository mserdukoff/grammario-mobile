import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/theme";

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  mono?: boolean;
}

export function Badge({ label, color, backgroundColor, mono }: BadgeProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: backgroundColor || colors.surface2,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          fontFamily: mono ? "JetBrainsMono" : "PlusJakartaSans-Medium",
          fontSize: mono ? 10 : 11,
          color: color || colors.mutedForeground,
          textTransform: mono ? "uppercase" : undefined,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
