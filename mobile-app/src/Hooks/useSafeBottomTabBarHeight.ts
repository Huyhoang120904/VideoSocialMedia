import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Returns the bottom tab bar height when inside a tab navigator.
 * Falls back to the bottom safe-area inset (or zero) when rendered
 * outside of a BottomTabNavigator (e.g., modal preview screens).
 */
export const useSafeBottomTabBarHeight = (): number => {
  const insets = useSafeAreaInsets();

  try {
    const tabBarHeight = useBottomTabBarHeight();
    if (typeof tabBarHeight === "number") {
      return tabBarHeight;
    }
  } catch (_) {
    // Swallow the error silently and fall back to the safe-area inset.
  }

  return insets.bottom ?? 0;
};
