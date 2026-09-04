import apiClient from "./apiClient";
import type { ApiResponse } from "@/types";
import type { QuestionSafeDto } from "./mockTestApi";

// ── Types ─────────────────────────────────────────────────────────────────────

export type QuestionState =
  | "NOT_VISITED"
  | "VISITED"
  | "ANSWERED"
  | "MARKED_FOR_REVIEW"
  | "ANSWERED_AND_MARKED";

export interface QuestionStateDto {
  questionId:       number;
  questionOrder:    number;
  state:            QuestionState;
  selectedOptionId: number | null;
  markedForReview:  boolean;
}

export interface StartAttemptResponse {
  attemptId:       number;
  mockTestId:      number;
  testTitle:       string;
  durationMinutes: number;
  startedAt:       string;
  expiresAt:       string;    // ISO string — server-controlled
  questions:       QuestionSafeDto[];
}

export interface AttemptStatusResponse {
  attemptId:        number;
  mockTestId:       number;
  testTitle:        string;
  durationMinutes:  number;
  startedAt:        string;
  expiresAt:        string;
  status:           "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  secondsRemaining: number;   // computed by server
  questionStates:   QuestionStateDto[];
}

export interface SaveAnswerResponse {
  questionId:       number;
  selectedOptionId: number;
  markedForReview:  boolean;
  state:            QuestionState;
}

// Phase 28
export interface SubmitResponse {
  attemptId:        number;
  score:            number;
  totalMarks:       number;
  percentage:       number;
  accuracy:         number;
  correctAnswers:   number;
  wrongAnswers:     number;
  unanswered:       number;
  timeTakenSeconds: number;
  submittedAt:      string;
  wasExpired:       boolean;
}

// Phase 29
export interface QuestionResultDto {
  questionId:        number;
  questionOrder:     number;
  questionText:      string;
  questionTextHindi?: string;
  difficulty:        string;
  marks:             number;
  negativeMarks:     number;
  marksObtained:     number;
  selectedOptionId:  number | null;
  correctOptionId:   number | null;
  isCorrect:         boolean;
  wasSkipped:        boolean;
  explanation?:      string;
  explanationHindi?: string;
  options: {
    id: number;
    optionText: string;
    optionTextHindi?: string;
    optionOrder: number;
    isCorrect: boolean;
  }[];
}

export interface ResultResponse {
  attemptId:        number;
  mockTestId:       number;
  testTitle:        string;
  score:            number;
  totalMarks:       number;
  percentage:       number;
  accuracy:         number;
  correctAnswers:   number;
  wrongAnswers:     number;
  unanswered:       number;
  timeTakenSeconds: number;
  startedAt:        string;
  submittedAt:      string;
  questions:        QuestionResultDto[];
}

// Phase 30 — Detailed Analysis
export interface SubjectAnalysis {
  subjectName:   string;
  total:         number;
  correct:       number;
  wrong:         number;
  skipped:       number;
  accuracy:      number;
  scoreObtained: number;
  totalMarks:    number;
}

export interface TopicAnalysis {
  topicName:   string;
  subjectName: string;
  total:       number;
  correct:     number;
  wrong:       number;
  skipped:     number;
  accuracy:    number;
}

export interface DifficultyAnalysis {
  difficulty: string;
  total:      number;
  correct:    number;
  wrong:      number;
  skipped:    number;
  accuracy:   number;
}

export interface TimeAnalysis {
  totalDurationSeconds:   number;
  timeTakenSeconds:       number;
  timeRemainingSeconds:   number;
  avgSecondsPerQuestion:  number;
  questionsAttempted:     number;
  questionsSkipped:       number;
}

export interface AnalysisResponse {
  attemptId:         number;
  testTitle:         string;
  score:             number;
  totalMarks:        number;
  percentage:        number;
  accuracy:          number;
  correctAnswers:    number;
  wrongAnswers:      number;
  unanswered:        number;
  subjectAnalysis:   SubjectAnalysis[];
  topicAnalysis:     TopicAnalysis[];
  difficultyAnalysis:DifficultyAnalysis[];
  timeAnalysis:      TimeAnalysis;
}

// Phase 31 — Performance
export interface ScoreHistory {
  attemptId:   number;
  testTitle:   string;
  score:       number;
  totalMarks:  number;
  percentage:  number;
  accuracy:    number;
  submittedAt: string;
}

export interface PerformanceResponse {
  testsAttempted:          number;
  testsCompleted:          number;
  averageScore:            number;
  averageAccuracy:         number;
  bestScore:               number;
  totalQuestionsAttempted: number;
  totalCorrect:            number;
  totalWrong:              number;
  currentStreak:           number;
  longestStreak:           number;
  scoreHistory:            ScoreHistory[];
  subjectPerformance:      SubjectAnalysis[];
  difficultyBreakdown:     DifficultyAnalysis[];
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const attemptApi = {
  start: (testId: number) =>
    apiClient
      .post<ApiResponse<StartAttemptResponse>>(`/tests/${testId}/attempts`)
      .then(r => r.data),

  getStatus: (attemptId: number) =>
    apiClient
      .get<ApiResponse<AttemptStatusResponse>>(`/attempts/${attemptId}`)
      .then(r => r.data),

  saveAnswer: (attemptId: number, questionId: number, selectedOptionId: number) =>
    apiClient
      .put<ApiResponse<SaveAnswerResponse>>(
        `/attempts/${attemptId}/answers/${questionId}`,
        { selectedOptionId }
      ).then(r => r.data),

  clearAnswer: (attemptId: number, questionId: number) =>
    apiClient
      .delete<ApiResponse<void>>(`/attempts/${attemptId}/answers/${questionId}`)
      .then(r => r.data),

  markForReview: (attemptId: number, questionId: number) =>
    apiClient
      .put<ApiResponse<QuestionStateDto>>(
        `/attempts/${attemptId}/questions/${questionId}/review`
      ).then(r => r.data),

  unmarkReview: (attemptId: number, questionId: number) =>
    apiClient
      .delete<ApiResponse<QuestionStateDto>>(
        `/attempts/${attemptId}/questions/${questionId}/review`
      ).then(r => r.data),

  // Phase 28: Submit
  submit: (attemptId: number) =>
    apiClient
      .post<ApiResponse<SubmitResponse>>(`/attempts/${attemptId}/submit`)
      .then(r => r.data),

  // Phase 29: Result
  getResult: (attemptId: number) =>
    apiClient
      .get<ApiResponse<ResultResponse>>(`/attempts/${attemptId}/result`)
      .then(r => r.data),

  // Phase 30: Detailed analysis
  getAnalysis: (attemptId: number) =>
    apiClient
      .get<ApiResponse<AnalysisResponse>>(`/attempts/${attemptId}/analysis`)
      .then(r => r.data),
};
