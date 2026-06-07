import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getMe,
  logout as apiLogout,
  ApiError,
  type User,
} from "@workspace/api-client-react";
import { getToken, saveToken, clearToken } from "@/lib/session";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  setSession: (token: string, user: User) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch (error) {
      // Only drop the session on genuine auth failures. Transient network or
      // server errors must not forcibly log out a valid user.
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        clearToken();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setSession = useCallback((token: string, nextUser: User) => {
    saveToken(token);
    setUser(nextUser);
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Clear the local session regardless of network/logout errors.
    }
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, setSession, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
