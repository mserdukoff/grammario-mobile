import React from "react";
import { View, type ViewStyle } from "react-native";
import { useTheme } from "@/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 20,
          shadowColor: isDark ? "#000" : "#2A2926",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.25 : 0.07,
          shadowRadius: 8,
          elevation: 3,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
