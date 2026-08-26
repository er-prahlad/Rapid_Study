package com.rapidstudy.dto.attempt;

import com.rapidstudy.enums.AttemptStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Current attempt status — returned by GET /api/v1/attempts/{id}
 * Used to restore state if student refreshes the page.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AttemptStatusResponse {
    private Long              attemptId;
    private Long              mockTestId;
    private String            testTitle;
    private Integer           durationMinutes;
    private LocalDateTime     startedAt;
    private LocalDateTime     expiresAt;
    private AttemptStatus     status;
    private long              secondsRemaining; // computed by backend
    private List<QuestionStateDto> questionStates;
}
