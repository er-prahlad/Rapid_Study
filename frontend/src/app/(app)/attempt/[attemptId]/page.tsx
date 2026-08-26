"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attemptApi, QuestionState, QuestionStateDto } from "@/services/attemptApi";
import type { QuestionSafeDto, OptionDto } from "@/services/mockTestApi";
import { useServerTimer } from "@/hooks/use-server-timer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, ChevronRight, Clock, AlertTriangle,
  CheckCircle2, Flag, X, Send,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LocalState {
  selectedOptionId: number | null;
  markedForReview:  boolean;
  visited:          boolean;
}

// ── Question palette button ───────────────────────────────────────────────────

function PaletteButton({
  order, state, active, onClick,
}: { order: number; state: QuestionState; active: boolean; onClick: () => void }) {
  const colorMap: Record<QuestionState, string> = {
    NOT_VISITED:          "bg-gray-100 text-gray-600 border-gray-200",
    VISITED:              "bg-white text-gray-600 border-gray-300",
    ANSWERED:             "bg-green-500 text-white border-green-500",
    MARKED_FOR_REVIEW:    "bg-orange-400 text-white border-orange-400",
    ANSWERED_AND_MARKED:  "bg-purple-500 text-white border-purple-500",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-8 h-8 rounded-lg border text-xs font-semibold transition-all",
        colorMap[state],
        active && "ring-2 ring-primary ring-offset-1"
      )}
    >
      {order}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AttemptPage({ params }: { params: { attemptId: string } }) {
  const attemptId = parseInt(params.attemptId, 10);
  const router    = useRouter();
  const qc        = useQueryClient();

  // ── Fetch attempt status on mount (restores state after refresh) ──
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["attempt-status", attemptId],
    queryFn:  () => attemptApi.getStatus(attemptId),
    retry:    false,
  });

  // ── Fetch questions if status loaded ──────────────────────────────
  const [questions, setQuestions]       = useState<QuestionSafeDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ── Local state map: questionId → { selectedOptionId, markedForReview, visited }
  const [localState, setLocalState] = useState<Record<number, LocalState>>({});

  // Sync localState from server on first load
  useEffect(() => {
    if (!statusData?.data) return;
    const { questionStates } = statusData.data;
    if (!questionStates) return;

    const init: Record<number, LocalState> = {};
    questionStates.forEach(qs => {
      init[qs.questionId] = {
        selectedOptionId: qs.selectedOptionId ?? null,
        markedForReview:  qs.markedForReview,
        visited:          qs.state !== "NOT_VISITED",
      };
    });
    setLocalState(init);
  }, [statusData]);

  // Fetch questions separately (they come from the start attempt call — but we can
  // refetch them using the test questions endpoint for resume case)
  const attempt  = statusData?.data;
  const testId   = attempt?.mockTestId;

  const { data: questionsData } = useQuery({
    queryKey: ["test-questions-safe", testId],
    queryFn:  () =>
      import("@/services/mockTestApi").then(m => m.mockTestApi.getQuestions(testId!)),
    enabled:  !!testId,
  });

  useEffect(() => {
    if (questionsData?.data) setQuestions(questionsData.data);
  }, [questionsData]);

  // ── Phase 24: Server-authoritative timer ──────────────────────────
  const { formatted, isWarning, isCritical } = useServerTimer(
    attempt?.expiresAt ?? null,
    () => {
      toast({ title: "Time's up! Auto-submitting...", variant: "destructive" });
      handleSubmit();
    }
  );

  // ── Mutations ────────────────────────────────────────────────────

  const saveAnswerMutation = useMutation({
    mutationFn: ({ qId, optId }: { qId: number; optId: number }) =>
      attemptApi.saveAnswer(attemptId, qId, optId),
    onError: () => toast({ title: "Failed to save answer", variant: "destructive" }),
  });

  const clearAnswerMutation = useMutation({
    mutationFn: (qId: number) => attemptApi.clearAnswer(attemptId, qId),
    onError: () => toast({ title: "Failed to clear answer", variant: "destructive" }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ qId, mark }: { qId: number; mark: boolean }) =>
      mark
        ? attemptApi.markForReview(attemptId, qId)
        : attemptApi.unmarkReview(attemptId, qId),
  });

  // ── Helpers ───────────────────────────────────────────────────────

  const currentQuestion = questions[currentIndex];
  const currentQId      = currentQuestion?.id;

  const getState = useCallback((qId: number): LocalState => {
    return localState[qId] ?? { selectedOptionId: null, markedForReview: false, visited: false };
  }, [localState]);

  const deriveState = (s: LocalState): QuestionState => {
    if (s.selectedOptionId !== null && s.markedForReview) return "ANSWERED_AND_MARKED";
    if (s.selectedOptionId !== null)  return "ANSWERED";
    if (s.markedForReview)            return "MARKED_FOR_REVIEW";
    if (s.visited)                    return "VISITED";
    return "NOT_VISITED";
  };

  // Mark current question as visited when navigating to it
  useEffect(() => {
    if (!currentQId) return;
    setLocalState(prev => ({
      ...prev,
      [currentQId]: { ...prev[currentQId] ?? { selectedOptionId: null, markedForReview: false }, visited: true },
    }));
  }, [currentQId]);

  // ── Actions ───────────────────────────────────────────────────────

  const selectOption = (optId: number) => {
    if (!currentQId) return;
    setLocalState(prev => ({
      ...prev,
      [currentQId]: { ...getState(currentQId), selectedOptionId: optId },
    }));
    saveAnswerMutation.mutate({ qId: currentQId, optId });
  };

  const clearOption = () => {
    if (!currentQId) return;
    setLocalState(prev => ({
      ...prev,
      [currentQId]: { ...getState(currentQId), selectedOptionId: null },
    }));
    clearAnswerMutation.mutate(currentQId);
  };

  const toggleReview = () => {
    if (!currentQId) return;
    const cur  = getState(currentQId);
    const mark = !cur.markedForReview;
    setLocalState(prev => ({
      ...prev,
      [currentQId]: { ...cur, markedForReview: mark },
    }));
    reviewMutation.mutate({ qId: currentQId, mark });
  };

  const saveAndNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1);
  };

  const handleSubmit = useCallback(() => {
    router.push(`/result/${attemptId}`);
  }, [attemptId, router]);

  // ── Loading ───────────────────────────────────────────────────────

  if (statusLoading || !attempt) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="h-14 border-b flex items-center px-4 gap-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-20 ml-auto" />
        </div>
        <div className="flex-1 flex gap-4 p-4">
          <Skeleton className="flex-1 rounded-xl" />
          <Skeleton className="w-60 rounded-xl" />
        </div>
      </div>
    );
  }

  const curState = currentQId ? getState(currentQId) : null;

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-background flex flex-col">

      {/* ── Topbar ── */}
      <header className="h-14 border-b bg-background flex items-center gap-4 px-4 shrink-0">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{attempt.testTitle}</p>
          <p className="text-xs text-muted-foreground">
            Q {currentIndex + 1} of {questions.length}
          </p>
        </div>

        {/* Phase 24: Server timer (display only) */}
        <div className={cn(
          "flex items-center gap-1.5 font-mono font-bold text-base px-3 py-1.5 rounded-lg",
          isCritical ? "bg-red-100 text-red-700 animate-pulse" :
          isWarning  ? "bg-orange-100 text-orange-700" :
                       "bg-muted text-foreground"
        )}>
          <Clock className="h-4 w-4" />
          {formatted}
        </div>

        <Button size="sm" onClick={handleSubmit} className="gap-1.5 shrink-0">
          <Send className="h-4 w-4" />
          Submit
        </Button>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Question area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {!currentQuestion ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading questions…</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">

              {/* Question header */}
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {currentIndex + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="outline" className="text-xs capitalize">
                      {currentQuestion.difficulty?.toLowerCase()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      +{String(currentQuestion.marks)} marks
                    </Badge>
                    {Number(currentQuestion.negativeMarks) > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        -{String(currentQuestion.negativeMarks)} negative
                      </Badge>
                    )}
                    {curState?.markedForReview && (
                      <Badge className="text-xs bg-orange-500">
                        <Flag className="h-3 w-3 mr-1" />Flagged
                      </Badge>
                    )}
                  </div>
                  <p className="text-base font-medium leading-relaxed">
                    {currentQuestion.questionText}
                  </p>
                  {currentQuestion.questionTextHindi && (
                    <p className="text-sm text-muted-foreground mt-1 font-devanagari">
                      {currentQuestion.questionTextHindi}
                    </p>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt) => {
                  const isSelected = curState?.selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectOption(opt.id)}
                      className={cn(
                        "w-full text-left rounded-xl border p-4 text-sm transition-all",
                        "hover:border-primary/40 hover:bg-primary/5",
                        isSelected
                          ? "border-primary bg-primary/10 font-medium"
                          : "border-border bg-background"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className={cn(
                          "shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold",
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-muted-foreground text-muted-foreground"
                        )}>
                          {opt.optionOrder}
                        </span>
                        <div>
                          <span>{opt.optionText}</span>
                          {opt.optionTextHindi && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {opt.optionTextHindi}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Phase 25: Action row */}
              <div className="flex items-center gap-2 flex-wrap pt-2">
                <Button variant="outline" size="sm" onClick={clearOption}
                  disabled={!curState?.selectedOptionId}>
                  <X className="h-3.5 w-3.5 mr-1" />Clear
                </Button>
                <Button
                  variant={curState?.markedForReview ? "default" : "outline"}
                  size="sm"
                  onClick={toggleReview}
                  className={curState?.markedForReview ? "bg-orange-500 hover:bg-orange-600" : ""}
                >
                  <Flag className="h-3.5 w-3.5 mr-1" />
                  {curState?.markedForReview ? "Unmark" : "Mark for Review"}
                </Button>
                <Button size="sm" className="ml-auto" onClick={saveAndNext}
                  disabled={currentIndex >= questions.length - 1}>
                  Save &amp; Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {/* Prev / Next */}
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setCurrentIndex(i => i - 1)}
                  disabled={currentIndex === 0}>
                  <ChevronLeft className="h-4 w-4 mr-1" />Previous
                </Button>
                <Button variant="outline" onClick={() => setCurrentIndex(i => i + 1)}
                  disabled={currentIndex >= questions.length - 1}>
                  Next<ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Phase 25: Question Palette sidebar */}
        <aside className="hidden lg:flex w-64 border-l bg-muted/20 flex-col p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold mb-3">Question Palette</h3>

          {/* Legend */}
          <div className="space-y-1.5 text-xs mb-4">
            {[
              { color: "bg-green-500",  label: "Answered" },
              { color: "bg-orange-400", label: "Marked for Review" },
              { color: "bg-purple-500", label: "Answered + Marked" },
              { color: "bg-gray-100 border border-gray-300", label: "Not Visited" },
              { color: "bg-white border border-gray-300", label: "Visited" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={cn("w-4 h-4 rounded", color)} />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex flex-wrap gap-1.5">
            {questions.map((q, idx) => {
              const s = getState(q.id);
              return (
                <PaletteButton
                  key={q.id}
                  order={idx + 1}
                  state={deriveState(s)}
                  active={idx === currentIndex}
                  onClick={() => setCurrentIndex(idx)}
                />
              );
            })}
          </div>

          {/* Stats */}
          {questions.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-background border text-xs space-y-1.5">
              {[
                { label: "Answered",     val: Object.values(localState).filter(s => s.selectedOptionId !== null).length, color: "text-green-600" },
                { label: "Not Answered", val: questions.length - Object.values(localState).filter(s => s.selectedOptionId !== null).length, color: "text-muted-foreground" },
                { label: "Flagged",      val: Object.values(localState).filter(s => s.markedForReview).length, color: "text-orange-600" },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={cn("font-semibold", color)}>{val}</span>
                </div>
              ))}
            </div>
          )}

          <Button className="mt-4" onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-2" />Submit Test
          </Button>
        </aside>
      </div>
    </div>
  );
}
