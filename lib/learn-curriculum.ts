/**
 * Curriculum loader.
 *
 * All grammar topic content lives in config/curriculum/<lang>.ts.
 * This file builds the nested CEFR-level structure that the rest of the app
 * expects, and re-exports the shared types so import paths don't change.
 */

import type { LanguageCode } from "./utils";
import { CURRICULUM_CONFIG } from "@/config/curriculum";

export { CEFR_LEVELS, type CefrLevel } from "@/config/curriculum";
export type { TopicConfig } from "@/config/curriculum";

import type { CefrLevel } from "@/config/curriculum";

/** A single topic as consumed by the Learn screens. */
export interface LearnTopic {
  slug: string;
  title: string;
  summary: string;
  /** Use `**phrase**` for emphasis; split on double newlines for paragraphs. */
  body: string;
}

function buildLevelMap(
  topics: import("@/config/curriculum").TopicConfig[]
): Record<CefrLevel, LearnTopic[]> {
  const map: Record<string, LearnTopic[]> = {
    A1: [],
    A2: [],
    B1: [],
    B2: [],
    C1: [],
    C2: [],
  };
  for (const { level, slug, title, summary, body } of topics) {
    map[level].push({ slug, title, summary, body });
  }
  return map as Record<CefrLevel, LearnTopic[]>;
}

/** Nested curriculum record built dynamically from the config files. */
export const CURRICULUM: Record<
  LanguageCode,
  Record<CefrLevel, LearnTopic[]>
> = Object.fromEntries(
  Object.entries(CURRICULUM_CONFIG).map(([lang, topics]) => [
    lang,
    buildLevelMap(topics),
  ])
) as Record<LanguageCode, Record<CefrLevel, LearnTopic[]>>;

export function getTopicsForLevel(
  lang: LanguageCode,
  level: CefrLevel
): LearnTopic[] {
  return CURRICULUM[lang]?.[level] ?? [];
}
