"use client";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Suspense } from "react";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {/* Suspense lets page content stream in without blocking the shell */}
      <AppLayout>
        <Suspense fallback={null}>{children}</Suspense>
      </AppLayout>
    </ProtectedRoute>
  );
}
