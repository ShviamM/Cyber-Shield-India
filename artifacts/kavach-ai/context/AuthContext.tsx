import { useQueryClient } from "@tanstack/react-query";
import type { AuthResponse, User } from "@workspace/api-client-react";
import {
  ApiError,
  deleteMyAccount,
  getMe,
  logout as logoutRequest,
} from "@workspace/api-client-react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { clearToken, loadToken, saveToken } from "@/lib/session";
import { registerForPushNotifications, unregisterThisDevice } from "@/lib/push";

// Last known profile, so the app opens signed in when the server is unreachable.
const USER_KEY = "kv_user";

const isUnauthorized = (err: unknown) => err instanceof ApiError && err.status === 401;

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextType = {
  status: AuthStatus;
  user: User | null;
  /** Persist the session returned by verify-otp and mark as authenticated. */
  signIn: (auth: AuthResponse) => Promise<void>;
  /** Clear the session locally (and best-effort on the server). */
  signOut: () => Promise<void>;
  /** Permanently delete the account on the server, then clear locally. */
  deleteAccount: () => Promise<void>;
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
        AsyncStorage.setItem(USER_KEY, JSON.stringify(me)).catch(() => {});
        void registerForPushNotifications();
      } catch (err) {
        if (isUnauthorized(err)) {
          // The server rejected the session: it expired or was revoked.
          await clearToken();
          AsyncStorage.removeItem(USER_KEY).catch(() => {});
          setUser(null);
          setStatus("unauthenticated");
          return;
        }
        // Offline, timeout or server error: keep the user signed in with the
        // last known profile instead of forcing a new OTP login.
        const cached = await AsyncStorage.getItem(USER_KEY).catch(() => null);
        setUser(cached ? (JSON.parse(cached) as User) : null);
        setStatus("authenticated");
      }
    })();
  }, []);

  // A session revoked or expired while the app is open: any 401 from a query
  // signs the user out locally instead of leaving every screen in an error state.
  useEffect(() => {
    if (status !== "authenticated") return;
    const unsub = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "error" && isUnauthorized(event.action.error)) {
        void (async () => {
          await clearToken();
          AsyncStorage.removeItem(USER_KEY).catch(() => {});
          setUser(null);
          setStatus("unauthenticated");
          queryClient.clear();
        })();
      }
    });
    return unsub;
  }, [status, queryClient]);

  const signIn = useCallback(async (auth: AuthResponse) => {
    await saveToken(auth.token);
    setUser(auth.user);
    setStatus("authenticated");
    AsyncStorage.setItem(USER_KEY, JSON.stringify(auth.user)).catch(() => {});
    void registerForPushNotifications();
  }, []);

  const signOut = useCallback(async () => {
    // Stop this phone receiving the account's alerts before the session ends.
    await unregisterThisDevice();
    try {
      await logoutRequest();
    } catch {
      // best-effort; clear locally regardless
    }
    await clearToken();
    AsyncStorage.removeItem(USER_KEY).catch(() => {});
    setUser(null);
    setStatus("unauthenticated");
    queryClient.clear();
  }, [queryClient]);

  // Deletes the account server-side first; only clears the local session if the
  // server confirms deletion, so a failed request leaves the user signed in to
  // retry. Errors propagate to the caller to surface a message.
  const deleteAccount = useCallback(async () => {
    await deleteMyAccount();
    await clearToken();
    setUser(null);
    setStatus("unauthenticated");
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{ status, user, signIn, signOut, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
