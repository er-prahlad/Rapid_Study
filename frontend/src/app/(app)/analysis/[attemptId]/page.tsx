"use client";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { attemptApi, AnalysisResponse, SubjectAnalysis, DifficultyAnalysis } from "@/services/attemptApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn, formatTime } from "@/lib/utils";
import {
  BarChart2, Clock, Target, CheckCircle2, XCircle,
  MinusCircle, ArrowLeft, TrendingUp,
} from "lucide-react";
import Link from "next/link";

// Lazy load charts
const LazyCharts = dynamic(() => import("./AnalysisCharts"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 rounded-xl" />,
});

function AccuracyBar({ label, accuracy, correct, total, color }: {
  label: string; accuracy: number; correct: number; total: number; color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-xs">{correct}/{total}</span>
          <span className={cn("font-bold text-sm", color)}>{accuracy.toFixed(1)}%</span>
        </div>
      </div>
      <Progress value={accuracy} className="h-2" />
    </div>
  );
}

function DifficultyCard({ d }: { d: DifficultyAnalysis }) {
  const colorMap: Record<string, string> = {
    EASY:   "border-green-200 bg-green-50",
    MEDIUM: "border-yellow-200 bg-yellow-50",
    HARD:   "border-red-200 bg-red-50",
  };
  const textMap: Record<string, string> = {
    EASY:   "text-green-700",
    MEDIUM: "text-yellow-700",
    HARD:   "text-red-700",
  };

  return (
    <div className={cn("rounded-xl border p-4 space-y-3", colorMap[d.difficulty] ?? "border-border bg-background")}>
      <div className="flex items-center justify-between">
        <span className={cn("font-semibold capitalize", textMap[d.difficulty] ?? "")}>
          {d.difficulty.charAt(0) + d.difficulty.slice(1).toLowerCase()}
        </span>
        <Badge variant="outline" className="text-xs">{d.total} Qs</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div><p className="font-bold text-green-600">{d.correct}</p><p className="text-muted-foreground">Correct</p></div>
        <div><p className="font-bold text-red-600">{d.wrong}</p><p className="text-muted-foreground">Wrong</p></div>
        <div><p className="font-bold text-gray-500">{d.skipped}</p><p className="text-muted-foreground">Skipped</p></div>
      </div>
      <Progress value={d.accuracy} className="h-1.5" />
      <p className="text-xs text-center text-muted-foreground">{d.accuracy.toFixed(1)}% accuracy</p>
    </div>
  );
}

export default function AnalysisPage({ params }: { params: { attemptId: string } }) {
  const attemptId = parseInt(params.attemptId, 10);

  const { data, isLoading } = useQuery({
    queryKey: ["analysis", attemptId],
    queryFn: () => attemptApi.getAnalysis(attemptId),
    enabled: !isNaN(attemptId),
  });

  const a: AnalysisResponse | undefined = data?.data;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_,i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!a) {
    return (
      <div className="text-center py-20 space-y-4">
        <BarChart2 className="h-16 w-16 text-muted-foreground/30 mx-auto" />
        <p className="text-lg font-medium text-muted-foreground">Analysis not available</p>
        <Button variant="outline" asChild><Link href="/tests"><ArrowLeft className="h-4 w-4 mr-2" />Back to Tests</Link></Button>
      </div>
    );
  }

  const accuracyColor = a.accuracy >= 70 ? "text-green-600" : a.accuracy >= 40 ? "text-orange-600" : "text-red-600";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href={`/result/${attemptId}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />Back to Result
      </Link>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-700 p-6 text-white">
        <h1 className="text-xl font-bold mb-1">{a.testTitle}</h1>
        <p className="text-blue-200 text-sm mb-4">Detailed Analysis</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Score",    val: `${a.score}/${a.totalMarks}` },
            { label: "Percent",  val: `${a.percentage.toFixed(1)}%` },
            { label: "Accuracy", val: `${a.accuracy.toFixed(1)}%` },
            { label: "Time",     val: formatTime(a.timeAnalysis?.timeTakenSeconds ?? 0) },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
              <p className="text-xl font-bold">{val}</p>
              <p className="text-blue-200 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-green-50 p-4 text-center">
          <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-green-700">{a.correctAnswers}</p>
          <p className="text-xs text-muted-foreground">Correct</p>
        </div>
        <div className="rounded-xl border bg-red-50 p-4 text-center">
          <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-red-700">{a.wrongAnswers}</p>
          <p className="text-xs text-muted-foreground">Wrong</p>
        </div>
        <div className="rounded-xl border bg-gray-100 p-4 text-center">
          <MinusCircle className="h-5 w-5 text-gray-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-600">{a.unanswered}</p>
          <p className="text-xs text-muted-foreground">Skipped</p>
        </div>
      </div>

      {/* Charts (lazy loaded) */}
      <LazyCharts subjectAnalysis={a.subjectAnalysis} difficultyAnalysis={a.difficultyAnalysis} />

      {/* Subject accuracy bars */}
      {a.subjectAnalysis.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary" />Subject-wise Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {a.subjectAnalysis.map((s) => {
              const color = s.accuracy >= 70 ? "text-green-600" : s.accuracy >= 40 ? "text-orange-600" : "text-red-600";
              return (
                <AccuracyBar key={s.subjectName} label={s.subjectName}
                  accuracy={s.accuracy} correct={s.correct} total={s.total} color={color} />
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Difficulty breakdown */}
      {a.difficultyAnalysis.some(d => d.total > 0) && (
        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />Difficulty Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {a.difficultyAnalysis.filter(d => d.total > 0).map(d => (
              <DifficultyCard key={d.difficulty} d={d} />
            ))}
          </div>
        </div>
      )}

      {/* Time analysis */}
      {a.timeAnalysis && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-primary" />Time Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {[
                { label: "Time Taken",         val: formatTime(a.timeAnalysis.timeTakenSeconds) },
                { label: "Time Remaining",     val: formatTime(a.timeAnalysis.timeRemainingSeconds) },
                { label: "Avg per Question",   val: `${a.timeAnalysis.avgSecondsPerQuestion.toFixed(1)}s` },
                { label: "Questions Attempted",val: String(a.timeAnalysis.questionsAttempted) },
                { label: "Questions Skipped",  val: String(a.timeAnalysis.questionsSkipped) },
                { label: "Total Duration",     val: formatTime(a.timeAnalysis.totalDurationSeconds) },
              ].map(({ label, val }) => (
                <div key={label} className="p-3 rounded-lg bg-muted/40 space-y-1">
                  <p className="text-muted-foreground text-xs">{label}</p>
                  <p className="font-semibold">{val}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topic breakdown */}
      {a.topicAnalysis.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Topic-wise Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {a.topicAnalysis.map((t) => {
                const color = t.accuracy >= 70 ? "text-green-600" : t.accuracy >= 40 ? "text-orange-600" : "text-red-600";
                return (
                  <div key={`${t.subjectName}:${t.topicName}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{t.topicName}</p>
                      <p className="text-xs text-muted-foreground">{t.subjectName}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-right">
                      <span className="text-muted-foreground">{t.correct}/{t.total}</span>
                      <span className={cn("font-bold text-sm w-12", color)}>{t.accuracy.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 pb-8">
        <Button variant="outline" asChild className="flex-1">
          <Link href={`/result/${attemptId}`}><ArrowLeft className="h-4 w-4 mr-2" />Result</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/tests">Take Another Test</Link>
        </Button>
      </div>
    </div>
  );
}
