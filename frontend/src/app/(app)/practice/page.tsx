"use client";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { practiceApi, QuestionDto, PracticeMode } from "@/services/practiceApi";
import { bookmarkApi } from "@/services/bookmarkApi";
import { examApi } from "@/services/examApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, ChevronRight, BookOpen, Bookmark,
  CheckCircle2, XCircle, RotateCcw, Zap, Brain, Target,
  AlertTriangle, History,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

// ── Mode config ───────────────────────────────────────────────────────────────

const MODES: { value: PracticeMode; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { value: "RANDOM",            label: "Random",           icon: Zap,           desc: "Mix of all questions" },
  { value: "DIFFICULTY",        label: "By Difficulty",    icon: Target,        desc: "Easy, Medium or Hard" },
  { value: "TOPIC",             label: "By Topic",         icon: BookOpen,      desc: "Focus on one topic" },
  { value: "WEAK_AREA",         label: "Weak Areas",       icon: Brain,         desc: "Topics you score low in" },
  { value: "PREVIOUS_MISTAKES", label: "My Mistakes",      icon: History,       desc: "Questions you got wrong" },
];

// ── Question card ─────────────────────────────────────────────────────────────

interface QuestionState {
  selectedOptionId: number | null;
  revealed: boolean;
}

function PracticeQuestion({
  q, state, onSelect, onReveal, onBookmark, bookmarked,
}: {
  q: QuestionDto;
  state: QuestionState;
  onSelect: (optId: number) => void;
  onReveal: () => void;
  onBookmark: () => void;
  bookmarked: boolean;
}) {
  const diffColor = {
    EASY:   "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HARD:   "bg-red-100 text-red-700",
  }[q.difficulty] ?? "";

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {q.topicName   && <Badge variant="outline"    className="text-xs">{q.topicName}</Badge>}
            {q.subjectName && <Badge variant="secondary"  className="text-xs">{q.subjectName}</Badge>}
            <Badge className={cn("text-xs border-0", diffColor)}>{q.difficulty}</Badge>
            <span className="text-xs text-muted-foreground">+{String(q.marks)} marks</span>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={onBookmark}
            title={bookmarked ? "Remove bookmark" : "Bookmark"}>
            <Bookmark className={cn("h-4 w-4", bookmarked ? "fill-primary text-primary" : "")} />
          </Button>
        </div>

        {/* Question */}
        <p className="text-base font-medium leading-relaxed">{q.questionText}</p>
        {q.questionTextHindi && (
          <p className="text-sm text-muted-foreground">{q.questionTextHindi}</p>
        )}

        {/* Options */}
        <div className="space-y-2">
          {q.options.map(opt => {
            const isSelected = state.selectedOptionId === opt.id;
            const showResult = state.revealed;
            const isCorrect  = opt.isCorrect === true;

            let cls = "border-border bg-background hover:border-primary/40 hover:bg-primary/5";
            if (showResult && isCorrect)                      cls = "border-green-500 bg-green-50";
            else if (showResult && isSelected && !isCorrect)  cls = "border-red-400 bg-red-50";
            else if (!showResult && isSelected)               cls = "border-primary bg-primary/10";

            return (
              <button key={opt.id} disabled={showResult}
                onClick={() => !showResult && onSelect(opt.id)}
                className={cn("w-full text-left rounded-xl border p-4 text-sm transition-all flex items-start gap-3", cls)}>
                <span className={cn(
                  "shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold",
                  showResult && isCorrect ? "border-green-500 bg-green-500 text-white"
                  : showResult && isSelected ? "border-red-400 bg-red-400 text-white"
                  : isSelected ? "border-primary bg-primary text-white"
                  : "border-muted-foreground text-muted-foreground"
                )}>
                  {opt.optionOrder}
                </span>
                <div>
                  <span>{opt.optionText}</span>
                  {opt.optionTextHindi && <p className="text-xs text-muted-foreground mt-0.5">{opt.optionTextHindi}</p>}
                </div>
                {showResult && isCorrect  && <CheckCircle2 className="ml-auto h-4 w-4 text-green-600 shrink-0" />}
                {showResult && isSelected && !isCorrect && <XCircle className="ml-auto h-4 w-4 text-red-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        {!state.revealed ? (
          <Button variant="outline" size="sm" disabled={!state.selectedOptionId} onClick={onReveal}>
            Show Answer
          </Button>
        ) : (
          <div className="space-y-3">
            {/* Result banner */}
            <div className={cn(
              "rounded-lg p-3 text-sm font-medium flex items-center gap-2",
              state.selectedOptionId === null
                ? "bg-gray-100 text-gray-700"
                : q.options.find(o => o.id === state.selectedOptionId)?.isCorrect
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
            )}>
              {state.selectedOptionId === null
                ? <><AlertTriangle className="h-4 w-4" /> Skipped</>
                : q.options.find(o => o.id === state.selectedOptionId)?.isCorrect
                  ? <><CheckCircle2 className="h-4 w-4" /> Correct! +{String(q.marks)} marks</>
                  : <><XCircle className="h-4 w-4" /> Wrong — -{String(q.negativeMarks)} marks</>
              }
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
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PracticePage() {
  const qc = useQueryClient();

  // Mode & filter state
  const [mode, setMode]           = useState<PracticeMode>("RANDOM");
  const [difficulty, setDifficulty] = useState<string>("");
  const [topicId, setTopicId]     = useState<number | undefined>();
  const [page, setPage]           = useState(0);
  const [started, setStarted]     = useState(false);

  // Per-question state: optionSelected + revealed
  const [states, setStates]       = useState<Record<number, QuestionState>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [currentIdx, setCurrentIdx] = useState(0);

  // Stats
  const [stats, setStats]         = useState({ correct: 0, wrong: 0, skipped: 0 });

  // Questions query
  const isMistakesMode = mode === "PREVIOUS_MISTAKES" || mode === "WEAK_AREA";
  const { data, isLoading } = useQuery({
    queryKey: ["practice-q", mode, difficulty, topicId, page],
    queryFn: () => isMistakesMode
      ? practiceApi.getWrongQuestions({ page, size: 10 })
      : practiceApi.getQuestions({
          topicId,
          difficulty: difficulty || undefined,
          page, size: 10,
        }),
    enabled: started,
    staleTime: 0,
  });

  const questions = (data?.data?.content ?? []) as QuestionDto[];
  const totalPages = data?.data?.totalPages ?? 0;
  const current = questions[currentIdx];

  // Bookmark toggle
  const bookmarkMutation = useMutation({
    mutationFn: (qId: number) =>
      bookmarkedIds.has(qId) ? bookmarkApi.remove(qId) : bookmarkApi.add(qId),
    onSuccess: (_, qId) => {
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        if (next.has(qId)) { next.delete(qId); toast({ title: "Bookmark removed" }); }
        else { next.add(qId); toast({ title: "Bookmarked!" }); }
        return next;
      });
    },
  });

  const handleSelect = useCallback((qId: number, optId: number) => {
    setStates(prev => ({ ...prev, [qId]: { selectedOptionId: optId, revealed: false } }));
  }, []);

  const handleReveal = useCallback((q: QuestionDto) => {
    const state = states[q.id];
    const selected = state?.selectedOptionId ?? null;
    const correct = q.options.find(o => o.id === selected)?.isCorrect === true;
    setStates(prev => ({ ...prev, [q.id]: { ...prev[q.id], revealed: true } }));
    setStats(prev => ({
      correct:  prev.correct  + (correct ? 1 : 0),
      wrong:    prev.wrong    + (!correct && selected ? 1 : 0),
      skipped:  prev.skipped  + (!selected ? 1 : 0),
    }));
  }, [states]);

  const reset = () => {
    setStarted(false); setStates({}); setCurrentIdx(0);
    setStats({ correct: 0, wrong: 0, skipped: 0 }); setPage(0);
  };

  // ── Mode selection screen ──
  if (!started) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Practice</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Choose a practice mode to begin</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MODES.map(m => {
            const Icon = m.icon;
            return (
              <button key={m.value} onClick={() => setMode(m.value)}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all hover:border-primary/50 hover:bg-primary/5",
                  mode === m.value ? "border-primary bg-primary/10" : "border-border"
                )}>
                <Icon className={cn("h-5 w-5 mb-2", mode === m.value ? "text-primary" : "text-muted-foreground")} />
                <p className={cn("font-medium text-sm", mode === m.value ? "text-primary" : "")}>{m.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Filters for DIFFICULTY and TOPIC modes */}
        {mode === "DIFFICULTY" && (
          <div className="flex gap-2">
            {["EASY","MEDIUM","HARD"].map(d => (
              <Button key={d} variant={difficulty === d ? "default" : "outline"} size="sm"
                onClick={() => setDifficulty(d)}>
                {d.charAt(0) + d.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>
        )}

        <Button className="w-full" size="lg" onClick={() => setStarted(true)}>
          Start Practice
        </Button>
      </div>
    );
  }

  // ── Practice session ──
  const answeredCount = Object.values(states).filter(s => s.revealed).length;
  const totalAnswered = stats.correct + stats.wrong + stats.skipped;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{MODES.find(m => m.value === mode)?.label}</h1>
          {questions.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Question {currentIdx + 1} of {questions.length}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-1" />Reset
        </Button>
      </div>

      {/* Stats bar */}
      {totalAnswered > 0 && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-green-50 text-green-700 rounded-lg py-2 font-medium">
            <p className="text-lg font-bold">{stats.correct}</p>Correct
          </div>
          <div className="bg-red-50 text-red-700 rounded-lg py-2 font-medium">
            <p className="text-lg font-bold">{stats.wrong}</p>Wrong
          </div>
          <div className="bg-gray-100 text-gray-600 rounded-lg py-2 font-medium">
            <p className="text-lg font-bold">{stats.skipped}</p>Skipped
          </div>
        </div>
      )}

      {/* Question */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground">No questions available for this mode</p>
          <Button variant="outline" onClick={reset}>Try another mode</Button>
        </div>
      ) : current ? (
        <PracticeQuestion
          q={current}
          state={states[current.id] ?? { selectedOptionId: null, revealed: false }}
          onSelect={optId => handleSelect(current.id, optId)}
          onReveal={() => handleReveal(current)}
          onBookmark={() => bookmarkMutation.mutate(current.id)}
          bookmarked={bookmarkedIds.has(current.id)}
        />
      ) : null}

      {/* Navigation */}
      {questions.length > 0 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => i - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Dot palette */}
          <div className="flex-1 flex justify-center gap-1 flex-wrap">
            {questions.map((q, i) => {
              const s = states[q.id];
              const color = !s ? "bg-muted" : !s.revealed ? "bg-yellow-400" : q.options.find(o => o.id === s.selectedOptionId)?.isCorrect ? "bg-green-500" : "bg-red-400";
              return (
                <button key={q.id} onClick={() => setCurrentIdx(i)}
                  className={cn("w-5 h-5 rounded-full transition-all", color, i === currentIdx && "ring-2 ring-offset-1 ring-primary")} />
              );
            })}
          </div>

          <Button variant="outline"
            disabled={currentIdx >= questions.length - 1 && page >= totalPages - 1}
            onClick={() => {
              if (currentIdx < questions.length - 1) setCurrentIdx(i => i + 1);
              else { setPage(p => p + 1); setCurrentIdx(0); }
            }}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
