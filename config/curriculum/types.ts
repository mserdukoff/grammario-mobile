export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

/** A single grammar topic entry in a language curriculum config file. */
export interface TopicConfig {
  level: CefrLevel;
  slug: string;
  title: string;
  /** One-sentence summary shown on the topic list card. */
  summary: string;
  /**
   * Full lesson body. Supports `**bold**` markdown and `\n\n` paragraph breaks.
   * Use single quotes inside the string to avoid escaping.
   */
  body: string;
}
