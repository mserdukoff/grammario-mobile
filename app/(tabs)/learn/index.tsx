import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { GraduationCap, ChevronRight, Map } from "lucide-react-native";
import { useTheme } from "@/theme";
import { useAuth } from "@/lib/auth-context";
import { LANGUAGES } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export default function LearnHubScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();

  const allowed = LANGUAGES.filter((l) => {
    if (profile?.is_pro) return true;
    const learn = profile?.learn_language;
    if (!learn) return false;
    return l.code === learn;
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={[]}
    >
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={{ gap: 8, marginTop: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <GraduationCap size={28} color={colors.primary} />
            <Text
              style={{
                fontFamily: "InstrumentSerif-Italic",
                fontSize: 28,
                color: colors.foreground,
              }}
            >
              Guided learning
            </Text>
          </View>
          <Text
            style={{
              fontFamily: "PlusJakartaSans",
              fontSize: 14,
              color: colors.mutedForeground,
              lineHeight: 20,
            }}
          >
            Browse CEFR levels and outline topics. Deeper interactive lessons
            can grow over time—this hub matches the web curriculum structure.
          </Text>
        </View>

        {!profile?.is_pro && !profile?.learn_language ? (
          <Card style={{ padding: 16 }}>
            <Text
              style={{
                fontFamily: "PlusJakartaSans",
                fontSize: 14,
                color: colors.mutedForeground,
              }}
            >
              Pick a learning language from the welcome prompt (or Settings) to
              unlock the hub on the free plan.
            </Text>
          </Card>
        ) : (
          <>
            {/* Italian Mastery Map — Italian learners / Pro */}
            {(profile?.is_pro || profile?.learn_language === "it") && (
              <View style={{ gap: 6 }}>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: 11,
                    color: colors.mutedForeground,
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    paddingHorizontal: 2,
                  }}
                >
                  Italian only
                </Text>
                <Pressable
                  onPress={() => router.push("/learn/mastery-map" as any)}
                >
                  <Card
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 16,
                      gap: 12,
                      borderColor: colors.primary + "40",
                      borderWidth: 1,
                      backgroundColor: colors.primary + "08",
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: colors.primary + "18",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Map size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans-SemiBold",
                          fontSize: 16,
                          color: colors.foreground,
                        }}
                      >
                        Grammar Mastery Map
                      </Text>
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans",
                          fontSize: 13,
                          color: colors.mutedForeground,
                          marginTop: 2,
                        }}
                      >
                        Track which concepts you've encountered
                      </Text>
                    </View>
                    <ChevronRight size={20} color={colors.mutedForeground} />
                  </Card>
                </Pressable>
              </View>
            )}

            {/* Language CEFR curriculum cards */}
            <View style={{ gap: 6 }}>
              {allowed.length > 0 && (
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: 11,
                    color: colors.mutedForeground,
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    paddingHorizontal: 2,
                  }}
                >
                  Curriculum
                </Text>
              )}
              {allowed.map((lang) => (
                <Pressable
                  key={lang.code}
                  onPress={() => router.push(`/learn/${lang.code}`)}
                >
                  <Card
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 16,
                      gap: 12,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans-SemiBold",
                          fontSize: 16,
                          color: colors.foreground,
                        }}
                      >
                        {lang.name}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans",
                          fontSize: 13,
                          color: colors.mutedForeground,
                          marginTop: 2,
                        }}
                      >
                        CEFR bands A1–C2
                      </Text>
                    </View>
                    <ChevronRight size={20} color={colors.mutedForeground} />
                  </Card>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
