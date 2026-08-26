package com.rapidstudy.dto.attempt;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Full result returned by GET /api/v1/attempts/{id}/result (Phase 29).
 * After submission — includes per-question breakdown WITH correct answers.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ResultResponse {
    // ── Summary ────────────────────────────────────────────────────────
    private Long          attemptId;
    private Long          mockTestId;
    private String        testTitle;
    private BigDecimal    score;
    private BigDecimal    totalMarks;
    private double        percentage;
    private double        accuracy;
    private int           correctAnswers;
    private int           wrongAnswers;
    private int           unanswered;
    private int           timeTakenSeconds;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;

    // ── Per-question breakdown ─────────────────────────────────────────
    private List<QuestionResultDto> questions;
}
