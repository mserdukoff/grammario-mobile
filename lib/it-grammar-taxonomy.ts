import type { CefrLevel } from "./learn-curriculum";

export interface ItGrammarConcept {
  id: string;
  title: string;
  slug: string;
  level: CefrLevel;
  /** IDs of concepts that should be learned before this one */
  prerequisites: string[];
}

export const IT_GRAMMAR_TAXONOMY: ItGrammarConcept[] = [
  // ── A1 ──────────────────────────────────────────────────────────────
  {
    id: "it-a1-nouns-and-gender",
    title: "Nouns & Gender",
    slug: "nouns-and-gender",
    level: "A1",
    prerequisites: [],
  },
  {
    id: "it-a1-articles",
    title: "Definite & Indefinite Articles",
    slug: "articles",
    level: "A1",
    prerequisites: ["it-a1-nouns-and-gender"],
  },
  {
    id: "it-a1-present-essere-avere",
    title: "Essere & Avere",
    slug: "present-essere-avere",
    level: "A1",
    prerequisites: ["it-a1-articles"],
  },
  {
    id: "it-a1-present-regular-verbs",
    title: "Present Tense: Regular Verbs",
    slug: "present-regular-verbs",
    level: "A1",
    prerequisites: ["it-a1-present-essere-avere"],
  },
  {
    id: "it-a1-subject-pronouns",
    title: "Subject Pronouns & Pro-drop",
    slug: "subject-pronouns",
    level: "A1",
    prerequisites: ["it-a1-present-regular-verbs"],
  },
  {
    id: "it-a1-adjective-agreement",
    title: "Adjective Agreement & Position",
    slug: "adjective-agreement",
    level: "A1",
    prerequisites: ["it-a1-nouns-and-gender"],
  },
  {
    id: "it-a1-questions-and-negation",
    title: "Questions & Negation",
    slug: "questions-and-negation",
    level: "A1",
    prerequisites: ["it-a1-present-regular-verbs"],
  },

  // ── A2 ──────────────────────────────────────────────────────────────
  {
    id: "it-a2-passato-prossimo-avere",
    title: "Passato Prossimo with Avere",
    slug: "passato-prossimo-avere",
    level: "A2",
    prerequisites: ["it-a1-present-regular-verbs", "it-a1-present-essere-avere"],
  },
  {
    id: "it-a2-passato-prossimo-essere",
    title: "Passato Prossimo with Essere",
    slug: "passato-prossimo-essere",
    level: "A2",
    prerequisites: ["it-a2-passato-prossimo-avere"],
  },
  {
    id: "it-a2-imperfetto",
    title: "Imperfetto",
    slug: "imperfetto",
    level: "A2",
    prerequisites: ["it-a2-passato-prossimo-avere"],
  },
  {
    id: "it-a2-futuro-semplice",
    title: "Futuro Semplice",
    slug: "futuro-semplice",
    level: "A2",
    prerequisites: ["it-a1-present-regular-verbs"],
  },
  {
    id: "it-a2-modal-verbs",
    title: "Modal Verbs",
    slug: "modal-verbs",
    level: "A2",
    prerequisites: ["it-a1-present-regular-verbs"],
  },
  {
    id: "it-a2-reflexive-verbs",
    title: "Reflexive Verbs",
    slug: "reflexive-verbs",
    level: "A2",
    prerequisites: ["it-a1-present-regular-verbs"],
  },
  {
    id: "it-a2-direct-object-pronouns",
    title: "Direct Object Pronouns",
    slug: "direct-object-pronouns",
    level: "A2",
    prerequisites: ["it-a1-subject-pronouns"],
  },

  // ── B1 ──────────────────────────────────────────────────────────────
  {
    id: "it-b1-pp-vs-imperfetto",
    title: "Passato Prossimo vs Imperfetto",
    slug: "pp-vs-imperfetto",
    level: "B1",
    prerequisites: ["it-a2-passato-prossimo-essere", "it-a2-imperfetto"],
  },
  {
    id: "it-b1-indirect-object-pronouns",
    title: "Indirect Object Pronouns",
    slug: "indirect-object-pronouns",
    level: "B1",
    prerequisites: ["it-a2-direct-object-pronouns"],
  },
  {
    id: "it-b1-congiuntivo-presente",
    title: "Congiuntivo Presente",
    slug: "congiuntivo-presente",
    level: "B1",
    prerequisites: ["it-b1-pp-vs-imperfetto"],
  },
  {
    id: "it-b1-condizionale",
    title: "Condizionale Presente",
    slug: "condizionale",
    level: "B1",
    prerequisites: ["it-a2-futuro-semplice"],
  },
  {
    id: "it-b1-relative-pronouns",
    title: "Relative Pronouns",
    slug: "relative-pronouns",
    level: "B1",
    prerequisites: ["it-b1-indirect-object-pronouns"],
  },
  {
    id: "it-b1-gerundio",
    title: "Gerundio & Stare + Gerundio",
    slug: "gerundio",
    level: "B1",
    prerequisites: ["it-a1-present-regular-verbs"],
  },
  {
    id: "it-b1-prepositions",
    title: "Key Prepositions & Articulated Forms",
    slug: "prepositions",
    level: "B1",
    prerequisites: ["it-a1-articles"],
  },

  // ── B2 ──────────────────────────────────────────────────────────────
  {
    id: "it-b2-congiuntivo-passato-imperfetto",
    title: "Congiuntivo Passato & Imperfetto",
    slug: "congiuntivo-passato-imperfetto",
    level: "B2",
    prerequisites: ["it-b1-congiuntivo-presente"],
  },
  {
    id: "it-b2-condizionale-passato",
    title: "Condizionale Passato & Hypotheticals",
    slug: "condizionale-passato",
    level: "B2",
    prerequisites: ["it-b1-condizionale", "it-b2-congiuntivo-passato-imperfetto"],
  },
  {
    id: "it-b2-passive-voice",
    title: "Passive Voice",
    slug: "passive-voice",
    level: "B2",
    prerequisites: ["it-a1-present-essere-avere", "it-a2-passato-prossimo-essere"],
  },
  {
    id: "it-b2-discorso-indiretto",
    title: "Reported Speech",
    slug: "discorso-indiretto",
    level: "B2",
    prerequisites: ["it-b2-condizionale-passato"],
  },
  {
    id: "it-b2-indefinite-pronouns-adjectives",
    title: "Indefinite Pronouns & Adjectives",
    slug: "indefinite-pronouns-adjectives",
    level: "B2",
    prerequisites: ["it-a1-adjective-agreement", "it-a2-direct-object-pronouns"],
  },
  {
    id: "it-b2-si-constructions",
    title: "Si Constructions",
    slug: "si-constructions",
    level: "B2",
    prerequisites: ["it-b2-passive-voice", "it-a2-reflexive-verbs"],
  },

  // ── C1 ──────────────────────────────────────────────────────────────
  {
    id: "it-c1-congiuntivo-trapassato",
    title: "Congiuntivo Trapassato",
    slug: "congiuntivo-trapassato",
    level: "C1",
    prerequisites: ["it-b2-congiuntivo-passato-imperfetto", "it-b2-condizionale-passato"],
  },
  {
    id: "it-c1-participio-uses",
    title: "Participio Passato Uses",
    slug: "participio-uses",
    level: "C1",
    prerequisites: ["it-a2-passato-prossimo-essere"],
  },
  {
    id: "it-c1-subjunctive-advanced",
    title: "Advanced Subjunctive Contexts",
    slug: "subjunctive-advanced",
    level: "C1",
    prerequisites: ["it-c1-congiuntivo-trapassato"],
  },
  {
    id: "it-c1-trapassato-prossimo",
    title: "Trapassato Prossimo",
    slug: "trapassato-prossimo",
    level: "C1",
    prerequisites: ["it-b2-condizionale-passato"],
  },
  {
    id: "it-c1-register-and-formality",
    title: "Register & Formality",
    slug: "register-and-formality",
    level: "C1",
    prerequisites: ["it-c1-subjunctive-advanced"],
  },
  {
    id: "it-c1-complex-sentence-structures",
    title: "Complex Sentence Structures",
    slug: "complex-sentence-structures",
    level: "C1",
    prerequisites: ["it-c1-register-and-formality", "it-b1-relative-pronouns"],
  },

  // ── C2 ──────────────────────────────────────────────────────────────
  {
    id: "it-c2-literary-tenses",
    title: "Literary Tenses",
    slug: "literary-tenses",
    level: "C2",
    prerequisites: ["it-c1-trapassato-prossimo"],
  },
  {
    id: "it-c2-nominalization",
    title: "Nominalization & Abstract Register",
    slug: "nominalization",
    level: "C2",
    prerequisites: ["it-c1-register-and-formality"],
  },
  {
    id: "it-c2-discourse-connectors",
    title: "Discourse Connectors & Text Cohesion",
    slug: "discourse-connectors",
    level: "C2",
    prerequisites: ["it-c2-nominalization"],
  },
  {
    id: "it-c2-pragmatics-and-style",
    title: "Pragmatics & Stylistic Choices",
    slug: "pragmatics-and-style",
    level: "C2",
    prerequisites: ["it-c2-discourse-connectors", "it-c1-complex-sentence-structures"],
  },
];

