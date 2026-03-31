type LangCode = "it" | "es" | "de" | "ru" | "tr";

export interface GrammarFeatureInfo {
  label: string;
  description: string;
  examples: Partial<Record<LangCode, string>>;
  tip?: string;
  category:
    | "mood"
    | "tense"
    | "aspect"
    | "voice"
    | "person"
    | "number"
    | "gender"
    | "case"
    | "definiteness"
    | "verbform"
    | "polarity"
    | "degree"
    | "prontype"
    | "animacy"
    | "polite"
    | "other";
}

export const UPOS_LABELS: Record<
  string,
  { label: string; description: string }
> = {
  NOUN: {
    label: "Noun",
    description: "A word that names a person, place, thing, or idea.",
  },
  VERB: {
    label: "Verb",
    description: "A word that expresses an action, state, or occurrence.",
  },
  ADJ: {
    label: "Adjective",
    description: "A word that describes or modifies a noun.",
  },
  ADV: {
    label: "Adverb",
    description: "A word that modifies a verb, adjective, or other adverb.",
  },
  DET: {
    label: "Determiner",
    description:
      "A word that introduces a noun and specifies it (articles, demonstratives, possessives).",
  },
  ADP: {
    label: "Adposition",
    description:
      "A preposition or postposition that shows the relationship between a noun and other words.",
  },
  PRON: {
    label: "Pronoun",
    description:
      "A word that substitutes for a noun (he, she, it, they, etc.).",
  },
  CCONJ: {
    label: "Coordinating conjunction",
    description:
      "A word that connects words, phrases, or clauses of equal rank (and, or, but).",
  },
  SCONJ: {
    label: "Subordinating conjunction",
    description:
      "A word that introduces a dependent clause (because, although, when).",
  },
  PUNCT: {
    label: "Punctuation",
    description:
      "A punctuation mark like a period, comma, or question mark.",
  },
  AUX: {
    label: "Auxiliary verb",
    description:
      "A helping verb used with a main verb to form tenses, moods, or voices (be, have, will).",
  },
  PART: {
    label: "Particle",
    description:
      "A function word that doesn't fit other categories, often used with verbs (not, to, up).",
  },
  NUM: {
    label: "Numeral",
    description: "A word expressing a number or quantity.",
  },
  INTJ: {
    label: "Interjection",
    description: "An exclamation or filler word (oh, wow, um).",
  },
  PROPN: {
    label: "Proper noun",
    description:
      "The name of a specific person, place, or organization.",
  },
  SYM: { label: "Symbol", description: "A symbol like $, %, or @." },
  X: {
    label: "Other",
    description:
      "A word that cannot be classified into any other category.",
  },
};

