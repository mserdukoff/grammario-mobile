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
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
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
              borderRadius: 20,
              backgroundColor: isSelected ? colors.primary : colors.surface2,
              minHeight: 36,
            }}
          >
            {option.icon ? (
              <Text style={{ fontSize: 14 }}>{option.icon}</Text>
            ) : null}
            <Text
              style={{
                fontFamily: "PlusJakartaSans-Medium",
                fontSize: 13,
                color: isSelected
                  ? colors.primaryForeground
                  : colors.secondaryForeground,
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
