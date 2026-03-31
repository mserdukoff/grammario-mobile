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
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
          shadowColor: isDark ? "#000" : "#2A2926",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0.2 : 0.06,
          shadowRadius: 3,
          elevation: 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
