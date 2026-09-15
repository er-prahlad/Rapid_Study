'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '@/services/api';
import type { UserProfile } from '@/types/api';

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    setUser(null);
    authApi.logout().catch(() => {});
    window.location.href = '/login';
  }, []);

  // Validate existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => {
        const profile = res.data.data;
        if (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN') {
          throw new Error('Not authorized');
        }
        setUser(profile);
      })
      .catch(() => {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { accessToken, refreshToken, user: profile } = res.data.data;

    if (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied: Admin role required');
    }

    localStorage.setItem('admin_access_token', accessToken);
    localStorage.setItem('admin_refresh_token', refreshToken);
    setUser(profile);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
