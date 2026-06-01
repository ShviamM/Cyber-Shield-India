import { useQueryClient } from "@tanstack/react-query";
import type { AuthResponse, User } from "@workspace/api-client-react";
import { getMe, logout as logoutRequest } from "@workspace/api-client-react";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { clearToken, loadToken, saveToken } from "@/lib/session";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextType = {
  status: AuthStatus;
  user: User | null;
  /** Persist the session returned by verify-otp and mark as authenticated. */
  signIn: (auth: AuthResponse) => Promise<void>;
  /** Clear the session locally (and best-effort on the server). */
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const token = await loadToken();
      if (!token) {
        setStatus("unauthenticated");
        return;
      }
      try {
        const me = await getMe();
        setUser(me);
        setStatus("authenticated");
      } catch {
        // token invalid/expired
        await clearToken();
        setUser(null);
        setStatus("unauthenticated");
      }
    })();
  }, []);

  const signIn = useCallback(async (auth: AuthResponse) => {
    await saveToken(auth.token);
    setUser(auth.user);
    setStatus("authenticated");
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // best-effort; clear locally regardless
    }
    await clearToken();
    setUser(null);
    setStatus("unauthenticated");
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ status, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
