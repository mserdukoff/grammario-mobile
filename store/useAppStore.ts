import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AnalysisResponse } from "@/lib/api";

type ThemeMode = "system" | "light" | "dark";

interface Preferences {
  defaultLanguage: string;
  dailyGoalTarget: number;
  showTranslations: boolean;
  enableSounds: boolean;
  enableTTS: boolean;
  themeMode: ThemeMode;
}

interface AppState {
  currentAnalysis: AnalysisResponse | null;
  setCurrentAnalysis: (analysis: AnalysisResponse | null) => void;

  recentAnalyses: AnalysisResponse[];
  addRecentAnalysis: (analysis: AnalysisResponse) => void;
  clearRecentAnalyses: () => void;

  preferences: Preferences;
  setPreference: <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => void;

  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentAnalysis: null,
      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),

      recentAnalyses: [],
      addRecentAnalysis: (analysis) =>
        set((state) => ({
          recentAnalyses: [analysis, ...state.recentAnalyses].slice(0, 10),
        })),
      clearRecentAnalyses: () => set({ recentAnalyses: [] }),

      preferences: {
        defaultLanguage: "it",
        dailyGoalTarget: 5,
        showTranslations: true,
        enableSounds: true,
        enableTTS: true,
        themeMode: "system" as ThemeMode,
      },
      setPreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),

      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (completed) =>
        set({ hasCompletedOnboarding: completed }),
    }),
    {
      name: "grammario-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        recentAnalyses: state.recentAnalyses,
      }),
    }
  )
);
