import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useColorScheme as useRNColorScheme, Appearance } from "react-native";
import { lightColors, darkColors, type ThemeColors } from "./colors";
import { useAppStore } from "@/store/useAppStore";

type ThemeMode = "system" | "light" | "dark";

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: lightColors,
  isDark: false,
  mode: "system",
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  const themeMode = useAppStore((s) => s.preferences.themeMode);
  const setPreference = useAppStore((s) => s.setPreference);

  const isDark = useMemo(() => {
    if (themeMode === "system") return systemScheme === "dark";
    return themeMode === "dark";
  }, [themeMode, systemScheme]);

  useEffect(() => {
    if (themeMode === "system") {
      Appearance.setColorScheme(undefined as any);
    } else {
      Appearance.setColorScheme(themeMode === "dark" ? "dark" : "light");
    }
  }, [themeMode]);

  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({
      colors,
      isDark,
      mode: themeMode,
      setMode: (mode: ThemeMode) => setPreference("themeMode", mode),
    }),
    [colors, isDark, themeMode, setPreference]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { lightColors, darkColors };
export type { ThemeColors, ThemeMode };
