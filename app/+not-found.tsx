import { View, Text } from "react-native";
import { Link } from "expo-router";
import { useTheme } from "@/theme";

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        padding: 24,
      }}
    >
      <Text
        style={{
          fontFamily: "InstrumentSerif-Italic",
          fontSize: 28,
          color: colors.foreground,
          marginBottom: 12,
        }}
      >
        Page Not Found
      </Text>
      <Link href="/" style={{ color: colors.primary }}>
        <Text
          style={{
            fontFamily: "PlusJakartaSans-Medium",
            fontSize: 16,
            color: colors.primary,
          }}
        >
          Go home
        </Text>
      </Link>
    </View>
  );
}