const FEATURES: Record<string, GrammarFeatureInfo> = {
  "Mood=Ind": {
    label: "Indicative mood",
    description:
      "The verb states a fact or asks a question about reality. This is the most common mood \u2014 it describes things that are, were, or will be.",
    examples: {
      it: '"Il gatto mangia" (The cat eats) \u2014 a factual statement.',
      es: '"El gato come" (The cat eats) \u2014 stating a fact.',
      de: '"Die Katze frisst" (The cat eats) \u2014 a plain statement.',
      ru: '"\u041a\u043e\u0448\u043a\u0430 \u0435\u0441\u0442" (The cat eats) \u2014 describing what is happening.',
      tr: '"Kedi yiyor" (The cat is eating) \u2014 a factual observation.',
    },
    tip: "If a sentence sounds like a plain statement or question, it\u2019s indicative.",
    category: "mood",
  },
  "Mood=Sub": {
    label: "Subjunctive mood",
    description:
      "The verb expresses doubt, wish, possibility, or something contrary to fact. Common in Romance languages after certain conjunctions and verbs.",
    examples: {
      it: '"Credo che lui sia qui" (I believe he is here) \u2014 \u2018sia\u2019 is subjunctive after a verb of belief.',
      es: '"Quiero que vengas" (I want you to come) \u2014 \u2018vengas\u2019 is subjunctive after a verb of desire.',
      de: '"Wenn ich reich w\u00e4re" (If I were rich) \u2014 \u2018w\u00e4re\u2019 is Konjunktiv II.',
      ru: '"\u0415\u0441\u043b\u0438 \u0431\u044b \u044f \u0437\u043d\u0430\u043b" (If I had known) \u2014 conditional/subjunctive with \u2018\u0431\u044b\u2019.',
    },
    tip: "In Italian/Spanish, look for subjunctive after \u2018che/que\u2019 following verbs of emotion, doubt, or desire.",
    category: "mood",
  },
  "Mood=Imp": {
    label: "Imperative mood",
    description:
      "The verb gives a command, instruction, or request. The subject (you) is usually implied.",
    examples: {
      it: '"Mangia!" (Eat!) \u2014 a direct command.',
      es: '"\u00a1Come!" (Eat!) \u2014 a direct command.',
      de: '"Iss!" (Eat!) \u2014 a direct command.',
      ru: '"\u0415\u0448\u044c!" (Eat!) \u2014 a direct command.',
      tr: '"Ye!" (Eat!) \u2014 a direct command.',
    },
    tip: "Imperatives often appear without an explicit subject pronoun.",
    category: "mood",
  },
  "Mood=Cnd": {
    label: "Conditional mood",
    description:
      "The verb expresses what would happen under certain conditions. Used for polite requests and hypothetical situations.",
    examples: {
      it: '"Mangerei la pizza" (I would eat the pizza).',
      es: '"Comer\u00eda la pizza" (I would eat the pizza).',
      de: '"Ich w\u00fcrde die Pizza essen" (I would eat the pizza).',
      ru: '"\u042f \u0431\u044b \u0441\u044a\u0435\u043b \u043f\u0438\u0446\u0446\u0443" (I would eat the pizza).',
      tr: '"Pizza yerdim" (I would eat pizza).',
    },
    category: "mood",
  },
  "Tense=Pres": {
    label: "Present tense",
    description:
      "The action is happening now, or is a general truth. Also used for habitual actions and scheduled future events in some languages.",
    examples: {
      it: '"Mangia il pesce" \u2014 He eats the fish (right now, or habitually).',
      es: '"Come el pescado" \u2014 He eats the fish.',
      de: '"Er isst den Fisch" \u2014 He eats the fish.',
      ru: '"\u041e\u043d \u0435\u0441\u0442 \u0440\u044b\u0431\u0443" \u2014 He eats the fish.',
      tr: '"Bal\u0131k yiyor" \u2014 He is eating the fish.',
    },
    category: "tense",
  },
  "Tense=Past": {
    label: "Past tense",
    description:
      "The action happened before now. Different languages distinguish between simple past, imperfect, and other past sub-types.",
    examples: {
      it: '"Mangi\u00f2 il pesce" \u2014 He ate the fish.',
      es: '"Comi\u00f3 el pescado" \u2014 He ate the fish.',
      de: '"Er a\u00df den Fisch" \u2014 He ate the fish.',
      ru: '"\u041e\u043d \u0441\u044a\u0435\u043b \u0440\u044b\u0431\u0443" \u2014 He ate the fish.',
      tr: '"Bal\u0131k yedi" \u2014 He ate the fish.',
    },
    category: "tense",
  },
  "Tense=Fut": {
    label: "Future tense",
    description: "The action will happen after now.",
    examples: {
      it: '"Manger\u00e0 il pesce" \u2014 He will eat the fish.',
      es: '"Comer\u00e1 el pescado" \u2014 He will eat the fish.',
      de: '"Er wird den Fisch essen" \u2014 He will eat the fish.',
      ru: '"\u041e\u043d \u0431\u0443\u0434\u0435\u0442 \u0435\u0441\u0442\u044c \u0440\u044b\u0431\u0443" \u2014 He will eat the fish.',
      tr: '"Bal\u0131k yiyecek" \u2014 He will eat the fish.',
    },
    category: "tense",
  },
  "Tense=Imp": {
    label: "Imperfect tense",
    description:
      "A past tense describing ongoing, habitual, or repeated actions. Unlike the simple past, it doesn\u2019t emphasize completion.",
    examples: {
      it: '"Mangiava sempre il pesce" \u2014 He always used to eat fish.',
      es: '"Siempre com\u00eda pescado" \u2014 He always used to eat fish.',
      de: '"Er a\u00df immer Fisch" \u2014 He always used to eat fish.',
      ru: '"\u041e\u043d \u0432\u0441\u0435\u0433\u0434\u0430 \u0435\u043b \u0440\u044b\u0431\u0443" \u2014 He always used to eat fish (imperfective).',
    },
    tip: "The imperfect sets the scene; the simple past advances the story.",
    category: "tense",
  },
  "Aspect=Imp": {
    label: "Imperfective aspect",
    description:
      "The action is viewed as ongoing, habitual, or incomplete \u2014 without focus on its endpoint.",
    examples: {
      ru: '"\u041e\u043d \u0447\u0438\u0442\u0430\u043b \u043a\u043d\u0438\u0433\u0443" (He was reading a book) \u2014 the reading was in progress.',
      it: '"Leggeva un libro" \u2014 He was reading a book (ongoing).',
      tr: '"Kitap okuyordu" \u2014 He was reading a book.',
    },
    tip: "In Russian, imperfective verbs focus on the action itself; perfective verbs focus on the result.",
    category: "aspect",
  },
  "Aspect=Perf": {
    label: "Perfective aspect",
    description:
      "The action is viewed as complete, with a clear beginning and end. Focuses on the result rather than the process.",
    examples: {
      ru: '"\u041e\u043d \u043f\u0440\u043e\u0447\u0438\u0442\u0430\u043b \u043a\u043d\u0438\u0433\u0443" (He read/finished the book) \u2014 the reading was completed.',
    },
    tip: "Russian perfective verbs often have prefixes (\u043f\u0440\u043e-, \u0441-, \u043d\u0430-) added to imperfective stems.",
    category: "aspect",
  },
  "Aspect=Prog": {
    label: "Progressive aspect",
    description:
      "The action is actively in progress at the moment of speaking. Common in Turkish with the -yor suffix.",
    examples: {
      tr: '"Kedi bal\u0131\u011f\u0131 yiyor" (The cat is eating the fish) \u2014 happening right now.',
    },
    tip: "In Turkish, -yor/-iyor/-\u00fcyor/-uyor marks an action currently underway.",
    category: "aspect",
  },
  "Voice=Act": {
    label: "Active voice",
    description:
      "The subject performs the action. This is the default, most common voice.",
    examples: {
      it: '"Il gatto mangia il pesce" \u2014 the cat (subject) does the eating.',
      es: '"El gato come el pescado" \u2014 the cat does the eating.',
      de: '"Die Katze frisst den Fisch" \u2014 the cat does the eating.',
      ru: '"\u041a\u043e\u0448\u043a\u0430 \u0435\u0441\u0442 \u0440\u044b\u0431\u0443" \u2014 the cat does the eating.',
      tr: '"Kedi bal\u0131\u011f\u0131 yiyor" \u2014 the cat does the eating.',
    },
    category: "voice",
  },
  "Voice=Pass": {
    label: "Passive voice",
    description:
      "The subject receives the action instead of performing it.",
    examples: {
      it: '"Il pesce \u00e8 mangiato dal gatto" \u2014 the fish is eaten by the cat.',
      de: '"Der Fisch wird von der Katze gefressen" \u2014 the fish is eaten by the cat.',
      ru: '"\u0420\u044b\u0431\u0430 \u0441\u044a\u0435\u0434\u0435\u043d\u0430 \u043a\u043e\u0448\u043a\u043e\u0439" \u2014 the fish is eaten by the cat.',
    },
    category: "voice",
  },
  "Person=1": {
    label: "First person",
    description:
      "The speaker is the subject (I, we). The verb is conjugated to match.",
    examples: {
      it: '"Io mangio" (I eat) \u2014 first person singular.',
      es: '"Yo como" (I eat) \u2014 first person singular.',
      de: '"Ich esse" (I eat) \u2014 first person singular.',
      ru: '"\u042f \u0435\u043c" (I eat) \u2014 first person singular.',
      tr: '"Ben yiyorum" (I am eating) \u2014 first person singular.',
    },
    category: "person",
  },
  "Person=2": {
    label: "Second person",
    description:
      "The listener is the subject (you). The verb is conjugated to match.",
    examples: {
      it: '"Tu mangi" (You eat) \u2014 second person singular.',
      es: '"T\u00fa comes" (You eat) \u2014 second person singular.',
      de: '"Du isst" (You eat) \u2014 second person singular.',
      ru: '"\u0422\u044b \u0435\u0448\u044c" (You eat) \u2014 second person singular.',
      tr: '"Sen yiyorsun" (You are eating) \u2014 second person singular.',
    },
    category: "person",
  },
  "Person=3": {
    label: "Third person",
    description:
      "Someone or something else is the subject (he, she, it, they).",
    examples: {
      it: '"Lui mangia" (He eats) \u2014 third person singular.',
      es: '"\u00c9l come" (He eats) \u2014 third person singular.',
      de: '"Er isst" (He eats) \u2014 third person singular.',
      ru: '"\u041e\u043d \u0435\u0441\u0442" (He eats) \u2014 third person singular.',
      tr: '"O yiyor" (He/she is eating) \u2014 third person singular.',
    },
    category: "person",
  },
  "Number=Sing": {
    label: "Singular",
    description: "Refers to one entity.",
    examples: {
      it: '"Il gatto" (The cat) \u2014 one cat.',
      es: '"El gato" (The cat) \u2014 one cat.',
      de: '"Die Katze" (The cat) \u2014 one cat.',
      ru: '"\u041a\u043e\u0448\u043a\u0430" (The cat) \u2014 one cat.',
      tr: '"Kedi" (The cat) \u2014 one cat.',
    },
    category: "number",
  },
  "Number=Plur": {
    label: "Plural",
    description:
      "Refers to more than one entity. Most languages change word endings to mark plural.",
    examples: {
      it: '"I gatti" (The cats) \u2014 both the article and noun changed.',
      es: '"Los gatos" (The cats) \u2014 plural article and noun ending.',
      de: '"Die Katzen" (The cats) \u2014 plural suffix \u2018-en\u2019.',
      ru: '"\u041a\u043e\u0448\u043a\u0438" (The cats) \u2014 plural ending.',
      tr: '"Kediler" (The cats) \u2014 plural suffix \u2018-ler\u2019.',
    },
    tip: "Each language has different plural formation rules.",
    category: "number",
  },
  "Gender=Masc": {
    label: "Masculine gender",
    description:
      "The word has masculine grammatical gender. Articles, adjectives, and sometimes verbs must agree.",
    examples: {
      it: '"Il gatto" \u2014 masculine, article is \u2018il\u2019.',
      es: '"El gato" \u2014 masculine, article is \u2018el\u2019.',
      de: '"Der Mann" \u2014 masculine, article \u2018der\u2019.',
      ru: '"\u041a\u043e\u0442" (male cat) \u2014 masculine nouns often end in a consonant.',
    },
    tip: "Grammatical gender is often arbitrary and doesn\u2019t necessarily relate to biological sex.",
    category: "gender",
  },
  "Gender=Fem": {
    label: "Feminine gender",
    description:
      "The word has feminine grammatical gender. All agreeing words must take feminine forms.",
    examples: {
      it: '"La gatta" \u2014 feminine, article is \u2018la\u2019.',
      es: '"La gata" \u2014 feminine, article is \u2018la\u2019.',
      de: '"Die Frau" \u2014 feminine, article \u2018die\u2019.',
      ru: '"\u041a\u043e\u0448\u043a\u0430" (female cat) \u2014 feminine nouns often end in -\u0430/-\u044f.',
    },
    category: "gender",
  },
  "Gender=Neut": {
    label: "Neuter gender",
    description:
      "The word has neuter grammatical gender. Found in German, Russian, and other languages with a three-gender system.",
    examples: {
      de: '"Das Kind" (The child) \u2014 neuter, article \u2018das\u2019.',
      ru: '"\u041e\u043a\u043d\u043e" (The window) \u2014 neuter nouns often end in -\u043e/-\u0435.',
    },
    category: "gender",
  },
  "Case=Nom": {
    label: "Nominative case",
    description:
      "The case of the subject \u2014 the person or thing performing the action.",
    examples: {
      de: '"Die Katze frisst" \u2014 \u2018Die Katze\u2019 is the subject.',
      ru: '"\u041a\u043e\u0448\u043a\u0430 \u0435\u0441\u0442" \u2014 \u2018\u041a\u043e\u0448\u043a\u0430\u2019 is the subject.',
      tr: '"Kedi yiyor" \u2014 \u2018Kedi\u2019 is the subject (base form).',
    },
    tip: 'Ask "who or what is doing the action?" to find the nominative.',
    category: "case",
  },
  "Case=Acc": {
    label: "Accusative case",
    description:
      "The case of the direct object \u2014 the person or thing directly receiving the action.",
    examples: {
      de: '"Er sieht den Mann" \u2014 \u2018den Mann\u2019 is the direct object.',
      ru: '"\u042f \u0432\u0438\u0436\u0443 \u043a\u043e\u0448\u043a\u0443" \u2014 \u2018\u043a\u043e\u0448\u043a\u0443\u2019 is accusative.',
      tr: '"Bal\u0131\u011f\u0131 yiyor" \u2014 \u2018bal\u0131\u011f\u0131\u2019 has the accusative suffix.',
    },
    tip: 'Ask "who or what is being acted upon?" to find the accusative.',
    category: "case",
  },
  "Case=Dat": {
    label: "Dative case",
    description:
      "The case of the indirect object \u2014 the person or thing that benefits from or is affected by the action.",
    examples: {
      de: '"Ich gebe dem Mann das Buch" \u2014 \u2018dem Mann\u2019 is the indirect object.',
      ru: '"\u042f \u0434\u0430\u043b \u043a\u043e\u0448\u043a\u0435 \u0440\u044b\u0431\u0443" \u2014 \u2018\u043a\u043e\u0448\u043a\u0435\u2019 is dative.',
      tr: '"Kediye bal\u0131k verdim" \u2014 \u2018kediye\u2019 has the dative suffix.',
    },
    tip: 'Ask "to whom or for whom?" to find the dative.',
    category: "case",
  },
  "Case=Gen": {
    label: "Genitive case",
    description:
      "The case showing possession or association. Equivalent to English \u2018of\u2019 or apostrophe-s.",
    examples: {
      de: '"Das Buch des Mannes" \u2014 \u2018des Mannes\u2019 (of the man).',
      ru: '"\u041a\u043d\u0438\u0433\u0430 \u043a\u043e\u0448\u043a\u0438" (The cat\u2019s book) \u2014 genitive.',
      tr: '"Kedinin bal\u0131\u011f\u0131" (The cat\u2019s fish) \u2014 genitive suffix.',
    },
    tip: 'Ask "whose?" to find the genitive.',
    category: "case",
  },
  "Case=Ins": {
    label: "Instrumental case",
    description:
      "The case indicating the means or instrument by which an action is performed.",
    examples: {
      ru: '"\u042f \u043f\u0438\u0448\u0443 \u0440\u0443\u0447\u043a\u043e\u0439" (I write with a pen) \u2014 instrumental.',
    },
    tip: 'Ask "with what?" or "by what means?" to find the instrumental.',
    category: "case",
  },
  "Case=Loc": {
    label: "Locative case",
    description:
      "The case indicating location. In Russian, always used with a preposition.",
    examples: {
      ru: '"\u041e\u043d \u0436\u0438\u0432\u0451\u0442 \u0432 \u041c\u043e\u0441\u043a\u0432\u0435" (He lives in Moscow) \u2014 locative.',
      tr: '"Evde" (At home) \u2014 locative suffix \u2018-de\u2019.',
    },
    category: "case",
  },
  "Case=Abl": {
    label: "Ablative case",
    description:
      "The case indicating movement away from something, or the source/origin.",
    examples: {
      tr: '"Evden geliyorum" (I\u2019m coming from the house) \u2014 ablative suffix.',
    },
    tip: 'Ask "from where?" or "from what?" to find the ablative.',
    category: "case",
  },
  "Definite=Def": {
    label: "Definite",
    description:
      "Refers to a specific, known entity \u2014 equivalent to English \u2018the\u2019.",
    examples: {
      it: '"Il gatto" (The cat) \u2014 a specific cat.',
      es: '"El gato" (The cat) \u2014 a specific, known cat.',
      de: '"Die Katze" (The cat) \u2014 definite article \u2018die\u2019.',
    },
    category: "definiteness",
  },
  "Definite=Ind": {
    label: "Indefinite",
    description:
      "Refers to a non-specific entity \u2014 equivalent to English \u2018a\u2019 or \u2018an\u2019.",
    examples: {
      it: '"Un gatto" (A cat) \u2014 any cat, not a specific one.',
      es: '"Un gato" (A cat) \u2014 indefinite article.',
      de: '"Eine Katze" (A cat) \u2014 indefinite article.',
    },
    category: "definiteness",
  },
  "VerbForm=Fin": {
    label: "Finite verb",
    description:
      "A verb form conjugated for person, number, tense, and/or mood. It can serve as the main verb.",
    examples: {
      it: '"Mangia" (He eats) \u2014 conjugated 3rd person singular present.',
      es: '"Come" (He eats) \u2014 conjugated finite form.',
      de: '"Isst" (He eats) \u2014 conjugated finite form.',
      ru: '"\u0415\u0441\u0442" (He eats) \u2014 conjugated finite form.',
      tr: '"Yiyor" (He is eating) \u2014 conjugated finite form.',
    },
    tip: "Finite verbs carry tense and agree with their subject.",
    category: "verbform",
  },
  "VerbForm=Inf": {
    label: "Infinitive",
    description:
      "The base, unconjugated form of a verb. In English: \u2018to eat\u2019.",
    examples: {
      it: '"Voglio mangiare" (I want to eat) \u2014 \u2018mangiare\u2019 is the infinitive.',
      es: '"Quiero comer" (I want to eat) \u2014 \u2018comer\u2019 is the infinitive.',
      de: '"Ich will essen" (I want to eat) \u2014 \u2018essen\u2019 is the infinitive.',
      ru: '"\u042f \u0445\u043e\u0447\u0443 \u0435\u0441\u0442\u044c" (I want to eat) \u2014 \u2018\u0435\u0441\u0442\u044c\u2019 is the infinitive.',
      tr: '"Yemek istiyorum" (I want to eat) \u2014 \u2018yemek\u2019 is the infinitive.',
    },
    category: "verbform",
  },
  "VerbForm=Part": {
    label: "Participle",
    description:
      "A verb form used as an adjective or to form compound tenses.",
    examples: {
      it: '"Ho mangiato" (I have eaten) \u2014 \u2018mangiato\u2019 is the past participle.',
      es: '"He comido" (I have eaten) \u2014 \u2018comido\u2019 is the past participle.',
      de: '"Ich habe gegessen" (I have eaten) \u2014 \u2018gegessen\u2019 is the past participle.',
      ru: '"\u0421\u044a\u0435\u0434\u0435\u043d\u043d\u044b\u0439" (eaten) \u2014 past passive participle.',
    },
    category: "verbform",
  },
  "VerbForm=Ger": {
    label: "Gerund",
    description:
      "A verb form ending in -ing (English) or equivalent, used to express ongoing action.",
    examples: {
      it: '"Sto mangiando" (I am eating) \u2014 \u2018mangiando\u2019 is the gerund.',
      es: '"Estoy comiendo" (I am eating) \u2014 \u2018comiendo\u2019 is the gerund.',
    },
    category: "verbform",
  },
  "Polarity=Pos": {
    label: "Positive polarity",
    description: "The statement is affirmative (not negated).",
    examples: {
      it: '"Mangia" (He eats) \u2014 an affirmative statement.',
      ru: '"\u041e\u043d \u0435\u0441\u0442" (He eats) \u2014 affirmative.',
      tr: '"Yiyor" (He is eating) \u2014 positive polarity.',
    },
    category: "polarity",
  },
  "Polarity=Neg": {
    label: "Negative polarity",
    description: "The statement is negated.",
    examples: {
      it: '"Non mangia" (He does not eat) \u2014 negated with \u2018non\u2019.',
      ru: '"\u041e\u043d \u043d\u0435 \u0435\u0441\u0442" (He does not eat) \u2014 negated with \u2018\u043d\u0435\u2019.',
      tr: '"Yemiyor" (He is not eating) \u2014 negative suffix changes the verb.',
    },
    category: "polarity",
  },
  "PronType=Art": {
    label: "Article",
    description:
      "A determiner functioning as an article (the, a, an). Articles signal whether a noun is definite or indefinite.",
    examples: {
      it: '"Il" / "La" / "Un" \u2014 Italian articles.',
      es: '"El" / "La" / "Un" \u2014 Spanish articles.',
      de: '"Der" / "Die" / "Das" / "Ein" \u2014 German articles vary by gender and case.',
    },
    category: "prontype",
  },
  "PronType=Prs": {
    label: "Personal pronoun",
    description:
      "A pronoun referring to a specific person (I, you, he, she, it, we, they).",
    examples: {
      it: '"Io, tu, lui, lei, noi, voi, loro" \u2014 Italian personal pronouns.',
      ru: '"\u042f, \u0442\u044b, \u043e\u043d, \u043e\u043d\u0430, \u043c\u044b, \u0432\u044b, \u043e\u043d\u0438" \u2014 Russian personal pronouns.',
    },
    category: "prontype",
  },
  "PronType=Dem": {
    label: "Demonstrative",
    description:
      "A word that points to a specific entity (this, that, these, those).",
    examples: {
      it: '"Questo gatto" (This cat) / "Quel gatto" (That cat).',
      de: '"Diese Katze" (This cat) / "Jene Katze" (That cat).',
    },
    category: "prontype",
  },
  "PronType=Rel": {
    label: "Relative pronoun",
    description:
      "A pronoun that introduces a relative clause (who, which, that).",
    examples: {
      it: '"Il gatto che mangia" (The cat that eats) \u2014 \u2018che\u2019 is relative.',
      de: '"Die Katze, die frisst" (The cat that eats) \u2014 \u2018die\u2019 is relative.',
    },
    category: "prontype",
  },
  "PronType=Int": {
    label: "Interrogative",
    description:
      "A word used to ask a question (who, what, which, where).",
    examples: {
      it: '"Chi?" (Who?), "Che cosa?" (What?)',
      ru: '"\u041a\u0442\u043e?" (Who?), "\u0427\u0442\u043e?" (What?)',
    },
    category: "prontype",
  },
  "Animacy=Anim": {
    label: "Animate",
    description:
      "The noun refers to a living being. In Russian, animate nouns have different accusative forms.",
    examples: {
      ru: '"\u042f \u0432\u0438\u0436\u0443 \u043a\u043e\u0442\u0430" (I see the cat) \u2014 animate, accusative = genitive form.',
    },
    tip: "In Russian, the accusative of animate masculine nouns looks like the genitive.",
    category: "animacy",
  },
  "Animacy=Inan": {
    label: "Inanimate",
    description:
      "The noun refers to a non-living thing. Inanimate nouns have simpler accusative forms.",
    examples: {
      ru: '"\u042f \u0432\u0438\u0436\u0443 \u0441\u0442\u043e\u043b" (I see the table) \u2014 inanimate, accusative = nominative.',
    },
    category: "animacy",
  },
  "Polite=Infm": {
    label: "Informal register",
    description:
      "The verb form uses informal/familiar address. Used with friends, family, or people of similar age.",
    examples: {
      tr: '"Sen geliyorsun" (You are coming) \u2014 informal \u2018sen\u2019 form.',
    },
    tip: "In Turkish, the informal \u2018sen\u2019 forms differ from the formal \u2018siz\u2019 forms.",
    category: "polite",
  },
  "Polite=Form": {
    label: "Formal register",
    description:
      "The verb form uses formal/polite address. Used with strangers, elders, or in professional settings.",
    examples: {
      tr: '"Siz geliyorsunuz" (You are coming) \u2014 formal \u2018siz\u2019 form.',
    },
    category: "polite",
  },
  "Degree=Pos": {
    label: "Positive degree",
    description:
      "The base form of an adjective or adverb, without comparison (big, fast).",
    examples: {
      it: '"Grande" (big) \u2014 the basic form.',
      de: '"Gro\u00df" (big) \u2014 the basic form.',
      ru: '"\u0411\u043e\u043b\u044c\u0448\u043e\u0439" (big) \u2014 the basic form.',
    },
    category: "degree",
  },
  "Degree=Cmp": {
    label: "Comparative degree",
    description:
      "Comparing two things \u2014 the adjective shows \u2018more\u2019 of a quality.",
    examples: {
      it: '"Pi\u00f9 grande" (bigger).',
      de: '"Gr\u00f6\u00dfer" (bigger) \u2014 suffix \u2018-er\u2019.',
      ru: '"\u0411\u043e\u043b\u044c\u0448\u0435" (bigger).',
    },
    category: "degree",
  },
  "Degree=Sup": {
    label: "Superlative degree",
    description:
      "The highest degree \u2014 the adjective shows \u2018most\u2019 of a quality.",
    examples: {
      it: '"Il pi\u00f9 grande" (the biggest).',
      de: '"Am gr\u00f6\u00dften" (the biggest).',
      ru: '"\u0421\u0430\u043c\u044b\u0439 \u0431\u043e\u043b\u044c\u0448\u043e\u0439" (the biggest).',
    },
    category: "degree",
  },
};

