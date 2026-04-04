import { format } from "date-fns";

export const ADMIN_LANGS = [
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
] as const;

export function num(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

export function pickStat(
  stats: Record<string, unknown>,
  ...keys: string[]
): number {
  for (const k of keys) {
    const v = stats[k];
    if (v !== undefined && v !== null) return num(v);
  }
  return 0;
}

export function pickStr(v: unknown): string {
  if (typeof v === "string") return v;
  if (v === null || v === undefined) return "";
  return String(v);
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string | undefined | null): string {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "MMM d, yyyy HH:mm");
  } catch {
    return iso;
  }
}

export function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

export function analysesByLanguage(
  stats: Record<string, unknown>
): Record<string, number> {
  const raw =
    stats.analyses_by_language ??
    stats.analysesByLanguage ??
    stats.language_breakdown;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      out[k] = num(v);
    }
    return out;
  }
  return {};
}

export function listFromStats(
  stats: Record<string, unknown>,
  key: string
): Record<string, unknown>[] {
  const v = stats[key];
  if (Array.isArray(v)) return v as Record<string, unknown>[];
  return [];
}
