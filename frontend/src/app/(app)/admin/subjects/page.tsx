"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminExamApi, examApi } from "@/services/examApi";
import { subjectApi } from "@/services/subjectApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Edit2, BookOpen, Layers } from "lucide-react";
import Link from "next/link";
import type { SubjectDto } from "@/types/exam";

export default function AdminSubjectsPage() {
  const qc = useQueryClient();
  const [selectedExamId, setSelectedExamId] = useState<number | "">("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectDto | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch all exams
  const { data: examsData } = useQuery({
    queryKey: ["admin-exams-list"],
    queryFn: () => adminExamApi.list({ size: 100 }),
  });

  const exams = examsData?.data?.content ?? [];

  useEffect(() => {
    if (!selectedExamId && exams.length > 0) {
      setSelectedExamId(exams[0].id);
    }
  }, [exams, selectedExamId]);

  // 2. Fetch subjects for selected exam
  const { data: subjectsData, isLoading } = useQuery({
    queryKey: ["admin-subjects", selectedExamId],
    queryFn: () => examApi.getSubjects(Number(selectedExamId)),
    enabled: typeof selectedExamId === "number",
  });

  const subjects = subjectsData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      subjectApi.create({
        examId: Number(selectedExamId),
        name,
        description: description || undefined,
        displayOrder: Number(displayOrder) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-subjects", selectedExamId] });
      setIsCreating(false);
      setName("");
      setDescription("");
      setDisplayOrder("0");
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? "Failed to create subject");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (id: number) =>
      subjectApi.update(id, {
        examId: Number(selectedExamId),
        name,
        description: description || undefined,
        displayOrder: Number(displayOrder) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-subjects", selectedExamId] });
      setEditingSubject(null);
      setName("");
      setDescription("");
      setDisplayOrder("0");
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? "Failed to update subject");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => subjectApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-subjects", selectedExamId] });
    },
  });

  const startEdit = (s: SubjectDto) => {
    setEditingSubject(s);
    setName(s.name);
    setDescription(s.description ?? "");
    setDisplayOrder(String(s.displayOrder ?? 0));
    setIsCreating(false);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingSubject(null);
    setName("");
    setDescription("");
    setDisplayOrder("0");
    setError(null);
  };

  const currentExam = exams.find((e) => e.id === selectedExamId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> Subject Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage curriculum subjects for each competitive exam.
          </p>
        </div>

        <Button
          onClick={() => {
            setIsCreating(true);
            setEditingSubject(null);
            setName("");
            setDescription("");
            setDisplayOrder("0");
          }}
          disabled={!selectedExamId}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Subject
        </Button>
      </div>

      {/* Exam selector */}
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
        <label htmlFor="exam-select" className="text-sm font-semibold text-foreground whitespace-nowrap">
          Select Exam:
        </label>
        <select
          id="exam-select"
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(Number(e.target.value))}
          className="flex-1 max-w-md h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.name} ({exam.code})
            </option>
          ))}
        </select>
      </div>

      {/* Form (Create / Edit) */}
      {(isCreating || editingSubject) && (
        <Card className="border-primary/30 shadow-md">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold text-base">
              {editingSubject ? `Edit Subject: ${editingSubject.name}` : `Add New Subject to ${currentExam?.name}`}
            </h3>
            {error && <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Subject Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. General Intelligence & Reasoning"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Display Order</label>
                <Input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Description (optional)</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief syllabus coverage details"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={cancelForm}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!name.trim() || createMutation.isPending || updateMutation.isPending}
                onClick={() => (editingSubject ? updateMutation.mutate(editingSubject.id) : createMutation.mutate())}
              >
                {editingSubject ? "Save Changes" : "Create Subject"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-40" />
          <h3 className="font-semibold text-lg">No subjects created yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Add subjects to structure topics and questions for {currentExam?.name}.
          </p>
          <Button onClick={() => setIsCreating(true)} size="sm">
            Add First Subject
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const topicCount = sub.topics?.length ?? 0;
            return (
              <Card key={sub.id} className="border-0 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-foreground text-base">{sub.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Order #{sub.displayOrder ?? 0}</p>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Layers className="h-3 w-3" /> {topicCount} Topics
                    </Badge>
                  </div>

                  {sub.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{sub.description}</p>
                  )}

                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <Link href={`/admin/topics?subjectId=${sub.id}&examId=${selectedExamId}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Topics ({topicCount})
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => startEdit(sub)} title="Edit">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm(`Delete subject "${sub.name}" and all its topics?`)) {
                          deleteMutation.mutate(sub.id);
                        }
                      }}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
