package com.rapidstudy.dto.attempt;

import com.rapidstudy.dto.question.QuestionSafeDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Returned when a student starts a test.
 *
 * CRITICAL SECURITY RULES:
 * - questions use QuestionSafeDto (NO correct answer info)
 * - expiresAt is set by backend, never trusted from client
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StartAttemptResponse {
    private Long              attemptId;
    private Long              mockTestId;
    private String            testTitle;
    private Integer           durationMinutes;
    private LocalDateTime     startedAt;
    private LocalDateTime     expiresAt;       // server-controlled expiry
    private List<QuestionSafeDto> questions;   // safe — no correct answers
}
