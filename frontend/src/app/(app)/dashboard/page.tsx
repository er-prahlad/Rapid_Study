"use client";
import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/services/studentApi";
import { useAuth } from "@/context/AuthContext";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { DailyTargetCard } from "@/components/dashboard/DailyTargetCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { PopularExams } from "@/components/dashboard/PopularExams";
import { UpcomingTests } from "@/components/dashboard/UpcomingTests";
import { LeaderboardWidget } from "@/components/dashboard/LeaderboardWidget";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentAttempts } from "@/components/dashboard/RecentAttempts";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => studentApi.getDashboard(),
    retry: 1,
  });

  if (isLoading) return <DashboardSkeleton />;

  // Show graceful fallback if backend not yet returning dashboard data
  const dashboard = data?.data;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <WelcomeSection user={user} streak={dashboard?.stats?.currentStreak ?? 0} />

      {/* Stats row */}
      <StatsRow stats={dashboard?.stats} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          <DailyTargetCard target={dashboard?.dailyTarget} />
          <PerformanceChart subjectPerformance={dashboard?.subjectPerformance ?? []} />
          <RecentAttempts attempts={dashboard?.recentAttempts ?? []} />
        </div>

        {/* Right — 1 col */}
        <div className="space-y-6">
          <QuickActions />
          <UpcomingTests tests={dashboard?.upcomingTests ?? []} />
          <LeaderboardWidget entries={dashboard?.leaderboard ?? []} />
        </div>
      </div>

      {/* Popular Exams — full width */}
      <PopularExams exams={dashboard?.popularExams ?? []} />
    </div>
  );
}
