"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart2 } from "lucide-react";
import { SubjectPerformance } from "@/types";

interface Props {
  subjectPerformance: SubjectPerformance[];
}

export function PerformanceChartInner({ subjectPerformance }: Props) {
  if (subjectPerformance.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-center gap-2">
        <BarChart2 className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">No data yet</p>
        <p className="text-xs text-muted-foreground">
          Attempt a mock test to see your subject performance.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={subjectPerformance}
        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="subjectName" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11 }}
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(val: number) => [`${val}%`, "Accuracy"]}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Bar
          dataKey="accuracy"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
