'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { testsApi } from '@/services/api';
import { Button, Badge, Skeleton, EmptyState, Modal, Alert, Input, Select, Pagination, Checkbox } from '@/components/ui';
import { formatDate, formatNumber, debounce } from '@/lib/utils';
import type { MockTestDto, AddQuestionsRequest } from '@/types/api';

const testSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  examId: z.string().min(1, 'Exam ID is required'),
  durationMinutes: z.string().min(1, 'Duration is required'),
  totalMarks: z.string().min(1, 'Total marks is required'),
  passingMarks: z.string().min(1, 'Passing marks is required'),
  negativeMarking: z.boolean(),
  negativeMarkValue: z.string(),
});
type TestForm = z.infer<typeof testSchema>;

function TestFormModal({ open, onClose, initial, onSave, loading }: {
  open: boolean; onClose: () => void;
  initial?: MockTestDto | null;
  onSave: (d: TestForm) => void; loading: boolean;
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<TestForm>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      examId: String(initial?.examId ?? ''),
      durationMinutes: String(initial?.durationMinutes ?? 60),
      totalMarks: String(initial?.totalMarks ?? 100),
      passingMarks: String(initial?.passingMarks ?? 40),
      negativeMarking: initial?.negativeMarking ?? false,
      negativeMarkValue: String(initial?.negativeMarkValue ?? 0.25),
    },
  });
  const negMarking = watch('negativeMarking');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Mock Test' : 'Create Mock Test'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button id="test-save-btn" loading={loading} onClick={handleSubmit(onSave)}>
            {initial ? 'Save Changes' : 'Create Test'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Test Title" id="test-title" {...register('title')} error={errors.title?.message} placeholder="e.g. SSC CGL 2025 — Full Test 1" />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="test-desc" className="text-sm font-medium">Description (optional)</label>
          <textarea
            id="test-desc"
            {...register('description')}
            rows={2}
            placeholder="Brief description…"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Input label="Exam ID" id="test-exam-id" type="number" {...register('examId')} error={errors.examId?.message} placeholder="e.g. 1" />
        <div className="grid grid-cols-3 gap-3">
          <Input label="Duration (min)" id="test-duration" type="number" {...register('durationMinutes')} error={errors.durationMinutes?.message} />
          <Input label="Total Marks" id="test-total-marks" type="number" {...register('totalMarks')} error={errors.totalMarks?.message} />
          <Input label="Passing Marks" id="test-passing-marks" type="number" {...register('passingMarks')} error={errors.passingMarks?.message} />
        </div>
        <div className="flex flex-col gap-3">
          <Checkbox label="Enable Negative Marking" id="test-neg-marking" {...register('negativeMarking')} />
          {negMarking && (
            <Input
              label="Negative Mark Value"
              id="test-neg-value"
              type="number"
              step="0.25"
              {...register('negativeMarkValue')}
              placeholder="e.g. 0.25"
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function TestsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [createOpen, setCreate] = useState(false);
  const [editTest, setEdit] = useState<MockTestDto | null>(null);
  const [deleteTest, setDelete] = useState<MockTestDto | null>(null);
  const [viewTest, setView] = useState<MockTestDto | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Question builder states
  const [addMode, setAddMode] = useState(false);
  const [addTopicId, setAddTopicId] = useState('');
  const [addDifficulty, setAddDifficulty] = useState('');
  const [addCount, setAddCount] = useState('5');
  const [addQIds, setAddQIds] = useState('');
  const [removingQId, setRemovingQId] = useState<number | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((v: unknown) => {
      setSearch(String(v));
      setPage(0);
    }, 400),
    []
  );

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tests', page, search],
    queryFn: async () => {
      const res = await testsApi.list({ search: search || undefined, page, size: 20 });
      return res.data.data;
    },
  });

  const { data: testQsData } = useQuery({
    queryKey: ['admin-test-questions', viewTest?.id],
    queryFn: () => testsApi.getQuestions(viewTest!.id).then(r => r.data.data),
    enabled: !!viewTest,
  });

  function toTestRequest(d: TestForm) {
    return {
      title: d.title,
      description: d.description,
      examId: Number(d.examId),
      durationMinutes: Number(d.durationMinutes),
      totalMarks: Number(d.totalMarks),
      passingMarks: Number(d.passingMarks),
      negativeMarking: d.negativeMarking,
      negativeMarkValue: Number(d.negativeMarkValue),
    };
  }

  const createMutation = useMutation({
    mutationFn: (d: TestForm) => testsApi.create(toTestRequest(d)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tests'] }); setCreate(false); setAlert({ type: 'success', msg: 'Test created.' }); },
    onError: () => setAlert({ type: 'error', msg: 'Failed to create test.' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: number; d: TestForm }) => testsApi.update(id, toTestRequest(d)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tests'] }); setEdit(null); setAlert({ type: 'success', msg: 'Test updated.' }); },
    onError: () => setAlert({ type: 'error', msg: 'Failed to update test.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: testsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tests'] }); setDelete(null); setAlert({ type: 'success', msg: 'Test deleted.' }); },
    onError: () => setAlert({ type: 'error', msg: 'Failed to delete test.' }),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, pub }: { id: number; pub: boolean }) => pub ? testsApi.unpublish(id) : testsApi.publish(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tests'] }); setAlert({ type: 'success', msg: 'Test status updated.' }); },
    onError: () => setAlert({ type: 'error', msg: 'Failed to update test status.' }),
  });

  const removeQMutation = useMutation({
    mutationFn: ({ testId, qId }: { testId: number; qId: number }) =>
      testsApi.removeQuestion(testId, qId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-test-questions', viewTest?.id] });
      qc.invalidateQueries({ queryKey: ['admin-tests'] });
      setRemovingQId(null);
      setAlert({ type: 'success', msg: 'Question removed from test.' });
    },
    onError: () => {
      setRemovingQId(null);
      setAlert({ type: 'error', msg: 'Failed to remove question.' });
    },
  });

  const addQMutation = useMutation({
    mutationFn: ({ testId, req }: { testId: number; req: AddQuestionsRequest }) =>
      testsApi.addQuestions(testId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-test-questions', viewTest?.id] });
      qc.invalidateQueries({ queryKey: ['admin-tests'] });
      setAddMode(false);
      setAddQIds('');
      setAlert({ type: 'success', msg: 'Questions added to test successfully.' });
    },
    onError: (e: unknown) => {
      setAlert({
        type: 'error',
        msg: (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to add questions.',
      });
    },
  });

  return (
    <div className="space-y-5 animate-in">
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {/* Toolbar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            id="tests-search"
            placeholder="Search mock tests…"
            onChange={e => debouncedSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button id="create-test-btn" onClick={() => setCreate(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Test
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Exam</th>
                <th>Duration</th>
                <th>Marks</th>
                <th>Questions</th>
                <th>Attempts</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}><td colSpan={8}><Skeleton className="h-8 w-full" /></td></tr>
                ))
              ) : data?.content.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState title="No tests yet" description="Create your first mock test." />
                  </td>
                </tr>
              ) : (
                data?.content.map((test) => (
                  <tr key={test.id}>
                    <td>
                      <p className="font-medium text-foreground text-sm max-w-[200px] truncate">{test.title}</p>
                      {test.negativeMarking && (
                        <span className="text-xs text-amber-600">-{test.negativeMarkValue} negative</span>
                      )}
                    </td>
                    <td className="text-muted-foreground">{test.examName}</td>
                    <td className="text-muted-foreground">{test.durationMinutes}m</td>
                    <td className="text-muted-foreground">{test.totalMarks}/{test.passingMarks}</td>
                    <td className="font-medium">{formatNumber(test.questionCount)}</td>
                    <td className="text-muted-foreground">{formatNumber(test.attemptCount)}</td>
                    <td>
                      <Badge variant={test.isPublished ? 'success' : 'warning'} dot>
                        {test.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="View questions" onClick={() => setView(test)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit" onClick={() => setEdit(test)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={test.isPublished ? 'Unpublish' : 'Publish'}
                          onClick={() => publishMutation.mutate({ id: test.id, pub: test.isPublished })}
                          className={test.isPublished ? 'text-amber-600' : 'text-emerald-600'}
                        >
                          {test.isPublished ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          )}
                        </Button>
                        <Button
                          variant="ghost" size="icon" title="Delete"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDelete(test)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
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

      {/* Create / Edit */}
      <TestFormModal open={createOpen} onClose={() => setCreate(false)} onSave={d => createMutation.mutate(d)} loading={createMutation.isPending} />
      <TestFormModal open={!!editTest} onClose={() => setEdit(null)} initial={editTest} onSave={d => updateMutation.mutate({ id: editTest!.id, d })} loading={updateMutation.isPending} />

      {/* Delete Confirm */}
      <Modal
        open={!!deleteTest}
        onClose={() => setDelete(null)}
        title="Delete Mock Test"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDelete(null)}>Cancel</Button>
            <Button variant="destructive" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteTest!.id)}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Delete <span className="font-semibold text-foreground">{deleteTest?.title}</span>? This cannot be undone.
        </p>
      </Modal>

      {/* View & Manage Questions Modal */}
      <Modal
        open={!!viewTest}
        onClose={() => { setView(null); setAddMode(false); }}
        title={`Questions — ${viewTest?.title}`}
        description={`${testQsData?.length ?? viewTest?.questionCount ?? 0} questions currently in this test`}
        size="xl"
        footer={
          <div className="flex justify-between items-center w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddMode(!addMode)}
            >
              {addMode ? '← Back to Questions' : '+ Add Questions to Test'}
            </Button>
            <Button onClick={() => { setView(null); setAddMode(false); }}>Done</Button>
          </div>
        }
      >
        {addMode ? (
          <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-4">
            <h4 className="font-semibold text-sm text-foreground">Add Questions to Test</h4>
            <p className="text-xs text-muted-foreground">
              Select method to add questions to this test. You can add questions by topic/difficulty or by specific question IDs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Topic ID (optional)"
                id="add-q-topic"
                type="number"
                placeholder="e.g. 1"
                value={addTopicId}
                onChange={(e) => setAddTopicId(e.target.value)}
              />
              <Select
                label="Difficulty"
                id="add-q-diff"
                options={[
                  { value: '', label: 'Any Difficulty' },
                  { value: 'EASY', label: 'Easy' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HARD', label: 'Hard' },
                ]}
                value={addDifficulty}
                onChange={(e) => setAddDifficulty(e.target.value)}
              />
              <Input
                label="Number of Questions"
                id="add-q-count"
                type="number"
                min="1"
                max="100"
                placeholder="e.g. 10"
                value={addCount}
                onChange={(e) => setAddCount(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="add-q-ids" className="text-sm font-medium">Or Specific Question IDs (comma-separated)</label>
              <input
                id="add-q-ids"
                type="text"
                placeholder="e.g. 101, 102, 103"
                value={addQIds}
                onChange={(e) => setAddQIds(e.target.value)}
                className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setAddMode(false)}>
                Cancel
              </Button>
              <Button
                id="confirm-add-questions-btn"
                size="sm"
                loading={addQMutation.isPending}
                onClick={() => {
                  if (!viewTest) return;
                  const ids = addQIds.trim()
                    ? addQIds.split(',').map((x) => Number(x.trim())).filter((n) => !isNaN(n) && n > 0)
                    : undefined;

                  addQMutation.mutate({
                    testId: viewTest.id,
                    req: {
                      questionIds: ids && ids.length > 0 ? ids : undefined,
                      topicId: addTopicId ? Number(addTopicId) : undefined,
                      difficulty: addDifficulty || undefined,
                      randomCount: addCount ? Number(addCount) : 5,
                    },
                  });
                }}
              >
                Add Questions
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {testQsData && testQsData.length > 0 ? (
              testQsData.map((q, i) => (
                <div key={q.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-card border border-border">
                  <div className="flex gap-3 min-w-0 flex-1">
                    <span className="text-xs font-bold text-muted-foreground w-6 shrink-0 mt-0.5">{i + 1}.</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground font-medium">{q.questionText}</p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {q.options?.map((o) => (
                          <span
                            key={o.id}
                            className={`text-xs px-2 py-0.5 rounded-full border ${
                              o.isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold'
                                : 'bg-muted/40 border-border text-muted-foreground'
                            }`}
                          >
                            {o.isCorrect ? '✓ ' : ''}{o.optionText}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    title="Remove from test"
                    loading={removeQMutation.isPending && removingQId === q.id}
                    onClick={() => {
                      if (viewTest) {
                        setRemovingQId(q.id);
                        removeQMutation.mutate({ testId: viewTest.id, qId: q.id });
                      }
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 space-y-3">
                <p className="text-sm text-muted-foreground">No questions in this test yet.</p>
                <Button size="sm" onClick={() => setAddMode(true)}>+ Add First Question</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
