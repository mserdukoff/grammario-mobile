import type { TopicConfig } from "./types";

/**
 * German grammar curriculum.
 * Add or edit entries here; the app builds the curriculum dynamically.
 */
export const DE_CURRICULUM: TopicConfig[] = [
  {
    level: "A1",
    slug: "grundlagen",
    title: "Grundlagen",
    summary: "Sounds, cases preview, and polite forms.",
    body: "Learn **ich bin**, **du hast**, and **Sie** vs **du**.\n\nBuild mini-dialogues in shops with **Bitte** and **Danke**.",
  },
  {
    level: "A2",
    slug: "akk-dat",
    title: "Akkusativ und Dativ",
    summary: "Objects, prepositions, and two-way prepositions.",
    body: "Track **den/dem** contrasts and **Wechselpräpositionen** with place vs direction.\n\nLabel sketches with *in die Schule* vs *in der Schule*.",
  },
  {
    level: "B1",
    slug: "perfekt",
    title: "Perfekt im Alltag",
    summary: "Spoken past with *haben/sein* + Partizip II.",
    body: "Memorize **strong verbs** and **sein** verbs of motion/change.\n\nKeep a one-week diary entry per day in Perfekt.",
  },
  {
    level: "B2",
    slug: "konjunktiv-ii",
    title: "Konjunktiv II",
    summary: "Politeness, hypotheticals, and *würde*.",
    body: "Use **Könnten Sie…**, *wenn ich Zeit hätte*, and reported speech lightly.\n\nTransform blunt requests into polite variants.",
  },
  {
    level: "C1",
    slug: "nominalisierung",
    title: "Nominalisierung",
    summary: "Dense noun phrases in essays and work email.",
    body: "Turn verb-heavy sentences into **Nominalstil** where appropriate.\n\nBalance readability: not every clause should be nominalized.",
  },
  {
    level: "C2",
    slug: "stilistik",
    title: "Stilistische Vielfalt",
    summary: "Fronting, particles, and register shifts.",
    body: "Study **doch**, **ja**, **eben** in context and literary **Verbklammer** extensions.\n\nParaphrase the same stance in academic and colloquial German.",
  },
];
