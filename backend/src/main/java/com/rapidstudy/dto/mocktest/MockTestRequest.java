package com.rapidstudy.dto.mocktest;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor
public class MockTestRequest {

    @NotNull(message = "Exam ID is required")
    private Long examId;

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    private String description;

    @NotNull @Min(1) @Max(360)
    private Integer durationMinutes;

    @NotNull @Min(1)
    private Integer totalQuestions;

    @NotNull @DecimalMin("0.0")
    private BigDecimal totalMarks;

    @NotNull @DecimalMin("0.0")
    private BigDecimal negativeMarks = BigDecimal.ZERO;

    /** MOCK_TEST or PREVIOUS_YEAR */
    private String  paperType = "MOCK_TEST";
    private Integer paperYear;
}
