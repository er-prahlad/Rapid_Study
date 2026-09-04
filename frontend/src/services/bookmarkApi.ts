import apiClient from "./apiClient";
import type { ApiResponse } from "@/types";
import type { PageResponse } from "@/types/exam";
import type { QuestionDto } from "./practiceApi";

export const bookmarkApi = {
  getAll: (params?: { page?: number; size?: number }) =>
    apiClient.get<ApiResponse<PageResponse<QuestionDto>>>("/bookmarks", { params }).then(r => r.data),

  add: (questionId: number) =>
    apiClient.post<ApiResponse<void>>(`/bookmarks/${questionId}`).then(r => r.data),

  remove: (questionId: number) =>
    apiClient.delete<ApiResponse<void>>(`/bookmarks/${questionId}`).then(r => r.data),
};
