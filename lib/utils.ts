import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const LANGUAGES = [
  { code: "it", name: "Italian" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
  { code: "ru", name: "Russian" },
  { code: "tr", name: "Turkish" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export function getLanguageName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.name ?? code;
}
