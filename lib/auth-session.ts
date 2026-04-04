/**
 * Errors returned when persisted auth cannot be refreshed. The client should
 * treat these as "signed out" and clear local state (session is already removed
 * server-side or no longer valid).
 */
const FATAL_REFRESH_CODES = new Set([
  "refresh_token_not_found",
  "refresh_token_already_used",
  "session_not_found",
]);

export function isInvalidStoredSessionError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as { name?: string; code?: string; message?: string };
  if (e.name !== "AuthApiError") return false;
  if (e.code && FATAL_REFRESH_CODES.has(e.code)) return true;
  const msg = typeof e.message === "string" ? e.message : "";
  return (
    msg.includes("Refresh Token Not Found") ||
    msg.includes("Invalid Refresh Token")
  );
}
