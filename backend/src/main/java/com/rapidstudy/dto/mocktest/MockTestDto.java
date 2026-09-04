package com.rapidstudy.dto.mocktest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MockTestDto {
    private Long          id;
    private Long          examId;
    private String        examName;
    private String        title;
    private String        description;
    private Integer       durationMinutes;
    private Integer       totalQuestions;
    private BigDecimal    totalMarks;
    private BigDecimal    negativeMarks;
    private Boolean       isPublished;
    private String        paperType;    // MOCK_TEST | PREVIOUS_YEAR
    private Integer       paperYear;   // e.g. 2023, null for mock tests
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
