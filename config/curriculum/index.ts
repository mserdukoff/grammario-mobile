/**
 * Central registry of all language curriculum configs.
 *
 * To add a new language:
 *   1. Create `config/curriculum/<lang>.ts` exporting a `TopicConfig[]`
 *   2. Import it here and add it to CURRICULUM_CONFIG
 *   3. Ensure the language code exists in LanguageCode (lib/utils.ts)
 *
 * The app dynamically generates the full CURRICULUM structure from this
 * registry — no other changes are required.
 */

import type { LanguageCode } from "@/lib/utils";
import type { TopicConfig } from "./types";

import { IT_CURRICULUM } from "./it";
import { ES_CURRICULUM } from "./es";
import { DE_CURRICULUM } from "./de";
import { RU_CURRICULUM } from "./ru";
import { TR_CURRICULUM } from "./tr";

export const CURRICULUM_CONFIG: Record<LanguageCode, TopicConfig[]> = {
  it: IT_CURRICULUM,
  es: ES_CURRICULUM,
  de: DE_CURRICULUM,
  ru: RU_CURRICULUM,
  tr: TR_CURRICULUM,
};

export type { TopicConfig } from "./types";
export { CEFR_LEVELS, type CefrLevel } from "./types";
