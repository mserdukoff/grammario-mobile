import * as Haptics from "expo-haptics";

export function impact(enabled: boolean, style = Haptics.ImpactFeedbackStyle.Light) {
  if (!enabled) return;
  Haptics.impactAsync(style);
}

export function notification(
  enabled: boolean,
  type = Haptics.NotificationFeedbackType.Success
) {
  if (!enabled) return;
  Haptics.notificationAsync(type);
}
