import type { TopicConfig } from "./types";

/**
 * Italian grammar curriculum — 37 topics across A1–C2.
 * Source of truth: ITALIAN_GRAMMAR_SUBJECTS.md
 *
 * To add or edit topics: modify this array and restart the bundler.
 * The app reads this file dynamically; no other code changes are needed.
 */
export const IT_CURRICULUM: TopicConfig[] = [
  // ─── A1 ──────────────────────────────────────────────────────────────────
  {
    level: "A1",
    slug: "nouns-and-gender",
    title: "Nouns & Gender",
    summary:
      "Every Italian noun is masculine or feminine. Gender governs articles, adjectives, and past-participle agreement.",
    body: "All Italian nouns are either **masculine** or **feminine** — there is no neutral gender. Most nouns ending in **-o** are masculine (*il libro*, the book), while nouns ending in **-a** are usually feminine (*la porta*, the door). Nouns ending in **-e** can be either gender: *il fiore* (masc.) vs *la notte* (fem.).\n\nPluralisation follows predictable patterns: **-o → -i** (*libro → libri*), **-a → -e** (*porta → porte*), **-e → -i** (*fiore → fiori*). Irregular plurals include *uomo → uomini* and *mano → mani* (hand — feminine despite the -o ending).\n\nGender matters because it governs the forms of articles (*il / la / lo / l'*), adjectives (*bello / bella*), and past-participle agreement in compound tenses. Memorise nouns with their gender from the start — it is much easier than trying to learn gender rules retroactively.",
  },
  {
    level: "A1",
    slug: "articles",
    title: "Definite & Indefinite Articles",
    summary:
      "Italian articles agree in gender and number with the noun. There are seven forms of the definite article and four of the indefinite.",
    body: "The **definite article** (equivalent to 'the') has seven forms that depend on gender, number, and the first sound of the noun: **il** (masc. sing., consonant), **lo** (masc. sing., s+cons., z, gn, ps, x, y), **l'** (sing. before vowel), **la** (fem. sing.), **i** (masc. pl., consonant), **gli** (masc. pl. of *lo* / before vowel), **le** (fem. pl.).\n\nThe **indefinite article** (equivalent to 'a/an') has four forms: **un** (masc., consonant), **uno** (masc., s+cons., z, gn…), **una** (fem., consonant), **un'** (fem., before vowel). There is no plural indefinite article; instead use **dei / degli / delle** (partitive, meaning 'some').\n\nArticles are required more often in Italian than in English. They appear before languages (*studio l'italiano*), body parts with verbs of sensation (*mi fa male la testa*), and titles when not directly addressing the person (*il dottor Rossi*). Learning which article combination applies to each noun is one of the most important early habits to build.",
  },
  {
    level: "A1",
    slug: "present-essere-avere",
    title: "Essere & Avere — the two pillars",
    summary:
      "Essere (to be) and avere (to have) are the two most essential verbs in Italian — both irregular and used as auxiliaries for compound tenses.",
    body: "**Essere** conjugates as: *sono, sei, è, siamo, siete, sono*. It expresses identity (*sono studente*), origin (*sei di Roma?*), permanent qualities (*il cielo è blu*), and serves as the auxiliary for a key group of verbs in compound tenses.\n\n**Avere** conjugates as: *ho, hai, ha, abbiamo, avete, hanno*. It expresses possession (*ho un cane*) and is the auxiliary for most transitive verbs in compound tenses. Note the silent **h** in *ho, hai, ha, hanno* — these are never aspirated and must not be confused with the conjunctions *o* (or) and *a* (to).\n\nChoosing the correct auxiliary in compound tenses is one of Italian's central challenges. As a rule of thumb, **intransitive verbs of motion or state change** (andare, venire, partire, nascere, morire…) take *essere*, while most transitive verbs take *avere*. When *essere* is the auxiliary, the past participle must agree in gender and number with the subject: *Maria è andata*, *i ragazzi sono andati*.",
  },
  {
    level: "A1",
    slug: "present-regular-verbs",
    title: "Present Tense: Regular Verbs",
    summary:
      "Italian regular verbs fall into three conjugation classes (-are, -ere, -ire). Learning the endings for each class gives you hundreds of verbs at once.",
    body: "**-are verbs** (*parlare*, to speak): *parlo, parli, parla, parliamo, parlate, parlano*. This is by far the largest group — around 90 % of new verbs borrowed into Italian are -are.\n\n**-ere verbs** (*scrivere*, to write): *scrivo, scrivi, scrive, scriviamo, scrivete, scrivono*. Many common -ere verbs have irregular past participles even when the present is regular (*scrivere → scritto*).\n\n**-ire verbs** split into two sub-patterns. Type 1 (*partire*, to leave): *parto, parti, parte, partiamo, partite, partono*. Type 2, the **-isc-** verbs (*finire*, to finish): *finisco, finisci, finisce, finiamo, finite, finiscono*. The -isc- infix appears in all persons except *noi* and *voi*.\n\nA practical hint: if a dictionary entry marks a verb as *-isc-*, it belongs to Type 2. Common Type 2 verbs include *capire, costruire, pulire, spedire*, and *suggerire*.",
  },
  {
    level: "A1",
    slug: "subject-pronouns",
    title: "Subject Pronouns & Pro-drop",
    summary:
      "Italian is a pro-drop language — subject pronouns are usually omitted because the verb ending identifies the person. Pronouns appear for emphasis or contrast.",
    body: "The subject pronouns are: **io** (I), **tu** (you, informal), **lui / lei** (he / she), **noi** (we), **voi** (you pl.), **loro** (they). **Lei** (capital L) is also the formal 'you' singular and uses third-person singular verb forms.\n\nItalian is **pro-drop**: *Parli italiano?* is perfectly natural — there is no need for *Tu parli italiano?* because the ending **-i** already signals second-person singular. Pronouns reappear when you want **emphasis** (*Io non lo so, ma lei sì*), when you need **clarity** because two third-person subjects appear in the same sentence, or for **contrastive pairs** (*tu studi, io lavoro*).\n\nFormal **Lei** always takes third-person singular verb forms: *Lei parla italiano, signora?* Learners sometimes confuse *lei* (she) with *Lei* (formal you) — in writing, capitalisation helps; in speech, context and politeness markers make the distinction clear.",
  },
  {
    level: "A1",
    slug: "adjective-agreement",
    title: "Adjective Agreement & Position",
    summary:
      "Italian adjectives agree in gender and number with the noun they modify. Most follow the noun, but a small set of common adjectives typically precede it.",
    body: "**Agreement patterns**: adjectives ending in **-o** have four forms (*bello, bella, belli, belle*); those ending in **-e** have two (*grande, grandi*). An adjective modifying nouns of mixed gender takes the masculine plural: *Marco e Maria sono italiani*.\n\n**Position**: the default in Italian is **after the noun** (*una casa grande*, *un libro interessante*). A handful of common adjectives usually **precede** the noun: **bello, brutto, buono, cattivo, giovane, vecchio, piccolo, grande, nuovo**, and the ordinals.\n\nPlacing a normally post-noun adjective **before** the noun adds a subjective, lyrical, or intensifying flavour: *una bella giornata* (a lovely day — evaluative) vs *una giornata bella* (objectively beautiful — more neutral). **Bello** and **buono** have irregular contracted forms before nouns: *un bel ragazzo, un buon vino* (but *un uomo bello / un vino buono* in predicate position).",
  },
  {
    level: "A1",
    slug: "questions-and-negation",
    title: "Questions & Negation",
    summary:
      "Italian forms questions through intonation or inversion, and negation by placing non before the verb. Double negatives are grammatically required.",
    body: "**Yes/no questions** are formed by rising intonation alone (*Parli italiano?*) or by inverting subject and verb (*Parli tu italiano?*). Unlike French or German, there is no auxiliary 'do' needed.\n\n**Question words**: *chi* (who), *che / cosa / che cosa* (what), *dove* (where), *quando* (when), *come* (how), *perché* (why), *quanto/a/i/e* (how much/many). Note that *perché* means both 'why' (question) and 'because' (answer).\n\n**Negation**: place **non** directly before the conjugated verb: *non parlo tedesco*. Italian uses **double negatives** grammatically — *non* plus a negative word like *niente* (nothing), *nessuno* (nobody), *mai* (never), *ancora* (yet), *più* (anymore): *non ho visto nessuno* (I haven't seen anyone). If the negative word precedes the verb, *non* is omitted: *Nessuno ha chiamato* but *Non ha chiamato nessuno*. Both orders are grammatically correct.",
  },

  // ─── A2 ──────────────────────────────────────────────────────────────────
  {
    level: "A2",
    slug: "passato-prossimo-avere",
    title: "Passato Prossimo with Avere",
    summary:
      "The main past tense for completed actions in spoken Italian. With avere as auxiliary, the past participle is invariable — unless a direct-object pronoun precedes it.",
    body: "**Formation**: *avere* (present) + **past participle**. Regular participles: **-are → -ato** (*parlato*), **-ere → -uto** (*creduto*), **-ire → -ito** (*dormito*). Examples: *ho parlato* (I spoke), *hai creduto*, *abbiamo dormito*.\n\nMany common **-ere** verbs have **irregular past participles** that must be memorised: *vedere → visto*, *leggere → letto*, *scrivere → scritto*, *prendere → preso*, *rispondere → risposto*, *mettere → messo*, *fare → fatto*, *dire → detto*, *bere → bevuto*.\n\nWith the auxiliary **avere**, the past participle does **not** agree with the subject: both *Marco ha mangiato* and *Maria ha mangiato* are correct. However, it **does** agree with a preceding direct-object pronoun: *l'ho vista* (I saw her — *vista* agrees with the feminine *la*). This agreement is obligatory in formal writing, optional in informal speech.",
  },
  {
    level: "A2",
    slug: "passato-prossimo-essere",
    title: "Passato Prossimo with Essere",
    summary:
      "Intransitive verbs of motion, change of state, and all reflexive verbs form the passato prossimo with essere. The past participle agrees with the subject in gender and number.",
    body: "**Formation**: essere (present) + past participle with full agreement: *sono andato/a, sei venuto/a, è partito/a, siamo arrivati/e, siete tornati/e, sono rimasti/e*. Examples: *Maria è andata*, *i ragazzi sono andati*, *le ragazze sono andate*.\n\nKey **essere verbs** to memorise: *andare, venire, partire, arrivare, tornare, entrare, uscire, salire, scendere, nascere, morire, restare, rimanere, stare*, and *essere* itself. All **reflexive verbs** also take *essere* in compound tenses: *mi sono alzato/a* (I got up).\n\nA practical test: if the verb can take a direct object (*ho mangiato la pizza*), it almost certainly takes *avere*. If it describes motion or state change with no direct object (*sono andato a Roma*), it likely takes *essere*. Some verbs — *correre, salire, scendere* — take either auxiliary depending on context: *ho corso cinque chilometri* (avere, transitive) vs *sono corso a casa* (essere, intransitive).",
  },
  {
    level: "A2",
    slug: "imperfetto",
    title: "Imperfetto — the descriptive past",
    summary:
      "The imperfetto describes past states, habits, ongoing actions, and background settings. It is characterised by its striking regularity and soft, continuous quality.",
    body: "**Formation**: remove the infinitive ending to get the stem (*parl-*, *cred-*, *dorm-*), then add: **-avo, -avi, -ava, -avamo, -avate, -avano** (-are); **-evo, -evi, -eva, -evamo, -evate, -evano** (-ere); **-ivo, -ivi, -iva, -ivamo, -ivate, -ivano** (-ire). Even most 'irregular' verbs follow this pattern with a longer stem: *fare → fac-evo*, *bere → bev-evo*, *dire → dic-evo*, *essere → er-o, er-i, er-a, er-avamo, er-avate, er-ano*.\n\nUse the imperfetto for: **repeated past habits** (*da bambino, guardavo sempre i cartoni animati*); **ongoing background states** (*pioveva*); **descriptions** (*la casa era piccola*); **parallel ongoing actions** with *mentre* (*mentre lui studiava, io cucinavo*); and **polite present requests** (*volevo un caffè, per favore*).\n\nThink of a film: the **imperfetto** paints the scenery and ongoing action while the **passato prossimo** marks the plot events. *Stavo leggendo* (setting) *quando il telefono ha suonato* (event).",
  },
  {
    level: "A2",
    slug: "futuro-semplice",
    title: "Futuro Semplice — the simple future",
    summary:
      "The futuro semplice expresses future events, predictions, and polite conjecture. It is formed from the infinitive with a modified stem.",
    body: "**Formation**: take the infinitive, drop the final -e, change -are to -er-, then add the endings **-ò, -ai, -à, -emo, -ete, -anno**: *parlerò, parlerai, parlerà, parleremo, parlerete, parleranno*. **Essere**: *sarò, sarai, sarà, saremo, sarete, saranno*. **Avere**: *avrò, avrai, avrà, avremo, avrete, avranno*.\n\nCommon **irregular future stems** (endings are regular): *fare → farò*, *dire → dirò*, *bere → berrò*, *venire → verrò*, *volere → vorrò*, *potere → potrò*, *dovere → dovrò*, *andare → andrò*, *vedere → vedrò*, *sapere → saprò*.\n\nItalian often uses the **present tense** for near-future events (*domani vado a Roma*). The futuro is preferred for distant or uncertain events and for **conjecture about the present**: *Quanti anni ha?* — *Avrà trent'anni* (he must be about thirty). After *quando, appena, se* in future contexts, Italian uses the future where English uses the present: *Quando arriverai, ti chiamo*.",
  },
  {
    level: "A2",
    slug: "modal-verbs",
    title: "Modal Verbs: dovere, potere, volere",
    summary:
      "The three main Italian modal verbs express obligation, ability/permission, and desire. They are used with an infinitive and have irregular present forms.",
    body: "**Dovere** (must/to have to): *devo, devi, deve, dobbiamo, dovete, devono*. Expresses obligation or necessity: *devo studiare*. Conditional: *dovrei* (I should).\n\n**Potere** (can/to be able to): *posso, puoi, può, possiamo, potete, possono*. Expresses ability or permission: *puoi aiutarmi?*. Also used in polite requests: *posso aprire la finestra?* Conditional: *potrei* (I could).\n\n**Volere** (to want): *voglio, vuoi, vuole, vogliamo, volete, vogliono*. Expresses desire: *voglio dormire*. Conditional: *vorrei* (I would like) — the essential polite form for ordering in restaurants and shops.\n\nIn compound tenses, modals take either **avere** or **essere** depending on the verb that follows: *ho dovuto lavorare* (transitive → avere) but *sono dovuto/a andare* (intransitive essere verb → essere). In informal Italian, *avere* is increasingly used with all modals.",
  },
  {
    level: "A2",
    slug: "reflexive-verbs",
    title: "Reflexive Verbs & Daily Routines",
    summary:
      "Italian reflexive verbs use reflexive pronouns to indicate that the action reflects back on the subject. They are very common for daily-routine vocabulary.",
    body: "**Reflexive pronouns**: *mi* (myself), *ti* (yourself), *si* (himself/herself), *ci* (ourselves), *vi* (yourselves), *si* (themselves). They are placed directly before the conjugated verb: *mi sveglio* (I wake up), *ti alzi* (you get up), *si veste* (she gets dressed), *ci laviamo*, *vi divertite*, *si addormentano*.\n\nMany daily-routine verbs are reflexive in Italian where English is not: *svegliarsi, alzarsi, lavarsi, vestirsi, pettinarsi, truccarsi, radersi, addormentarsi, riposarsi, divertirsi, chiamarsi*.\n\nIn **compound tenses**, reflexive verbs always take **essere**, and the past participle agrees with the subject: *Maria si è alzata alle sette*, *i bambini si sono addormentati*. In the infinitive, the reflexive pronoun attaches to the end after dropping the final **-e**: *alzar**si***, *vestir**si***. With modal verbs, the pronoun can precede the modal or attach to the infinitive: *si deve alzare* = *deve alzarsi*.",
  },
  {
    level: "A2",
    slug: "direct-object-pronouns",
    title: "Direct Object Pronouns",
    summary:
      "Direct object pronouns replace the direct object of a sentence, agreeing in gender and number with the noun they replace. They are placed before the conjugated verb.",
    body: "The direct object pronouns are: *mi* (me), *ti* (you, informal), *lo* (him/it masc.), *la* (her/it fem./formal you), *ci* (us), *vi* (you pl.), *li* (them masc.), *le* (them fem.). They **elide** before a vowel or h: *l'ho visto*.\n\n**Position**: before the conjugated verb (*lo vedo* — I see him) or attached to the end of infinitives, gerunds, and imperatives (*voglio vederlo, vedendolo, guardalo!*). With modal + infinitive, the pronoun can precede the modal or attach: *lo voglio vedere = voglio vederlo*.\n\nIn the **passato prossimo** and all compound tenses with avere, the past participle **agrees** with a preceding direct-object pronoun: *ho visto Maria → l'ho vista* (-a agrees with the feminine *la*); *ho comprato i libri → li ho comprati*. This agreement is obligatory in formal writing. The most important agreement to remember: *l'ho vista / vista / visti / viste* depending on what *l'* replaces.",
  },

  // ─── B1 ──────────────────────────────────────────────────────────────────
  {
    level: "B1",
    slug: "pp-vs-imperfetto",
    title: "Passato Prossimo vs Imperfetto",
    summary:
      "The choice between passato prossimo and imperfetto is one of the most important distinctions in Italian narrative. They are complementary, not interchangeable.",
    body: "Think of a past narrative as a film: the **imperfetto** is the continuous background — scenery, weather, states, habits, and ongoing actions — while the **passato prossimo** marks the discrete events that advance the plot. *Era una bella giornata* (imperf.) *quando ho incontrato un vecchio amico* (PP).\n\nKey **imperfetto** triggers: ongoing state (*ero stanco*), repeated/habitual action (*ogni estate andavo al mare*), background description (*il sole tramontava*), simultaneous continuous actions with *mentre*, age (*aveva vent'anni*), time (*erano le tre*), and indirect-speech framing (*ha detto che voleva uscire*).\n\nKey **passato prossimo** triggers: completed event at a specific moment (*ieri ho mangiato*), sudden interruption (*stavo leggendo quando ha telefonato*), a sequence of plot events (*sono entrato, ho preso il libro, ho cominciato a leggere*), and an event of limited, finished duration (*ha vissuto a Roma per due anni* — he lived there and has now moved). Regional note: in the North, PP is used for all past events; in the South and literary contexts, passato remoto often replaces PP.",
  },
  {
    level: "B1",
    slug: "indirect-object-pronouns",
    title: "Indirect Object Pronouns",
    summary:
      "Indirect object pronouns replace the indirect object (usually introduced by a or per + person). They are essential for verbs of giving, telling, and communication.",
    body: "The indirect pronouns are: *mi* (to me), *ti* (to you), *gli* (to him), *le* (to her / formal you), *ci* (to us), *vi* (to you pl.), *gli* (to them — standard modern Italian; *loro* after the verb is more formal). Note: *gli* serves for both masculine singular (to him) and plural (to them).\n\nCommon verbs requiring indirect objects: *dare, dire, chiedere, mandare, portare, mostrare, offrire, spiegare, rispondere, telefonare, scrivere, piacere*. Examples: *gli ho detto la verità* (I told him the truth), *le ho mandato un messaggio*.\n\n**Combined (double) pronouns**: when both direct and indirect pronouns appear together, the indirect comes first and changes form: *mi → me, ti → te, gli/le → glie-, ci → ce-, vi → ve-*. The two fuse into one word: *me lo dai?* (will you give it to me?), *glielo spiego* (I'll explain it to him/her/them). With *glie-*, both pronouns always merge: *glielo, gliela, glieli, gliele*.",
  },
  {
    level: "B1",
    slug: "congiuntivo-presente",
    title: "Congiuntivo Presente — present subjunctive",
    summary:
      "The congiuntivo is used in subordinate clauses after expressions of opinion, doubt, wish, and emotion, and after certain conjunctions. It signals subjectivity or uncertainty.",
    body: "**Formation**: -are verbs take -e endings (*parli, parli, parli, parliamo, parliate, parlino*); -ere and -ire verbs take -a endings (*scriva, scriva, scriva, scriviamo, scriviate, scrivano*). Note that the first three singular persons are identical — a subject pronoun or context clarifies who is meant.\n\nKey irregular congiuntivos: *essere → sia, sia, sia, siamo, siate, siano*; *avere → abbia*; *fare → faccia*; *dire → dica*; *venire → venga*; *andare → vada*; *potere → possa*; *volere → voglia*; *sapere → sappia*.\n\n**Triggers**: verbs of **opinion** (*penso/credo che*), **wish** (*voglio/spero che*), **emotion** (*sono felice/triste che*), **necessity** (*è necessario che, bisogna che*), **possibility** (*è possibile che*), and **conjunctions** (*benché, sebbene, affinché, prima che, a meno che*). Crucial rule: the subjects of the main and subordinate clause must be **different** — same-subject constructions use the infinitive (*voglio andare*, not *voglio che io vada*).",
  },
  {
    level: "B1",
    slug: "condizionale",
    title: "Condizionale Presente — would",
    summary:
      "The condizionale presente expresses hypothetical situations, polite requests, and the apodosis of if-then sentences. It corresponds to English would.",
    body: "**Formation**: take the same modified stem used for the future, then add the endings **-ei, -esti, -ebbe, -emmo, -este, -ebbero**: *parlerei, parleresti, parlerebbe, parleremmo, parlereste, parlerebbero*. Irregular verbs use the same irregular future stems: *farei, direi, berrei, verrei, vorrei, potrei, dovrei, andrei, vedrei, sarei, avrei*.\n\n**Uses**: (1) **Polite requests and offers** — *vorrei un caffè; potrebbe chiudere la porta?* (2) **Hypothetical present/future** (apodosis of Type 2 conditionals) — *se avessi tempo, viaggerei di più*. (3) **Reported speech** for future-in-the-past — *ha detto che sarebbe venuto*. (4) **Cautious personal opinion** — *direi che hai ragione*.\n\nThe if-clause (protasis) of a Type 2 hypothetical uses **congiuntivo imperfetto** (*se + imperf. subj.*), while the result clause uses condizionale presente: *se potessi, lo farei*. Mastering this pairing is one of the hallmarks of intermediate–upper intermediate Italian.",
  },
  {
    level: "B1",
    slug: "relative-pronouns",
    title: "Relative Pronouns: che, cui, il quale",
    summary:
      "Italian relative pronouns link a subordinate clause to its antecedent. The main pronouns are che (subject/direct object), cui (after a preposition), and il quale (with full article agreement).",
    body: "**Che** is invariable and covers both subject and direct-object relatives: *il libro che ho letto* (the book that I read — object) and *la ragazza che studia* (the girl who studies — subject). **Che** cannot follow a preposition.\n\n**Cui** follows prepositions and is invariable: *la persona con cui lavoro* (the person I work with), *il motivo per cui sono qui* (the reason why I'm here). With the preposition **a**, *cui* can optionally take the article to express possession: *il ragazzo (a) cui ho dato il libro* or, more formally, *il ragazzo il cui libro* (the boy whose book).\n\n**Il quale / la quale / i quali / le quali** agrees in gender and number with its antecedent and can follow prepositions. It is used in formal registers and when ambiguity would arise from having two nouns of different gender near a relative clause: *la sorella di Marco, la quale abita a Milano,* makes it unambiguous that it is the sister who lives in Milan, not Marco.",
  },
  {
    level: "B1",
    slug: "gerundio",
    title: "Gerundio & Stare + Gerundio",
    summary:
      "The gerundio is an invariable verb form used for ongoing actions and manner, and with stare it forms a progressive construction equivalent to English to be doing.",
    body: "**Formation**: -are → **-ando** (*parlando*); -ere and -ire → **-endo** (*scrivendo, partendo*). Irregular gerunds: *fare → facendo*, *bere → bevendo*, *dire → dicendo*, *essere → essendo*, *avere → avendo*.\n\n**Stare + gerundio** (progressive): expresses an action in progress at the moment of speaking: *sto mangiando* (I am eating), *stava dormendo* (he was sleeping). It is more emphatic than the simple present or imperfetto for 'right now' actions and is very common in spoken Italian.\n\nThe gerund alone expresses **simultaneous manner or condition**: *camminando, ho trovato un portafoglio* (while walking, I found a wallet); *essendo stanco, sono andato a letto presto*. Object and reflexive pronouns attach to the gerund: *alzandosi, vedendola*. Important: the gerund always shares its implied subject with the main clause — it cannot dangle the way English participial phrases sometimes do.",
  },
  {
    level: "B1",
    slug: "prepositions",
    title: "Key Prepositions & Articulated Forms",
    summary:
      "Italian has a small set of core simple prepositions that contract with definite articles to form articulated prepositions (preposizioni articolate). Mastering these combinations is essential for fluency.",
    body: "The six main simple prepositions that combine with articles are **di, a, da, in, su** (and *con* informally). The combinations follow a regular pattern with *il, lo, la, l', i, gli, le*:\n\n**Di + il = del**, *dello, della, dell', dei, degli, delle*. **A + il = al**, *allo, alla, all', ai, agli, alle*. **Da + il = dal**, *dallo, dalla, dall', dai, dagli, dalle*. **In + il = nel**, *nello, nella, nell', nei, negli, nelle*. **Su + il = sul**, *sullo, sulla, sull', sui, sugli, sulle*.\n\nKey usage: **di** expresses possession (*il libro di Maria*), origin (*sono di Roma*), and content (*un bicchiere di vino*). **A** marks destination (*vado a Roma*), indirect object (*a te*), and time (*a mezzogiorno*). **Da** marks origin (*vengo da Milano*), agent in passive (*scritto da Dante*), and duration (*studio italiano da tre anni* — I have been studying for three years). **In** is used with rooms, countries without article, and means of transport (*in macchina, in Italia*). **Su** means on, about, or approximately (*un libro su Dante; ha sui cinquant'anni*).",
  },

  // ─── B2 ──────────────────────────────────────────────────────────────────
  {
    level: "B2",
    slug: "congiuntivo-passato-imperfetto",
    title: "Congiuntivo Passato & Imperfetto",
    summary:
      "The past subjunctive (congiuntivo passato) and the imperfect subjunctive (congiuntivo imperfetto) express past subjective content and are essential for complex sentences.",
    body: "**Congiuntivo passato** (present subjunctive of essere/avere + past participle): expresses a past event from the perspective of a present-tense main clause. *Penso che sia andato* (I think he has gone), *sono contenta che tu abbia capito*.\n\n**Congiuntivo imperfetto** formation — -are: *-assi, -assi, -asse, -assimo, -aste, -assero*; -ere: *-essi, -essi, -esse, -essimo, -este, -essero*; -ire: *-issi, -issi, -isse, -issimo, -iste, -issero*. Key irregulars: *essere → fossi*; *avere → avessi*; *fare → facessi*; *dare → dessi*; *stare → stessi*. Used when the main verb is in the past or conditional: *pensavo che fosse lì, volevo che tu venissi*.\n\n**Tense sequencing** (concordanza dei tempi): main verb present/future → subjunctive uses congiuntivo presente or passato; main verb past/conditional → subjunctive uses congiuntivo imperfetto or trapassato. Mastering this sequencing rule is the gateway to C1 Italian.",
  },
  {
    level: "B2",
    slug: "condizionale-passato",
    title: "Condizionale Passato & Hypothetical Sentences",
    summary:
      "The condizionale passato (would have) completes the Italian hypothetical system. Combined with the congiuntivo trapassato, it forms the Type 3 counterfactual conditional.",
    body: "**Formation**: conditional of essere/avere + past participle. *Avrei parlato* (I would have spoken), *sarei andato/a* (I would have gone), *avrebbe fatto*, *saremmo venuti*. Auxiliary choice follows the same rules as passato prossimo.\n\n**Type 3 (past counterfactual) hypothetical**: *se + congiuntivo trapassato … condizionale passato*. *Se avessi studiato, avrei superato l'esame*. *Se fosse arrivata in tempo, non avremmo perso il treno*.\n\n**Mixed hypotheticals** are also possible: *se avessi studiato (past), oggi saprei tutto (present)* — if I had studied then, today I would know everything. The condizionale passato also appears in reported speech for a future event seen from a past reference point: *ha detto che sarebbe arrivato alle sei* (he said he would arrive at six).",
  },
  {
    level: "B2",
    slug: "passive-voice",
    title: "Passive Voice — essere, venire, andare + si",
    summary:
      "Italian has several passive constructions. Essere + past participle is the standard form; venire replaces it for single dynamic actions; andare expresses obligation; si passivante is common in writing.",
    body: "**Essere + participle**: *il libro è scritto da Dante*. In compound tenses, essere is doubled: *il libro era stato scritto*. The participle agrees with the subject; the agent is introduced by **da**.\n\n**Venire** replaces *essere* in simple (non-compound) tenses to express a single dynamic action rather than a state: *la porta viene aperta* (the door gets opened) vs *la porta è aperta* (the door is open — state). *Venire* cannot be used in compound tenses.\n\n**Andare + participle** expresses obligation: *questo problema va risolto* (this problem must be resolved), *le istruzioni vanno seguite*. **Si passivante** uses *si + active verb*: *si parla italiano qui, si vendono appartamenti* (note plural agreement with the subject). In formal writing, journalism, and recipes, *si* passive is extremely common and often more natural than explicit *essere* passive.",
  },
  {
    level: "B2",
    slug: "discorso-indiretto",
    title: "Reported Speech — Discorso Indiretto",
    summary:
      "Reported speech requires changing verb tenses, pronouns, and time expressions when moving from direct to indirect quotation.",
    body: "**Introducing verbs**: *dire che, affermare che, spiegare che, chiedere se / dove / quando…, ordinare di + inf., chiedere di + inf.*\n\n**Tense shifts** when the reporting verb is in the past: direct present → indirect imperfetto (*'studio'* → *ha detto che studiava*); direct future → indirect condizionale (*'studierò'* → *ha detto che avrebbe studiato*); direct passato prossimo → indirect trapassato (*'ho studiato'* → *ha detto che aveva studiato*); direct imperative → indirect infinitive or congiuntivo imperfetto.\n\n**Deictic shifts**: *oggi → quel giorno*, *ieri → il giorno prima*, *domani → il giorno dopo*, *qui → lì*, *questo → quello*, pronouns shift to match the new speaker. Questions become indirect with *se* (yes/no) or the question word unchanged: *'Sei pronto?'* → *ha chiesto se ero pronto*; *'Dove vai?'* → *ha chiesto dove andassi* (congiuntivo imperfetto in formal written Italian).",
  },
  {
    level: "B2",
    slug: "indefinite-pronouns-adjectives",
    title: "Indefinite Pronouns & Adjectives",
    summary:
      "Indefinite pronouns and adjectives express unspecified quantity or identity. Some are invariable; others agree in gender and number with the noun.",
    body: "**Always singular and invariable**: *qualcuno* (someone), *nessuno* (no one — adj.: *nessun/nessuno/nessuna/nessun'*), *qualcosa* (something), *niente / nulla* (nothing), *ognuno* (everyone), *chiunque* (whoever/anyone), *ciascuno* (each one).\n\n**Variable forms** (agree with noun): *tutto/a/i/e* (all/everything), *molto/a/i/e* (much/many), *poco/a/chi/che* (little/few), *tanto/a/i/e* (so much/many), *troppo/a/i/e* (too much/many), *altro/a/i/e* (other), *certo/a/i/e* (certain), *stesso/a/i/e* (same), *diverso/a/i/e* (various).\n\n**Qualche** is always followed by a singular noun even with plural meaning: *qualche studente* (some students — singular construction), whereas *alcuni/alcune* is plural: *alcuni studenti*. **Ogni** is invariable with a singular noun: *ogni giorno*. **Qualsiasi/qualunque** (any/whatever) are invariable: *qualsiasi cosa tu dica*.",
  },
  {
    level: "B2",
    slug: "si-constructions",
    title: "Si Constructions — reflexive, impersonal, passive",
    summary:
      "The particle si has three distinct uses in Italian: reflexive, impersonal (one/you/people), and passive. Context and verb form determine which reading applies.",
    body: "**Reflexive si**: third-person reflexive pronoun for singular (*si lava* — he washes himself) and plural (*si lavano*). This is the standard reflexive you learned with daily-routine verbs.\n\n**Impersonal si**: *si + 3rd sing. verb* when there is no specific subject — 'one does something', 'people do something': *in Italia si mangia bene, si studia molto qui*. With a predicate adjective, the adjective takes masculine plural: *quando si è giovani* (even if all speakers are female). In compound tenses, impersonal si always takes **essere**: *si è mangiato bene*.\n\n**Si passivante**: *si + active verb agreeing with the grammatical object*: *si vendono case* (plural agreement), *si vende una casa* (singular). The key diagnostic: impersonal si has no object driving agreement; si passivante does. In practice, the two constructions overlap and native speakers often use them interchangeably in informal speech, but formal writing requires the distinction.",
  },

  // ─── C1 ──────────────────────────────────────────────────────────────────
  {
    level: "C1",
    slug: "congiuntivo-trapassato",
    title: "Congiuntivo Trapassato — the pluperfect subjunctive",
    summary:
      "The congiuntivo trapassato expresses a past subjunctive action that preceded another past action. It is the most distant tense in the subjunctive sequence and essential for past counterfactuals.",
    body: "**Formation**: congiuntivo imperfetto of essere/avere + past participle. *Avessi parlato* (I had spoken), *fosse andato/a* (he/she had gone), *avessimo finito*, *fossero partiti*.\n\nUsed in subordinate clauses depending on a past or conditional main verb when the subordinate action is **anterior**: *pensavo che avesse già finito* (I thought he had already finished), *era impossibile che fosse arrivato così presto*.\n\nIt is the essential element of **Type 3 (past counterfactual) hypotheticals**: *se avessi saputo (cong. trap.), te lo avrei detto (cond. pass.)* — if I had known, I would have told you. The four-way tense system (presente, passato, imperfetto, trapassato) allows Italian to express very fine temporal distinctions within the subjunctive mood — a level of precision that sets C1 Italian apart from B-level production.",
  },
  {
    level: "C1",
    slug: "participio-uses",
    title: "Participio Passato — adjective, clause, and absolute uses",
    summary:
      "Beyond compound tenses, the past participle functions as an adjective and, in absolute participial clauses, as a compact literary substitute for a subordinate clause.",
    body: "**Adjectival use**: the participio passato agrees like any adjective: *una porta chiusa, le finestre aperte, un uomo stanco*. Many Italian adjectives are etymologically past participles.\n\n**Participial clause as reduced subordinate**: the participio can replace a full clause when subjects are co-referential, typically for time, reason, or completion. *Finito il lavoro, siamo andati a casa* (Having finished the work, we went home). *Arrivati i turisti, il tour è cominciato*. These constructions are more formal and literary.\n\n**Absolute participial clause**: when the participle has its **own logical subject** (different from the main clause subject), it forms an absolute construction parallel to the Latin ablative absolute: *Firmato il contratto dagli avvocati, l'affare fu concluso* (The contract having been signed by the lawyers, the deal was concluded). This construction is a hallmark of formal written Italian — journalistic, legal, and literary texts deploy it frequently to achieve compactness.",
  },
  {
    level: "C1",
    slug: "subjunctive-advanced",
    title: "Advanced Subjunctive Contexts",
    summary:
      "Beyond the standard triggers, the subjunctive appears in idiomatic, formal, and literary constructions that extend comprehension and production significantly.",
    body: "**Independent (optative) subjunctive**: in main clauses for wishes, commands to third parties, or set expressions: *Che tu sia felice!* (May you be happy!), *Che venga pure* (Let him come), *Sia lodato Dio* (formulaic).\n\n**Concessive and conditional conjunctions**: *benché, sebbene, nonostante, malgrado* (although) + subj.; *a meno che (non)* (unless) + subj.; *purché, a patto che* (provided that) + subj.; *prima che* (before) + subj.; *affinché, perché* (so that, purpose) + subj. — note that *perché + indicative* = 'because' but *perché + subjunctive* = 'in order that'.\n\n**Relative clauses with subjunctive**: after superlatives (*è il migliore che io conosca*), negatives (*non c'è nessuno che lo sappia*), and indefinite antecedents expressing uncertain existence (*cerco qualcuno che parli russo*). Mastering these patterns — and understanding **tense sequencing** (concordanza dei tempi) — is the defining achievement of C1 Italian grammar.",
  },
  {
    level: "C1",
    slug: "trapassato-prossimo",
    title: "Trapassato Prossimo — the pluperfect",
    summary:
      "The trapassato prossimo expresses an action completed before another past action or reference point. Formed with the imperfect of essere or avere plus the past participle.",
    body: "**Formation**: imperfetto of essere/avere + past participle. *Avevo mangiato* (I had eaten), *era andato/a* (he/she had gone), *avevamo parlato*, *erano partiti/e*. Auxiliary choice and participle agreement follow the same rules as passato prossimo.\n\nPrimarily used to mark that one past action **preceded** another: *quando sono arrivato, lui era già uscito* (when I arrived, he had already left); *non avevo mai visto niente di simile*; *dopo che aveva finito di mangiare, è uscito*.\n\nIn **reported speech**, direct passato prossimo becomes trapassato when the reporting verb is in the past: *'ho finito'* → *ha detto che aveva finito*. In **literary narration**, the trapassato pairs with passato remoto as the baseline tense: *appena ebbe finito, uscì* (trapassato remoto — rare, literary); *quando era arrivato, la festa era già cominciata* (trapassato prossimo — standard).",
  },
  {
    level: "C1",
    slug: "register-and-formality",
    title: "Register, Formality & Stylistic Variation",
    summary:
      "Register in Italian ranges from colloquial and dialectal through standard spoken to formal written. Understanding these registers is key to sounding natural and appropriate.",
    body: "**Address forms**: the divide between **tu** (informal singular), **Lei** (formal singular, 3rd-person verb forms), **voi** (informal/regional plural), and **Loro** (very formal plural, increasingly archaic) marks social distance. In business, new acquaintances, and official contexts, *Lei* is standard. Among students and peers, *tu* is universal.\n\n**Lexical register contrasts**: formal/written *tuttavia, nondimeno, pertanto, affinché, qualora, laddove* vs colloquial *però, allora, quindi, così che, se, dove*. Spoken Italian frequently uses **che** as a catch-all conjunction (*vieni, che fa freddo* — come inside, it's cold), whereas formal writing specifies the exact subordination type.\n\n**Syntactic markers of formal register**: passato remoto instead of passato prossimo in written narrative; nominalization (*la realizzazione del progetto* rather than *quando hanno realizzato il progetto*); participial and infinitival clauses instead of finite subordinates; avoidance of cleft sentences and left dislocations (*di lui non mi fido* — natural in speech, avoided in formal prose). Developing sensitivity to these contrasts marks the transition from B2 to C1 proficiency.",
  },
  {
    level: "C1",
    slug: "complex-sentence-structures",
    title: "Complex Sentence Structures",
    summary:
      "C1 Italian involves mastering multi-clause sentences with layered subordination, topicalization, cleft constructions, and pragmatic inversion.",
    body: "**Left dislocation** (dislocazione a sinistra): a topic is placed at the start and co-referenced by a pronoun inside the clause: *il caffè, lo prendo sempre amaro*. Very common in spoken Italian; gives the topic prominence without the marked feel of formal passive or cleft.\n\n**Cleft sentences** (*frase scissa*): *è Giovanni che ha vinto* (focus on agent); *è ieri che l'ho visto* (focus on time). The cleft splits a simple sentence to highlight one constituent. **Pseudo-cleft**: *è quello che voglio; quello che mi piace è la pasta*.\n\n**Correlatives**: *tanto … quanto* (as much … as), *non solo … ma anche* (not only … but also), *sia … che* (both … and), *o … o* (either … or), *né … né* (neither … nor). Mastering correlatives and cleft constructions gives writing a sophisticated, balanced texture that clearly distinguishes C1 production from upper-B2.",
  },

  // ─── C2 ──────────────────────────────────────────────────────────────────
  {
    level: "C2",
    slug: "literary-tenses",
    title: "Literary Tenses — passato remoto & beyond",
    summary:
      "The passato remoto is the narrative tense of written literature, historical texts, and Southern Italian speech. It expresses completed past events with no connection to the present.",
    body: "**Formation** (highly irregular for many common verbs): regular patterns: -are → *-ai, -asti, -ò, -ammo, -aste, -arono*; -ere → *-ei/-etti, -esti, -é/-ette, -emmo, -este, -erono/-ettero*; -ire → *-ii, -isti, -ì, -immo, -iste, -irono*. Key irregulars (learn 1st/3rd sing. + 3rd pl.): *essere → fui, fu, furono*; *avere → ebbi, ebbe, ebbero*; *fare → feci, fece, fecero*; *dire → dissi*; *vedere → vidi*; *venire → venni*; *tenere → tenni*; *sapere → seppi*.\n\n**Distribution**: in Central-Northern Italy and standard written Italian, passato remoto is used for psychologically distant past events — historical facts, biography, literature: *Dante nacque nel 1265*. In Southern Italy (south of Rome), passato remoto covers all completed past events including yesterday: *ieri mangiai bene*.\n\n**Trapassato remoto**: avere/essere in passato remoto + past participle (*ebbi finito, fu arrivato*). Rare, literary, used in time clauses to mark an action immediately preceding another passato remoto event: *appena ebbe finito, uscì*.",
  },
  {
    level: "C2",
    slug: "nominalization",
    title: "Nominalization & Abstract Register",
    summary:
      "Nominalisation — turning verbs and adjectives into nouns — is a hallmark of formal Italian writing, creating the dense, abstract prose typical of academic, legal, and bureaucratic registers.",
    body: "**Common nominalisation patterns**: the infinitive as noun (*il sapere*, knowledge; *il vivere bene*, the good life); verbal nouns with **-zione** (*realizzare → realizzazione*, *presentare → presentazione*), **-mento/-imento** (*migliorare → miglioramento*, *trattare → trattamento*), **-tura** (*leggere → lettura*); adjective-to-noun with **-ezza** (*bella → bellezza*) and **-ità** (*vero → verità*).\n\nNominalised constructions replace finite subordinate clauses, creating longer noun phrases: *l'approvazione del progetto da parte del consiglio* instead of *il fatto che il consiglio abbia approvato il progetto*. This compression is valued in formal writing but can obscure agency — it is not always clear who performed the action.\n\n**Stylistic advice**: C2 writers should deploy nominalisation deliberately, not reflexively. Over-nominalised prose (*la problematizzazione della questione della sostenibilità*) becomes opaque. The best formal Italian alternates dense noun-heavy phrases with clear, active-verb sentences for rhythm and readability.",
  },
  {
    level: "C2",
    slug: "discourse-connectors",
    title: "Discourse Connectors & Text Cohesion",
    summary:
      "Sophisticated Italian writing uses a precise set of discourse connectors to signal logical relationships between clauses and paragraphs — well beyond simple e, ma, perché.",
    body: "**Additive**: *inoltre* (furthermore), *altresì* (likewise — formal), *peraltro* (moreover/on the other hand), *d'altronde* (on the other hand), *anche, pure, persino/perfino* (even).\n\n**Adversative/concessive**: *tuttavia, nondimeno, ciononostante* (nonetheless), *eppure* (and yet — emotive), *bensì* (but rather — formal correction), *senonché* (except that/but then), *nonostante ciò* (despite this).\n\n**Causal/consecutive**: *pertanto, quindi, dunque, di conseguenza, per questo motivo* (therefore/consequently); *poiché, giacché, siccome* (since/because — formal, precede the main clause); *dato che, visto che* (given that). **Temporal/sequential**: *innanzitutto, anzitutto* (first of all), *successivamente* (subsequently), *infine* (finally), *nel frattempo* (in the meantime). **Reformulative**: *ovvero, ossia, vale a dire* (that is to say), *in altre parole*, *in sintesi*. Developing a varied repertoire of these connectors — and using them accurately — is a key marker of C2 prose competence.",
  },
  {
    level: "C2",
    slug: "pragmatics-and-style",
    title: "Pragmatics, Implicature & Stylistic Choices",
    summary:
      "C2 competence means understanding not just what a sentence means but what it does — how word order, modal particles, and indirect speech acts create meaning beyond the literal.",
    body: "**Implicature and indirectness**: Italian directness varies regionally, but certain patterns are widespread. *Perché non vieni?* is often an invitation rather than a genuine question. *Non è che…* (*non è che sai dove sia…?* — you wouldn't happen to know?) introduces polite requests as half-questions. *Dovresti sapere che…* (you should know that…) carries reproach.\n\n**Focus and information structure**: Italian uses word order flexibly to manage given vs new information. Sentence-final position is the information focus: *ho visto Marco* (neutral) vs *Marco l'ho visto io* (focus on subject — it was I who saw Marco) vs *l'ho visto ieri, Marco* (right-dislocation, afterthought). Understanding these patterns is essential for sophisticated reading and natural writing.\n\n**Modal particles and hedging**: *magari* (perhaps/I wish), *mica* (not at all — colloquial negation or softer denial: *non è mica vero* — that's not actually true), *pure* (go ahead/even — *fai pure*), *già* (acknowledging or conceding), *certo* (of course, but also mild concession — *certo, però…*). These particles are everywhere in spoken Italian and literary dialogue — mastering them marks the final step from very advanced to natively fluent Italian.",
  },
];
