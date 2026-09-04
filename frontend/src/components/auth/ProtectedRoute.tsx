"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (redirected.current) return;

    if (!isAuthenticated) {
      redirected.current = true;
      router.replace("/login");
    } else if (adminOnly && user?.role !== "ADMIN") {
      redirected.current = true;
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, adminOnly, user, router]);

  // While auth is loading — render nothing (no flash of skeleton)
  // isLoading is only true when a token exists and /me is being fetched
  // If no token, isLoading=false immediately (fixed in AuthContext)
  if (isLoading) return null;

  // Not authenticated — render nothing while redirect happens
  if (!isAuthenticated) return null;
  if (adminOnly && user?.role !== "ADMIN") return null;

  return <>{children}</>;
}
