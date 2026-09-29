'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '@/services/api';
import type { UserProfile, UserRole } from '@/types/api';

const ALLOWED_STAFF_ROLES: UserRole[] = ['CONTENT_CREATOR', 'REVIEWER', 'ADMIN', 'SUPER_ADMIN'];

export interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isReviewer: boolean;
  isContentCreator: boolean;
  canManageUsers: boolean;
  canApproveQuestions: boolean;
  canEditStructure: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const CACHED_USER_KEY = 'admin_user_profile';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Optimistic initial state from localStorage for instantaneous UI rendering (0ms lag)
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const token = localStorage.getItem('admin_access_token');
      const cached = localStorage.getItem(CACHED_USER_KEY);
      if (token && cached) {
        const parsed = JSON.parse(cached) as UserProfile;
        if (ALLOWED_STAFF_ROLES.includes(parsed.role)) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('admin_access_token');
    const cached = localStorage.getItem(CACHED_USER_KEY);
    // If we have token and cached user, we do not block UI with a full-page loading spinner
    return !(token && cached);
  });

  const logout = useCallback(() => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem(CACHED_USER_KEY);
    setUser(null);
    authApi.logout().catch(() => {});
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('admin_access_token');

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Validate and refresh profile in background
    authApi
      .me()
      .then((res) => {
        const profile = res.data.data;

        if (!ALLOWED_STAFF_ROLES.includes(profile.role)) {
          throw new Error('Not authorized: Staff role required');
        }

        setUser(profile);
        try {
          localStorage.setItem(CACHED_USER_KEY, JSON.stringify(profile));
        } catch {}
      })
      .catch((err) => {
        // Only clear if 401 or unauthorized
        const status = err?.response?.status;
        if (status === 401 || status === 403 || err?.message?.includes('Not authorized')) {
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem(CACHED_USER_KEY);
          setUser(null);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });

    const {
      accessToken,
      refreshToken,
      userId,
      name,
      email: userEmail,
      role,
      language,
    } = res.data.data;

    if (!ALLOWED_STAFF_ROLES.includes(role)) {
      throw new Error('Access denied: Staff / Admin role required (Content Creator, Reviewer, Admin, or Super Admin)');
    }

    const profile: UserProfile = {
      id: userId,
      name,
      email: userEmail,
      phone: null,
      role,
      isActive: true,
      language: language === 'EN' ? 'ENGLISH' : 'HINDI',
      createdAt: '',
    };

    localStorage.setItem('admin_access_token', accessToken);
    localStorage.setItem('admin_refresh_token', refreshToken);
    try {
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(profile));
    } catch {}

    setUser(profile);
  }, []);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'ADMIN' || isSuperAdmin;
  const isReviewer = user?.role === 'REVIEWER';
  const isContentCreator = user?.role === 'CONTENT_CREATOR';

  // Specific role capability flags
  const canManageUsers = isSuperAdmin; // Only Super Admin or Admin can manage users
  const canApproveQuestions = isSuperAdmin || user?.role === 'ADMIN' || isReviewer;
  const canEditStructure = isSuperAdmin || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isSuperAdmin,
        isAdmin,
        isReviewer,
        isContentCreator,
        canManageUsers,
        canApproveQuestions,
        canEditStructure,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return ctx;
}