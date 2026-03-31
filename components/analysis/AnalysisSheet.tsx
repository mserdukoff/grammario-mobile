import React, { forwardRef, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  BookOpen,
  Lightbulb,
  HelpCircle,
  ChevronRight,
  MessageSquarePlus,
} from "lucide-react-native";
import { useTheme } from "@/theme";
import type { AnalysisResponse } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";

interface AnalysisSheetProps {
  analysis: AnalysisResponse;
  analysisId: string | null;
}

function getCefrColors(level: string, colors: any) {
  if (level.startsWith("A"))
    return { bg: colors.successLight, fg: colors.success };
  if (level.startsWith("B"))
    return { bg: colors.warningLight, fg: colors.warning };
  return { bg: colors.errorLight, fg: colors.error };
}

export const AnalysisSheet = forwardRef<BottomSheet, AnalysisSheetProps>(
  function AnalysisSheet({ analysis, analysisId }, ref) {
    const { colors, isDark } = useTheme();
    const snapPoints = useMemo(() => [64, "45%", "90%"], []);
    const [feedbackOpen, setFeedbackOpen] = useState(false);

    const pd = analysis.pedagogical_data;
    const difficulty = analysis.difficulty;
    const errorCount =
      (analysis.grammar_errors?.length || 0) + (pd?.errors?.length || 0);
    const cefrColors = difficulty
      ? getCefrColors(difficulty.level, colors)
      : null;

    return (
      <BottomSheet
        ref={ref}
        index={0}
        snapPoints={snapPoints}
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
        {/* Handle area header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingBottom: 8,
            gap: 8,
          }}
        >
          <BookOpen size={18} color={colors.primary} />
          <Text
            style={{
              fontFamily: "PlusJakartaSans-SemiBold",
              fontSize: 14,
              color: colors.foreground,
              flex: 1,
            }}
          >
            Analysis details
          </Text>
          {cefrColors && difficulty && (
            <Badge
              label={difficulty.level}
              color={cefrColors.fg}
              backgroundColor={cefrColors.bg}
            />
          )}
          {errorCount > 0 && (
            <Badge
              label={`${errorCount} issue${errorCount > 1 ? "s" : ""}`}
              color={colors.error}
              backgroundColor={colors.errorLight}
            />
          )}
        </View>

        <BottomSheetScrollView
          contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 40 }}
        >
          {/* Translation */}
          {pd?.translation && (
            <Section label="Translation" colors={colors}>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans",
                  fontSize: 15,
                  color: colors.foreground,
                  fontStyle: "italic",
                  lineHeight: 22,
                }}
              >
                &ldquo;{pd.translation}&rdquo;
              </Text>
            </Section>
          )}

          {/* Nuance */}
          {pd?.nuance && (
            <Section label="Nuance" colors={colors}>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans",
                  fontSize: 13,
                  color: colors.mutedForeground,
                  lineHeight: 20,
                }}
              >
                {pd.nuance}
              </Text>
            </Section>
          )}

          {/* Difficulty */}
          {difficulty && cefrColors && (
            <Section label="Difficulty" colors={colors}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Badge
                  label={difficulty.level}
                  color={cefrColors.fg}
                  backgroundColor={cefrColors.bg}
                />
                <View style={{ flex: 1 }}>
                  <ProgressBar
                    progress={difficulty.score * 100}
                    fillColor={colors.primary}
                  />
                </View>
              </View>
            </Section>
          )}

          {/* Key Concepts */}
          {pd?.concepts && pd.concepts.length > 0 && (
            <Section label="Key Concepts" colors={colors}>
              <View style={{ gap: 14 }}>
                {pd.concepts.map((concept, i) => (
                  <View key={i} style={{ gap: 4 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Lightbulb size={14} color={colors.primary} />
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans-Medium",
                          fontSize: 14,
                          color: colors.foreground,
                        }}
                      >
                        {concept.name}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "PlusJakartaSans",
                        fontSize: 13,
                        color: colors.mutedForeground,
                        lineHeight: 19,
                      }}
                    >
                      {concept.description}
                    </Text>
                    {concept.related_words.length > 0 && (
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 6,
                          flexWrap: "wrap",
                          marginTop: 4,
                        }}
                      >
                        {concept.related_words.map((w, j) => (
                          <Badge key={j} label={w} />
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* Grammar Issues */}
          {analysis.grammar_errors && analysis.grammar_errors.length > 0 && (
            <Section
              label="Grammar Issues"
              colors={colors}
              labelColor={colors.error}
              icon={<HelpCircle size={14} color={colors.error} />}
            >
              <View style={{ gap: 10 }}>
                {analysis.grammar_errors.map((err, i) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: colors.errorLight,
                      borderRadius: 8,
                      padding: 12,
                      gap: 4,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "JetBrainsMono",
                          fontSize: 13,
                          color: colors.error,
                        }}
                      >
                        {err.word}
                      </Text>
                      <Badge
                        label={err.error_type}
                        color={colors.error}
                        backgroundColor={colors.error + "20"}
                        mono
                      />
                    </View>
                    <Text
                      style={{
                        fontFamily: "PlusJakartaSans",
                        fontSize: 13,
                        color: colors.foreground,
                        lineHeight: 19,
                      }}
                    >
                      {err.message}
                    </Text>
                    {err.correction && (
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans",
                          fontSize: 12,
                          color: colors.success,
                        }}
                      >
                        Correction: {err.correction}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* Tips */}
          {pd?.tips && pd.tips.length > 0 && (
            <Section label='Tips — "Why is it this way?"' colors={colors}>
              <View style={{ gap: 14 }}>
                {pd.tips.map((tip, i) => (
                  <View key={i} style={{ gap: 4 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <ChevronRight size={14} color={colors.primary} />
                      <View
                        style={{
                          backgroundColor: colors.primary + "12",
                          borderRadius: 4,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "JetBrainsMono",
                            fontSize: 12,
                            color: colors.primary,
                          }}
                        >
                          {tip.word}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans-Medium",
                          fontSize: 13,
                          color: colors.foreground,
                          flex: 1,
                        }}
                        numberOfLines={2}
                      >
                        {tip.question}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "PlusJakartaSans",
                        fontSize: 13,
                        color: colors.mutedForeground,
                        lineHeight: 19,
                        paddingLeft: 20,
                      }}
                    >
                      {tip.explanation}
                    </Text>
                    {tip.rule && (
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans",
                          fontSize: 12,
                          color: colors.mutedForeground,
                          fontStyle: "italic",
                          paddingLeft: 20,
                        }}
                      >
                        {tip.rule}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* AI Corrections */}
          {pd?.errors && pd.errors.length > 0 && (
            <Section label="AI Corrections" colors={colors} labelColor={colors.error}>
              <View style={{ gap: 10 }}>
                {pd.errors.map((err, i) => (
                  <View key={i} style={{ gap: 4 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans",
                          fontSize: 14,
                          color: colors.error,
                          textDecorationLine: "line-through",
                        }}
                      >
                        {err.word}
                      </Text>
                      <Text style={{ color: colors.mutedForeground }}>→</Text>
                      {err.correction && (
                        <Text
                          style={{
                            fontFamily: "PlusJakartaSans-Medium",
                            fontSize: 14,
                            color: colors.success,
                          }}
                        >
                          {err.correction}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={{
                        fontFamily: "PlusJakartaSans",
                        fontSize: 13,
                        color: colors.mutedForeground,
                        lineHeight: 19,
                      }}
                    >
                      {err.explanation}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* Feedback */}
          {analysisId && !feedbackOpen && (
            <Pressable
              onPress={() => setFeedbackOpen(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                paddingVertical: 12,
              }}
              accessibilityRole="button"
              accessibilityLabel="Give feedback"
            >
              <MessageSquarePlus size={18} color={colors.mutedForeground} />
              <Text
                style={{
                  fontFamily: "PlusJakartaSans-Medium",
                  fontSize: 14,
                  color: colors.foreground,
                }}
              >
                Give feedback
              </Text>
            </Pressable>
          )}
          {feedbackOpen && analysisId && (
            <FeedbackForm
              analysisId={analysisId}
              sentenceText={analysis.metadata.text}
              language={analysis.metadata.language}
              onClose={() => setFeedbackOpen(false)}
            />
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

function Section({
  label,
  colors,
  children,
  labelColor,
  icon,
}: {
  label: string;
  colors: any;
  children: React.ReactNode;
  labelColor?: string;
  icon?: React.ReactNode;
}) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {icon}
        <Text
          style={{
            fontFamily: "PlusJakartaSans-SemiBold",
            fontSize: 11,
            color: labelColor || colors.mutedForeground,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {label}
        </Text>
      </View>
      {children}
    </View>
  );
}