const CATEGORY_LABELS: Record<GrammarFeatureInfo["category"], string> = {
  mood: "Mood",
  tense: "Tense",
  aspect: "Aspect",
  voice: "Voice",
  person: "Person",
  number: "Number",
  gender: "Gender",
  case: "Case",
  definiteness: "Definiteness",
  verbform: "Verb Form",
  polarity: "Polarity",
  degree: "Degree",
  prontype: "Pronoun Type",
  animacy: "Animacy",
  polite: "Politeness",
  other: "Other",
};

export function getFeatureInfo(
  rawFeature: string
): GrammarFeatureInfo | null {
  return FEATURES[rawFeature] || null;
}

export function getFeatureExample(
  info: GrammarFeatureInfo,
  lang: string
): string | null {
  const example = info.examples[lang as LangCode];
  if (example) return example;

  const fallbackOrder: LangCode[] = ["it", "es", "de", "ru", "tr"];
  for (const fallback of fallbackOrder) {
    if (info.examples[fallback]) return info.examples[fallback]!;
  }
  return null;
}

export function getCategoryLabel(
  category: GrammarFeatureInfo["category"]
): string {
  return CATEGORY_LABELS[category] || category;
}

export function humanizeFeature(rawFeature: string): string {
  const info = FEATURES[rawFeature];
  if (info) return info.label;

  const [key, value] = rawFeature.split("=");
  if (!value) return rawFeature;

  const humanKey: Record<string, string> = {
    Mood: "Mood",
    Tense: "Tense",
    Aspect: "Aspect",
    Voice: "Voice",
    Person: "Person",
    Number: "Number",
    Gender: "Gender",
    Case: "Case",
    Definite: "Definiteness",
    VerbForm: "Verb form",
    Polarity: "Polarity",
    PronType: "Type",
    Animacy: "Animacy",
    Polite: "Register",
    Degree: "Degree",
  };

  return `${humanKey[key] || key}: ${value}`;
}

export function getUposInfo(
  upos: string
): { label: string; description: string } | null {
  return UPOS_LABELS[upos] || null;
}
