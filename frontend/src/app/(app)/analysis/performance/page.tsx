"use client";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/services/studentApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";
import {
  TrendingUp, Trophy, Target, Flame, BookOpen,
  CheckCircle2, XCircle, BarChart2,
} from "lucide-react";

const LazyPerformanceCharts = dynamic(() => import("./PerformanceCharts"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 rounded-xl" />,
});

function StatCard({ icon: Icon, value, label, sub, color }: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number; label: string; sub?: string; color: string;
}) {
  return (
    <div className={`rounded-xl p-4 space-y-1 ${color}`}>
      <Icon className="h-5 w-5 mb-1" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium">{label}</p>
      {sub && <p className="text-xs opacity-70">{sub}</p>}
    </div>
  );
}

export default function PerformancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["performance"],
    queryFn: () => studentApi.getPerformance(),
    staleTime: 1000 * 60 * 5,
  });

  const p = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!p) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Performance</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Overall statistics across all your test attempts
        </p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={BookOpen}     value={p.testsCompleted}             label="Tests Completed"   color="bg-blue-50 text-blue-700" />
        <StatCard icon={TrendingUp}   value={`${p.averageScore.toFixed(1)}%`}   label="Avg Score"     color="bg-green-50 text-green-700" />
        <StatCard icon={Trophy}       value={`${p.bestScore.toFixed(1)}%`}       label="Best Score"    color="bg-yellow-50 text-yellow-700" />
        <StatCard icon={Target}       value={`${p.averageAccuracy.toFixed(1)}%`} label="Avg Accuracy"  color="bg-purple-50 text-purple-700" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={CheckCircle2} value={p.totalCorrect}   label="Total Correct"  color="bg-green-50 text-green-700" />
        <StatCard icon={XCircle}      value={p.totalWrong}     label="Total Wrong"    color="bg-red-50 text-red-700" />
        <StatCard icon={Flame}        value={p.currentStreak}  label="Current Streak" sub="days"  color="bg-orange-50 text-orange-700" />
        <StatCard icon={Flame}        value={p.longestStreak}  label="Longest Streak" sub="days"  color="bg-orange-50 text-orange-700" />
      </div>

      {/* Charts */}
      {p.scoreHistory.length > 0 && (
        <LazyPerformanceCharts
          scoreHistory={p.scoreHistory}
          difficultyBreakdown={p.difficultyBreakdown}
        />
      )}

      {/* Score history table */}
      {p.scoreHistory.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart2 className="h-5 w-5 text-primary" />Recent Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {p.scoreHistory.map((h) => {
                const pctColor = h.percentage >= 70 ? "text-green-600" : h.percentage >= 40 ? "text-orange-600" : "text-red-600";
                return (
                  <div key={h.attemptId} className="flex items-center justify-between py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{h.testTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(h.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-4 text-sm">
                      <span className="text-muted-foreground">{h.score}/{h.totalMarks}</span>
                      <Badge variant="outline" className="text-xs">{h.accuracy.toFixed(0)}% acc</Badge>
                      <span className={`font-bold w-12 text-right ${pctColor}`}>{h.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {p.testsCompleted === 0 && (
        <div className="text-center py-20 space-y-4">
          <BarChart2 className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">No tests completed yet</p>
          <p className="text-sm text-muted-foreground">
            Attempt a mock test to see your performance statistics here.
          </p>
        </div>
      )}
    </div>
  );
}
