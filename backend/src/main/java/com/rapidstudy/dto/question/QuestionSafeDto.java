package com.rapidstudy.dto.question;

import com.rapidstudy.enums.Difficulty;
import com.rapidstudy.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Safe question DTO — NO correct answer info.
 * Used for student practice and active test attempts.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuestionSafeDto {
    private Long         id;
    private Long         topicId;
    private String       topicName;
    private String       questionText;
    private String       questionTextHindi;
    private QuestionType questionType;
    private Difficulty   difficulty;
    private BigDecimal   marks;
    private BigDecimal   negativeMarks;
    /** Options WITHOUT isCorrect field */
    private List<OptionDto> options;
}
