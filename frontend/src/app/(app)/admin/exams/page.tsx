"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { adminExamApi } from "@/services/examApi";
import { ExamDto } from "@/types/exam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus, Pencil, PowerOff, Power, Search,
  GraduationCap, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

// ── Form schema ──────────────────────────────────────────────────────────────

const examSchema = z.object({
  name:        z.string().min(2, "Name required").max(100),
  code:        z.string().min(2, "Code required").max(50)
                .regex(/^[A-Z0-9_]+$/, "Uppercase letters, digits or underscores only"),
  description: z.string().optional(),
  logo:        z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isActive:    z.boolean().default(true),
});

type ExamFormData = z.infer<typeof examSchema>;

// ── Exam Form Dialog ─────────────────────────────────────────────────────────

function ExamFormDialog({
  open,
  onClose,
  editExam,
}: {
  open: boolean;
  onClose: () => void;
  editExam?: ExamDto;
}) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<ExamFormData>({
      resolver: zodResolver(examSchema),
      defaultValues: editExam
        ? { name: editExam.name, code: editExam.code, description: editExam.description ?? "", logo: editExam.logo ?? "", isActive: editExam.isActive }
        : { isActive: true },
    });

  const createMutation = useMutation({
    mutationFn: adminExamApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
      toast({ title: "Exam created successfully" });
      reset(); onClose();
    },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message ?? "Error", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: ExamFormData) => adminExamApi.update(editExam!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
      toast({ title: "Exam updated successfully" });
      onClose();
    },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message ?? "Error", variant: "destructive" }),
  });

  const onSubmit = (data: ExamFormData) => {
    if (editExam) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editExam ? "Edit Exam" : "Create Exam"}</DialogTitle>
          <DialogDescription>
            {editExam ? "Update exam details below." : "Fill in the details to create a new exam."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input placeholder="SSC CGL" error={errors.name?.message} {...register("name")} />
          </div>

          <div className="space-y-1.5">
            <Label>Code <span className="text-xs text-muted-foreground">(uppercase, no spaces)</span></Label>
            <Input
              placeholder="SSC_CGL"
              error={errors.code?.message}
              {...register("code")}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase().replace(/\s/g, "_");
                register("code").onChange(e);
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Input placeholder="Combined Graduate Level examination by SSC" {...register("description")} />
          </div>

          <div className="space-y-1.5">
            <Label>Logo URL <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Input placeholder="https://..." error={errors.logo?.message} {...register("logo")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isSubmitting || createMutation.isPending || updateMutation.isPending}>
              {editExam ? "Update" : "Create"} Exam
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function AdminExamsPage() {
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(0);
  const [dialogOpen, setDialog]   = useState(false);
  const [editExam, setEditExam]   = useState<ExamDto | undefined>();
  const debouncedSearch           = useDebounce(search, 350);
  const queryClient               = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-exams", debouncedSearch, page],
    queryFn:  () => adminExamApi.list({ search: debouncedSearch || undefined, page, size: 20 }),
  });

  const deactivateMutation = useMutation({
    mutationFn: adminExamApi.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
      toast({ title: "Exam deactivated" });
    },
    onError: () => toast({ title: "Failed to deactivate", variant: "destructive" }),
  });

  const activateMutation = useMutation({
    mutationFn: adminExamApi.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
      toast({ title: "Exam activated" });
    },
    onError: () => toast({ title: "Failed to activate", variant: "destructive" }),
  });

  const exams      = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 0;
  const total      = data?.data?.totalElements ?? 0;

  const openCreate = () => { setEditExam(undefined); setDialog(true); };
  const openEdit   = (exam: ExamDto) => { setEditExam(exam); setDialog(true); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Exam Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{total} exams total</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Exam
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search exams…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground">
                {search ? `No exams matching "${search}"` : "No exams yet. Create your first exam."}
              </p>
              {!search && <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create Exam</Button>}
            </div>
          ) : (
            <div className="divide-y">
              {exams.map((exam) => (
                <div key={exam.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{exam.name}</p>
                      <Badge variant="outline" className="text-xs">{exam.code}</Badge>
                      <Badge variant={exam.isActive ? "success" : "destructive"} className="text-xs">
                        {exam.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {exam.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">{exam.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit"
                      onClick={() => openEdit(exam)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={exam.isActive ? "Deactivate" : "Activate"}
                      onClick={() => exam.isActive
                        ? deactivateMutation.mutate(exam.id)
                        : activateMutation.mutate(exam.id)
                      }
                    >
                      {exam.isActive
                        ? <PowerOff className="h-4 w-4 text-destructive" />
                        : <Power className="h-4 w-4 text-green-600" />
                      }
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="Manage subjects">
                      <Link href={`/exams/${exam.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}

      {/* Dialog */}
      <ExamFormDialog
        open={dialogOpen}
        onClose={() => setDialog(false)}
        editExam={editExam}
      />
    </div>
  );
}
