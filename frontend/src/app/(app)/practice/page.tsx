"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import type { ApiResponse } from "@/types";
import type { QuestionSafeDto } from "@/services/mockTestApi";
import type { PageResponse } from "@/types/exam";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { examApi } from "@/services/examApi";

type AnswerState = Record<number, number | null>; // questionId -> selectedOptionId
type RevealState = Record<number, boolean>;        // questionId -> revealed

function QuestionCard({
  question, answered, revealed,
  onAnswer, onReveal,
}: {
  question: QuestionSafeDto;
  answered: number | null | undefined;
  revealed: boolean;
  onAnswer: (qId: number, optId: number) => void;
  onReveal: (qId: number) => void;
}) {
  const diffColor = {
    EASY:   "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HARD:   "bg-red-100 text-red-700",
  }[question.difficulty] ?? "";

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          {question.topicName && (
            <Badge variant="outline" className="text-xs">{question.topicName}</Badge>
          )}
          <Badge className={cn("text-xs border-0", diffColor)}>
            {question.difficulty}
          </Badge>
          <span className="text-xs text-muted-foreground ml-auto">
            {Number(question.marks)} mark{Number(question.marks) !== 1 ? "s" : ""}
            {Number(question.negativeMarks) > 0 && ` · -${question.negativeMarks} negative`}
          </span>
        </div>

        {/* Question text */}
        <p className="text-base font-medium leading-relaxed">{question.questionText}</p>

        {/* Options */}
        <div className="space-y-2">
          {question.options.map(opt => {
            const selected = answered === opt.id;
            return (
              <button
                key={opt.id}
                disabled={revealed}
                onClick={() => !revealed && onAnswer(question.id, opt.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all",
                  "hover:border-primary/50 hover:bg-primary/5",
                  selected && !revealed && "border-primary bg-primary/10 text-primary font-medium",
                  revealed && "cursor-default",
                )}
              >
                <span className="flex items-center gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold">
                    {opt.optionOrder}
                  </span>
                  {opt.optionText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        {!revealed ? (
          <Button
            variant="outline" size="sm"
            disabled={!answered}
            onClick={() => onReveal(question.id)}
          >
            Show Answer
          </Button>
        ) : (
          <div className="rounded-lg bg-muted/40 p-4 text-sm space-y-2">
            <p className="font-medium flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Answer revealed
            </p>
            {question.questionText && (
              <p className="text-muted-foreground">
                Practice mode — full explanations available after Phase 34 implementation.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PracticePage() {
  const [topicId, setTopicId]   = useState<number | undefined>();
  const [difficulty, setDiff]   = useState<string>("");
  const [page, setPage]         = useState(0);
  const [answers, setAnswers]   = useState<AnswerState>({});
  const [revealed, setRevealed] = useState<RevealState>({});

  const params: Record<string, unknown> = { page, size: 10 };
  if (topicId)    params.topicId    = topicId;
  if (difficulty) params.difficulty = difficulty;

  const { data, isLoading } = useQuery({
    queryKey: ["practice", topicId, difficulty, page],
    queryFn:  () => apiClient
      .get<ApiResponse<PageResponse<QuestionSafeDto>>>("/practice/questions", { params })
      .then(r => r.data),
  });

  const questions  = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 0;
  const total      = data?.data?.totalElements ?? 0;

  const handleAnswer = (qId: number, optId: number) =>
    setAnswers(prev => ({ ...prev, [qId]: optId }));

  const handleReveal = (qId: number) =>
    setRevealed(prev => ({ ...prev, [qId]: true }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Practice</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {total > 0 ? `${total} questions available` : "Practice individual questions at your own pace"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[160px]"
          value={difficulty}
          onChange={e => { setDiff(e.target.value); setPage(0); }}
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        {(difficulty) && (
          <Button variant="ghost" size="sm" onClick={() => { setDiff(""); setTopicId(undefined); setPage(0); }}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Questions */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                {[...Array(4)].map((_, j) => <Skeleton key={j} className="h-12 rounded-lg" />)}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">No questions available</p>
          <p className="text-sm text-muted-foreground">Questions will appear after admin adds them to the question bank.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {questions.map(q => (
              <QuestionCard
                key={q.id} question={q}
                answered={answers[q.id]}
                revealed={!!revealed[q.id]}
                onAnswer={handleAnswer}
                onReveal={handleReveal}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0}
                onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
