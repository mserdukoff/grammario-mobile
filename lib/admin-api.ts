import axios, { AxiosError } from "axios";
import { applyTrustedClientHeaders, resolveApiClientOrigin } from "./api-client-origin";
import { isInvalidStoredSessionError } from "./auth-session";
import { ApiError } from "./api";
import { supabase } from "./supabase";

function trimSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

/**
 * Resolution order (same `/api/v1/admin/*` paths as the web admin BFF):
 * 1. EXPO_PUBLIC_ADMIN_API_URL — explicit admin host
 * 2. EXPO_PUBLIC_API_URL + /api/v1 — same base as analyze/usage (`lib/api.ts`)
 * 3. EXPO_PUBLIC_WEB_ORIGIN + /api/v1 — fallback (e.g. legal links host)
 */
export function resolveAdminApiBase(): string {
  const explicit = process.env.EXPO_PUBLIC_ADMIN_API_URL?.trim();
  if (explicit) return trimSlash(explicit);

  const learner = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (learner) {
    const base = trimSlash(learner);
    if (base.endsWith("/api/v1")) return base;
    return `${base}/api/v1`;
  }

  const web = trimSlash(
    process.env.EXPO_PUBLIC_WEB_ORIGIN || "https://grammario.ai"
  );
  return `${web}/api/v1`;
}

export const ADMIN_API_BASE = resolveAdminApiBase();

export const adminApi = axios.create({
  baseURL: ADMIN_API_BASE,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    // Some hosts/WAFs drop requests with no User-Agent (common with RN).
    "User-Agent": "GrammarioMobile/1.0",
  },
});

adminApi.interceptors.request.use(async (config) => {
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
  }
  return config;
});

function adminNetworkHelp(): string {
  const base = ADMIN_API_BASE;
  const isLocal =
    /localhost|127\.0\.0\.1|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./i.test(
      base
    );
  const lines = [
    `Admin API base URL: ${base}`,
    "Could not reach the server (no HTTP response). Common fixes:",
    "• Admin URL is EXPO_PUBLIC_ADMIN_API_URL, else EXPO_PUBLIC_API_URL + /api/v1, else EXPO_PUBLIC_WEB_ORIGIN + /api/v1.",
    "• Local Next.js: set EXPO_PUBLIC_ADMIN_API_URL=http://YOUR_LAN_IP:3000/api/v1 (not localhost on a real phone).",
    "• After changing .env: npx expo start --clear (Expo bakes EXPO_PUBLIC_* at bundle time).",
    "• Confirm the host:port serves /api/v1/admin/* (same server as the web admin, or your BFF).",
    "• HTTP on Android: cleartext / dev client rebuild if needed; Expo Go has its own rules.",
  ];
  if (isLocal) {
    lines.push(
      "• On a physical device, localhost points at the phone itself — use your computer’s LAN IP instead."
    );
  }
  return lines.join("\n");
}

adminApi.interceptors.response.use(
  (response) => response,
  (
    error: AxiosError<{
      detail?: string | { message?: string; error?: string };
    }>
  ) => {
    const noResponse = !error.response;
    const code = error.code;
    const isNetworkish =
      noResponse &&
      (code === "ERR_NETWORK" ||
        code === "ECONNABORTED" ||
        /network/i.test(String(error.message)));

    if (isNetworkish) {
      const prefix =
        code === "ECONNABORTED"
          ? "Request timed out or was aborted.\n\n"
          : "";
      throw new ApiError(prefix + adminNetworkHelp(), 0, {
        adminApiBase: ADMIN_API_BASE,
        axiosCode: code,
      });
    }

    const status = error.response?.status;
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

    if (status === 404) {
      const origin = resolveApiClientOrigin();
      message = `${message}\n\n404: This host may not expose /api/v1/admin/* (e.g. only FastAPI, not Next.js), or middleware blocked the route.\nThe app sends Origin/Referer: ${origin} — allow that origin on your API gateway, or set EXPO_PUBLIC_API_CLIENT_ORIGIN to match what the web app uses.`;
    }

    throw new ApiError(
      message,
      status || 500,
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
