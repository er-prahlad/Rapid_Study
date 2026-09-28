'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { examsApi, topicsApi } from '@/services/api';
import { Button, Badge, Skeleton, EmptyState, Modal, Alert, Input, Textarea } from '@/components/ui';
import type { TopicDto, SubjectDto } from '@/types/api';

const topicSchema = z.object({
  subjectId: z.string().min(1, 'Subject is required'),
  name: z.string().min(2, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  displayOrder: z.string().optional(),
});
type TopicForm = z.infer<typeof topicSchema>;

export default function TopicsPage() {
  const qc = useQueryClient();
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTopic, setEditTopic] = useState<TopicDto | null>(null);
  const [deleteTopic, setDeleteTopic] = useState<TopicDto | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // 1. Fetch exams
  const { data: examsData } = useQuery({
    queryKey: ['admin-exams-list'],
    queryFn: async () => {
      const res = await examsApi.list({ size: 100 });
      return res.data.data.content;
    },
  });

  // Auto-select first exam
  useEffect(() => {
    if (!selectedExamId && examsData && examsData.length > 0) {
      setSelectedExamId(String(examsData[0].id));
    }
  }, [examsData, selectedExamId]);

  // 2. Fetch subjects for selected exam
  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['admin-subjects', selectedExamId],
    queryFn: async () => {
      if (!selectedExamId) return [];
      const res = await examsApi.getSubjects(Number(selectedExamId));
      return res.data.data;
    },
    enabled: !!selectedExamId,
  });

  // Auto-select first subject
  useEffect(() => {
    if (subjectsData && subjectsData.length > 0) {
      // If current selectedSubjectId not in subjectsData, pick first
      const exists = subjectsData.some((s) => String(s.id) === selectedSubjectId);
      if (!exists) {
        setSelectedSubjectId(String(subjectsData[0].id));
      }
    } else {
      setSelectedSubjectId('');
    }
  }, [subjectsData, selectedSubjectId]);

  // Selected subject object
  const currentSubject = subjectsData?.find((s) => String(s.id) === selectedSubjectId);
  const topicsList = currentSubject?.topics ?? [];

  // Create Form
  const createForm = useForm<TopicForm>({
    resolver: zodResolver(topicSchema),
    defaultValues: { subjectId: selectedSubjectId, name: '', description: '', displayOrder: '0' },
  });

  useEffect(() => {
    if (selectedSubjectId) {
      createForm.setValue('subjectId', selectedSubjectId);
    }
  }, [selectedSubjectId, createForm]);

  // Edit Form
  const editForm = useForm<TopicForm>({
    resolver: zodResolver(topicSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: TopicForm) =>
      topicsApi.create({
        subjectId: Number(data.subjectId),
        name: data.name,
        description: data.description || undefined,
        displayOrder: data.displayOrder ? Number(data.displayOrder) : 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subjects', selectedExamId] });
      setCreateOpen(false);
      createForm.reset({ subjectId: selectedSubjectId, name: '', description: '', displayOrder: '0' });
      setAlert({ type: 'success', msg: 'Topic created successfully.' });
    },
    onError: (e: unknown) => {
      setAlert({
        type: 'error',
        msg: (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create topic.',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TopicForm }) =>
      topicsApi.update(id, {
        subjectId: Number(data.subjectId),
        name: data.name,
        description: data.description || undefined,
        displayOrder: data.displayOrder ? Number(data.displayOrder) : 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subjects', selectedExamId] });
      setEditTopic(null);
      setAlert({ type: 'success', msg: 'Topic updated successfully.' });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to update topic.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => topicsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subjects', selectedExamId] });
      setDeleteTopic(null);
      setAlert({ type: 'success', msg: 'Topic deleted.' });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to delete topic.' }),
  });

  const openEdit = (t: TopicDto) => {
    setEditTopic(t);
    editForm.reset({
      subjectId: String(t.subjectId || selectedSubjectId),
      name: t.name,
      description: t.description ?? '',
      displayOrder: String(t.displayOrder ?? 0),
    });
  };

  return (
    <div className="space-y-5 animate-in">
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {/* Cascading Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="flex items-center gap-2 min-w-[220px]">
            <label htmlFor="topic-exam-select" className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Exam:
            </label>
            <select
              id="topic-exam-select"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {examsData?.map((exam) => (
                <option key={exam.id} value={String(exam.id)}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 min-w-[220px]">
            <label htmlFor="topic-subject-select" className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Subject:
            </label>
            <select
              id="topic-subject-select"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={!subjectsData || subjectsData.length === 0}
              className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              {subjectsData?.map((sub) => (
                <option key={sub.id} value={String(sub.id)}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button id="create-topic-btn" onClick={() => setCreateOpen(true)} disabled={!selectedSubjectId}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Topic
        </Button>
      </div>

      {/* Topics Grid */}
      {subjectsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : !selectedSubjectId || topicsList.length === 0 ? (
        <div className="bg-card border border-border rounded-xl">
          <EmptyState
            title="No topics found"
            description={
              selectedSubjectId
                ? `No topics found under "${currentSubject?.name}". Add the first topic to organize questions.`
                : 'Please select an exam and subject first.'
            }
            action={
              <Button onClick={() => setCreateOpen(true)} disabled={!selectedSubjectId}>
                Add Topic
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {topicsList.map((top) => (
            <div
              key={top.id}
              className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between gap-4 transition-shadow hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-foreground text-base">{top.name}</p>
                  <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                    ID #{top.id}
                  </span>
                </div>

                {top.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{top.description}</p>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Display Order: {top.displayOrder ?? 0}</span>
                  <span className="text-violet-600 dark:text-violet-400 font-medium">
                    {currentSubject?.name}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <Link
                  href={`/questions?topicId=${top.id}`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    Questions
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => openEdit(top)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setDeleteTopic(top)}
                  title="Delete topic"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Topic Modal */}
      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); createForm.reset(); }}
        title="Add Topic"
        description={`Add a new topic under ${currentSubject?.name ?? 'selected subject'}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              id="topic-create-btn"
              loading={createMutation.isPending}
              onClick={createForm.handleSubmit((data) => createMutation.mutate(data))}
            >
              Add Topic
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Topic Name"
            id="top-name"
            {...createForm.register('name')}
            error={createForm.formState.errors.name?.message}
            placeholder="e.g. Percentage & Ratios"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="top-desc" className="text-sm font-medium">Description (optional)</label>
            <textarea
              id="top-desc"
              {...createForm.register('description')}
              rows={3}
              placeholder="Specific concepts, formulas or sub-topics…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Input
            label="Display Order"
            id="top-order"
            type="number"
            {...createForm.register('displayOrder')}
            placeholder="0"
          />
        </div>
      </Modal>

      {/* Edit Topic Modal */}
      <Modal
        open={!!editTopic}
        onClose={() => setEditTopic(null)}
        title="Edit Topic"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditTopic(null)}>Cancel</Button>
            <Button
              id="topic-edit-btn"
              loading={updateMutation.isPending}
              onClick={editForm.handleSubmit((data) => editTopic && updateMutation.mutate({ id: editTopic.id, data }))}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Topic Name"
            id="edit-top-name"
            {...editForm.register('name')}
            error={editForm.formState.errors.name?.message}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-top-desc" className="text-sm font-medium">Description</label>
            <textarea
              id="edit-top-desc"
              {...editForm.register('description')}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Input
            label="Display Order"
            id="edit-top-order"
            type="number"
            {...editForm.register('displayOrder')}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTopic}
        onClose={() => setDeleteTopic(null)}
        title="Delete Topic?"
        description="Are you sure you want to delete this topic?"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTopic(null)}>Cancel</Button>
            <Button
              variant="destructive"
              loading={deleteMutation.isPending}
              onClick={() => deleteTopic && deleteMutation.mutate(deleteTopic.id)}
            >
              Delete Topic
            </Button>
          </>
        }
      >
        <p className="text-sm text-foreground">
          You are about to delete <strong className="font-semibold">{deleteTopic?.name}</strong>.
        </p>
      </Modal>
    </div>
  );
}
