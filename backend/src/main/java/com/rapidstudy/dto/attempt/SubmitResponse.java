package com.rapidstudy.dto.attempt;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Returned immediately after test submission (Phase 28).
 * Contains the server-calculated result summary.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SubmitResponse {
    private Long          attemptId;
    private BigDecimal    score;
    private BigDecimal    totalMarks;
    private double        percentage;
    private double        accuracy;
    private int           correctAnswers;
    private int           wrongAnswers;
    private int           unanswered;
    private int           timeTakenSeconds;
    private LocalDateTime submittedAt;
    private boolean       wasExpired;  // true if server auto-submitted due to timer
}
