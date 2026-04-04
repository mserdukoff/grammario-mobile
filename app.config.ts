import type { ExpoConfig } from "expo/config";

/**
 * ADMIN_USER_ID is read at build time from .env (not EXPO_PUBLIC_*).
 * It is exposed to the client via `extra` for UI gating only; enforce admin on the server.
 */
export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  extra: {
    ...(typeof config.extra === "object" && config.extra !== null
      ? config.extra
      : {}),
    adminUserId: process.env.ADMIN_USER_ID ?? "",
  },
});
