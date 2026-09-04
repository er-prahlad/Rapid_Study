package com.rapidstudy.dto.studyplan;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StudyPlanDto {
    private Long          id;
    private String        title;
    private LocalDate     startDate;
    private LocalDate     endDate;
    private Integer       targetTests;
    private Integer       targetQuestions;
    private Boolean       isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Progress (computed)
    private int           testsCompleted;
    private int           questionsAttempted;
    private int           daysTotal;
    private int           daysElapsed;
    private int           daysRemaining;
    private double        progressPercent;
}
