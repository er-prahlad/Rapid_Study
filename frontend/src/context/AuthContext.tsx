"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { UserProfile } from "@/types";
import { authApi } from "@/services/authApi";
import { tokenStorage } from "@/services/apiClient";

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Start with loading=false if there is no token — avoids blocking render
  const [isLoading, setLoading] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!tokenStorage.getToken(); // only load if token exists
  });

  // Track if we already fetched to avoid double fetch in StrictMode
  const fetchedRef = useRef(false);

  const refreshUser = useCallback(async () => {
    const token = tokenStorage.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.me();
      setUser(res.data);
    } catch {
      tokenStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
      // Set user directly from login response — no extra /me call
      setUser({
        id: res.data.userId,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        language: res.data.language,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    },
    []
  );

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      phone?: string;
      password: string;
    }) => {
      const res = await authApi.register(data);
      tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
      setUser({
        id: res.data.userId,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        language: res.data.language,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    tokenStorage.clear();
    setUser(null);
    fetchedRef.current = false;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
