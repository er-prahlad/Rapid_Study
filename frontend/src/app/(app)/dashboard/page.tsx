"use client";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/services/studentApi";
import { useAuth } from "@/context/AuthContext";

// ── Render immediately (small, no deps) ──────────────────────────────────────
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Skeleton } from "@/components/ui/skeleton";

// ── Lazy load below-the-fold components ──────────────────────────────────────
const PopularExams    = dynamic(() => import("@/components/dashboard/PopularExams").then(m => m.PopularExams),    { ssr: false, loading: () => <Skeleton className="h-40 rounded-xl" /> });
const DailyTargetCard = dynamic(() => import("@/components/dashboard/DailyTargetCard").then(m => m.DailyTargetCard), { ssr: false, loading: () => <Skeleton className="h-40 rounded-xl" /> });
const PerformanceChart = dynamic(() => import("@/components/dashboard/PerformanceChart").then(m => m.PerformanceChart), { ssr: false, loading: () => <Skeleton className="h-64 rounded-xl" /> });
const RecentAttempts  = dynamic(() => import("@/components/dashboard/RecentAttempts").then(m => m.RecentAttempts),  { ssr: false, loading: () => <Skeleton className="h-48 rounded-xl" /> });
const UpcomingTests   = dynamic(() => import("@/components/dashboard/UpcomingTests").then(m => m.UpcomingTests),   { ssr: false, loading: () => <Skeleton className="h-48 rounded-xl" /> });
const LeaderboardWidget = dynamic(() => import("@/components/dashboard/LeaderboardWidget").then(m => m.LeaderboardWidget), { ssr: false, loading: () => <Skeleton className="h-48 rounded-xl" /> });

export default function DashboardPage() {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => studentApi.getDashboard(),
    retry: 1,
    staleTime: 1000 * 60 * 5, // cache 5 min — don't refetch on every visit
  });

  const dashboard = data?.data;

  return (
    <div className="space-y-6">
      {/* ── Above the fold — render immediately ── */}
      <WelcomeSection user={user} streak={dashboard?.stats?.currentStreak ?? 0} />
      <StatsRow stats={dashboard?.stats} />
      <QuickActions />

      {/* ── Below the fold — lazy loaded ── */}
      <PopularExams exams={dashboard?.popularExams ?? []} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DailyTargetCard target={dashboard?.dailyTarget} />
          <PerformanceChart subjectPerformance={dashboard?.subjectPerformance ?? []} />
          <RecentAttempts attempts={dashboard?.recentAttempts ?? []} />
        </div>
        <div className="space-y-6">
          <UpcomingTests tests={dashboard?.upcomingTests ?? []} />
          <LeaderboardWidget entries={dashboard?.leaderboard ?? []} />
        </div>
      </div>
    </div>
  );
}
