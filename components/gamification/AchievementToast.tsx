import React, {
  createContext,
  useContext,
  useCallback,
  useState,
} from "react";
import { View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { Zap, TrendingUp } from "lucide-react-native";

interface Toast {
  id: number;
  type: "xp" | "levelup";
  message: string;
}

interface ToastContextType {
  showXPToast: (amount: number) => void;
  showLevelUpToast: (level: number) => void;
}

const ToastContext = createContext<ToastContextType>({
  showXPToast: () => {},
  showLevelUpToast: () => {},
});

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showXPToast = useCallback((amount: number) => {
    const id = nextId++;
    setToasts((prev) => [
      ...prev,
      { id, type: "xp", message: `+${amount} XP` },
    ]);
    setTimeout(() => removeToast(id), 3500);
  }, [removeToast]);

  const showLevelUpToast = useCallback((level: number) => {
    const id = nextId++;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setToasts((prev) => [
      ...prev,
      { id, type: "levelup", message: `Level ${level}!` },
    ]);
    setTimeout(() => removeToast(id), 3500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showXPToast, showLevelUpToast }}>
      {children}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 60,
          left: 16,
          right: 16,
          zIndex: 9999,
          gap: 8,
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const { colors } = useTheme();
  const translateY = useSharedValue(-40);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.poly(4)),
    });
    opacity.value = withTiming(1, { duration: 300 });

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(-20, { duration: 300 });
    }, 3000);

    return () => clearTimeout(timer);
  }, [translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const isLevelUp = toast.type === "levelup";

  return (
    <Animated.View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: isLevelUp ? colors.primary : colors.card,
          borderRadius: 10,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: isLevelUp ? 0 : 1,
          borderColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 5,
        },
        animatedStyle,
      ]}
    >
      {isLevelUp ? (
        <TrendingUp size={20} color={colors.primaryForeground} />
      ) : (
        <Zap size={18} color={colors.primary} />
      )}
      <Text
        style={{
          fontFamily: "PlusJakartaSans-SemiBold",
          fontSize: 15,
          color: isLevelUp ? colors.primaryForeground : colors.primary,
        }}
      >
        {toast.message}
      </Text>
    </Animated.View>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
