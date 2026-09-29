'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { questionsApi } from '@/services/api';
import { Button, Badge, Skeleton, EmptyState, Modal, Alert, Input, Select, Pagination } from '@/components/ui';
import { formatDate, truncate, debounce } from '@/lib/utils';
import type { QuestionDto } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

const qSchema = z.object({
  questionText: z.string().min(5, 'Question text is required'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  topicId: z.string().min(1, 'Topic ID is required'),
  explanation: z.string().optional(),
  options: z.array(z.object({
    optionText: z.string().min(1, 'Option text is required'),
    isCorrect: z.boolean(),
  })).min(2, 'At least 2 options required'),
});
type QForm = z.infer<typeof qSchema>;

const diffBadge: Record<string, 'success' | 'warning' | 'destructive'> = {
  EASY: 'success', MEDIUM: 'warning', HARD: 'destructive',
};

function QuestionFormModal({ open, onClose, initial, onSave, loading }: {
  open: boolean;
  onClose: () => void;
  initial?: QuestionDto | null;
  onSave: (data: QForm) => void;
  loading: boolean;
}) {
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<QForm>({
    resolver: zodResolver(qSchema),
    defaultValues: {
      questionText: initial?.questionText ?? '',
      difficulty: (initial?.difficulty as 'EASY' | 'MEDIUM' | 'HARD') ?? 'MEDIUM',
      topicId: String(initial?.topicId ?? ''),
      explanation: initial?.explanation ?? '',
      options: initial?.options?.length
        ? initial.options.map(o => ({ optionText: o.optionText, isCorrect: o.isCorrect }))
        : [
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
        ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'options' });
  const options = watch('options');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Question' : 'Add Question'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button id="question-save-btn" loading={loading} onClick={handleSubmit(onSave)}>
            {initial ? 'Save Changes' : 'Create Question'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="q-text" className="text-sm font-medium">Question Text</label>
          <textarea
            id="q-text"
            {...register('questionText')}
            rows={3}
            placeholder="Enter question text…"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.questionText && <p className="text-xs text-destructive">{errors.questionText.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Difficulty"
            id="q-difficulty"
            {...register('difficulty')}
            options={[
              { value: 'EASY', label: 'Easy' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HARD', label: 'Hard' },
            ]}
            error={errors.difficulty?.message}
          />
          <Input
            label="Topic ID"
            id="q-topic-id"
            type="number"
            {...register('topicId')}
            placeholder="e.g. 1"
            error={errors.topicId?.message}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Options</label>
          {fields.map((f, i) => (
            <div key={f.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctOption"
                checked={options?.[i]?.isCorrect}
                onChange={() => {
                  options.forEach((_, idx) => setValue(`options.${idx}.isCorrect`, idx === i));
                }}
                className="accent-primary h-4 w-4 shrink-0"
              />
              <span className="text-xs font-semibold text-muted-foreground w-4 shrink-0">{String.fromCharCode(65 + i)}.</span>
              <input
                {...register(`options.${i}.optionText`)}
                placeholder={`Option ${String.fromCharCode(65 + i)}…`}
                className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {fields.length > 2 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
                  <svg className="w-4 h-4 text-muted-foreground hover:text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>
          ))}
          {fields.length < 6 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={() => append({ optionText: '', isCorrect: false })}
            >
              + Add Option
            </Button>
          )}
          <p className="text-xs text-muted-foreground">Select the radio button next to the correct answer.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="q-explanation" className="text-sm font-medium">Explanation (optional)</label>
          <textarea
            id="q-explanation"
            {...register('explanation')}
            rows={2}
            placeholder="Explanation for the correct answer…"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
    </Modal>
  );
}

export default function QuestionsPage() {
  const qc = useQueryClient();
  const { isContentCreator, canApproveQuestions, isAdmin, isSuperAdmin } = useAuth();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreate] = useState(false);
  const [viewQ, setViewQ] = useState<QuestionDto | null>(null);
  const [editQ, setEditQ] = useState<QuestionDto | null>(null);
  const [deleteQ, setDeleteQ] = useState<QuestionDto | null>(null);
  const [importOpen, setImport] = useState(false);
  const [importFile, setFile] = useState<File | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((v: unknown) => {
      setSearch(String(v));
      setPage(0);
    }, 400),
    []
  );

  const { data, isLoading } = useQuery({
    queryKey: ['admin-questions', page, search, difficulty, statusFilter],
    queryFn: async () => {
      const res = await questionsApi.list({
        search: search || undefined,
        difficulty: difficulty || undefined,
        isActive: statusFilter === '' ? undefined : statusFilter === 'true',
        page,
        size: 20,
      });
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: QForm) => questionsApi.create({
      questionText: d.questionText,
      questionType: 'MCQ',
      difficulty: d.difficulty,
      topicId: Number(d.topicId),
      options: d.options,
      explanation: d.explanation,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-questions'] });
      setCreate(false);
      setAlert({
        type: 'success',
        msg: isContentCreator
          ? 'Question draft created! A reviewer will verify and approve it.'
          : 'Question created successfully.',
      });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to create question.' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: number; d: QForm }) => questionsApi.update(id, {
      questionText: d.questionText,
      questionType: 'MCQ',
      difficulty: d.difficulty,
      topicId: Number(d.topicId),
      options: d.options,
      explanation: d.explanation,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-questions'] });
      setEditQ(null);
      setAlert({ type: 'success', msg: 'Question updated successfully.' });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to update question.' }),
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => questionsApi.activate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-questions'] });
      if (viewQ) setViewQ(prev => prev ? { ...prev, isActive: true, status: 'PUBLISHED' } : null);
      setAlert({ type: 'success', msg: 'Question verified and activated successfully!' });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to activate question.' }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => questionsApi.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-questions'] });
      if (viewQ) setViewQ(prev => prev ? { ...prev, isActive: false, status: 'DRAFT' } : null);
      setAlert({ type: 'success', msg: 'Question deactivated.' });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to deactivate question.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: questionsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-questions'] });
      setDeleteQ(null);
      setAlert({ type: 'success', msg: 'Question deleted.' });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to delete question.' }),
  });

  const importMutation = useMutation({
    mutationFn: questionsApi.importFile,
    onSuccess: (res) => {
      const r = res.data.data;
      qc.invalidateQueries({ queryKey: ['admin-questions'] });
      setImport(false);
      setFile(null);
      setAlert({
        type: 'success',
        msg: `Import complete: ${r.imported} imported, ${r.failed} failed, ${r.duplicates} duplicates.`,
      });
    },
    onError: () => setAlert({ type: 'error', msg: 'Import failed.' }),
  });

  return (
    <div className="space-y-5 animate-in">
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {/* Staff banner if content creator or reviewer */}
      {isContentCreator && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
          <span className="text-xl">✍️</span>
          <div>
            <p className="font-semibold">Content Creator Mode</p>
            <p className="text-xs opacity-90">
              You can type questions, import CSV/Excel questions, or use AI drafts. Questions will be verified and published by Reviewers or Admins.
            </p>
          </div>
        </div>
      )}

      {canApproveQuestions && !isSuperAdmin && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
          <span className="text-xl">🔍</span>
          <div>
            <p className="font-semibold">Reviewer Verification Enabled</p>
            <p className="text-xs opacity-90">
              Review questions created by staff or AI, verify the answers and explanation, then click <strong>Verify & Activate</strong> to publish.
            </p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            id="questions-search"
            placeholder="Search questions…"
            onChange={e => debouncedSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <Select
          id="questions-difficulty-filter"
          options={[
            { value: '', label: 'All Difficulty' },
            { value: 'EASY', label: 'Easy' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HARD', label: 'Hard' },
          ]}
          placeholder="All Difficulty"
          value={difficulty}
          onChange={e => { setDifficulty(e.target.value); setPage(0); }}
          className="w-36"
        />

        <Select
          id="questions-status-filter"
          options={[
            { value: '', label: 'All Status' },
            { value: 'true', label: 'Active / Published' },
            { value: 'false', label: 'Pending Review / Draft' },
          ]}
          placeholder="All Status"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          className="w-48"
        />

        <div className="flex gap-2 ml-auto">
          <Button id="import-questions-btn" variant="outline" onClick={() => setImport(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import CSV/XLSX
          </Button>
          <Button id="create-question-btn" onClick={() => setCreate(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Question
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="w-8">#</th>
                <th>Question</th>
                <th>Subject / Exam</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}><td colSpan={7}><Skeleton className="h-8 w-full" /></td></tr>
                ))
              ) : data?.content.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState title="No questions found" description="Create questions manually or import a CSV/XLSX." />
                  </td>
                </tr>
              ) : (
                data?.content.map((q, i) => (
                  <tr key={q.id}>
                    <td className="text-muted-foreground text-xs">{page * 20 + i + 1}</td>
                    <td>
                      <p className="text-sm max-w-xs">{truncate(q.questionText, 80)}</p>
                    </td>
                    <td className="text-muted-foreground text-xs">
                      <p className="font-medium text-foreground">{q.examName || '—'}</p>
                      <p className="text-muted-foreground/70">{q.subjectName || ''}</p>
                    </td>
                    <td>
                      <Badge variant={diffBadge[q.difficulty] ?? 'default'}>{q.difficulty}</Badge>
                    </td>
                    <td>
                      <Badge variant={q.isActive ? 'success' : 'warning'} dot>
                        {q.isActive ? 'Active' : 'Pending Review'}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground text-xs">{formatDate(q.createdAt)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        {/* View & Verify */}
                        <Button variant="ghost" size="icon" onClick={() => setViewQ(q)} title="View & Verify Question">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Button>

                        {/* Reviewer / Admin Approve Toggle */}
                        {canApproveQuestions && (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={activateMutation.isPending || deactivateMutation.isPending}
                            onClick={() => {
                              if (q.isActive) {
                                deactivateMutation.mutate(q.id);
                              } else {
                                activateMutation.mutate(q.id);
                              }
                            }}
                            title={q.isActive ? 'Deactivate Question' : 'Verify & Activate Question'}
                            className={q.isActive ? 'text-amber-500 hover:text-amber-600' : 'text-emerald-500 hover:text-emerald-600'}
                          >
                            {q.isActive ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </Button>
                        )}

                        {/* Edit */}
                        <Button variant="ghost" size="icon" onClick={() => setEditQ(q)} title="Edit Question">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>

                        {/* Delete (Admin & Super Admin only) */}
                        {(isAdmin || isSuperAdmin) && (
                          <Button variant="ghost" size="icon" onClick={() => setDeleteQ(q)} title="Delete Question" className="text-destructive hover:text-destructive">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data && data.totalPages > 1 && (
          <Pagination page={page} totalPages={data.totalPages} totalElements={data.totalElements} size={20} onChange={setPage} />
        )}
      </div>

      {/* View & Verify Question Modal */}
      <Modal
        open={!!viewQ}
        onClose={() => setViewQ(null)}
        title="Verify & Inspect Question"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {canApproveQuestions && viewQ && (
                viewQ.isActive ? (
                  <Button
                    variant="outline"
                    loading={deactivateMutation.isPending}
                    onClick={() => {
                      deactivateMutation.mutate(viewQ.id);
                    }}
                    className="text-amber-600 border-amber-300 hover:bg-amber-50"
                  >
                    Deactivate Question
                  </Button>
                ) : (
                  <Button
                    loading={activateMutation.isPending}
                    onClick={() => {
                      activateMutation.mutate(viewQ.id);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    ✓ Verify & Activate Question
                  </Button>
                )
              )}
            </div>
            <Button onClick={() => setViewQ(null)}>Close</Button>
          </div>
        }
      >
        {viewQ && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center justify-between pb-3 border-b border-border">
              <div className="flex gap-2">
                <Badge variant={diffBadge[viewQ.difficulty] ?? 'default'}>{viewQ.difficulty}</Badge>
                <Badge variant={viewQ.isActive ? 'success' : 'warning'} dot>
                  {viewQ.isActive ? 'Active / Published' : 'Pending Verification'}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground font-mono">ID #{viewQ.id} • Topic #{viewQ.topicId}</span>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Question</p>
              <p className="text-base text-foreground font-medium whitespace-pre-wrap">{viewQ.questionText}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Options</p>
              <div className="space-y-2">
                {viewQ.options?.map((opt, i) => (
                  <div
                    key={opt.id ?? i}
                    className={`p-3 rounded-lg border text-sm flex items-center justify-between ${
                      opt.isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-medium'
                        : 'bg-muted/40 border-border text-foreground'
                    }`}
                  >
                    <span>
                      <strong className="mr-2">{String.fromCharCode(65 + i)}.</strong> {opt.optionText}
                    </span>
                    {opt.isCorrect && (
                      <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                        ✓ Correct Answer
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {viewQ.explanation && (
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Explanation</p>
                <p className="text-xs text-foreground whitespace-pre-wrap">{viewQ.explanation}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create / Edit */}
      <QuestionFormModal
        open={createOpen}
        onClose={() => setCreate(false)}
        onSave={(d) => createMutation.mutate(d)}
        loading={createMutation.isPending}
      />
      <QuestionFormModal
        open={!!editQ}
        onClose={() => setEditQ(null)}
        initial={editQ}
        onSave={(d) => updateMutation.mutate({ id: editQ!.id, d })}
        loading={updateMutation.isPending}
      />

      {/* Delete Confirm */}
      <Modal
        open={!!deleteQ}
        onClose={() => setDeleteQ(null)}
        title="Delete Question"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteQ(null)}>Cancel</Button>
            <Button variant="destructive" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteQ!.id)}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Delete this question? This action cannot be undone.
        </p>
        <p className="text-sm font-medium text-foreground mt-2">{truncate(deleteQ?.questionText ?? '', 80)}</p>
      </Modal>

      {/* Import Modal */}
      <Modal
        open={importOpen}
        onClose={() => { setImport(false); setFile(null); }}
        title="Import Questions"
        description="Upload a CSV or XLSX file"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => { setImport(false); setFile(null); }}>Cancel</Button>
            <Button
              id="import-submit-btn"
              loading={importMutation.isPending}
              disabled={!importFile}
              onClick={() => importFile && importMutation.mutate(importFile)}
            >
              Import
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <svg className="w-10 h-10 mx-auto text-muted-foreground mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-muted-foreground mb-2">CSV or XLSX format</p>
            <input
              id="import-file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file-input')?.click()}>
              {importFile ? importFile.name : 'Choose File'}
            </Button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Need a sample file?</span>
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={() => {
                const sampleCsv = 'questionText,option1,option2,option3,option4,correctOption,difficulty,topicId,explanation\n"What is the capital of India?","Mumbai","New Delhi","Kolkata","Chennai",2,EASY,1,"New Delhi is the official capital of India."\n';
                const blob = new Blob([sampleCsv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sample_questions.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              📥 Download Sample CSV
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Columns: <code className="bg-muted px-1 py-0.5 rounded">questionText, option1, option2, option3, option4, correctOption (1-4), difficulty, topicId</code>
          </p>
        </div>
      </Modal>
    </div>
  );
}
