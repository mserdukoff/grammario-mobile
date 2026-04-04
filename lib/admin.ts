import Constants from "expo-constants";

function configuredAdminUserId(): string {
  const fromExtra = Constants.expoConfig?.extra?.adminUserId;
  if (typeof fromExtra === "string" && fromExtra.trim().length > 0) {
    return fromExtra.trim();
  }
  return (process.env.EXPO_PUBLIC_ADMIN_USER_ID ?? "").trim();
}

export function getAdminUserId(): string {
  return configuredAdminUserId();
}

export function isAdminUser(userId: string | undefined | null): boolean {
  if (!userId) return false;
  const adminId = configuredAdminUserId();
  if (!adminId) return false;
  return userId === adminId;
}
