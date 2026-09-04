"use client";
import { useQuery } from "@tanstack/react-query";
import { attemptApi, ResultResponse, QuestionResultDto } from "@/services/attemptApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn, formatTime } from "@/lib/utils";
import {
  CheckCircle2, XCircle, MinusCircle, Clock,
  Trophy, Target, BookOpen, BarChart2,
  ChevronDown, ChevronUp, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import {
  PieChart, Pie, Cell, Tooltip as RTooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useState } from "react";

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, value, label, sub, color,
}: { icon: React.ComponentType<{ className?: string }>; value: string | number; label: string; sub?: string; color: string }) {
  return (
    <div className={cn("rounded-xl p-4 text-center space-y-1", color)}>
      <Icon className="h-5 w-5 mx-auto mb-1" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium">{label}</p>
      {sub && <p className="text-xs opacity-70">{sub}</p>}
    </div>
  );
}

// ── Question review card ──────────────────────────────────────────────────────

function QuestionReview({ q, index }: { q: QuestionResultDto; index: number }) {
  const [open, setOpen] = useState(false);

  const status = q.wasSkipped ? "skipped"
    : q.isCorrect             ? "correct"
    :                           "wrong";

  const statusConfig = {
    correct: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-200", label: `+${q.marksObtained}` },
    wrong:   { icon: XCircle,      color: "text-red-600",   bg: "bg-red-50 border-red-200",     label: String(q.marksObtained) },
    skipped: { icon: MinusCircle,  color: "text-gray-500",  bg: "bg-gray-50 border-gray-200",   label: "0" },
  }[status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className={cn("rounded-xl border overflow-hidden", statusConfig.bg)}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-black/5 transition-colors"
      >
        <span className="shrink-0 w-7 h-7 rounded-full bg-white border flex items-center justify-center text-xs font-bold">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-2">{q.questionText}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("text-sm font-bold", statusConfig.color)}>{statusConfig.label}</span>
          <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t bg-white/70 px-4 py-4 space-y-4">
          {/* Options */}
          <div className="space-y-2">
            {q.options.map(opt => {
              const isCorrect  = opt.id === q.correctOptionId;
              const isSelected = opt.id === q.selectedOptionId;
              return (
                <div
                  key={opt.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border text-sm",
                    isCorrect  && "border-green-500 bg-green-50",
                    isSelected && !isCorrect && "border-red-400 bg-red-50",
                    !isCorrect && !isSelected && "border-border bg-background"
                  )}
                >
                  <span className={cn(
                    "shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold",
                    isCorrect  ? "border-green-500 bg-green-500 text-white"
                    : isSelected ? "border-red-400 bg-red-400 text-white"
                    : "border-muted-foreground text-muted-foreground"
                  )}>
                    {opt.optionOrder}
                  </span>
                  <span className="flex-1">{opt.optionText}</span>
                  {isCorrect  && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                  {isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Your answer vs correct */}
          <div className="text-xs text-muted-foreground space-y-1">
            {q.selectedOptionId && (
              <p>Your answer: Option {q.options.find(o => o.id === q.selectedOptionId)?.optionOrder ?? "?"}</p>
            )}
            {q.correctOptionId && (
              <p className="text-green-700 font-medium">
                Correct answer: Option {q.options.find(o => o.id === q.correctOptionId)?.optionOrder ?? "?"}
              </p>
            )}
          </div>

          {/* Explanation */}
          {q.explanation && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm">
              <p className="font-medium text-blue-800 mb-1">Explanation</p>
              <p className="text-blue-700">{q.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ResultPage({ params }: { params: { attemptId: string } }) {
  const attemptId = parseInt(params.attemptId, 10);

  const { data, isLoading, error } = useQuery({
    queryKey: ["result", attemptId],
    queryFn:  () => attemptApi.getResult(attemptId),
    enabled:  !isNaN(attemptId),
    retry:    1,
  });

  const result: ResultResponse | undefined = data?.data;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-48 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="text-center py-20 space-y-4">
        <Trophy className="h-16 w-16 text-muted-foreground/30 mx-auto" />
        <p className="text-lg font-medium text-muted-foreground">Result not available</p>
        <p className="text-sm text-muted-foreground">The test may still be in progress or the result could not be loaded.</p>
        <Button variant="outline" asChild><Link href="/tests"><ArrowLeft className="h-4 w-4 mr-2" />Back to Tests</Link></Button>
      </div>
    );
  }

  // ── Charts data ───────────────────────────────────────────────────

  const pieData = [
    { name: "Correct",   value: result.correctAnswers, color: "#22c55e" },
    { name: "Wrong",     value: result.wrongAnswers,   color: "#ef4444" },
    { name: "Unanswered",value: result.unanswered,     color: "#94a3b8" },
  ].filter(d => d.value > 0);

  // Per-difficulty breakdown
  const diffBreakdown: Record<string, { correct: number; wrong: number; skipped: number }> = {};
  result.questions.forEach(q => {
    const d = q.difficulty;
    if (!diffBreakdown[d]) diffBreakdown[d] = { correct: 0, wrong: 0, skipped: 0 };
    if (q.wasSkipped)  diffBreakdown[d].skipped++;
    else if (q.isCorrect) diffBreakdown[d].correct++;
    else               diffBreakdown[d].wrong++;
  });

  const diffChartData = Object.entries(diffBreakdown).map(([diff, v]) => ({
    name: diff.charAt(0) + diff.slice(1).toLowerCase(),
    Correct: v.correct,
    Wrong:   v.wrong,
    Skipped: v.skipped,
  }));

  const scoreColor = result.percentage >= 70 ? "text-green-600"
    : result.percentage >= 40 ? "text-orange-600"
    : "text-red-600";

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ── Back ── */}
      <Link href="/tests" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />Back to Tests
      </Link>

      {/* ── Hero result card ── */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-700 p-6 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative">
          <h1 className="text-lg font-semibold mb-1">{result.testTitle}</h1>
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <p className="text-5xl font-bold">{result.score}/{result.totalMarks}</p>
              <p className="text-blue-200 text-sm mt-1">Final Score</p>
            </div>
            <div className="pb-1 space-y-1">
              <p className="text-2xl font-bold">{result.percentage.toFixed(1)}%</p>
              <p className="text-blue-200 text-sm">Percentage</p>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={result.percentage} className="h-2 bg-white/30 [&>div]:bg-white" />
          </div>
        </div>
      </div>

      {/* ── 4-stat row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={CheckCircle2} value={result.correctAnswers}     label="Correct"    color="bg-green-50 text-green-700" />
        <StatCard icon={XCircle}      value={result.wrongAnswers}        label="Wrong"      color="bg-red-50 text-red-700" />
        <StatCard icon={MinusCircle}  value={result.unanswered}          label="Unanswered" color="bg-gray-100 text-gray-600" />
        <StatCard icon={Target}       value={`${result.accuracy.toFixed(1)}%`} label="Accuracy" color="bg-purple-50 text-purple-700" />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie chart */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />Answer Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time + summary */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />Summary
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { label: "Time taken",      val: formatTime(result.timeTakenSeconds) },
                { label: "Total questions", val: result.questions.length },
                { label: "Attempted",       val: result.correctAnswers + result.wrongAnswers },
                { label: "Score",           val: `${result.score} / ${result.totalMarks}` },
                { label: "Percentage",      val: `${result.percentage.toFixed(2)}%` },
                { label: "Accuracy",        val: `${result.accuracy.toFixed(2)}%` },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between items-center border-b pb-1.5 last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Difficulty breakdown bar chart ── */}
      {diffChartData.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Difficulty-wise Performance</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={diffChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RTooltip />
                <Bar dataKey="Correct" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Wrong"   fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Skipped" fill="#94a3b8" radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* ── Per-question review ── */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Question Review
          <span className="text-sm font-normal text-muted-foreground ml-1">
            (click to expand)
          </span>
        </h2>
        {result.questions.map((q, i) => (
          <QuestionReview key={q.questionId} q={q} index={i} />
        ))}
      </div>

      {/* ── Action buttons ── */}
      <div className="flex flex-col sm:flex-row gap-3 pb-8">
        <Button variant="outline" asChild className="flex-1">
          <Link href="/tests"><ArrowLeft className="h-4 w-4 mr-2" />All Tests</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
