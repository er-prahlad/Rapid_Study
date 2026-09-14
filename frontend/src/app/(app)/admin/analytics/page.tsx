"use client";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BarChart2, Users, BookOpen, FileText, Target, TrendingUp, Activity, Clock } from "lucide-react";
import dynamic from "next/dynamic";

const LazyAdminCharts = dynamic(() => import("../AdminCharts"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 rounded-xl" />,
});

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: adminApi.getDashboard,
    staleTime: 1000 * 60 * 2,
  });

  const d = data?.data;

  const stats = d ? [
    { label: "Total Users",      value: d.totalUsers,      icon: Users,      color: "text-blue-600",   bg: "bg-blue-50" },
    { label: "Active Users",     value: d.activeUsers,     icon: Activity,   color: "text-green-600",  bg: "bg-green-50" },
    { label: "Total Exams",      value: d.totalExams,      icon: BookOpen,   color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Questions",  value: d.totalQuestions,  icon: Target,     color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Mock Tests",       value: d.totalTests,      icon: FileText,   color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Total Attempts",   value: d.totalAttempts,   icon: TrendingUp, color: "text-pink-600",   bg: "bg-pink-50" },
    { label: "Today's Attempts", value: d.todaysAttempts,  icon: Clock,      color: "text-teal-600",   bg: "bg-teal-50" },
    { label: "Avg Score",        value: `${d.averageScore.toFixed(1)}%`, icon: BarChart2, color: "text-yellow-600", bg: "bg-yellow-50" },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Platform-wide statistics</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isLoading
          ? [...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : stats.map(s => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className={`p-4 ${s.bg} rounded-xl`}>
                <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
                <p className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))
        }
      </div>

      {d && (
        <LazyAdminCharts
          userRegistrations={d.userRegistrations}
          testAttempts={d.testAttempts}
          popularExams={d.popularExams}
        />
      )}
    </div>
  );
}
