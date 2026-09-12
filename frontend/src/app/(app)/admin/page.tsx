"use client";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { adminApi, AdminDashboard } from "@/services/adminApi";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, FileText, Target, TrendingUp, Shield, Activity, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LazyAdminCharts = dynamic(() => import("./AdminCharts"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 rounded-xl" />,
});

function StatCard({ icon: Icon, value, label, href, color }: {
  icon: React.ComponentType<{ className?: string }>; value: number | string; label: string; href?: string; color: string;
}) {
  const content = (
    <Card className={cn("border-0 shadow-sm hover:shadow-md transition-shadow", href && "cursor-pointer")}>
      <CardContent className={cn("p-4", color)}>
        <Icon className="h-5 w-5 mb-2 opacity-80" />
        <p className="text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p>
        <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function StatCardSkeleton() {
  return <Card className="border-0 shadow-sm"><CardContent className="p-4 space-y-2"><Skeleton className="h-5 w-5" /><Skeleton className="h-7 w-16" /><Skeleton className="h-3 w-24" /></CardContent></Card>;
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: adminApi.getDashboard,
    staleTime: 1000 * 60 * 2,
  });

  const d: AdminDashboard | undefined = data?.data;

  const STATS = d ? [
    { icon: Users,    value: d.totalUsers,     label: "Total Users",     href: "/admin/users",     color: "bg-blue-50 text-blue-700" },
    { icon: Activity, value: d.activeUsers,    label: "Active Users",    href: "/admin/users",     color: "bg-green-50 text-green-700" },
    { icon: BookOpen, value: d.totalExams,     label: "Total Exams",     href: "/admin/exams",     color: "bg-purple-50 text-purple-700" },
    { icon: Target,   value: d.totalQuestions, label: "Questions",       href: "/admin/questions", color: "bg-orange-50 text-orange-700" },
    { icon: FileText, value: d.totalTests,     label: "Mock Tests",      href: "/admin/tests",     color: "bg-indigo-50 text-indigo-700" },
    { icon: TrendingUp,value: d.totalAttempts, label: "Total Attempts",  href: undefined,          color: "bg-pink-50 text-pink-700" },
    { icon: Clock,    value: d.todaysAttempts, label: "Today's Attempts",href: undefined,          color: "bg-teal-50 text-teal-700" },
    { icon: Shield,   value: `${d.averageScore.toFixed(1)}%`, label: "Avg Platform Score", href: undefined, color: "bg-yellow-50 text-yellow-700" },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Platform overview and statistics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isLoading
          ? [...Array(8)].map((_, i) => <StatCardSkeleton key={i} />)
          : STATS.map(s => <StatCard key={s.label} {...s} />)
        }
      </div>

      {/* Charts */}
      {d && (
        <LazyAdminCharts
          userRegistrations={d.userRegistrations}
          testAttempts={d.testAttempts}
          popularExams={d.popularExams}
        />
      )}
      {isLoading && <Skeleton className="h-64 rounded-xl" />}
    </div>
  );
}
