package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.dto.notification.NotificationDto;
import com.rapidstudy.service.NotificationService;
import com.rapidstudy.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notifications")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notifService;

    @GetMapping
    @Operation(summary = "Get paginated notifications")
    public ResponseEntity<ApiResponse<Page<NotificationDto>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = SecurityUtil.currentUserId();
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved",
                notifService.getNotifications(userId, PageRequest.of(page, size))));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse<Long>> unreadCount() {
        return ResponseEntity.ok(ApiResponse.success("Unread count",
                notifService.countUnread(SecurityUtil.currentUserId())));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable Long id) {
        notifService.markRead(id, SecurityUtil.currentUserId());
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        notifService.markAllRead(SecurityUtil.currentUserId());
        return ResponseEntity.ok(ApiResponse.success("All marked as read", null));
    }
}
