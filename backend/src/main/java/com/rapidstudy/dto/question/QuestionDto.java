package com.rapidstudy.dto.question;

import com.rapidstudy.enums.Difficulty;
import com.rapidstudy.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Full question DTO — includes correct answers. Only return to ADMIN or after test submission. */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuestionDto {
    private Long          id;
    private Long          topicId;
    private String        topicName;
    private String        subjectName;
    private String        examName;
    private String        questionText;
    private String        questionTextHindi;
    private QuestionType  questionType;
    private Difficulty    difficulty;
    private String        explanation;
    private String        explanationHindi;
    private BigDecimal    marks;
    private BigDecimal    negativeMarks;
    private Boolean       isActive;
    private LocalDateTime createdAt;
    private List<OptionDto> options;
}
