'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { examsApi } from '@/services/api';
import { Button, Badge, Skeleton, EmptyState, Modal, Alert, Input, Textarea, Pagination } from '@/components/ui';
import { formatDate, formatNumber, debounce } from '@/lib/utils';
import type { ExamDto } from '@/types/api';

const examSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required').max(20, 'Code too long'),
  description: z.string().optional(),
});
type ExamForm = z.infer<typeof examSchema>;

function ExamFormFields({ register, errors }: {
  register: ReturnType<typeof useForm<ExamForm>>['register'];
  errors: ReturnType<typeof useForm<ExamForm>>['formState']['errors'];
}) {
  return (
    <div className="flex flex-col gap-4">
      <Input label="Exam Name" id="exam-name" {...register('name')} error={errors.name?.message} placeholder="e.g. SSC CGL 2025" />
      <Input label="Short Code" id="exam-code" {...register('code')} error={errors.code?.message} placeholder="e.g. SSC_CGL" />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="exam-desc" className="text-sm font-medium">Description (optional)</label>
        <textarea
          id="exam-desc"
          {...register('description')}
          rows={3}
          placeholder="Brief description of this exam…"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  );
}

export default function ExamsPage() {
  const qc = useQueryClient();
  const [page, setPage]       = useState(0);
  const [search, setSearch]   = useState('');
  const [createOpen, setCreate] = useState(false);
  const [editExam, setEdit]   = useState<ExamDto | null>(null);
  const [deleteExam, setDelete] = useState<ExamDto | null>(null);
  const [alert, setAlert]     = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce((v: string) => { setSearch(v); setPage(0); }, 400), []);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-exams', page, search],
    queryFn: async () => {
      const res = await examsApi.list({ search: search || undefined, page, size: 20 });
      return res.data.data;
    },
  });

  const createForm = useForm<ExamForm>({ resolver: zodResolver(examSchema) });
  const editForm   = useForm<ExamForm>({ resolver: zodResolver(examSchema) });

  const createMutation = useMutation({
    mutationFn: examsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-exams'] });
      setCreate(false);
      createForm.reset();
      setAlert({ type: 'success', msg: 'Exam created successfully.' });
    },
    onError: (e: unknown) => setAlert({ type: 'error', msg: (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create exam.' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ExamForm }) => examsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-exams'] });
      setEdit(null);
      setAlert({ type: 'success', msg: 'Exam updated successfully.' });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to update exam.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: examsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-exams'] });
      setDelete(null);
      setAlert({ type: 'success', msg: 'Exam deleted.' });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to delete exam.' }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      active ? examsApi.deactivate(id) : examsApi.activate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-exams'] });
      setAlert({ type: 'success', msg: 'Exam status updated.' });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to update status.' }),
  });

  function openEdit(exam: ExamDto) {
    setEdit(exam);
    editForm.reset({ name: exam.name, code: exam.code, description: exam.description ?? '' });
  }

  return (
    <div className="space-y-5 animate-in">
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {/* Header Bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            id="exams-search"
            placeholder="Search exams…"
            onChange={e => debouncedSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button id="create-exam-btn" onClick={() => setCreate(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Exam
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : data?.content.length === 0 ? (
        <div className="bg-card border border-border rounded-xl">
          <EmptyState
            title="No exams yet"
            description="Create your first exam to get started."
            action={<Button onClick={() => setCreate(true)}>Create Exam</Button>}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.content.map((exam) => (
              <div
                key={exam.id}
                className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{exam.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{exam.code}</p>
                  </div>
                  <Badge variant={exam.isActive ? 'success' : 'destructive'} dot>
                    {exam.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {exam.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{exam.description}</p>
                )}

                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Subjects', value: exam.subjectCount },
                    { label: 'Topics',   value: exam.topicCount },
                    { label: 'Questions',value: exam.questionCount },
                  ].map(s => (
                    <div key={s.label} className="bg-muted/50 rounded-lg py-2">
                      <p className="text-sm font-bold text-foreground">{formatNumber(s.value)}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">Created {formatDate(exam.createdAt)}</p>

                <div className="flex gap-2 pt-1 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(exam)}>
                    Edit
                  </Button>
                  <Button
                    variant={exam.isActive ? 'secondary' : 'primary'}
                    size="sm"
                    className="flex-1"
                    loading={toggleMutation.isPending}
                    onClick={() => toggleMutation.mutate({ id: exam.id, active: exam.isActive })}
                  >
                    {exam.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setDelete(exam)}
                    title="Delete exam"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="bg-card border border-border rounded-xl">
              <Pagination page={page} totalPages={data.totalPages} totalElements={data.totalElements} size={20} onChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => { setCreate(false); createForm.reset(); }}
        title="Create Exam"
        description="Add a new competitive exam to the platform"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreate(false)}>Cancel</Button>
            <Button
              id="exam-create-submit"
              loading={createMutation.isPending}
              onClick={createForm.handleSubmit(data => createMutation.mutate(data))}
            >
              Create
            </Button>
          </>
        }
      >
        <ExamFormFields register={createForm.register} errors={createForm.formState.errors} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editExam}
        onClose={() => setEdit(null)}
        title="Edit Exam"
        description={editExam?.name}
        footer={
          <>
            <Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
            <Button
              id="exam-edit-submit"
              loading={updateMutation.isPending}
              onClick={editForm.handleSubmit(data => updateMutation.mutate({ id: editExam!.id, data }))}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <ExamFormFields register={editForm.register} errors={editForm.formState.errors} />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteExam}
        onClose={() => setDelete(null)}
        title="Delete Exam"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteExam!.id)}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <span className="font-semibold text-foreground">{deleteExam?.name}</span>?
          This will also remove all associated subjects, topics, and question mappings.
        </p>
      </Modal>
    </div>
  );
}
