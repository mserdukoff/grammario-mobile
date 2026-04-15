import React from "react";
import { View, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";

interface PillOption {
  label: string;
  value: string;
  icon?: string;
}

interface PillToggleProps {
  options: PillOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export function PillToggle({ options, selected, onSelect }: PillToggleProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 6,
        flexWrap: "wrap",
        backgroundColor: isDark ? colors.surface1 : colors.surface2,
        borderRadius: 14,
        padding: 4,
      }}
    >
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <Pressable
            key={option.value}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(option.value);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: isSelected ? colors.primary : "transparent",
              minHeight: 34,
              shadowColor: isSelected ? colors.primary : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isSelected ? 0.3 : 0,
              shadowRadius: 4,
              elevation: isSelected ? 2 : 0,
            }}
          >
            {option.icon ? (
              <Text style={{ fontSize: 14 }}>{option.icon}</Text>
            ) : null}
            <Text
              style={{
                fontFamily: "PlusJakartaSans-SemiBold",
                fontSize: 13,
                color: isSelected
                  ? colors.primaryForeground
                  : colors.mutedForeground,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
