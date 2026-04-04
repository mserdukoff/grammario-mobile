import * as Clipboard from "expo-clipboard";
import { Alert } from "react-native";

export async function copyToClipboard(
  text: string,
  showConfirmation = false
) {
  try {
    await Clipboard.setStringAsync(text);
    if (showConfirmation) {
      Alert.alert("Copied", "Content copied to clipboard.");
    }
  } catch {
    Alert.alert("Copy failed", "Could not copy to clipboard.");
  }
}
