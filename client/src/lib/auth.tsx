import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, getToken, setToken } from "./api";
import type { AuthResponse, UserSummary } from "./types";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: "PATRON" | "ARTISAN";
  title?: string;
  region?: string;
  handle?: string;
}

interface AuthContextValue {
  user: UserSummary | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserSummary>;
  register: (input: RegisterInput) => Promise<UserSummary>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUser: (user: UserSummary) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api<UserSummary>("/auth/me");
      setUser(me);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onUnauthorized = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener("emberhall:unauthorized", onUnauthorized);
    return () => window.removeEventListener("emberhall:unauthorized", onUnauthorized);
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await api<AuthResponse>("/auth/register", {
      method: "POST",
      body: input,
    });
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh, setUser }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
