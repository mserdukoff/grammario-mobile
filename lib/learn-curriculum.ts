import type { LanguageCode } from "./utils";

export const CEFR_LEVELS = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
] as const;

export type CefrLevel = (typeof CEFR_LEVELS)[number];

export interface LearnTopic {
  slug: string;
  title: string;
  summary: string;
  /** Use `**phrase**` for emphasis; split on double newlines for paragraphs. */
  body: string;
}

const mk = (
  slug: string,
  title: string,
  summary: string,
  body: string
): LearnTopic => ({ slug, title, summary, body });

/** Outline-style topics per language and level (parity with web “curriculum hub”). */
export const CURRICULUM: Record<LanguageCode, Record<CefrLevel, LearnTopic[]>> =
  {
    it: {
      A1: [
        mk(
          "primi-passi",
          "Primi passi",
          "Sounds, greetings, and very short sentences.",
          "Focus on **ciao**, **grazie**, and present tense of *essere* and *avere*.\n\nBuild tiny scripts: introducing yourself, numbers 1–20, and asking *Come stai?*"
        ),
      ],
      A2: [
        mk(
          "routine",
          "La routine quotidiana",
          "Daily activities and time expressions.",
          "Use **presente indicativo** for habits: *Mi sveglio alle sette*.\n\nAdd **articoli** and common prepositions (*a*, *in*, *da*) with places and times."
        ),
      ],
      B1: [
        mk(
          "passato",
          "Passato prossimo vs imperfetto",
          "Choosing between completed and background past.",
          "Pair **passato prossimo** for events (*ieri sono andato*) with **imperfetto** for settings (*faceva caldo*).\n\nPractice short narratives about trips and childhood memories."
        ),
      ],
      B2: [
        mk(
          "subjunctive-intro",
          "Congiuntivo essenziale",
          "Opinion, doubt, and purpose clauses.",
          "Triggers like **penso che**, **benché**, and **affinché** introduce the subjunctive.\n\nDrill alternating indicative/subjunctive in the same paragraph."
        ),
      ],
      C1: [
        mk(
          "register",
          "Registro e sfumature",
          "Formal, informal, and journalistic tone.",
          "Contrast **Lei** vs **tu**, bureaucratic formulas, and headline style.\n\nRewrite the same idea for a friend, a professor, and a news article."
        ),
      ],
      C2: [
        mk(
          "literary",
          "Stile letterario",
          "Syntax, inversion, and rhetorical devices.",
          "Study **periodo** structure, dislocations, and archaic or regional variants.\n\nAnalyze short excerpts and imitate rhythm without copying lexicon."
        ),
      ],
    },
    es: {
      A1: [
        mk(
          "saludos",
          "Saludos y presentaciones",
          "Greetings, alphabet, and survival phrases.",
          "Master **hola**, **por favor**, and gender agreement in *el/la*.\n\nPractice *¿Cómo te llamas?* with short answers using **ser**."
        ),
      ],
      A2: [
        mk(
          "planes",
          "Planes y preferencias",
          "Near future and simple preferences.",
          "Use **ir a** + infinitive and **me gusta** with infinitives or nouns.\n\nDescribe weekends with **cuando** and basic time clauses."
        ),
      ],
      B1: [
        mk(
          "pretérito-imperfecto",
          "Pretérito e imperfecto",
          "Storytelling with two past tenses.",
          "**Pretérito** for completed actions; **imperfecto** for background.\n\nRetell a film plot mixing both in each paragraph."
        ),
      ],
      B2: [
        mk(
          "subjuntivo",
          "Subjuntivo en cláusulas",
          "Wishes, doubt, and conjunctions.",
          "Patterns with **espero que**, **aunque**, and **para que**.\n\nNotice indicative reset after **creo que** vs subjunctive after **no creo que**."
        ),
      ],
      C1: [
        mk(
          "voz-pasiva",
          "Voz pasiva y perífrasis",
          "Passive, *se* passive, and circumlocution.",
          "Compare **fue construido**, **se vende**, and **estar + participio** states.\n\nEdit news clips for clarity and natural rhythm."
        ),
      ],
      C2: [
        mk(
          "matices",
          "Matices idiomáticos",
          "Idiom, metaphor, and regional shifts.",
          "Track double meanings, diminutives, and **voseo**/peninsular contrasts where relevant.\n\nTranslate nuanced opinion pieces without flattening tone."
        ),
      ],
    },
    de: {
      A1: [
        mk(
          "grundlagen",
          "Grundlagen",
          "Sounds, cases preview, and polite forms.",
          "Learn **ich bin**, **du hast**, and **Sie** vs **du**.\n\nBuild mini-dialogues in shops with **Bitte** and **Danke**."
        ),
      ],
      A2: [
        mk(
          "akk-dat",
          "Akkusativ und Dativ",
          "Objects, prepositions, and two-way prepositions.",
          "Track **den/dem** contrasts and **Wechselpräpositionen** with place vs direction.\n\nLabel sketches with *in die Schule* vs *in der Schule*."
        ),
      ],
      B1: [
        mk(
          "perfekt",
          "Perfekt im Alltag",
          "Spoken past with *haben/sein* + Partizip II.",
          "Memorize **strong verbs** and **sein** verbs of motion/change.\n\nKeep a one-week diary entry per day in Perfekt."
        ),
      ],
      B2: [
        mk(
          "konjunktiv-ii",
          "Konjunktiv II",
          "Politeness, hypotheticals, and *würde*.",
          "Use **Könnten Sie…**, *wenn ich Zeit hätte*, and reported speech lightly.\n\nTransform blunt requests into polite variants."
        ),
      ],
      C1: [
        mk(
          "nominalisierung",
          "Nominalisierung",
          "Dense noun phrases in essays and work email.",
          "Turn verb-heavy sentences into **Nominalstil** where appropriate.\n\nBalance readability: not every clause should be nominalized."
        ),
      ],
      C2: [
        mk(
          "stilistik",
          "Stilistische Vielfalt",
          "Fronting, particles, and register shifts.",
          "Study **doch**, **ja**, **eben** in context and literary **Verbklammer** extensions.\n\nParaphrase the same stance in academic and colloquial German."
        ),
      ],
    },
    ru: {
      A1: [
        mk(
          "alfavit",
          "Алфавит и первые фразы",
          "Cyrillic, stress, and polite address.",
          "Practice **Здравствуйте**, **Спасибо**, and gender in nouns.\n\nPair **я / ты / Вы** with simple **есть** sentences."
        ),
      ],
      A2: [
        mk(
          "padezhi-start",
          "Падежи: старт",
          "Nominative, accusative, and prepositional for location.",
          "Drill **в / на + Prep.** for being somewhere.\n\nAdd genitive after **нет** with people and things."
        ),
      ],
      B1: [
        mk(
          "glagoly-dvizheniya",
          "Глаголы движения",
          "Unidirectional vs multidirectional pairs.",
          "Contrast **идти / ходить** in short trips and habits.\n\nDescribe a commute using both aspects correctly."
        ),
      ],
      B2: [
        mk(
          "vid-aspekt",
          "Вид глагола",
          "Perfective/imperfective choices in narrative.",
          "Use **imperfective** for process and **perfective** for result.\n\nOutline a recipe vs a single completed attempt."
        ),
      ],
      C1: [
        mk(
          "prichastiya",
          "Причастия и деепричастия",
          "Participial phrases in written Russian.",
          "Build compact sentences with **-вший / -мый** and **-я / -в**.\n\nAvoid overloaded chains; split when clarity drops."
        ),
      ],
      C2: [
        mk(
          "stilistika",
          "Стилистика и устойчивые образы",
          "Idiom, register, and literary echoes.",
          "Track **книжная** vs **разговорная** lexis in the same topic.\n\nTranslate opinion columns while preserving irony or distance."
        ),
      ],
    },
    tr: {
      A1: [
        mk(
          "selamlasma",
          "Selamlaşma ve temel cümle",
          "Vowel harmony preview and basic predicates.",
          "Learn **Merhaba**, **teşekkür ederim**, and **-ım/-sin** endings.\n\nBuild *Ben öğrenciyim* style sentences with a small noun inventory."
        ),
      ],
      A2: [
        mk(
          "locative",
          "Locative ve var/yok",
          "Existence and location patterns.",
          "Use **-da/-de** with **var/yok** for presence/absence.\n\nDescribe rooms and cities with postpositions like **içinde**."
        ),
      ],
      B1: [
        mk(
          "cases-possessive",
          "İyelik ve belirtme",
          "Possessive chains and accusative *-(y)i*.",
          "Track **evim**, **kitabını**, and definite objects in past narratives.\n\nShort diary entries about borrowed items."
        ),
      ],
      B2: [
        mk(
          "subordination",
          "Yan cümleler",
          "**-dığı için**, **-ken**, **-meden önce**.",
          "Combine main and subordinate clauses without losing agreement.\n\nSummarize news blurbs in complex sentences."
        ),
      ],
      C1: [
        mk(
          "voice-mood",
          "Çekim ve kip çeşitliliği",
          "Obligation, inference, and reported speech.",
          "Contrast **-malı**, **-mış gibi**, and indirect styles.\n\nRewrite direct quotes as indirect in a panel discussion."
        ),
      ],
      C2: [
        mk(
          "discourse",
          "Söylem ve bağdaşıklık",
          "Cohesion, emphasis, and formal registers.",
          "Use **işte**, **ya**, **zaten** sparingly for nuance—not filler.\n\nEdit essays for logical connectors and **O/-y** transitions."
        ),
      ],
    },
  };

export function getTopicsForLevel(
  lang: LanguageCode,
  level: CefrLevel
): LearnTopic[] {
  return CURRICULUM[lang]?.[level] ?? [];
}
