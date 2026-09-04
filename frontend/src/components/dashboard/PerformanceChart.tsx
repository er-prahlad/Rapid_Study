"use client";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";
import { SubjectPerformance } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-load Recharts — it's ~120KB, no reason to include in initial bundle
const LazyBarChart = dynamic(
  () => import("./PerformanceChartInner").then((m) => m.PerformanceChartInner),
  {
    ssr: false,
    loading: () => <Skeleton className="h-48 w-full rounded-lg" />,
  }
);

interface Props {
  subjectPerformance: SubjectPerformance[];
}

export function PerformanceChart({ subjectPerformance }: Props) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart2 className="h-5 w-5 text-primary" />
          Subject Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LazyBarChart subjectPerformance={subjectPerformance} />
      </CardContent>
    </Card>
  );
}
