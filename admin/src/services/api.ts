import apiClient from './apiClient';
import type {
  ApiResponse,
  AdminDashboard,
  AdminUser,
  Page,
  ExamDto,
  ExamRequest,
  SubjectDto,
  SubjectRequest,
  TopicDto,
  TopicRequest,
  QuestionDto,
  QuestionRequest,
  ImportResultDto,
  MockTestDto,
  MockTestRequest,
  AddQuestionsRequest,
  AuthResponse,
  LoginRequest,
  UserProfile,
} from '@/types/api';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data),
  me: () =>
  apiClient.get<ApiResponse<UserProfile>>('/auth/me'),
  logout: () =>
    apiClient.post('/auth/logout'),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  get: () =>
    apiClient.get<ApiResponse<AdminDashboard>>('/admin/dashboard'),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  list: (params: { search?: string; role?: string; isActive?: boolean; page?: number; size?: number }) =>
    apiClient.get<ApiResponse<Page<AdminUser>>>('/admin/users', { params }),
  get: (id: number) =>
    apiClient.get<ApiResponse<AdminUser>>(`/admin/users/${id}`),
  setStatus: (id: number, isActive: boolean) =>
    apiClient.put<ApiResponse<AdminUser>>(`/admin/users/${id}/status`, { isActive }),
  setRole: (id: number, role: string) =>
    apiClient.put<ApiResponse<AdminUser>>(`/admin/users/${id}/role`, { role }),
};

// ─── Exams ────────────────────────────────────────────────────────────────────

export const examsApi = {
  list: (params?: { search?: string; page?: number; size?: number }) =>
    apiClient.get<ApiResponse<Page<ExamDto>>>('/admin/exams', { params }),
  create: (data: ExamRequest) =>
    apiClient.post<ApiResponse<ExamDto>>('/admin/exams', data),
  update: (id: number, data: ExamRequest) =>
    apiClient.put<ApiResponse<ExamDto>>(`/admin/exams/${id}`, data),
  delete: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/exams/${id}`),
  activate: (id: number) =>
    apiClient.patch<ApiResponse<void>>(`/admin/exams/${id}/activate`),
  deactivate: (id: number) =>
    apiClient.patch<ApiResponse<void>>(`/admin/exams/${id}/deactivate`),
};

// ─── Subjects ─────────────────────────────────────────────────────────────────

export const subjectsApi = {
  create: (data: SubjectRequest) =>
    apiClient.post<ApiResponse<SubjectDto>>('/admin/subjects', data),
  update: (id: number, data: SubjectRequest) =>
    apiClient.put<ApiResponse<SubjectDto>>(`/admin/subjects/${id}`, data),
  delete: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/subjects/${id}`),
};

// ─── Topics ───────────────────────────────────────────────────────────────────

export const topicsApi = {
  create: (data: TopicRequest) =>
    apiClient.post<ApiResponse<TopicDto>>('/admin/topics', data),
  update: (id: number, data: TopicRequest) =>
    apiClient.put<ApiResponse<TopicDto>>(`/admin/topics/${id}`, data),
  delete: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/topics/${id}`),
};

// ─── Questions ────────────────────────────────────────────────────────────────

export const questionsApi = {
  list: (params?: {
    topicId?: number; subjectId?: number; difficulty?: string;
    isActive?: boolean; search?: string; page?: number; size?: number;
    status?: string;
  }) =>
    apiClient.get<ApiResponse<Page<QuestionDto>>>('/admin/questions', { params }),
  get: (id: number) =>
    apiClient.get<ApiResponse<QuestionDto>>(`/admin/questions/${id}`),
  create: (data: QuestionRequest) =>
    apiClient.post<ApiResponse<QuestionDto>>('/admin/questions', data),
  update: (id: number, data: QuestionRequest) =>
    apiClient.put<ApiResponse<QuestionDto>>(`/admin/questions/${id}`, data),
  delete: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/questions/${id}`),
  activate: (id: number) =>
    apiClient.patch<ApiResponse<void>>(`/admin/questions/${id}/activate`),
  deactivate: (id: number) =>
    apiClient.patch<ApiResponse<void>>(`/admin/questions/${id}/deactivate`),
  importFile: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post<ApiResponse<ImportResultDto>>('/admin/questions/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getDrafts: (params?: { page?: number; size?: number }) =>
    apiClient.get<ApiResponse<Page<QuestionDto>>>('/admin/questions/drafts', { params }),
  approve: (id: number) =>
    apiClient.patch<ApiResponse<void>>(`/admin/questions/${id}/approve`),
  publish: (id: number) =>
    apiClient.patch<ApiResponse<void>>(`/admin/questions/${id}/publish`),
};

// ─── Mock Tests ───────────────────────────────────────────────────────────────

export const testsApi = {
  list: (params?: { examId?: number; search?: string; page?: number; size?: number }) =>
    apiClient.get<ApiResponse<Page<MockTestDto>>>('/admin/tests', { params }),
  create: (data: MockTestRequest) =>
    apiClient.post<ApiResponse<MockTestDto>>('/admin/tests', data),
  update: (id: number, data: MockTestRequest) =>
    apiClient.put<ApiResponse<MockTestDto>>(`/admin/tests/${id}`, data),
  delete: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/tests/${id}`),
  publish: (id: number) =>
    apiClient.post<ApiResponse<MockTestDto>>(`/admin/tests/${id}/publish`),
  unpublish: (id: number) =>
    apiClient.post<ApiResponse<MockTestDto>>(`/admin/tests/${id}/unpublish`),
  addQuestions: (id: number, data: AddQuestionsRequest) =>
    apiClient.post<ApiResponse<MockTestDto>>(`/admin/tests/${id}/questions`, data),
  removeQuestion: (id: number, questionId: number) =>
    apiClient.delete<ApiResponse<MockTestDto>>(`/admin/tests/${id}/questions/${questionId}`),
  getQuestions: (id: number) =>
    apiClient.get<ApiResponse<QuestionDto[]>>(`/admin/tests/${id}/questions`),
};
