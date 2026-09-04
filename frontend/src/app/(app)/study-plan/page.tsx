"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { studyPlanApi, StudyPlanDto } from "@/services/studyPlanApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { CalendarCheck, Plus, Pencil, Trash2, Target, BookOpen, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const schema = z.object({
  title:           z.string().min(2, "Title required").max(200),
  startDate:       z.string().min(1, "Start date required"),
  endDate:         z.string().min(1, "End date required"),
  targetTests:     z.coerce.number().min(0).default(0),
  targetQuestions: z.coerce.number().min(0).default(0),
});
type FormData = z.infer<typeof schema>;

function PlanCard({ plan, onEdit, onDelete }: {
  plan: StudyPlanDto;
  onEdit: (p: StudyPlanDto) => void;
  onDelete: (id: number) => void;
}) {
  const isExpired  = new Date(plan.endDate) < new Date();
  const isOngoing  = !isExpired && plan.isActive;
  const testsProgress = plan.targetTests > 0
    ? Math.min(100, plan.testsCompleted / plan.targetTests * 100) : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold truncate">{plan.title}</h3>
              <Badge variant={isOngoing ? "success" : isExpired ? "secondary" : "outline"} className="text-xs shrink-0">
                {isOngoing ? "Active" : isExpired ? "Expired" : "Inactive"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(plan.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
              {" — "}
              {new Date(plan.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(plan)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(plan.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Time Progress</span>
            <span>{plan.daysElapsed}/{plan.daysTotal} days · {plan.daysRemaining}d remaining</span>
          </div>
          <Progress value={plan.progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground">{plan.progressPercent.toFixed(0)}%</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {plan.targetTests > 0 && (
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <Target className="h-4 w-4 text-blue-600 mx-auto mb-1" />
              <p className="font-bold text-blue-700">{plan.testsCompleted}/{plan.targetTests}</p>
              <p className="text-xs text-muted-foreground">Tests</p>
              <Progress value={testsProgress} className="h-1 mt-1.5" />
            </div>
          )}
          {plan.targetQuestions > 0 && (
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <BookOpen className="h-4 w-4 text-green-600 mx-auto mb-1" />
              <p className="font-bold text-green-700">{plan.questionsAttempted}/{plan.targetQuestions}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
              <Progress value={plan.targetQuestions > 0 ? plan.questionsAttempted / plan.targetQuestions * 100 : 0} className="h-1 mt-1.5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PlanDialog({ open, onClose, editPlan }: {
  open: boolean; onClose: () => void; editPlan?: StudyPlanDto;
}) {
  const qc = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: editPlan ? {
      title: editPlan.title, startDate: editPlan.startDate, endDate: editPlan.endDate,
      targetTests: editPlan.targetTests, targetQuestions: editPlan.targetQuestions,
    } : { startDate: today },
  });

  const createMutation = useMutation({
    mutationFn: studyPlanApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["study-plans"] }); toast({ title: "Plan created" }); reset(); onClose(); },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message, variant: "destructive" }),
  });
  const updateMutation = useMutation({
    mutationFn: (d: FormData) => studyPlanApi.update(editPlan!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["study-plans"] }); toast({ title: "Plan updated" }); onClose(); },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editPlan ? "Edit Study Plan" : "Create Study Plan"}</DialogTitle>
          <DialogDescription>Set your study targets and timeline.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(d => editPlan ? updateMutation.mutate(d) : createMutation.mutate(d))} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input placeholder="UPSC 2025 Preparation" error={errors.title?.message} {...register("title")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input type="date" {...register("startDate")} />
            </div>
            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input type="date" {...register("endDate")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Target Tests</Label>
              <Input type="number" min="0" placeholder="10" {...register("targetTests")} />
            </div>
            <div className="space-y-1.5">
              <Label>Target Questions</Label>
              <Input type="number" min="0" placeholder="500" {...register("targetQuestions")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isSubmitting || createMutation.isPending || updateMutation.isPending}>
              {editPlan ? "Update" : "Create"} Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function StudyPlanPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialog] = useState(false);
  const [editPlan, setEditPlan] = useState<StudyPlanDto | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ["study-plans"],
    queryFn: studyPlanApi.getAll,
    staleTime: 1000 * 60,
  });

  const deleteMutation = useMutation({
    mutationFn: studyPlanApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["study-plans"] }); toast({ title: "Plan deleted" }); },
  });

  const plans = data?.data ?? [];
  const active = plans.filter(p => p.isActive && new Date(p.endDate) >= new Date());

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-primary" />Study Plans
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{active.length} active plan{active.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { setEditPlan(undefined); setDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />New Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <CalendarCheck className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">No study plans yet</p>
          <p className="text-sm text-muted-foreground">Create a plan to track your preparation progress.</p>
          <Button onClick={() => setDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Your First Plan</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map(p => (
            <PlanCard key={p.id} plan={p}
              onEdit={p => { setEditPlan(p); setDialog(true); }}
              onDelete={id => deleteMutation.mutate(id)} />
          ))}
        </div>
      )}

      <PlanDialog open={dialogOpen} onClose={() => setDialog(false)} editPlan={editPlan} />
    </div>
  );
}
