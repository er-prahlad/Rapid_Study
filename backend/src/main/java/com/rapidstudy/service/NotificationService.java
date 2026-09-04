package com.rapidstudy.service;

import com.rapidstudy.dto.notification.NotificationDto;
import com.rapidstudy.entity.Notification;
import com.rapidstudy.enums.NotificationType;
import com.rapidstudy.exception.ResourceNotFoundException;
import com.rapidstudy.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notifRepository;

    @Transactional(readOnly = true)
    public Page<NotificationDto> getNotifications(Long userId, Pageable pageable) {
        return notifRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDto);
    }

    @Transactional
    public void markRead(Long id, Long userId) {
        Notification n = notifRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        n.setIsRead(true);
        notifRepository.save(n);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notifRepository.findByUserIdOrderByCreatedAtDesc(userId,
                org.springframework.data.domain.PageRequest.of(0, 1000))
                .forEach(n -> { n.setIsRead(true); notifRepository.save(n); });
    }

    @Transactional
    public long countUnread(Long userId) {
        return notifRepository.countByUserIdAndIsReadFalse(userId);
    }

    /** Create a system notification (called internally from other services) */
    @Transactional
    public void createNotification(Long userId, String title, String message, NotificationType type) {
        Notification n = new Notification();
        n.setUserId(userId); n.setTitle(title);
        n.setMessage(message); n.setType(type); n.setIsRead(false);
        notifRepository.save(n);
    }

    private NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId()).title(n.getTitle()).message(n.getMessage())
                .type(n.getType()).isRead(n.getIsRead()).createdAt(n.getCreatedAt())
                .build();
    }
}
