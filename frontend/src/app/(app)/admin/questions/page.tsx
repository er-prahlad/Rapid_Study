"use client";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import apiClient from "@/services/apiClient";
import type { ApiResponse } from "@/types";
import type { PageResponse } from "@/types/exam";
import type { QuestionSafeDto } from "@/services/mockTestApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus, Search, Upload, BookOpen, Pencil, PowerOff, Power, Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

// ── Schema ─────────────────────────────────────────────────────────────────────

const optionSchema = z.object({
  optionText:      z.string().min(1, "Option text required"),
  optionTextHindi: z.string().optional(),
  optionOrder:     z.number().min(1),
  isCorrect:       z.boolean(),
});

const questionSchema = z.object({
  topicId:          z.number({ required_error: "Topic ID required" }).min(1),
  questionText:     z.string().min(5, "Question text is required"),
  questionTextHindi:z.string().optional(),
  difficulty:       z.enum(["EASY","MEDIUM","HARD"]),
  marks:            z.coerce.number().min(0.5),
  negativeMarks:    z.coerce.number().min(0),
  explanation:      z.string().optional(),
  explanationHindi: z.string().optional(),
  options:          z.array(optionSchema).min(2).max(6),
});

type QFormData = z.infer<typeof questionSchema>;

// ── Question Form Dialog ───────────────────────────────────────────────────────

