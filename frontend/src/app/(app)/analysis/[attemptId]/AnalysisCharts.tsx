"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubjectAnalysis, DifficultyAnalysis } from "@/services/attemptApi";

interface Props {
  subjectAnalysis:    SubjectAnalysis[];
  difficultyAnalysis: DifficultyAnalysis[];
}

export default function AnalysisCharts({ subjectAnalysis, difficultyAnalysis }: Props) {
  const hasSubjects    = subjectAnalysis.length > 0;
  const hasDifficulty  = difficultyAnalysis.some(d => d.total > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Subject accuracy bar chart */}
      {hasSubjects && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Subject Accuracy (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectAnalysis} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="subjectName" tick={{ fontSize: 10 }} tickLine={false}
                  interval={0} angle={-20} textAnchor="end" height={40} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, "Accuracy"]}
                  contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Difficulty stacked bar */}
      {hasDifficulty && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Correct / Wrong / Skipped</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={difficultyAnalysis.filter(d => d.total > 0).map(d => ({
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
                <Bar dataKey="Correct" stackId="a" fill="#22c55e" radius={[0,0,0,0]} maxBarSize={48} />
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
