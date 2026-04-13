import type { TopicConfig } from "./types";

/**
 * Spanish grammar curriculum.
 * Add or edit entries here; the app builds the curriculum dynamically.
 */
export const ES_CURRICULUM: TopicConfig[] = [
  {
    level: "A1",
    slug: "saludos",
    title: "Saludos y presentaciones",
    summary: "Greetings, alphabet, and survival phrases.",
    body: "Master **hola**, **por favor**, and gender agreement in *el/la*.\n\nPractice *¿Cómo te llamas?* with short answers using **ser**.",
  },
  {
    level: "A2",
    slug: "planes",
    title: "Planes y preferencias",
    summary: "Near future and simple preferences.",
    body: "Use **ir a** + infinitive and **me gusta** with infinitives or nouns.\n\nDescribe weekends with **cuando** and basic time clauses.",
  },
  {
    level: "B1",
    slug: "pretérito-imperfecto",
    title: "Pretérito e imperfecto",
    summary: "Storytelling with two past tenses.",
    body: "**Pretérito** for completed actions; **imperfecto** for background.\n\nRetell a film plot mixing both in each paragraph.",
  },
  {
    level: "B2",
    slug: "subjuntivo",
    title: "Subjuntivo en cláusulas",
    summary: "Wishes, doubt, and conjunctions.",
    body: "Patterns with **espero que**, **aunque**, and **para que**.\n\nNotice indicative reset after **creo que** vs subjunctive after **no creo que**.",
  },
  {
    level: "C1",
    slug: "voz-pasiva",
    title: "Voz pasiva y perífrasis",
    summary: "Passive, *se* passive, and circumlocution.",
    body: "Compare **fue construido**, **se vende**, and **estar + participio** states.\n\nEdit news clips for clarity and natural rhythm.",
  },
  {
    level: "C2",
    slug: "matices",
    title: "Matices idiomáticos",
    summary: "Idiom, metaphor, and regional shifts.",
    body: "Track double meanings, diminutives, and **voseo**/peninsular contrasts where relevant.\n\nTranslate nuanced opinion pieces without flattening tone.",
  },
];
