import type { InternalAxiosRequestConfig } from "axios";

function trimSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

/**
 * Sent as `Origin` and `Referer` on API calls so servers / middleware that
 * expect browser traffic (or same-site checks) can allow the mobile app.
 *
 * Override with EXPO_PUBLIC_API_CLIENT_ORIGIN if the API expects a different
 * host than EXPO_PUBLIC_WEB_ORIGIN (e.g. www vs apex).
 */
export function resolveApiClientOrigin(): string {
  const raw =
    process.env.EXPO_PUBLIC_API_CLIENT_ORIGIN?.trim() ||
    process.env.EXPO_PUBLIC_WEB_ORIGIN?.trim() ||
    "https://grammario.ai";
  return trimSlash(raw);
}

/**
 * Apply headers React Native often omits; helps reverse proxies and Next.js
 * middleware that gate on Origin / Referer.
 */
export function applyTrustedClientHeaders(config: InternalAxiosRequestConfig) {
  const origin = resolveApiClientOrigin();
  config.headers.set("Origin", origin);
  config.headers.set("Referer", `${origin}/`);
  if (!config.headers.get("User-Agent")) {
    config.headers.set("User-Agent", "GrammarioMobile/1.0");
  }
  if (!config.headers.get("Accept")) {
    config.headers.set("Accept", "application/json");
  }
}
