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
  paperType?: "MOCK_TEST" | "PREVIOUS_YEAR";
  paperYear?: number;
  liveStartsAt?: string;
  liveEndsAt?: string;
  isLive?: boolean;
  liveStatus?: "REGULAR" | "UPCOMING" | "LIVE" | "ENDED";
  createdAt: string;
}

export interface QuestionSafeDto {
  id: number;
  topicId: number;
  topicName?: string;
  subjectId?: number;
  subjectName?: string;
  sectionName?: string;
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

export interface TestRankEntryDto {
  rank: number;
  userId: number;
  userName: string;
  profileImage?: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  timeTakenSeconds?: number;
  completedAt?: string;
}

export interface TestLeaderboardDto {
  testId: number;
  testTitle: string;
  totalMarks: number;
  totalParticipants: number;
  highestScore: number;
  averageScore: number;
  averageAccuracy: number;
  myRank?: number;
  myScore?: number;
  myAccuracy?: number;
  myTimeTakenSeconds?: number;
  myPercentile?: number;
  rankings: TestRankEntryDto[];
}

export interface UserTestStatusDto {
  testId: number;
  attempted: boolean;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ATTEMPTED";
  activeAttemptId?: number;
  lastAttemptId?: number;
  bestScore?: number;
  totalMarks?: number;
  bestAccuracy?: number;
  totalAttemptsCount: number;
  lastAttemptedAt?: string;
}

export interface TestSectionDto {
  subjectId?: number;
  sectionName: string;
  questionCount: number;
  totalMarks: number;
  questionIds: number[];
}

// Student
export const mockTestApi = {
  list: (params?: { examId?: number; search?: string; page?: number; size?: number }) =>
    apiClient.get<ApiResponse<PageResponse<MockTestDto>>>("/tests", { params }).then(r => r.data),

  getById: (id: number) =>
    apiClient.get<ApiResponse<MockTestDto>>(`/tests/${id}`).then(r => r.data),

  getQuestions: (id: number) =>
    apiClient.get<ApiResponse<QuestionSafeDto[]>>(`/tests/${id}/questions`).then(r => r.data),

  getLeaderboard: (id: number) =>
    apiClient.get<ApiResponse<TestLeaderboardDto>>(`/tests/${id}/leaderboard`).then(r => r.data),

  getMyStatus: (id: number) =>
    apiClient.get<ApiResponse<UserTestStatusDto>>(`/tests/${id}/my-status`).then(r => r.data),

  getAllMyStatuses: () =>
    apiClient.get<ApiResponse<Record<string, UserTestStatusDto>>>("/tests/my-status").then(r => r.data),

  getSections: (id: number) =>
    apiClient.get<ApiResponse<TestSectionDto[]>>(`/tests/${id}/sections`).then(r => r.data),

  getLiveTests: () =>
    apiClient.get<ApiResponse<MockTestDto[]>>("/tests/live").then(r => r.data),
};

// Admin
export const adminMockTestApi = {
  list: (params?: { examId?: number; search?: string; page?: number; size?: number }) =>
    apiClient.get<ApiResponse<PageResponse<MockTestDto>>>("/admin/tests", { params }).then(r => r.data),

  create: (data: { examId: number; title: string; description?: string; durationMinutes: number; totalQuestions: number; totalMarks: number; negativeMarks?: number; liveStartsAt?: string; liveEndsAt?: string }) =>
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
