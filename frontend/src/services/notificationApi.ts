import apiClient from "./apiClient";
import type { ApiResponse } from "@/types";
import type { PageResponse } from "@/types/exam";

export interface NotificationDto {
  id:        number;
  title:     string;
  message:   string;
  type:      string;
  isRead:    boolean;
  createdAt: string;
}

export const notificationApi = {
  getAll: (params?: { page?: number; size?: number }) =>
    apiClient.get<ApiResponse<PageResponse<NotificationDto>>>("/notifications", { params }).then(r => r.data),
  unreadCount: () =>
    apiClient.get<ApiResponse<number>>("/notifications/unread-count").then(r => r.data),
  markRead: (id: number) =>
    apiClient.put<ApiResponse<void>>(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: () =>
    apiClient.put<ApiResponse<void>>("/notifications/read-all").then(r => r.data),
};
