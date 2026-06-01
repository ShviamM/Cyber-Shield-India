import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetMe, getGetMeQueryKey, type User } from "@workspace/api-client-react";
import { getToken, saveToken, clearToken } from "../lib/session";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  const { data: me, isLoading: isMeLoading, error } = useGetMe({
    query: {
      enabled: !!getToken(),
      retry: false,
      queryKey: getGetMeQueryKey()
    }
  });

  useEffect(() => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }
    if (!isMeLoading) {
      if (me) {
        setUser(me);
      } else if (error) {
        clearToken();
        setUser(null);
      }
      setIsLoading(false);
    }
  }, [me, isMeLoading, error]);

  const login = (token: string, newUser: User) => {
    saveToken(token);
    setUser(newUser);
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
