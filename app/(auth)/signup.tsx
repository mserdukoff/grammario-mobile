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

export default function SignupScreen() {
  const { signUp, signInWithGoogle } = useAuth();
  const { colors } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !displayName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, displayName);
      Alert.alert(
        "Check Your Email",
        "We sent a confirmation link to your email address."
      );
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.message || "Please try again");
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

  const inputStyle = (focused: boolean) => ({
    fontFamily: "PlusJakartaSans" as const,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.card,
    borderWidth: focused ? 1.5 : 1,
    borderColor: focused ? colors.ring : colors.input,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
  });

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
        <View style={{ alignItems: "center", marginBottom: 48 }}>
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
            Create your account
          </Text>
        </View>

        <View style={{ gap: 18 }}>
          {/* Display name field */}
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontFamily: "PlusJakartaSans-SemiBold",
                fontSize: 13,
                color: colors.foreground,
                letterSpacing: 0.1,
              }}
            >
              Display Name
            </Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="words"
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              style={inputStyle(nameFocused)}
            />
          </View>

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
              style={inputStyle(emailFocused)}
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
              placeholder="Choose a password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              autoComplete="password-new"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              style={inputStyle(passwordFocused)}
            />
          </View>

          <Button
            title={loading ? "" : "Create Account"}
            onPress={handleSignUp}
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

          {/* Sign in link */}
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
              Already have an account?{" "}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: 14,
                    color: colors.primary,
                  }}
                >
                  Sign In
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
