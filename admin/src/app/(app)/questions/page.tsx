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

const qSchema = z.object({
  questionText: z.string().min(5, 'Question text is required'),
  difficulty:   z.enum(['EASY', 'MEDIUM', 'HARD']),
  topicId:      z.string().min(1, 'Topic ID is required'),
  explanation:  z.string().optional(),
  options: z.array(z.object({
    optionText: z.string().min(1, 'Option text is required'),
    isCorrect:  z.boolean(),
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
  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<QForm>({
    resolver: zodResolver(qSchema),
    defaultValues: {
      questionText: initial?.questionText ?? '',
      difficulty:   (initial?.difficulty as 'EASY' | 'MEDIUM' | 'HARD') ?? 'MEDIUM',
      topicId:      String(initial?.topicId ?? ''),
      explanation:  initial?.explanation ?? '',
      options: initial?.options?.length
        ? initial.options.map(o => ({ optionText: o.optionText, isCorrect: o.isCorrect }))
        : [
            { optionText: '', isCorrect: false },
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
              { value: 'EASY',   label: 'Easy' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HARD',   label: 'Hard' },
            ]}
            error={errors.difficulty?.message}
          />
          <Input
            label="Topic ID"
            id="q-topic-id"
            type="number"
            {...register('topicId')}
            placeholder="e.g. 12"
            error={errors.topicId?.message}
          />
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Answer Options</label>
            {errors.options && <p className="text-xs text-destructive">{typeof errors.options === 'object' && 'message' in errors.options ? (errors.options as { message?: string }).message : ''}</p>}
          </div>
          {fields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct-option"
                checked={options[i]?.isCorrect}
                onChange={() => {
                  fields.forEach((_, j) => {
                    const el = document.getElementById(`opt-correct-${j}`) as HTMLInputElement;
                    if (el) el.value = j === i ? 'true' : 'false';
                  });
                }}
                className="shrink-0 text-primary"
                title="Mark as correct"
                id={`opt-radio-${i}`}
              />
              <input
                id={`opt-correct-${i}`}
                type="hidden"
                {...register(`options.${i}.isCorrect`)}
              />
              <input
                id={`opt-text-${i}`}
                {...register(`options.${i}.optionText`)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {fields.length > 2 && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
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
  const [page, setPage]           = useState(0);
  const [search, setSearch]       = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus]       = useState('');
  const [createOpen, setCreate]   = useState(false);
  const [editQ, setEditQ]         = useState<QuestionDto | null>(null);
  const [deleteQ, setDeleteQ]     = useState<QuestionDto | null>(null);
  const [importOpen, setImport]   = useState(false);
  const [importFile, setFile]     = useState<File | null>(null);
  const [alert, setAlert]         = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce((v: string) => { setSearch(v); setPage(0); }, 400), []);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-questions', page, search, difficulty, status],
    queryFn: async () => {
      const res = await questionsApi.list({
        search: search || undefined,
        difficulty: difficulty || undefined,
        page, size: 20,
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-questions'] }); setCreate(false); setAlert({ type: 'success', msg: 'Question created.' }); },
    onError:   () => setAlert({ type: 'error', msg: 'Failed to create question.' }),
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-questions'] }); setEditQ(null); setAlert({ type: 'success', msg: 'Question updated.' }); },
    onError:   () => setAlert({ type: 'error', msg: 'Failed to update question.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: questionsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-questions'] }); setDeleteQ(null); setAlert({ type: 'success', msg: 'Question deleted.' }); },
    onError:   () => setAlert({ type: 'error', msg: 'Failed to delete question.' }),
  });

  const importMutation = useMutation({
    mutationFn: questionsApi.importFile,
    onSuccess: (res) => {
      const r = res.data.data;
      qc.invalidateQueries({ queryKey: ['admin-questions'] });
      setImport(false);
      setFile(null);
      setAlert({ type: 'success', msg: `Import done: ${r.imported} imported, ${r.failed} failed, ${r.duplicates} duplicates.` });
    },
    onError: () => setAlert({ type: 'error', msg: 'Import failed.' }),
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
            id="questions-search"
            placeholder="Search questions…"
            onChange={e => debouncedSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select
          id="questions-difficulty-filter"
          options={[{ value: 'EASY', label: 'Easy' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HARD', label: 'Hard' }]}
          placeholder="All Difficulty"
          value={difficulty}
          onChange={e => { setDifficulty(e.target.value); setPage(0); }}
          className="w-40"
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
                      <p>{q.examName}</p>
                      <p className="text-muted-foreground/70">{q.subjectName}</p>
                    </td>
                    <td>
                      <Badge variant={diffBadge[q.difficulty] ?? 'default'}>{q.difficulty}</Badge>
                    </td>
                    <td>
                      <Badge variant={q.isActive ? 'success' : 'default'} dot>
                        {q.status ?? (q.isActive ? 'Active' : 'Inactive')}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground">{formatDate(q.createdAt)}</td>
                    <td>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditQ(q)} title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteQ(q)} title="Delete" className="text-destructive hover:text-destructive">
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
          <p className="text-xs text-muted-foreground">
            Columns: <code className="bg-muted px-1 py-0.5 rounded">questionText, option1, option2, option3, option4, correctOption (1-4), difficulty, topicId</code>
          </p>
        </div>
      </Modal>
    </div>
  );
}
