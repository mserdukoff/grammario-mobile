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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          <Text
            style={{
              fontFamily: "InstrumentSerif-Italic",
              fontSize: 40,
              color: colors.foreground,
            }}
          >
            Grammario
          </Text>
          <Text
            style={{
              fontFamily: "PlusJakartaSans",
              fontSize: 14,
              color: colors.mutedForeground,
              marginTop: 8,
            }}
          >
            Create your account
          </Text>
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <Text
              style={{
                fontFamily: "PlusJakartaSans-Medium",
                fontSize: 13,
                color: colors.foreground,
                marginBottom: 6,
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
              style={{
                fontFamily: "PlusJakartaSans",
                fontSize: 16,
                color: colors.foreground,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.input,
                borderRadius: 10,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            />
          </View>

          <View>
            <Text
              style={{
                fontFamily: "PlusJakartaSans-Medium",
                fontSize: 13,
                color: colors.foreground,
                marginBottom: 6,
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
              style={{
                fontFamily: "PlusJakartaSans",
                fontSize: 16,
                color: colors.foreground,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.input,
                borderRadius: 10,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            />
          </View>

          <View>
            <Text
              style={{
                fontFamily: "PlusJakartaSans-Medium",
                fontSize: 13,
                color: colors.foreground,
                marginBottom: 6,
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
              style={{
                fontFamily: "PlusJakartaSans",
                fontSize: 16,
                color: colors.foreground,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.input,
                borderRadius: 10,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
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
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginVertical: 4,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text
              style={{
                fontFamily: "PlusJakartaSans",
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

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 16,
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
