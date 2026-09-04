package com.rapidstudy.dto.attempt;

import com.rapidstudy.dto.question.OptionDto;
import com.rapidstudy.enums.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Per-question result — shown ONLY after submission.
 * Includes correct answer, explanation, and what the student selected.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuestionResultDto {
    private Long             questionId;
    private int              questionOrder;
    private String           questionText;
    private String           questionTextHindi;
    private Difficulty       difficulty;
    private BigDecimal       marks;
    private BigDecimal       negativeMarks;
    private BigDecimal       marksObtained;
    private Long             selectedOptionId;   // what student chose (null = skipped)
    private Long             correctOptionId;    // correct answer (safe to reveal now)
    private boolean          isCorrect;
    private boolean          wasSkipped;
    private String           explanation;
    private String           explanationHindi;
    private List<OptionDto>  options;            // includes isCorrect = true/false
}
