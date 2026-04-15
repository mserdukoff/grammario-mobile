import axios, { AxiosError } from "axios";
import { applyTrustedClientHeaders } from "./api-client-origin";
import { isInvalidStoredSessionError } from "./auth-session";
import { supabase } from "./supabase";

export interface AnalysisResponse {
  metadata: {
    text: string;
    language: string;
  };
  nodes: TokenNode[];
  pedagogical_data?: PedagogicalData;
  difficulty?: DifficultyInfo;
  grammar_errors?: RuleBasedError[];
  embedding?: number[];
}

export interface TokenNode {
  id: number;
  text: string;
  lemma: string;
  upos: string;
  xpos?: string;
  feats?: string;
  head_id: number;
  deprel: string;
  misc?: string;
  segments?: string[];
}

export interface GrammarConcept {
  name: string;
  description: string;
  related_words: string[];
}

export interface GrammarTip {
  word: string;
  question: string;
  explanation: string;
  rule?: string;
  examples?: string[];
}

export interface LLMGrammarError {
  word: string;
  error_type: string;
  correction?: string;
  explanation: string;
}

export interface PedagogicalData {
  translation: string;
  nuance?: string;
  concepts: GrammarConcept[];
  tips?: GrammarTip[];
  errors?: LLMGrammarError[];
}

export interface DifficultyInfo {
  level: string;
  score: number;
  features?: Record<string, number>;
}

export interface RuleBasedError {
  word: string;
  word_id: number;
  error_type: string;
  severity: string;
  message: string;
  correction?: string;
  rule?: string;
}

export interface UsageStats {
  used_today: number;
  limit: number;
  remaining: number;
  reset_at: number;
  is_pro: boolean;
}

export interface Language {
  code: string;
  name: string;
  native_name: string;
  family: string;
  sample: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  applyTrustedClientHeaders(config);
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error && isInvalidStoredSessionError(error)) {
    await supabase.auth.signOut({ scope: "local" });
  }
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  } else {
    console.warn("[API] No session/access_token — request will be sent without auth");
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (
    error: AxiosError<{
      detail?: string | { message?: string; error?: string };
    }>
  ) => {
    let message = "An error occurred";

    if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === "string") {
        message = error.response.data.detail;
      } else if (error.response.data.detail.message) {
        message = error.response.data.detail.message;
      }
    } else if (error.message) {
      message = error.message;
    }

    throw new ApiError(
      message,
      error.response?.status || 500,
      error.response?.data as Record<string, unknown>
    );
  }
);

export async function analyzeText(
  text: string,
  language: string
): Promise<AnalysisResponse> {
  const response = await api.post<AnalysisResponse>(
    "/analyze",
    { text, language },
    { timeout: 180000 }
  );
  return response.data;
}

export async function getUsage(): Promise<UsageStats> {
  const response = await api.get<UsageStats>("/usage");
  return response.data;
}

export async function getLanguages(): Promise<{ languages: Language[] }> {
  const response = await api.get<{ languages: Language[] }>("/languages");
  return response.data;
}

// === GRAMMAR REVIEWS ===

export interface GrammarConceptReview {
  id: string;
  user_id: string;
  topic_id?: string | null;
  concept_name?: string | null;
  concept_description?: string | null;
  concept_examples?: string[] | null;
  language?: string | null;
  level?: string | null;
  analysis_id?: string | null;
  mastery: number;
  ease_factor: number;
  interval_days: number;
  next_review: string;
  last_reviewed?: string | null;
  review_count: number;
  body?: string | null;
}

export interface GrammarReviewStats {
  total: number;
  due: number;
  mastered: number;
}

export interface GrammarReviewsResponse {
  items: GrammarConceptReview[];
  stats: GrammarReviewStats;
}

export async function getGrammarReviews(): Promise<GrammarReviewsResponse> {
  const response = await api.get<GrammarReviewsResponse>("/grammar-reviews");
  return response.data;
}

export async function queueGrammarConcept(params: {
  topic_id?: string;
  concept_name?: string;
  concept_description?: string;
  concept_examples?: string[];
  language?: string;
  level?: string;
  analysis_id?: string | null;
}): Promise<{ already_added: boolean; id?: string }> {
  const response = await api.post<{ already_added: boolean; id?: string }>(
    "/grammar-reviews",
    params
  );
  return response.data;
}

export async function submitGrammarReviewRating(
  id: string,
  quality: number
): Promise<void> {
  await api.put("/grammar-reviews", { id, quality });
}

export default api;
