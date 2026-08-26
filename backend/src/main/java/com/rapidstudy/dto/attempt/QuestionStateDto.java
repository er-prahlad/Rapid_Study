package com.rapidstudy.dto.attempt;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Tracks per-question state for the question palette (Phase 25).
 *
 * States:
 *   NOT_VISITED          — student has not opened this question
 *   VISITED              — opened but no answer selected
 *   ANSWERED             — answer selected
 *   MARKED_FOR_REVIEW    — flagged, no answer
 *   ANSWERED_AND_MARKED  — answer selected AND flagged for review
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuestionStateDto {
    private Long   questionId;
    private int    questionOrder;
    private String state;             // NOT_VISITED | VISITED | ANSWERED | MARKED_FOR_REVIEW | ANSWERED_AND_MARKED
    private Long   selectedOptionId;  // null if not answered — NEVER reveals correct answer
    private boolean markedForReview;
}
