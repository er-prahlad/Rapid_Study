"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockTestApi, MockTestDto } from "@/services/mockTestApi";
import { examApi } from "@/services/examApi";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, FileText, Target, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";

function DifficultyBadge({ marks, negativeMarks }: { marks: number; negativeMarks: number }) {
  if (negativeMarks > 0)
    return <Badge variant="warning" className="text-xs">-{negativeMarks} negative</Badge>;
  return <Badge variant="secondary" className="text-xs">No negative</Badge>;
}

function TestCard({ test }: { test: MockTestDto }) {
  return (
    <Card className="group border-0 shadow-sm hover:shadow-md transition-all duration-200 h-full">
      <CardContent className="p-5 flex flex-col h-full">
        {/* Title */}
        <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {test.title}
        </h3>
        {test.examName && (
          <p className="text-xs text-muted-foreground mb-3">{test.examName}</p>
        )}
        {test.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{test.description}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 my-3">
          <div className="flex flex-col items-center bg-blue-50 rounded-lg p-2 text-center">
            <FileText className="h-3.5 w-3.5 text-blue-600 mb-0.5" />
            <span className="text-sm font-bold text-blue-700">{test.totalQuestions}</span>
            <span className="text-xs text-muted-foreground">Qs</span>
          </div>
          <div className="flex flex-col items-center bg-green-50 rounded-lg p-2 text-center">
            <Target className="h-3.5 w-3.5 text-green-600 mb-0.5" />
            <span className="text-sm font-bold text-green-700">{test.totalMarks}</span>
            <span className="text-xs text-muted-foreground">Marks</span>
          </div>
          <div className="flex flex-col items-center bg-orange-50 rounded-lg p-2 text-center">
            <Clock className="h-3.5 w-3.5 text-orange-600 mb-0.5" />
            <span className="text-sm font-bold text-orange-700">{test.durationMinutes}</span>
            <span className="text-xs text-muted-foreground">Mins</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <DifficultyBadge marks={test.totalMarks} negativeMarks={test.negativeMarks} />
        </div>

        <div className="mt-auto">
          <Button className="w-full" size="sm" asChild>
            <Link href={`/tests/${test.id}/instructions`}>
              Start Test <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TestCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
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
  const [search, setSearch]   = useState("");
  const [examId, setExamId]   = useState<number | undefined>();
  const [page, setPage]       = useState(0);
  const debouncedSearch       = useDebounce(search, 350);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["tests", debouncedSearch, examId, page],
    queryFn:  () => mockTestApi.list({ search: debouncedSearch || undefined, examId, page, size: 12 }),
  });

  const { data: examsData } = useQuery({
    queryKey: ["exams-list"],
    queryFn:  () => examApi.list({ size: 50 }),
  });

  const tests      = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 0;
  const total      = data?.data?.totalElements ?? 0;
  const exams      = examsData?.data?.content ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mock Tests</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {total > 0 ? `${total} tests available` : "Practice with full-length mock tests"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>

        {exams.length > 0 && (
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm w-full sm:w-48"
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

      {/* Previous Year Papers link */}
      <div className="flex items-center justify-between">
        <Link href="/tests/previous-year"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
          <FileText className="h-4 w-4" />Previous Year Papers →
        </Link>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <TestCardSkeleton key={i} />)}
        </div>
      ) : tests.length === 0 ? (        <div className="text-center py-20 space-y-4">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">
            {search ? `No tests matching "${search}"` : "No tests published yet"}
          </p>
          {(search || examId) && (
            <Button variant="ghost" onClick={() => { setSearch(""); setExamId(undefined); }}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tests.map(test => <TestCard key={test.id} test={test} />)}
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
    </div>
  );
}
