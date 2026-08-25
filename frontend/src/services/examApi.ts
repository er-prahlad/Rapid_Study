import apiClient from "./apiClient";
import type { ApiResponse } from "@/types";
import type {
  ExamDto, ExamDetailDto, SubjectDto, MockTestSummaryDto,
  PageResponse, ExamRequest, SubjectRequest, TopicRequest, TopicDto,
} from "@/types/exam";

// ── Student / public ──────────────────────────────────────────────────────────

export const examApi = {
  list: (params?: { search?: string; page?: number; size?: number }) =>
    apiClient
      .get<ApiResponse<PageResponse<ExamDto>>>("/exams", { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient
      .get<ApiResponse<ExamDetailDto>>(`/exams/${id}`)
      .then((r) => r.data),

  getSubjects: (id: number) =>
    apiClient
      .get<ApiResponse<SubjectDto[]>>(`/exams/${id}/subjects`)
      .then((r) => r.data),

  getTests: (id: number, params?: { page?: number; size?: number }) =>
    apiClient
      .get<ApiResponse<PageResponse<MockTestSummaryDto>>>(`/exams/${id}/tests`, { params })
      .then((r) => r.data),
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminExamApi = {
  list: (params?: { search?: string; page?: number; size?: number }) =>
    apiClient
      .get<ApiResponse<PageResponse<ExamDto>>>("/admin/exams", { params })
      .then((r) => r.data),

  create: (data: ExamRequest) =>
    apiClient.post<ApiResponse<ExamDto>>("/admin/exams", data).then((r) => r.data),

  update: (id: number, data: ExamRequest) =>
    apiClient.put<ApiResponse<ExamDto>>(`/admin/exams/${id}`, data).then((r) => r.data),

  deactivate: (id: number) =>
    apiClient.patch<ApiResponse<void>>(`/admin/exams/${id}/deactivate`).then((r) => r.data),

  activate: (id: number) =>
    apiClient.patch<ApiResponse<void>>(`/admin/exams/${id}/activate`).then((r) => r.data),

  // Subjects
  createSubject: (data: SubjectRequest) =>
    apiClient.post<ApiResponse<SubjectDto>>("/admin/subjects", data).then((r) => r.data),

  updateSubject: (id: number, data: SubjectRequest) =>
    apiClient.put<ApiResponse<SubjectDto>>(`/admin/subjects/${id}`, data).then((r) => r.data),

  deleteSubject: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/subjects/${id}`).then((r) => r.data),

  // Topics
  createTopic: (data: TopicRequest) =>
    apiClient.post<ApiResponse<TopicDto>>("/admin/topics", data).then((r) => r.data),

  updateTopic: (id: number, data: TopicRequest) =>
    apiClient.put<ApiResponse<TopicDto>>(`/admin/topics/${id}`, data).then((r) => r.data),

  deleteTopic: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/topics/${id}`).then((r) => r.data),
};
