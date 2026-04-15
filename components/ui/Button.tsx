import React from "react";
import { Pressable, Text, type ViewStyle, type TextStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  icon,
  iconRight,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.965, { duration: 120 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 200 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const containerStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: colors.primary,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: colors.secondary,
      borderWidth: 0,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: "transparent",
      borderWidth: 0,
    },
    destructive: {
      backgroundColor: colors.destructive,
      borderWidth: 0,
    },
  };

  const textStyles: Record<ButtonVariant, TextStyle> = {
    primary: { color: colors.primaryForeground },
    secondary: { color: colors.secondaryForeground },
    outline: { color: colors.foreground },
    ghost: { color: colors.foreground },
    destructive: { color: "#FFFFFF" },
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 14,
          paddingVertical: 15,
          paddingHorizontal: 22,
          gap: 8,
          minHeight: 50,
          opacity: disabled ? 0.45 : 1,
        },
        containerStyles[variant],
        animatedStyle,
        style,
      ]}
    >
      {icon}
      {title ? (
        <Text
          style={[
            {
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 16,
            },
            textStyles[variant],
          ]}
        >
          {title}
        </Text>
      ) : null}
      {iconRight}
    </AnimatedPressable>
  );
}
