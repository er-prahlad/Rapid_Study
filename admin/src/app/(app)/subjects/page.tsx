'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { examsApi, subjectsApi } from '@/services/api';
import { Button, Badge, Skeleton, EmptyState, Modal, Alert, Input, Textarea, Select } from '@/components/ui';
import type { SubjectDto, ExamDto } from '@/types/api';

const subjectSchema = z.object({
  examId: z.string().min(1, 'Exam is required'),
  name: z.string().min(2, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  displayOrder: z.string().optional(),
});
type SubjectForm = z.infer<typeof subjectSchema>;

export default function SubjectsPage() {
  const qc = useQueryClient();
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<SubjectDto | null>(null);
  const [deleteSubject, setDeleteSubject] = useState<SubjectDto | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // 1. Fetch exams for filter dropdown
  const { data: examsData } = useQuery({
    queryKey: ['admin-exams-list'],
    queryFn: async () => {
      const res = await examsApi.list({ size: 100 });
      return res.data.data.content;
    },
  });

  // Auto-select first exam when loaded if none selected
  useEffect(() => {
    if (!selectedExamId && examsData && examsData.length > 0) {
      setSelectedExamId(String(examsData[0].id));
    }
  }, [examsData, selectedExamId]);

  // 2. Fetch subjects for selected exam
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['admin-subjects', selectedExamId],
    queryFn: async () => {
      if (!selectedExamId) return [];
      const res = await examsApi.getSubjects(Number(selectedExamId));
      return res.data.data;
    },
    enabled: !!selectedExamId,
  });

  // Create Form
  const createForm = useForm<SubjectForm>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { examId: selectedExamId, name: '', description: '', displayOrder: '0' },
  });

  useEffect(() => {
    if (selectedExamId) {
      createForm.setValue('examId', selectedExamId);
    }
  }, [selectedExamId, createForm]);

  // Edit Form
  const editForm = useForm<SubjectForm>({
    resolver: zodResolver(subjectSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: SubjectForm) =>
      subjectsApi.create({
        examId: Number(data.examId),
        name: data.name,
        description: data.description || undefined,
        displayOrder: data.displayOrder ? Number(data.displayOrder) : 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subjects', selectedExamId] });
      setCreateOpen(false);
      createForm.reset({ examId: selectedExamId, name: '', description: '', displayOrder: '0' });
      setAlert({ type: 'success', msg: 'Subject created successfully.' });
    },
    onError: (e: unknown) => {
      setAlert({
        type: 'error',
        msg: (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create subject.',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SubjectForm }) =>
      subjectsApi.update(id, {
        examId: Number(data.examId),
        name: data.name,
        description: data.description || undefined,
        displayOrder: data.displayOrder ? Number(data.displayOrder) : 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subjects', selectedExamId] });
      setEditSubject(null);
      setAlert({ type: 'success', msg: 'Subject updated successfully.' });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to update subject.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => subjectsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subjects', selectedExamId] });
      setDeleteSubject(null);
      setAlert({ type: 'success', msg: 'Subject and its topics deleted.' });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to delete subject.' }),
  });

  const openEdit = (s: SubjectDto) => {
    setEditSubject(s);
    editForm.reset({
      examId: String(s.examId),
      name: s.name,
      description: s.description ?? '',
      displayOrder: String(s.displayOrder ?? 0),
    });
  };

  const selectedExamName = examsData?.find((e) => String(e.id) === selectedExamId)?.name ?? 'Selected Exam';

  return (
    <div className="space-y-5 animate-in">
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {/* Top Header & Exam Selector */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <label htmlFor="exam-select" className="text-sm font-semibold text-foreground whitespace-nowrap">
            Select Exam:
          </label>
          <select
            id="exam-select"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {examsData?.map((exam) => (
              <option key={exam.id} value={String(exam.id)}>
                {exam.name} ({exam.code})
              </option>
            ))}
          </select>
        </div>

        <Button id="create-subject-btn" onClick={() => setCreateOpen(true)} disabled={!selectedExamId}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Subject
        </Button>
      </div>

      {/* Subject List */}
      {subjectsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : !subjects || subjects.length === 0 ? (
        <div className="bg-card border border-border rounded-xl">
          <EmptyState
            title="No subjects found"
            description={`No subjects found for ${selectedExamName}. Add the first subject to begin building syllabus.`}
            action={
              <Button onClick={() => setCreateOpen(true)} disabled={!selectedExamId}>
                Add Subject
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const topicCount = sub.topics?.length ?? sub.topicCount ?? 0;
            return (
              <div
                key={sub.id}
                className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between gap-4 transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground text-base">{sub.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Order #{sub.displayOrder ?? 0}</p>
                    </div>
                    <Badge variant="primary">
                      {topicCount} {topicCount === 1 ? 'Topic' : 'Topics'}
                    </Badge>
                  </div>

                  {sub.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{sub.description}</p>
                  )}

                  {/* Topics previews */}
                  {sub.topics && sub.topics.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {sub.topics.slice(0, 3).map((t) => (
                        <span key={t.id} className="text-[11px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {t.name}
                        </span>
                      ))}
                      {sub.topics.length > 3 && (
                        <span className="text-[11px] text-muted-foreground font-medium self-center">
                          +{sub.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-border">
                  <Link
                    href={`/topics?subjectId=${sub.id}&examId=${selectedExamId}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Topics ({topicCount})
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => openEdit(sub)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setDeleteSubject(sub)}
                    title="Delete subject"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Subject Modal */}
      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); createForm.reset(); }}
        title="Add Subject"
        description={`Add a new subject to ${selectedExamName}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              id="subject-create-btn"
              loading={createMutation.isPending}
              onClick={createForm.handleSubmit((data) => createMutation.mutate(data))}
            >
              Add Subject
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Subject Name"
            id="sub-name"
            {...createForm.register('name')}
            error={createForm.formState.errors.name?.message}
            placeholder="e.g. Quantitative Aptitude"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sub-desc" className="text-sm font-medium">Description (optional)</label>
            <textarea
              id="sub-desc"
              {...createForm.register('description')}
              rows={3}
              placeholder="Topics covered, syllabus details…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Input
            label="Display Order"
            id="sub-order"
            type="number"
            {...createForm.register('displayOrder')}
            placeholder="0"
          />
        </div>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal
        open={!!editSubject}
        onClose={() => setEditSubject(null)}
        title="Edit Subject"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditSubject(null)}>Cancel</Button>
            <Button
              id="subject-edit-btn"
              loading={updateMutation.isPending}
              onClick={editForm.handleSubmit((data) => editSubject && updateMutation.mutate({ id: editSubject.id, data }))}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Subject Name"
            id="edit-sub-name"
            {...editForm.register('name')}
            error={editForm.formState.errors.name?.message}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-sub-desc" className="text-sm font-medium">Description</label>
            <textarea
              id="edit-sub-desc"
              {...editForm.register('description')}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Input
            label="Display Order"
            id="edit-sub-order"
            type="number"
            {...editForm.register('displayOrder')}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteSubject}
        onClose={() => setDeleteSubject(null)}
        title="Delete Subject?"
        description="Are you sure you want to delete this subject? All associated topics will also be removed."
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteSubject(null)}>Cancel</Button>
            <Button
              variant="destructive"
              loading={deleteMutation.isPending}
              onClick={() => deleteSubject && deleteMutation.mutate(deleteSubject.id)}
            >
              Delete Subject
            </Button>
          </>
        }
      >
        <p className="text-sm text-foreground">
          You are about to delete <strong className="font-semibold">{deleteSubject?.name}</strong>.
        </p>
      </Modal>
    </div>
  );
}
