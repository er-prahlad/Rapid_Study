"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { UserProfile } from "@/types";
import { authApi } from "@/services/authApi";
import { tokenStorage } from "@/services/apiClient";

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone?: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<UserProfile | null>(null);
  const [isLoading, setLoading] = useState(true);

  // Fetch current user on mount if token exists
  const refreshUser = useCallback(async () => {
    const token = tokenStorage.getToken();
    if (!token) { setLoading(false); return; }
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

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
    await refreshUser();
  }, [refreshUser]);

  const register = useCallback(async (data: { name: string; email: string; phone?: string; password: string }) => {
    const res = await authApi.register(data);
    tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
    await refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    tokenStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
