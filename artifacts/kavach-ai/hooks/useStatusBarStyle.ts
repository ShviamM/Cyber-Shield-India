import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback } from "react";

/**
 * Set the status bar icon colour while the calling screen is focused, and go
 * back to dark icons (the default for the app's light screens) when it loses
 * focus. Use "light" on screens with a navy or dark top edge.
 */
export function useStatusBarStyle(style: "light" | "dark") {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(style, true);
      return () => setStatusBarStyle("dark", true);
    }, [style]),
  );
}
