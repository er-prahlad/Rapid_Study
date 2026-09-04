"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookmarkApi } from "@/services/bookmarkApi";
import type { QuestionDto } from "@/services/practiceApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, BookmarkX, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

function QuestionCard({ q }: { q: QuestionDto }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const removeMutation = useMutation({
    mutationFn: () => bookmarkApi.remove(q.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
      toast({ title: "Bookmark removed" });
    },
  });

  const diffColor = { EASY: "bg-green-100 text-green-700", MEDIUM: "bg-yellow-100 text-yellow-700", HARD: "bg-red-100 text-red-700" }[q.difficulty] ?? "";

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {q.subjectName && <Badge variant="outline" className="text-xs">{q.subjectName}</Badge>}
              {q.topicName && <Badge variant="secondary" className="text-xs">{q.topicName}</Badge>}
              <Badge className={cn("text-xs border-0", diffColor)}>{q.difficulty}</Badge>
              <span className="text-xs text-muted-foreground ml-auto">+{String(q.marks)} marks</span>
            </div>
            <p className="text-sm font-medium leading-relaxed line-clamp-2">{q.questionText}</p>
          </div>
          <div className="flex gap-1 shrink-0 ml-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(!open)}>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => removeMutation.mutate()} loading={removeMutation.isPending}>
              <BookmarkX className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {open && (
          <div className="mt-4 space-y-2 border-t pt-4">
            {q.options.map(opt => (
              <div key={opt.id} className={cn(
                "flex items-start gap-2 px-3 py-2 rounded-lg text-sm border",
                opt.isCorrect ? "border-green-400 bg-green-50 text-green-800 font-medium" : "border-border"
              )}>
                <span className="shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-semibold">
                  {opt.optionOrder}
                </span>
                {opt.optionText}
              </div>
            ))}
            {q.explanation && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm mt-2">
                <p className="font-medium text-blue-800 mb-1">Explanation</p>
                <p className="text-blue-700">{q.explanation}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function BookmarksPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["bookmarks", page],
    queryFn: () => bookmarkApi.getAll({ page, size: 20 }),
    staleTime: 1000 * 60,
  });

  const questions = (data?.data?.content ?? []) as QuestionDto[];
  const totalPages = data?.data?.totalPages ?? 0;
  const total = data?.data?.totalElements ?? 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-primary" />Bookmarks
        </h1>
        {!isLoading && <p className="text-muted-foreground text-sm mt-0.5">{total} saved questions</p>}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">No bookmarks yet</p>
          <p className="text-sm text-muted-foreground">While practising, bookmark questions to review them later.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {questions.map(q => <QuestionCard key={q.id} q={q} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
