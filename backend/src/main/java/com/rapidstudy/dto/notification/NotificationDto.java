package com.rapidstudy.dto.notification;

import com.rapidstudy.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationDto {
    private Long             id;
    private String           title;
    private String           message;
    private NotificationType type;
    private Boolean          isRead;
    private LocalDateTime    createdAt;
}
