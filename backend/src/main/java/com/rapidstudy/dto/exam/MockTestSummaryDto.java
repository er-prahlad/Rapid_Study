package com.rapidstudy.dto.exam;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MockTestSummaryDto {
    private Long       id;
    private Long       examId;
    private String     title;
    private String     description;
    private int        durationMinutes;
    private int        totalQuestions;
    private BigDecimal totalMarks;
    private BigDecimal negativeMarks;
    private boolean    isPublished;
}
