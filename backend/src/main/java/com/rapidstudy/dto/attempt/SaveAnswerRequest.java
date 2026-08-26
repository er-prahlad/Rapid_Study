package com.rapidstudy.dto.attempt;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PUT /api/v1/attempts/{attemptId}/answers/{questionId}
 *
 * SECURITY: Backend NEVER accepts score, marksObtained, or isCorrect from client.
 * Only selectedOptionId is accepted and fully validated server-side.
 */
@Data @NoArgsConstructor @AllArgsConstructor
public class SaveAnswerRequest {
    @NotNull(message = "selectedOptionId is required")
    private Long selectedOptionId;
}