function QuestionFormDialog({
  open, onClose, editId,
}: { open: boolean; onClose: () => void; editId?: number }) {
  const qc = useQueryClient();
  const { register, control, handleSubmit, reset, watch, setValue,
    formState: { errors, isSubmitting } } = useForm<QFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      difficulty: "MEDIUM", marks: 1, negativeMarks: 0,
      options: [
        { optionText: "", optionOrder: 1, isCorrect: false },
        { optionText: "", optionOrder: 2, isCorrect: false },
        { optionText: "", optionOrder: 3, isCorrect: false },
        { optionText: "", optionOrder: 4, isCorrect: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "options" });
  const options = watch("options");

  const onSubmit = async (data: QFormData) => {
    const correctCount = data.options.filter(o => o.isCorrect).length;
    if (correctCount !== 1) {
      toast({ title: "Select exactly 1 correct answer", variant: "destructive" }); return;
    }
    try {
      await apiClient.post("/admin/questions", data);
      toast({ title: "Question created" });
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
      reset(); onClose();
    } catch (e: any) {
      toast({ title: "Failed", description: e?.response?.data?.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Question</DialogTitle>
          <DialogDescription>Fill in question details. Select exactly one correct option.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Topic ID</Label>
              <Input type="number" placeholder="Topic ID"
                error={errors.topicId?.message}
                {...register("topicId", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("difficulty")}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Question (English)</Label>
            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
              placeholder="Enter question text…"
              {...register("questionText")} />
            {errors.questionText && <p className="text-xs text-destructive">{errors.questionText.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Question (Hindi) <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-y"
              placeholder="हिंदी में प्रश्न…"
              {...register("questionTextHindi")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Marks</Label>
              <Input type="number" step="0.5" {...register("marks")} error={errors.marks?.message} />
            </div>
            <div className="space-y-1.5">
              <Label>Negative Marks</Label>
              <Input type="number" step="0.25" {...register("negativeMarks")} />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Options (select correct one)</Label>
              {fields.length < 6 && (
                <Button type="button" variant="ghost" size="sm"
                  onClick={() => append({ optionText: "", optionOrder: fields.length + 1, isCorrect: false })}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Add option
                </Button>
              )}
            </div>
            {fields.map((field, idx) => (
              <div key={field.id} className={cn(
                "flex items-center gap-2 p-3 rounded-lg border transition-colors",
                options[idx]?.isCorrect ? "border-green-500 bg-green-50" : "border-border"
              )}>
                <input
                  type="radio"
                  name="correctOption"
                  checked={!!options[idx]?.isCorrect}
                  onChange={() => {
                    fields.forEach((_, i) => {
                      setValue(`options.${i}.isCorrect`, i === idx);
                    });
                  }}
                  className="shrink-0"
                />
                <Input
                  placeholder={`Option ${idx + 1}`}
                  {...register(`options.${idx}.optionText`)}
                  className="flex-1 h-8 border-0 bg-transparent p-0 focus-visible:ring-0"
                />
                {fields.length > 2 && (
                  <button type="button" onClick={() => remove(idx)}
                    className="text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>Explanation <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
              placeholder="Explain the correct answer…"
              {...register("explanation")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Create Question</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Import Dialog ──────────────────────────────────────────────────────────────

function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc  = useQueryClient();
  const ref = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<{ totalRows: number; imported: number; failed: number; duplicates: number; errors: string[] } | null>(null);

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData(); fd.append("file", file);
      return apiClient.post("/admin/questions/import", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then(r => r.data);
    },
    onSuccess: (data: any) => {
      setResult(data.data);
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
    },
    onError: (e: any) => toast({ title: "Import failed", description: e?.response?.data?.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={v => !v && (onClose(), setResult(null))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Questions</DialogTitle>
          <DialogDescription>Upload a CSV or XLSX file. Download the template for column order.</DialogDescription>
        </DialogHeader>
        {!result ? (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed p-8 text-center space-y-3">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">topicId, questionText, hindi, difficulty, marks, negMarks, opt1, opt2, opt3, opt4, correctOpt (1-4), explanation, hindiExplanation</p>
              <input ref={ref} type="file" accept=".csv,.xlsx,.xls" className="hidden"
                onChange={e => e.target.files?.[0] && importMutation.mutate(e.target.files[0])} />
              <Button onClick={() => ref.current?.click()} loading={importMutation.isPending}>
                Choose File
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Total Rows", val: result.totalRows, color: "bg-blue-50 text-blue-700" },
                { label: "Imported",   val: result.imported,  color: "bg-green-50 text-green-700" },
                { label: "Failed",     val: result.failed,    color: "bg-red-50 text-red-700" },
                { label: "Duplicates", val: result.duplicates,color: "bg-yellow-50 text-yellow-700" },
              ].map(({ label, val, color }) => (
                <div key={label} className={cn("rounded-lg p-3 text-center", color)}>
                  <p className="text-2xl font-bold">{val}</p>
                  <p className="text-xs font-medium">{label}</p>
                </div>
              ))}
            </div>
            {result.errors.length > 0 && (
              <div className="max-h-32 overflow-y-auto rounded border bg-muted/30 p-3 text-xs space-y-1">
                {result.errors.map((e, i) => <p key={i} className="text-destructive">{e}</p>)}
              </div>
            )}
            <Button className="w-full" onClick={() => (onClose(), setResult(null))}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function AdminQuestionsPage() {
  const [search, setSearch]         = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [page, setPage]             = useState(0);
  const [dialogOpen, setDialog]     = useState(false);
  const [importOpen, setImport]     = useState(false);
  const debSearch                   = useDebounce(search, 350);
  const qc                          = useQueryClient();

  const params: Record<string, unknown> = { page, size: 20 };
  if (debSearch)  params.search     = debSearch;
  if (difficulty) params.difficulty = difficulty;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-questions", debSearch, difficulty, page],
    queryFn:  () => apiClient
      .get<ApiResponse<PageResponse<QuestionSafeDto>>>("/admin/questions", { params })
      .then(r => r.data),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => apiClient.patch(`/admin/questions/${id}/deactivate`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-questions"] }); toast({ title: "Deactivated" }); },
  });
  const activateMutation = useMutation({
    mutationFn: (id: number) => apiClient.patch(`/admin/questions/${id}/activate`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-questions"] }); toast({ title: "Activated" }); },
  });

  const questions  = data?.data?.content ?? [];
  const total      = data?.data?.totalElements ?? 0;
  const totalPages = data?.data?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{total} questions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImport(true)}>
            <Upload className="h-4 w-4 mr-2" />Import
          </Button>
          <Button onClick={() => setDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />New Question
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search questions…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm w-40"
          value={difficulty}
          onChange={e => { setDifficulty(e.target.value); setPage(0); }}>
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {/* List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground">No questions yet. Create or import questions.</p>
              <Button onClick={() => setDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Question</Button>
            </div>
          ) : (
            <div className="divide-y">
              {questions.map((q: any) => {
                const diff = q.difficulty as string;
                const diffColor = { EASY: "success", MEDIUM: "warning", HARD: "destructive" }[diff] as any;
                return (
                  <div key={q.id} className="flex items-start gap-3 px-5 py-4 hover:bg-muted/20 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{q.questionText}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant={diffColor} className="text-xs">{q.difficulty}</Badge>
                        {q.topicName && <Badge variant="outline" className="text-xs">{q.topicName}</Badge>}
                        {!q.isActive && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                        <span className="text-xs text-muted-foreground">{q.options?.length ?? 0} options</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" title={q.isActive ? "Deactivate" : "Activate"}
                        onClick={() => q.isActive ? deactivateMutation.mutate(q.id) : activateMutation.mutate(q.id)}>
                        {q.isActive
                          ? <PowerOff className="h-4 w-4 text-destructive" />
                          : <Power className="h-4 w-4 text-green-600" />}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      <QuestionFormDialog open={dialogOpen} onClose={() => setDialog(false)} />
      <ImportDialog open={importOpen} onClose={() => setImport(false)} />
    </div>
  );
}
