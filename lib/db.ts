import { supabase } from "./supabase";
import type { AnalysisResponse } from "./api";
import type {
  Analysis,
  Vocabulary,
  DailyGoal,
  Achievement,
  UserAchievement,
  FeedbackCategory,
  SentenceFeedback,
} from "./database.types";

export const XP_REWARDS = {
  ANALYSIS: 10,
  FIRST_ANALYSIS_OF_DAY: 20,
  STREAK_BONUS: 5,
  SAVE_VOCABULARY: 5,
  COMPLETE_DAILY_GOAL: 50,
  ACHIEVEMENT_UNLOCK: 100,
} as const;

export const XP_PER_LEVEL = [
  0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000,
];

export function calculateLevel(xp: number): number {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) return i + 1;
  }
  return 1;
}

export function xpForNextLevel(level: number): number {
  return XP_PER_LEVEL[level] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1] * 2;
}

export function xpProgress(xp: number, level: number): number {
  const currentLevelXp = XP_PER_LEVEL[level - 1] || 0;
  const nextLevelXp =
    XP_PER_LEVEL[level] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1] * 2;
  return ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// === ANALYSIS HISTORY ===

export async function saveAnalysis(
  userId: string,
  analysis: AnalysisResponse
): Promise<string> {
  const { data, error } = await db
    .from("analyses")
    .insert({
      user_id: userId,
      text: analysis.metadata.text,
      language: analysis.metadata.language,
      translation: analysis.pedagogical_data?.translation || null,
      nodes: analysis.nodes as unknown as Record<string, unknown>,
      pedagogical_data:
        (analysis.pedagogical_data as unknown as Record<string, unknown>) ||
        null,
      difficulty_level: analysis.difficulty?.level || null,
      difficulty_score: analysis.difficulty?.score || null,
      is_favorite: false,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function getRecentAnalyses(
  userId: string,
  limitCount: number = 20
): Promise<Analysis[]> {
  const { data, error } = await db
    .from("analyses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limitCount);

  if (error) throw error;
  return data || [];
}

export async function getFavoriteAnalyses(
  userId: string
): Promise<Analysis[]> {
  const { data, error } = await db
    .from("analyses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_favorite", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function toggleFavoriteAnalysis(
  analysisId: string,
  isFavorite: boolean
) {
  const { error } = await db
    .from("analyses")
    .update({ is_favorite: isFavorite })
    .eq("id", analysisId);

  if (error) throw error;
}

export async function deleteAnalysis(analysisId: string) {
  const { error } = await db
    .from("analyses")
    .delete()
    .eq("id", analysisId);

  if (error) throw error;
}

// === VOCABULARY ===

export type SaveVocabularyResult =
  | { status: "saved"; id: string }
  | { status: "duplicate" };

export async function saveVocabularyFromAnalyzer(
  userId: string,
  params: {
    word: string;
    lemma: string;
    language: string;
    part_of_speech: string | null;
    context: string;
    analysis_id?: string | null;
    /** Sentence-level gloss from analysis (improves review cards). */
    translation?: string | null;
  }
): Promise<SaveVocabularyResult> {
  const { data: existing } = await db
    .from("vocabulary")
    .select("id")
    .eq("user_id", userId)
    .eq("lemma", params.lemma)
    .eq("language", params.language)
    .maybeSingle();

  if (existing) return { status: "duplicate" };

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await db
    .from("vocabulary")
    .insert({
      user_id: userId,
      word: params.word,
      lemma: params.lemma,
      language: params.language,
      part_of_speech: params.part_of_speech,
      context: params.context,
      analysis_id: params.analysis_id ?? null,
      translation: params.translation?.trim() || null,
      mastery: 0,
      ease_factor: 2.5,
      interval_days: 0,
      next_review: today,
      review_count: 0,
    })
    .select("id")
    .single();

  if (error) throw error;
  return { status: "saved", id: data.id };
}

export async function getVocabularyDueForReview(
  userId: string,
  language?: string | null
): Promise<Vocabulary[]> {
  const today = new Date().toISOString().split("T")[0];

  let query = db
    .from("vocabulary")
    .select("*")
    .eq("user_id", userId)
    .lte("next_review", today)
    .order("next_review", { ascending: true });

  if (language) {
    query = query.eq("language", language);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getVocabulary(
  userId: string,
  language?: string
): Promise<Vocabulary[]> {
  let query = db
    .from("vocabulary")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (language) {
    query = query.eq("language", language);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateVocabularyReview(
  vocabId: string,
  quality: number
) {
  const { data: vocab, error: fetchError } = await db
    .from("vocabulary")
    .select("*")
    .eq("id", vocabId)
    .single();

  if (fetchError) throw fetchError;

  let easeFactor = vocab.ease_factor;
  let interval = vocab.interval_days;
  let mastery = vocab.mastery;

  if (quality >= 3) {
    if (vocab.review_count === 0) {
      interval = 1;
    } else if (vocab.review_count === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    easeFactor =
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;
    mastery = Math.min(100, mastery + 10);
  } else {
    interval = 1;
    mastery = Math.max(0, mastery - 20);
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  const { error } = await db
    .from("vocabulary")
    .update({
      ease_factor: easeFactor,
      interval_days: interval,
      next_review: nextReview.toISOString().split("T")[0],
      last_reviewed: new Date().toISOString(),
      review_count: vocab.review_count + 1,
      mastery,
    })
    .eq("id", vocabId);

  if (error) throw error;
}

export async function getVocabularyReviewStats(
  userId: string,
  languageFilter?: string | null
): Promise<{ total: number; due: number; mastered: number }> {
  const today = new Date().toISOString().split("T")[0];

  let totalQ = db
    .from("vocabulary")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  let dueQ = db
    .from("vocabulary")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .lte("next_review", today);
  let masteredQ = db
    .from("vocabulary")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("mastery", 80);

  if (languageFilter) {
    totalQ = totalQ.eq("language", languageFilter);
    dueQ = dueQ.eq("language", languageFilter);
    masteredQ = masteredQ.eq("language", languageFilter);
  }

  const [{ count: total }, { count: due }, { count: mastered }] =
    await Promise.all([totalQ, dueQ, masteredQ]);

  return {
    total: total ?? 0,
    due: due ?? 0,
    mastered: mastered ?? 0,
  };
}

export async function getAnalysisCountSinceStartOfLocalDay(
  userId: string
): Promise<number> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const { count, error } = await db
    .from("analyses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", start.toISOString());

  if (error) throw error;
  return count ?? 0;
}

// === GAMIFICATION ===

export async function addXP(
  userId: string,
  amount: number
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
  const { data: user, error: fetchError } = await db
    .from("users")
    .select("xp, level")
    .eq("id", userId)
    .single();

  if (fetchError) throw fetchError;

  const newXP = user.xp + amount;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > user.level;

  const { error } = await db
    .from("users")
    .update({
      xp: newXP,
      level: newLevel,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;

  return { newXP, newLevel, leveledUp };
}

export async function incrementTotalAnalyses(userId: string) {
  const { data: user, error: fetchError } = await db
    .from("users")
    .select("total_analyses")
    .eq("id", userId)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await db
    .from("users")
    .update({
      total_analyses: user.total_analyses + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
}

// === DAILY GOALS ===

export async function getDailyGoal(
  userId: string
): Promise<DailyGoal | null> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await db
    .from("daily_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function setDailyGoal(
  userId: string,
  target: number
): Promise<DailyGoal> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await db
    .from("daily_goals")
    .upsert(
      {
        user_id: userId,
        date: today,
        target,
        completed: 0,
        is_achieved: false,
      },
      { onConflict: "user_id,date" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function incrementDailyGoalProgress(
  userId: string
): Promise<{ dailyGoal: DailyGoal | null; reachedGoal: boolean }> {
  const today = new Date().toISOString().split("T")[0];

  const { data: current, error: fetchError } = await db
    .from("daily_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") throw fetchError;
  if (!current) return { dailyGoal: null, reachedGoal: false };

  const wasAchieved = current.is_achieved;
  const newCompleted = current.completed + 1;
  const isAchieved = newCompleted >= current.target;

  const { data, error } = await db
    .from("daily_goals")
    .update({
      completed: newCompleted,
      is_achieved: isAchieved,
    })
    .eq("id", current.id)
    .select()
    .single();

  if (error) throw error;
  return {
    dailyGoal: data,
    reachedGoal: !wasAchieved && isAchieved,
  };
}

// === ACHIEVEMENTS ===

export async function getAchievements(): Promise<Achievement[]> {
  const { data, error } = await db
    .from("achievements")
    .select("*")
    .order("xp_reward", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getUserAchievements(
  userId: string
): Promise<UserAchievement[]> {
  const { data, error } = await db
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data || [];
}

function achievementRequirementMet(
  achievement: Achievement,
  profile: {
    total_analyses: number;
    streak: number;
    level: number;
  },
  vocabularyTotal: number
): boolean {
  const t = (achievement.requirement_type || "").toLowerCase();
  const v = achievement.requirement_value;
  if (v == null) return false;

  if (t.includes("analysis") || t === "analyses" || t === "total_analyses") {
    return profile.total_analyses >= v;
  }
  if (t.includes("streak")) {
    return profile.streak >= v;
  }
  if (t.includes("vocab") || t.includes("vocabulary") || t === "words") {
    return vocabularyTotal >= v;
  }
  if (t.includes("level")) {
    return profile.level >= v;
  }
  return false;
}

/** Evaluates definitions vs profile; inserts unlocks and awards XP per achievement. */
export async function syncAchievementsForUser(userId: string): Promise<{
  newlyUnlocked: Achievement[];
  leveledUpTo: number | null;
}> {
  const [achievements, userAchievements, profileRow, vocabCount] =
    await Promise.all([
      getAchievements(),
      getUserAchievements(userId),
      db
        .from("users")
        .select("total_analyses, streak, level")
        .eq("id", userId)
        .single(),
      db
        .from("vocabulary")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

  if (profileRow.error) throw profileRow.error;

  const profile = profileRow.data as {
    total_analyses: number;
    streak: number;
    level: number;
  };
  const unlockedIds = new Set(userAchievements.map((u) => u.achievement_id));
  const vocabularyTotal = vocabCount.count ?? 0;
  const newlyUnlocked: Achievement[] = [];
  let leveledUpTo: number | null = null;

  for (const a of achievements) {
    if (unlockedIds.has(a.id)) continue;
    if (!achievementRequirementMet(a, profile, vocabularyTotal)) continue;

    const { error: insErr } = await db.from("user_achievements").insert({
      user_id: userId,
      achievement_id: a.id,
    });

    if (insErr) continue;

    unlockedIds.add(a.id);
    const xp = a.xp_reward ?? XP_REWARDS.ACHIEVEMENT_UNLOCK;
    if (xp > 0) {
      const xpRes = await addXP(userId, xp);
      if (xpRes.leveledUp) {
        leveledUpTo = xpRes.newLevel;
        profile.level = xpRes.newLevel;
      }
    }
    newlyUnlocked.push(a);
  }

  return { newlyUnlocked, leveledUpTo };
}

export async function updateUserLearnLanguage(
  userId: string,
  languageCode: string
) {
  const { error } = await db
    .from("users")
    .update({
      learn_language: languageCode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
}

// === FEEDBACK ===

export async function submitFeedback(
  userId: string,
  analysisId: string,
  rating: number,
  category: FeedbackCategory,
  sentenceText: string,
  language: string,
  comment?: string
): Promise<string> {
  const { data, error } = await db
    .from("sentence_feedback")
    .insert({
      user_id: userId,
      analysis_id: analysisId,
      rating,
      category,
      comment: comment || null,
      sentence_text: sentenceText,
      language,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

// === RATE LIMITING ===

export async function checkRateLimit(
  userId: string
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const { data: profile } = await db
    .from("users")
    .select("is_pro, daily_sentence_limit")
    .eq("id", userId)
    .single();

  const isPro = profile?.is_pro ?? false;
  const limit = profile?.daily_sentence_limit ?? (isPro ? 1000 : 3);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await db
    .from("analyses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", today.toISOString());

  const used = count ?? 0;

  return { allowed: used < limit, used, limit };
}
