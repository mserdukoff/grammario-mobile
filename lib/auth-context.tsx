import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { isInvalidStoredSessionError } from "./auth-session";
import { supabase } from "./supabase";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import type { User } from "./database.types";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

interface AuthContextType {
  user: SupabaseUser | null;
  profile: User | null;
  session: Session | null;
  loading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function makeFallbackProfile(authUser: SupabaseUser): User {
  return {
    id: authUser.id,
    email: authUser.email || "",
    display_name:
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email?.split("@")[0] ||
      "User",
    avatar_url: authUser.user_metadata?.avatar_url || null,
    is_pro: false,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    subscription_status: null,
    subscription_ends_at: null,
    account_type: "regular",
    daily_sentence_limit: null,
    account_expires_at: null,
    admin_notes: null,
    xp: 0,
    level: 1,
    streak: 0,
    longest_streak: 0,
    last_active_date: null,
    total_analyses: 0,
    learn_language: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function createOrUpdateUserProfile(
  userId: string,
  email: string,
  displayName?: string | null,
  avatarUrl?: string | null
): Promise<User | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const today = new Date().toISOString().split("T")[0];

    const { data: existing, error: fetchError } = await db
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError) return null;

    if (existing) {
      const existingUser = existing as User;
      let newStreak = existingUser.streak || 1;
      const lastActive = existingUser.last_active_date;

      if (lastActive) {
        const lastDate = new Date(lastActive);
        const todayDate = new Date(today);
        const diffDays = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          newStreak = existingUser.streak + 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      }

      const { data: updated, error } = await db
        .from("users")
        .update({
          last_active_date: today,
          streak: newStreak,
          longest_streak: Math.max(
            newStreak,
            existingUser.longest_streak || 0
          ),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .maybeSingle();

      if (error) return existingUser;
      return updated as User;
    } else {
      const { data: newUser, error } = await db
        .from("users")
        .insert({
          id: userId,
          email,
          display_name: displayName || email.split("@")[0],
          avatar_url: avatarUrl,
          is_pro: false,
          xp: 0,
          level: 1,
          streak: 1,
          longest_streak: 1,
          last_active_date: today,
          total_analyses: 0,
          learn_language: null,
        })
        .select()
        .maybeSingle();

      if (error) return null;
      return newUser as User;
    }
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = useCallback(async (authUser: SupabaseUser) => {
    setProfileLoading(true);
    try {
      const userProfile = await createOrUpdateUserProfile(
        authUser.id,
        authUser.email || "",
        authUser.user_metadata?.full_name || authUser.user_metadata?.name,
        authUser.user_metadata?.avatar_url
      );
      setProfile(userProfile || makeFallbackProfile(authUser));
    } catch {
      setProfile(makeFallbackProfile(authUser));
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const safetyTimeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 10000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        if (!mounted) return;

        clearTimeout(safetyTimeout);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          loadProfile(session.user).catch(() => {});
        } else {
          setProfile(null);
        }
      }
    );

    const initializeSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;
        clearTimeout(safetyTimeout);

        if (error) {
          if (isInvalidStoredSessionError(error)) {
            await supabase.auth.signOut({ scope: "local" });
          }
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (session) {
          setSession(session);
          setUser(session.user);
          loadProfile(session.user).catch(() => {});
        }

        setLoading(false);
      } catch {
        if (mounted) {
          clearTimeout(safetyTimeout);
          setLoading(false);
        }
      }
    };

    initializeSession();

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName } },
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    if (!clientId) {
      throw new Error("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is not set in .env");
    }

    const reversedClientId = clientId
      .split(".")
      .reverse()
      .join(".");
    const redirectUri = `${reversedClientId}:/oauthredirect`;

    const request = new AuthSession.AuthRequest({
      clientId,
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    });

    const result = await request.promptAsync(GOOGLE_DISCOVERY);

    if (result.type !== "success") {
      if (result.type === "error") {
        throw new Error(result.error?.message || "Google sign-in failed");
      }
      return;
    }

    const { code } = result.params;

    const tokenResult = await AuthSession.exchangeCodeAsync(
      {
        clientId,
        code,
        redirectUri,
        extraParams: { code_verifier: request.codeVerifier! },
      },
      { tokenEndpoint: GOOGLE_DISCOVERY.tokenEndpoint }
    );

    if (!tokenResult.idToken) {
      throw new Error("No ID token returned from Google");
    }

    const { error: signInError } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: tokenResult.idToken,
    });
    if (signInError) throw signInError;
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // continue cleanup
    } finally {
      setUser(null);
      setProfile(null);
      setSession(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        profileLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
