"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { examApi } from "@/services/examApi";
import { ExamDto } from "@/types/exam";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, BookOpen, ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";

const EXAM_COLORS: Record<string, string> = {
  SSC_CGL:   "from-blue-500 to-blue-700",
  SSC_CHSL:  "from-indigo-500 to-indigo-700",
  UPSC:      "from-purple-500 to-purple-700",
  UPSC_CSE:  "from-purple-500 to-purple-700",
  BPSC:      "from-green-500 to-green-700",
  RAILWAY:   "from-orange-500 to-orange-700",
  BANK_PO:   "from-teal-500 to-teal-700",
  SSC:       "from-blue-500 to-blue-700",
};

function getGradient(code: string): string {
  return EXAM_COLORS[code] ?? "from-gray-500 to-gray-700";
}

function ExamCard({ exam }: { exam: ExamDto }) {
  return (
    <Link href={`/exams/${exam.id}`}>
      <Card className="group border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden h-full">
        {/* Gradient header */}
        <div className={`h-24 bg-gradient-to-br ${getGradient(exam.code)} flex items-center justify-center relative`}>
          <span className="text-white font-bold text-2xl tracking-wide">
            {exam.code.replace(/_/g, " ").split(" ")[0]}
          </span>
          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
            {exam.name}
          </h3>
          {exam.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {exam.description}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{exam.code}</Badge>
            {!exam.isActive && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ExamCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <Skeleton className="h-24 w-full rounded-none" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

export default function ExamsPage() {
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(0);
  const debouncedSearch       = useDebounce(search, 350);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["exams", debouncedSearch, page],
    queryFn:  () => examApi.list({ search: debouncedSearch || undefined, page, size: 12 }),
  });

  const exams      = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 0;
  const total      = data?.data?.totalElements ?? 0;

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Exams</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Choose an exam to explore subjects and mock tests
          </p>
        </div>
        {!isLoading && (
          <span className="text-sm text-muted-foreground">{total} exams available</span>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search exams…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <ExamCardSkeleton key={i} />)}
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <GraduationCap className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">
            {search ? `No exams found for "${search}"` : "No exams available yet"}
          </p>
          {search && (
            <Button variant="ghost" onClick={() => handleSearch("")}>Clear search</Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {exams.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0 || isFetching}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1 || isFetching}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
