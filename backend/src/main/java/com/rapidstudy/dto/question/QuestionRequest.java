package com.rapidstudy.dto.question;

import com.rapidstudy.enums.Difficulty;
import com.rapidstudy.enums.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class QuestionRequest {

    @NotNull(message = "Topic ID is required")
    private Long topicId;

    @NotBlank(message = "Question text is required")
    private String questionText;

    private String questionTextHindi;

    private QuestionType questionType = QuestionType.MCQ;

    private Difficulty difficulty = Difficulty.MEDIUM;

    private String explanation;
    private String explanationHindi;

    @NotNull @DecimalMin("0.0") @DecimalMax("100.0")
    private BigDecimal marks = BigDecimal.ONE;

    @NotNull @DecimalMin("0.0") @DecimalMax("100.0")
    private BigDecimal negativeMarks = BigDecimal.ZERO;

    private Boolean isActive = true;

    @NotNull @Size(min = 2, max = 6, message = "Must have 2-6 options")
    @Valid
    private List<OptionRequest> options;
}
