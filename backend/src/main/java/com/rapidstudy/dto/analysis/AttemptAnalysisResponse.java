package com.rapidstudy.dto.analysis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Full analysis response for GET /api/v1/attempts/{id}/analysis (Phase 30)
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AttemptAnalysisResponse {

    // Overall
    private Long       attemptId;
    private String     testTitle;
    private BigDecimal score;
    private BigDecimal totalMarks;
    private double     percentage;
    private double     accuracy;
    private int        correctAnswers;
    private int        wrongAnswers;
    private int        unanswered;

    // Breakdown
    private List<SubjectAnalysisDto>    subjectAnalysis;
    private List<TopicAnalysisDto>      topicAnalysis;
    private List<DifficultyAnalysisDto> difficultyAnalysis;
    private TimeAnalysisDto             timeAnalysis;
}
