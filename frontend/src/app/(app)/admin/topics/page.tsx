"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminExamApi, examApi } from "@/services/examApi";
import { topicApi } from "@/services/subjectApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Edit2, Layers, BookOpen } from "lucide-react";
import Link from "next/link";
import type { TopicDto } from "@/types/exam";

export default function AdminTopicsPage() {
  const qc = useQueryClient();
  const [selectedExamId, setSelectedExamId] = useState<number | "">("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicDto | null>(null);
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
  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ["admin-subjects", selectedExamId],
    queryFn: () => examApi.getSubjects(Number(selectedExamId)),
    enabled: typeof selectedExamId === "number",
  });

  const subjects = subjectsData?.data ?? [];

  useEffect(() => {
    if (subjects.length > 0) {
      const exists = subjects.some((s) => s.id === selectedSubjectId);
      if (!exists) {
        setSelectedSubjectId(subjects[0].id);
      }
    } else {
      setSelectedSubjectId("");
    }
  }, [subjects, selectedSubjectId]);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const topics = currentSubject?.topics ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      topicApi.create({
        subjectId: Number(selectedSubjectId),
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
      setError(err?.response?.data?.message ?? "Failed to create topic");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (id: number) =>
      topicApi.update(id, {
        subjectId: Number(selectedSubjectId),
        name,
        description: description || undefined,
        displayOrder: Number(displayOrder) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-subjects", selectedExamId] });
      setEditingTopic(null);
      setName("");
      setDescription("");
      setDisplayOrder("0");
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? "Failed to update topic");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => topicApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-subjects", selectedExamId] });
    },
  });

  const startEdit = (t: TopicDto) => {
    setEditingTopic(t);
    setName(t.name);
    setDescription(t.description ?? "");
    setDisplayOrder(String(t.displayOrder ?? 0));
    setIsCreating(false);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingTopic(null);
    setName("");
    setDescription("");
    setDisplayOrder("0");
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" /> Topic Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize individual syllabus topics under subjects.
          </p>
        </div>

        <Button
          onClick={() => {
            setIsCreating(true);
            setEditingTopic(null);
            setName("");
            setDescription("");
            setDisplayOrder("0");
          }}
          disabled={!selectedSubjectId}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Topic
        </Button>
      </div>

      {/* Cascading selectors */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <label htmlFor="filter-exam" className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Exam:
          </label>
          <select
            id="filter-exam"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(Number(e.target.value))}
            className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <label htmlFor="filter-subject" className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Subject:
          </label>
          <select
            id="filter-subject"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
            disabled={subjects.length === 0}
            className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Form (Create / Edit) */}
      {(isCreating || editingTopic) && (
        <Card className="border-primary/30 shadow-md">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold text-base">
              {editingTopic ? `Edit Topic: ${editingTopic.name}` : `Add New Topic to ${currentSubject?.name}`}
            </h3>
            {error && <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Topic Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ratio, Proportion & Variation"
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
                placeholder="Key concepts or rules covered"
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
                onClick={() => (editingTopic ? updateMutation.mutate(editingTopic.id) : createMutation.mutate())}
              >
                {editingTopic ? "Save Changes" : "Create Topic"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topics list */}
      {subjectsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <Card className="p-12 text-center">
          <Layers className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-40" />
          <h3 className="font-semibold text-lg">No topics in this subject yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Add topics to organize questions for {currentSubject?.name ?? "this subject"}.
          </p>
          <Button onClick={() => setIsCreating(true)} size="sm" disabled={!selectedSubjectId}>
            Add First Topic
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((t) => (
            <Card key={t.id} className="border-0 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-foreground text-base">{t.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Order #{t.displayOrder ?? 0}</p>
                  </div>
                  <Badge variant="secondary">ID #{t.id}</Badge>
                </div>

                {t.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <Link href={`/admin/questions?topicId=${t.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View Questions
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(t)} title="Edit">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm(`Delete topic "${t.name}"?`)) {
                        deleteMutation.mutate(t.id);
                      }
                    }}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
