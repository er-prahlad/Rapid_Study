"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { adminMockTestApi, MockTestDto } from "@/services/mockTestApi";
import { examApi } from "@/services/examApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Search, FileText, Pencil, Eye, EyeOff, Trash2, Clock, Target } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

const schema = z.object({
  examId:          z.coerce.number().min(1, "Select an exam"),
  title:           z.string().min(3, "Title required").max(200),
  description:     z.string().optional(),
  durationMinutes: z.coerce.number().min(1).max(360),
  totalQuestions:  z.coerce.number().min(1),
  totalMarks:      z.coerce.number().min(1),
  negativeMarks:   z.coerce.number().min(0).default(0),
});
type FormData = z.infer<typeof schema>;

function TestFormDialog({ open, onClose, editTest }: {
  open: boolean; onClose: () => void; editTest?: MockTestDto;
}) {
  const qc = useQueryClient();
  const { data: examsData } = useQuery({
    queryKey: ["exams-list"], queryFn: () => examApi.list({ size: 50 }),
  });
  const exams = examsData?.data?.content ?? [];

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: editTest
      ? { examId: editTest.examId, title: editTest.title, description: editTest.description ?? "",
          durationMinutes: editTest.durationMinutes, totalQuestions: editTest.totalQuestions,
          totalMarks: Number(editTest.totalMarks), negativeMarks: Number(editTest.negativeMarks) }
      : { negativeMarks: 0, durationMinutes: 60, totalQuestions: 100, totalMarks: 200 },
  });

  const createMutation = useMutation({
    mutationFn: adminMockTestApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tests"] }); toast({ title: "Test created" }); reset(); onClose(); },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message, variant: "destructive" }),
  });
  const updateMutation = useMutation({
    mutationFn: (d: FormData) => adminMockTestApi.update(editTest!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tests"] }); toast({ title: "Test updated" }); onClose(); },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editTest ? "Edit Test" : "Create Mock Test"}</DialogTitle>
          <DialogDescription>Configure the test settings. Add questions after creation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(d => editTest ? updateMutation.mutate(d) : createMutation.mutate(d))} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Exam</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register("examId", { valueAsNumber: true })}>
              <option value="">Select exam…</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            {errors.examId && <p className="text-xs text-destructive">{errors.examId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input placeholder="SSC CGL 2024 Full Mock Test 1" error={errors.title?.message} {...register("title")} />
          </div>

          <div className="space-y-1.5">
            <Label>Description <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Input placeholder="Complete syllabus mock test…" {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Duration (minutes)</Label>
              <Input type="number" {...register("durationMinutes")} error={errors.durationMinutes?.message} />
            </div>
            <div className="space-y-1.5">
              <Label>Total Questions</Label>
              <Input type="number" {...register("totalQuestions")} error={errors.totalQuestions?.message} />
            </div>
            <div className="space-y-1.5">
              <Label>Total Marks</Label>
              <Input type="number" step="0.5" {...register("totalMarks")} error={errors.totalMarks?.message} />
            </div>
            <div className="space-y-1.5">
              <Label>Negative Marks</Label>
              <Input type="number" step="0.25" {...register("negativeMarks")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isSubmitting || createMutation.isPending || updateMutation.isPending}>
              {editTest ? "Update" : "Create"} Test
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminTestsPage() {
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(0);
  const [dialogOpen, setDialog] = useState(false);
  const [editTest, setEditTest] = useState<MockTestDto | undefined>();
  const debSearch               = useDebounce(search, 350);
  const qc                      = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tests", debSearch, page],
    queryFn:  () => adminMockTestApi.list({ search: debSearch || undefined, page, size: 20 }),
  });

  const publishMutation = useMutation({
    mutationFn: adminMockTestApi.publish,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tests"] }); toast({ title: "Test published" }); },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message, variant: "destructive" }),
  });
  const unpublishMutation = useMutation({
    mutationFn: adminMockTestApi.unpublish,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tests"] }); toast({ title: "Test unpublished" }); },
  });
  const deleteMutation = useMutation({
    mutationFn: adminMockTestApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tests"] }); toast({ title: "Test deleted" }); },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message, variant: "destructive" }),
  });

  const tests      = data?.data?.content ?? [];
  const total      = data?.data?.totalElements ?? 0;
  const totalPages = data?.data?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mock Test Builder</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{total} tests</p>
        </div>
        <Button onClick={() => { setEditTest(undefined); setDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />New Test
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search tests…" value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground">No tests yet.</p>
              <Button onClick={() => setDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Test</Button>
            </div>
          ) : (
            <div className="divide-y">
              {tests.map(test => (
                <div key={test.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{test.title}</p>
                      <Badge variant={test.isPublished ? "success" : "secondary"} className="text-xs shrink-0">
                        {test.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      {test.examName && <span>{test.examName}</span>}
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{test.totalQuestions} Qs</span>
                      <span className="flex items-center gap-1"><Target className="h-3 w-3" />{String(test.totalMarks)} marks</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{test.durationMinutes}m</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" title="Edit"
                      disabled={test.isPublished}
                      onClick={() => { setEditTest(test); setDialog(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon"
                      title={test.isPublished ? "Unpublish" : "Publish"}
                      onClick={() => test.isPublished
                        ? unpublishMutation.mutate(test.id)
                        : publishMutation.mutate(test.id)}>
                      {test.isPublished
                        ? <EyeOff className="h-4 w-4 text-orange-600" />
                        : <Eye className="h-4 w-4 text-green-600" />}
                    </Button>
                    {!test.isPublished && (
                      <Button variant="ghost" size="icon" title="Delete"
                        onClick={() => deleteMutation.mutate(test.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
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

      <TestFormDialog open={dialogOpen} onClose={() => setDialog(false)} editTest={editTest} />
    </div>
  );
}