export type MasteryStatus = "not_seen" | "spotted" | "familiar" | "practiced";

export function getMasteryStatus(count: number): MasteryStatus {
  if (count === 0) return "not_seen";
  if (count === 1) return "spotted";
  if (count <= 4) return "familiar";
  return "practiced";
}

export function getMasteryColors(
  status: MasteryStatus,
  colors: {
    surface2: string;
    surface3: string;
    mutedForeground: string;
    warning: string;
    warningLight: string;
    success: string;
    successLight: string;
    primary: string;
    foreground: string;
    border: string;
  }
) {
  switch (status) {
    case "not_seen":
      return { bg: colors.surface2, fg: colors.mutedForeground, border: colors.border };
    case "spotted":
      return { bg: colors.warningLight, fg: colors.warning, border: colors.warning + "60" };
    case "familiar":
      return { bg: colors.successLight, fg: colors.success, border: colors.success + "60" };
    case "practiced":
      return { bg: colors.primary + "18", fg: colors.primary, border: colors.primary + "60" };
  }
}

export function getMasteryLabel(status: MasteryStatus): string {
  switch (status) {
    case "not_seen": return "Not yet seen";
    case "spotted": return "Spotted";
    case "familiar": return "Familiar";
    case "practiced": return "Well-practiced";
  }
}

