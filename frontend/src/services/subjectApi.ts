import apiClient from "./apiClient";
import type { ApiResponse } from "@/types";
import type { SubjectDto, TopicDto, SubjectRequest, TopicRequest } from "@/types/exam";

export const subjectApi = {
  getByExam: (examId: number) =>
    apiClient.get<ApiResponse<SubjectDto[]>>(`/exams/${examId}/subjects`).then(r => r.data),

  create: (data: SubjectRequest) =>
    apiClient.post<ApiResponse<SubjectDto>>("/admin/subjects", data).then(r => r.data),

  update: (id: number, data: SubjectRequest) =>
    apiClient.put<ApiResponse<SubjectDto>>(`/admin/subjects/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/subjects/${id}`).then(r => r.data),
};

export const topicApi = {
  getBySubject: (subjectId: number) =>
    apiClient.get<ApiResponse<TopicDto[]>>(`/subjects/${subjectId}/topics`).then(r => r.data),

  create: (data: TopicRequest) =>
    apiClient.post<ApiResponse<TopicDto>>("/admin/topics", data).then(r => r.data),

  update: (id: number, data: TopicRequest) =>
    apiClient.put<ApiResponse<TopicDto>>(`/admin/topics/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/topics/${id}`).then(r => r.data),
};
