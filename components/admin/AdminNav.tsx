import React from "react";
import { Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme";

export type AdminNavKey =
  | "overview"
  | "users"
  | "requests"
  | "vocabulary"
  | "feedback"
  | "backend";

const LINKS: { path: "/(tabs)/admin" | `/(tabs)/admin/${string}`; label: string; key: AdminNavKey }[] =
  [
    { path: "/(tabs)/admin", label: "Overview", key: "overview" },
    { path: "/(tabs)/admin/users", label: "Users", key: "users" },
    { path: "/(tabs)/admin/requests", label: "Requests", key: "requests" },
    { path: "/(tabs)/admin/vocabulary", label: "Vocab", key: "vocabulary" },
    { path: "/(tabs)/admin/feedback", label: "Feedback", key: "feedback" },
    { path: "/(tabs)/admin/backend", label: "Backend", key: "backend" },
  ];

export function AdminNav({ current }: { current: AdminNavKey }) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
    >
      {LINKS.map((link) => {
        const isActive = link.key === current;
        return (
          <Pressable
            key={link.key}
            onPress={() => router.push(link.path)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: isActive ? colors.primary : colors.muted,
            }}
          >
            <Text
              style={{
                fontFamily: "PlusJakartaSans-Medium",
                fontSize: 13,
                color: isActive ? colors.primaryForeground : colors.foreground,
              }}
            >
              {link.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
