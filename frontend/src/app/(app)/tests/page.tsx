"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockTestApi, MockTestDto, UserTestStatusDto } from "@/services/mockTestApi";
import { examApi } from "@/services/examApi";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, FileText, Target, ChevronRight, BookOpen, Trophy, Radio, CheckCircle, RotateCcw, BarChart3, Play } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";
import { TestLeaderboardModal } from "@/components/TestLeaderboardModal";

function DifficultyBadge({ marks, negativeMarks }: { marks: number; negativeMarks: number }) {
  if (negativeMarks > 0)
    return <Badge variant="warning" className="text-xs">-{negativeMarks} neg</Badge>;
  return <Badge variant="secondary" className="text-xs">No neg</Badge>;
}

function TestCard({
  test,
  status,
  onOpenLeaderboard,
}: {
  test: MockTestDto;
  status?: UserTestStatusDto;
  onOpenLeaderboard: (id: number) => void;
}) {
  const isInProgress = status?.status === "IN_PROGRESS" && status?.activeAttemptId;
  const isCompleted = status?.status === "COMPLETED";

  return (
    <Card className="group border border-border shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col bg-card">
      <CardContent className="p-5 flex flex-col h-full">
        {/* Header badges */}
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {test.liveStatus === "LIVE" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                LIVE
              </span>
            )}
            {test.liveStatus === "UPCOMING" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                ⏳ Upcoming Live
              </span>
            )}
            {test.examName && (
              <Badge variant="outline" className="text-[11px] font-medium">
                {test.examName}
              </Badge>
            )}
          </div>

          <button
            onClick={() => onOpenLeaderboard(test.id)}
            title="View Test Leaderboard"
            className="text-muted-foreground hover:text-amber-500 transition-colors p-1 rounded-md hover:bg-muted"
          >
            <Trophy className="h-4 w-4" />
          </button>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {test.title}
        </h3>
        {test.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{test.description}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 my-2.5">
          <div className="flex flex-col items-center bg-muted/40 rounded-lg p-2 text-center border border-border/40">
            <FileText className="h-3.5 w-3.5 text-blue-500 mb-0.5" />
            <span className="text-sm font-bold text-foreground">{test.totalQuestions}</span>
            <span className="text-[10px] text-muted-foreground uppercase">Questions</span>
          </div>
          <div className="flex flex-col items-center bg-muted/40 rounded-lg p-2 text-center border border-border/40">
            <Target className="h-3.5 w-3.5 text-emerald-500 mb-0.5" />
            <span className="text-sm font-bold text-foreground">{test.totalMarks}</span>
            <span className="text-[10px] text-muted-foreground uppercase">Marks</span>
          </div>
          <div className="flex flex-col items-center bg-muted/40 rounded-lg p-2 text-center border border-border/40">
            <Clock className="h-3.5 w-3.5 text-amber-500 mb-0.5" />
            <span className="text-sm font-bold text-foreground">{test.durationMinutes}m</span>
            <span className="text-[10px] text-muted-foreground uppercase">Duration</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <DifficultyBadge marks={test.totalMarks} negativeMarks={test.negativeMarks} />
          {isCompleted && status?.bestScore !== undefined && (
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[10px]">
              <CheckCircle className="h-3 w-3 mr-1" /> Best: {status.bestScore}/{test.totalMarks}
            </Badge>
          )}
        </div>

        {/* Smart Actions based on Student Attempt Status */}
        <div className="mt-auto pt-2 border-t border-border/40">
          {isInProgress ? (
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm animate-pulse"
              size="sm"
              asChild
            >
              <Link href={`/attempt/${status.activeAttemptId}`}>
                <Play className="h-4 w-4 mr-1.5 fill-current" />
                Resume Test
              </Link>
            </Button>
          ) : isCompleted ? (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link href={`/analysis/${status.lastAttemptId}`}>
                  <BarChart3 className="h-3.5 w-3.5 mr-1" />
                  Analysis
                </Link>
              </Button>
              <Button size="sm" asChild className="text-xs">
                <Link href={`/tests/${test.id}/instructions`}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Re-take
                </Link>
              </Button>
            </div>
          ) : (
            <Button className="w-full" size="sm" asChild>
              <Link href={`/tests/${test.id}/instructions`}>
                Start Test <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TestCardSkeleton() {
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
        <Skeleton className="h-9 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

export default function TestsPage() {
  const [search, setSearch] = useState("");
  const [examId, setExamId] = useState<number | undefined>();
  const [filterType, setFilterType] = useState<"ALL" | "LIVE" | "ATTEMPTED">("ALL");
  const [page, setPage] = useState(0);
  const [leaderboardTestId, setLeaderboardTestId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["tests", debouncedSearch, examId, page],
    queryFn: () => mockTestApi.list({ search: debouncedSearch || undefined, examId, page, size: 12 }),
  });

  const { data: myStatusesData } = useQuery({
    queryKey: ["my-test-statuses"],
    queryFn: () => mockTestApi.getAllMyStatuses(),
  });

  const { data: liveTestsData } = useQuery({
    queryKey: ["live-tests"],
    queryFn: () => mockTestApi.getLiveTests(),
  });

  const { data: examsData } = useQuery({
    queryKey: ["exams-list"],
    queryFn: () => examApi.list({ size: 50 }),
  });

  const tests = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 0;
  const total = data?.data?.totalElements ?? 0;
  const exams = examsData?.data?.content ?? [];
  const myStatuses = myStatusesData?.data ?? {};
  const liveTests = liveTestsData?.data ?? [];

  // Filter tests based on tab
  const displayTests = tests.filter((t) => {
    if (filterType === "LIVE") {
      return t.liveStatus === "LIVE" || t.liveStatus === "UPCOMING";
    }
    if (filterType === "ATTEMPTED") {
      const s = myStatuses[t.id];
      return s && s.attempted;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mock Tests & Exam Simulation</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {total > 0 ? `${total} mock tests available` : "Practice with full-length exam papers"}
          </p>
        </div>

        {/* Live Mocks banner badge */}
        {liveTests.length > 0 && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
            <Radio className="h-4 w-4 animate-pulse" />
            <span className="font-semibold">{liveTests.length} Live / Scheduled Mock Test Active</span>
          </div>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/50 shrink-0">
          <button
            onClick={() => { setFilterType("ALL"); setPage(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === "ALL" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Tests
          </button>
          <button
            onClick={() => { setFilterType("LIVE"); setPage(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              filterType === "LIVE" ? "bg-background text-red-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Live / Scheduled
          </button>
          <button
            onClick={() => { setFilterType("ATTEMPTED"); setPage(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === "ATTEMPTED" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Attempts
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 flex-1 md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9 h-9"
            />
          </div>

          {exams.length > 0 && (
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm w-full sm:w-44"
              value={examId ?? ""}
              onChange={(e) => { setExamId(e.target.value ? Number(e.target.value) : undefined); setPage(0); }}
            >
              <option value="">All Exams</option>
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* PYQ link banner */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Practice under real exam conditions with strict timer & negative marking.</span>
        <Link
          href="/tests/previous-year"
          className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold"
        >
          <FileText className="h-3.5 w-3.5" />
          Previous Year Papers (PYQ) →
        </Link>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <TestCardSkeleton key={i} />)}
        </div>
      ) : displayTests.length === 0 ? (
        <div className="text-center py-20 space-y-4 bg-muted/20 border border-dashed rounded-2xl">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">
            {search ? `No tests matching "${search}"` : "No tests found in this category"}
          </p>
          {(search || examId || filterType !== "ALL") && (
            <Button variant="ghost" onClick={() => { setSearch(""); setExamId(undefined); setFilterType("ALL"); }}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayTests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                status={myStatuses[test.id]}
                onOpenLeaderboard={(id) => setLeaderboardTestId(id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page === 0 || isFetching}
                onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {page + 1} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1 || isFetching}
                onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}

      {/* Test Leaderboard Modal */}
      <TestLeaderboardModal
        testId={leaderboardTestId}
        open={!!leaderboardTestId}
        onOpenChange={(open) => !open && setLeaderboardTestId(null)}
      />
    </div>
  );
}
