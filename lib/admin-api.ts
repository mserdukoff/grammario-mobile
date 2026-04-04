import axios, { AxiosError } from "axios";
import { isInvalidStoredSessionError } from "./auth-session";
import { ApiError } from "./api";
import { supabase } from "./supabase";

const WEB_ORIGIN = (
  process.env.EXPO_PUBLIC_WEB_ORIGIN || "https://grammario.com"
).replace(/\/$/, "");

/** Next.js BFF admin routes; override if admin API is hosted elsewhere. */
export const ADMIN_API_BASE = (
  process.env.EXPO_PUBLIC_ADMIN_API_URL || `${WEB_ORIGIN}/api/v1`
).replace(/\/$/, "");

export const adminApi = axios.create({
  baseURL: ADMIN_API_BASE,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

adminApi.interceptors.request.use(async (config) => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error && isInvalidStoredSessionError(error)) {
    await supabase.auth.signOut({ scope: "local" });
  }
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
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
      } else if (
        typeof error.response.data.detail === "object" &&
        error.response.data.detail?.message
      ) {
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

// --- Types (flexible; normalize in UI when API shape differs slightly) ---

export type AdminStats = Record<string, unknown>;

export type AdminUserRow = {
  id: string;
  email: string;
  display_name?: string | null;
  admin_notes?: string | null;
  account_type?: string | null;
  daily_sentence_limit?: number | null;
  account_expires_at?: string | null;
  level?: number | null;
  xp?: number | null;
  total_analyses?: number | null;
  is_pro?: boolean | null;
  created_at?: string | null;
};

export type AdminUsersListResponse = {
  users?: AdminUserRow[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
};

export type AdminAnalysisRow = Record<string, unknown> & {
  id?: string;
  language?: string;
  created_at?: string;
};

export type AdminVocabRow = Record<string, unknown>;

export type AdminFeedbackItem = Record<string, unknown>;

export type AdminFeedbackResponse = {
  summary?: {
    total?: number;
    unresolved?: number;
    unresolved_count?: number;
    avg_rating?: number;
  };
  feedback?: AdminFeedbackItem[];
};

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await adminApi.get<AdminStats>("/admin/stats");
  return data;
}

export async function getAdminUsers(params: {
  page?: number;
  limit?: number;
  account_type?: "test" | "regular" | "";
}): Promise<AdminUsersListResponse> {
  const { data } = await adminApi.get<AdminUsersListResponse>("/admin/users", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 30,
      ...(params.account_type ? { account_type: params.account_type } : {}),
    },
  });
  return data;
}

export async function patchAdminUser(body: {
  user_id: string;
  updates: Record<string, unknown>;
}): Promise<void> {
  await adminApi.patch("/admin/users", body);
}

export async function deleteAdminUser(userId: string): Promise<void> {
  await adminApi.delete("/admin/users", { data: { user_id: userId } });
}

export async function createAdminUser(body: Record<string, unknown>): Promise<void> {
  await adminApi.post("/admin/users", body);
}

export async function getAdminAnalyses(params: {
  page?: number;
  limit?: number;
  language?: string;
  id?: string;
}): Promise<Record<string, unknown>> {
  const { data } = await adminApi.get<Record<string, unknown>>("/admin/analyses", {
    params: {
      page: params.page,
      limit: params.limit ?? 20,
      ...(params.language ? { language: params.language } : {}),
      ...(params.id ? { id: params.id } : {}),
    },
  });
  return data;
}

export async function deleteAdminAnalysis(analysisId: string): Promise<void> {
  await adminApi.delete("/admin/analyses", {
    data: { analysis_id: analysisId },
  });
}

export async function getAdminVocabulary(params: {
  page?: number;
  limit?: number;
}): Promise<Record<string, unknown>> {
  const { data } = await adminApi.get<Record<string, unknown>>(
    "/admin/vocabulary",
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 30,
      },
    }
  );
  return data;
}

export async function getAdminFeedback(params: {
  category?: string;
  resolved?: string;
}): Promise<AdminFeedbackResponse> {
  const { data } = await adminApi.get<AdminFeedbackResponse>("/admin/feedback", {
    params: {
      ...(params.category ? { category: params.category } : {}),
      ...(params.resolved !== undefined && params.resolved !== ""
        ? { resolved: params.resolved }
        : {}),
    },
  });
  return data;
}

export async function patchAdminFeedback(body: {
  id: string;
  is_resolved?: boolean;
  admin_notes?: string;
}): Promise<void> {
  await adminApi.patch("/admin/feedback", body);
}

export async function getAdminHealth(): Promise<Record<string, unknown>> {
  const { data } = await adminApi.get<Record<string, unknown>>("/admin/health");
  return data;
}
