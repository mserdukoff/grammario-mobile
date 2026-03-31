import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Star } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { useAuth } from "@/lib/auth-context";
import { submitFeedback } from "@/lib/db";
import type { FeedbackCategory } from "@/lib/database.types";
import { Button } from "@/components/ui/Button";

const CATEGORIES: { label: string; value: FeedbackCategory }[] = [
  { label: "Accuracy", value: "accuracy" },
  { label: "Translation", value: "translation" },
  { label: "Grammar tips", value: "grammar_tips" },
  { label: "Difficulty", value: "difficulty" },
  { label: "Other", value: "other" },
];

interface FeedbackFormProps {
  analysisId: string;
  sentenceText: string;
  language: string;
  onClose: () => void;
}

export function FeedbackForm({
  analysisId,
  sentenceText,
  language,
  onClose,
}: FeedbackFormProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<FeedbackCategory>("accuracy");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSubmitting(true);
    try {
      await submitFeedback(
        user.id,
        analysisId,
        rating,
        category,
        sentenceText,
        language,
        comment || undefined
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Thank you!", "Your feedback has been submitted.");
      onClose();
    } catch {
      Alert.alert("Error", "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface1,
        borderRadius: 10,
        padding: 16,
        gap: 14,
      }}
    >
      <Text
        style={{
          fontFamily: "PlusJakartaSans-SemiBold",
          fontSize: 14,
          color: colors.foreground,
        }}
      >
        How was this analysis?
      </Text>

      {/* Star Rating */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Pressable
            key={i}
            onPress={() => setRating(i)}
            hitSlop={4}
            accessibilityLabel={`Rate ${i} stars`}
          >
            <Star
              size={28}
              color={i <= rating ? colors.warning : colors.surface3}
              fill={i <= rating ? colors.warning : "none"}
            />
          </Pressable>
        ))}
      </View>

      {/* Category Chips */}
      <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.value}
            onPress={() => setCategory(cat.value)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 6,
              backgroundColor:
                category === cat.value ? colors.primary + "20" : colors.surface2,
              borderWidth: category === cat.value ? 1 : 0,
              borderColor: colors.primary,
            }}
          >
            <Text
              style={{
                fontFamily: "PlusJakartaSans-Medium",
                fontSize: 12,
                color:
                  category === cat.value
                    ? colors.primary
                    : colors.mutedForeground,
              }}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Comment */}
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Optional comment..."
        placeholderTextColor={colors.mutedForeground}
        multiline
        numberOfLines={3}
        style={{
          fontFamily: "PlusJakartaSans",
          fontSize: 14,
          color: colors.foreground,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.input,
          borderRadius: 8,
          padding: 12,
          textAlignVertical: "top",
          minHeight: 80,
        }}
      />

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button
          title="Cancel"
          onPress={onClose}
          variant="ghost"
          style={{ flex: 1 }}
        />
        <Button
          title={submitting ? "Sending..." : "Submit"}
          onPress={handleSubmit}
          variant="primary"
          disabled={submitting || rating === 0}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
