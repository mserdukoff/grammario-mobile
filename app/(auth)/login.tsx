import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/theme";
import { Button } from "@/components/ui/Button";

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert("Sign In Failed", error.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert("Google Sign In Failed", error.message || "Please try again");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 28,
          paddingVertical: 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={{ alignItems: "center", marginBottom: 52 }}>
          <Text
            style={{
              fontFamily: "InstrumentSerif-Italic",
              fontSize: 48,
              color: colors.foreground,
              lineHeight: 54,
            }}
          >
            Grammario
          </Text>
          <Text
            style={{
              fontFamily: "PlusJakartaSans",
              fontSize: 15,
              color: colors.mutedForeground,
              marginTop: 8,
            }}
          >
            Your linguistic analysis companion
          </Text>
        </View>

        <View style={{ gap: 18 }}>
          {/* Email field */}
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontFamily: "PlusJakartaSans-SemiBold",
                fontSize: 13,
                color: colors.foreground,
                letterSpacing: 0.1,
              }}
            >
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              style={{
                fontFamily: "PlusJakartaSans",
                fontSize: 16,
                color: colors.foreground,
                backgroundColor: colors.card,
                borderWidth: emailFocused ? 1.5 : 1,
                borderColor: emailFocused ? colors.ring : colors.input,
                borderRadius: 14,
                paddingHorizontal: 18,
                paddingVertical: 15,
              }}
            />
          </View>

          {/* Password field */}
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontFamily: "PlusJakartaSans-SemiBold",
                fontSize: 13,
                color: colors.foreground,
                letterSpacing: 0.1,
              }}
            >
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              autoComplete="password"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              style={{
                fontFamily: "PlusJakartaSans",
                fontSize: 16,
                color: colors.foreground,
                backgroundColor: colors.card,
                borderWidth: passwordFocused ? 1.5 : 1,
                borderColor: passwordFocused ? colors.ring : colors.input,
                borderRadius: 14,
                paddingHorizontal: 18,
                paddingVertical: 15,
              }}
            />
          </View>

          <Button
            title={loading ? "" : "Sign In"}
            onPress={handleSignIn}
            disabled={loading || googleLoading}
            variant="primary"
            icon={
              loading ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : undefined
            }
            style={{ marginTop: 4 }}
          />

          {/* Divider */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              marginVertical: 2,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text
              style={{
                fontFamily: "PlusJakartaSans-Medium",
                fontSize: 12,
                color: colors.mutedForeground,
              }}
            >
              or
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          <Button
            title={googleLoading ? "" : "Continue with Google"}
            onPress={handleGoogleSignIn}
            disabled={loading || googleLoading}
            variant="secondary"
            icon={
              googleLoading ? (
                <ActivityIndicator size="small" color={colors.foreground} />
              ) : undefined
            }
          />

          {/* Sign up link */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontFamily: "PlusJakartaSans",
                fontSize: 14,
                color: colors.mutedForeground,
              }}
            >
              Don&apos;t have an account?{" "}
            </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: 14,
                    color: colors.primary,
                  }}
                >
                  Sign Up
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
