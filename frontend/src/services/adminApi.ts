import apiClient from "./apiClient";
import type { ApiResponse } from "@/types";
import type { PageResponse } from "@/types/exam";

// ── Admin Dashboard ──────────────────────────────────────────────────────────

export interface AdminDashboard {
  totalUsers:      number;
  activeUsers:     number;
  totalExams:      number;
  totalQuestions:  number;
  totalTests:      number;
  totalAttempts:   number;
  todaysAttempts:  number;
  totalSubjects:   number;
  totalTopics:     number;
  userRegistrations: { label: string; value: number }[];
  testAttempts:      { label: string; value: number }[];
  popularExams:      { examId: number; examName: string; attempts: number }[];
  averageScore:      number;
}

// ── Admin User ───────────────────────────────────────────────────────────────

export interface AdminUser {
  id:             number;
  name:           string;
  email:          string;
  phone?:         string;
  profileImage?:  string;
  role:           "STUDENT" | "ADMIN";
  language:       string;
  isActive:       boolean;
  createdAt:      string;
  testsCompleted: number;
}

// ── Search ───────────────────────────────────────────────────────────────────

export interface SearchResult {
  query:     string;
  exams:     any[];
  tests:     any[];
  questions: any[];
  topics:    { id: number; name: string; subjectName: string }[];
}

// ── API ──────────────────────────────────────────────────────────────────────

export const adminApi = {
  getDashboard: () =>
    apiClient.get<ApiResponse<AdminDashboard>>("/admin/dashboard").then(r => r.data),

  getUsers: (params?: { search?: string; role?: string; isActive?: boolean; page?: number; size?: number }) =>
    apiClient.get<ApiResponse<PageResponse<AdminUser>>>("/admin/users", { params }).then(r => r.data),

  getUser: (id: number) =>
    apiClient.get<ApiResponse<AdminUser>>(`/admin/users/${id}`).then(r => r.data),

  setStatus: (id: number, isActive: boolean) =>
    apiClient.put<ApiResponse<AdminUser>>(`/admin/users/${id}/status`, { isActive }).then(r => r.data),

  setRole: (id: number, role: string) =>
    apiClient.put<ApiResponse<AdminUser>>(`/admin/users/${id}/role`, { role }).then(r => r.data),
};

export const searchApi = {
  search: (q: string, size = 5) =>
    apiClient.get<ApiResponse<SearchResult>>("/search", { params: { q, size } }).then(r => r.data),
};

export const aiApi = {
  explain: (data: { questionId?: number; questionText: string; correctAnswer: string }) =>
    apiClient.post<ApiResponse<{ explanation: string; aiUsed: boolean }>>("/ai/explain", data).then(r => r.data),

  analyzePerformance: () =>
    apiClient.post<ApiResponse<{ analysis: string; aiUsed: boolean }>>("/ai/analyze-performance").then(r => r.data),

  generateStudyPlan: (data: { examName: string; daysLeft: number; weakAreas: string; currentAccuracy: number }) =>
    apiClient.post<ApiResponse<{ studyPlan: string; aiUsed: boolean }>>("/ai/generate-study-plan", data).then(r => r.data),

  status: () =>
    apiClient.get<ApiResponse<{ available: boolean }>>("/ai/status").then(r => r.data),
};
