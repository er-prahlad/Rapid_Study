'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsApi, aiApi, examsApi } from '@/services/api';
import { Button, Badge, Skeleton, EmptyState, Modal, Alert, Pagination, Input, Select } from '@/components/ui';
import { truncate } from '@/lib/utils';

export default function AIDraftsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // AI Generation Modal State
  const [genOpen, setGenOpen] = useState(false);
  const [genExamName, setGenExamName] = useState('SSC CGL');
  const [genSubjectName, setGenSubjectName] = useState('Quantitative Aptitude');
  const [genTopicName, setGenTopicName] = useState('Percentage & Profit Loss');
  const [genTopicId, setGenTopicId] = useState('1');
  const [genDifficulty, setGenDifficulty] = useState('MEDIUM');
  const [genLanguage, setGenLanguage] = useState('EN');
  const [genCount, setGenCount] = useState('5');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-drafts', page],
    queryFn: async () => {
      const res = await questionsApi.getDrafts({ page, size: 20 });
      return res.data.data;
    },
  });

  const { data: examsData } = useQuery({
    queryKey: ['admin-exams-brief'],
    queryFn: async () => {
      const res = await examsApi.list({ size: 50 });
      return res.data.data.content;
    },
  });

  const selected = data?.content.find(q => q.id === preview);

  const approveMutation = useMutation({
    mutationFn: questionsApi.approve,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-drafts'] });
      setAlert({ type: 'success', msg: 'Question approved (→ APPROVED).' });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to approve question.' }),
  });

  const publishMutation = useMutation({
    mutationFn: questionsApi.publish,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-drafts'] });
      setAlert({ type: 'success', msg: 'Question published and live in question bank.' });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to publish question.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: questionsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-drafts'] });
      setPreview(null);
      setAlert({ type: 'success', msg: 'Draft deleted.' });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to delete draft.' }),
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      aiApi.generateQuestions({
        topicId: genTopicId ? Number(genTopicId) : 1,
        examName: genExamName,
        subjectName: genSubjectName,
        topicName: genTopicName,
        difficulty: genDifficulty,
        language: genLanguage,
        count: Number(genCount) || 5,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-drafts'] });
      setGenOpen(false);
      setAlert({
        type: 'success',
        msg: `✨ Generated ${genCount} questions successfully! Review them below before publishing.`,
      });
    },
    onError: (e: unknown) => {
      setAlert({
        type: 'error',
        msg: (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to generate questions with AI.',
      });
    },
  });

  return (
    <div className="space-y-5 animate-in">
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {/* Info Banner with Generator Action */}
      <div className="bg-gradient-to-r from-violet-900/90 to-indigo-900/90 text-white rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          <div>
            <p className="font-bold text-base">AI Question Generator & Review Studio</p>
            <p className="text-violet-200 text-xs mt-0.5">
              Generate curriculum-aligned MCQs with explanations or review pending AI drafts before publishing.
            </p>
          </div>
        </div>
        <Button
          id="open-ai-generate-modal-btn"
          className="bg-white text-violet-900 hover:bg-violet-100 font-semibold shrink-0"
          onClick={() => setGenOpen(true)}
        >
          ✨ Generate New Questions
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Draft Questions Awaiting Review ({data?.totalElements ?? 0})
          </h3>
          <span className="text-xs text-muted-foreground">Workflow: DRAFT → APPROVED → PUBLISHED</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Exam / Topic</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={6}><Skeleton className="h-8 w-full" /></td></tr>
                ))
              ) : data?.content.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="No draft questions pending review"
                      description="Click 'Generate New Questions' above to create draft questions using AI."
                      action={
                        <Button onClick={() => setGenOpen(true)}>✨ Generate Questions</Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                data?.content.map((q, i) => (
                  <tr key={q.id}>
                    <td className="text-muted-foreground text-xs">{page * 20 + i + 1}</td>
                    <td>
                      <p className="text-sm max-w-xs">{truncate(q.questionText, 70)}</p>
                    </td>
                    <td className="text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">{q.examName}</p>
                      <p className="opacity-70">{q.topicName || q.subjectName}</p>
                    </td>
                    <td>
                      <Badge variant={
                        q.difficulty === 'EASY' ? 'success'
                          : q.difficulty === 'HARD' ? 'destructive'
                          : 'warning'
                      }>
                        {q.difficulty}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant="warning" dot>DRAFT</Badge>
                    </td>
                    <td>
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => setPreview(q.id)}>
                          Review
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={approveMutation.isPending}
                          onClick={() => approveMutation.mutate(q.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          loading={publishMutation.isPending}
                          onClick={() => publishMutation.mutate(q.id)}
                        >
                          Publish
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

      {/* AI Generator Modal */}
      <Modal
        open={genOpen}
        onClose={() => setGenOpen(false)}
        title="✨ Generate MCQs with AI"
        description="Creates draft questions with 4 options and detailed explanations"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setGenOpen(false)}>Cancel</Button>
            <Button
              id="submit-ai-generation-btn"
              loading={generateMutation.isPending}
              onClick={() => generateMutation.mutate()}
            >
              Start AI Generation
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gen-exam" className="text-xs font-semibold text-muted-foreground">Exam Name</label>
              <input
                id="gen-exam"
                value={genExamName}
                onChange={(e) => setGenExamName(e.target.value)}
                placeholder="e.g. SSC CGL or UPSC"
                className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="gen-subject" className="text-xs font-semibold text-muted-foreground">Subject Name</label>
              <input
                id="gen-subject"
                value={genSubjectName}
                onChange={(e) => setGenSubjectName(e.target.value)}
                placeholder="e.g. Reasoning or History"
                className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label htmlFor="gen-topic" className="text-xs font-semibold text-muted-foreground">Topic Name</label>
              <input
                id="gen-topic"
                value={genTopicName}
                onChange={(e) => setGenTopicName(e.target.value)}
                placeholder="e.g. Coding-Decoding"
                className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="gen-topic-id" className="text-xs font-semibold text-muted-foreground">Topic ID</label>
              <input
                id="gen-topic-id"
                type="number"
                value={genTopicId}
                onChange={(e) => setGenTopicId(e.target.value)}
                placeholder="1"
                className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Difficulty"
              id="gen-diff"
              value={genDifficulty}
              onChange={(e) => setGenDifficulty(e.target.value)}
              options={[
                { value: 'EASY', label: 'Easy' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HARD', label: 'Hard' },
              ]}
            />

            <Select
              label="Language"
              id="gen-lang"
              value={genLanguage}
              onChange={(e) => setGenLanguage(e.target.value)}
              options={[
                { value: 'EN', label: 'English' },
                { value: 'HINDI', label: 'Hindi' },
              ]}
            />

            <Input
              label="Count (1 - 20)"
              id="gen-count"
              type="number"
              min="1"
              max="20"
              value={genCount}
              onChange={(e) => setGenCount(e.target.value)}
            />
          </div>

          <div className="p-3 bg-violet-50 dark:bg-violet-950/40 rounded-lg border border-violet-200 dark:border-violet-800 text-xs text-violet-800 dark:text-violet-300">
            💡 AI generates questions, 4 options, marks the correct answer, and writes a detailed explanation. They are saved in DRAFT status for review.
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      {selected && (
        <Modal
          open={!!preview}
          onClose={() => setPreview(null)}
          title="Review Draft Question"
          description="AI-generated · DRAFT status"
          size="lg"
          footer={
            <div className="flex gap-2 w-full">
              <Button
                variant="destructive"
                size="sm"
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(selected.id)}
              >
                Delete Draft
              </Button>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => setPreview(null)}>Close</Button>
              <Button
                variant="secondary"
                loading={approveMutation.isPending}
                onClick={() => { approveMutation.mutate(selected.id); setPreview(null); }}
              >
                Approve Only
              </Button>
              <Button
                loading={publishMutation.isPending}
                onClick={() => { publishMutation.mutate(selected.id); setPreview(null); }}
              >
                Approve & Publish
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Badge variant={selected.difficulty === 'EASY' ? 'success' : selected.difficulty === 'HARD' ? 'destructive' : 'warning'}>
                {selected.difficulty}
              </Badge>
              <Badge variant="default">{selected.examName}</Badge>
              <Badge variant="primary">{selected.topicName}</Badge>
            </div>

            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-sm font-medium text-foreground leading-relaxed">{selected.questionText}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Options</p>
              {selected.options?.map((opt, i) => (
                <div
                  key={opt.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    opt.isCorrect
                      ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800'
                      : 'bg-muted/30 border-border'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    opt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <p className={`text-sm ${opt.isCorrect ? 'text-emerald-800 dark:text-emerald-200 font-medium' : 'text-foreground'}`}>
                    {opt.optionText}
                  </p>
                  {opt.isCorrect && (
                    <span className="ml-auto text-xs text-emerald-600 font-medium">✓ Correct</span>
                  )}
                </div>
              ))}
            </div>

            {selected.explanation && (
              <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Explanation</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">{selected.explanation}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
