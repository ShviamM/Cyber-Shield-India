import { Stack } from "expo-router";
import React from "react";

import { useStatusBarStyle } from "@/hooks/useStatusBarStyle";

export default function AuthLayout() {
  // The login screen is navy.
  useStatusBarStyle("light");
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