/** Fuzzy-match a concept name from LLM output against the taxonomy */
export function matchConceptToTaxonomy(
  name: string,
  taxonomy: ItGrammarConcept[]
): ItGrammarConcept | null {
  const normalized = name.toLowerCase().trim();

  for (const concept of taxonomy) {
    const title = concept.title.toLowerCase();
    const slug = concept.slug.toLowerCase().replace(/-/g, " ");

    if (title === normalized || slug === normalized) return concept;

    if (
      normalized.includes(title) ||
      title.includes(normalized) ||
      normalized.includes(slug) ||
      slug.includes(normalized)
    ) {
      return concept;
    }

    const keywords = title.split(" ").filter((k) => k.length > 3);
    const matchCount = keywords.filter((k) => normalized.includes(k)).length;
    if (matchCount >= 2) return concept;
  }

  return null;
}

export const CEFR_ORDER: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function getTaxonomyByLevel(): Record<CefrLevel, ItGrammarConcept[]> {
  return {
    A1: IT_GRAMMAR_TAXONOMY.filter((c) => c.level === "A1"),
    A2: IT_GRAMMAR_TAXONOMY.filter((c) => c.level === "A2"),
    B1: IT_GRAMMAR_TAXONOMY.filter((c) => c.level === "B1"),
    B2: IT_GRAMMAR_TAXONOMY.filter((c) => c.level === "B2"),
    C1: IT_GRAMMAR_TAXONOMY.filter((c) => c.level === "C1"),
    C2: IT_GRAMMAR_TAXONOMY.filter((c) => c.level === "C2"),
  };
}
