import type { TopicConfig } from "./types";

/**
 * Turkish grammar curriculum.
 * Add or edit entries here; the app builds the curriculum dynamically.
 */
export const TR_CURRICULUM: TopicConfig[] = [
  {
    level: "A1",
    slug: "selamlasma",
    title: "Selamlaşma ve temel cümle",
    summary: "Vowel harmony preview and basic predicates.",
    body: "Learn **Merhaba**, **teşekkür ederim**, and **-ım/-sin** endings.\n\nBuild *Ben öğrenciyim* style sentences with a small noun inventory.",
  },
  {
    level: "A2",
    slug: "locative",
    title: "Locative ve var/yok",
    summary: "Existence and location patterns.",
    body: "Use **-da/-de** with **var/yok** for presence/absence.\n\nDescribe rooms and cities with postpositions like **içinde**.",
  },
  {
    level: "B1",
    slug: "cases-possessive",
    title: "İyelik ve belirtme",
    summary: "Possessive chains and accusative *-(y)i*.",
    body: "Track **evim**, **kitabını**, and definite objects in past narratives.\n\nShort diary entries about borrowed items.",
  },
  {
    level: "B2",
    slug: "subordination",
    title: "Yan cümleler",
    summary: "**-dığı için**, **-ken**, **-meden önce**.",
    body: "Combine main and subordinate clauses without losing agreement.\n\nSummarize news blurbs in complex sentences.",
  },
  {
    level: "C1",
    slug: "voice-mood",
    title: "Çekim ve kip çeşitliliği",
    summary: "Obligation, inference, and reported speech.",
    body: "Contrast **-malı**, **-mış gibi**, and indirect styles.\n\nRewrite direct quotes as indirect in a panel discussion.",
  },
  {
    level: "C2",
    slug: "discourse",
    title: "Söylem ve bağdaşıklık",
    summary: "Cohesion, emphasis, and formal registers.",
    body: "Use **işte**, **ya**, **zaten** sparingly for nuance—not filler.\n\nEdit essays for logical connectors and **O/-y** transitions.",
  },
];
