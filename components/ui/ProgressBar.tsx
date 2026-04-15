import React from "react";
import { View } from "react-native";
import { useTheme } from "@/theme";

interface ProgressBarProps {
  progress: number;
  fillColor?: string;
  trackColor?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  fillColor,
  trackColor,
  height = 7,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: trackColor || colors.surface3,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${clampedProgress}%`,
          borderRadius: height / 2,
          backgroundColor: fillColor || colors.primary,
        }}
      />
    </View>
  );
}
