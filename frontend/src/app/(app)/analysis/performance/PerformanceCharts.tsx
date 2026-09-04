"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoreHistory, DifficultyAnalysis } from "@/services/attemptApi";

interface Props {
  scoreHistory:      ScoreHistory[];
  difficultyBreakdown: DifficultyAnalysis[];
}

export default function PerformanceCharts({ scoreHistory, difficultyBreakdown }: Props) {
  const chartData = [...scoreHistory].reverse().map((h, i) => ({
    name: `T${i + 1}`,
    Score: h.percentage,
    Accuracy: h.accuracy,
    title: h.testTitle,
  }));

  const hasDiff = difficultyBreakdown.some(d => d.total > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Score trend */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Score Trend (last 10 tests)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(v: number, name: string) => [`${v.toFixed(1)}%`, name]}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.title ?? label}
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Score"    stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Accuracy" stroke="#22c55e"              strokeWidth={2} dot={{ r: 4 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Difficulty breakdown */}
      {hasDiff && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">All-time Difficulty Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={difficultyBreakdown.filter(d => d.total > 0).map(d => ({
                  name: d.difficulty.charAt(0) + d.difficulty.slice(1).toLowerCase(),
                  Correct: d.correct, Wrong: d.wrong, Skipped: d.skipped,
                }))}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Correct" stackId="a" fill="#22c55e" maxBarSize={48} />
                <Bar dataKey="Wrong"   stackId="a" fill="#ef4444" maxBarSize={48} />
                <Bar dataKey="Skipped" stackId="a" fill="#94a3b8" radius={[4,4,0,0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
