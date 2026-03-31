import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Clock, Star, Trash2 } from "lucide-react-native";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "@/theme";
import { useAuth } from "@/lib/auth-context";
import {
  getRecentAnalyses,
  getFavoriteAnalyses,
  toggleFavoriteAnalysis,
  deleteAnalysis,
} from "@/lib/db";
import type { Analysis } from "@/lib/database.types";
import type { AnalysisResponse, TokenNode, PedagogicalData } from "@/lib/api";
import { PillToggle } from "@/components/ui/PillToggle";
import { Skeleton } from "@/components/ui/Skeleton";
import { getLanguageName } from "@/lib/utils";

interface HistorySheetProps {
  visible: boolean;
  onDismiss: () => void;
  onLoadAnalysis: (analysis: AnalysisResponse) => void;
}

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Favorites", value: "favorites" },
];

export function HistorySheet({
  visible,
  onDismiss,
  onLoadAnalysis,
}: HistorySheetProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data =
        filter === "favorites"
          ? await getFavoriteAnalyses(user.id)
          : await getRecentAnalyses(user.id);
      setAnalyses(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    if (visible) load();
  }, [visible, load]);

  const handleToggleFavorite = async (id: string, current: boolean) => {
    await toggleFavoriteAnalysis(id, !current);
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteAnalysis(id);
    load();
  };

  const handleSelect = (item: Analysis) => {
    const analysis: AnalysisResponse = {
      metadata: { text: item.text, language: item.language },
      nodes: item.nodes as unknown as TokenNode[],
      pedagogical_data:
        (item.pedagogical_data as unknown as PedagogicalData) || undefined,
      difficulty: item.difficulty_level
        ? {
            level: item.difficulty_level,
            score: item.difficulty_score || 0,
          }
        : undefined,
    };
    onLoadAnalysis(analysis);
  };

  if (!visible) return null;

  return (
    <BottomSheet
      index={1}
      snapPoints={[64, "60%", "90%"]}
      onClose={onDismiss}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: colors.card,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.surface3,
        width: 36,
        height: 4,
      }}
    >
      <View style={{ padding: 16, gap: 12 }}>
        <PillToggle
          options={FILTER_OPTIONS}
          selected={filter}
          onSelect={setFilter}
        />
      </View>

      {loading ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton height={56} />
          <Skeleton height={56} />
          <Skeleton height={56} />
        </View>
      ) : analyses.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 40,
            gap: 8,
          }}
        >
          <Clock size={32} color={colors.mutedForeground} />
          <Text
            style={{
              fontFamily: "PlusJakartaSans",
              fontSize: 14,
              color: colors.mutedForeground,
            }}
          >
            {filter === "favorites" ? "No favorites yet" : "No analyses yet"}
          </Text>
        </View>
      ) : (
        <BottomSheetFlatList
          data={analyses}
          keyExtractor={(item: Analysis) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          renderItem={({ item }: { item: Analysis }) => (
            <Pressable
              onPress={() => handleSelect(item)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                gap: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
              accessibilityRole="button"
              accessibilityLabel={`Analysis: ${item.text}`}
            >
              <View
                style={{
                  backgroundColor: colors.surface2,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    fontFamily: "JetBrainsMono",
                    fontSize: 10,
                    color: colors.mutedForeground,
                    textTransform: "uppercase",
                  }}
                >
                  {getLanguageName(item.language)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: "PlusJakartaSans-Medium",
                    fontSize: 14,
                    color: colors.foreground,
                  }}
                >
                  {item.text}
                </Text>
                {item.translation && (
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: "PlusJakartaSans",
                      fontSize: 12,
                      color: colors.mutedForeground,
                    }}
                  >
                    {item.translation}
                  </Text>
                )}
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans",
                    fontSize: 11,
                    color: colors.mutedForeground,
                    marginTop: 2,
                  }}
                >
                  {formatDistanceToNow(new Date(item.created_at), {
                    addSuffix: true,
                  })}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  handleToggleFavorite(item.id, item.is_favorite)
                }
                hitSlop={8}
                accessibilityLabel={
                  item.is_favorite ? "Remove from favorites" : "Add to favorites"
                }
                style={{ padding: 4 }}
              >
                <Star
                  size={18}
                  color={item.is_favorite ? colors.warning : colors.mutedForeground}
                  fill={item.is_favorite ? colors.warning : "none"}
                />
              </Pressable>

              <Pressable
                onPress={() => handleDelete(item.id)}
                hitSlop={8}
                accessibilityLabel="Delete analysis"
                style={{ padding: 4 }}
              >
                <Trash2 size={16} color={colors.mutedForeground} />
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </BottomSheet>
  );
}
