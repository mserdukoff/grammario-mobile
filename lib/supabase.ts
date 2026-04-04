import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { LogBox, Platform } from "react-native";
import type { Database } from "./database.types";

// Supabase logs refresh failures with console.error during init; those are
// expected when local storage has a dead session and RN treats them as fatal.
if (__DEV__ && Platform.OS !== "web") {
  LogBox.ignoreLogs([
    "Invalid Refresh Token",
    "Refresh Token Not Found",
    "AuthApiError: Invalid Refresh Token",
  ]);
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: "pkce",
  },
});
