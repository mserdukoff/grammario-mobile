import type { TopicConfig } from "./types";

/**
 * Russian grammar curriculum.
 * Add or edit entries here; the app builds the curriculum dynamically.
 */
export const RU_CURRICULUM: TopicConfig[] = [
  {
    level: "A1",
    slug: "alfavit",
    title: "Алфавит и первые фразы",
    summary: "Cyrillic, stress, and polite address.",
    body: "Practice **Здравствуйте**, **Спасибо**, and gender in nouns.\n\nPair **я / ты / Вы** with simple **есть** sentences.",
  },
  {
    level: "A2",
    slug: "padezhi-start",
    title: "Падежи: старт",
    summary: "Nominative, accusative, and prepositional for location.",
    body: "Drill **в / на + Prep.** for being somewhere.\n\nAdd genitive after **нет** with people and things.",
  },
  {
    level: "B1",
    slug: "glagoly-dvizheniya",
    title: "Глаголы движения",
    summary: "Unidirectional vs multidirectional pairs.",
    body: "Contrast **идти / ходить** in short trips and habits.\n\nDescribe a commute using both aspects correctly.",
  },
  {
    level: "B2",
    slug: "vid-aspekt",
    title: "Вид глагола",
    summary: "Perfective/imperfective choices in narrative.",
    body: "Use **imperfective** for process and **perfective** for result.\n\nOutline a recipe vs a single completed attempt.",
  },
  {
    level: "C1",
    slug: "prichastiya",
    title: "Причастия и деепричастия",
    summary: "Participial phrases in written Russian.",
    body: "Build compact sentences with **-вший / -мый** and **-я / -в**.\n\nAvoid overloaded chains; split when clarity drops.",
  },
  {
    level: "C2",
    slug: "stilistika",
    title: "Стилистика и устойчивые образы",
    summary: "Idiom, register, and literary echoes.",
    body: "Track **книжная** vs **разговорная** lexis in the same topic.\n\nTranslate opinion columns while preserving irony or distance.",
  },
];
