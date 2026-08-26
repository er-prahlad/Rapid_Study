package com.rapidstudy.dto.attempt;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response after saving an answer.
 * Does NOT reveal whether the answer is correct.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SaveAnswerResponse {
    private Long    questionId;
    private Long    selectedOptionId;
    private boolean markedForReview;
    private String  state;  // ANSWERED | ANSWERED_AND_MARKED
}
