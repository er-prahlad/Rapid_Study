import apiClient from "./apiClient";
import type { ApiResponse } from "@/types";
import type { PageResponse } from "@/types/exam";

export interface MockTestDto {
  id: number;
  examId: number;
  examName?: string;
  title: string;
  description?: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarks: number;
  isPublished: boolean;
  createdAt: string;
}

export interface QuestionSafeDto {
  id: number;
  topicId: number;
  topicName?: string;
  questionText: string;
  questionTextHindi?: string;
  questionType: "MCQ" | "MULTI_SELECT" | "NUMERIC";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  marks: number;
  negativeMarks: number;
  options: OptionDto[];
}

export interface OptionDto {
  id: number;
  optionText: string;
  optionTextHindi?: string;
  optionOrder: number;
  isCorrect?: boolean; // only present in admin responses
}

// Student
export const mockTestApi = {
  list: (params?: { examId?: number; search?: string; page?: number; size?: number }) =>
    apiClient.get<ApiResponse<PageResponse<MockTestDto>>>("/tests", { params }).then(r => r.data),

  getById: (id: number) =>
    apiClient.get<ApiResponse<MockTestDto>>(`/tests/${id}`).then(r => r.data),

  getQuestions: (id: number) =>
    apiClient.get<ApiResponse<QuestionSafeDto[]>>(`/tests/${id}/questions`).then(r => r.data),
};

// Admin
export const adminMockTestApi = {
  list: (params?: { examId?: number; search?: string; page?: number; size?: number }) =>
    apiClient.get<ApiResponse<PageResponse<MockTestDto>>>("/admin/tests", { params }).then(r => r.data),

  create: (data: { examId: number; title: string; description?: string; durationMinutes: number; totalQuestions: number; totalMarks: number; negativeMarks?: number }) =>
    apiClient.post<ApiResponse<MockTestDto>>("/admin/tests", data).then(r => r.data),

  update: (id: number, data: object) =>
    apiClient.put<ApiResponse<MockTestDto>>(`/admin/tests/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/tests/${id}`).then(r => r.data),

  publish: (id: number) =>
    apiClient.post<ApiResponse<MockTestDto>>(`/admin/tests/${id}/publish`).then(r => r.data),

  unpublish: (id: number) =>
    apiClient.post<ApiResponse<MockTestDto>>(`/admin/tests/${id}/unpublish`).then(r => r.data),

  addQuestions: (id: number, data: object) =>
    apiClient.post<ApiResponse<MockTestDto>>(`/admin/tests/${id}/questions`, data).then(r => r.data),

  removeQuestion: (testId: number, questionId: number) =>
    apiClient.delete<ApiResponse<MockTestDto>>(`/admin/tests/${testId}/questions/${questionId}`).then(r => r.data),

  getQuestions: (id: number) =>
    apiClient.get<ApiResponse<QuestionSafeDto[]>>(`/admin/tests/${id}/questions`).then(r => r.data),
};
