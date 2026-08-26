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
};
