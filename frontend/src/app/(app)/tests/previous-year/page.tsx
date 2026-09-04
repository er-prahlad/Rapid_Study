"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockTestApi, MockTestDto } from "@/services/mockTestApi";
import { examApi } from "@/services/examApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Clock, FileText, Target, Calendar, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import apiClient from "@/services/apiClient";
import type { ApiResponse } from "@/types";
import type { PageResponse } from "@/types/exam";
import { useDebounce } from "@/hooks/use-debounce";

function PaperCard({ test }: { test: MockTestDto }) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {(test as any).paperYear && (
            <Badge className="bg-purple-100 text-purple-800 border-0 text-xs">
              <Calendar className="h-3 w-3 mr-1" />{(test as any).paperYear}
            </Badge>
          )}
          {test.examName && <Badge variant="secondary" className="text-xs">{test.examName}</Badge>}
        </div>
        <h3 className="font-semibold text-sm mb-3 flex-1">{test.title}</h3>
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-4">
          <div className="flex flex-col items-center bg-blue-50 rounded-lg p-2">
            <FileText className="h-3.5 w-3.5 text-blue-600 mb-0.5" />
            <span className="font-bold text-blue-700">{test.totalQuestions}</span>
            <span>Qs</span>
          </div>
          <div className="flex flex-col items-center bg-green-50 rounded-lg p-2">
            <Target className="h-3.5 w-3.5 text-green-600 mb-0.5" />
            <span className="font-bold text-green-700">{String(test.totalMarks)}</span>
            <span>Marks</span>
          </div>
          <div className="flex flex-col items-center bg-orange-50 rounded-lg p-2">
            <Clock className="h-3.5 w-3.5 text-orange-600 mb-0.5" />
            <span className="font-bold text-orange-700">{test.durationMinutes}m</span>
            <span>Time</span>
          </div>
        </div>
        <Button size="sm" className="w-full mt-auto" asChild>
          <Link href={`/tests/${test.id}/instructions`}>Attempt Paper</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PreviousYearPage() {
  const [search, setSearch] = useState("");
  const [examId, setExamId] = useState<number | undefined>();
  const [page, setPage]     = useState(0);
  const debSearch           = useDebounce(search, 350);

  const { data, isLoading } = useQuery({
    queryKey: ["pyp", debSearch, examId, page],
    queryFn: () => apiClient
      .get<ApiResponse<PageResponse<MockTestDto>>>("/tests/previous-year", {
        params: { examId, page, size: 12 },
      })
      .then(r => r.data),
    staleTime: 1000 * 60 * 10,
  });

  const { data: examsData } = useQuery({
    queryKey: ["exams-list"],
    queryFn: () => examApi.list({ size: 50 }),
  });

  const papers  = data?.data?.content ?? [];
  const total   = data?.data?.totalElements ?? 0;
  const totalPg = data?.data?.totalPages ?? 0;
  const exams   = examsData?.data?.content ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/tests" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Previous Year Papers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} papers available</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search papers…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        {exams.length > 0 && (
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm w-40"
            value={examId ?? ""}
            onChange={e => { setExamId(e.target.value ? Number(e.target.value) : undefined); setPage(0); }}>
            <option value="">All Exams</option>
            {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
          </select>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">No previous year papers yet</p>
          <p className="text-sm text-muted-foreground">
            Admin can add papers by setting Paper Type = PREVIOUS_YEAR when creating a mock test.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {papers.map(p => <PaperCard key={p.id} test={p} />)}
          </div>
          {totalPg > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPg}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPg - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
